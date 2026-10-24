// scaffold-selftest — the study scaffold's layout is stated in two places, and nothing had ever compared
// them:
//
//   1. protocol.md §7                          the contract's layout block  (the authority)
//   2. README.md, "What a study looks like"    the scaffold's own layout note
//
// A third list used to exist — the authority table the template handed every study — and Revision 26
// deleted it together with the seven directories it described, because a table of a shape no real study
// had adopted is not an authority. Two statements still drift, so this compares them to each other and to
// what is on disk. It adds no third list and reads no generated file.
//
//   S0  both lists parsed to something — a comparison over two empty sets passes for the wrong reason
//   S1  every top-level entry either list names is named in both
//   S2  every entry on disk is named in both lists
//   S3  every path a list names exists in the scaffold — as a directory, or as the file it names
//   S4  every discipline a scaffold README names as its producer exists in skills/
//   S5  the scaffold carries no AGENTS.md at all (a live one is injectable as project instructions)
//   S6  exactly one source states the layout, so agreement is never read across two absences
//
// Usage: node tools/tests/scaffold-selftest.mjs [repo-root] [--negative-controls]

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const rootArg = args.find((a) => !a.startsWith('--'))
const root = resolve(rootArg ?? join(dirname(fileURLToPath(import.meta.url)), '../..'))
const template = join(root, 'project-template')

const read = (p) => readFileSync(p, 'utf8')

// The study's own entry document is not part of the layer map, so it is not required to appear in it.
const UNDECLARED_OK = new Set(['README.md'])

// Named by the map but deliberately not shipped: a study's constraint file can only be written by the
// study's owner, so the layout says it belongs there while the scaffold refuses to create it. S5 is the
// check that holds the other half of that sentence.
const NOT_SHIPPED = new Set(['AGENTS.md'])

/** What sits at the top of a path: the entry a study sees when it lists its own root. */
const topOf = (set) => new Set([...set].map((p) => p.split('/')[0]))

/** Paths declared in an indented `<study>/` tree block (protocol.md §7, README layout).
 *  A line is `  <name>/` or `  <name>/<file>`; indentation is followed so a nested entry
 *  (`references/` → `README.md`) becomes the full path, not a sibling. */
function treeStudyEntries(block) {
  const out = new Set()
  const stack = []
  let base = null
  for (const line of block.split(/\r?\n/)) {
    if (line.trim() === '') continue
    const indent = line.match(/^\s*/)[0].length
    const token = line.trim().split(/\s+/)[0]
    if (base === null) {
      if (token === '<study>/') {
        base = indent
        stack.push({ indent, path: '' })
      }
      continue
    }
    if (indent <= base) break
    // An entry always names a path: a directory (trailing slash) or a file (an extension). A wrapped
    // description line does neither, and requiring one of the two is what keeps this parse narrow enough
    // to be trusted — a loose parse here reports drift that is not there.
    const isDir = token.endsWith('/')
    const isFile = /^[\w.-]+\.\w+$/.test(token)
    if (!isDir && !isFile) continue
    const name = token.replace(/\/$/, '')
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack.length > 0 ? stack[stack.length - 1].path : ''
    const path = parent ? `${parent}/${name}` : name
    out.add(path)
    if (isDir) stack.push({ indent, path })
  }
  return out
}

function fencedBlocks(text) {
  const out = []
  const re = /```[a-zA-Z]*\r?\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(text)) !== null) out.push(m[1])
  return out
}

// `statSync` rather than `Dirent.isDirectory()`: on Windows a reparse point (a OneDrive placeholder, a
// junction) reports false there while still holding files, which silently emptied this list once.
const isDir = (p) => {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

/** Read every input the checks need, so a negative control can mutate them in memory. */
function gather() {
  const names = readdirSync(template)
  const onDisk = new Set(names.filter((name) => isDir(join(template, name))))
  const onDiskFiles = new Set(names.filter((name) => !isDir(join(template, name))))
  const scaffoldReadmes = new Map()
  for (const dir of onDisk) {
    const p = join(template, dir, 'README.md')
    scaffoldReadmes.set(dir, existsSync(p) ? read(p) : null)
  }
  return {
    protocol: read(join(root, 'protocol.md')),
    repoReadme: read(join(root, 'README.md')),
    templateReadme: read(join(template, 'README.md')),
    skillNames: new Set(
      readdirSync(join(root, 'skills'), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name),
    ),
    agentsFiles: names.filter((f) => f.startsWith('AGENTS.md')),
    onDisk,
    onDiskFiles,
    scaffoldReadmes,
  }
}

function evaluate(inputs) {
  const checks = []
  const fail = (id, message) => checks.push({ id, ok: false, message })
  const pass = (id, message) => checks.push({ id, ok: true, message })

  const layoutOf = (text) => treeStudyEntries(fencedBlocks(text).find((b) => b.includes('00_scoping.md')) ?? '')

  // The layout note has two possible homes: this repository's README, and — before the study-facing
  // README replaced it — project-template/README.md. Whichever states it is used, and which one did is
  // reported. Both stating it is itself a failure, because then they can drift apart.
  const sources = [
    ['README.md (scaffold layout)', layoutOf(inputs.repoReadme)],
    ['project-template/README.md', layoutOf(inputs.templateReadme)],
  ].filter(([, entries]) => entries.size > 0)
  if (sources.length > 1) fail('S6', `both ${sources.map(([l]) => l).join(' and ')} state the layout; exactly one may`)

  const lists = {
    'protocol.md §7': layoutOf(inputs.protocol),
    [sources[0]?.[0] ?? 'README.md (scaffold layout)']: sources[0]?.[1] ?? new Set(),
  }
  const labels = Object.keys(lists)

  // S0 — a comparison over two empty sets would pass for the wrong reason.
  for (const label of labels) {
    if (lists[label].size === 0) fail('S0', `${label}: parsed no entry — the format changed`)
  }
  if (!checks.some((c) => c.id === 'S0')) pass('S0', `two lists parsed (layout also read from ${labels[1]})`)

  // S1/S2 — the two lists and the disk agree at the top level.
  const union = new Set(labels.flatMap((l) => [...topOf(lists[l])]))
  const unionAll = new Set(labels.flatMap((l) => [...lists[l]]))
  for (const entry of [...union].sort()) {
    const missing = labels.filter((l) => !topOf(lists[l]).has(entry))
    if (missing.length > 0) fail('S1', `${entry}: not named in ${missing.join(', ')}`)
  }
  if (!checks.some((c) => c.id === 'S1')) pass('S1', `${union.size} entries, each named in both lists`)
  const declared = [...inputs.onDisk, ...[...inputs.onDiskFiles].filter((f) => !UNDECLARED_OK.has(f))]
  for (const entry of declared.sort()) {
    const missing = labels.filter((l) => !topOf(lists[l]).has(entry))
    if (missing.length > 0) fail('S2', `${entry}: exists on disk but is not named in ${missing.join(', ')}`)
  }
  if (!checks.some((c) => c.id === 'S2')) {
    pass('S2', `all ${declared.length} entries on disk are named in both lists`)
  }

  // S3 — every named path exists, and as the kind of thing it was named as. A file the map names and the
  // scaffold does not carry is the same drift as a missing directory, and it used to pass silently
  // because a name with an extension was skipped.
  for (const path of [...unionAll].sort()) {
    if (NOT_SHIPPED.has(path)) continue
    const isFileEntry = /\.[a-z0-9]+$/.test(path)
    const present = isFileEntry ? existsSync(join(template, path)) && !isDir(join(template, path)) : isDir(join(template, path))
    if (!present) fail('S3', `${path}: named but ${isFileEntry ? 'not a file' : 'not a directory'} in the scaffold`)
  }
  if (!checks.some((c) => c.id === 'S3')) {
    pass('S3', `all ${unionAll.size - NOT_SHIPPED.size} shipped paths named by the layout exist in the scaffold`)
  }

  // S4 — a scaffold README's named producer exists.
  for (const dir of [...inputs.onDisk].sort()) {
    const body = inputs.scaffoldReadmes.get(dir)
    if (body == null) {
      fail('S4', `${dir}/README.md is missing`)
      continue
    }
    for (const m of body.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`\s+skill/g)) {
      if (!inputs.skillNames.has(m[1])) {
        fail('S4', `${dir}/README.md names the \`${m[1]}\` discipline, which does not exist`)
      }
    }
  }
  if (!checks.some((c) => c.id === 'S4')) pass('S4', 'every discipline a scaffold README names exists in skills/')

  // S5 — no AGENTS.md* at all. The scaffold cannot prefill a study's constraints, and a file that is live
  // under the template is injected as project instructions while it is still a placeholder.
  if (inputs.agentsFiles.length !== 0) {
    fail('S5', `the scaffold carries ${inputs.agentsFiles.join(', ')}; a study's AGENTS.md is its owner's to write`)
  } else {
    pass('S5', 'the scaffold carries no AGENTS.md')
  }

  return { checks, lists }
}

// ---- run -------------------------------------------------------------------
const real = gather()
const { checks, lists } = evaluate(real)
let failed = checks.filter((c) => !c.ok)

for (const c of checks.filter((c) => c.ok)) console.log(`PASS ${c.id} ${c.message}`)
for (const c of failed) console.log(`FAIL ${c.id} ${c.message}`)
console.log('')
for (const [label, set] of Object.entries(lists)) {
  console.log(`  ${label}: ${[...topOf(set)].sort().join(' ')}`)
}
console.log('')
console.log(`${checks.length - failed.length}/${checks.length} checks passed`)

// ---- negative controls -----------------------------------------------------
// Every check above must be able to fail, driven by a mutation of the inputs it reads. A control that
// does not break its check is reported and turns the run red: a guard whose controls pass silently is
// a guard nobody can trust.
if (args.includes('--negative-controls')) {
  const controls = [
    [
      'an entry dropped from the contract layout',
      (i) => ({ ...i, protocol: i.protocol.replace(/^\s+\.section-notes\/.*\n/m, '') }),
      'S1',
    ],
    [
      'the layout block gone from the contract',
      (i) => ({ ...i, protocol: i.protocol.replace(/```text\r?\n<study>\/[\s\S]*?```/, '') }),
      'S0',
    ],
    [
      'an entry on disk that no list names',
      (i) => ({ ...i, onDisk: new Set([...i.onDisk, 'untracked']) }),
      'S2',
    ],
    [
      'a file the layout names but the scaffold does not carry',
      (i) => ({ ...i, protocol: i.protocol.replace(/^(\s+)ledger\.md/m, '$1rows.md') }),
      'S3',
    ],
    [
      'a scaffold README naming a discipline that does not exist',
      (i) => ({ ...i, skillNames: new Set() }),
      'S4',
    ],
    [
      'a live AGENTS.md left in the scaffold',
      (i) => ({ ...i, agentsFiles: ['AGENTS.md'] }),
      'S5',
    ],
    [
      'both sources stating the layout',
      (i) => ({ ...i, templateReadme: i.repoReadme }),
      'S6',
    ],
  ]

  console.log('')
  console.log('negative controls (each mutation must break the check it targets):')
  for (const [what, mutate, expected] of controls) {
    const { checks: mutated } = evaluate(mutate(gather()))
    const broke = mutated.some((c) => !c.ok && c.id === expected)
    console.log(`  ${broke ? 'OK  ' : 'MISS'} ${what}  -> ${expected}`)
    if (!broke) failed = [...failed, { id: 'NC', message: what }]
  }
  console.log('')
  console.log(failed.length === 0 ? 'PASS (including negative controls)' : 'FAIL')
}

process.exit(failed.length === 0 ? 0 : 1)
