// How the flag-multiplexed helpers are actually invoked, and whether their own refusals ever fired.
//
// Why this exists: it is the instrument behind the ruling that `zotero-read.mjs` and `zotero-pdf.mjs`
// keep their flag grammar instead of moving each mode to a subcommand (docs/01_decisions.md #56). A
// subcommand would make an illegal combination unrepresentable, which is worth paying for only if
// illegal combinations happen. Measured 2026-10-19 across 57 autoresearch sessions: 283 command
// segments invoked `zotero-read.mjs`, none used two modes, and neither program's refusal text appears
// in a single real execution output. `zotero-pdf.mjs` was not invoked at all.
//
// Two traps this tool is written around, both hit while measuring:
//   * ONE `pwsh` CALL CHAINS SEVERAL COMMANDS, so the unit is the COMMAND SEGMENT. Counting per call
//     reported 132 "multi-mode" invocations that were 132 scripts.
//   * `--collections` CONTAINS `--collection`, so the mode test needs word boundaries: substring
//     matching reported 35 more that were one flag.
// A refusal is attributed only to the output of a call that actually invoked the program, because the
// same strings appear in a `read` of the program's own source.
//
// Usage:
//   node tools/session-helper-modes.mjs [--preset <substring>] [--root <dir>]
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
const root = value('root', join(process.env.USERPROFILE ?? '', '.dsh', 'sessions'))

/** Mode flags, as each program's own refusal messages define them. */
const MODES = {
  'zotero-read.mjs': ['--search', '--item', '--fulltext', '--collections', '--collection', '--tags'],
  'zotero-pdf.mjs': ['--outline', '--extract', '--render'],
}
const REFUSALS = [
  'pass one of --search/--item/--fulltext/--collections/--collection/--tags, not both',
  'one rung per invocation',
  'pass one of --outline, --extract or --render',
  '--pages belongs to --render',
]

const segments = []
const refusals = []
let scanned = 0
let matching = 0

for (const { dir } of sessionDirs(root)) {
  const session = readSession(dir)
  if (session === undefined) continue
  scanned += 1
  if (presetFilter !== '' && !session.preset.includes(presetFilter)) continue
  matching += 1

  const results = new Map()
  for (const record of session.records) {
    if (record.type !== 'tool/result') continue
    const message = record.data?.message
    if (typeof message?.toolCallId !== 'string') continue
    results.set(message.toolCallId, JSON.stringify(message.content ?? ''))
  }

  for (const record of session.records) {
    if (record.type !== 'tool/call' || record.data?.name !== 'pwsh') continue
    let command = ''
    try {
      command = String(JSON.parse(record.data.arguments ?? '{}')?.command ?? '')
    } catch {
      continue
    }
    const invoked = new Set()
    for (const line of command.split(/\r?\n|;/)) {
      const program = Object.keys(MODES).find((name) => line.includes(name))
      if (program === undefined) continue
      invoked.add(program)
      const used = MODES[program].filter((flag) => new RegExp(`(^|\\s)${flag}(\\s|$)`).test(line))
      segments.push({ program, used, line: line.trim().slice(0, 200) })
    }
    const output = results.get(record.data.callId) ?? ''
    for (const program of invoked) {
      for (const refusal of REFUSALS) {
        if (output.includes(refusal)) refusals.push({ program, refusal })
      }
    }
  }
}

console.log(`root     : ${root}`)
console.log(`sessions : ${scanned} readable · ${matching} matching ${presetFilter === '' ? '(all presets)' : `'${presetFilter}'`}`)
console.log(`segments : ${segments.length} command segments invoked one of the flag-multiplexed helpers`)

for (const program of Object.keys(MODES)) {
  const mine = segments.filter((segment) => segment.program === program)
  const multi = mine.filter((segment) => segment.used.length > 1)
  console.log('')
  console.log(`--- ${program}: ${mine.length} segments ---`)
  console.log(`  two or more modes : ${multi.length}`)
  const shapes = new Map()
  for (const segment of mine) {
    const key = segment.used.length === 0 ? '(no mode flag: the line only names the program)' : segment.used.join(' ')
    shapes.set(key, (shapes.get(key) ?? 0) + 1)
  }
  for (const [key, count] of [...shapes.entries()].sort((left, right) => right[1] - left[1])) {
    console.log(`  ${String(count).padStart(5)}  ${key}`)
  }
  for (const segment of multi.slice(0, 5)) console.log(`  ! multi-mode: ${segment.line}`)
}

console.log('')
console.log('refusals found in the output of a call that invoked the program:')
if (refusals.length === 0) console.log('  none')
for (const hit of refusals) console.log(`  ${hit.program} :: ${hit.refusal}`)
