#!/usr/bin/env node
// One place for the reference library's local API: the transport, the write gate, and plain reads.
//
// WHY THIS FILE EXISTS
//
// Three tools talk to this API today (add an item, convert stored PDFs into linked files, and read or
// search the library), and two more are planned (a note writer, and a collection/field editor). The
// transport and - above all - the WRITE GATE were duplicated in each tool: authorize, carry the
// single-use key, send the per-write token. That gate is what the contract's per-write authorization
// rule rests on, so five copies of it would be five places to drift apart.
//
// TRANSPORT, and why this is not `fetch`: the local API answers HTTP/1.0, and an authorization request
// BLOCKS until the owner answers a dialog in the reference manager. `fetch` aborts that on its default
// headers timeout and reports the whole thing as a bare "fetch failed". These calls therefore use
// node:http with NO timeout - a request that legitimately waits for a human must not be given one.
//
// Reads need no authorization. Every write does, and the key Zotero hands back is spent by its first
// successful write. "Always Allow" is the owner's choice in that dialog, and when they make it the
// gate reuses the key for the REST OF THIS RUN only, saying so through `onAuthorized`; nothing is ever
// stored, so the next run asks again.

import { randomUUID } from 'node:crypto'
import { request } from 'node:http'

const HOST = '127.0.0.1'
const PORT = 23119

/**
 * One request to the local API.
 *
 * @param {string} method HTTP method.
 * @param {string} path Path beginning with `/api/`.
 * @param {{body?: string, headers?: Record<string, string>}} [options] A body is sent verbatim.
 * @returns {Promise<{status: number, headers: object, text: string}>} The response, unparsed.
 */
export function localRequest(method, path, { body, headers = {} } = {}) {
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

/**
 * A read whose body is JSON.
 *
 * @param {string} path Path beginning with `/api/`.
 * @returns {Promise<any>} The parsed body.
 * @throws {Error} When the API did not answer 200, naming the status instead of a parse failure.
 */
export async function getJson(path) {
  const res = await localRequest('GET', path)
  if (res.status !== 200) throw new Error(`${path} answered ${res.status}: ${res.text.slice(0, 200)}`)
  return JSON.parse(res.text)
}

/**
 * Identify the library. Every write must carry this server id, and it is also how a tool reports which
 * reference manager it is talking to.
 *
 * @returns {Promise<{id: string, version: string}>} The server id and the application version.
 * @throws {Error} When the API is unreachable or too old to expose a server id.
 */
export async function serverInfo() {
  const res = await localRequest('GET', '/api/')
  if (res.status !== 200) {
    throw new Error(`the local API answered ${res.status} - is it enabled in Settings, Advanced?`)
  }
  const id = res.headers['zotero-server-id']
  if (!id) throw new Error('no Zotero-Server-ID header: writes need Zotero 10 or newer')
  return { id, version: res.headers['x-zotero-version'] ?? '?' }
}

/**
 * One item's `data` object.
 *
 * @param {string} key An 8-character item key.
 * @returns {Promise<object>} The item data.
 */
export async function readItem(key) {
  return (await getJson(`/api/users/0/items/${key}`)).data
}

/**
 * One item's child items - attachments, notes, annotations.
 *
 * @param {string} key An 8-character item key.
 * @returns {Promise<object[]>} The children, as the API returns them.
 */
export async function childrenOf(key) {
  return getJson(`/api/users/0/items/${key}/children?format=json`)
}

/**
 * `collections` is a bare string when there is one and an array when there are several.
 *
 * Every falsy value means "none": the library does not omit the field, it answers `false` for a
 * collection at the root, and `''`/`[]`/`null` appear in other shapes. Returning `[false]` for that
 * would make "no parent" compare unequal to itself.
 *
 * @param {string|string[]|false|null|undefined} value The field as the library returns it.
 * @returns {string[]} Always an array of keys.
 */
export function normalizeCollections(value) {
  if (!value) return []
  return Array.isArray(value) ? [...value] : [value]
}

/**
 * `tags` arrives as `[{tag}]` on a record and as plain strings in some shapes.
 *
 * @param {Array<object|string>|undefined} value The field as the library returns it.
 * @returns {string[]} The tag names, with nameless entries dropped rather than printed blank.
 */
export function normalizeTags(value) {
  if (!Array.isArray(value)) return []
  return value.map((tag) => (typeof tag === 'string' ? tag : (tag?.tag ?? ''))).filter(Boolean)
}

/**
 * One collection's `data`.
 *
 * @param {string} key An 8-character collection key.
 * @returns {Promise<object>} The collection data - `name`, `parentCollection`, `version`.
 */
export async function readCollection(key) {
  return (await getJson(`/api/users/0/collections/${key}`)).data
}

/**
 * Whether the library accepted a write.
 *
 * ANY 2xx is acceptance. A `PATCH` answers **204 No Content** when it succeeds - measured on the first
 * real write this preset ever made, 2026-10-15 - and treating 200 as the only success reported a
 * completed write as "the library refused it", which is the worst thing a write tool can say: a false
 * statement about whether the owner's library changed. A success therefore carries no body and the
 * read-back is what proves what happened.
 *
 * @param {number} status The HTTP status the library answered with.
 * @returns {boolean} True for 2xx.
 */
export function isWriteAccepted(status) {
  return status >= 200 && status < 300
}

/**
 * Read, refuse a stale change, patch, read back.
 *
 * The staleness check is OURS rather than the library's: the change is refused when the record's
 * version moved between the read the plan was built from and the write, so an edit made in the
 * application while this ran is never overwritten. The version precondition is still sent as a second
 * line of defence - a 412 re-reads and reports a conflict only when the version really did move,
 * because in local mode the library overloads 401/412/428 and a 412 is not by itself proof that
 * someone else edited the record.
 *
 * One call makes at most one write.
 *
 * @param {{gate: object, path: string, readCurrent: () => Promise<object>, patch: object, apply: boolean}} options
 * @returns {Promise<{applied: boolean, conflict: boolean, status: number, detail: string, before: object, after: object|null}>}
 *   `before` is what the plan was built from; on a conflict it is re-read and holds the library's
 *   current state. `detail` carries the library's own words when it refused the write.
 */
async function applyPatch({ gate, path, readCurrent, patch, apply }) {
  const before = await readCurrent()
  if (!apply) return { applied: false, conflict: false, status: 0, detail: '', before, after: null }
  const fresh = await readCurrent()
  if (fresh.version !== before.version) {
    return { applied: false, conflict: true, status: 0, detail: '', before: fresh, after: null }
  }
  const res = await gate.write('PATCH', path, patch, { 'If-Unmodified-Since-Version': String(fresh.version) })
  if (res.status === 412) {
    const current = await readCurrent()
    return {
      applied: false,
      conflict: current.version !== fresh.version,
      status: 412,
      detail: res.text.slice(0, 300),
      before: current,
      after: null,
    }
  }
  if (!isWriteAccepted(res.status)) {
    return { applied: false, conflict: false, status: res.status, detail: res.text.slice(0, 300), before: fresh, after: null }
  }
  return { applied: true, conflict: false, status: res.status, detail: '', before, after: await readCurrent() }
}

/** One version-guarded change to one item. */
export async function patchItem({ gate, key, patch, apply }) {
  return applyPatch({ gate, path: `/api/users/0/items/${key}`, readCurrent: () => readItem(key), patch, apply })
}

/** One version-guarded change to one collection. */
export async function patchCollection({ gate, key, patch, apply }) {
  return applyPatch({ gate, path: `/api/users/0/collections/${key}`, readCurrent: () => readCollection(key), patch, apply })
}

/**
 * The per-run write gate.
 *
 * `open()` must be called first: the server id it returns is carried by every write, and a write
 * without it is refused by the reference manager.
 *
 * @param {{appName: string, onAuthorized?: (info: {remember: boolean}) => void}} options `appName` is
 *   what the owner sees in the authorization dialog, so it should name the tool that asked.
 * @returns {{open: () => Promise<{id: string, version: string}>, write: (method: string, path: string, body?: any, extraHeaders?: object) => Promise<{status: number, headers: object, text: string}>}}
 */
export function createWriteGate({ appName, onAuthorized }) {
  let serverId = null
  let rememberedKey = null

  async function authorize() {
    const res = await localRequest('POST', '/api/local/authorize', {
      body: JSON.stringify({ appName }),
      headers: { 'Content-Type': 'application/json', 'Zotero-Server-ID': serverId },
    })
    if (res.status === 403) throw new Error('the authorization dialog was declined in the reference manager')
    if (res.status === 429) throw new Error('too many authorization dialogs (limit 5/min) - wait a minute')
    if (res.status === 428) throw new Error('the reference manager wants a Zotero-Server-ID header on this write')
    if (res.status === 401) throw new Error('unauthorized: the key was rejected')
    if (res.status !== 200) throw new Error(`authorize answered ${res.status}: ${res.text.slice(0, 200)}`)
    const body = JSON.parse(res.text)
    if (!body.key) throw new Error('authorize returned no key')
    if (body.remember) rememberedKey = body.key
    onAuthorized?.({ remember: Boolean(body.remember) })
    return body.key
  }

  return {
    async open() {
      const info = await serverInfo()
      serverId = info.id
      return info
    },

    /**
     * One authorized write. A single-use key is spent by its first successful write, so a 401 is
     * answered by authorizing again and retrying - unless the owner chose Always Allow, whose key is
     * reusable and whose failure is therefore a real failure.
     */
    async write(method, path, body, extraHeaders = {}) {
      if (!serverId) throw new Error('the write gate was not opened: call open() before writing')
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
        if (res.status === 401 && !rememberedKey) continue
        return res
      }
      throw new Error('the write failed even after re-authorizing')
    },
  }
}
