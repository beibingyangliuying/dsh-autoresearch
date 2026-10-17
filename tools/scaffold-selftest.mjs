// scaffold-selftest — the study scaffold's layout is stated in three places, and nothing had ever
// compared them:
//
//   1. protocol.md §7                          the contract's layout block  (the authority)
//   2. README.md, "What a study looks like"    the scaffold's own layout note
//   3. project-template/AGENTS.md.template §3  the authority table a study inherits
//
// This is the instrument for a rule this repository holds everywhere else: two lists of the same
// names drift, so the rosters need something that can fail. It compares the three lists against each
// other and against what is on disk. It adds no fourth list and reads no generated file.
//
//   S0  every list parsed to something — a comparison over three empty sets passes for the wrong reason
//   S1  every `research/<name>/` in any list is named in all three
//   S2  every `research/<name>/` on disk is named in all three
//   S3  every directory a list names exists under project-template/
//   S4  every discipline a scaffold README names as its producer exists in skills/
//   S5  AGENTS.md.template is the only AGENTS.md* in the template (a live one is injectable)
//   S6  exactly one source states the layout, so agreement is never read across two absences
//
// Usage: node tools/scaffold-selftest.mjs [repo-root] [--negative-controls]

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const rootArg = args.find((a) => !a.startsWith('--'))
const root = resolve(rootArg ?? join(dirname(fileURLToPath(import.meta.url)), '..'))
const template = join(root, 'project-template')

const read = (p) => readFileSync(p, 'utf8')

/** Top-level `research/<name>` entries of a set that may also hold nested paths. */
const topOf = (set) => new Set([...set].filter((d) => d.split('/').length === 2))

/** Directories declared under `research/` in an indented tree block (protocol.md §7, README layout).
 *  A line is `  <name>/` or `  <name>/<file-pattern>`; indentation is followed so a nested entry
 *  (`experiments/` → `protocols/`) becomes the full path, not a sibling. */
function treeResearchDirs(block) {
  const out = new Set()
  const stack = []
  let base = null
  for (const line of block.split(/\r?\n/)) {
    if (line.trim() === '') continue
    const indent = line.match(/^\s*/)[0].length
    const token = line.trim().split(/\s+/)[0]
    if (base === null) {
      if (token === 'research/') {
        base = indent
        stack.push({ indent, path: 'research' })
      }
      continue
    }
    if (indent <= base) break
    // An entry always names a path; a wrapped description line does not. Requiring the slash is what
    // keeps this narrow enough to be trusted — a loose parse here reports drift that is not there.
    if (!token.includes('/')) continue
    const segs = token.split('/').filter(Boolean)
    // The trailing segment is a file pattern when it carries an extension or a placeholder.
    if (segs.length > 1 && /[.<]/.test(segs[segs.length - 1])) segs.pop()
    if (segs.length === 0) continue
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) stack.pop()
    const parent = stack.length > 0 ? stack[stack.length - 1].path : 'research'
    const path = `${parent}/${segs.join('/')}`
    out.add(path)
    stack.push({ indent, path })
  }
  return out
}

/** Directories declared as `research/<name>/**` in a table, restricted to one section. */
function tableResearchDirs(text, heading, next) {
  const from = text.indexOf(heading)
  const to = next ? text.indexOf(next, from + 1) : -1
  const body = text.slice(from, to === -1 ? undefined : to)
  const out = new Set()
  for (const m of body.matchAll(/`(research\/[A-Za-z0-9_.-]+)\/(?:\*\*)?`/g)) out.add(m[1])
  return out
}

function fencedBlocks(text) {
  const out = []
  const re = /```[a-zA-Z]*\r?\n([\s\S]*?)```/g
  let m
  while ((m = re.exec(text)) !== null) out.push(m[1])
  return out
}

const isDir = (p) => {
  try {
    return statSync(p).isDirectory()
  } catch {
    return false
  }
}

/** Read every input the checks need, so a negative control can mutate them in memory. */
function gather() {
  const onDisk = new Set(
    readdirSync(join(template, 'research'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `research/${d.name}`),
  )
  const scaffoldReadmes = new Map()
  for (const dir of onDisk) {
    const p = join(template, dir, 'README.md')
    scaffoldReadmes.set(dir, existsSync(p) ? read(p) : null)
  }
  return {
    protocol: read(join(root, 'protocol.md')),
    repoReadme: read(join(root, 'README.md')),
    templateReadme: read(join(template, 'README.md')),
    agentsTemplate: read(join(template, 'AGENTS.md.template')),
    skillNames: new Set(
      readdirSync(join(root, 'skills'), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name),
    ),
    agentsFiles: readdirSync(template).filter((f) => f.startsWith('AGENTS.md')),
    onDisk,
    scaffoldReadmes,
  }
}

function evaluate(inputs) {
  const checks = []
  const fail = (id, message) => checks.push({ id, ok: false, message })
  const pass = (id, message) => checks.push({ id, ok: true, message })

  const layoutOf = (text) => treeResearchDirs(fencedBlocks(text).find((b) => b.includes('00_scoping.md')) ?? '')

  // The layout note has two possible homes: this repository's README, and — before the study-facing
  // README replaced it — project-template/README.md. Whichever states it is used, and which one did is
  // reported. Both stating it is itself a failure, because then they can drift apart.
  const sources = [
    ['README.md (scaffold layout)', layoutOf(inputs.repoReadme)],
    ['project-template/README.md', layoutOf(inputs.templateReadme)],
  ].filter(([, dirs]) => dirs.size > 0)
  if (sources.length > 1) fail('S6', `both ${sources.map(([l]) => l).join(' and ')} state the layout; exactly one may`)

  const lists = {
    'protocol.md §7': treeResearchDirs(
      fencedBlocks(inputs.protocol).find((b) => b.includes('00_scoping.md')) ?? '',
    ),
    [sources[0]?.[0] ?? 'README.md (scaffold layout)']: sources[0]?.[1] ?? new Set(),
    'AGENTS.md.template §3': tableResearchDirs(inputs.agentsTemplate, '## 3. Document hierarchy', '## 4. Notation'),
  }
  const labels = Object.keys(lists)

  // S0 — a comparison over three empty sets would pass for the wrong reason.
  for (const label of labels) {
    if (topOf(lists[label]).size === 0) fail('S0', `${label}: parsed no research/ directory — the format changed`)
  }
  if (!checks.some((c) => c.id === 'S0')) pass('S0', `three lists parsed (layout read from ${labels[1]})`)

  // S1/S2 — the three lists and the disk agree at the top level.
  const union = new Set(labels.flatMap((l) => [...topOf(lists[l])]))
  const unionAll = new Set(labels.flatMap((l) => [...lists[l]]))
  for (const dir of [...union].sort()) {
    const missing = labels.filter((l) => !topOf(lists[l]).has(dir))
    if (missing.length > 0) fail('S1', `${dir}/: not named in ${missing.join(', ')}`)
  }
  if (!checks.some((c) => c.id === 'S1')) pass('S1', `${union.size} directories, each named in all three lists`)
  for (const dir of [...inputs.onDisk].sort()) {
    const missing = labels.filter((l) => !topOf(lists[l]).has(dir))
    if (missing.length > 0) fail('S2', `${dir}/: exists on disk but is not named in ${missing.join(', ')}`)
  }
  if (!checks.some((c) => c.id === 'S2')) {
    pass('S2', `all ${inputs.onDisk.size} directories on disk are named in all three lists`)
  }

  // S3 — every named directory exists.
  for (const dir of [...unionAll].sort()) {
    if (!isDir(join(template, dir))) fail('S3', `${dir}/ is named but is not a directory in the scaffold`)
  }
  for (const dir of [...lists['protocol.md §7']].sort()) {
    if (!isDir(join(template, dir))) fail('S3', `${dir}/ is in the contract's layout but not in the scaffold`)
  }
  if (!checks.some((c) => c.id === 'S3')) pass('S3', `all ${unionAll.size} named paths are directories in the scaffold`)

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

  // S5 — exactly one AGENTS.md* in the template.
  if (inputs.agentsFiles.length !== 1 || inputs.agentsFiles[0] !== 'AGENTS.md.template') {
    fail('S5', `template carries ${inputs.agentsFiles.join(', ') || 'no'} AGENTS.md* file(s); only AGENTS.md.template is inert`)
  } else {
    pass('S5', 'AGENTS.md.template is the only AGENTS.md* in the template')
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
      'a directory dropped from the authority table a study inherits',
      (i) => ({ ...i, agentsTemplate: i.agentsTemplate.replace(/^\| What did we retire.*\n/m, '') }),
      'S1',
    ],
    [
      'a directory dropped from the contract layout',
      (i) => ({ ...i, protocol: i.protocol.replace(/^\s+archive\/.*\n/m, '') }),
      'S1',
    ],
    [
      'the layout block gone from the contract',
      (i) => ({ ...i, protocol: i.protocol.replace(/```text\r?\n<study>\/[\s\S]*?```/, '') }),
      'S0',
    ],
    [
      'a directory on disk that no list names',
      (i) => ({ ...i, onDisk: new Set([...i.onDisk, 'research/untracked']) }),
      'S2',
    ],
    [
      'a scaffold README naming a discipline that does not exist',
      (i) => ({ ...i, skillNames: new Set() }),
      'S4',
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
