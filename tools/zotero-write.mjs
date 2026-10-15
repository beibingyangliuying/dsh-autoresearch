#!/usr/bin/env node
// Add one reference to the local Zotero library through Zotero's own local API.
//
// Safety model:
//   * the DEFAULT is a dry run — it resolves metadata, builds the payload and prints it;
//   * `--write` is required to create anything;
//   * no key is written down unless the owner answers "Always Allow": the reference manager's
//     dialog is the gate, and declining it is a normal outcome rather than a bug.
//
// Transport and the write gate live in ./zotero-local-api.mjs, together with the reason these calls
// go through node:http with no timeout instead of fetch.
//
// Usage:
//   node tools/zotero-write.mjs --arxiv 1706.03762            # dry run
//   node tools/zotero-write.mjs --arxiv 1706.03762 --write
//   node tools/zotero-write.mjs --doi 10.1371/journal.pone.0171234 --write
//   node tools/zotero-write.mjs --selftest                    # no writes, checks the seams
import { APP_NAME, createWriteGate, localRequest, readItem, serverInfo } from './zotero-local-api.mjs'

// Optional polite-pool contact address for the metadata APIs. Set AUTORESEARCH_MAILTO in the
// environment, or pass --mailto <address>; without one the requests are still valid, just
// unpolite (slower, and more likely to be rate-limited).
// Declared lazily: the CLI argument helpers below are initialized after this block.
const contactAddress = () => process.env.AUTORESEARCH_MAILTO ?? value('mailto') ?? ''

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? null : (argv[i + 1] ?? null)
}
const log = (...parts) => console.log(...parts)

/** The local API has no /items/new template endpoint; ask it which fields the type accepts. */
async function emptyItem(itemType) {
  const res = await localRequest('GET', `/api/itemTypeFields?itemType=${itemType}`)
  if (res.status !== 200) throw new Error(`itemTypeFields for ${itemType} answered ${res.status}`)
  const item = { itemType, creators: [] }
  for (const field of JSON.parse(res.text)) item[field.field] = ''
  return item
}

/** Use a creator type the schema actually allows for this item type. */
async function creatorTypeFor(itemType, preferred = 'author') {
  const res = await localRequest('GET', `/api/itemTypeCreatorTypes?itemType=${itemType}`)
  if (res.status !== 200) return preferred
  const allowed = JSON.parse(res.text).map((c) => c.creatorType)
  return allowed.includes(preferred) ? preferred : (allowed[0] ?? preferred)
}

/** Split a display name into Zotero's two-field creator shape. */
function splitName(name) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return { creatorType: 'author', name: parts[0] }
  return { creatorType: 'author', firstName: parts.slice(0, -1).join(' '), lastName: parts.at(-1) }
}

async function metadataFromArxiv(arxivId) {
  const res = await fetch(`http://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`)
  if (!res.ok) throw new Error(`arXiv answered ${res.status}`)
  const xml = await res.text()
  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1]
  if (!entry) throw new Error(`no entry for arXiv id ${arxivId}`)
  const pick = (tag) =>
    entry
      .match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1]
      ?.replace(/\s+/g, ' ')
      .trim()
  const title = pick('title')
  if (!title) throw new Error('arXiv entry has no title')
  const journalRef = pick('arxiv:journal_ref')
  return {
    itemType: 'preprint',
    title,
    creators: [...entry.matchAll(/<name>([^<]+)<\/name>/g)].map((m) => splitName(m[1])),
    abstractNote: pick('summary') ?? '',
    date: (pick('published') ?? '').slice(0, 10),
    repository: 'arXiv',
    archiveID: `arXiv:${arxivId}`,
    url: `https://arxiv.org/abs/${arxivId}`,
    DOI: pick('arxiv:doi') ?? '',
    extra: journalRef ? `arXiv journal ref: ${journalRef}` : '',
  }
}

async function metadataFromCrossref(doi) {
  const contact = contactAddress() ? `?mailto=${encodeURIComponent(contactAddress())}` : ''
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}${contact}`)
  if (!res.ok) throw new Error(`Crossref answered ${res.status} for ${doi}`)
  const m = (await res.json()).message
  const date = m.issued?.['date-parts']?.[0] ?? []
  return {
    itemType: 'journalArticle',
    title: (m.title ?? [])[0] ?? '',
    creators: (m.author ?? []).map((a) =>
      a.name
        ? { creatorType: 'author', name: a.name }
        : { creatorType: 'author', firstName: a.given ?? '', lastName: a.family ?? '' },
    ),
    abstractNote: (m.abstract ?? '').replace(/<[^>]+>/g, '').trim(),
    date: date.length ? date.join('-') : '',
    publicationTitle: (m['container-title'] ?? [])[0] ?? '',
    volume: m.volume ?? '',
    issue: m.issue ?? '',
    pages: m.page ?? '',
    DOI: m.DOI ?? doi,
    url: m.URL ?? '',
    language: m.language ?? '',
    ISSN: (m.ISSN ?? []).join(', '),
  }
}

/** Copy only the fields the item type actually accepts, so no invalid field is ever sent. */
function fillTemplate(template, source) {
  const item = { ...template }
  const used = []
  const dropped = []
  for (const [key, val] of Object.entries(source)) {
    if (key === 'itemType') continue
    if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) continue
    if (key in template) {
      item[key] = val
      used.push(key)
    } else {
      dropped.push(key)
    }
  }
  return { item, used, dropped }
}

/** Create one item. The gate owns authorization, the key and the per-write token. */
async function createItem(item, gate) {
  const res = await gate.write('POST', '/api/users/0/items', [item])
  if (res.status === 401) throw new Error('401 Unauthorized — the key was rejected; run again')
  if (res.status !== 200) throw new Error(`create answered ${res.status}: ${res.text.slice(0, 300)}`)
  return JSON.parse(res.text)
}

/** Refuse to create a second copy of something already in the library. */
async function findExisting(meta) {
  const query = (meta.title || '').split(/\s+/).slice(0, 6).join(' ')
  if (!query) return null
  const res = await localRequest('GET', `/api/users/0/items?q=${encodeURIComponent(query)}&limit=25`)
  if (res.status !== 200) return null
  const hits = JSON.parse(res.text)
  if (!Array.isArray(hits)) return null
  const hit = hits.find(
    (h) =>
      h.data?.title === meta.title ||
      (meta.DOI && h.data?.DOI === meta.DOI) ||
      (meta.archiveID && h.data?.archiveID === meta.archiveID),
  )
  return hit ? { key: hit.key, title: hit.data.title } : null
}

async function resolve() {
  const arxiv = value('arxiv')
  const doi = value('doi')
  if (arxiv) return { source: `arXiv ${arxiv}`, meta: await metadataFromArxiv(arxiv) }
  if (doi) return { source: `DOI ${doi}`, meta: await metadataFromCrossref(doi) }
  throw new Error('pass --arxiv <id> or --doi <doi>')
}

/** Build the payload without writing anything. Shared by the dry run, the write and the test. */
async function buildPayload(meta) {
  const template = await emptyItem(meta.itemType)
  const creatorType = await creatorTypeFor(meta.itemType)
  const withCreators = { ...meta, creators: meta.creators.map((c) => ({ ...c, creatorType })) }
  return fillTemplate(template, withCreators)
}

async function run() {
  const gate = createWriteGate({
    appName: APP_NAME,
    onAuthorized: ({ remember }) =>
      log(
        remember
          ? '    authorized for this library: the grant is kept, so later writes need no dialog'
          : '    authorized for this one write: the key is spent by it and is not written down',
      ),
    onGrantDropped: () => log('    the kept authorization was refused (revoked in the reference manager?) — forgotten'),
  })
  const { id: serverId, version, kept } = await gate.open()
  log(`[1] Zotero ${version}, server id ${serverId}${kept ? ' — a kept authorization is on file' : ''}`)

  const { source, meta } = await resolve()
  log(`[2] ${source} -> "${meta.title}" (${meta.creators.length} creators, ${meta.date || 'no date'})`)

  const { item, used, dropped } = await buildPayload(meta)
  log(`[3] item type ${meta.itemType}: filled ${used.length} field(s): ${used.join(', ')}`)
  if (dropped.length) log(`    dropped (not valid for this type): ${dropped.join(', ')}`)

  log('[4] payload:')
  log(JSON.stringify([item], null, 2).split('\n').map((l) => `    ${l}`).join('\n'))

  const existing = await findExisting(meta)
  if (existing) log(`[!] already in the library as ${existing.key} — "${existing.title}"`)

  if (!flag('write')) {
    log('\nDRY RUN — nothing was written. Re-run with --write to create the item.')
    return
  }

  if (existing && !flag('force')) {
    log('\nREFUSING to create a duplicate. Pass --force if a second copy is really wanted.')
    return
  }

  log(
    kept
      ? '\n[5] writing under the authorization already on file — no dialog this time'
      : '\n[5] asking the reference manager for authorization — its dialog will appear',
  )
  if (!kept) log('    (this request waits for you; it has no timeout)')

  const created = await createItem(item, gate)
  // An array POST answers with the saved object; a single-object POST answers with the key.
  const saved = created.successful?.['0'] ?? created.success?.['0']
  const itemKey = typeof saved === 'string' ? saved : saved?.key
  if (!itemKey) throw new Error(`create reported no success: ${JSON.stringify(created).slice(0, 300)}`)
  log(`[6] created item ${itemKey}`)

  const back = await readItem(itemKey)
  const titleOk = back.title === item.title
  const doiOk = !item.DOI || back.DOI === item.DOI
  const creatorsOk = (back.creators ?? []).length === item.creators.length
  log(
    `[7] read-back: title ${titleOk ? 'matches' : `MISMATCH ("${back.title}")`}, ` +
      `DOI ${doiOk ? 'matches' : 'MISMATCH'}, creators ${creatorsOk ? `matches (${item.creators.length})` : 'MISMATCH'}`,
  )
  if (!titleOk || !doiOk || !creatorsOk) throw new Error('read-back does not match what was sent')
  log(`\nOK — "${back.title}" is now in the library (key ${itemKey}).`)
}

async function selftest() {
  let failures = 0
  const ok = (cond, label, detail = '') => {
    if (!cond) failures += 1
    log(`  ${cond ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  }

  log('[1] local API and server id')
  try {
    const info = await serverInfo()
    ok(Boolean(info.id), 'server id readable', `Zotero ${info.version}`)
  } catch (error) {
    ok(false, 'server id readable', error.message)
  }

  log('[2] schema: valid fields and creator types')
  for (const type of ['preprint', 'journalArticle']) {
    try {
      const t = await emptyItem(type)
      ok('title' in t && 'creators' in t, `fields for ${type}`, `${Object.keys(t).length} fields`)
      ok((await creatorTypeFor(type)) === 'author', `'author' allowed for ${type}`)
    } catch (error) {
      ok(false, `fields for ${type}`, error.message)
    }
  }

  log('[3] metadata resolvers')
  try {
    const m = await metadataFromArxiv('1706.03762')
    ok(m.title.includes('Attention'), 'arXiv resolver', m.title)
    ok(m.creators.length > 5, 'arXiv creators parsed', `${m.creators.length}`)
    ok(m.archiveID === 'arXiv:1706.03762', "archive id shaped like Zotero's own", m.archiveID)
  } catch (error) {
    ok(false, 'arXiv resolver', error.message)
  }
  try {
    const m = await metadataFromCrossref('10.1371/journal.pone.0171234')
    ok(m.title.length > 10, 'Crossref resolver', m.title.slice(0, 60))
    ok(m.creators.length > 0, 'Crossref creators parsed', `${m.creators.length}`)
  } catch (error) {
    ok(false, 'Crossref resolver', error.message)
  }

  log('[4] payload assembly (no write)')
  try {
    const meta = await metadataFromArxiv('1706.03762')
    const { item, dropped } = await buildPayload(meta)
    ok(item.title === meta.title, 'title carried into payload')
    ok(item.archiveID === 'arXiv:1706.03762', 'archiveID carried into payload')
    ok(Array.isArray(item.creators) && item.creators.length > 5, 'creators carried into payload')
    ok(dropped.length === 0, 'no field dropped for the preprint type', dropped.join(', '))
  } catch (error) {
    ok(false, 'payload assembly', error.message)
  }

  log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
  process.exit(failures === 0 ? 0 : 1)
}

try {
  if (flag('selftest')) await selftest()
  else await run()
} catch (error) {
  const cause = error.cause ? ` (cause: ${error.cause.code ?? error.cause.message ?? error.cause})` : ''
  console.error(`\nERROR: ${error.message}${cause}`)
  process.exit(1)
}
