// List the model-facing tool names recorded in a decompressed DSH session's
// request header, plus the header's top-level keys. Useful for proving which
// plugins actually contributed tools to a given preset/session.
//
// Usage: node tools/list-tools.mjs <session.jsonl>
import { readFileSync } from 'node:fs'

const records = readFileSync(process.argv[2], 'utf8')
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

const header = records.find((r) => r.type === 'request/header')?.data?.header
if (!header) {
  console.log('no request/header record')
  process.exit(1)
}

console.log(`header keys : ${Object.keys(header).join(', ')}`)
const tools = header.tools ?? []
console.log(`tool count  : ${tools.length}`)
console.log(`tools       : ${tools.map((t) => t.name).join(' ')}`)
