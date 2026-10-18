#!/usr/bin/env node
// Self-test for the generated toolchain page: offline, and about the two ways a page like this rots.
//
// A capability page rots in exactly two directions, and they need different checks:
//
//   * a citation goes stale - the constant, message or record a line rests on is renamed, deleted or
//     reworded, while the sentence stays behind looking authoritative;
//   * the page on disk stops being what the generator renders - somebody edits the generated file by
//     hand, and the next regeneration silently reverts them (or worse, nobody regenerates at all).
//
// Both are driven here by a mutation that must be detected. The one thing this cannot check is stated on
// the page itself: a citation proves the ground is still there, not that the sentence standing on it is
// a fair summary.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HELPERS, PAGE_PATH, citationGaps, claimList, pageStatus, renderPage } from './toolchain-page.mjs'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const readRepoFile = (file) => {
  try {
    return readFileSync(resolve(ROOT, file), 'utf8')
  } catch {
    return undefined
  }
}

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}
const same = (actual, expected, label) => check(actual === expected, label, actual === expected ? '' : `got ${JSON.stringify(actual)}`)
const only = (gaps) => (gaps.length === 1 ? gaps[0] : `${gaps.length} gaps`)

console.log('toolchain page self-test')

console.log('\n[1] every claim cites something that is still there')
const gaps = citationGaps(claimList(), readRepoFile)
check(gaps.length === 0, `all ${claimList().length} claims hold`, only(gaps))

const goneSentence = citationGaps(
  [{ label: 'a claim resting on a sentence nobody wrote', cites: [{ file: 'tools/zotero-read.mjs', must: ['the sentence that was deleted'] }] }],
  readRepoFile,
)
check(goneSentence.length === 1, 'a citation to a sentence that is gone is reported - the control for the check above', only(goneSentence))

const goneFile = citationGaps([{ label: 'a claim resting on a file nobody has', cites: [{ file: 'tools/zotero-nowhere.mjs', must: ['x'] }] }], readRepoFile)
check(/does not exist/.test(only(goneFile)), 'a citation to a file that is gone says so, rather than throwing on the read', only(goneFile))

check(
  citationGaps([{ label: 'a claim with several citations, one of them broken', cites: [{ file: 'tools/zotero-read.mjs', must: ['nextOffset'] }, { file: 'README.md', must: ['a phrase that is not there'] }] }], readRepoFile).length === 1,
  'one broken citation among several is still caught',
)

console.log('\n[2] the page on disk is what the generator renders')
const rendered = renderPage()
same(pageStatus(rendered, readRepoFile(PAGE_PATH)), 'current', `${PAGE_PATH} is current`)
same(pageStatus(rendered, `${rendered}x`), 'stale', 'a page one character off is stale - the control for the check above')
same(pageStatus(rendered, undefined), 'missing', 'a page that is not there is missing, and not called stale')
check(
  pageStatus(rendered, `${rendered}\n`).length > 0 && pageStatus(rendered, rendered.replace('工具链', '工具')) === 'stale',
  'a hand edit to the generated file is drift, not an improvement',
)

console.log('\n[3] the roster matches the repository')
for (const helper of HELPERS) {
  check(readRepoFile(`tools/${helper.name}`) !== undefined, `the page names ${helper.name}, and that program exists`)
}
check(HELPERS.length >= 9, 'the roster covers the reference-library channel and the preprint channel', `${HELPERS.length} helpers`)

console.log('\n[4] the page says what it cannot prove')
const page = readRepoFile(PAGE_PATH) ?? ''
check(page.includes('能证明'), 'it states what the citations prove')
check(page.includes('不能证明'), 'and states what they do not, on its own face')
check(page.includes('非规范'), 'and defers to the contract, like every other reader-facing page here')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
