// Read a compressed DSH session transcript (multi-frame zstd JSONL) for offline
// inspection. DSH appends each write as its own zstd frame, so a plain
// zstdDecompressSync only yields the first record; this script splits the buffer
// on the zstd frame magic and decompresses every frame.
//
// Usage:
//   node tools/dump-session.mjs <sessionDir> [outFile]   decompress one session
//   node tools/dump-session.mjs --scan <sessionsRoot>     list each session's EFFECTIVE agent preset,
//                                                        newest first. The root's children are
//                                                        WORKSPACES and their sessions live one level
//                                                        below them; the scan descends.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
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

/** Whether a directory holds a session transcript. */
function hasTranscript(dir) {
  try {
    return readdirSync(dir).some((name) => name.endsWith('.zstd'))
  } catch {
    return false
  }
}

/**
 * The session directories under a sessions root.
 *
 * A sessions root's children are WORKSPACE directories, and each of those holds one directory per
 * session, which is where the transcript actually is. A scan that looked only at the root's own
 * children therefore found nothing and printed `ERROR no .zstd transcript` for every workspace, which
 * is what this did until 2026-10-15 - and the entry point the documents name for "which preset did
 * each session run" is this scan. A workspace carrying a transcript itself is also accepted, so a
 * layout that changes again degrades to "found fewer" rather than "found none".
 *
 * @param {string} root The sessions root, or one workspace directory under it.
 * @returns {Array<{workspace: string, session: string, dir: string}>} Directories holding a transcript.
 */
export function sessionDirs(root) {
  const found = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const dir = join(root, entry.name)
    if (hasTranscript(dir)) {
      found.push({ workspace: entry.name, session: entry.name, dir })
      continue
    }
    for (const inner of readdirSync(dir, { withFileTypes: true })) {
      if (inner.isDirectory() && hasTranscript(join(dir, inner.name))) {
        found.push({ workspace: entry.name, session: inner.name, dir: join(dir, inner.name) })
      }
    }
  }
  return found
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
export function parsePresetFacts(text) {
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

/**
 * One session directory as parsed records, with the preset that actually ran it.
 *
 * The session-scanning probes in this directory share this: each asks a different question of the same
 * transcripts, and letting the multi-frame zstd handling be re-implemented in each would be three
 * places for the frame-splitting rule to drift. The preset comes from `agent-preset/selected` for the
 * reason `parsePresetFacts` states, not from the session header.
 *
 * @param {string} dir A session directory holding a `.zstd` transcript.
 * @returns {{preset: string, records: object[]}|undefined} Undefined when the transcript cannot be read.
 */
export function readSession(dir) {
  let text
  try {
    text = readTranscript(dir).text
  } catch {
    return undefined
  }
  const records = text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter(Boolean)
  const preset =
    records.find((record) => record.type === 'agent-preset/selected')?.data?.agentPreset ??
    records.find((record) => record.type === 'session')?.data?.agentPreset ??
    ''
  return { preset, records }
}

/** List every session under a root, newest first, with the preset each one EFFECTIVELY ran. */
function scan(root) {
  const rows = []
  for (const { workspace, session, dir } of sessionDirs(root)) {
    const label = `${workspace}/${session}`
    try {
      const { full } = transcriptPath(dir)
      const { text, frames, failed } = decompressAll(readFileSync(full))
      const facts = parsePresetFacts(text)
      const when = statSync(full).mtime
      rows.push({
        session: label,
        preset: facts.effective ?? '(none)',
        created: facts.created ?? '(none)',
        selections: facts.selections,
        depth: parseHeader(text)?.delegationDepth ?? 0,
        origin: parseHeader(text)?.origin ?? 'top',
        mb: (statSync(full).size / 1048576).toFixed(2),
        frames,
        bad: failed.length,
        when,
        at: `${String(when.getMonth() + 1).padStart(2, '0')}-${String(when.getDate()).padStart(2, '0')} ${when.toTimeString().slice(0, 8)}`,
      })
    } catch (err) {
      rows.push({ session: label, preset: `ERROR ${err.message}`, when: new Date(0), at: '?' })
    }
  }
  // Sorted on the real timestamp, not on the printed clock time: a scan spanning a day boundary would
  // otherwise interleave days, which is how a stale session looks newer than a fresh one.
  rows.sort((a, b) => b.when - a.when)
  if (rows.length === 0) {
    console.log(`no session transcript under ${root}`)
    return
  }
  for (const r of rows) {
    // The creation-time value is shown only when it differs, so the column answers "which preset ran"
    // first and keeps the trap visible without widening every row.
    const preset = r.created !== undefined && r.preset !== r.created ? `${r.preset} (created ${r.created})` : r.preset
    console.log(
      `${r.at}  ${String(preset).padEnd(34)} depth=${r.depth ?? '?'} ${String(r.origin ?? '').padEnd(5)} ${String(r.mb ?? '?').padStart(6)}MB frames=${r.frames ?? '?'} bad=${r.bad ?? '?'}  ${r.session}`,
    )
  }
}

/** Decompress one session's transcript beside it, and report what it holds. */
function dumpOne(sessionDir, outFile) {
  const { file, raw, text, frames, failed } = readTranscript(sessionDir)
  const target = outFile ?? join(sessionDir, 'decompressed.jsonl')
  writeFileSync(target, text, 'utf8')

  const keywords = [
    'autoresearch',
    'research-scoping',
    'literature-recon',
    'section-notes',
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

// Only act when this file IS the command: the self-test imports `sessionDirs` and `parsePresetFacts`,
// and an import must not scan or write anything.
const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  const mode = process.argv[2]
  const arg = process.argv[3]
  if (mode === '--scan') {
    if (!arg || !existsSync(arg)) {
      console.error('usage: node tools/dump-session.mjs --scan <sessionsRoot>')
      process.exit(2)
    }
    scan(arg)
  } else if (!mode || !existsSync(mode)) {
    console.error('usage: node tools/dump-session.mjs <sessionDir> [outFile]')
    console.error('       node tools/dump-session.mjs --scan <sessionsRoot>')
    process.exit(2)
  } else {
    dumpOne(mode, arg)
  }
}
