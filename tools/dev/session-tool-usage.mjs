// What tools a preset's sessions actually called, counted by tool name.
//
// Why this exists: the preset's cost decisions rest on "what the disciplines actually call" (#29, #31),
// and a keep-list entry that no session ever calls is a claim nobody has checked. Measured 2026-10-19
// with this program, across 57 autoresearch sessions and 6,081 tool calls: the seventeen `mnemon_*`
// tools answered 88 calls (1.4%) from six of them. That is why the keep-list keeps the NAMESPACE rather
// than a stock-take of names (docs/decisions.md #54) - and why the number has to be re-measurable
// instead of quoted from a scratch pad.
//
// Usage:
//   node tools/dev/session-tool-usage.mjs [--preset <substring>] [--prefix <tool-prefix>] [--top N] [--root <dir>]
//
// Defaults: every preset, prefix `mnemon_`, top 12. Read-only: it never writes to a transcript.
import { join } from 'node:path'
import { readSession, sessionDirs } from './dump-session.mjs'

const argv = process.argv.slice(2)
const value = (name, fallback) => {
  const at = argv.indexOf(`--${name}`)
  return at === -1 ? fallback : (argv[at + 1] ?? fallback)
}

const presetFilter = value('preset', '')
const prefix = value('prefix', 'mnemon_')
const top = Number(value('top', '12'))
const root = value('root', join(process.env.USERPROFILE ?? '', '.dsh', 'sessions'))

const sessionsByPreset = new Map()
const callsByTool = new Map()
const sessionsByPrefixedTool = new Map()
let scanned = 0
let matching = 0
let calls = 0

for (const { dir } of sessionDirs(root)) {
  const session = readSession(dir)
  if (session === undefined) continue
  scanned += 1
  if (presetFilter !== '' && !session.preset.includes(presetFilter)) continue
  matching += 1
  sessionsByPreset.set(session.preset, (sessionsByPreset.get(session.preset) ?? 0) + 1)
  const calledHere = new Set()
  for (const record of session.records) {
    if (record.type !== 'tool/call') continue
    const name = record.data?.name
    if (typeof name !== 'string') continue
    calls += 1
    callsByTool.set(name, (callsByTool.get(name) ?? 0) + 1)
    if (name.startsWith(prefix)) calledHere.add(name)
  }
  for (const name of calledHere) sessionsByPrefixedTool.set(name, (sessionsByPrefixedTool.get(name) ?? 0) + 1)
}

const rank = (map) => [...map.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
const share = (part, whole) => (whole === 0 ? '0' : ((part / whole) * 100).toFixed(1)) + '%'
const prefixedCalls = rank(callsByTool).filter(([name]) => name.startsWith(prefix)).reduce((sum, [, n]) => sum + n, 0)

console.log(`root      : ${root}`)
console.log(`sessions  : ${scanned} readable · ${matching} matching ${presetFilter === '' ? '(all presets)' : `'${presetFilter}'`}`)
console.log(`presets   : ${rank(sessionsByPreset).map(([name, n]) => `${name || '(none)'}=${n}`).join(' ') || '(none)'}`)
console.log(`tool calls: ${calls} in those sessions`)
console.log(
  `prefix    : '${prefix}' answered ${prefixedCalls} calls (${share(prefixedCalls, calls)}) from ${sessionsByPrefixedTool.size} distinct names`,
)
console.log('')
console.log('  calls  sessions  tool')
for (const [name, n] of rank(sessionsByPrefixedTool)) {
  console.log(`  ${String(callsByTool.get(name) ?? 0).padStart(5)}  ${String(n).padStart(8)}  ${name}`)
}
console.log('  (a name in this list with 0 calls would be a tool that was never used; a name absent from it was never called at all)')
console.log('')
console.log(`top ${top} tools overall:`)
for (const [name, n] of rank(callsByTool).slice(0, top)) console.log(`  ${String(n).padStart(5)}  ${name}`)
