// Unit self-test for the attachment-link tool's planning logic, runnable without the library.
//
// Usage: node tools/zotero-link-selftest.mjs
//
// Two properties are load-bearing. A destination is derived from the parent title in a form the
// filesystem accepts, so a title carrying a colon or a question mark cannot produce an unusable
// path. And an existing destination is NEVER overwritten: the tool converts, recovers an identical
// file, or reports a conflict and leaves both copies alone.
import {
  WAKE_NOTE_MARKER,
  classifyConflict,
  classifyDestination,
  destinationFor,
  sanitizeFilename,
  selectCandidates,
  summarize,
} from './zotero-link-attachments.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('attachment link self-test')

// --- the file name ------------------------------------------------------------------------------

check(sanitizeFilename('A/B:C*D?E"F<G>H|I') === 'ABCDEFGHI', 'every character a filesystem rejects is stripped')
check(sanitizeFilename('  A   B  ') === 'A B', 'runs of whitespace collapse and the ends are trimmed')
check(sanitizeFilename('Title...') === 'Title', 'trailing dots are stripped')
check(sanitizeFilename('Title . . ') === 'Title', 'a trailing dot-and-space tail is stripped')
check(sanitizeFilename('') === 'untitled', 'an empty title falls back to a default')
check(sanitizeFilename('   ', 'K3Y') === 'K3Y', 'the fallback can be the item key')
check(sanitizeFilename('Nothing to strip') === 'Nothing to strip', 'a title needing no change is returned as-is')

// --- the destination ----------------------------------------------------------------------------

check(
  destinationFor({ targetDir: 'D:\\Store', parentTitle: 'X: Y', fallbackKey: 'K3Y' }) === 'D:\\Store\\X Y.pdf',
  'the destination joins the sanitized title and the extension',
  destinationFor({ targetDir: 'D:\\Store', parentTitle: 'X: Y', fallbackKey: 'K3Y' }),
)
check(
  destinationFor({ targetDir: 'D:\\Store\\', parentTitle: 'X', fallbackKey: 'K3Y' }) === 'D:\\Store\\X.pdf',
  'a trailing separator on the target directory does not double up',
  destinationFor({ targetDir: 'D:\\Store\\', parentTitle: 'X', fallbackKey: 'K3Y' }),
)
check(
  destinationFor({ targetDir: 'D:\\Store', parentTitle: '', fallbackKey: 'K3Y' }) === 'D:\\Store\\K3Y.pdf',
  'a missing parent title falls back to the item key',
  destinationFor({ targetDir: 'D:\\Store', parentTitle: '', fallbackKey: 'K3Y' }),
)

// --- which attachments may be converted ---------------------------------------------------------

const userLibrary = { type: 'user', id: 1 }
const groupLibrary = { type: 'group', id: 2 }
const fixture = [
  { key: 'STORED01', library: userLibrary, data: { linkMode: 'imported_file', contentType: 'application/pdf', parentItem: 'P1' } },
  { key: 'URLPDF01', library: userLibrary, data: { linkMode: 'imported_url', contentType: 'application/pdf', parentItem: 'P6' } },
  { key: 'LINKED01', library: userLibrary, data: { linkMode: 'linked_file', contentType: 'application/pdf', parentItem: 'P2' } },
  { key: 'LINKURL1', library: userLibrary, data: { linkMode: 'linked_url', contentType: 'text/html' } },
  { key: 'SNAP0001', library: userLibrary, data: { linkMode: 'imported_url', contentType: 'text/html', parentItem: 'P3' } },
  { key: 'EMBEDDED', library: userLibrary, data: { linkMode: 'embedded_image', contentType: 'image/png', parentItem: 'P5' } },
  { key: 'EMBPDF01', library: userLibrary, data: { linkMode: 'embedded_image', contentType: 'application/pdf', parentItem: 'P7' } },
  { key: 'GROUP001', library: groupLibrary, data: { linkMode: 'imported_file', contentType: 'application/pdf', parentItem: 'P4' } },
  { key: 'ORPHAN01', library: userLibrary, data: { linkMode: 'imported_file', contentType: 'application/pdf' } },
]

const { candidates, skipped } = selectCandidates(fixture)
check(
  candidates.map((candidate) => candidate.key).join(',') === 'STORED01,URLPDF01',
  'only stored PDFs in the owner library with a parent item are candidates',
  candidates.map((candidate) => candidate.key).join(','),
)
check(candidates[0].parentKey === 'P1', 'a candidate carries its parent key')
check(
  candidates.every((candidate) => candidate.contentType === 'application/pdf'),
  'a candidate carries the content type the destination extension is derived from',
  candidates.map((candidate) => candidate.contentType).join(','),
)
check(
  skipped.linked === 2 &&
    skipped.nonPdf === 2 &&
    skipped.otherLinkMode === 1 &&
    skipped.groupLibrary === 1 &&
    skipped.noParent === 1,
  'every rejected attachment is counted under its reason',
  JSON.stringify(skipped),
)
check(
  selectCandidates([]).candidates.length === 0,
  'an empty library yields no candidates rather than an error',
)
check(
  selectCandidates([{ key: 'X', data: {} }]).candidates.length === 0,
  'an attachment with no data is rejected, not converted',
)

// --- the conflict rule --------------------------------------------------------------------------

check(classifyDestination({ destinationExists: false, contentMatches: false }) === 'convert', 'a free destination is converted')
check(classifyDestination({ destinationExists: true, contentMatches: true }) === 'recover', 'an identical file is reused, not copied')
check(
  classifyDestination({ destinationExists: true, contentMatches: false }) === 'conflict',
  'a destination with different content is a conflict - never an overwrite',
)
check(
  classifyConflict({ parentLinksDestination: true }) === 'redundant',
  'a collision on a file the item already links is reported as redundant, not as a clash',
)
check(
  classifyConflict({ parentLinksDestination: false }) === 'conflict',
  'a genuine name collision stays a conflict',
)

// --- the closing report -------------------------------------------------------------------------

const counts = summarize([
  { status: 'converted' },
  { status: 'converted' },
  { status: 'conflict' },
  { status: 'missing-source' },
])
check(
  counts.converted === 2 && counts.conflict === 1 && counts['missing-source'] === 1,
  'outcomes are counted by status',
  JSON.stringify(counts),
)
check(Object.keys(summarize([])).length === 0, 'no results summarise to no counts')

// --- the index wake-up --------------------------------------------------------------------------
// A note save is what registers the library's background index drain, so the marker is the handle
// the next run uses to find that note instead of creating another one.
check(
  typeof WAKE_NOTE_MARKER === 'string' && WAKE_NOTE_MARKER.length > 10,
  'the wake-note marker is a stable, searchable string',
  WAKE_NOTE_MARKER,
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
