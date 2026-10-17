#!/usr/bin/env node
// One place for the reference library's local API: the transport, the write gate, plain reads, and the
// one definition of a note body's visible text, which is what a note write is compared against.
//
// WHY THIS FILE EXISTS
//
// Seven helpers talk to this API (add an item, read or search the library, write a digest note, write a
// section note, edit fields and tags, file a collection, and turn stored PDFs into linked files). The
// transport and - above all - the WRITE GATE were duplicated in each tool: authorize, carry the
// key, send the per-write token. That gate is what the contract's authorization rule rests on, so
// seven copies of it would be seven places to drift apart. The same argument holds for
// {@link visibleText}: two note tools compare what the library stored against what they sent, and two
// definitions of "the same text" would let one of them call a delivered note undelivered.
//
// TRANSPORT, and why this is not `fetch`: the local API answers HTTP/1.0, and an authorization request
// BLOCKS until the owner answers a dialog in the reference manager. `fetch` aborts that on its default
// headers timeout and reports the whole thing as a bare "fetch failed". These calls therefore use
// node:http with NO timeout - a request that legitimately waits for a human must not be given one.
//
// Reads need no authorization. Every write does, and the dialog that grants one is raised on EVERY
// request for a key: the local API has no "this application is already trusted" path, so the owner's
// "Always Allow" answer chooses the KIND of key issued and never whether they are asked again. What
// ends the asking is keeping the lasting key, which is what the grant store below does. "Allow" covers
// exactly one write and is never written down; a lasting grant is dropped the moment the library
// rejects it, because the owner revokes grants in the reference manager and a revocation arrives as a
// 401 rather than as a notification.

import { randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { request } from 'node:http'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

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
 * The text a reader sees: tags and comments removed, whitespace collapsed.
 *
 * A note body is **not** stored byte-for-byte as it was sent. The application rewrites a note it has
 * edited - measured: the note gained a `<div data-schema-version="9">` wrapper and LOST the invisible
 * marker comment this preset writes - so two bodies that read identically can differ byte for byte,
 * and comparing bytes reports a mismatch on a write that in fact landed. That false alarm about the
 * owner's library is what every note comparison here exists to avoid. The definition lives in one
 * place because two note tools compare stored text against sent text, and two definitions of "the
 * same text" would let one of them call a delivered note undelivered.
 *
 * @param {string} html Note body as the library stores it.
 * @returns {string} Its visible text.
 */
export function visibleText(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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
 * What the owner sees in the authorization dialog. ONE name for every helper, because the grant is
 * kept per library rather than per tool: whichever helper happened to ask first would otherwise be
 * the only name the owner ever saw, which would say less than the truth.
 */
export const APP_NAME = 'DSH autoresearch preset'

/**
 * Where a lasting grant is kept.
 *
 * @returns {string} The absolute path of the grant file, overridable for a test or a second profile.
 */
export function grantFilePath() {
  const override = String(process.env.ZOTERO_LOCAL_KEY_STORE ?? '').trim()
  if (override !== '') return override
  const base =
    process.platform === 'win32'
      ? (process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'))
      : (process.env.XDG_CONFIG_HOME ?? join(homedir(), '.config'))
  return join(base, 'dsh-autoresearch', 'zotero-local-api-key.json')
}

/** A store holding no grants. Also what an unreadable or unrecognised file reads as. */
export function emptyGrantStore() {
  return { version: 1, grants: {} }
}

/**
 * Parse a grant file. A corrupt file, an unknown version or a malformed entry all mean "no grant
 * kept": the owner is asked again, which is the only safe direction for a credential.
 *
 * @param {string} text The file's contents, as read.
 * @returns {object} The store, with only the entries that carry a usable key.
 */
export function parseGrantStore(text) {
  try {
    const data = JSON.parse(text)
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.version !== 1) return emptyGrantStore()
    const grants = {}
    for (const [serverId, entry] of Object.entries(data.grants ?? {})) {
      if (typeof entry?.key !== 'string' || entry.key === '') continue
      grants[serverId] = {
        key: entry.key,
        appName: String(entry.appName ?? ''),
        createdAt: String(entry.createdAt ?? ''),
      }
    }
    return { version: 1, grants }
  } catch {
    return emptyGrantStore()
  }
}

/**
 * The grant kept for one library, or null.
 *
 * Partitioned by server id because a key means nothing to the instance that did not issue it: the
 * same address pointed at a different data directory must produce a fresh dialog rather than a
 * string of incomprehensible 401s.
 *
 * @param {object} store A parsed grant store.
 * @param {string} serverId The `Zotero-Server-ID` the grant was issued by.
 * @returns {string|null} The key, or null when this library has no grant on file.
 */
export function keptGrant(store, serverId) {
  return store?.grants?.[serverId]?.key ?? null
}

/**
 * The store with one library's grant recorded. Pure: returns a new store.
 *
 * @param {object} store A parsed grant store.
 * @param {string} serverId The instance the grant belongs to.
 * @param {{key: string, appName: string, createdAt: string}} grant The grant to keep.
 * @returns {object} A new store.
 */
export function withGrant(store, serverId, grant) {
  const base = store ?? emptyGrantStore()
  return { version: 1, grants: { ...base.grants, [serverId]: { ...grant } } }
}

/**
 * The store with one library's grant dropped. Pure: returns a new store.
 *
 * @param {object} store A parsed grant store.
 * @param {string} serverId The instance whose grant is being forgotten.
 * @returns {object} A new store.
 */
export function withoutGrant(store, serverId) {
  const base = store ?? emptyGrantStore()
  const grants = { ...base.grants }
  delete grants[serverId]
  return { version: 1, grants }
}

/**
 * The grant file as a store.
 *
 * A read that fails is "no grant kept" rather than an error - the owner is simply asked again - but a
 * save that fails throws: a grant the owner believed they had given must never be lost in silence.
 *
 * @param {string} [path] The grant file; defaults to {@link grantFilePath}.
 * @returns {{load: () => object, save: (store: object) => void}} The store.
 */
export function fileGrantStore(path = grantFilePath()) {
  return {
    load() {
      try {
        return parseGrantStore(readFileSync(path, 'utf8'))
      } catch {
        return emptyGrantStore()
      }
    },
    save(store) {
      mkdirSync(dirname(path), { recursive: true })
      writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    },
  }
}

/**
 * The write gate.
 *
 * `open()` must be called first: the server id it returns is carried by every write, and a write
 * without it is refused by the reference manager.
 *
 * A grant the owner chose to make lasting is read from `store` and used without asking. "Allow" is
 * never written down and covers exactly one write. A key the library rejects is discarded, and a
 * lasting one leaves the store as well, so a grant the owner revoked in the reference manager recovers
 * by itself instead of failing forever. One `write()` raises at most two dialogs: a third could only
 * mean the library is issuing keys it then refuses.
 *
 * @param {{appName: string, store?: object, onAuthorized?: (info: {remember: boolean}) => void,
 *   onGrantDropped?: (info: {serverId: string}) => void, transport?: object}} options `appName` is
 *   what the owner sees in the dialog. `store` defaults to the grant file; `transport` is the seam the
 *   self-test replaces, and production callers pass nothing.
 * @returns {{open: () => Promise<{id: string, version: string, kept: boolean}>,
 *   write: (method: string, path: string, body?: any, extraHeaders?: object) => Promise<{status: number, headers: object, text: string}>}}
 */
export function createWriteGate({
  appName,
  store = fileGrantStore(),
  onAuthorized,
  onGrantDropped,
  transport = { serverInfo, localRequest },
}) {
  let serverId = null
  let grants = emptyGrantStore()
  let key = null
  let lasting = false

  async function authorize() {
    const res = await transport.localRequest('POST', '/api/local/authorize', {
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
    lasting = Boolean(body.remember)
    if (lasting) {
      grants = withGrant(grants, serverId, { key: body.key, appName, createdAt: new Date().toISOString() })
      store.save(grants)
    }
    onAuthorized?.({ remember: lasting })
    return body.key
  }

  /** Forget a rejected key. A lasting one leaves the store too, or every later run would retry it. */
  function dropKey() {
    if (lasting) {
      grants = withoutGrant(grants, serverId)
      store.save(grants)
      onGrantDropped?.({ serverId })
    }
    key = null
    lasting = false
  }

  return {
    async open() {
      const info = await transport.serverInfo()
      serverId = info.id
      grants = store.load()
      key = keptGrant(grants, serverId)
      lasting = key !== null
      return { ...info, kept: lasting }
    },

    /**
     * One authorized write. `Zotero-Write-Token` is fresh per attempt, and a key the library refuses
     * is dropped rather than resent: the next attempt asks the owner instead of replaying it.
     */
    async write(method, path, body, extraHeaders = {}) {
      if (!serverId) throw new Error('the write gate was not opened: call open() before writing')
      let dialogs = 0
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (key === null) {
          if (dialogs === 2) break
          dialogs += 1
          key = await authorize()
        }
        const sentLasting = lasting
        const res = await transport.localRequest(method, path, {
          body: body === undefined ? undefined : JSON.stringify(body),
          headers: {
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
            'Zotero-Server-ID': serverId,
            'Zotero-API-Key': key,
            'Zotero-Write-Token': randomUUID().replace(/-/g, ''),
            ...extraHeaders,
          },
        })
        // The library deletes a single-use key while validating the request that carried it, so it is
        // never reused - whether that request went on to succeed or not.
        if (!sentLasting) key = null
        if (res.status !== 401) return res
        dropKey()
      }
      throw new Error('the write was still refused with 401 after re-authorizing twice')
    },
  }
}
