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
