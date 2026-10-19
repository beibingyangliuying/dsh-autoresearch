// The section-note tool's offline suite: identity is a tag, nothing is parsed from prose, and the
// mechanical repair is gone. Runnable with no library and no authorization.
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  composeSectionNote,
  coveringNote,
  firstBlockText,
  isApplicationWrapped,
  isDigest,
  isImported,
  isRetired,
  looksLikeHtml,
  normalizeSectionToken,
  planJson,
  readSectionTag,
  replacesKey,
  replacesTag,
  retireTags,
  sectionTag,
  sectionTokenFromTag,
  sectionWriteToken,
  successorOf,
} from './zotero-section-note.mjs'

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
const refused = (run, label) => {
  try {
    run()
  } catch (error) {
    return error.message
  }
  check(false, label, 'it did not throw')
  return ''
}

console.log('\n[1] the ordinal a write may use')
same(normalizeSectionToken('2'), '2', 'digits pass through')
same(normalizeSectionToken('二'), '2', 'a Chinese numeral becomes digits')
same(normalizeSectionToken('十二'), '12', 'twelve is twelve')
same(normalizeSectionToken('第三节'), '3', 'a wrapped phrase is unwrapped')
same(normalizeSectionToken('文章第7节'), '7', 'the article prefix is unwrapped too')
same(normalizeSectionToken('Methodology'), '', 'no ordinal means no token - negative control')
same(normalizeSectionToken('3.1'), '3.1', 'a dotted number is kept only to be refused by the write path')
same(sectionWriteToken('3'), '3', 'writing a top-level ordinal is what happens')
same(sectionWriteToken('三'), '3', 'a Chinese numeral is written as digits')
same(sectionWriteToken('第7节'), '7', 'and a wrapped phrase is unwrapped')
const dotted = refused(() => sectionWriteToken('3.1'), 'WRITING a dotted ordinal is refused')
check(/pass --section 3\./.test(dotted), 'and the refusal says which ordinal to pass instead', dotted)

console.log('\n[2] identity is a /section-N tag')
same(sectionTag('2'), '/section-2', 'a claim is a tag')
same(sectionTokenFromTag('/section-2'), '2', 'and the ordinal reads back')
same(sectionTokenFromTag('/Section-2'), '2', 'case does not matter')
same(sectionTokenFromTag('/section-note'), '', "the earlier round's /section-note tag is not a claim")
same(sectionTokenFromTag('/section-3.1'), '', 'a dotted tag is not a top-level claim')
same(readSectionTag(['/section-2']).token, '2', 'one tag is one claim')
same(readSectionTag(['/Section-2']).token, '2', 'case is ignored when reading')
same(readSectionTag(['/section-2', '/section-3']).ambiguous, true, 'two section tags are ambiguous, not a guess')
same(readSectionTag(['/section-2', '/section-2']).ambiguous, false, 'the same tag twice is still one claim')
check(readSectionTag(['/section-3.1']).invalid.includes('/section-3.1'), 'a dotted tag is reported as invalid')
same(readSectionTag([]).token, '', 'no tag is no claim - negative control')

console.log('\n[3] retire, imported and a legacy summary are different marks')
check(!isRetired([]), 'no tags means live - negative control')
check(isRetired(['/retired']), 'the retire tag retires')
check(isRetired(['/Retired']), 'and a hand-typed capitalisation counts too')
check(!isRetired(['/section-note']), "the earlier round's tag does not retire")
same(retireTags(['/section-2']).join(' '), '/section-2 /retired', 'retiring keeps every tag the note already had')
same(retireTags(['/retired', '/section-2']).join(' '), '/section-2 /retired', 'and it is idempotent')
same(retireTags(['/retired', '/x'], { undo: true }).join(' '), '/x', 'undo removes the mark and nothing else')
check(isImported(['/imported']), 'an imported note carries /imported')
check(!isImported(['/section-2']), 'a native record does not')
check(isDigest(['/digest']), 'a legacy summary carries /digest')
check(!isDigest(['/section-2']), 'a section note does not')

console.log('\n[4] claiming a section, and what covers it')
const live = (token, extra = {}) => ({ key: `N${token}`, retired: false, digest: false, claim: { token }, ...extra })
const retired = (token, extra = {}) => ({ key: `R${token}`, retired: true, digest: false, claim: { token }, ...extra })
same(coveringNote([], '2'), undefined, 'nothing covers nothing - negative control')
same(coveringNote([live('1')], '2'), undefined, 'a different section is not coverage - negative control')
same(coveringNote([live('3.1')], '3'), undefined, 'a dotted claim is not folded into its parent: no parent/child reading')
same(coveringNote([live('2')], '2').note.key, 'N2', 'the same top-level claim is coverage')
same(coveringNote([retired('2')], '2'), undefined, 'a retired note does not cover its section')
same(coveringNote([{ ...live('2'), digest: true }], '2'), undefined, 'a legacy summary is not a section note')
same(coveringNote([{ ...live('2'), retired: true }], '2'), undefined, 'and a retired claim is writable again')

console.log('\n[5] the successor pointer and the body shape')
same(replacesTag('ABCD1234'), '/replaces-ABCD1234', 'a successor names the note it replaces')
same(replacesKey(['/replaces-ABCD1234']), 'ABCD1234', 'and that name reads back')
same(replacesKey(['/section-2']), '', 'a section tag names no predecessor - negative control')
same(successorOf([{ key: 'NEW', tags: ['/replaces-OLD'] }], 'OLD'), 'NEW', 'the successor of a retired note is found by its tag')
same(successorOf([{ key: 'NEW', tags: ['/section-2'] }], 'OLD'), '', 'and where nothing names one, nothing is reported')
same(composeSectionNote('  <p>解释</p>  '), '<p>解释</p>', 'a composed note is the body, with no marker')
check(looksLikeHtml('<p>解释</p>'), 'a paragraph is HTML')
check(looksLikeHtml('<div data-schema-version="9"><ul><li>x</li></ul></div>'), 'a Zotero note shape is HTML')
check(!looksLikeHtml('## Markdown heading\n\n- a bullet'), 'Markdown is refused - the library stores HTML')
same(firstBlockText('<p>文章第2节标题是 “X”。</p><p>下一段</p>'), '文章第2节标题是 “X”。', 'the first block is what a reader sees first')
check(isApplicationWrapped('<div data-schema-version="9"><p>x</p></div>'), 'the application wrapper is recognised')
check(!isApplicationWrapped('<p>x</p>'), 'a note written through the API alone is not wrapped - negative control')

console.log('\n[6] the machine plan a round joins records on')
const planNote = (key, { section = '', retired: isRet = false, digest = false, imported = false, ambiguous = false, invalid = [], tags = [], html = '<p>x</p>' } = {}) => ({
  key,
  html,
  tags,
  retired: isRet,
  imported,
  digest,
  claim: { token: section, ambiguous, tags, invalid },
})
const plan = planJson({
  record: { key: 'REC1', itemType: 'journalArticle', title: 'A paper' },
  attachment: { key: 'PDF1', data: { contentType: 'application/pdf' } },
  notes: [
    planNote('LIVE2', { section: '2', tags: ['/section-2'] }),
    planNote('LIVE3', { section: '3', imported: true, tags: ['/section-3', '/imported'] }),
    planNote('NEW4', { section: '4', tags: ['/section-4', '/replaces-OLD4'] }),
    planNote('OLD4', { section: '4', retired: true, tags: ['/section-4', '/retired'] }),
    planNote('DIG', { digest: true, tags: ['/digest'] }),
    planNote('SUM', { tags: [] }),
    planNote('AMB', { ambiguous: true, tags: ['/section-2', '/section-3'] }),
    planNote('DOT', { invalid: ['/section-3.1'], tags: ['/section-3.1'] }),
  ],
})
same(plan.record.key, 'REC1', 'the record is named')
same(plan.file.contentType, 'application/pdf', 'and the file a reading would use')
same(plan.counts.notes, 8, 'every child note is counted')
same(plan.counts.live, 3, 'the live claims are counted apart from the tombstones')
same(plan.counts.retired, 1, 'the retired note is a tombstone, not coverage')
same(plan.counts.legacy, 1, 'the legacy summary is counted apart')
same(plan.counts.unknown, 2, 'the unclaimed notes are named')
same(plan.counts.ambiguous, 1, 'and a note with two claims is counted apart')
same(plan.coverage.live.map((entry) => entry.section).sort().join(' '), '2 3 4', 'the live coverage is per top-level section')
same(plan.coverage.retired[0].successor, 'NEW4', 'the tombstone points at its successor')
same(plan.coverage.legacy[0].note, 'DIG', 'the legacy summary is reported apart')
same(plan.coverage.unknown.sort().join(' '), 'DOT SUM', 'unknown notes are listed, never guessed at')
same(plan.coverage.ambiguous.join(' '), 'AMB', 'ambiguous notes are listed, never guessed at')
same(plan.notes.find((note) => note.key === 'LIVE3').imported, true, 'the imported claim is stated')
same(plan.notes.find((note) => note.key === 'DOT').invalidSectionTags.join(' '), '/section-3.1', 'an invalid tag is reported')

console.log('\n[7] the tool still says what it is doing')
const source = readFileSync(fileURLToPath(new URL('./zotero-section-note.mjs', import.meta.url)), 'utf8')
check(source.includes('REFUSED: §'), 'the refusal names the section it refuses')
check(!source.includes('SECTION_MARKER_PREFIX'), 'no invisible marker constant remains')
check(!source.includes('CLAIM_FORMS'), 'no prose claim regex remains')
check(!source.includes('sectionClaim'), 'no prose claim reader remains')
check(!source.includes('normalizeMath'), 'no mechanical math repair remains')
check(!source.includes('options.tidy'), 'no --tidy mode remains')
check(source.includes("gate.write('DELETE'"), 'the DELETE goes through the write gate')
check(source.includes('Only a retired note may be deleted'), 'and the retired check gates it')
check(!source.includes('performs no deletion'), 'the old "performs no deletion" sentence is gone')
check(!source.includes('.section-notes'), 'rewriting no longer writes a workspace backup')
check(source.includes('the body is NOT touched'), 'and the plan says in so many words that the body is left alone')

console.log('\n[8] the command line refuses usage errors before it reads a library')
const tool = fileURLToPath(new URL('./zotero-section-note.mjs', import.meta.url))
const run = (...args) => spawnSync(process.execPath, [tool, ...args], { encoding: 'utf8' })
same(run('--claim').status, 2, '--claim without --note is a usage error')
same(run('--delete').status, 2, '--delete without --note is a usage error')
same(run('--delete', '--note', 'X', '--reason', 'why').status, 2, '--delete does not take --reason')
same(run('--tidy', '--note', 'X').status, 2, '--tidy is gone')

console.log('\n[9] the command line against a stub library, not the owner\'s')
const stubItems = {
  REC1: { key: 'REC1', itemType: 'journalArticle', title: 'A paper', version: 1 },
  LIVE2: { key: 'LIVE2', itemType: 'note', note: '<p>第2节</p>', tags: [{ tag: '/section-2' }], version: 2, parentItem: 'REC1' },
  UNK: { key: 'UNK', itemType: 'note', note: '<p>一段话总结</p>', tags: [], version: 3, parentItem: 'REC1' },
  DIG: { key: 'DIG', itemType: 'note', note: '<p>digest</p>', tags: [{ tag: '/digest' }], version: 4, parentItem: 'REC1' },
  OLD: { key: 'OLD', itemType: 'note', note: '<p>old</p>', tags: [{ tag: '/section-3' }, { tag: '/retired' }], version: 5, parentItem: 'REC1' },
}
const stubChildren = ['LIVE2', 'UNK', 'DIG', 'OLD'].map((key) => ({ key, data: stubItems[key] }))
const requests = []
const deleted = new Set()
const scratch = mkdtempSync(join(tmpdir(), 'section-note-'))
const grantPath = join(scratch, 'grant.json')
const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1')
  requests.push(`${req.method} ${url.pathname}`)
  const send = (status, body) => {
    res.writeHead(status, { 'content-type': 'application/json' })
    res.end(JSON.stringify(body))
  }
  if (url.pathname === '/api/') {
    res.writeHead(200, { 'content-type': 'application/json', 'zotero-server-id': 'stub-server', 'x-zotero-version': 'stub' })
    res.end('{}')
    return
  }
  if (url.pathname === '/api/local/authorize' && req.method === 'POST') {
    send(200, { key: 'stub-key', remember: true })
    return
  }
  if (url.pathname === '/api/users/0/items/REC1/children') {
    send(200, stubChildren)
    return
  }
  const match = /^\/api\/users\/0\/items\/([A-Z0-9]+)$/.exec(url.pathname)
  if (match && stubItems[match[1]]) {
    const key = match[1]
    if (req.method === 'DELETE') {
      if (req.headers['if-unmodified-since-version'] !== String(stubItems[key].version)) {
        send(428, { error: 'precondition required' })
        return
      }
      deleted.add(key)
      res.writeHead(204)
      res.end()
      return
    }
    if (deleted.has(key)) {
      send(404, { error: 'not found' })
      return
    }
    send(200, { data: stubItems[key] })
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

const planRun = await runAsync(['--item', 'REC1', '--json'])
same(planRun.status, 0, 'the plan exits 0')
const machine = JSON.parse(planRun.stdout)
same(machine.counts.live, 1, 'the plan sees the tagged claim')
same(machine.counts.unknown, 1, 'and the untagged note')
same(machine.counts.legacy, 1, 'and the legacy summary')
same(machine.counts.retired, 1, 'and the tombstone')
same(machine.coverage.unknown.join(' '), 'UNK', 'the untagged note is named, not guessed at')

const claimRun = await runAsync(['--claim', '--note', 'UNK', '--section', '5'])
same(claimRun.status, 0, 'claiming an untagged note is a dry run')
check(claimRun.stdout.includes('/section-5'), 'the plan shows the tag it would write')
check(claimRun.stdout.includes('/imported'), 'and the /imported mark that keeps it rewritable')

const bodyFile = join(scratch, 'new.html')
writeFileSync(bodyFile, '<p>new body</p>', 'utf8')
const rewriteRun = await runAsync(['--rewrite', '--note', 'UNK', '--file', bodyFile])
same(rewriteRun.status, 0, 'rewriting an import is a dry run')
check(!rewriteRun.stdout.includes('backup'), 'and it no longer promises a workspace backup')
check(rewriteRun.stdout.includes('old     :'), 'the old first block is what it shows instead')
const nativeRewrite = await runAsync(['--rewrite', '--note', 'LIVE2', '--file', bodyFile])
same(nativeRewrite.status, 2, 'a native record is not rewritten in place')

const deleteRun = await runAsync(['--delete', '--note', 'OLD'])
same(deleteRun.status, 0, 'a retired note has a deletion plan')
check(deleteRun.stdout.includes('DELETE /api/users/0/items/OLD'), 'the plan states the request')
check(deleteRun.stdout.includes('If-Unmodified-Since-Version: 5'), 'and the version precondition the API demands')
check(deleteRun.stdout.includes('permanent'), 'and that the channel cannot undo it')
const liveDelete = await runAsync(['--delete', '--note', 'LIVE2'])
same(liveDelete.status, 1, 'a live note is refused')

check(requests.every((line) => line.startsWith('GET ')), 'every dry run sent GET only: nothing was written', requests.join(' | '))

const deleteWrite = await runAsync(['--delete', '--note', 'OLD', '--write'])
same(deleteWrite.status, 0, 'deleting a retired note with --write erases it')
check(deleteWrite.stdout.includes('is erased'), 'and says it answers 404')
check(requests.includes('DELETE /api/users/0/items/OLD'), 'the DELETE was sent')
check(deleted.has('OLD'), 'the stub library erased the note')
check(deleteWrite.stdout.includes('It answers 404, and the trash does not hold it'), 'and the read-back proved it')
const goneRun = await runAsync(['--delete', '--note', 'OLD'])
same(goneRun.status, 1, 'a deleted note can no longer be planned')

server.close()

console.log(failures === 0 ? '\nPASS - section-note identity is tags, no prose is parsed, and deletion is a gated erasure' : `\nFAIL (${failures})`)
process.exit(failures === 0 ? 0 : 1)
