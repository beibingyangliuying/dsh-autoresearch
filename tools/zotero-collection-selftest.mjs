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
// The keys and names are synthetic; the SHAPE is the one the library answered.
const COLLECTIONS = [
  { key: 'COLROOT1', data: { name: 'Example root', parentCollection: false }, meta: { numItems: 18 } },
  { key: 'COLCHLD2', data: { name: 'Example child', parentCollection: 'COLROOT1' }, meta: { numItems: 13 } },
  { key: 'COLCHLD3', data: { name: 'Example child two', parentCollection: 'COLROOT1' }, meta: { numItems: 9 } },
  { key: 'COLNOTE4', data: { name: 'Example root two' }, meta: { numItems: 0 } },
]

console.log('\n[1] a duplicate is a sibling with the same name')

check(
  siblingWithName(COLLECTIONS, { name: 'Example child', parentKey: 'COLROOT1' })?.key === 'COLCHLD2',
  'the same name under the same parent is a duplicate',
)
check(
  siblingWithName(COLLECTIONS, { name: 'Example child', parentKey: 'COLCHLD3' }) === undefined,
  'the same name under a different parent is not',
)
check(
  siblingWithName(COLLECTIONS, { name: 'Example root' })?.key === 'COLROOT1',
  'a root-level duplicate is found - the root answers false, and "no parent" must equal itself',
)
check(
  siblingWithName(COLLECTIONS, { name: 'Example root two' })?.key === 'COLNOTE4',
  'a root whose parent field is absent altogether is found too',
)
check(
  siblingWithName(COLLECTIONS, { name: '  Example child  ', parentKey: 'COLROOT1' })?.key === 'COLCHLD2',
  'surrounding whitespace does not hide a duplicate',
)
check(
  siblingWithName(COLLECTIONS, { name: 'Example absent' }) === undefined,
  'a name that is not there is not a duplicate',
)

console.log('\n[2] filing is computed as a whole list')

check(JSON.stringify(nextCollections([], 'COLONLY1').next) === '["COLONLY1"]', 'filing into nothing yields that one')
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
