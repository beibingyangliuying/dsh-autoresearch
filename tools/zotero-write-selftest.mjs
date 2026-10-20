// Unit self-test for the add-a-record tool, runnable without a library.
//
// Usage: node tools/zotero-write-selftest.mjs
//
// What carries the safety of `--collection` is not the flag but three refusals around it:
//   * the key is checked against the library's own collection list BEFORE the create, because a
//     library that refuses an unknown key turns a typo into a failed write AFTER the owner already
//     answered the authorization dialog;
//   * `collections` is not an item schema field, so it must be attached to the body rather than
//     counted as a filled field - otherwise the dry run would print a filing the body does not carry;
//   * a read-back with no filing is `UNFILED`, never "added". That is the one case where the record
//     exists and the claim would be false, so the check below reads the tool's source: it must hand
//     the owner the `--assign` command and must NOT own a second write path.
import { readFileSync } from 'node:fs'
import {
  collectionKeyProblems,
  parseCollectionKeys,
  unfiledCollections,
  unknownCollections,
  withCollections,
} from './zotero-write.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('write tool self-test')

const SOURCE = readFileSync(new URL('./zotero-write.mjs', import.meta.url), 'utf8')

console.log('\n[1] --collection is read as keys, not as names')

check(
  JSON.stringify(parseCollectionKeys(['--doi', '10.1/x', '--collection', 'abcd2345'])) === '["ABCD2345"]',
  'a key pasted in lowercase is upper-cased',
  JSON.stringify(parseCollectionKeys(['--collection', 'abcd2345'])),
)
check(
  parseCollectionKeys(['--collection', 'AAAAAAAA', '--collection', 'AAAAAAAA']).length === 1,
  'a repeated key is asked for once',
)
check(
  JSON.stringify(parseCollectionKeys(['--collection', 'AAAAAAAA', '--collection', 'BBBBBBBB'])) === '["AAAAAAAA","BBBBBBBB"]',
  'two collections keep their order',
)
check(
  parseCollectionKeys(['--collection', 'Reading list']).length === 1,
  'a collection NAME is read, so that it can be refused rather than resolved',
)
check(
  collectionKeyProblems(parseCollectionKeys(['--collection', 'Reading list'])).length === 1,
  'and it is refused: a name is not a key',
)

console.log('\n[2] a malformed key never reaches a write')

check(collectionKeyProblems(['']).length === 1, 'a flag with no value is a problem')
check(parseCollectionKeys(['--collection', '--write']).join() === '', 'a flag followed by another flag has no value')
check(collectionKeyProblems(['AB']).length === 1, 'a short key is a problem')
check(collectionKeyProblems(['ABCDEFGHI']).length === 1, 'a long key is a problem')
check(collectionKeyProblems(['ABCD-EFG']).length === 1, 'a key with punctuation is a problem')
check(collectionKeyProblems(['ABCDEFGH']).length === 0, 'eight characters of A-Z and 0-9 are accepted')

console.log('\n[3] the filing rides on the create body')

check(
  JSON.stringify(withCollections({ title: 't' }, ['ABCDEFGH']).collections) === '["ABCDEFGH"]',
  'the body carries collections',
  JSON.stringify(withCollections({ title: 't' }, ['ABCDEFGH'])),
)
check(withCollections({ title: 't' }, []).collections === undefined, 'no flag leaves the field off the body entirely')
check(
  withCollections({ title: 't' }, ['ABCDEFGH']).title === 't',
  'the template fields survive the filing',
)
check(
  JSON.stringify(withCollections({ title: 't' }, ['ABCDEFGH'])) !== JSON.stringify({ title: 't' }),
  'negative control: a filed body differs from an unfiled one',
)

console.log('\n[4] a filing is judged from the READ-BACK, not from the response')

check(
  unfiledCollections(['AAAAAAAA', 'BBBBBBBB'], 'AAAAAAAA').join(' ') === 'BBBBBBBB',
  'one filed key arrives as a bare string and is compared as one',
)
check(
  unfiledCollections(['AAAAAAAA'], ['AAAAAAAA']).length === 0,
  'an array-shaped read-back is compared too',
)
check(
  unfiledCollections(['AAAAAAAA'], false).join(' ') === 'AAAAAAAA',
  'a record at the root reads back as false, which is no filing rather than one named "false"',
)
check(
  unfiledCollections(['AAAAAAAA'], ['BBBBBBBB']).join(' ') === 'AAAAAAAA',
  'a different collection is not the one that was asked for',
)
check(unfiledCollections([], ['AAAAAAAA']).length === 0, 'nothing asked for is nothing missing')

console.log('\n[5] the key is checked against the library before writing')

check(unknownCollections(['GONE0000'], [{ key: 'HERE0000' }]).length === 1, 'a key the library does not have is unknown')
check(unknownCollections(['HERE0000'], [{ key: 'HERE0000' }]).length === 0, 'a key the library has is known')
check(unknownCollections([], []).length === 0, 'no key is always known')
check(unknownCollections(['HERE0000'], []).length === 1, 'an empty collection list knows nothing')

console.log('\n[6] the tool owns no second write')

check(!/patchItem|patchCollection/.test(SOURCE), 'it imports no patch path, so a filing cannot be written behind the create')
check(SOURCE.includes('UNFILED'), 'the unfiled case is stated rather than passed over')
check(
  /node "\$\{COLLECTION_TOOL\}" --assign/.test(SOURCE),
  'and it hands the owner the one command that files the record',
)
check(
  /COLLECTION_TOOL = fileURLToPath\(new URL\('\.\/zotero-collection\.mjs', import\.meta\.url\)\)/.test(SOURCE),
  'that command is an absolute path from where this file lives, so it resolves outside this repository',
)
check(
  !/node tools\/zotero-collection\.mjs/.test(SOURCE),
  'negative control: no relative tools/ path is printed as a command',
)
check(/readItem\(itemKey\)/.test(SOURCE), 'the created record is read back')
check(/withCollections\(bare, wanted\)/.test(SOURCE), 'the body posted is the one the dry run printed')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
