// Measure what an MCP server's tool schema costs, and see which server version answered.
//
// This is the number that decides whether a server is worth mounting in a preset: every tool it
// registers is sent to the model on every request, so its `tools/list` payload is a fixed tax. Tool
// NAMES are not the finding - `tools/mcp-probe.mjs` already reports those - the payload is.
//
// It exists because an upstream README is not a measurement. The reference-library server advertises
// "38 tools, 13,448 tokens"; the pinned 0.14.1 answers with 41 tools and a 67,743-character payload.
// Re-run this after any version change to see the drift instead of arguing about it.
//
// Usage:
//   node tools/mcp-toolsize.mjs -- uvx arxiv-mcp-server
//   $env:ZOTERO_LOCAL='true'; node tools/mcp-toolsize.mjs -- uvx --from 'zotero-mcp-server==0.14.1' zotero-mcp
//   $env:ZOTERO_MCP_TOOLSETS='none'; node tools/mcp-toolsize.mjs -- uvx --from '...' zotero-mcp
//
// The raw payload is written to `.tmp/mcp-toolsize-<command>.json` (gitignored) so a claim about the
// tool surface can be re-checked without re-running the server.
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const argv = process.argv.slice(2)
const separator = argv.indexOf('--')
const serverArgv = separator === -1 ? argv : argv.slice(separator + 1)
const [command, ...args] = serverArgv
if (!command) {
  console.error('usage: node tools/mcp-toolsize.mjs -- <command> [args...]')
  process.exit(2)
}

const OUT_DIR = '.tmp'
mkdirSync(OUT_DIR, { recursive: true })

const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false })
const send = (message) => child.stdin.write(`${JSON.stringify(message)}\n`)
let finished = false
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

/** A file-safe stem for the command, so two servers never overwrite each other's payload. */
function fileStem(command) {
  return command.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
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
      continue
    }
    if (message.id === 1 && message.result) {
      const info = message.result.serverInfo ?? {}
      console.log(`initialize ok: ${info.name ?? '?'} v${info.version ?? '?'}`)
      send({ jsonrpc: '2.0', method: 'notifications/initialized' })
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    } else if (message.id === 2 && message.result) {
      const tools = message.result.tools ?? []
      const raw = JSON.stringify(tools)
      const file = `${OUT_DIR}/mcp-toolsize-${fileStem(command)}.json`
      writeFileSync(file, raw, 'utf8')
      console.log(`server      : ${command} ${args.join(' ')}`)
      console.log(`tools       : ${tools.length}`)
      // 3.6 characters per token is the same rough ratio the preset's own cost note uses.
      console.log(`schema chars: ${raw.length}  (~${Math.round(raw.length / 3.6)} tokens at 3.6 chars/token)`)
      console.log(`raw payload : ${file}`)
      console.log('largest tools:')
      for (const tool of tools
        .map((entry) => ({ name: entry.name, chars: JSON.stringify(entry).length }))
        .sort((a, b) => b.chars - a.chars)
        .slice(0, 5)) {
        console.log(`  ${tool.chars}\t${tool.name}`)
      }
      console.log(`\nnames:\n${tools.map((tool) => tool.name).sort().join('\n')}`)
      finish('tools listed')
    } else if (message.error) {
      console.log(`rpc error: ${JSON.stringify(message.error).slice(0, 300)}`)
    }
  }
})
child.stderr.on('data', () => {
  // Decorative server banners; see tools/mcp-call.mjs.
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
    clientInfo: { name: 'dsh-mcp-toolsize', version: '0.1.0' },
  },
})
