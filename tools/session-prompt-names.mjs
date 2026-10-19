// Which tool names appear in a session's RESIDENT prompt text, counted per name.
//
// Why this exists: a tool can be masked at the tool registry while the prompt still names it, because
// the text that names tools is assembled by plugins from their OWN state - the mnemon strategy plugin
// builds its protocol block from what the memory View OFFERS and never consults the DSH tool registry
// (measured 2026-10-19, docs/decisions.md #54). The state worth fearing is a resident line that tells
// the agent to call a tool it cannot see, and this is the instrument that would see it: the isolation
// filter can remove a tool, and nothing in the registry can remove a sentence.
//
// Resident text is read from `system/message` records - the prompt as delivered, not the transcript's
// user turns. Measured with this program: 0 of 57 autoresearch sessions named any `mnemon_*` tool in
// theirs, which is what made "just shrink the keep-list" unsafe rather than impossible.
//
// Usage:
//   node tools/session-prompt-names.mjs [--preset <substring>] [--prefix <tool-prefix>] [--root <dir>]
//
// Read-only: it never writes to a transcript.
import { join } from 'node:path'
import { readSession, sessionDirs } from './dump-session.mjs'

const argv = process.argv.slice(2)
const value = (name, fallback) => {
  const at = argv.indexOf(`--${name}`)
  return at === -1 ? fallback : (argv[at + 1] ?? fallback)
}

const presetFilter = value('preset', '')
const prefix = value('prefix', 'mnemon_')
const root = value('root', join(process.env.USERPROFILE ?? '', '.dsh', 'sessions'))

const sessionsByPreset = new Map()
const sessionsNaming = new Map()
let scanned = 0
let matching = 0
let withAnyName = 0

for (const { dir } of sessionDirs(root)) {
  const session = readSession(dir)
  if (session === undefined) continue
  scanned += 1
  if (presetFilter !== '' && !session.preset.includes(presetFilter)) continue
  matching += 1
  sessionsByPreset.set(session.preset, (sessionsByPreset.get(session.preset) ?? 0) + 1)
  const resident = session.records
    .filter((record) => record.type === 'system/message')
    .map((record) => JSON.stringify(record.data?.message ?? ''))
    .join('\n')
  const names = new Set(resident.match(new RegExp(`${prefix}[a-z0-9_]+`, 'g')) ?? [])
  if (names.size > 0) withAnyName += 1
  for (const name of names) sessionsNaming.set(name, (sessionsNaming.get(name) ?? 0) + 1)
}

const rank = (map) => [...map.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))

console.log(`root     : ${root}`)
console.log(`sessions : ${scanned} readable · ${matching} matching ${presetFilter === '' ? '(all presets)' : `'${presetFilter}'`}`)
console.log(`presets  : ${rank(sessionsByPreset).map(([name, n]) => `${name || '(none)'}=${n}`).join(' ') || '(none)'}`)
console.log(`resident : ${withAnyName} of ${matching} sessions name at least one '${prefix}' tool in their system prompt`)
console.log('')
console.log('  sessions  name')
for (const [name, n] of rank(sessionsNaming)) console.log(`  ${String(n).padStart(8)}  ${name}`)
if (sessionsNaming.size === 0) console.log('  (none - no resident text in these sessions names a tool of that prefix)')
