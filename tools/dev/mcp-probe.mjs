// Probe an MCP stdio server directly, without going through DSH: spawn it, run the
// initialize handshake, list its tools, then shut it down. This answers "does the
// server work and what does it expose" independently of any session.
//
// Usage:
//   node tools/dev/mcp-probe.mjs <command> [args...]
//   node tools/dev/mcp-probe.mjs uvx arxiv-mcp-server
//   $env:ZOTERO_LOCAL='true'; node tools/dev/mcp-probe.mjs uvx zotero-mcp
//
// Exit code 0 when at least one tool was listed, 1 otherwise.
import { spawn } from 'node:child_process'

// Flags go before `--`; the server command and its args go after it.
//   node tools/dev/mcp-probe.mjs --call <tool> [--args '<json>'] -- uvx zotero-mcp
// Without `--`, every argument is the server command (backwards compatible).
const argv = process.argv.slice(2)
const separator = argv.indexOf('--')
const ownArgs = separator === -1 ? [] : argv.slice(0, separator)
const serverArgv = separator === -1 ? argv : argv.slice(separator + 1)
const [command, ...args] = serverArgv
const callIndex = ownArgs.indexOf('--call')
const callName = callIndex === -1 ? null : ownArgs[callIndex + 1]
const argsIndex = ownArgs.indexOf('--args')
const callArgs = argsIndex === -1 ? null : JSON.parse(ownArgs[argsIndex + 1])
if (!command) {
  console.error('usage: node tools/dev/mcp-probe.mjs [--call <tool>] [--args <json>] -- <command> [args...]')
  process.exit(2)
}

const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'], shell: false })
const tools = []
let finished = false

const timer = setTimeout(() => finish('timeout after 120s'), 120000)

function send(message) {
  child.stdin.write(`${JSON.stringify(message)}\n`)
}

function finish(reason) {
  if (finished) return
  finished = true
  clearTimeout(timer)
  try {
    child.kill()
  } catch {
    /* already gone */
  }
  console.log(`\n--- probe finished (${reason}) ---`)
  console.log(`server: ${command} ${args.join(' ')}`)
  console.log(`tools : ${tools.length}`)
  for (const t of tools) {
    const desc = t.description ? String(t.description).replace(/\s+/g, ' ').slice(0, 88) : ''
    console.log(`  - ${t.name}${desc ? `  :: ${desc}` : ''}`)
  }
  process.exit(tools.length > 0 ? 0 : 1)
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
      continue // servers may emit non-JSON chatter; ignore it
    }
    if (message.id === 1 && message.result) {
      const info = message.result.serverInfo ?? {}
      console.log(`initialize ok: ${info.name ?? '?'} v${info.version ?? '?'} protocol=${message.result.protocolVersion ?? '?'}`)
      send({ jsonrpc: '2.0', method: 'notifications/initialized' })
      send({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} })
    } else if (message.id === 2 && message.result) {
      tools.push(...(message.result.tools ?? []))
      if (callName) {
        console.log(`\ncalling tool: ${callName} ${callArgs ? JSON.stringify(callArgs) : ''}`)
        send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: callName, arguments: callArgs ?? {} } })
      } else {
        finish('tools listed')
      }
    } else if (message.id === 3) {
      const parts = message.result?.content ?? []
      const text = parts.map((c) => c.text ?? JSON.stringify(c)).join('\n')
      console.log(`\n--- tool result (${text.length} chars${message.result?.isError ? ', isError=true' : ''}) ---`)
      console.log(text.slice(0, 1500))
      finish('tool called')
    } else if (message.error) {
      console.log(`error: ${JSON.stringify(message.error).slice(0, 200)}`)
    }
  }
})

child.stderr.on('data', (data) => {
  const text = data.toString().trim()
  if (text) console.log(`[stderr] ${text.slice(0, 200)}`)
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
    clientInfo: { name: 'dsh-mcp-probe', version: '0.1.0' },
  },
})
