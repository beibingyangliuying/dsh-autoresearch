// Unit self-test for the digest-note writer, runnable without a library.
//
// Usage: node tools/zotero-note-selftest.mjs
//
// The properties that matter are which note gets written to, and that a digest is recorded once. The
// tool appends to the one note on a record that carries its marker and creates a note when there is
// none, so a note somebody else wrote is never touched - an append must never drop what was already
// there, and text the note already reads with must not be appended a second time.
//
// The last section runs the tool itself as a child process against a stub library, because the branch
// that decides there is nothing to write is the one branch whose value is that nothing is written, and
// only the command line can be asked whether it sent anything. The child is spawned ASYNCHRONOUSLY on
// purpose: this process is the stub's server too, and a synchronous spawn would block the event loop
// that has to answer it - which is a deadlock, not a slow test.
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { DIGEST_MARKER, composeNote, findDigestNote } from './zotero-note.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('digest note self-test')

const CHILDREN = [
  { key: 'V3USIF2E', data: { itemType: 'note', note: `<p>${DIGEST_MARKER}</p><p>Read the attention section.</p>`, version: 12 } },
  { key: 'HUMAN001', data: { itemType: 'note', note: '<p>My own note about this paper.</p>', version: 7 } },
  { key: '2PPY7UFW', data: { itemType: 'attachment', contentType: 'application/pdf' } },
]

console.log('\n[1] which note is ours')

check(findDigestNote(CHILDREN)?.key === 'V3USIF2E', 'the marked note is found')
check(findDigestNote([CHILDREN[1], CHILDREN[2]]) === undefined, "a note without the marker is not ours")
check(findDigestNote([]) === undefined, 'a record with no children has no digest note')
check(
  findDigestNote([{ key: 'X', data: { itemType: 'attachment', note: DIGEST_MARKER } }]) === undefined,
  'only a NOTE counts, even if an attachment somehow carries the text',
)
check(DIGEST_MARKER.startsWith('<!--') && DIGEST_MARKER.endsWith('-->'), 'the marker is an HTML comment, invisible when rendered')

console.log('\n[2] what gets written')

const created = composeNote(undefined, '<p>First digest.</p>')
check(created.mode === 'create', 'with no digest note the mode is create')
check(created.html.includes(DIGEST_MARKER), 'a new note carries the marker, which is what makes the next run append')
check(created.html.includes('<p>First digest.</p>'), 'and the digest text')

const appended = composeNote(CHILDREN[0], '<p>Second digest.</p>')
check(appended.mode === 'append', 'with a digest note the mode is append')
check(appended.html.includes('Read the attention section.'), 'the existing body is kept, never replaced')
check(appended.html.includes('<p>Second digest.</p>'), 'the addition is there')
check(
  appended.html.indexOf('Read the attention section.') < appended.html.indexOf('Second digest.'),
  'and it comes after what was already written',
)
check(
  (appended.html.match(/autoresearch-digest/g) ?? []).length === 1,
  'appending does not add a second marker',
)
check(!appended.html.includes('\n\n'), 'one newline separates the parts, not two')

const trailing = composeNote({ key: 'N', data: { note: '<p>Existing.</p>\n' } }, '<p>More.</p>')
check(!trailing.html.includes('\n\n'), 'a body already ending in a newline does not gain another')

console.log('\n[3] a digest the record already reads with is not written twice')

const repeated = composeNote(CHILDREN[0], '<p>Read the attention section.</p>')
check(repeated.mode === 'duplicate', 'the same digest text produces nothing')
check(repeated.html === CHILDREN[0].data.note, 'and the note body is left exactly as it was')

check(
  composeNote(
    { key: 'N', data: { note: '<p>Read the attention section.</p>' } },
    '<p>Read  the\nattention   section.</p>',
  ).mode === 'duplicate',
  'whitespace does not hide a repeated digest - the comparison is on visible text',
)

check(
  composeNote(
    { key: 'N', data: { note: '<div data-schema-version="9"><p>Read the attention section.</p></div>' } },
    '<p>Read the attention section.</p>',
  ).mode === 'duplicate',
  'a note the application has rewritten still matches, wrapper and all',
)

const twoDigests = { key: 'N', data: { note: '<p>Read 3: A is named.</p>\n<p>Read 4: B is checked.</p>' } }
check(composeNote(twoDigests, '<p>Read 3: A is named.</p>').mode === 'duplicate', 'the older of two digests is still recognized')
check(composeNote(twoDigests, '<p>Read 5: C follows.</p>').mode === 'append', 'and a later reading is still added')

check(
  composeNote(twoDigests, '<p>Read 3: A is named. B follows from it.</p>').mode === 'append',
  'a digest that restates an older one and adds to it IS appended - the check reads containment, not paraphrase',
)
check(
  composeNote(CHILDREN[0], '   ').mode === 'append',
  'a blank addition is never read as "already recorded" - negative control',
)
check(
  composeNote(findDigestNote([CHILDREN[1]]), '<p>Read 5: new.</p>').mode === 'create',
  'when no note of ours exists there is nothing to repeat, so a new note is created',
)

console.log('\n[4] the branch reaches the command line before any write')

const source = readFileSync(new URL('./zotero-note.mjs', import.meta.url), 'utf8')
check(source.includes('ALREADY RECORDED'), 'the tool names the state it found instead of only "nothing to do"')
check(
  source.indexOf("composed.mode === 'duplicate'") < source.indexOf('createWriteGate('),
  'and it decides before the write gate is opened, so a repeat can never reach the library',
)
check(!/require\(/.test(source), 'the tool is ESM, like the rest of the suite')

console.log('\n[5] the command line, against a stub library rather than the owner\'s')

// A read has no seam the write gate's `transport` gives it, so `ZOTERO_LOCAL_API` is the one a stub
// library is reached through (tools/zotero-local-api-selftest.mjs pins it). What this section proves
// that [3] cannot: the whole command line - what it prints, what it exits with, and above all that no
// write request is sent - on the branch that decides before the gate opens. Hence `--write` below: the
// run that must write nothing is the one that was asked to write.
const RECORD_WITH_DIGEST = 'AAAAAAAA'
const RECORD_WITH_A_FOREIGN_NOTE = 'CCCCCCCC'
const DIGEST_NOTE_KEY = 'BBBBBBBB'
const DIGEST_NOTE = `<p>${DIGEST_MARKER}</p>\n<p>Read 3: A is named.</p>`
const requests = []

const stub = createServer((req, res) => {
  requests.push(`${req.method} ${req.url}`)
  const answer = (status, payload) => {
    res.writeHead(status, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(payload))
  }
  if (req.method === 'GET' && req.url === `/api/users/0/items/${RECORD_WITH_DIGEST}`) {
    return answer(200, {
      key: RECORD_WITH_DIGEST,
      version: 5,
      data: { itemType: 'journalArticle', title: 'A stubbed record', version: 5 },
    })
  }
  if (req.method === 'GET' && req.url === `/api/users/0/items/${RECORD_WITH_DIGEST}/children?format=json`) {
    return answer(200, [
      { key: DIGEST_NOTE_KEY, version: 9, data: { itemType: 'note', parentItem: RECORD_WITH_DIGEST, note: DIGEST_NOTE, version: 9 } },
      { key: 'HUMAN001', version: 4, data: { itemType: 'note', parentItem: RECORD_WITH_DIGEST, note: '<p>The owner\'s own note.</p>', version: 4 } },
    ])
  }
  if (req.method === 'GET' && req.url === `/api/users/0/items/${RECORD_WITH_A_FOREIGN_NOTE}`) {
    return answer(200, {
      key: RECORD_WITH_A_FOREIGN_NOTE,
      version: 3,
      data: { itemType: 'journalArticle', title: 'A stubbed record with a hand-written note', version: 3 },
    })
  }
  if (req.method === 'GET' && req.url === `/api/users/0/items/${RECORD_WITH_A_FOREIGN_NOTE}/children?format=json`) {
    return answer(200, [
      { key: 'HUMAN002', version: 2, data: { itemType: 'note', parentItem: RECORD_WITH_A_FOREIGN_NOTE, note: '<p>The owner\'s own note.</p>', version: 2 } },
    ])
  }
  // Anything else is a write, or a question this test does not model. Answering 500 keeps the failure
  // legible - and the record of it here is what the assertions below read.
  return answer(500, { error: 'the stub library models reads only' })
})

await new Promise((resolve) => stub.listen(0, '127.0.0.1', resolve))
const origin = `127.0.0.1:${stub.address().port}`

const runTool = (item, text, ...flags) => {
  requests.length = 0
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [fileURLToPath(new URL('./zotero-note.mjs', import.meta.url)), '--item', item, '--text', text, ...flags],
      { env: { ...process.env, ZOTERO_LOCAL_API: origin } },
    )
    let stdout = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk) => {
      stdout += chunk
    })
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    // A child that never answers must fail the test rather than hold the suite open: the tool's own
    // requests carry no timeout, because in production they wait for a human.
    const guard = setTimeout(() => child.kill(), 20000)
    child.on('close', (status, signal) => {
      clearTimeout(guard)
      resolve({ status, signal, stdout, stderr, requests: [...requests] })
    })
  })
}

const repeatedRun = await runTool(RECORD_WITH_DIGEST, '<p>Read 3: A is named.</p>', '--write')
check(repeatedRun.status === 0, 'a repeated digest exits 0 - nothing to do is not a failure', `exit ${repeatedRun.status}`)
check(repeatedRun.stdout.includes('ALREADY RECORDED'), 'and the command line says the note already carries it')
check(
  repeatedRun.requests.length === 2,
  'the write gate was never opened: only the two reads happened',
  repeatedRun.requests.join(' | '),
)
check(
  repeatedRun.requests.every((line) => line.startsWith('GET')),
  'so no write was sent to the library, even though --write was given',
)

const newRun = await runTool(RECORD_WITH_DIGEST, '<p>Read 4: B is checked.</p>')
check(newRun.status === 0, 'a digest that says something new exits 0')
check(newRun.stdout.includes(`append to note ${DIGEST_NOTE_KEY}`), 'and plans an append to the record\'s own digest note')
check(!newRun.stdout.includes('ALREADY RECORDED'), 'and is not reported as already recorded - negative control')

const foreignRun = await runTool(RECORD_WITH_A_FOREIGN_NOTE, '<p>Read 3: a first digest.</p>')
check(
  foreignRun.stdout.includes('create a new note on this record'),
  'a record whose only note is the owner\'s gets a digest note of its own, not an append to theirs',
)

stub.close()

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
