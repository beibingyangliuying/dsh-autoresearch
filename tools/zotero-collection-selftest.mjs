// Unit self-test for the collection tool, runnable without a library.
//
// Usage: node tools/zotero-collection-selftest.mjs
//
// Two properties carry the safety of this tool:
//   * the duplicate check compares SIBLINGS, and the library answers `parentCollection: false` for a
//     collection at the root - so "no parent" has to compare equal to itself, or the check silently
//     misses every root-level duplicate;
//   * the filing list sent is the WHOLE next list, so it does not matter whether a patch's
//     `collections` replaces or merges.
import { nextCollections, siblingWithName } from './zotero-collection.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('collection tool self-test')

// The measured shape: a root answers `parentCollection: false`, not an omitted key and not null.
const COLLECTIONS = [
  { key: 'UCXUZ6J9', data: { name: '电气设备抗震性能', parentCollection: false }, meta: { numItems: 18 } },
  { key: '6NC7A7ZU', data: { name: '变压器', parentCollection: 'UCXUZ6J9' }, meta: { numItems: 13 } },
  { key: '6EXX6Z4X', data: { name: '阀塔阀厅', parentCollection: 'UCXUZ6J9' }, meta: { numItems: 9 } },
  { key: 'W3UJBL4F', data: { name: '磕盐过程论文参考' }, meta: { numItems: 0 } },
]

console.log('\n[1] a duplicate is a sibling with the same name')

check(
  siblingWithName(COLLECTIONS, { name: '变压器', parentKey: 'UCXUZ6J9' })?.key === '6NC7A7ZU',
  'the same name under the same parent is a duplicate',
)
check(
  siblingWithName(COLLECTIONS, { name: '变压器', parentKey: '6EXX6Z4X' }) === undefined,
  'the same name under a different parent is not',
)
check(
  siblingWithName(COLLECTIONS, { name: '电气设备抗震性能' })?.key === 'UCXUZ6J9',
  'a root-level duplicate is found - the root answers false, and "no parent" must equal itself',
)
check(
  siblingWithName(COLLECTIONS, { name: '磕盐过程论文参考' })?.key === 'W3UJBL4F',
  'a root whose parent field is absent altogether is found too',
)
check(
  siblingWithName(COLLECTIONS, { name: '  变压器  ', parentKey: 'UCXUZ6J9' })?.key === '6NC7A7ZU',
  'surrounding whitespace does not hide a duplicate',
)
check(
  siblingWithName(COLLECTIONS, { name: 'seismic' }) === undefined,
  'a name that is not there is not a duplicate',
)

console.log('\n[2] filing is computed as a whole list')

check(JSON.stringify(nextCollections([], '9B8XWBPV').next) === '["9B8XWBPV"]', 'filing into nothing yields that one')
check(
  JSON.stringify(nextCollections(['A'], 'B').next) === '["A","B"]',
  'a second collection is added after the first',
  JSON.stringify(nextCollections(['A'], 'B').next),
)
check(nextCollections(['A'], 'A').changed === false, 'filing into a collection it is already in changes nothing')
check(
  JSON.stringify(nextCollections(['A', 'B'], 'A', { remove: true }).next) === '["B"]',
  'removing keeps the rest in order',
)
check(
  nextCollections(['A'], 'B', { remove: true }).changed === false,
  'removing a collection it is not in changes nothing',
)
check(nextCollections([], 'A', { remove: true }).changed === false, 'removing from nothing changes nothing')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
