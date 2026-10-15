#!/usr/bin/env node
// Create, rename, or file items into collections in the reference library: one change, one write.
//
// WHY THIS FILE EXISTS
//
// The reference library reached this preset through an MCP row whose collection tools write directly.
// This tool states the change first and refuses it if the record moved in the meantime; it also
// refuses to create a collection that already exists among its siblings, because a silently created
// duplicate is invisible in the library's own tree.
//
// TWO THINGS THIS REPOSITORY HAS NOT MEASURED, AND HOW THE TOOL BEHAVES BECAUSE OF IT
//
//   * Whether `PATCH /collections/<key>` is accepted at all. Creation and deletion were measured
//     against Zotero 10.0.6; renaming was not. So `--rename` is attempted, and if the library refuses
//     it the tool SAYS SO and stops - it does not fall back to "create a new one and move the items",
//     which would quietly change the keys other documents may refer to. Renaming in the application
//     is the fallback.
//   * Whether a patch's `collections` list REPLACES or MERGES with the record's own. This tool reads
//     the current list, computes the full next list and sends that, so the answer does not matter.
//   * That a COLLECTION HAS NO USABLE VERSION. Measured: nearly every collection in this library
//     reports version 0, so a rename cannot be guarded against a concurrent change the way an item's
//     edit is. `--rename` therefore says so instead of implying a guard it does not have; the patch
//     carries only a name, so no other field can be lost. Items DO carry real versions (567 where a
//     collection said 0), which is why `--assign` is guarded normally.
//
// Usage:
//   node tools/zotero-collection.mjs --list
//   node tools/zotero-collection.mjs --create "Reading list" --parent <collectionKey>   # dry run
//   node tools/zotero-collection.mjs --create "Reading list" --write
//   node tools/zotero-collection.mjs --rename <collectionKey> --name "Archive" --write  # unverified
//   node tools/zotero-collection.mjs --assign <itemKey> --collection <collectionKey> --write
//   node tools/zotero-collection.mjs --assign <itemKey> --collection <collectionKey> --remove --write
//
// Exit codes: 0 applied, or nothing to do | 1 refused (conflict, duplicate, or a library error) | 2 usage.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createWriteGate,
  getJson,
  normalizeCollections,
  patchCollection,
  patchItem,
  readCollection,
  readItem,
} from './zotero-local-api.mjs'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

/**
 * A collection with this name already among these siblings.
 *
 * Siblings means the same parent, including both being at the root: the library allows two collections
 * with the same name under different parents, and forbidding that would forbid a real convention.
 *
 * @param {object[]} collections Collection rows as `/collections` returns them.
 * @param {{name: string, parentKey?: string}} wanted The proposed collection.
 * @returns {object|undefined} The existing sibling, if any.
 */
export function siblingWithName(collections, { name, parentKey }) {
  const wanted = name.trim().toLowerCase()
  const parent = parentKey || undefined
  return collections.find(
    (row) =>
      (row.data?.name ?? '').trim().toLowerCase() === wanted &&
      normalizeCollections(row.data?.parentCollection)[0] === parent,
  )
}

/**
 * The collection list an assignment produces.
 *
 * @param {string[]} current The record's collections, normalised.
 * @param {string} collectionKey The collection to file into or remove from.
 * @param {{remove?: boolean}} [options] Remove instead of add.
 * @returns {{next: string[], changed: boolean}} The full next list, and whether it differs.
 */
export function nextCollections(current, collectionKey, { remove = false } = {}) {
  const next = remove ? current.filter((key) => key !== collectionKey) : [...new Set([...current, collectionKey])]
  return { next, changed: JSON.stringify(next) !== JSON.stringify(current) }
}

const USAGE =
  'usage: node tools/zotero-collection.mjs --list\n' +
  '       node tools/zotero-collection.mjs --create "<name>" [--parent <key>] [--write]\n' +
  '       node tools/zotero-collection.mjs --rename <key> --name "<new name>" [--write]\n' +
  '       node tools/zotero-collection.mjs --assign <itemKey> --collection <key> [--remove] [--write]'

function parseArgs(argv) {
  const options = { mode: '', value: '', name: '', parent: '', item: '', remove: false, write: false }
  const take = (flag, next, field) => {
    if (!next) throw new UsageError(`${flag} needs a value`)
    options[field] = next
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    switch (flag) {
      case '--list':
        options.mode = 'list'
        break
      case '--create':
      case '--rename':
      case '--assign':
        if (options.mode) throw new UsageError('pass one of --list/--create/--rename/--assign')
        options.mode = flag.slice(2)
        take(flag, next, flag === '--assign' ? 'item' : 'value')
        index += 1
        break
      case '--name':
        take(flag, next, 'name')
        index += 1
        break
      case '--parent':
        take(flag, next, 'parent')
        index += 1
        break
      case '--collection':
        take(flag, next, 'value')
        index += 1
        break
      case '--remove':
        options.remove = true
        break
      case '--write':
        options.write = true
        break
      default:
        throw new UsageError(`unrecognised argument '${flag}'`)
    }
  }
  if (!options.mode) throw new UsageError('pass --list, --create, --rename or --assign')
  if (options.mode === 'rename' && !options.name) throw new UsageError('--rename needs --name "<new name>"')
  if (options.mode === 'assign' && !options.value) throw new UsageError('--assign needs --collection <key>')
  return options
}

async function allCollections() {
  return getJson('/api/users/0/collections?format=json&limit=200')
}

async function runList() {
  const rows = await allCollections()
  const byParent = new Map()
  for (const row of rows) {
    const parent = normalizeCollections(row.data?.parentCollection)[0] ?? ''
    byParent.set(parent, [...(byParent.get(parent) ?? []), row])
  }
  console.log(`collections: ${rows.length} in ${(byParent.get('') ?? []).length} root(s)`)
  const walk = (parentKey, depth) => {
    for (const row of byParent.get(parentKey) ?? []) {
      console.log(`${'  '.repeat(depth)}${row.key}  ${String(row.meta?.numItems ?? 0).padStart(5)}  ${row.data?.name ?? '(unnamed)'}`)
      walk(row.key, depth + 1)
    }
  }
  walk('', 0)
}

async function runCreate(options) {
  const rows = await allCollections()
  const parentKey = options.parent || undefined
  if (parentKey && !rows.some((row) => row.key === parentKey)) {
    throw new Error(`no collection ${parentKey} in this library`)
  }
  const parentName = parentKey ? (rows.find((row) => row.key === parentKey)?.data?.name ?? '(unnamed)') : '(library root)'
  const duplicate = siblingWithName(rows, { name: options.value, parentKey })
  console.log(`parent  : ${parentKey ?? '(root)'}  ${parentName}`)
  console.log(`create  : "${options.value}"`)
  // Measured from a working implementation: the body is a LIST, and a root collection says
  // `parentCollection: false` rather than omitting the key or sending null.
  console.log(`body    : ${JSON.stringify([{ name: options.value, parentCollection: parentKey ?? false }])}`)
  if (duplicate) {
    console.error(`\nREFUSING: "${duplicate.data.name}" (${duplicate.key}) already exists under ${parentName}.`)
    console.error('Two collections of the same name under one parent are indistinguishable in the library tree.')
    process.exitCode = 1
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write; the reference manager will then')
    console.log('ask you to Allow the write, and is asked once.')
    return
  }
  const gate = createWriteGate({ appName: 'DSH autoresearch collection tool' })
  await gate.open()
  const res = await gate.write('POST', '/api/users/0/collections', [
    { name: options.value, parentCollection: parentKey ?? false },
  ])
  if (res.status !== 200) {
    console.error(`\nThe library refused the creation (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const body = JSON.parse(res.text)
  const saved = body.successful?.['0'] ?? body.success?.['0']
  const created = typeof saved === 'string' ? saved : saved?.key
  if (!created) {
    console.error(`\nThe library reported no success: ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const back = await readCollection(created)
  console.log(`\nOK - ${created} "${back.name}" now exists under ${parentName} (version ${back.version}).`)
}

async function runRename(options) {
  const before = await readCollection(options.value)
  console.log(`collection : ${options.value}  "${before.name}"  under ${before.parentCollection || '(root)'}`)
  console.log(`version    : ${before.version}`)
  console.log(`name       : "${before.name}"`)
  console.log(`        -> : "${options.name}"`)
  console.log(`write      : PATCH /api/users/0/collections/${options.value}  If-Unmodified-Since-Version: ${before.version}`)
  console.log('\nNOTE: whether this library accepts a collection rename through its local API has NOT been')
  console.log('measured here (creation and deletion have been). If it refuses, this tool stops rather than')
  console.log('creating a replacement, because a new collection would carry a new key.')
  console.log(`NO STALENESS GUARD HERE: measured 2026-10-15, this library reports version 0 for nearly every`)
  console.log(`collection (this one is ${before.version}), so neither the version precondition nor a re-read can`)
  console.log('tell that it changed meanwhile. What that costs is bounded: this patch sends only a name, so')
  console.log('nothing else on the collection can be overwritten. Two renames at once resolve last-writer-wins.')
  if (before.name === options.name) {
    console.log('\nNo change: the collection already has that name.')
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write to attempt it.')
    return
  }
  const gate = createWriteGate({ appName: 'DSH autoresearch collection tool' })
  await gate.open()
  const result = await patchCollection({ gate, key: options.value, patch: { name: options.name }, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: collection ${options.value} changed since this plan was read. Nothing was written.`)
    console.error(`Its current name is "${result.before.name}" at version ${result.before.version}.`)
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    console.error(`\nThe library refused the rename (HTTP ${result.status}): ${result.detail}`)
    console.error('This is the unmeasured case: the local API may not support renaming a collection.')
    console.error('Rename it in the application instead - this tool will not create a replacement.')
    process.exitCode = 1
    return
  }
  console.log(`\nOK - ${options.value} is now "${result.after.name}" (version ${result.after.version}).`)
}

async function runAssign(options) {
  const item = await readItem(options.item)
  const collection = await readCollection(options.value)
  const current = normalizeCollections(item.collections)
  const { next, changed } = nextCollections(current, options.value, { remove: options.remove })
  console.log(`item       : ${options.item}  [${item.itemType}]  "${item.title ?? ''}"`)
  console.log(`collection : ${options.value}  "${collection.name}"`)
  console.log(`version    : ${item.version}`)
  console.log(`filing     : ${current.join(' · ') || 'none'}`)
  console.log(`        -> : ${next.join(' · ') || 'none'}`)
  console.log(`body       : ${JSON.stringify({ collections: next })}`)
  console.log(`write      : PATCH /api/users/0/items/${options.item}  If-Unmodified-Since-Version: ${item.version}`)
  if (!changed) {
    console.log(`\nNo change: the item is ${options.remove ? 'not ' : 'already '}in ${options.value}.`)
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write; the reference manager will then')
    console.log('ask you to Allow the write, and is asked once.')
    return
  }
  const gate = createWriteGate({ appName: 'DSH autoresearch collection tool' })
  await gate.open()
  const result = await patchItem({ gate, key: options.item, patch: { collections: next }, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: item ${options.item} changed since this plan was read. Nothing was written.`)
    console.error(`Its current filing is ${normalizeCollections(result.before.collections).join(' · ') || 'none'} at version ${result.before.version}.`)
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return
  }
  const after = normalizeCollections(result.after.collections)
  if (JSON.stringify(after) !== JSON.stringify(next)) {
    console.error(`\nREAD-BACK MISMATCH: asked for ${next.join(' · ') || 'none'}, the record reads back as ${after.join(' · ') || 'none'}.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - ${options.item} now files under ${after.join(' · ') || 'none'} (version ${result.after.version}).`)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const runners = { list: runList, create: runCreate, rename: runRename, assign: runAssign }
  await runners[options.mode](options)
}

const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  main().catch((error) => {
    if (error instanceof UsageError) {
      console.error(`${error.message}\n${USAGE}`)
      process.exit(2)
    }
    console.error(`\nERROR: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
