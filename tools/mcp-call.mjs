// Call ONE MCP tool directly, without going through DSH, and keep its FULL result.
//
// `tools/mcp-probe.mjs` lists a server's tools and truncates a call's result to 1500 characters - fine
// for "does it answer", useless for "how many collections does it actually see", whose answer is a
// thousand-character tree. This keeps the whole result in a file and prints its size plus a head, so a
// conclusion can be quoted with a number instead of an impression.
//
// Usage:
//   node tools/mcp-call.mjs <tool> [json-args] -- <command> [args...]
//   node tools/mcp-call.mjs zotero_get_collections -- uvx --from 'zotero-mcp-server==0.14.1' zotero-mcp
//   node tools/mcp-call.mjs zotero_search_items '{"query":"seismic","limit":3}' -- uvx zotero-mcp
//   $env:ZOTERO_LOCAL='true'; node tools/mcp-call.mjs zotero_write_capabilities -- uvx --from '...' zotero-mcp
//
// The result lands in `.tmp/mcp-call-<tool>.txt` (gitignored). Exit code is 0 when the call returned.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const argv = process.argv.slice(2)
const separator = argv.indexOf('--')
const own = separator === -1 ? [] : argv.slice(0, separator)
const serverArgv = separator === -1 ? [] : argv.slice(separator + 1)
const [toolName, argsJson] = own
const [command, ...args] = serverArgv
if (!toolName || !command) {
  console.error('usage: node tools/mcp-call.mjs <tool> [json-args] -- <command> [args...]')
  process.exit(2)
}

const OUT_DIR = '.tmp'
mkdirSync(OUT_DIR, { recursive: true })

const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false })
const send = (message) => child.stdin.write(`${JSON.stringify(message)}\n`)
let finished = false
// An MCP server that has to install itself through `uvx` can take a minute on a cold cache.
const timer = setTimeout(() => finish('timeout after 180s'), 180000)

function finish(reason) {
  if (finished) return
  finished = true
  clearTimeout(timer)
  try {
    child.kill()
  } catch {
    /* already gone */
  }
  console.log(`--- finished (${reason}) ---`)
  process.exit(0)
}

let buffer = ''
child.stdout.on('data', (chunk) => {
  buffer += chunk.toString('utf8')
  let index
  while ((index = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, index).trim()
    buffer = buffer.slice(index + 1)
    if (!line) continue
    let message
    try {
      message = JSON.parse(line)
    } catch {
      continue // servers may emit non-JSON chatter on stdout; ignore it
    }
    if (message.id === 1 && message.result) {
      send({ jsonrpc: '2.0', method: 'notifications/initialized' })
      send({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: toolName, arguments: argsJson ? JSON.parse(argsJson) : {} },
      })
    } else if (message.id === 2) {
      const text = (message.result?.content ?? []).map((part) => part.text ?? JSON.stringify(part)).join('\n')
      const file = `${OUT_DIR}/mcp-call-${toolName.replace(/[^a-z0-9_]+/gi, '-')}.txt`
      writeFileSync(file, text, 'utf8')
      console.log(`tool    : ${toolName} ${argsJson ?? ''}`)
      console.log(`isError : ${message.result?.isError === true}`)
      console.log(`chars   : ${text.length}`)
      console.log(`saved   : ${file}`)
      console.log(`--- head ---\n${text.slice(0, 600)}`)
      finish('called')
    } else if (message.error) {
      console.log(`rpc error: ${JSON.stringify(message.error).slice(0, 300)}`)
    }
  }
})
child.stderr.on('data', () => {
  // Servers print decorative banners here. DSH reads stdout, so this is noise, not a failure.
})
child.on('error', (error) => {
  console.log(`spawn failed: ${error.message}`)
  finish('spawn error')
})

send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'dsh-mcp-call', version: '0.1.0' },
  },
})
