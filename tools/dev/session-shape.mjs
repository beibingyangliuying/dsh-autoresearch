// Show the structural shape of a decompressed DSH session JSONL, and optionally
// dump selected records. Bounded output: record bodies are truncated.
//
// Usage:
//   node tools/dev/session-shape.mjs <session.jsonl>
//   node tools/dev/session-shape.mjs <session.jsonl> --record <type> [maxChars]
import { readFileSync } from 'node:fs'

const file = process.argv[2]
const flagAt = process.argv.indexOf('--record')
const wantType = flagAt === -1 ? null : process.argv[flagAt + 1]
const maxChars = flagAt === -1 ? 3000 : Number(process.argv[flagAt + 2] ?? 3000)

const records = readFileSync(file, 'utf8')
  .split('\n')
  .filter((l) => l.trim() !== '')
  .map((l) => {
    try {
      return JSON.parse(l)
    } catch {
      return null
    }
  })
  .filter(Boolean)

/** Describe a value's shape without dumping its content. */
function describe(value) {
  if (Array.isArray(value)) return `array[${value.length}]`
  if (value === null) return 'null'
  if (typeof value === 'string') return `string(${value.length})`
  if (typeof value === 'object') return `object{${Object.keys(value).join(',')}}`
  return typeof value
}

if (wantType) {
  const hits = records.filter((r) => (r.type ?? r.role) === wantType)
  console.log(`records of type "${wantType}": ${hits.length}`)
  hits.slice(0, 2).forEach((r, i) => {
    const text = JSON.stringify(r, null, 2)
    console.log(`\n--- match ${i + 1} (${text.length} chars, showing ${Math.min(text.length, maxChars)}) ---`)
    console.log(text.slice(0, maxChars))
  })
} else {
  records.forEach((r, i) => {
    const type = r.type ?? r.role ?? '(untyped)'
    const fields = Object.entries(r)
      .filter(([k]) => k !== 'type')
      .map(([k, v]) => `${k}: ${describe(v)}`)
      .join('  ')
    console.log(`${String(i).padStart(3)}  ${String(type).padEnd(26)} ${fields}`)
  })
}
