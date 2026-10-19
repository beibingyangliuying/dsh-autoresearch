#!/usr/bin/env node
// Read the owner's reference library: search it, inspect a record, and read an attachment's indexed
// text in slices. Read-only: this tool never writes, so it never asks for authorization.
//
// WHY THIS FILE EXISTS
//
// The reference library reached this preset through `mcp-zotero`, whose 35-tool surface (with its
// optional groups already off) cost 59,758 characters (~16,599 tokens) of prompt on EVERY request,
// and the DSH MCP client has no field that filters a server's tool list. The disciplines call a
// handful of those tools. This helper covers the reading half of that; the writing half is separate
// tools, each with its own gate.
//
// MEASURED TRAPS THIS FILE EXISTS TO HANDLE (all reproduced 2026-10-15 against Zotero 10.0.6)
//
//   * FULL TEXT IS KEYED BY THE ATTACHMENT, NOT THE RECORD. `/items/<parentKey>/fulltext` answers
//     HTTP 404. Reading a paper's text is therefore two steps - list the children, pick the
//     attachment, then fetch its text - and the tool reports WHICH attachment it read, because "which
//     file am I looking at" is part of the evidence.
//   * A FULL-TEXT SEARCH RETURNS MIXED ROWS. One `qmode=everything` query returned three `attachment`
//     rows (whose titles happened to be the paper titles), two `note` rows with EMPTY titles, and one
//     real record. Printing them as they arrive therefore shows duplicates and blank lines. Every row
//     is collapsed onto the record it belongs to, and the kind of each hit is stated.
//   * THERE IS NO "MATCHED WHERE" FIELD. The library reports the rows, not the reason. So this tool
//     says which row matched and which mode searched - never a claim the API did not make.
//   * `itemKey=a,b` IS NOT A PLAIN MULTI-GET. Asked for two keys, the library answered with six rows:
//     the two records AND their children. Every multi-get response is filtered back to the keys asked
//     for, or a record would silently acquire other people's children.
//   * `collections` IS A BARE STRING WHEN THERE IS ONE, AND `tags` IS `[{tag}]`. Both are normalised
//     in ./zotero-local-api.mjs, which is where the other tools read the same shapes.
//   * THE DEFAULT SEARCH MODE IS NOT FULL TEXT. `qmode=titleCreatorYear` searches titles, creators and
//     years only, so a paywalled paper the owner already holds looks absent (measured: 178 hits in
//     `everything` against 2 in the default). This tool therefore DEFAULTS TO `everything` and prints
//     the mode it used.
//
// Note for a human reading this by hand: the library answers HTTP/1.0, so use `curl.exe` rather than
// Invoke-WebRequest if you want to reproduce a call outside this tool.
//
// Usage:
//   node tools/zotero-read.mjs --search "contingencies" --limit 10
//   node tools/zotero-read.mjs --search "retrieval" --qmode titleCreatorYear --tag /done
//   node tools/zotero-read.mjs --item <itemKey>
//   node tools/zotero-read.mjs --fulltext <itemKey> --offset 0 --limit 12000
//   node tools/zotero-read.mjs --fulltext <itemKey> --grep "contingenc"
//   node tools/zotero-read.mjs --collections
//   node tools/zotero-read.mjs --collection <collectionKey>
//   node tools/zotero-read.mjs --collection <collectionKey> --screen [--screen-limit 300]
//   node tools/zotero-read.mjs --tags
//
// Exit codes: 0 answered | 1 the library could not answer, or the record has no such text | 2 usage.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  childrenOf,
  getJson,
  localRequest,
  normalizeCollections,
  normalizeTags,
  readCollection,
  readItem,
  serverInfo,
  visibleText,
} from './zotero-local-api.mjs'

const QMODES = ['everything', 'titleCreatorYear']
/** The library's own maximum page size for /items. */
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 10
/** Characters of one attachment's text per read. Inside the shell tool's 16,000-character clip, so one slice arrives whole. */
const DEFAULT_READ_LIMIT = 12_000
/** A ceiling on `--limit` in fulltext mode, where the unit is characters rather than rows. */
const MAX_READ_LIMIT = 100_000
/** How many keys one multi-get may ask for. */
const MULTI_GET_CHUNK = 50
const ATTACHMENT_PREFERENCE = ['application/pdf', 'application/epub+zip', 'text/html']
/** Rows per request when screening a whole collection. The library's own page size for /items. */
const SCREEN_PAGE = 100
/** Characters of one abstract per screened record. 100 records at 300 characters is ~30k, inside a
 *  single report; the default batch of a sweep is far smaller than that. */
const DEFAULT_SCREEN_LIMIT = 300
/** A ceiling on how many rows a screening pass will read, so a runaway collection stops loudly. */
const SCREEN_CAP = 2_000

/** A malformed command line, as opposed to a read that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

/**
 * What one search row IS, and which record it belongs to.
 *
 * @param {object} row A row as the library returns it.
 * @returns {{kind: 'item'|'attachment'|'note', key: string, parentKey: string, contentType: string, title: string, record: object|null}}
 *   `record` is the row's own `data` only when the row is a record; an attachment or a note belongs
 *   to the item it hangs on, and that item has to be fetched separately.
 */
export function classifyHit(row) {
  const data = row?.data ?? {}
  const kind = data.itemType === 'attachment' || data.itemType === 'note' ? data.itemType : 'item'
  return {
    kind,
    key: row.key,
    parentKey: kind === 'item' ? row.key : (data.parentItem ?? row.key),
    contentType: data.contentType ?? '',
    title: data.title ?? '',
    record: kind === 'item' ? data : null,
  }
}

/**
 * Collapse rows onto the records they belong to, preserving the order the library returned.
 *
 * @param {object[]} rows Search rows.
 * @returns {Array<{parentKey: string, record: object|null, sources: Array<{key: string, kind: string, contentType: string}>}>}
 *   One entry per record. Two rows about the same record are two `sources`, so a record matched both
 *   by its metadata and inside an attachment's text is still printed once.
 */
export function groupHits(rows) {
  const groups = new Map()
  for (const row of rows) {
    const hit = classifyHit(row)
    const group = groups.get(hit.parentKey) ?? { parentKey: hit.parentKey, record: null, sources: [] }
    group.sources.push({ key: hit.key, kind: hit.kind, contentType: hit.contentType })
    if (hit.record) group.record = hit.record
    groups.set(hit.parentKey, group)
  }
  return [...groups.values()]
}

/**
 * The 4-digit year out of a date the library stores as free text.
 *
 * `data.date` is whatever the record says - "2012", "09/2019", "n.d.", or a full range - so slicing
 * its first four characters produces things like "09/2". The year is found, or reported as absent.
 *
 * @param {string} dateText The record's date field.
 * @returns {string} The year, or '' when the text holds none.
 */
export function yearOf(dateText) {
  return String(dateText ?? '').match(/(1[5-9]\d\d|20\d\d)/)?.[1] ?? ''
}

/**
 * The attachment a reading should use: the first of the preferred content types that exists.
 *
 * @param {object[]} children Child items as the library returns them.
 * @param {string[]} [preference] Content types in the order they should be tried.
 * @returns {{key: string, contentType: string, linkMode: string, title: string}|null} `null` when the
 *   record has no readable attachment at all - which the caller must report rather than guess around.
 */
export function pickAttachment(children, preference = ATTACHMENT_PREFERENCE) {
  const attachments = children.filter((child) => child?.data?.itemType === 'attachment')
  for (const contentType of preference) {
    const found = attachments.find((child) => child.data.contentType === contentType)
    if (found) {
      return {
        key: found.key,
        contentType: found.data.contentType,
        linkMode: found.data.linkMode ?? '',
        title: found.data.title ?? '',
      }
    }
  }
  return null
}

/**
 * Order collections into a tree by their own parent links.
 *
 * @param {object[]} rows Rows from `/collections`.
 * @returns {Array<{key: string, name: string, count: number, children: object[]}>} Roots, each with
 *   its descendants nested; a collection whose parent is missing is treated as a root rather than
 *   dropped.
 */
export function buildCollectionTree(rows) {
  const nodes = new Map(
    rows.map((row) => [
      row.key,
      { key: row.key, name: row.data?.name ?? '(unnamed)', count: row.meta?.numItems ?? 0, children: [] },
    ]),
  )
  const roots = []
  for (const row of rows) {
    const node = nodes.get(row.key)
    const parent = row.data?.parentCollection ? nodes.get(row.data.parentCollection) : undefined
    ;(parent ? parent.children : roots).push(node)
  }
  return roots
}

/**
 * One slice of a long text, with what is left on either side.
 *
 * @param {string} content The whole text.
 * @param {{offset?: number, limit?: number}} [options] 0-based offset and slice length.
 * @returns {{text: string, from: number, to: number, total: number, nextOffset: number|null}} The
 *   slice and its position; `nextOffset` is null at the end of the text.
 */
export function sliceText(content, { offset = 0, limit = DEFAULT_READ_LIMIT } = {}) {
  const total = content.length
  const from = Math.max(0, Math.min(offset, total))
  const to = Math.min(total, from + Math.max(0, limit))
  return { text: content.slice(from, to), from, to, total, nextOffset: to < total ? to : null }
}

/**
 * Passages around a term, for the "read only what answers the question" rung of the reading ladder.
 *
 * @param {string} content The whole text.
 * @param {string} term What to look for, case-insensitively.
 * @param {{window?: number, max?: number}} [options] Characters of context on each side, and a cap on
 *   the number of passages.
 * @returns {Array<{index: number, excerpt: string}>} Matching passages, whitespace collapsed, in the
 *   order they appear.
 */
export function findPassages(content, term, { window = 200, max = 20 } = {}) {
  if (!term) return []
  const needle = term.toLowerCase()
  const haystack = content.toLowerCase()
  const passages = []
  let index = haystack.indexOf(needle)
  while (index !== -1 && passages.length < max) {
    const start = Math.max(0, index - window)
    const end = Math.min(content.length, index + needle.length + window)
    passages.push({ index, excerpt: content.slice(start, end).replace(/\s+/g, ' ') })
    index = haystack.indexOf(needle, index + needle.length)
  }
  return passages
}

const USAGE =
  'usage: node tools/zotero-read.mjs --search "<query>" [--qmode everything|titleCreatorYear] [--limit N] [--tag TAG]\n' +
  '       node tools/zotero-read.mjs --item <key> [--offset N] [--limit N]   # a note prints its body\n' +
  '       node tools/zotero-read.mjs --fulltext <key> [--attachment <key>] [--offset N] [--limit N] [--grep TERM]\n' +
  '       node tools/zotero-read.mjs --collections | --collection <key> | --tags\n' +
  '       node tools/zotero-read.mjs --collection <key> --screen [--screen-limit N]\n' +
  '       [--json]\n' +
  '       --limit counts ROWS for a search (at most 100, the library\'s page size) and CHARACTERS for a\n' +
  '       read (default 12000, at most 100000).\n' +
  '       --screen enumerates a whole collection and prints one abstract per record; --screen-limit sets\n' +
  '       the characters printed per abstract (default 300). --limit does not apply to a screening pass.'

/**
 * Read the command line.
 *
 * @param {string[]} argv Arguments after the script name.
 * @returns {object} The requested mode and its options.
 * @throws {UsageError} On a usage error; the CLI turns that into exit code 2.
 */
export function parseArgs(argv) {
  const options = {
    mode: '',
    value: '',
    qmode: 'everything',
    limit: DEFAULT_LIMIT,
    limitRaw: undefined,
    offset: 0,
    tags: [],
    attachment: '',
    grep: '',
    screen: false,
    screenLimit: DEFAULT_SCREEN_LIMIT,
    json: false,
  }
  const integer = (name, raw, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) => {
    const parsed = Number(raw)
    if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
      throw new UsageError(`--${name} takes an integer between ${min} and ${max}, got '${raw}'`)
    }
    return parsed
  }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    switch (flag) {
      case '--search':
      case '--item':
      case '--fulltext':
      case '--collection':
        if (options.mode) throw new UsageError(`pass one of --search/--item/--fulltext/--collections/--collection/--tags, not both`)
        if (!next) throw new UsageError(`${flag} needs a value`)
        options.mode = flag.slice(2)
        options.value = next
        index += 1
        break
      case '--collections':
      case '--tags':
        if (options.mode) throw new UsageError('pass one of --search/--item/--fulltext/--collections/--collection/--tags, not both')
        options.mode = flag.slice(2)
        break
      case '--qmode':
        if (!QMODES.includes(next)) throw new UsageError(`--qmode takes one of ${QMODES.join(', ')}, got '${next}'`)
        options.qmode = next
        index += 1
        break
      case '--limit':
        // Validated after the mode is known: rows for a search, characters for a read.
        options.limitRaw = next
        index += 1
        break
      case '--offset':
        options.offset = integer('offset', next)
        index += 1
        break
      case '--tag':
        if (!next) throw new UsageError('--tag needs a tag')
        options.tags.push(next)
        index += 1
        break
      case '--attachment':
        options.attachment = next ?? ''
        index += 1
        break
      case '--grep':
        options.grep = next ?? ''
        index += 1
        break
      case '--screen':
        options.screen = true
        break
      case '--screen-limit':
        options.screenLimit = integer('screen-limit', next, { min: 60, max: 2_000 })
        index += 1
        break
      case '--json':
        options.json = true
        break
      default:
        throw new UsageError(`unrecognised argument '${flag}'`)
    }
  }
  if (!options.mode) throw new UsageError('pass --search, --item, --fulltext, --collections, --collection or --tags')
  if (options.screen && options.mode !== 'collection') {
    throw new UsageError('--screen applies to --collection <key> only')
  }
  // A screening pass pages the collection itself, so a row limit on top of it would be a second,
  // conflicting notion of "how much of the collection". The character budget is `--screen-limit`.
  if (options.screen && options.limitRaw !== undefined) {
    throw new UsageError('--screen reads every row of the collection; set --screen-limit for the characters per abstract, not --limit')
  }
  // `--item` counts characters too, because a note's body is what an item read of a note returns.
  const reading = options.mode === 'fulltext' || options.mode === 'item'
  options.limit = reading ? DEFAULT_READ_LIMIT : DEFAULT_LIMIT
  if (options.limitRaw !== undefined) {
    options.limit = integer('limit', options.limitRaw, { min: 1, max: reading ? MAX_READ_LIMIT : MAX_LIMIT })
  }
  return options
}

/**
 * The rows of a multi-get that were actually asked for.
 *
 * Measured: `?itemKey=a,b` answers with the two records AND their children - asked for two keys, the
 * library returned six rows. Mapping that response unfiltered would attach another record's children
 * to this one, silently and only sometimes.
 *
 * @param {object[]} rows The response rows.
 * @param {string[]} keys The keys that were requested.
 * @returns {Map<string, object>} key -> `data`, for the requested keys only.
 */
export function selectRequested(rows, keys) {
  const wanted = new Set(keys)
  return new Map(rows.filter((row) => wanted.has(row.key)).map((row) => [row.key, row.data]))
}

/** A read that also reports the library's own total, which is the search scope the discipline records. */
async function paginatedJson(path) {
  const res = await localRequest('GET', path)
  if (res.status !== 200) throw new Error(`${path} answered ${res.status}: ${res.text.slice(0, 200)}`)
  return { rows: JSON.parse(res.text), total: Number(res.headers['total-results'] ?? 0) }
}

/** Records by key, asking for at most `MULTI_GET_CHUNK` at a time and keeping only what was asked for. */
async function recordsByKey(keys) {
  const records = new Map()
  for (let start = 0; start < keys.length; start += MULTI_GET_CHUNK) {
    const chunk = keys.slice(start, start + MULTI_GET_CHUNK)
    const rows = await getJson(`/api/users/0/items?itemKey=${chunk.join(',')}&format=json`)
    for (const [key, data] of selectRequested(rows, chunk)) records.set(key, data)
  }
  return records
}

/** Collection key -> name, for printing a record's filing in words rather than as bare keys. */
async function collectionNames() {
  const rows = await getJson('/api/users/0/collections?format=json&limit=200')
  return new Map(rows.map((row) => [row.key, row.data?.name ?? '(unnamed)']))
}

/** The header every mode prints, so a report always says which library answered. */
async function printIdentity() {
  const info = await serverInfo()
  console.log(`library : Zotero ${info.version} · server ${info.id}`)
}

function describeCreators(creators = []) {
  if (creators.length === 0) return 'none'
  const names = creators.map((c) => c.name ?? [c.firstName, c.lastName].filter(Boolean).join(' '))
  const shown = names.length <= 4 ? names : [...names.slice(0, 3), 'et al.']
  return `${names.length}  (${shown.join('; ')})`
}

async function runSearch(options) {
  const params = new URLSearchParams({ q: options.value, limit: String(options.limit), format: 'json' })
  params.set('qmode', options.qmode)
  for (const tag of options.tags) params.append('tag', tag)
  const { rows, total } = await paginatedJson(`/api/users/0/items?${params}`)
  const groups = groupHits(rows)
  const missing = groups.filter((group) => !group.record).map((group) => group.parentKey)
  const fetched = missing.length > 0 ? await recordsByKey(missing) : new Map()
  for (const group of groups) if (!group.record && fetched.has(group.parentKey)) group.record = fetched.get(group.parentKey)

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          query: options.value,
          qmode: options.qmode,
          tags: options.tags,
          total,
          hits: rows.length,
          records: groups.map((group) => ({ key: group.parentKey, sources: group.sources, record: group.record })),
        },
        null,
        2,
      ),
    )
    return
  }

  console.log(`query   : qmode=${options.qmode}  "${options.value}"${options.tags.length ? `  tags=${options.tags.join(',')}` : ''}`)
  console.log(
    `scope   : total ${total} · rows ${rows.length} · records ${groups.length} · limit ${options.limit}` +
      (rows.length < total ? '  (the total is the library\'s, the rows are this page)' : ''),
  )
  if (options.qmode === 'everything') {
    console.log('mode    : everything also matches attachment text and notes; those rows are hits INSIDE a')
    console.log('          record, so they are shown here as one record with its sources, never as works.')
  } else {
    console.log('mode    : titleCreatorYear searches titles, creators and years only - a paper whose text')
    console.log('          contains the term but whose title does not will look absent. Say so if you report it.')
  }
  if (groups.length === 0) {
    console.log('\n0 records - the query was answered and matched nothing. This is not a failure.')
    return
  }
  console.log('')
  groups.forEach((group, index) => {
    const record = group.record
    const year = yearOf(record?.date)
    const type = record?.itemType ?? 'unknown type'
    const title = record?.title || '(no title on this record)'
    console.log(`${index + 1}. ${group.parentKey}  ${year || '????'}  [${type}]  ${title}`)
    const parts = group.sources.map((source) =>
      source.kind === 'item'
        ? 'metadata'
        : `${source.kind} ${source.key}${source.contentType ? ` (${source.contentType})` : ''}`,
    )
    console.log(`   hit  : ${parts.join(' · ')}`)
  })
}

async function runItem(options) {
  const key = options.value
  const [data, children, names] = await Promise.all([readItem(key), childrenOf(key), collectionNames()])
  const collections = normalizeCollections(data.collections)
  const picked = pickAttachment(children)
  if (options.json) {
    console.log(JSON.stringify({ key, data, children: children.map((c) => c.data), fulltextSource: picked }, null, 2))
    return
  }
  console.log(`item       : ${key}  [${data.itemType}]  "${data.title ?? ''}"`)
  console.log(`creators   : ${describeCreators(data.creators)}`)
  console.log(`date       : ${data.date ?? '(none)'}`)
  if (data.DOI) console.log(`DOI        : ${data.DOI}`)
  if (data.url) console.log(`url        : ${data.url}`)
  console.log(`collections: ${collections.length === 0 ? 'none' : collections.map((c) => `${c} (${names.get(c) ?? 'unknown'})`).join(' · ')}`)
  console.log(`tags       : ${normalizeTags(data.tags).join(' · ') || 'none'}`)
  console.log(`version    : ${data.version}   (a write must send If-Unmodified-Since-Version: ${data.version})`)
  console.log(`children   : ${children.length}`)
  for (const child of children) {
    const childData = child.data ?? {}
    const marker = picked && child.key === picked.key ? '   <- --fulltext reads this' : ''
    console.log(
      `  ${(childData.itemType ?? '?').padEnd(11)} ${child.key}  ${(childData.contentType ?? '-').padEnd(16)} ${childData.linkMode ?? ''}${marker}`,
    )
  }
  if (!picked && children.length > 0) console.log('  (no PDF, EPUB or HTML attachment: nothing here can be read as text)')
  // A note IS its body. Printing only its metadata made an existing note unreadable, which left the
  // section-note discipline naming a ruler it could not open.
  if (data.itemType === 'note') {
    const note = data.note ?? ''
    const slice = sliceText(note, { offset: options.offset, limit: options.limit })
    console.log(`note       : ${note.length} characters (HTML) · showing ${slice.from}-${slice.to}`)
    if (slice.nextOffset !== null) console.log(`             next: --offset ${slice.nextOffset}`)
    console.log('---')
    console.log(slice.text)
  }
}

async function runFulltext(options) {
  const key = options.value
  const record = await readItem(key)
  let attachmentKey = options.attachment
  let source = null
  let children = []
  if (!attachmentKey) {
    if (record.itemType === 'attachment') {
      attachmentKey = key
      source = { key, contentType: record.contentType ?? '', linkMode: record.linkMode ?? '', title: record.title ?? '' }
    } else {
      children = await childrenOf(key)
      const picked = pickAttachment(children)
      if (!picked) {
        throw new Error(
          `record ${key} has no PDF, EPUB or HTML attachment to read` +
            (children.length ? ` (its ${children.length} child item(s) are none of those)` : ' (it has no children)'),
        )
      }
      attachmentKey = picked.key
      source = picked
    }
  } else {
    const attachment = await readItem(attachmentKey)
    source = {
      key: attachmentKey,
      contentType: attachment.contentType ?? '',
      linkMode: attachment.linkMode ?? '',
      title: attachment.title ?? '',
    }
  }

  const res = await localRequest('GET', `/api/users/0/items/${attachmentKey}/fulltext?format=json`)
  if (res.status === 404) {
    throw new Error(
      `the library has no indexed text for attachment ${attachmentKey}. It indexes an attachment when ` +
        'the application is open and its index drain runs; open the reference manager once and retry.',
    )
  }
  if (res.status !== 200) throw new Error(`fulltext answered ${res.status}: ${res.text.slice(0, 200)}`)
  const body = JSON.parse(res.text)
  const content = body.content ?? ''
  const others = children.filter((child) => child.key !== attachmentKey)

  if (options.json) {
    const slice = sliceText(content, { offset: options.offset, limit: options.limit })
    console.log(
      JSON.stringify(
        {
          key,
          source,
          indexedPages: body.indexedPages,
          totalPages: body.totalPages,
          characters: content.length,
          from: slice.from,
          to: slice.to,
          nextOffset: slice.nextOffset,
          text: options.grep ? undefined : slice.text,
          passages: options.grep ? findPassages(content, options.grep) : undefined,
        },
        null,
        2,
      ),
    )
    return
  }

  console.log(`item   : ${key}  "${record.title ?? ''}"`)
  console.log(`source : attachment ${source.key}  ${source.contentType || 'unknown type'}  ${source.linkMode}`)
  if (others.length > 0) {
    console.log(
      `         other children: ${others.map((child) => `${child.data?.itemType} ${child.key}${child.data?.contentType ? ` ${child.data.contentType}` : ''}`).join(' · ')}`,
    )
  }
  console.log(`text   : ${content.length} characters · ${body.indexedPages ?? '?'} of ${body.totalPages ?? '?'} indexed pages`)
  // Which rung answered, and what it can be trusted for. The line matters most when the answer is
  // EMPTY: an attachment the library never indexed reports about the index rather than about the
  // paper, and the two read identically from the text alone (protocol §6, `INV-CTX-1`).
  console.log(`rung   : (1) the library's indexed text - cheapest, and the rung that can be missing or stale.`)
  console.log(`         An empty text here is a statement about the index. tools/zotero-pdf.mjs reads the`)
  console.log(`         others: (2) the file's own text layer, (3) its table of contents, (4) the page as an image.`)

  if (options.grep) {
    const passages = findPassages(content, options.grep)
    console.log(`term   : "${options.grep}"  (case-insensitive, ${passages.length} passage(s), most 20; whitespace collapsed)`)
    if (passages.length === 0) {
      console.log('\n0 passages - the term does not occur in this attachment\'s indexed text.')
      return
    }
    console.log('')
    passages.forEach((passage, index) => console.log(`${index + 1}. @${passage.index}  ${passage.excerpt}`))
    return
  }

  const slice = sliceText(content, { offset: options.offset, limit: options.limit })
  console.log(
    `slice  : showing ${slice.total === 0 ? '0' : slice.from + 1}-${slice.to} of ${slice.total}` +
      (slice.nextOffset === null ? '   (end of text)' : `    next: --offset ${slice.nextOffset}`),
  )
  console.log(`\n${slice.text}`)
}

async function runCollections(options) {
  const { rows, total } = await paginatedJson('/api/users/0/collections?format=json&limit=200')
  const tree = buildCollectionTree(rows)
  if (options.json) {
    console.log(JSON.stringify({ total, collections: tree }, null, 2))
    return
  }
  console.log(`collections: ${total} in ${tree.length} root(s); the number after the key is its item count`)
  const walk = (nodes, depth) => {
    for (const node of nodes) {
      console.log(`${'  '.repeat(depth)}${node.key}  ${String(node.count).padStart(5)}  ${node.name}`)
      walk(node.children, depth + 1)
    }
  }
  walk(tree, 0)
}

async function runCollectionItems(options) {
  const { rows, total } = await paginatedJson(
    `/api/users/0/collections/${options.value}/items?format=json&limit=${options.limit}`,
  )
  if (options.json) {
    console.log(JSON.stringify({ collection: options.value, total, rows: rows.length, items: rows.map((row) => row.data) }, null, 2))
    return
  }
  console.log(`collection: ${options.value} · total ${total} · showing ${rows.length}`)
  if (rows.length === 0) {
    console.log('\n0 items in this collection.')
    return
  }
  console.log('')
  // Each row here is itself a member of the collection, so nothing is collapsed onto a parent: a note
  // filed in a collection is a member in its own right, and saying "unknown item" about it would be a
  // statement about this tool rather than about the library.
  rows.forEach((row, index) => {
    const data = row.data ?? {}
    const label = `[${data.itemType ?? 'unknown type'}]`
    const year = yearOf(data.date) || '????'
    const title = data.title || (data.itemType === 'note' ? '(a note - read it in the application)' : '(no title)')
    const parent = data.parentItem ? `   parent ${data.parentItem}` : ''
    console.log(`${index + 1}. ${row.key}  ${year}  ${label}  ${title}${parent}`)
  })
  // A listing that silently stops at the page size reads as "this is the collection". Measured: one
  // collection reported 34 items in the tree and the default page listed 10 of them.
  if (rows.length < total) {
    console.log('')
    console.log(
      `truncated : showing ${rows.length} of ${total} rows - the remaining ${total - rows.length} are NOT listed. ` +
        'Raise --limit, or use --screen to enumerate the whole collection.',
    )
  }
}

/**
 * Every row of one collection, paged.
 *
 * Measured 2026-10-19 against this library: `start` IS honoured (`start=5` and `start=12` answered
 * different rows), so a collection larger than one page can be enumerated rather than truncated. A
 * parent collection does NOT include its subcollections' items — asked for one whose children held
 * items, the endpoint answered total 0 — so a pass that wants a subtree has to name each collection.
 *
 * @param {string} key A collection key.
 * @returns {Promise<{rows: object[], total: number, complete: boolean}>} Rows in library order, the
 *   library's own total, and whether every one of them was read.
 */
async function collectionRows(key) {
  const rows = []
  let total = 0
  for (let start = 0; start < SCREEN_CAP; start += SCREEN_PAGE) {
    const page = await paginatedJson(
      `/api/users/0/collections/${key}/items?format=json&limit=${SCREEN_PAGE}&start=${start}`,
    )
    total = page.total
    rows.push(...page.rows)
    if (page.rows.length < SCREEN_PAGE || rows.length >= total) break
  }
  return { rows, total, complete: rows.length >= total }
}

/**
 * A collection's rows as a screening pass: every record once, with its abstract cut to a fixed length.
 *
 * A note filed in a collection is a member in its own right, so the rows arrive mixed and the pass
 * separates them rather than collapsing a note onto "its" record — a screening pass judges records, and
 * a note has no abstract to judge by.
 *
 * @param {object[]} rows Rows as the collection endpoint returns them.
 * @param {{limit?: number}} [options] Characters of abstract kept per record.
 * @returns {{records: Array<{key: string, year: string, itemType: string, title: string, excerpt: string, characters: number}>,
 *   skipped: {note: number, attachment: number}, budget: number, withAbstract: number}} The records in
 *   library order, what was skipped, the characters of abstract text the pass will print, and how many
 *   records carry one.
 */
export function screenRows(rows, { limit = DEFAULT_SCREEN_LIMIT } = {}) {
  const skipped = { note: 0, attachment: 0 }
  const records = []
  for (const row of rows) {
    const data = row.data ?? {}
    const type = data.itemType
    if (type === 'note' || type === 'attachment') {
      skipped[type] += 1
      continue
    }
    const abstract = visibleText(data.abstractNote ?? '')
    const excerpt = abstract.length > limit ? `${abstract.slice(0, limit)}…` : abstract
    records.push({
      key: row.key,
      year: yearOf(data.date) || '????',
      itemType: type ?? 'unknown',
      title: data.title || '(no title)',
      excerpt,
      characters: excerpt.length,
    })
  }
  return {
    records,
    skipped,
    budget: records.reduce((sum, record) => sum + record.characters, 0),
    withAbstract: records.filter((record) => record.excerpt !== '').length,
  }
}

/**
 * One collection as a screening pass: every record once, with its abstract cut to a fixed length.
 *
 * The pass says what it read and what it skipped, and claims nothing about an attachment: whether a
 * record has readable text needs its children, which is the reading round's errand, not this one's.
 */
async function runCollectionScreening(options) {
  const { rows, total, complete } = await collectionRows(options.value)
  const name = await readCollection(options.value)
    .then((data) => data?.name ?? '')
    .catch(() => '')
  const { records, skipped, budget, withAbstract } = screenRows(rows, { limit: options.screenLimit })

  if (options.json) {
    console.log(
      JSON.stringify(
        {
          collection: { key: options.value, name },
          total,
          rows: rows.length,
          complete,
          skipped,
          budget,
          records,
        },
        null,
        2,
      ),
    )
    return
  }

  console.log(
    `collection : ${options.value}  "${name}"  · total ${total} rows · showing 1-${rows.length}` +
      (complete ? '' : '   INCOMPLETE'),
  )
  console.log(
    `records    : ${records.length} of ${rows.length} rows are records; ${skipped.note} note(s), ${skipped.attachment} attachment(s) skipped`,
  )
  console.log(`abstracts  : ${withAbstract}/${records.length} have one`)
  console.log(`budget     : ~${budget.toLocaleString('en-US')} characters of abstract text`)
  if (!complete) {
    console.log(
      `incomplete : the pass stopped at ${rows.length} of ${total} rows (cap ${SCREEN_CAP}); this is NOT the whole collection`,
    )
  }
  if (records.length === 0) {
    console.log('\n0 records in this collection.')
    return
  }
  console.log('')
  records.forEach((record, index) => {
    console.log(
      `${String(index + 1).padStart(2)}. ${record.key}  ${record.year}  ${record.itemType}  ${record.title}`,
    )
    console.log(`    abs: ${record.excerpt || '(no abstract)'}`)
  })
  console.log('')
  console.log(
    'not claimed : whether a record has a readable attachment - that needs its children, which this pass does not read.',
  )
}

async function runTags(options) {
  const { rows, total } = await paginatedJson('/api/users/0/tags?format=json&limit=100')
  const tags = rows.map((row) => ({
    tag: row.tag,
    count: row.meta?.numItems ?? 0,
    automatic: row.meta?.type === 1,
  }))
  if (options.json) {
    console.log(JSON.stringify({ total, tags }, null, 2))
    return
  }
  console.log(`tags    : ${total} in the library, showing ${tags.length}, most used first`)
  for (const entry of [...tags].sort((a, b) => b.count - a.count)) {
    console.log(`${String(entry.count).padStart(5)}  ${entry.automatic ? '[auto]' : '      '} ${entry.tag}`)
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  await printIdentity()
  const modes = {
    search: runSearch,
    item: runItem,
    fulltext: runFulltext,
    collections: runCollections,
    collection: options.screen ? runCollectionScreening : runCollectionItems,
    tags: runTags,
  }
  await modes[options.mode](options)
}

// NOT `await main()`. This module is a command, and the self-test imports its pure functions; a
// pending top-level await here would leave an importable module mid-evaluation.
const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  main().catch((error) => {
    if (error instanceof UsageError) {
      console.error(`${error.message}\n${USAGE}`)
      process.exit(2)
    }
    console.error(`\nERROR: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
