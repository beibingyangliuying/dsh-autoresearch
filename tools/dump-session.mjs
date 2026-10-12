// Read a compressed DSH session transcript (multi-frame zstd JSONL) for offline
// inspection. DSH appends each write as its own zstd frame, so a plain
// zstdDecompressSync only yields the first record; this script splits the buffer
// on the zstd frame magic and decompresses every frame.
//
// Usage:
//   node tools/dump-session.mjs <sessionDir> [outFile]   decompress one session
//   node tools/dump-session.mjs --scan <sessionsRoot>     list each session's agentPreset
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
      const header = parseHeader(text) ?? {}
      rows.push({
        session: entry.name,
        preset: header.agentPreset ?? '(none)',
        depth: header.delegationDepth ?? 0,
        origin: header.origin ?? 'top',
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
    console.log(
      `${r.mtime ?? '?'}  ${String(r.preset).padEnd(16)} depth=${r.depth ?? '?'} ${String(r.origin ?? '').padEnd(5)} ${String(r.mb ?? '?').padStart(6)}MB frames=${r.frames ?? '?'} bad=${r.bad ?? '?'}  ${r.session}`,
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
}
