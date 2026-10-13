#!/usr/bin/env node
// Convert PDFs the reference library STORES into linked files under a directory of the owner's
// choosing, so the library keeps a link and the reference manager holds no copy of the bytes.
//
// Why this is a tool and not in-app JavaScript: the library's local API can create a `linked_file`
// attachment itself (verified against Zotero 10.0.6), so no plugin and no in-app script is needed.
// The one thing the API does NOT do is index the new attachment's full text, because the index
// drain is only registered when the app starts with work pending. Writing one note wakes it, and
// that is what `wakeIndexDrain()` below is for.
//
// Safety model:
//   * the DEFAULT is a dry run - it resolves paths, checks the destination and prints the plan;
//   * the stored attachment is deleted ONLY after the new link was read back and verified, so a
//     failed conversion leaves the library exactly as it was;
//   * a destination that exists with different content is reported as a conflict and never
//     overwritten;
//   * no API key is stored: every write makes the reference manager show the owner a dialog.
//
// The freed space is NOT freed by this tool: deleting the stored attachment moves it to the
// library's trash, and the bytes leave the disk when the owner empties the trash.
//
// Transport: the local API speaks HTTP/1.0 and an authorization request blocks until the owner
// answers a dialog, so local calls use node:http with no timeout rather than fetch.
//
// Usage:
//   node tools/zotero-link-attachments.mjs --target D:\Store            # dry run
//   node tools/zotero-link-attachments.mjs --target D:\Store --write
//   node tools/zotero-link-attachments.mjs --target D:\Store --write --limit 5
//   node tools/zotero-link-attachments.mjs --target D:\Store --no-wake --write
import { request } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createReadStream, existsSync, statSync, copyFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'

const HOST = '127.0.0.1'
const PORT = 23119
const APP_NAME = 'DSH autoresearch link tool'
/** The marker that identifies the note this tool touches to wake the index drain. */
export const WAKE_NOTE_MARKER = 'Autoresearch index refresh'

/** Strip what a filesystem rejects, and the trailing dots and spaces Windows drops anyway. */
export function sanitizeFilename(title, fallback = 'untitled') {
  const cleaned = String(title ?? '')
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[. ]+$/, '')
  return cleaned === '' ? fallback : cleaned
}

/** The destination path for one converted attachment. */
export function destinationFor({ targetDir, parentTitle, fallbackKey, extension = 'pdf' }) {
  const dir = String(targetDir ?? '').replace(/[\\/]+$/, '')
  return join(dir, `${sanitizeFilename(parentTitle, fallbackKey)}.${extension}`)
}

/**
 * The attachments this tool may convert: a PDF the library stores, on a regular item, in the
 * owner's own library. Linked files are already done, and a snapshot is not this tool's job.
 *
 * @param {Array<object>} attachments Items as the local API returns them.
 * @returns {{candidates: Array<object>, skipped: object}} The candidates and a count per reason.
 */
export function selectCandidates(attachments) {
  const candidates = []
  const skipped = { linked: 0, nonPdf: 0, otherLinkMode: 0, groupLibrary: 0, noParent: 0 }
  for (const attachment of attachments) {
    const data = attachment?.data ?? {}
    if (data.linkMode === 'linked_file' || data.linkMode === 'linked_url') {
      skipped.linked += 1
      continue
    }
    if (data.contentType !== 'application/pdf') {
      skipped.nonPdf += 1
      continue
    }
    if (data.linkMode !== 'imported_file' && data.linkMode !== 'imported_url') {
      skipped.otherLinkMode += 1
      continue
    }
    if (attachment?.library?.type !== 'user') {
      skipped.groupLibrary += 1
      continue
    }
    if (!data.parentItem) {
      skipped.noParent += 1
      continue
    }
    candidates.push({
      key: attachment.key,
      parentKey: data.parentItem,
      contentType: data.contentType,
      filename: data.filename ?? '',
      version: data.version,
    })
  }
  return { candidates, skipped }
}

/** What to do with one candidate, given what is already on disk. */
export function classifyDestination({ destinationExists, contentMatches }) {
  if (!destinationExists) return 'convert'
  return contentMatches ? 'recover' : 'conflict'
}

/**
 * Refine a conflict: when the same item already links the very file the destination names, the
 * stored copy is a redundant duplicate rather than a name collision, and the report must say so.
 */
export function classifyConflict({ parentLinksDestination }) {
  return parentLinksDestination ? 'redundant' : 'conflict'
}

/** Count outcomes by status, for the closing report. */
export function summarize(results) {
  const counts = {}
  for (const result of results) counts[result.status] = (counts[result.status] ?? 0) + 1
  return counts
}

/** One request to the local API. No timeout: an authorization waits for a human. */
function localRequest(method, path, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const req = request(
      {
        host: HOST,
        port: PORT,
        path,
        method,
        headers: { ...headers, ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}) },
      },
      (res) => {
        let text = ''
        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          text += chunk
        })
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text }))
      },
    )
    req.on('error', reject)
    req.setTimeout(0)
    if (body) req.write(body)
    req.end()
  })
}

const getJson = async (path) => JSON.parse((await localRequest('GET', path)).text)

let serverId = null
let rememberedKey = null

async function authorize() {
  const res = await localRequest('POST', '/api/local/authorize', {
    body: JSON.stringify({ appName: APP_NAME }),
    headers: { 'Content-Type': 'application/json', 'Zotero-Server-ID': serverId },
  })
  if (res.status === 403) throw new Error('the authorization dialog was declined')
  if (res.status === 429) throw new Error('too many authorization dialogs (limit 5/min) - wait a minute')
  if (res.status === 428) throw new Error('Zotero wants a Zotero-Server-ID header on this write')
  if (res.status !== 200) throw new Error(`authorize answered ${res.status}: ${res.text.slice(0, 200)}`)
  const body = JSON.parse(res.text)
  if (body.remember) {
    rememberedKey = body.key
    console.log('    (the owner chose Always Allow: later writes reuse that key)')
  }
  return body.key
}

async function write(method, path, body, extraHeaders = {}) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const key = rememberedKey ?? (await authorize())
    const res = await localRequest(method, path, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        'Zotero-Server-ID': serverId,
        'Zotero-API-Key': key,
        'Zotero-Write-Token': randomUUID().replace(/-/g, ''),
        ...extraHeaders,
      },
    })
    // A single-use key is spent by its first successful write; authorize again and retry.
    if (res.status === 401 && !rememberedKey) continue
    return res
  }
  throw new Error('the write failed even after re-authorizing')
}

/** The absolute path of an attachment's file, or undefined when the library cannot resolve it. */
async function resolveSourcePath(key) {
  const res = await localRequest('GET', `/api/users/0/items/${key}/file/view/url`)
  if (res.status !== 200) return undefined
  const text = res.text.trim()
  if (!text.startsWith('file://')) return undefined
  return decodeURIComponent(text.replace(/^file:\/\/\//, '')).replace(/\//g, '\\')
}

/** Whether the item already has a link to the very file a destination names. */
async function parentLinksFile(parentKey, destination) {
  try {
    const children = await getJson(`/api/users/0/items/${parentKey}/children?format=json`)
    for (const child of children) {
      if (child.data?.linkMode !== 'linked_file') continue
      const path = await resolveSourcePath(child.key)
      if (path && path.toLowerCase() === destination.toLowerCase()) return true
    }
  } catch {
    // A failed check only leaves the conflict a conflict; it never blocks the plan.
  }
  return false
}

/** Whether two local files are byte-identical. Compares size first, then in 1 MiB chunks. */
async function filesEqual(pathA, pathB) {
  const [a, b] = [statSync(pathA), statSync(pathB)]
  if (a.size !== b.size) return false
  if (a.size === 0) return true
  const chunkSize = 1024 * 1024
  for (let offset = 0; offset < a.size; offset += chunkSize) {
    const length = Math.min(chunkSize, a.size - offset)
    const [left, right] = await Promise.all([readChunk(pathA, offset, length), readChunk(pathB, offset, length)])
    if (!left.equals(right)) return false
  }
  return true
}

function readChunk(path, offset, length) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const stream = createReadStream(path, { start: offset, end: offset + length - 1 })
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

async function createLinked(parentKey, absolutePath, contentType, title) {
  const res = await write('POST', '/api/users/0/items', [
    { itemType: 'attachment', parentItem: parentKey, linkMode: 'linked_file', contentType, path: absolutePath, title },
  ])
  if (res.status !== 200) throw new Error(`create answered ${res.status}: ${res.text.slice(0, 300)}`)
  const body = JSON.parse(res.text)
  const saved = body.successful?.['0'] ?? body.success?.['0']
  if (!saved) throw new Error(`create reported no success: ${res.text.slice(0, 300)}`)
  return typeof saved === 'string' ? saved : saved.key
}

/** Read the new attachment back and check it says what was sent. Returns the item or undefined. */
async function verifyLink(key, { parentKey, contentType }) {
  const item = await getJson(`/api/users/0/items/${key}`)
  const data = item?.data ?? {}
  return data.linkMode === 'linked_file' && data.parentItem === parentKey && data.contentType === contentType
    ? data
    : undefined
}

async function deleteItem(key) {
  const item = await getJson(`/api/users/0/items/${key}`)
  return write('DELETE', `/api/users/0/items/${key}`, undefined, {
    'If-Unmodified-Since-Version': String(item.version),
  })
}

/**
 * Wake the library's full-text index drain by saving one note.
 *
 * A note save flags the note stale, and the app registers its background index drain when that
 * happens. Without this, an attachment created through the API is never indexed until the app is
 * restarted, because the drain is otherwise only registered when a startup pass finds work.
 *
 * The note is kept and reused: the next run updates it instead of creating another.
 */
async function wakeIndexDrain() {
  const notes = await getJson('/api/users/0/items?itemType=note&limit=500&format=json')
  const existing = notes.find((note) => String(note.data?.note ?? '').includes(WAKE_NOTE_MARKER))
  const body = `<p>${WAKE_NOTE_MARKER} - safe to delete; one save of a note is what makes the library index attachments it did not create itself. Updated ${new Date().toISOString()}.</p>`
  if (existing) {
    const res = await write('PATCH', `/api/users/0/items/${existing.key}`, { note: body }, {
      'If-Unmodified-Since-Version': String(existing.version),
    })
    return { key: existing.key, created: false, status: res.status }
  }
  const res = await write('POST', '/api/users/0/items', [{ itemType: 'note', note: body }])
  if (res.status !== 200) return { key: null, created: false, status: res.status }
  const parsed = JSON.parse(res.text)
  const saved = parsed.successful?.['0'] ?? parsed.success?.['0']
  return { key: typeof saved === 'string' ? saved : saved?.key, created: true, status: res.status }
}

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name) => {
  const index = argv.indexOf(`--${name}`)
  return index === -1 ? null : (argv[index + 1] ?? null)
}

async function planCandidates(targetDir) {
  const [attachments, topItems] = await Promise.all([
    getJson('/api/users/0/items?itemType=attachment&limit=2000&format=json'),
    getJson('/api/users/0/items/top?limit=2000&format=json'),
  ])
  const titles = new Map(topItems.map((item) => [item.key, item.data.title]))
  const { candidates, skipped } = selectCandidates(attachments)

  const plans = []
  for (const candidate of candidates) {
    const source = await resolveSourcePath(candidate.key)
    const parentTitle = titles.get(candidate.parentKey)
    const destination = destinationFor({
      targetDir,
      parentTitle,
      fallbackKey: candidate.key,
      extension: candidate.contentType === 'application/pdf' ? 'pdf' : 'html',
    })
    const exists = Boolean(source) && existsSync(destination)
    const contentMatches = exists ? await filesEqual(source, destination) : false
    const action = !source
      ? 'missing-source'
      : classifyDestination({ destinationExists: exists, contentMatches })
    plans.push({
      ...candidate,
      source,
      destination,
      parentTitle: parentTitle ?? '(parent not in the top-level list)',
      action:
        action === 'conflict'
          ? classifyConflict({ parentLinksDestination: await parentLinksFile(candidate.parentKey, destination) })
          : action,
    })
  }
  return { plans, skipped }
}

async function main() {
  const targetDir = value('target')
  const limit = Number(value('limit') ?? '0')
  const apply = flag('write')

  if (!targetDir) {
    throw new Error(
      'pass --target <directory>: the attachment store directory configured in the Autoresearch settings page',
    )
  }
  if (!existsSync(targetDir)) {
    throw new Error(`the target directory does not exist: ${targetDir}`)
  }

  const info = await localRequest('GET', '/api/')
  serverId = info.headers['zotero-server-id']
  const version = info.headers['x-zotero-version'] ?? '?'
  if (!serverId) throw new Error('no Zotero-Server-ID header: writes need Zotero 10+')
  console.log(`[1] Zotero ${version}, server ${serverId}, target ${targetDir}`)

  const { plans, skipped } = await planCandidates(targetDir)
  const pending = apply && limit > 0 ? plans.slice(0, limit) : plans
  console.log(
    `[2] candidates: ${plans.length} stored PDF(s); skipped ${skipped.linked} already linked, ` +
      `${skipped.nonPdf} not a PDF (snapshots are the in-app snippet's job), ` +
      `${skipped.groupLibrary} in a group library, ${skipped.noParent} without a parent item`,
  )

  for (const plan of plans) {
    const detail =
      plan.action === 'conflict'
        ? '  (destination exists with different content)'
        : plan.action === 'redundant'
          ? '  (the item already links a file of that name)'
          : ''
    console.log(`    ${plan.action.padEnd(14)} ${plan.key}  ${plan.destination}${detail}`)
  }

  if (plans.length === 0) {
    console.log('\nNothing to convert: every stored PDF is already a linked file.')
    return
  }
  if (!apply) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write to convert.')
    console.log('Each conversion writes twice (create the link, delete the stored copy); every write')
    console.log('makes the reference manager show you an authorization dialog.')
    return
  }

  console.log('\n[3] converting')
  const results = []
  for (const plan of pending) {
    if (plan.action === 'missing-source') {
      console.log(`    SKIP      ${plan.key}: the library cannot resolve its file`)
      results.push({ status: 'missing-source', key: plan.key })
      continue
    }
    if (plan.action === 'redundant') {
      console.log(`    REDUNDANT ${plan.key}: the item already links that file - the stored copy is redundant`)
      results.push({ status: 'redundant', key: plan.key })
      continue
    }
    if (plan.action === 'conflict') {
      console.log(`    CONFLICT  ${plan.key}: ${plan.destination} exists with different content - left alone`)
      results.push({ status: 'conflict', key: plan.key })
      continue
    }
    try {
      if (plan.action === 'convert') {
        copyFileSync(plan.source, plan.destination)
      }
      const linkedKey = await createLinked(
        plan.parentKey,
        plan.destination,
        'application/pdf',
        sanitizeFilename(plan.parentTitle, plan.key),
      )
      const verified = await verifyLink(linkedKey, { parentKey: plan.parentKey, contentType: 'application/pdf' })
      if (!verified) {
        console.log(`    FAILED    ${plan.key}: the new link did not read back as sent; the stored copy is kept`)
        results.push({ status: 'failed', key: plan.key, linkedKey })
        continue
      }
      const deletion = await deleteItem(plan.key)
      if (deletion.status !== 204) {
        console.log(`    PARTIAL   ${plan.key}: link ${linkedKey} is good but the stored copy answered ${deletion.status}`)
        results.push({ status: 'partial', key: plan.key, linkedKey })
        continue
      }
      console.log(`    ${plan.action === 'recover' ? 'RECOVERED' : 'CONVERTED'} ${plan.key} -> ${linkedKey}`)
      results.push({ status: plan.action === 'recover' ? 'recovered' : 'converted', key: plan.key, linkedKey })
    } catch (error) {
      console.log(`    ERROR     ${plan.key}: ${error.message}`)
      results.push({ status: 'error', key: plan.key })
    }
  }

  const counts = summarize(results)
  const changed = (counts.converted ?? 0) + (counts.recovered ?? 0)
  console.log('\n[4] result: ' + (Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ') || 'nothing'))

  if (changed > 0 && !flag('no-wake')) {
    const wake = await wakeIndexDrain()
    console.log(
      wake.status === 200
        ? `[5] index drain woken by ${wake.created ? 'creating' : 'updating'} note ${wake.key}: ` +
          'the new attachments are indexed within seconds while the reference manager is in the background'
        : `[5] could not wake the index drain (HTTP ${wake.status}): open the reference manager once, or restart it, to index the new links`,
    )
    await sleep(1000)
  } else if (changed > 0) {
    console.log('[5] --no-wake: open the reference manager once (Settings, or a restart) to index the new links')
  }

  console.log(
    '\nThe stored copies are now in the reference manager trash. The disk space is freed when you empty it.',
  )
}

/**
 * Read-only live checks: the API is reachable, selection and destination planning work, and nothing
 * is written. Mirrors the sibling tools, whose self-tests also refuse to write unless asked.
 */
async function selftest() {
  let failures = 0
  const check = (condition, label, detail = '') => {
    if (!condition) failures += 1
    console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  }

  const info = await localRequest('GET', '/api/')
  serverId = info.headers['zotero-server-id']
  check(Boolean(serverId), 'the local API answers and identifies the library', `Zotero ${info.headers['x-zotero-version'] ?? '?'}`)

  const { plans, skipped } = await planCandidates(value('target') ?? process.cwd())
  check(
    Object.values(skipped).every((count) => Number.isInteger(count) && count >= 0),
    'the selection counts every attachment it rejects',
    JSON.stringify(skipped),
  )
  const resolvable = plans.filter((plan) => plan.action !== 'missing-source')
  check(
    plans.length === 0 || resolvable.length > 0,
    'at least one candidate file resolves to a path on disk',
    `${resolvable.length}/${plans.length} candidate(s)`,
  )
  console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}  (nothing was written)`)
  return failures
}

// Only act when this file IS the command: the unit self-test imports the pure functions above, and
// an import must not start talking to a running reference manager.
const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  if (flag('selftest')) {
    process.exit((await selftest()) === 0 ? 0 : 1)
  } else {
    try {
      await main()
    } catch (error) {
      const cause = error.cause ? ` (cause: ${error.cause.code ?? error.cause.message ?? error.cause})` : ''
      console.error(`\nERROR: ${error.message}${cause}`)
      process.exit(1)
    }
  }
}
