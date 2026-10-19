// Unit self-test for the metadata channel helper, runnable without the network.
//
// Usage: node tools/metadata-selftest.mjs      (or: node tools/metadata.mjs --selftest)
//
// Every fixture below is a REAL response captured on 2026-10-19, trimmed but otherwise verbatim. The
// two failure shapes matter most, and both are the real thing rather than a belief about one:
//
//   * the OpenAlex `abstract_inverted_index` fixture is a REAL slice, so it has holes in its position
//     range. `reconstructAbstract` must answer '' for it - a partial rebuild printed as an abstract is
//     exactly the fabricated quote the discipline forbids. The complete-index case uses a synthetic
//     four-word map, labelled as such, because no complete real index was captured.
//   * Unpaywall's 404 is HTML, byte-for-byte what the server sent. "not in this index", "the body is
//     not JSON", "rate limited" and "the request failed" must never print the same thing.
import {
  boundedNotice,
  buildUrl,
  classifyResponse,
  errorMessage,
  formatOa,
  formatRefs,
  formatSearch,
  formatWork,
  normalizeCrossrefWork,
  normalizeDoi,
  normalizeOpenAlexWork,
  normalizeUnpaywall,
  openAlexIdOf,
  parseArgs,
  plainText,
  reconstructAbstract,
  referenceLabel,
  workRef,
} from './metadata.mjs'

// The ambient environment must not decide what this file proves.
delete process.env.AUTORESEARCH_MAILTO

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

console.log('metadata channel self-test')

// --- fixtures: captured 2026-10-19, trimmed but verbatim ------------------------------------------

const MEASURED_OPENALEX_WORK = {
  id: 'https://openalex.org/W2626778328',
  doi: 'https://doi.org/10.65215/2q58a426',
  title: 'Attention Is All You Need',
  publication_year: 2025,
  cited_by_count: 78004,
  type: 'preprint',
  ids: {
    openalex: 'https://openalex.org/W2626778328',
    doi: 'https://doi.org/10.65215/2q58a426',
    mag: '2626778328',
  },
  primary_location: {
    id: 'doi:10.65215/2q58a426',
    doi: 'https://doi.org/10.65215/2q58a426',
    is_oa: false,
    landing_page_url: 'https://doi.org/10.65215/2q58a426',
    pdf_url: null,
    source: null,
    license: null,
    version: 'acceptedVersion',
    is_accepted: true,
    is_published: false,
    raw_source_name: null,
    raw_type: 'posted-content',
  },
  open_access: {
    is_oa: true,
    oa_status: 'gold',
    oa_url: 'https://langtaosha.org.cn/index.php/lts/preprint/download/10/108',
    any_repository_has_fulltext: true,
  },
  authorships: [
    { author: { display_name: 'Ashish Vaswani' } },
    { author: { display_name: 'Noam Shazeer' } },
  ],
  referenced_works: [
    'https://openalex.org/W1632114991',
    'https://openalex.org/W1810943226',
    'https://openalex.org/W1902237438',
  ],
  // A real slice: positions run to 137, so this map has holes and cannot be rebuilt faithfully.
  abstract_inverted_index: {
    2: [99],
    2014: [85, 104],
    The: [0, 18],
    dominant: [1],
    sequence: [2],
    transduction: [3],
    models: [4, 21, 60, 137],
    are: [5],
  },
}

const MEASURED_CROSSREF_WORK = {
  DOI: '10.1038/s41586-021-03819-2',
  title: ['Highly accurate protein structure prediction with AlphaFold'],
  'container-title': ['Nature'],
  issued: { 'date-parts': [[2021, 7, 15]] },
  type: 'journal-article',
  'is-referenced-by-count': 46513,
  author: [
    { ORCID: 'https://orcid.org/0000-0001-6169-6580', given: 'John', family: 'Jumper', sequence: 'first' },
    { given: 'Richard', family: 'Evans', sequence: 'additional' },
  ],
  reference: [
    {
      key: '3819_CR1',
      'doi-asserted-by': 'publisher',
      'first-page': '667',
      DOI: '10.12688/f1000research.25097.1',
      volume: '9',
      author: 'MC Thompson',
      year: '2020',
      unstructured:
        'Thompson, M. C., Yeates, T. O. & Rodriguez, J. A. Advances in methods for atomic resolution macromolecular structure determination. F1000Res. 9, 667 (2020).',
      'journal-title': 'F1000Res.',
    },
  ],
  URL: 'https://www.nature.com/articles/s41586-021-03819-2',
}

const MEASURED_UNPAYWALL = {
  doi: '10.1038/s41586-021-03819-2',
  is_oa: true,
  oa_status: 'hybrid',
  best_oa_location: {
    host_type: 'publisher',
    is_best: true,
    license: 'cc-by',
    oa_date: '2021-07-15',
    url: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
    url_for_pdf: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
    version: 'publishedVersion',
  },
  oa_locations: [
    {
      host_type: 'publisher',
      is_best: true,
      url: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
      url_for_pdf: 'https://www.nature.com/articles/s41586-021-03819-2.pdf',
      version: 'publishedVersion',
    },
    {
      host_type: 'repository',
      is_best: false,
      url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/8371605',
      url_for_pdf: null,
      version: 'submittedVersion',
    },
  ],
}

/** Byte-for-byte the body Unpaywall sent for a DOI it does not hold. */
const MEASURED_404_HTML =
  '<!doctype html>\n<html lang=en>\n<title>404 Not Found</title>\n<h1>Not Found</h1>\n<p>The requested URL was not found on the server. If you entered the URL manually please check your spelling and try again.</p>\n'

/** The first two sentences of the notice OpenAlex attached to a search response. */
const MEASURED_OPENALEX_NOTICE =
  "No API key, so this request shares one free daily budget ($0.10) with everyone on your network's IP address. The mailto parameter doesn't raise this limit."

// --- the identifier forms ------------------------------------------------------------------------

console.log('\n[1] identifier normalization')

check(normalizeDoi('doi:10.1/x') === '10.1/x', 'strips the `doi:` prefix')
check(normalizeDoi('https://doi.org/10.1/x') === '10.1/x', 'strips the https resolver')
check(normalizeDoi('http://dx.doi.org/10.1/x') === '10.1/x', 'strips the dx resolver')
check(normalizeDoi('  10.1/x  ') === '10.1/x', 'trims surrounding space')
check(normalizeDoi('see doi:10.1/x') === 'see doi:10.1/x', 'a prefix that is not leading is left alone')
check(openAlexIdOf('https://openalex.org/W2626778328') === 'W2626778328', 'reads the id out of an entity url')
check(openAlexIdOf('W12') === 'W12', 'accepts a bare id')
check(openAlexIdOf('10.48550/arXiv.1706.03762') === '', 'an arXiv DOI is not mistaken for an OpenAlex id')
check(workRef('10.48550/arXiv.1706.03762').kind === 'doi', 'so it is read as a DOI')
check(workRef('https://openalex.org/W12').kind === 'openalex', 'and an entity url as a work id')

// --- the abstract, which is the one thing the discipline forbids doing by eye ---------------------

console.log('\n[2] abstract reconstruction')

check(reconstructAbstract({ The: [0], quick: [1], brown: [2], fox: [3] }) === 'The quick brown fox', 'a complete synthetic index rebuilds in order')
check(
  reconstructAbstract(MEASURED_OPENALEX_WORK.abstract_inverted_index) === '',
  'the REAL trimmed index has holes, so it rebuilds to nothing rather than to a partial abstract',
)
check(reconstructAbstract(null) === '', 'null is not an abstract')
check(reconstructAbstract({}) === '' , 'an empty map is not an abstract')
check(reconstructAbstract([]) === '', 'an array is not an index')
check(reconstructAbstract({ a: [1] }) === '', 'a hole at position 0 rebuilds to nothing')
check(reconstructAbstract({ a: ['0'] }) === '', 'a string position is refused rather than coerced')

// --- one record, from each source ------------------------------------------------------------------

console.log('\n[3] the OpenAlex record: the DOI that comes back is not always the one asked for')

const openAlex = normalizeOpenAlexWork(MEASURED_OPENALEX_WORK)
check(openAlex.doi === '10.65215/2q58a426', 'the answered DOI is normalized, resolver stripped', openAlex.doi)
check(openAlex.id === 'W2626778328', 'the work id is kept')
check(openAlex.year === 2025 && openAlex.citedBy === 78004, 'the year and the count are read')
check(openAlex.authors.length === 2 && openAlex.authors[0] === 'Ashish Vaswani', 'the creator names are read')
check(openAlex.venue === '', 'a null source is an empty venue, not a crash')
check(openAlex.oaStatus === 'gold' && openAlex.oaUrl.startsWith('https://'), 'the open-access status and url are kept')
check(openAlex.references.join(',') === 'W1632114991,W1810943226,W1902237438', 'entity urls become ids')

const mismatch = formatWork(openAlex, { asked: '10.48550/arXiv.1706.03762', abstractChars: 600 })
check(mismatch.includes('DIFFERENT from the DOI asked for'), 'a substituted DOI is marked on the record')
check(mismatch.includes('10.48550/arXiv.1706.03762') && mismatch.includes('10.65215/2q58a426'), 'and both DOIs are printed')
check(mismatch.includes('do not write one from the title'), 'an absent abstract says so instead of inviting a summary')
check(mismatch.includes('retrieved'), 'the count carries its source and retrieval date')

console.log('\n[4] the Crossref record, whose title arrives as an array')

const crossref = normalizeCrossrefWork(MEASURED_CROSSREF_WORK)
check(typeof crossref.title === 'string' && crossref.title.startsWith('Highly accurate'), 'the title array is unwrapped', crossref.title)
check(crossref.year === 2021 && crossref.venue === 'Nature', 'year and venue are read')
check(crossref.citedBy === 46513, 'the count is read from is-referenced-by-count')
check(crossref.authors.join('; ') === 'John Jumper; Richard Evans', 'given and family are joined')
const same = formatWork(crossref, { asked: '10.1038/s41586-021-03819-2', abstractChars: 600 })
check(!same.includes('DIFFERENT'), 'a matching DOI raises no substitution flag')
check(same.includes('is-referenced-by-count') && !same.includes('cited_by_count'), 'and the count is quoted under the field name its own source uses')

console.log('\n[5] references, and the reference shapes the two sources send')

check(referenceLabel('https://openalex.org/W1632114991') === 'W1632114991', 'an OpenAlex reference is its id')
check(referenceLabel({ DOI: '10.12688/f1000research.25097.1' }) === '10.12688/f1000research.25097.1', 'a Crossref reference prefers its DOI')
check(referenceLabel({ unstructured: 'A'.repeat(200) }).endsWith(' ...'), 'an unstructured citation is bounded')
check(referenceLabel({ key: '3819_CR1' }) === '3819_CR1', 'and a key is the last resort')
check(referenceLabel(null) === '', 'nothing prints nothing')
const refs = formatRefs(crossref)
check(refs.includes('10.12688/f1000research.25097.1'), 'the listing shows the real reference, not its internal key')
check(!refs.includes('3819_CR1'), 'and does not lead with the key when a DOI is there')

// --- the four kinds of nothing ---------------------------------------------------------------------

console.log('\n[6] telling the kinds of nothing apart')

check(classifyResponse({ status: 200, body: '{}' }) === 'json', 'a JSON 200 is an answer')
check(classifyResponse({ status: 404, body: MEASURED_404_HTML }) === 'not-found', 'Unpaywall\'s 404 is "not in the index"')
check(classifyResponse({ status: 200, body: MEASURED_404_HTML }) === 'not-json', 'an HTML 200 is an unparseable body')
check(classifyResponse({ status: 429, body: MEASURED_404_HTML }) === 'rate-limited', '429 is read before the body is')
check(classifyResponse({ status: 500, body: '{"error":"boom"}' }) === 'failed', 'a JSON error status is a failure')
check(errorMessage({ error: 'boom' }) === 'boom' && errorMessage({ message: 'boom' }) === 'boom', 'an error envelope is read either way')
check(errorMessage({ meta: { notice: MEASURED_OPENALEX_NOTICE } }) === '', 'a notice is NOT an error envelope')
check(errorMessage(null) === '', 'and nothing has no message')

// --- the urls, which is where the prose rules become mechanical ------------------------------------

console.log('\n[7] one request, built to say what was asked')

const doiOptions = { mode: 'doi', source: 'openalex', target: '10.1038/s41586-021-03819-2', rows: 5, mailto: 'a@b.c' }
check(buildUrl(doiOptions).startsWith('https://api.openalex.org/works/doi:10.1038/s41586-021-03819-2'), 'the OpenAlex record url keeps the DOI slashes')
check(buildUrl(doiOptions).includes('mailto=a%40b.c'), 'and carries the polite-pool address')
check(!buildUrl({ ...doiOptions, mailto: '' }).includes('mailto'), 'with no address the parameter is omitted, not left empty')
check(buildUrl({ ...doiOptions, source: 'crossref' }).startsWith('https://api.crossref.org/works/10.1038/s41586-021-03819-2'), 'Crossref reads the publisher side')
check(
  buildUrl({ mode: 'doi', source: 'openalex', target: 'W12' }).startsWith('https://api.openalex.org/works/W12'),
  'an OpenAlex id needs no doi: prefix',
)
check(!buildUrl({ mode: 'doi', source: 'openalex', target: 'W12' }).includes('doi:'), 'and does not carry one')
check(buildUrl({ mode: 'search', source: 'openalex', search: 'a b', rows: 5 }).includes('per-page=5'), 'an OpenAlex search sets per-page')
check(buildUrl({ mode: 'search', source: 'crossref', search: 'a b', rows: 5 }).includes('query.bibliographic=a+b'), 'a Crossref search uses query.bibliographic')
check(buildUrl({ mode: 'cited-by', target: 'W123', rows: 5 }).includes('filter=cites%3AW123'), 'the citing list is an id filter')
check(buildUrl({ mode: 'oa', target: '10.1038/x', mailto: 'a@b.c' }).includes('email=a%40b.c'), 'Unpaywall takes the address in email=')
check(buildUrl({ mode: 'doi', source: 'openalex', target: '10.1/x?y#z', rows: 5 }) === 'https://api.openalex.org/works/doi:10.1/x%3Fy%23z', 'a DOI containing ? or # cannot end the path early')

// --- the command line, which refuses what it cannot honour -----------------------------------------

console.log('\n[8] refusals that are mechanical')

throws('two modes at once', () => parseArgs(['--doi', '10.1/x', '--search', 'y']))
throws('no mode at all', () => parseArgs([]))
throws('a mode with no identifier', () => parseArgs(['--doi']))
throws('rows above the ceiling the discipline states', () => parseArgs(['--search', 'x', '--rows', '11']))
throws('rows on a single-record mode', () => parseArgs(['--doi', '10.1/x', '--rows', '3']))
throws('an unknown source', () => parseArgs(['--doi', '10.1/x', '--source', 'scopus']))
throws('a source that cannot answer the mode', () => parseArgs(['--cited-by', 'W1', '--source', 'crossref']))
throws('a citing list asked for by DOI', () => parseArgs(['--cited-by', '10.1/x']))
throws('Unpaywall asked without an address', () => parseArgs(['--oa', '10.1/x']))
throws('an abstract setting on a candidate list', () => parseArgs(['--search', 'x', '--abstract', '5']))

const accepted = parseArgs(['--search', 'attention', '--source', 'crossref', '--rows', '10'])
check(accepted.mode === 'search' && accepted.source === 'crossref' && accepted.rows === 10, 'a valid search is accepted as asked')
check(parseArgs(['--cited-by', 'W12']).mode === 'cited-by', 'a citing list by work id is accepted')
check(parseArgs(['--doi', '10.1/x']).rows === 5, 'the page size defaults rather than being sent as undefined')
check(parseArgs(['--selftest']).selftest === true, '--selftest needs no mode')

process.env.AUTORESEARCH_MAILTO = 'env@example.org'
check(parseArgs(['--oa', '10.1/x']).mailto === 'env@example.org', 'the environment supplies the address when the flag does not')
delete process.env.AUTORESEARCH_MAILTO
check(parseArgs(['--oa', '10.1/x', '--mailto', 'flag@example.org']).mailto === 'flag@example.org', 'and the flag wins when both are set')

// --- what a reader sees ----------------------------------------------------------------------------

console.log('\n[9] the rendered shapes carry their own caveats')

const candidates = formatSearch([openAlex], {
  source: 'openalex',
  query: 'attention is all you need',
  total: 3230801,
  rows: 5,
  parsed: 'get works where full text has (attention is all you need)',
  notice: MEASURED_OPENALEX_NOTICE,
})
check(candidates.includes('NOT a work record'), 'a candidate list says it is not a record')
check(candidates.includes('full text has'), 'it prints the API\'s own reading of the query, so a large total is not read as a title count')
check(candidates.includes('mailto parameter doesn\'t raise this limit'), 'and it prints the quota notice the API attached')
check(formatSearch([], { source: 'crossref', query: 'q', total: 0, rows: 5 }).includes('0 results'), 'an answered-and-empty search is not a failure')
check(boundedNotice('x'.repeat(400)).endsWith(' ...'), 'a long notice is bounded to one line')

const oa = formatOa(normalizeUnpaywall(MEASURED_UNPAYWALL))
check(oa.includes('LEAD, not a retrieval'), 'an open-access listing says what it is not')
check(oa.includes('https://www.nature.com/articles/s41586-021-03819-2.pdf'), 'the best copy is the pdf url')
check(oa.includes('https://www.ncbi.nlm.nih.gov/pmc/articles/8371605'), 'and a repository copy with no pdf url falls back to its landing page')
check(plainText('<jats:p>a &amp; b</jats:p>') === 'a & b', 'markup and entities are stripped and decoded')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
export const failedChecks = failures > 0
