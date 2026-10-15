// Read a compressed DSH session transcript (multi-frame zstd JSONL) for offline
// inspection. DSH appends each write as its own zstd frame, so a plain
// zstdDecompressSync only yields the first record; this script splits the buffer
// on the zstd frame magic and decompresses every frame.
//
// Usage:
//   node tools/dump-session.mjs <sessionDir> [outFile]   decompress one session
//   node tools/dump-session.mjs --scan <sessionsRoot>     list each session's EFFECTIVE agent preset
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

const MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])

/** Split a multi-frame zstd buffer on the frame magic; merge frames that fail. */
function decompressAll(raw) {
  const starts = []
  let at = raw.indexOf(MAGIC)
  while (at !== -1) {
    starts.push(at)
    at = raw.indexOf(MAGIC, at + 4)
  }
  starts.push(raw.length)

  const parts = []
  const failed = []
  let i = 0
  while (i < starts.length - 1) {
    let j = i + 1
    let done = false
    while (j < starts.length) {
      try {
        parts.push(zstdDecompressSync(raw.subarray(starts[i], starts[j])).toString('utf8'))
        done = true
        break
      } catch {
        j += 1 // magic inside a frame: absorb the next piece and retry
      }
    }
    if (!done) {
      failed.push(starts[i])
      break
    }
    i = j
  }
  return { text: parts.join(''), frames: parts.length, failed }
}

function transcriptPath(sessionDir) {
  const file = readdirSync(sessionDir).find((n) => n.endsWith('.zstd'))
  if (!file) throw new Error(`no .zstd transcript in ${sessionDir}`)
  return { file, full: join(sessionDir, file) }
}

function readTranscript(sessionDir) {
  const { file, full } = transcriptPath(sessionDir)
  const raw = readFileSync(full)
  const { text, frames, failed } = decompressAll(raw)
  return { file, raw, text, frames, failed }
}

function parseHeader(text) {
  try {
    return JSON.parse(text.split('\n', 1)[0])
  } catch {
    return null
  }
}

/**
 * The preset a session actually ran, next to the value its own record carries.
 *
 * A session record's `agentPreset` is the value at CREATION — normally the profile default,
 * `standard` — while the choice itself is written as a separate `agent-preset/selected` record a
 * moment later, and again on every switch. Reading the first record alone therefore reports
 * `standard` for a session that plainly ran a preset, which is exactly the question this scan exists
 * to answer (measured 2026-10-15: a session that ran `autoresearch`, selected 2 s after creation).
 *
 * Only lines that carry the marker are parsed: a transcript can hold tens of thousands of records,
 * and a full parse of each one would make the scan quadratic in transcript size for no gain.
 *
 * @param {string} text The decompressed transcript.
 * @returns {{created: string|undefined, selected: string|undefined, selections: number, effective: string|undefined}}
 */
function parsePresetFacts(text) {
  const created = parseHeader(text)?.agentPreset
  let selected
  let selections = 0
  for (const line of text.split('\n')) {
    if (!line.includes('agent-preset/selected')) continue
    try {
      const name = JSON.parse(line)?.data?.agentPreset
      if (typeof name === 'string' && name !== '') {
        selected = name
        selections += 1
      }
    } catch {
      // A transcript line that does not parse is not evidence about the preset.
    }
  }
  return { created, selected, selections, effective: selected ?? created }
}

const mode = process.argv[2]
const arg = process.argv[3]

if (mode === '--scan') {
  const rows = []
  for (const entry of readdirSync(arg, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(arg, entry.name)
    try {
      const { file, full } = transcriptPath(dir)
      const { text, frames, failed } = decompressAll(readFileSync(full))
      const facts = parsePresetFacts(text)
      rows.push({
        session: entry.name,
        preset: facts.effective ?? '(none)',
        created: facts.created ?? '(none)',
        selections: facts.selections,
        depth: parseHeader(text)?.delegationDepth ?? 0,
        origin: parseHeader(text)?.origin ?? 'top',
        mb: (statSync(full).size / 1048576).toFixed(2),
        frames,
        bad: failed.length,
        mtime: statSync(full).mtime.toISOString().slice(11, 19),
      })
    } catch (err) {
      rows.push({ session: entry.name, preset: `ERROR ${err.message}` })
    }
  }
  rows.sort((a, b) => String(b.mtime ?? '').localeCompare(String(a.mtime ?? '')))
  for (const r of rows) {
    // The creation-time value is shown only when it differs, so the column answers "which preset ran"
    // first and keeps the trap visible without widening every row.
    const preset = r.created !== undefined && r.preset !== r.created ? `${r.preset} (created ${r.created})` : r.preset
    console.log(
      `${r.mtime ?? '?'}  ${String(preset).padEnd(34)} depth=${r.depth ?? '?'} ${String(r.origin ?? '').padEnd(5)} ${String(r.mb ?? '?').padStart(6)}MB frames=${r.frames ?? '?'} bad=${r.bad ?? '?'}  ${r.session}`,
    )
  }
} else {
  if (!mode || !existsSync(mode)) {
    console.error('usage: node tools/dump-session.mjs <sessionDir> [outFile]')
    console.error('       node tools/dump-session.mjs --scan <sessionsRoot>')
    process.exit(2)
  }
  const { file, raw, text, frames, failed } = readTranscript(mode)
  const target = arg ?? join(mode, 'decompressed.jsonl')
  writeFileSync(target, text, 'utf8')

  const keywords = [
    'autoresearch',
    'research-scoping',
    'literature-recon',
    'redteam-ruling',
    'progress-sync',
    'skill-filesystem',
    'tool-fs-search',
    '研究纪律',
  ]
  console.log(`file      : ${file}`)
  console.log(`frames    : ${frames} decoded, ${failed.length} failed`)
  console.log(`compressed: ${raw.length} bytes -> ${text.length} chars`)
  console.log(`wrote     : ${target}`)
  console.log(`census    : ${keywords.map((k) => `${k}=${text.split(k).length - 1}`).join('  ')}`)
  console.log('--- header ---')
  console.log(JSON.stringify(parseHeader(text)))
  const facts = parsePresetFacts(text)
  console.log(
    `preset    : ran=${facts.effective ?? '(none)'} created=${facts.created ?? '(none)'} selection-records=${facts.selections}`,
  )
}
