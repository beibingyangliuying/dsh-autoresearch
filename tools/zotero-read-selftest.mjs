// Unit self-test for the reference-library reader, runnable without a library running.
//
// Usage: node tools/zotero-read-selftest.mjs
//
// The fixtures are the SHAPES the library actually answered on 2026-10-15 (Zotero 10.0.6), reduced to
// the fields under test. They are here because every one of them broke a reasonable-looking first
// design:
//
//   * a full-text search answers with a MIX of rows - attachments, notes with empty titles, and real
//     records - so the rows have to be collapsed onto the records they belong to;
//   * `?itemKey=a,b` answers with the two records AND their children, so a multi-get must be filtered
//     back to what was asked for;
//   * `collections` is a bare string when there is one, and `tags` is `[{tag}]`;
//   * `date` is free text ("09/2019"), so a year is found in it, never sliced out of it.
import {
  buildCollectionTree,
  classifyHit,
  findPassages,
  groupHits,
  parseArgs,
  pickAttachment,
  selectRequested,
  sliceText,
  yearOf,
} from './zotero-read.mjs'
import { normalizeCollections, normalizeTags } from './zotero-local-api.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}
const throws = (label, run) => {
  try {
    run()
    check(false, label, 'nothing was thrown')
  } catch {
    check(true, label)
  }
}

console.log('reference-library reader self-test')

// --- fixtures: the shapes the library answered ---------------------------------------------------

/** Six rows from one `qmode=everything` search: three attachment rows, two notes, one record. */
const SEARCH_ROWS = [
  { key: '89IR5DP6', data: { itemType: 'attachment', contentType: 'application/pdf', parentItem: 'MXZ5D9T6', title: 'New network sensitivity-based approach' } },
  { key: 'XDZBJ3WU', data: { itemType: 'attachment', contentType: 'application/pdf', parentItem: 'WV4GY4UQ', title: 'Cascading Failure Mitigation via Transmission Switching' } },
  { key: '73WSQ4DD', data: { itemType: 'attachment', contentType: 'application/pdf', parentItem: '2UHDKBMJ', title: 'AI-Driven Stabilization in Power Grids' } },
  { key: 'WFYYMUXQ', data: { itemType: 'conferencePaper', title: 'Cascading power outages propagate locally', date: '2017-06-01' } },
  { key: 'VK2AN4SR', data: { itemType: 'note', parentItem: 'WFYYMUXQ', title: '' } },
  { key: 'SVYKIBWU', data: { itemType: 'note', parentItem: 'WFYYMUXQ', title: '' } },
]

/** The real children of 85ZCTB6Z: a note, a linked PDF, and an imported HTML snapshot. */
const CHILDREN = [
  { key: 'V3USIF2E', data: { itemType: 'note', title: '' } },
  { key: '2PPY7UFW', data: { itemType: 'attachment', contentType: 'application/pdf', linkMode: 'linked_file', title: 'Full Text PDF' } },
  { key: 'X6T87XVI', data: { itemType: 'attachment', contentType: 'text/html', linkMode: 'imported_url', title: 'Snapshot' } },
]

/** What `?itemKey=MXZ5D9T6,WV4GY4UQ` actually answered: the two records AND their children. */
const MULTI_GET_ROWS = [
  { key: '89IR5DP6', data: { itemType: 'attachment', parentItem: 'MXZ5D9T6' } },
  { key: 'XDZBJ3WU', data: { itemType: 'attachment', parentItem: 'WV4GY4UQ' } },
  { key: 'JCK7898M', data: { itemType: 'note', parentItem: 'WV4GY4UQ' } },
  { key: 'WV4GY4UQ', data: { itemType: 'preprint', title: 'Cascading Failure Mitigation via Transmission Switching' } },
  { key: 'JDRS7968', data: { itemType: 'note', parentItem: 'MXZ5D9T6' } },
  { key: 'MXZ5D9T6', data: { itemType: 'journalArticle', title: 'New network sensitivity-based approach' } },
]

/** Real collection rows, plus one whose parent is missing (marked) to pin the orphan rule. */
const COLLECTIONS = [
  { key: 'UCXUZ6J9', data: { name: '电气设备抗震性能' }, meta: { numItems: 18 } },
  { key: '6NC7A7ZU', data: { name: '变压器', parentCollection: 'UCXUZ6J9' }, meta: { numItems: 13 } },
  { key: '6EXX6Z4X', data: { name: '阀塔阀厅', parentCollection: 'UCXUZ6J9' }, meta: { numItems: 9 } },
  { key: 'W3UJBL4F', data: { name: '磕盐过程论文参考' }, meta: { numItems: 0 } },
  { key: 'ORPHAN01', data: { name: 'child of a collection that is not in this page', parentCollection: 'GONE0000' }, meta: { numItems: 1 } },
]

const FULLTEXT = 'Seismic performance assessment of power systems. Seismic demand and component capacity are correlated. '

// --- what a row is ------------------------------------------------------------------------------

console.log('\n[1] a row is classified, and told which record it belongs to')

const attachment = classifyHit(SEARCH_ROWS[0])
check(attachment.kind === 'attachment' && attachment.parentKey === 'MXZ5D9T6', 'an attachment row belongs to its parent', attachment.parentKey)
check(attachment.record === null, 'an attachment row carries no record of its own')
check(attachment.contentType === 'application/pdf', 'the attachment content type is kept')
const note = classifyHit(SEARCH_ROWS[4])
check(note.kind === 'note' && note.parentKey === 'WFYYMUXQ', 'a note row belongs to its parent')
const record = classifyHit(SEARCH_ROWS[3])
check(record.kind === 'item' && record.parentKey === 'WFYYMUXQ', 'a record row is its own parent')
check(record.record?.itemType === 'conferencePaper', 'a record row carries its own data')

// --- collapsing onto records --------------------------------------------------------------------

console.log('\n[2] rows collapse onto records, without losing what matched')

const groups = groupHits(SEARCH_ROWS)
check(groups.length === 4, 'six rows become four records', `${groups.length}`)
const notes = groups.find((group) => group.parentKey === 'WFYYMUXQ')
check(notes.sources.length === 3, 'the record that matched by metadata AND by two notes keeps all three', `${notes.sources.length}`)
check(notes.record?.itemType === 'conferencePaper', 'and it is printed as the record, not as a blank note title')
check(
  groups.filter((group) => group.record === null).length === 3,
  'the three attachment-only records are reported without a record yet, to be fetched',
  `${groups.filter((group) => group.record === null).length}`,
)
check(groupHits([]).length === 0, 'no rows is no records')
check(
  groupHits([SEARCH_ROWS[0], SEARCH_ROWS[0]]).length === 1,
  'the same row twice is still one record',
)

// --- the year is found, never sliced ------------------------------------------------------------

console.log('\n[3] a year is found in a free-text date')

check(yearOf('2012') === '2012', 'a bare year')
check(yearOf('09/2019') === '2019', 'a month/year, which slicing four characters would mangle into "09/2"')
check(yearOf('2026-11-01') === '2026', 'an ISO date')
check(yearOf('n.d.') === '', 'no year at all is reported as absent')
check(yearOf('') === '' && yearOf(undefined) === '', 'an empty or missing date is absent, not a crash')
check(yearOf('Reprinted 1998, originally 1974') === '1998', 'the first year in a range-ish text wins')

// --- which attachment a reading uses ------------------------------------------------------------

console.log('\n[4] the attachment to read is chosen and named')

const picked = pickAttachment(CHILDREN)
check(picked?.key === '2PPY7UFW', 'the PDF wins over the HTML snapshot and the note', picked?.key)
check(picked?.linkMode === 'linked_file', 'the link mode is reported, so a reader knows which file it was')
check(pickAttachment([CHILDREN[0]]) === null, 'a record with only a note has nothing to read')
check(pickAttachment([]) === null, 'a record with no children has nothing to read')
check(
  pickAttachment([CHILDREN[0], CHILDREN[2]])?.contentType === 'text/html',
  'with no PDF the HTML snapshot is used rather than nothing',
)

// --- the two normalisations ---------------------------------------------------------------------

console.log('\n[5] the shapes that are sometimes one thing and sometimes many')

check(JSON.stringify(normalizeCollections('9B8XWBPV')) === '["9B8XWBPV"]', 'one collection arrives as a bare string')
check(normalizeCollections(['a', 'b']).length === 2, 'several arrive as an array')
check(normalizeCollections('').length === 0 && normalizeCollections(undefined).length === 0, 'none is none')
check(JSON.stringify(normalizeTags([{ tag: '/done' }])) === '["/done"]', 'tags are objects with a tag key')
check(normalizeTags(['/done']).length === 1, 'plain string tags still work')
check(normalizeTags([{ nope: 1 }, { tag: '' }]).length === 0, 'a tag with no name is dropped rather than printed blank')
check(normalizeTags(undefined).length === 0, 'missing tags are none')

// --- the multi-get trap -------------------------------------------------------------------------

console.log('\n[6] a multi-get is filtered back to what was asked for')

const selected = selectRequested(MULTI_GET_ROWS, ['MXZ5D9T6', 'WV4GY4UQ'])
check(selected.size === 2, 'two keys asked for, two records kept - not the six rows answered', `${selected.size}`)
check(selected.get('MXZ5D9T6')?.itemType === 'journalArticle', 'and they are the records that were asked for')
check(!selected.has('89IR5DP6'), "the children the library volunteered are not adopted as records")
check(selectRequested(MULTI_GET_ROWS, []).size === 0, 'asking for nothing keeps nothing')

// --- collections --------------------------------------------------------------------------------

console.log('\n[7] collections become a tree')

const tree = buildCollectionTree(COLLECTIONS)
check(tree.length === 3, 'three roots: two real ones and the orphan', `${tree.length}`)
check(tree[0].key === 'UCXUZ6J9' && tree[0].children.length === 2, 'a root keeps its children', `${tree[0].children.length}`)
check(tree[0].count === 18, 'the item count is carried')
check(tree.some((node) => node.key === 'ORPHAN01'), 'a collection whose parent is missing becomes a root instead of vanishing')
check(buildCollectionTree([]).length === 0, 'no collections is an empty tree')

// --- slicing ------------------------------------------------------------------------------------

console.log('\n[8] a long text is read in slices with a working cursor')

const whole = sliceText('x'.repeat(1000), { offset: 0, limit: 400 })
check(whole.to === 400 && whole.total === 1000 && whole.nextOffset === 400, 'the first slice names where to continue', String(whole.nextOffset))
const tail = sliceText('x'.repeat(1000), { offset: 900, limit: 400 })
check(tail.text.length === 100 && tail.nextOffset === null, 'the last slice says it is the end')
check(sliceText('abc', { offset: 99, limit: 10 }).text === '', 'an offset past the end yields nothing rather than throwing')
check(sliceText('abc', { offset: 0, limit: 0 }).to === 0, 'a zero limit reads nothing')
check(sliceText('', {}).total === 0 && sliceText('', {}).nextOffset === null, 'an empty text is empty')

// --- passages -----------------------------------------------------------------------------------

console.log('\n[9] passages are found, with their offsets')

const passages = findPassages(FULLTEXT, 'seismic demand')
check(passages.length === 1, 'a term is found once', `${passages.length}`)
check(passages[0].index === FULLTEXT.toLowerCase().indexOf('seismic demand'), 'the offset is the real one')
// The window only means something on a text longer than it is, so that is what this measures.
const LONG = `${'a'.repeat(500)}seismic demand${'b'.repeat(500)}`
const windowed = findPassages(LONG, 'seismic demand', { window: 50 })
check(
  windowed[0].excerpt.length === 50 + 'seismic demand'.length + 50,
  'the excerpt is the window on both sides and no more',
  `${windowed[0].excerpt.length} characters`,
)
check(windowed[0].excerpt.startsWith('a') && windowed[0].excerpt.endsWith('b'), 'the window is centred on the hit')
check(findPassages(LONG, 'seismic demand').at(0).excerpt.length < LONG.length, 'the default window is still bounded')
check(findPassages(FULLTEXT, 'SEISMIC').length === 2, 'the search is case-insensitive')
check(findPassages(FULLTEXT, 'nothing here').length === 0, 'a term that does not occur yields no passage')
check(findPassages(FULLTEXT, '').length === 0, 'an empty term yields no passage rather than every position')
check(findPassages('a a a a a a a a a a', 'a', { max: 3 }).length === 3, 'the cap is honoured')
check(!findPassages('line\nbreak', 'line').at(0).excerpt.includes('\n'), 'whitespace in an excerpt is collapsed for printing')

// --- the command line ---------------------------------------------------------------------------

console.log('\n[10] the command line')

throws('no mode is refused', () => parseArgs([]))
throws('two modes at once are refused', () => parseArgs(['--search', 'x', '--item', 'y']))
throws('an unknown flag is refused', () => parseArgs(['--search', 'x', '--frobnicate']))
throws('an unknown qmode is refused rather than silently ignored', () => parseArgs(['--search', 'x', '--qmode', 'bogus']))
throws('--limit above the page size is refused for a search', () => parseArgs(['--search', 'x', '--limit', '101']))
throws('--limit below one is refused', () => parseArgs(['--search', 'x', '--limit', '0']))
throws('a negative offset is refused', () => parseArgs(['--fulltext', 'k', '--offset', '-1']))

const search = parseArgs(['--search', 'x', '--tag', 'a', '--tag', 'b', '--json'])
check(search.mode === 'search' && search.tags.length === 2 && search.json === true, 'a search takes repeated tags and --json')
check(search.limit === 10, 'a search defaults to ten rows', String(search.limit))
check(search.qmode === 'everything', 'the default mode is full text, because the other default hides paywalled text')
const read = parseArgs(['--fulltext', 'k', '--limit', '300'])
check(read.mode === 'fulltext' && read.limit === 300, 'a read takes a character count beyond the page size', String(read.limit))
check(parseArgs(['--fulltext', 'k']).limit === 12000, 'a read defaults to 12000 characters, inside the result pruner')
check(parseArgs(['--fulltext', 'k', '--grep', 'term']).grep === 'term', 'a read can look for one term')
check(parseArgs(['--collections']).mode === 'collections' && parseArgs(['--tags']).mode === 'tags', 'the argument-less modes parse')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
