// Probe a decompressed DSH session JSONL with bounded output.
//
// Usage: node tools/dev/probe-session.mjs <session.jsonl> [needle ...]
//
// Prints a record-type census, the user-authored messages, and a short context
// window around every occurrence of each needle. Output is capped so a single
// enormous JSONL line (e.g. a full system prompt) cannot flood the caller.
import { readFileSync } from 'node:fs'

const file = process.argv[2]
const needles = process.argv.slice(3)
if (!file) {
  console.error('usage: node tools/dev/probe-session.mjs <session.jsonl> [needle ...]')
  process.exit(2)
}

const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() !== '')
const types = new Map()

for (const line of lines) {
  let rec
  try {
    rec = JSON.parse(line)
  } catch {
    continue
  }
  const t = rec.type ?? rec.role ?? '(untyped)'
  types.set(t, (types.get(t) ?? 0) + 1)
}

console.log(`records: ${lines.length}`)
console.log(
  'types  : ' +
    [...types.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([t, n]) => `${t}=${n}`)
      .join('  '),
)

// User-authored text, for reconstructing what the human actually did.
const userTexts = []
for (const line of lines) {
  let rec
  try {
    rec = JSON.parse(line)
  } catch {
    continue
  }
  const msg = rec.message ?? rec
  const role = msg?.role ?? rec.role
  if (role !== 'user') continue
  const content = msg?.content
  const text =
    typeof content === 'string'
      ? content
      : Array.isArray(content)
        ? content
            .filter((c) => c?.type === 'text')
            .map((c) => c.text)
            .join('\n')
        : ''
  if (text && !text.startsWith('<')) userTexts.push(text)
}
console.log(`\n=== user messages (${userTexts.length}) ===`)
userTexts.slice(0, 12).forEach((t, i) => {
  console.log(`[${i}] ${t.replace(/\s+/g, ' ').slice(0, 260)}`)
})

for (const needle of needles) {
  let hits = 0
  console.log(`\n=== "${needle}" ===`)
  for (let i = 0; i < lines.length && hits < 12; i++) {
    const line = lines[i]
    let at = line.indexOf(needle)
    let shown = 0
    while (at !== -1 && shown < 3 && hits < 12) {
      const from = Math.max(0, at - 180)
      const to = Math.min(line.length, at + needle.length + 180)
      let recType = '?'
      try {
        const r = JSON.parse(line)
        recType = r.type ?? r.role ?? '?'
      } catch {
        /* keep '?' */
      }
      console.log(`-- line ${i} type=${recType} --`)
      console.log(`   ...${line.slice(from, to).replace(/\s+/g, ' ')}...`)
      hits += 1
      shown += 1
      at = line.indexOf(needle, at + needle.length)
    }
  }
  if (hits === 0) console.log('(none)')
}
