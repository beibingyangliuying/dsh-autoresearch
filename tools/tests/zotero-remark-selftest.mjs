// Self-test for the remark rewriter, runnable without a library.
//
// Usage: node tools/tests/zotero-remark-selftest.mjs
//
// The properties worth pinning are the ones that make "only the middle changes" checkable:
//   * the caller must account for EVERY character of the line - `old-terms + keep-eval` has to equal the
//     body exactly, and the refusal names the first character where the two differ;
//   * the verdict prefix and the kept tail survive verbatim, and no pattern decides which text is an
//     evaluation;
//   * every other line of `extra` is carried over as the string it was, including its line terminator;
//   * a record with two remark lines is refused, because "which one is the digest" is not the tool's call.
//
// Section [4] spawns the command line against a STUB library, because the exit code is what a caller
// acts on and the three answers (0 applied, 1 refused, 3 maybe-applied) are one wiring mistake apart.
import { spawn } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  TERM_COUNT,
  TERM_LENGTH_MAX,
  checkTermShape,
  firstDifference,
  formatTerms,
  planExtra,
  planRewrite,
  splitLines,
  splitRemarkValue,
  splitTerms,
} from '../zotero-remark.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}
const throws = (label, run, expect) => {
  try {
    run()
    check(false, label, 'nothing was thrown')
  } catch (error) {
    check(expect ? error.message.includes(expect) : true, label, expect ? error.message.slice(0, 80) : '')
  }
}

console.log('remark rewriter self-test')

// --- [1] reading a line into parts ---------------------------------------------------------------

console.log('\n[1] the line, split into the parts the tool owns and the parts it does not')

const full = splitRemarkValue('（一般）甲；乙；丙')
check(full.prefix === '（一般）', 'a full-width verdict is the prefix', full.prefix)
check(full.body === '甲；乙；丙', 'and everything after it is the body', full.body)
check(splitRemarkValue('(一般)甲').prefix === '(一般)', 'a half-width verdict is recognised too')
check(splitRemarkValue('甲；乙').prefix === '', 'no verdict is not an error: the prefix is simply empty')
check(splitRemarkValue('').body === '', 'an empty value has an empty body')

const crlf = splitLines('remark: a\r\nrate: 3\r\n')
check(crlf.eol === '\r\n' && crlf.lines[0] === 'remark: a', 'a CRLF field keeps its terminator', JSON.stringify(crlf.eol))
check(splitLines('a\nb').eol === '\n', 'an LF field keeps its own')
check(JSON.stringify(splitTerms('甲；乙; 丙')) === '["甲","乙","丙"]', 'both semicolons split, both trimmed')
check(splitTerms('甲；；乙').length === 2, 'an empty phrase between two separators is dropped')
check(JSON.stringify(splitTerms('甲；乙；')) === '["甲","乙"]', 'a trailing separator adds no phrase')
check(formatTerms(['甲', '乙']) === '甲；乙', 'the written form has no trailing separator')
check(firstDifference('abcd', 'abXd') === 3, 'the first difference is a one-based position')
check(firstDifference('ab', 'abcd') === 3, 'a prefix of a longer string differs just past it')

// --- [2] the phrase shape ------------------------------------------------------------------------

console.log('\n[2] what a phrase list may look like')

check(checkTermShape('甲；乙').length === 2, 'a two-phrase list passes')
throws('an empty list is a usage error', () => checkTermShape('；；'), 'at least one')
throws(
  'too many phrases is a usage error that says merge',
  () => checkTermShape(Array.from({ length: TERM_COUNT.max + 1 }, (_, i) => `p${i}`).join('；')),
  'merge them',
)
throws('a phrase with a line break is refused', () => checkTermShape('甲\n乙'), 'line break')
throws('a phrase over the length bound is refused', () => checkTermShape('甲'.repeat(TERM_LENGTH_MAX + 1)), 'at most')

// --- [3] planning the rewrite --------------------------------------------------------------------

console.log('\n[3] only the named middle changes, or nothing is planned')

const plain = planRewrite({ value: '（一般）旧甲；旧乙', terms: ['新甲', '新乙'], oldTerms: '旧甲；旧乙' })
check(plain.next === '（一般）新甲；新乙', 'the phrases replace the old body, the verdict stays', plain.next)

const kept = planRewrite({
  value: '（一般）旧甲；框架还可以',
  terms: ['新甲', '新乙'],
  oldTerms: '旧甲；',
  keepEval: '框架还可以',
})
check(kept.next === '（一般）新甲；新乙；框架还可以', 'the owner sentence is kept, after one separator', kept.next)

const noPrefix = planRewrite({ value: '旧甲', terms: ['新甲'], oldTerms: '旧甲' })
check(noPrefix.next === '新甲', 'a line with no verdict gets none invented')

throws(
  'a tail that is not really there is refused, with the first difference',
  () => planRewrite({ value: '（一般）旧甲；你的话', terms: ['新甲'], oldTerms: '旧甲；', keepEval: '你的话。' }),
  'first differ at character',
)
throws(
  'accounting for less than the whole body is refused',
  () => planRewrite({ value: '（一般）旧甲；你的话', terms: ['新甲'], oldTerms: '旧甲；' }),
  'do not add up',
)
throws(
  'accounting for more is refused too',
  () => planRewrite({ value: '（一般）旧甲', terms: ['新甲'], oldTerms: '旧甲；你的话' }),
  'do not add up',
)

console.log('\n[3b] the extra field is rewritten one line, and only one')

const extraWithRate = 'remark: （一般）旧甲\nrate: 3\nISSN: 1944-9933'
const replaced = planExtra({ extra: extraWithRate, nextValue: '（一般）新甲' })
check(replaced.extra === 'remark: （一般）新甲\nrate: 3\nISSN: 1944-9933', 'the other lines are byte-identical', replaced.extra)
check(replaced.created === false && replaced.index === 0, 'the existing line is the one replaced')

const crlfExtra = 'remark: （一般）旧甲\r\nrate: 3'
check(planExtra({ extra: crlfExtra, nextValue: '（一般）新甲' }).extra === 'remark: （一般）新甲\r\nrate: 3', 'CRLF is preserved line for line')

const between = 'titleTranslation: 某标题\nremark: （一般）旧甲\nrate: 3'
check(
  planExtra({ extra: between, nextValue: '（一般）新甲' }).extra === 'titleTranslation: 某标题\nremark: （一般）新甲\nrate: 3',
  'a remark line that is not first is replaced where it stands',
)

const created = planExtra({ extra: 'rate: 3', nextValue: '甲；乙', create: true })
check(created.created && created.extra === 'remark: 甲；乙\nrate: 3', 'a new line goes first, as the owner keeps it', created.extra)
check(planExtra({ extra: '', nextValue: '甲', create: true }).extra === 'remark: 甲', 'an empty field becomes one line')
throws('no line and no --create is refused', () => planExtra({ extra: 'rate: 3', nextValue: '甲' }), '--create')
throws(
  'two remark lines are refused',
  () => planExtra({ extra: 'remark: 甲\nremark: 乙', nextValue: '丙' }),
  'which one is the digest',
)
check(planExtra({ extra: 'Remark: 旧甲', nextValue: '新甲' }).extra === 'Remark: 新甲', 'the label keeps its own capitalisation')

// --- [4] the command line against a stub library, not the owner's --------------------------------

console.log('\n[4] the command line against a stub library')

const scratch = mkdtempSync(join(tmpdir(), 'remark-cli-'))
const grantPath = join(scratch, 'grant.json')
const tool = fileURLToPath(new URL('../zotero-remark.mjs', import.meta.url))

const baseRecord = () => ({
  key: 'RMK00001',
  itemType: 'journalArticle',
  title: 'A paper',
  extra: 'remark: （一般）旧甲；旧乙\nrate: 3',
  tags: [{ tag: '/done' }],
  version: 12,
  collections: [],
})

const stub = {
  record: baseRecord(),
  requests: [],
  authorize: () => ({ status: 200, body: { key: 'stub-key', remember: false } }),
  patchItem: null,
}

const resetLibrary = () => {
  stub.record = baseRecord()
  stub.requests.length = 0
  stub.authorize = () => ({ status: 200, body: { key: 'stub-key', remember: false } })
  stub.patchItem = null
}

/** The library's own rule in miniature: honour the version precondition, then carry the change out. */
const patchRow = (record, patch, expectedVersion) => {
  if (String(expectedVersion) !== String(record.version)) return { status: 412 }
  Object.assign(record, patch)
  record.version += 1
  return { status: 204 }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  const path = url.pathname
  stub.requests.push(`${req.method} ${path}`)
  const send = (status, body) => {
    res.writeHead(status, { 'content-type': 'application/json' })
    res.end(body === undefined ? '' : JSON.stringify(body))
  }
  const noContent = () => {
    res.writeHead(204)
    res.end()
  }
  const readBody = (done) => {
    let raw = ''
    req.on('data', (chunk) => (raw += chunk))
    req.on('end', () => done(raw))
  }

  if (path === '/api/') {
    res.writeHead(200, {
      'content-type': 'application/json',
      'zotero-server-id': 'stub-server',
      'x-zotero-version': 'stub',
    })
    res.end('{}')
    return
  }
  if (path === '/api/local/authorize' && req.method === 'POST') {
    const answer = stub.authorize()
    if (answer.status !== 200) send(answer.status, { error: 'the stub declined the dialog' })
    else send(200, answer.body)
    return
  }
  const itemPath = /^\/api\/users\/0\/items\/([A-Z0-9]+)$/.exec(path)
  if (itemPath) {
    if (itemPath[1] !== stub.record.key) {
      send(404, { error: 'not found' })
      return
    }
    if (req.method === 'PATCH') {
      readBody((raw) => {
        const patch = JSON.parse(raw)
        const expected = req.headers['if-unmodified-since-version']
        const answer = stub.patchItem
          ? stub.patchItem(stub.record, patch, expected)
          : patchRow(stub.record, patch, expected)
        if (answer.status === 204) noContent()
        else send(answer.status, { error: 'the stub refused the write' })
      })
      return
    }
    send(200, { data: { ...stub.record } })
    return
  }
  send(404, { error: 'not found' })
})

await new Promise((done) => server.listen(0, '127.0.0.1', done))
const origin = `127.0.0.1:${server.address().port}`
const runAsync = (args) =>
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
const writes = () => stub.requests.filter((line) => line.startsWith('PATCH '))
const first = (text) => text.split(/\r?\n/).find((line) => line.trim() !== '') ?? ''

resetLibrary()
const readOnly = await runAsync(['--item', 'RMK00001'])
check(readOnly.status === 0, 'a read exits 0', `status ${readOnly.status}`)
check(readOnly.stdout.includes('prefix     : （一般）'), 'and shows the verdict it will not touch')
check(readOnly.stdout.includes('body       : 旧甲；旧乙'), 'and the body it is asked to account for')
check(readOnly.stdout.includes('rate       : 3'), 'and the rate it never writes')
check(writes().length === 0, 'and sends no write', `${writes().length} write(s)`)

resetLibrary()
const planned = await runAsync(['--item', 'RMK00001', '--terms', '新甲；新乙', '--old-terms', '旧甲；旧乙'])
check(planned.status === 0, 'a dry run exits 0', `status ${planned.status}`)
check(planned.stdout.includes('DRY RUN'), 'and says nothing was written')
check(writes().length === 0, 'and no PATCH was sent', `${writes().length} write(s)`)

resetLibrary()
const written = await runAsync(['--item', 'RMK00001', '--terms', '新甲；新乙', '--old-terms', '旧甲；旧乙', '--write'])
check(written.status === 0, 'a write the library accepts exits 0', `status ${written.status}`)
check(stub.record.extra === 'remark: （一般）新甲；新乙\nrate: 3', 'the line is rewritten and the rate line untouched', JSON.stringify(stub.record.extra))
check(stub.record.version === 13, 'and the record moved one version', `version ${stub.record.version}`)

resetLibrary()
const keptTail = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；', '--keep-eval', '旧乙', '--write'])
check(keptTail.status === 0, 'a write that keeps a tail exits 0', `status ${keptTail.status}`)
check(stub.record.extra === 'remark: （一般）新甲；旧乙\nrate: 3', 'the declared tail survives verbatim', JSON.stringify(stub.record.extra))

resetLibrary()
const mismatched = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；', '--keep-eval', '别的话', '--write'])
check(mismatched.status === 1, 'a tail that is not there is exit 1: nothing written', `status ${mismatched.status}`)
check(mismatched.stderr.includes('do not add up'), 'and the refusal names the accounting', first(mismatched.stderr))
check(writes().length === 0, 'and no PATCH reached the library', `${writes().length} write(s)`)

resetLibrary()
stub.record.extra = 'rate: 3'
const noLine = await runAsync(['--item', 'RMK00001', '--terms', '甲', '--write'])
check(noLine.status === 1, 'a record with no remark line is exit 1 without --create', `status ${noLine.status}`)
check(noLine.stderr.includes('--create'), 'and the refusal names the way forward')
check(writes().length === 0, 'and nothing was sent', `${writes().length} write(s)`)

resetLibrary()
stub.record.extra = 'rate: 3'
const createdLine = await runAsync(['--item', 'RMK00001', '--terms', '甲；乙', '--create', '--write'])
check(createdLine.status === 0, 'an added line exits 0', `status ${createdLine.status}`)
check(stub.record.extra === 'remark: 甲；乙\nrate: 3', 'and it is placed first, above the existing lines', JSON.stringify(stub.record.extra))

// 5xx that landed: the re-read shows the line, so the answer cannot be "nothing was written".
resetLibrary()
stub.patchItem = (record, patch) => {
  Object.assign(record, patch)
  record.version += 1
  return { status: 500 }
}
const landed = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(landed.status === 3, 'a 500 that landed is exit 3, not 1', `status ${landed.status}`)
check(landed.stderr.includes('the write landed'), 'and the re-read is what settles it')
check(landed.stderr.includes('WRITTEN BUT UNCONFIRMED'), 'in the wording the skills tell an agent to look for')

resetLibrary()
stub.patchItem = () => ({ status: 500 })
const lost = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(lost.status === 3, 'a 500 that did not land is still exit 3', `status ${lost.status}`)
check(lost.stderr.includes('does not show the line as sent'), 'and it says the re-read does not show it')

resetLibrary()
stub.patchItem = (record) => {
  record.version += 1
  return { status: 412 }
}
const raced = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(raced.status === 1, 'a write that lost a race is exit 1', `status ${raced.status}`)
check(raced.stderr.includes('CONFLICT'), 'and it is called a conflict', first(raced.stderr))
check(raced.stderr.includes('Nothing was written'), 'and it says nothing was written')

resetLibrary()
stub.patchItem = (record) => {
  record.version += 1
  return { status: 204 }
}
const unchanged = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(unchanged.status === 3, 'an accepted write that did not take is exit 3', `status ${unchanged.status}`)
check(unchanged.stderr.includes('does not read back as sent'), 'and it says the record differs from what was sent')

resetLibrary()
stub.patchItem = () => ({ status: 400 })
const refused = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(refused.status === 1, 'a 4xx refusal is exit 1: nothing was written', `status ${refused.status}`)
check(refused.stderr.includes('refused the write'), 'and it says so in the library\'s own terms', first(refused.stderr))

resetLibrary()
stub.authorize = () => ({ status: 403 })
const declined = await runAsync(['--item', 'RMK00001', '--terms', '新甲', '--old-terms', '旧甲；旧乙', '--write'])
check(declined.status === 1, 'a declined dialog is exit 1, not 3', `status ${declined.status}`)
check(writes().length === 0, 'and no PATCH reached the library', `${writes().length} write(s)`)

resetLibrary()
const tooMany = await runAsync(['--item', 'RMK00001', '--terms', 'a；b；c；d；e；f；g'])
check(tooMany.status === 2, 'too many phrases is a usage error: exit 2', `status ${tooMany.status}`)
check(tooMany.stderr.includes('merge them'), 'and the message says what to do instead', first(tooMany.stderr))

resetLibrary()
const writeWithoutTerms = await runAsync(['--item', 'RMK00001', '--write'])
check(writeWithoutTerms.status === 2, '--write without --terms is exit 2, never a no-op write', `status ${writeWithoutTerms.status}`)

server.close()

console.log(
  failures === 0
    ? '\nPASS - the accounting guard holds, one line changes, and every failure path answers 0/1/3 as the header documents'
    : `\nFAIL (${failures})`,
)
process.exit(failures === 0 ? 0 : 1)
