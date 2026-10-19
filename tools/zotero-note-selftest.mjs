// The digest tool's offline suite: identity is /digest, the digest is a projection, and a refresh is
// in place. Runnable with no library and no authorization.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { composeNote, findDigestNote } from './zotero-note.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  if (condition) {
    console.log(`  PASS  ${label}`)
    return
  }
  failures += 1
  console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
}
const same = (actual, expected, label) => check(actual === expected, label, actual === expected ? '' : `got ${JSON.stringify(actual)}`)

const note = (key, body, tags = []) => ({ key, data: { itemType: 'note', note: body, tags: tags.map((tag) => ({ tag })), version: 2 } })

console.log('\n[1] which note is the digest')
const digest = note('DIG1', '<p>A digest.</p>', ['/digest'])
check(findDigestNote([digest])?.key === 'DIG1', 'a /digest note is found')
check(findDigestNote([note('SUM', '<p>a summary</p>', [])]) === undefined, 'a note without /digest is not ours')
check(findDigestNote([note('RET', '<p>old</p>', ['/digest', '/retired'])]) === undefined, 'a retired digest is a tombstone, not a target')
check(findDigestNote([note('RET', '<p>old</p>', ['/Digest', '/Retired'])]) === undefined, 'and case does not rescue it')
check(findDigestNote([{ key: 'A', data: { itemType: 'attachment', note: '<p>x</p>', tags: [{ tag: '/digest' }] } }]) === undefined, 'only a NOTE counts')

console.log('\n[2] create, refresh, or nothing')
const created = composeNote(undefined, '<p>First digest.</p>')
same(created.mode, 'create', 'no digest note means create')
check(!created.html.includes('<!--'), 'no invisible marker is written')
same(composeNote(digest, '<p>A digest.</p>').mode, 'no-op', 'the same visible text is a no-op')
same(composeNote(digest, '<p>  A digest.  </p>').mode, 'no-op', 'whitespace differences are still the same reading')
const refreshed = composeNote(digest, '<p>A different digest.</p>')
same(refreshed.mode, 'refresh', 'a changed synthesis refreshes')
same(refreshed.html, '<p>A different digest.</p>', 'and it REPLACES the body instead of appending to it')
check(!refreshed.html.includes('A digest.</p><p>A different'), 'the old body is not kept in the live note; it becomes a retired snapshot')

console.log('\n[3] the tool still says what it is doing')
const source = readFileSync(fileURLToPath(new URL('./zotero-note.mjs', import.meta.url)), 'utf8')
check(!source.includes('DIGEST_MARKER'), 'no invisible marker constant remains')
check(source.includes('DIGEST_TAG'), 'identity is the /digest tag')
check(source.includes('ALREADY RECORDED'), 'a no-op says so')
check(!source.includes("mode: 'append'"), 'no append mode remains')
check(source.includes('findRetiredSnapshot'), 'the old body is kept as a retired snapshot')
check(!source.includes('.section-notes'), 'no workspace backup path remains')
check(!/gate\.write\(\s*['"]DELETE['"]/.test(source), 'the digest tool never sends a DELETE')

console.log('\n[4] the command line against a stub library')
const tool = fileURLToPath(new URL('./zotero-note.mjs', import.meta.url))
const record = { key: 'REC1', itemType: 'journalArticle', title: 'A paper', version: 1 }
const state = { children: [], items: { REC1: record } }
const useNotes = (...notes) => {
  state.children = notes
  for (const entry of notes) state.items[entry.key] = entry.data
}
const requests = []
const grantPath = join(mkdtempSync(join(tmpdir(), 'digest-grant-')), 'grant.json')
let createdCount = 0
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  req.on('end', () => {
    requests.push(`${req.method} ${url.pathname}`)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : undefined
    const send = (status, payload, headers = {}) => {
      res.writeHead(status, { 'content-type': 'application/json', ...headers })
      res.end(JSON.stringify(payload))
    }
    if (url.pathname === '/api/') {
      send(200, {}, { 'zotero-server-id': 'stub-server', 'x-zotero-version': 'stub' })
      return
    }
    if (url.pathname === '/api/local/authorize' && req.method === 'POST') {
      send(200, { key: 'stub-key', remember: true })
      return
    }
    if (url.pathname === '/api/users/0/items/REC1/children') {
      send(200, state.children)
      return
    }
    if (url.pathname === '/api/users/0/items' && req.method === 'POST') {
      const row = body[0]
      createdCount += 1
      const key = `SNAP${createdCount}`
      state.items[key] = { key, itemType: 'note', note: row.note, tags: row.tags, version: 1, parentItem: row.parentItem }
      state.children.push({ key, data: state.items[key] })
      send(200, { successful: { 0: key } })
      return
    }
    const match = /^\/api\/users\/0\/items\/([A-Z0-9]+)$/.exec(url.pathname)
    if (match && state.items[match[1]]) {
      const item = state.items[match[1]]
      if (req.method === 'PATCH') {
        const precondition = req.headers['if-unmodified-since-version']
        if (precondition !== undefined && Number(precondition) !== item.version) {
          send(412, {})
          return
        }
        item.note = body.note
        item.version += 1
        res.writeHead(204)
        res.end()
        return
      }
      send(200, { data: item })
      return
    }
    send(404, { error: 'not found' })
  })
})
await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `127.0.0.1:${server.address().port}`
const run = (args) =>
  new Promise((done) => {
    const child = spawn(process.execPath, [tool, ...args], {
      env: { ...process.env, ZOTERO_LOCAL_API: origin, ZOTERO_LOCAL_KEY_STORE: grantPath },
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => (stdout += chunk))
    child.stderr.on('data', (chunk) => (stderr += chunk))
    child.on('close', (status) => done({ status, stdout, stderr }))
  })

useNotes()
const createRun = await run(['--item', 'REC1', '--text', '<p>new digest</p>'])
same(createRun.status, 0, 'creating a digest is a dry run')
check(createRun.stdout.includes('create a new /digest note'), 'the plan says create')
check(createRun.stdout.includes('/digest'), 'and shows the tag it would write')

useNotes(note('DIG1', '<p>old digest</p>', ['/digest']))
const refreshRun = await run(['--item', 'REC1', '--text', '<p>new digest</p>'])
same(refreshRun.status, 0, 'refreshing a digest is a dry run')
check(refreshRun.stdout.includes('refresh note DIG1 in place'), 'the plan says refresh in place')
check(refreshRun.stdout.includes('old body as a /digest + /retired note'), 'and keeps the old body as a retired note in the library')
check(refreshRun.stdout.includes('PATCH /api/users/0/items/DIG1'), 'and the patch it would send')

useNotes(note('DIG1', '<p>same digest</p>', ['/digest']))
const noopRun = await run(['--item', 'REC1', '--text', '<p>same digest</p>', '--write'])
same(noopRun.status, 0, 'the same digest exits 0')
check(noopRun.stdout.includes('ALREADY RECORDED'), 'and says nothing was written')
check(requests.every((line) => line.startsWith('GET ')), 'the no-op sent GET only, even with --write given', requests.join(' | '))

useNotes(note('DIG1', '<p>one</p>', ['/digest']), note('DIG2', '<p>two</p>', ['/digest']))
const manyRun = await run(['--item', 'REC1', '--text', '<p>new</p>'])
same(manyRun.status, 1, 'two live digests are refused')
check(manyRun.stderr.includes('REFUSED'), 'and the refusal is loud')

useNotes(note('DIG1', '<p>old digest</p>', ['/digest']))
const beforeWrite = requests.length
const refreshWrite = await run(['--item', 'REC1', '--text', '<p>new digest</p>', '--write'])
same(refreshWrite.status, 0, 'refreshing with --write applies')
check(refreshWrite.stdout.includes('refreshed in place'), 'and says the same note was patched')
check(refreshWrite.stdout.includes('retired note SNAP1'), 'and names the snapshot that keeps the old body')
const sent = requests.slice(beforeWrite)
const postAt = sent.indexOf('POST /api/users/0/items')
const patchAt = sent.indexOf('PATCH /api/users/0/items/DIG1')
check(postAt !== -1 && patchAt !== -1 && postAt < patchAt, 'the snapshot is written before the live digest is patched')
check(state.items.SNAP1.note === '<p>old digest</p>', 'the snapshot holds the old body')
const snapshotTags = state.items.SNAP1.tags.map((entry) => entry.tag)
check(snapshotTags.includes('/digest') && snapshotTags.includes('/retired'), 'the snapshot is /digest + /retired')
check(state.items.DIG1.note === '<p>new digest</p>', 'the live digest holds the new body')

server.close()

console.log(failures === 0 ? '\nPASS - the digest is one /digest note, refreshed in place, and its old body stays in the library' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
