#!/usr/bin/env node
// Leave the record's ONE paper-level digest on a record, as a note that travels with it.
//
// IDENTITY IS /digest, NOT A COMMENT
//
// This tool used to identify its note by an invisible HTML comment. Measured on this library: when the
// application rewrites a note's body it drops the comment, and the next digest run then created a
// SECOND digest note. A tag is item metadata, outside the body, and `/retired` was measured to survive
// a real application rewrite. The digest note therefore carries `/digest`:
//
//   /digest    this note is the record's paper-level digest
//   /retired   out of service: a tombstone is never appended to, and a new digest is created instead
//
// No marker is written or read.
//
// THE DIGEST IS A PROJECTION OF THE SECTION NOTES
//
// The digest says what the paper's method is, derived from the `/section-N` notes the `section-notes`
// discipline wrote. It is not a reading receipt and not a log: the receipt lives in the `refs/` index
// line and the item's `/done` tag, and the digest is one synthesis. This tool writes the body the agent
// gives it; it does not read the paper and does not synthesize.
//
// REFRESH IS IN PLACE
//
// One record has one live `/digest` note. When the synthesis changes, the SAME note is patched, with
// the old body backed up under `.section-notes/` first and a version guard on the write. The key does
// not change, no tombstone accumulates, and the old body is recoverable from the workspace. A retired
// digest is skipped: a new digest is created instead, and the tombstone stays as history. A changed
// digest is a refresh in place, so the same note and the same key carry the current projection.
//
// Usage:
//   node tools/zotero-note.mjs --item <itemKey> --text "<p>Digest: ...</p>"          # dry run
//   node tools/zotero-note.mjs --item <itemKey> --file .tmp/digest.html --write
//
// Exit codes: 0 applied, or nothing to do | 1 refused (conflict, multiple live digests, library error)
// | 2 usage.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_NAME, childrenOf, createWriteGate, patchItem, readItem, visibleText } from './zotero-local-api.mjs'
import { DIGEST_TAG, isDigest, isRetired } from './zotero-section-note.mjs'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

/** A note's tags as bare text. */
function tagList(item) {
  return (item?.data?.tags ?? []).map((entry) => entry.tag)
}

/**
 * The record's live digest note, if it has one.
 *
 * A retired `/digest` is a tombstone and is skipped: appending to it would keep writing to a note that
 * is out of service, and the next digest should be a new note.
 *
 * @param {object[]} children Child items as the library returns them.
 * @returns {object|undefined} The note row carrying `/digest` and not `/retired`.
 */
export function findDigestNote(children) {
  return children.find((child) => child?.data?.itemType === 'note' && isDigest(tagList(child)) && !isRetired(tagList(child)))
}

/**
 * The body a digest write produces, and what it does.
 *
 * The digest is a projection, not a log: a changed synthesis REPLACES the body rather than appending
 * to it. The comparison is on {@link visibleText}, because the application rewrites a note it has
 * edited, so a body that reads identically need not match byte for byte.
 *
 * @param {{key: string, data: object}|undefined} existing The live digest note, if any.
 * @param {string} addition The new digest body, as HTML.
 * @returns {{html: string, mode: 'create'|'refresh'|'no-op'}} The body to send and what it does.
 */
export function composeNote(existing, addition) {
  if (!existing) return { html: addition, mode: 'create' }
  const current = existing.data?.note ?? ''
  if (visibleText(current) === visibleText(addition)) return { html: current, mode: 'no-op' }
  return { html: addition, mode: 'refresh' }
}

const USAGE =
  'usage: node tools/zotero-note.mjs --item <itemKey> (--text "<html>" | --file <path>) [--write]\n' +
  '       The digest is the record\'s ONE paper-level projection, derived from its /section-N notes.\n' +
  '       It carries /digest; a retired digest is skipped and a new one is created. A changed digest\n' +
  '       refreshes the same note in place, after backing up the old body under .section-notes/.'

function parseArgs(argv) {
  const options = { item: '', text: '', file: '', write: false }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (flag === '--write') {
      options.write = true
      continue
    }
    if (!['--item', '--text', '--file'].includes(flag)) throw new UsageError(`unrecognised argument '${flag}'`)
    const next = argv[index + 1]
    if (!next) throw new UsageError(`${flag} needs a value`)
    options[flag.slice(2)] = next
    index += 1
  }
  if (!options.item) throw new UsageError('pass --item <recordKey>')
  if (Boolean(options.text) === Boolean(options.file)) throw new UsageError('pass --text or --file, not both')
  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const addition = options.file ? readFileSync(options.file, 'utf8') : options.text
  if (addition.trim() === '') throw new UsageError('the digest text is empty')

  const record = await readItem(options.item)
  if (record.itemType === 'note') {
    throw new UsageError(`${options.item} is itself a note; pass the record the digest is about`)
  }
  const children = await childrenOf(options.item)
  const live = children.filter((child) => child?.data?.itemType === 'note' && isDigest(tagList(child)) && !isRetired(tagList(child)))
  if (live.length > 1) {
    console.error(`\nREFUSED: ${live.map((note) => note.key).join(' · ')} all carry a live ${DIGEST_TAG}.`)
    console.error('One record has one digest. Retire all but one, then run this again.')
    process.exitCode = 1
    return
  }
  const existing = live[0]
  const composed = composeNote(existing, addition)
  const backup = join(process.cwd(), '.section-notes', options.item, `digest-${new Date().toISOString().replace(/[:.]/g, '-')}.html`)

  const action =
    composed.mode === 'refresh'
      ? `refresh note ${existing.key} in place`
      : composed.mode === 'no-op'
        ? `nothing to do - note ${existing?.key} already reads with this text`
        : 'create a new /digest note on this record'

  console.log(`record  : ${options.item}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(`children: ${children.length}${existing ? ` (live digest note ${existing.key})` : ' (no live digest note)'}`)
  console.log(`action  : ${action}`)
  if (existing) console.log(`note    : ${(existing.data.note ?? '').length} characters now`)
  console.log(`addition: ${addition.length} characters`)
  if (composed.mode === 'refresh') console.log(`backup  : ${backup}`)
  if (composed.mode !== 'no-op') console.log(`result  : ${composed.html.length} characters`)

  if (composed.mode === 'no-op') {
    console.log(`\nALREADY RECORDED - note ${existing.key} already reads with this text, so nothing was written.`)
    console.log('A digest records one synthesis once. If the section notes changed, the digest has to say what')
    console.log('is different; the same sentence is not a new synthesis.')
    return
  }

  console.log(
    composed.mode === 'refresh'
      ? `write   : PATCH /api/users/0/items/${existing.key}  If-Unmodified-Since-Version: ${existing.data.version}`
      : `write   : POST /api/users/0/items  [{itemType: note, parentItem: ${options.item}, note: ..., tags: [{tag: ${DIGEST_TAG}}]}]`,
  )

  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write; the reference manager will then')
    console.log('ask you to Allow the write, and is asked once.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()

  if (composed.mode === 'refresh') {
    try {
      mkdirSync(dirname(backup), { recursive: true })
      writeFileSync(backup, existing.data.note ?? '', 'utf8')
    } catch (error) {
      console.error(`\nREFUSED: could not write the backup ${backup}: ${error instanceof Error ? error.message : String(error)}`)
      process.exitCode = 1
      return
    }
    const result = await patchItem({ gate, key: existing.key, patch: { note: composed.html }, apply: true })
    if (result.conflict) {
      console.error(`\nCONFLICT: note ${existing.key} changed since this plan was read. Nothing was written.`)
      console.error(`The old body is at ${backup}.`)
      process.exitCode = 1
      return
    }
    if (!result.applied) {
      console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
      process.exitCode = 1
      return
    }
    if (visibleText(result.after.note ?? '') !== visibleText(composed.html)) {
      console.error(`\nREAD-BACK MISMATCH: note ${existing.key} does not read back with the digest that was sent.`)
      console.error(`The old body is at ${backup}.`)
      process.exitCode = 1
      return
    }
    console.log(`\nOK - note ${existing.key} refreshed in place (now ${result.after.note.length} characters, version ${result.after.version}).`)
    console.log(`The old body is at ${backup}.`)
    return
  }

  const res = await gate.write('POST', '/api/users/0/items', [
    { itemType: 'note', parentItem: options.item, note: composed.html, tags: [{ tag: DIGEST_TAG }] },
  ])
  if (res.status !== 200) {
    console.error(`\nThe library refused the write (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const body = JSON.parse(res.text)
  const saved = body.successful?.['0'] ?? body.success?.['0']
  const noteKey = typeof saved === 'string' ? saved : saved?.key
  if (!noteKey) {
    console.error(`\nThe library reported no success: ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const back = await readItem(noteKey)
  if (!isDigest(tagList(back))) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back carrying ${DIGEST_TAG}.`)
    process.exitCode = 1
    return
  }
  if (visibleText(back.note ?? '') !== visibleText(composed.html)) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back with the digest text.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${noteKey} now carries the digest on ${options.item} (version ${back.version}).`)
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
