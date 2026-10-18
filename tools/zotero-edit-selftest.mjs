// Unit self-test for the record editor, runnable without a library.
//
// Usage: node tools/zotero-edit-selftest.mjs
//
// The properties worth pinning are the refusals and the no-ops:
//   * the field list is a WHITELIST, and the fields it refuses each carry a reason rather than a bare
//     "no", because the caller has to know where to go instead;
//   * the tag list sent is the WHOLE next list, not a delta, because whether a patch's `tags`
//     replaces or merges is not something this repository has measured;
//   * a change that changes nothing is reported as nothing, so no authorization dialog is spent on it.
import { EDITABLE_FIELDS, REFUSED_FIELDS, changedFields, computeTagChange, parseSetFlags } from './zotero-edit.mjs'

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
    check(expect ? error.message.includes(expect) : true, label, expect ? error.message.slice(0, 70) : '')
  }
}

console.log('record editor self-test')

// --- the field whitelist ------------------------------------------------------------------------

console.log('\n[1] what may be changed, and what may not')

check(EDITABLE_FIELDS.includes('title') && EDITABLE_FIELDS.includes('DOI'), 'bibliographic fields are editable')
check(!EDITABLE_FIELDS.includes('creators') && !EDITABLE_FIELDS.includes('itemType'), 'structure is not editable')
check(
  Object.keys(REFUSED_FIELDS).every((field) => !EDITABLE_FIELDS.includes(field)),
  'no field is both editable and refused',
)
check(
  Object.values(REFUSED_FIELDS).every((reason) => reason.length > 20),
  'every refusal carries a reason rather than a bare no',
)

console.log('\n[2] reading field=value')
check(parseSetFlags(['title=A new title']).title === 'A new title', 'a simple assignment')
check(parseSetFlags(['pages=1-10']).pages === '1-10', 'a value with a dash')
check(parseSetFlags(['title=A=B']).title === 'A=B', 'a value containing "=" is kept whole, split on the first only')
check(parseSetFlags(['abstractNote=']).abstractNote === '', 'an empty value is kept: clearing a field is a real change')
throws('an assignment with no "=" is refused', () => parseSetFlags(['title']), 'field=value')
throws('an unknown field is refused', () => parseSetFlags(['titel=x']), 'takes one of')
throws('a refused field is refused WITH its reason', () => parseSetFlags(['creators=x']), 'structured')
throws('changing the item type is refused with its reason', () => parseSetFlags(['itemType=book']), 'decides which fields')

console.log('\n[3] tags are computed as a whole list')

const added = computeTagChange(['transformer'], { add: ['/done'] })
check(JSON.stringify(added.next) === '["transformer","/done"]', 'a new tag is appended after the existing ones', JSON.stringify(added.next))
check(added.added.length === 1 && !added.unchanged, 'the addition is reported')
const noop = computeTagChange(['/done'], { add: ['/done'] })
check(noop.unchanged && noop.added.length === 0, 'adding a tag that is already there changes nothing')
const removed = computeTagChange(['/done', 'transformer'], { remove: ['/done'] })
check(JSON.stringify(removed.next) === '["transformer"]', 'a removal keeps the order of the rest', JSON.stringify(removed.next))
check(removed.removed.length === 1, 'the removal is reported')
check(computeTagChange(['a'], { remove: ['zzz'] }).unchanged, 'removing a tag that is not there changes nothing')
check(
  JSON.stringify(computeTagChange(['a'], { add: ['b', 'b', 'a'] }).next) === '["a","b"]',
  'a repeated addition lands once',
)
check(JSON.stringify(computeTagChange([], {}).next) === '[]', 'no change asked for is an empty list')

console.log('\n[4] a change that changes nothing is not a write')

const record = { title: 'Attention Is All You Need', DOI: '', version: 567 }
check(changedFields(record, { title: 'Attention Is All You Need' }).length === 0, 'the same title is not a change')
check(changedFields(record, { title: 'Other' }).length === 1, 'a different title is')
check(
  changedFields(record, { DOI: '10.1234/x' })[0].from === '',
  'the "from" side of an empty field is empty rather than undefined',
)
check(changedFields(record, { DOI: '' }).length === 0, 'asking to clear an already-empty field is not a change')
check(
  changedFields({ tags: [{ tag: '/unread' }] }, { tags: [{ tag: '/done' }] }).length === 1,
  'a tag swap is a change, though both lists are one tag long - the object-array case',
)
check(
  changedFields({ tags: [{ tag: '/done' }] }, { tags: [{ tag: '/done' }] }).length === 0,
  'the same tags are not a change',
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
