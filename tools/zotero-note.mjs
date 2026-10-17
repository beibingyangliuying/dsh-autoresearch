#!/usr/bin/env node
// Leave a durable digest on a record in the reference library, as a note that travels with it.
//
// WHY THIS FILE EXISTS
//
// The literature discipline requires a digest to be written onto the library item after reading, so
// the next round does not pay the same reading cost again. Until now the only instrument for that was
// the MCP row's `zotero_manage_note`, which writes whatever it is given with no preview. This tool
// states the change first, appends rather than replaces, and refuses the write if the note moved while
// the plan was being built.
//
// HOW IT DECIDES BETWEEN APPENDING AND CREATING
//
// One note per record carries a marker comment, invisible in the application's rendered view:
//
//     <!-- autoresearch-digest -->
//
// A note with that marker is this tool's; the new text is APPENDED to it, so a record accumulates its
// digests instead of collecting a pile of notes. Without the marker, a new note is created. A note
// without the marker is never touched, which is what keeps someone else's note safe.
//
// The text is HTML, inserted verbatim: the reference manager stores note bodies as HTML, and guessing
// at a Markdown conversion would silently change what is stored.
//
// ONE READING IS RECORDED ONCE
//
// A digest says what was read and what it settles, so the record of a reading is that sentence, not a
// count of attempts. A round that is re-run - a retry, a session resumed after its context was pruned -
// reaches this tool with text the note already carries, and appending it again would leave the note
// asserting the same reading twice while a read-back happily reported success, because it only asks
// whether the text is there. An addition the note already reads with therefore writes NOTHING and
// reports `ALREADY RECORDED` (exit 0): the state asked for already holds, which is the same answer
// every other write tool here gives when the change it was asked for is already in place.
//
// The comparison is on VISIBLE text rather than on bytes, for the reason the read-back uses it too: the
// application rewrites a note it has edited, so a body that reads identically need not match byte for
// byte. And it searches the WHOLE note, not a part this tool appended, because the digests already in a
// library were written before this tool existed and carry no boundary this tool could go by.
//
// What it cannot see is a restatement: a digest that repeats an older one and then adds to it reads as
// a new sentence and is appended, so what is written still has to say what is new.
//
// Usage:
//   node tools/zotero-note.mjs --item <itemKey> --text "<p>Read: the attention section.</p>"   # dry run
//   node tools/zotero-note.mjs --item <itemKey> --file .tmp/digest.html --write
//
// Exit codes: 0 applied, or nothing to do | 1 refused (conflict or a library error) | 2 usage.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_NAME, childrenOf, createWriteGate, patchItem, readItem, visibleText } from './zotero-local-api.mjs'

/** The marker that identifies this tool's digest note on a record. */
export const DIGEST_MARKER = '<!-- autoresearch-digest -->'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

/**
 * The record's own digest note, if it has one.
 *
 * @param {object[]} children Child items as the library returns them.
 * @param {string} [marker] The marker to look for.
 * @returns {object|undefined} The note row carrying the marker.
 */
export function findDigestNote(children, marker = DIGEST_MARKER) {
  return children.find((child) => child?.data?.itemType === 'note' && (child.data.note ?? '').includes(marker))
}

/**
 * The note body a digest produces.
 *
 * A digest the note already reads with produces nothing, so a re-run cannot turn one reading into the
 * same sentence twice. The comparison is on {@link visibleText} - the application rewrites a note it
 * has edited, so a body that reads identically need not match byte for byte - and it searches the
 * whole recorded body rather than a part this tool appended, which is what makes it reach a digest
 * written before this tool existed.
 *
 * @param {{key: string, data: object}|undefined} existing The digest note to append to, if any.
 * @param {string} addition The HTML to add.
 * @param {string} [marker] The marker, written only when the note is created.
 * @returns {{html: string, mode: 'create'|'append'|'duplicate'}} The body to send and what it does.
 *   In `duplicate` mode the body is the note unchanged and nothing is to be written.
 */
export function composeNote(existing, addition, marker = DIGEST_MARKER) {
  if (!existing) return { html: `${marker}\n${addition}`, mode: 'create' }
  const current = existing.data?.note ?? ''
  const wanted = visibleText(addition)
  if (wanted !== '' && visibleText(current).includes(wanted)) return { html: current, mode: 'duplicate' }
  return { html: `${current}${current.endsWith('\n') ? '' : '\n'}${addition}`, mode: 'append' }
}

const USAGE =
  'usage: node tools/zotero-note.mjs --item <recordKey> (--text "<html>" | --file <path>) [--write]'

function parseArgs(argv) {
  const options = { item: '', text: '', file: '', write: false }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--write') {
      options.write = true
      continue
    }
    if (!['--item', '--text', '--file'].includes(flag)) throw new UsageError(`unrecognised argument '${flag}'`)
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
  const existing = findDigestNote(children)
  const composed = composeNote(existing, addition)

  const action =
    composed.mode === 'append'
      ? `append to note ${existing.key}`
      : composed.mode === 'duplicate'
        ? `nothing to do - note ${existing.key} already reads with this text`
        : 'create a new note on this record'

  console.log(`record  : ${options.item}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(`children: ${children.length}${existing ? ` (digest note ${existing.key})` : ' (no digest note yet)'}`)
  console.log(`action  : ${action}`)
  if (existing) console.log(`note    : ${(existing.data.note ?? '').length} characters now`)
  console.log(`addition: ${addition.length} characters`)
  if (composed.mode !== 'duplicate') console.log(`result  : ${composed.html.length} characters`)

  if (composed.mode === 'duplicate') {
    console.log(`\nALREADY RECORDED - note ${existing.key} already carries this text, so nothing was written.`)
    console.log('A digest records one reading once; the same sentence is not a second reading. If this reading')
    console.log('adds something, the digest has to say what is new.')
    return
  }

  console.log(
    composed.mode === 'append'
      ? `write   : PATCH /api/users/0/items/${existing.key}  If-Unmodified-Since-Version: ${existing.data.version}`
      : `write   : POST /api/users/0/items  [{itemType: note, parentItem: ${options.item}, note: ...}]`,
  )

  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write; the reference manager will then')
    console.log('ask you to Allow the write, and is asked once.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()

  if (composed.mode === 'append') {
    const result = await patchItem({ gate, key: existing.key, patch: { note: composed.html }, apply: true })
    if (result.conflict) {
      console.error(`\nCONFLICT: note ${existing.key} changed since this plan was read. Nothing was written.`)
      console.error(`It is now ${(result.before.note ?? '').length} characters at version ${result.before.version}.`)
      process.exitCode = 1
      return
    }
    if (!result.applied) {
      console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
      process.exitCode = 1
      return
    }
    if (!(result.after.note ?? '').includes(addition)) {
      console.error(`\nREAD-BACK MISMATCH: note ${existing.key} does not read back with the addition.`)
      process.exitCode = 1
      return
    }
    console.log(`\nOK - appended to note ${existing.key} (now ${result.after.note.length} characters, version ${result.after.version}).`)
    return
  }

  const res = await gate.write('POST', '/api/users/0/items', [
    { itemType: 'note', parentItem: options.item, note: composed.html },
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
  if (!(back.note ?? '').includes(addition)) {
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
