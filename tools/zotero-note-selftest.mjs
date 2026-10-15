// Unit self-test for the digest-note writer, runnable without a library.
//
// Usage: node tools/zotero-note-selftest.mjs
//
// The property that matters is which note gets written to. The tool appends to the one note on a
// record that carries its marker and creates a note when there is none, so a note somebody else wrote
// is never touched - and an append must never drop what was already there.
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

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
