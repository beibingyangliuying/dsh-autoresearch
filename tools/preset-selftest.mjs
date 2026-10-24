// Self-test for the autoresearch preset. Run it after ANY change to the preset
// source, so verification never depends on a human eyeballing a live session.
//
// Usage:
//   dsh --profile web --dump-config > .tmp/composed-web.txt
//   node tools/preset-selftest.mjs [composedFile]
//
// Checks:
//   [1] the profile's bundle entry is still a LINK to this workspace, not a copy
//       (a copy silently breaks "edit the source and it takes effect")
//   [2] the count the prose declares matches the disciplines on disk
//       (this is the number that went stale in #36, #64 and #70; it reads no dump, so it runs before
//        the dump is required, and it deliberately does NOT cover level counts or behavioural prose)
//   [3] the composed dump is NEWER than the preset source, and the composed tree it holds contains
//       the preset with the expected plugin rows
//       (a stale dump is worse than none: it reports both false passes and false failures about a
//        reality that no longer exists. This check exists because that actually happened.)
//   [4] every paragraph of the source persona survives into the composed tree
//       (the tree re-serialises the scalar with `>-`, so compare ignoring whitespace)
//   [5] all discipline rules and skill-routing bullets are present
//   [6] always-on cost of the persona
// Exit code is 1 when any check fails.
import { readFileSync, lstatSync, readlinkSync, realpathSync, existsSync, statSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve, dirname } from 'node:path'

const composedFile = process.argv[2] ?? '.tmp/composed-web.txt'
const patchFile = 'cordis.patch.yml'
const workspaceDir = resolve('.')
const profileEntry = join(
  process.env.USERPROFILE ?? '',
  '.dsh',
  'profiles',
  'web',
  'node_modules',
  '@beibingyangliuying',
  'dsh-autoresearch-preset',
)

/** The profile's own base URL: the base the registry's trial mount resolves row names from. */
const profileDir = resolve(profileEntry, '..', '..', '..')

/**
 * The disciplines this preset ships, named once.
 *
 * The disk/prose count in [2] needs this list, and a second copy of it is how a count drifts: one copy
 * gains a name, the other keeps the old total, and each looks right on its own. It is NOT a routing
 * list any more (Revision 40): the persona states the order and the catalog states each trigger.
 */
const SHIPPED_NAMES = [
  'research-scoping',
  'literature-recon',
  'collection-sweep',
  'reading-triage',
  'section-notes',
  'adoption-ruling',
  'direction-probe',
  'redteam-ruling',
  'progress-sync',
  'metadata-query',
  'subagent-contract',
  'experiment-protocol',
  'synthesis-plan',
]

/** English number words, so a prose count can be compared with an actual one. */
const NUMBER_WORDS = Object.fromEntries(
  'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty'
    .split(' ')
    .map((word, index) => [word, index + 1]),
)

let failures = 0
const ok = (cond, label, detail = '') => {
  console.log(`    ${cond ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!cond) failures += 1
}

/** Extract a YAML block scalar (`|-` or `>-`) starting at the first marker match. */
function extractBlockScalar(lines, marker) {
  const start = lines.findIndex((l) => marker.test(l))
  if (start === -1) return null
  const indent = lines[start].match(/^(\s*)/)[1].length
  const body = []
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim() === '') {
      body.push('')
      continue
    }
    if (line.match(/^(\s*)/)[1].length <= indent) break
    body.push(line)
  }
  const contentIndent = Math.min(
    ...body.filter((l) => l.trim() !== '').map((l) => l.match(/^(\s*)/)[1].length),
  )
  return body.map((l) => l.slice(contentIndent)).join('\n').replace(/\s+$/, '')
}

/**
 * The prompt variables the KERNEL registers, read out of the installed agent-loop row.
 *
 * A `{{name}}` outside that set is not a cosmetic mistake: prompt assembly interpolates strictly and
 * throws on it BEFORE the request is made, so every turn of the preset fails while the preset still
 * mounts and stays on the new-session roster - a livelock that reads as "the preset is broken" but
 * never appears in the roster diagnostics. The registry is code, so ask the code: the names are the
 * string arguments of `systemPrompt.variable(...)`. This package's own rows are read too, because a
 * variable the preset registers is equally legitimate in its persona.
 *
 * @returns the registered names, or null when the kernel cannot be read - and the caller must FAIL
 *   then: a guard that passes because it could not look is not a guard.
 */
function registeredPromptVariables() {
  const requireFromProfile = createRequire(join(profileDir, 'composed-entry.js'))
  let kernelFile
  try {
    const packageFile = requireFromProfile.resolve('@deepseek-ai/dsh-agent-loop/package.json')
    kernelFile = join(dirname(packageFile), 'lib', 'index.js')
  } catch {
    return null
  }
  const sources = [
    kernelFile,
    ...['index.js', 'isolation.js', 'contact-bridge.js', 'skills.js'].map((f) => join(workspaceDir, f)),
  ]
  const names = new Set()
  for (const file of sources) {
    if (!existsSync(file)) continue
    const found = readFileSync(file, 'utf8').matchAll(
      /systemPrompt\s*\.\s*variable\(\s*["'`]([a-z][a-z0-9_]*)["'`]/g,
    )
    for (const match of found) names.add(match[1])
  }
  return [...names]
}

console.log('[1] bundle entry is a live link, not a copy')
if (!existsSync(profileEntry)) {
  ok(false, 'profile entry exists', profileEntry)
} else {
  const stat = lstatSync(profileEntry)
  const linked = stat.isSymbolicLink()
  let target = ''
  if (linked) {
    target = readlinkSync(profileEntry)
    if (target.startsWith('\\\\?\\')) target = target.slice(4)
  }
  const sameDir = linked && resolve(target) === workspaceDir
  ok(linked, 'entry is a symbolic link / junction', linked ? `-> ${target}` : '(it is a real directory = a copy)')
  ok(sameDir, 'link points at this workspace', sameDir ? workspaceDir : `expected ${workspaceDir}`)
}

console.log('\n[2] the count the prose declares matches the disciplines on disk')
// Prose counts have gone stale four times - #36, #64, #70, and the composition header before 0.12.0 -
// and nothing caught any of them: this file asserted the routing bullets it knew by name, never the
// number the surrounding prose claims. The anchor is the skills directory, because that is what ships;
// the composed persona is a serialisation of the same fact and needs a dump before it can be read.
//
// What this deliberately does NOT cover: LEVEL counts (how many rungs the reading ladder has - the
// 0.12.0 drift was exactly one of those) and behavioural sentences ("creates the scoping document and
// nothing else"). No word count can police those, so the release checklist still owes a read-through;
// a green line here is not permission to skip it.
const skillsDir = join(workspaceDir, 'skills')
const onDisk = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(skillsDir, entry.name, 'SKILL.md')))
  .map((entry) => entry.name)
  .sort()
ok(
  onDisk.length === SHIPPED_NAMES.length,
  'shipped disciplines = the disciplines this file names',
  `${onDisk.length} on disk, ${SHIPPED_NAMES.length} named`,
)
const onDiskNotNamed = onDisk.filter((name) => !SHIPPED_NAMES.includes(name))
const namedNotOnDisk = SHIPPED_NAMES.filter((name) => !onDisk.includes(name))
ok(
  onDiskNotNamed.length === 0 && namedNotOnDisk.length === 0,
  'every discipline on disk is named here, and every name ships',
  [
    ...onDiskNotNamed.map((name) => `on disk, not named: ${name}`),
    ...namedNotOnDisk.map((name) => `named, no directory: ${name}`),
  ].join('; '),
)

// Three places of prose declare that same number, each in its own voice. A site that stops matching
// FAILS rather than passing quietly: a guard that has stopped looking is the defect it was built for.
const declares = [
  // The header no longer says "routing to N": Revision 40 moved the trigger into each catalog entry,
  // so the header declares the count in the sentence that states what the resident layer carries. The
  // pattern stays narrow to the noun phrase so it cannot match an unrelated count elsewhere in the file.
  ['cordis.patch.yml header', patchFile, /([\w-]+) research-discipline skills/i],
  ['package.json description', 'package.json', /([\w-]+) on-demand research disciplines/i],
  ['README.md', 'README.md', /([\w-]+)\s+written disciplines ship/i],
]
for (const [label, file, pattern] of declares) {
  const word = readFileSync(file, 'utf8').replace(/\*/g, '').match(pattern)?.[1]?.toLowerCase()
  const declared = word === undefined ? undefined : (NUMBER_WORDS[word] ?? Number(word))
  ok(
    Number.isInteger(declared) && declared === onDisk.length,
    `${label} declares ${onDisk.length} discipline(s)`,
    word === undefined
      ? 'the sentence that declares the count is gone - teach this check the new wording, do not delete it'
      : `says "${word}"`,
  )
}

console.log('\n[3] composed tree carries the preset')
if (!existsSync(composedFile)) {
  ok(false, 'composed dump exists', `${composedFile} — run: dsh --profile web --dump-config > ${composedFile}`)
} else {
  const composed = readFileSync(composedFile, 'utf8').split('\n')

  // Refuse to report on a snapshot that predates its source.
  const sourceFiles = [patchFile, 'package.json']
  const staleAgainst = sourceFiles.filter((file) => statSync(file).mtimeMs > statSync(composedFile).mtimeMs)
  ok(
    staleAgainst.length === 0,
    'composed dump is newer than the preset source',
    staleAgainst.length === 0
      ? ''
      : `${composedFile} predates ${staleAgainst.join(', ')} — run: dsh --profile web --dump-config > ${composedFile}`,
  )
  const start = composed.findIndex((l) => l.includes('- id: preset-autoresearch'))
  ok(start !== -1, 'row "- id: preset-autoresearch" present')
  let end = composed.length
  for (let i = start + 1; i < composed.length; i++) {
    if (/^- id: /.test(composed[i])) {
      end = i
      break
    }
  }
  const block = start === -1 ? [] : composed.slice(start, end)
  const rowIds = block.map((l) => l.match(/^\s*- id: (\S+)/)?.[1]).filter(Boolean)
  ok(rowIds.length >= 30, 'declared rows', `${rowIds.length} rows`)
  for (const id of [
    'persona',
    'agent-instructions',
    'time-context',
    'skill-filesystem',
    'tool-skill',
    'tool-web',
    'tool-subagent',
    'tool-ask-user',
    'autoresearch-isolation', 'autoresearch-contact', 'autoresearch-skills',
  ]) {
    ok(rowIds.includes(id), `required row: ${id}`)
  }

  // Regression guard: a RELATIVE row name ('./x.js') resolves against the patch file while the
  // composition is built, but against a different base URL during the registry's trial mount.
  // The row then "never started", the whole preset is marked broken, and the new-session roster
  // filters it out. Name such a plugin by a resolvable package subpath instead.
  const relativeNames = block.filter((l) => /^\s*name:\s*['"]?\.\.?\//.test(l))
  ok(
    relativeNames.length === 0,
    'no relative row name (it breaks the registry trial mount)',
    relativeNames.map((l) => l.trim()).join(' | '),
  )

  // The other half of the same failure: a row that names a subpath of THIS bundle must point at a
  // file that exists. A rename that misses the row leaves it unresolvable, which marks the whole
  // preset broken and hides it from the roster exactly like a relative name does.
  const bundleDir = /[\\/]/.test(patchFile) ? patchFile.replace(/[\\/][^\\/]+$/, '') : '.'
  const bundleName = JSON.parse(readFileSync(`${bundleDir}/package.json`, 'utf8')).name
  const unresolved = block
    .map((l) => /^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/.exec(l)?.[1])
    .filter((spec) => spec !== undefined && spec.startsWith(`${bundleName}/`))
    .filter((spec) => !existsSync(`${bundleDir}/${spec.slice(bundleName.length + 1)}`))
  ok(unresolved.length === 0, 'every row naming a bundle subpath exists as a file', unresolved.join(', '))

  // The same catastrophe one layer deeper, and the one that actually bit us. The registry's trial
  // mount resolves each row name from the PROFILE's base URL through Node's resolver, so a package
  // that declares `exports` is sealed by that map. A subpath it omits throws
  // ERR_PACKAGE_PATH_NOT_EXPORTED while the file sits right there and the check above reports OK:
  // the row never starts, the whole preset is marked broken, and it silently disappears from the
  // new-session roster. Ask Node, from the base the mount uses - never the file system.
  const requireFromProfile = createRequire(join(profileDir, 'composed-entry.js'))
  const unresolvable = block
    .map((l) => /^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/.exec(l)?.[1])
    .filter((spec) => spec !== undefined && spec.startsWith(`${bundleName}/`))
    .filter((spec) => {
      try {
        requireFromProfile.resolve(spec)
        return false
      } catch {
        return true
      }
    })
  ok(unresolvable.length === 0, 'every row name resolves through Node from the profile', unresolvable.join(', '))
  // Absent by decision, and named so a later "sync with standard" cannot quietly re-add it. The issue
  // is not the tool but the row: research work has no clock-driven task, and the four schemas would be
  // paid on every request. `time-context` is the neighbouring case with the opposite answer (#90).
  for (const id of ['present', 'tool-ralph', 'tool-schedule']) {
    ok(!rowIds.includes(id), `removed by decision: ${id} absent`)
  }
  // A config field the row's own Config does not declare is not cosmetic - it reads as an implemented
  // feature. All four delegation rows carried `backgroundMode` (two `continuable`, two `one-shot`) from
  // 2026-10-12 to 2026-10-24, while `dsh-tool-subagent` declared only provider / toolName /
  // modelSelectionSettings / agentOptions / maxDepth, and no check in this file could have seen it.
  ok(!/^\s+backgroundMode:/m.test(block.join('\n')), 'no delegation config field the tool does not declare')
  // Leak guard: the preset's own plugin rows must be nested INSIDE the preset. If someone moves them
  // back into a profile-level bundle they leak into every other session in the profile (and the
  // isolation filter would then mask them here).
  const topLevelRows = composed
    .filter((line) => /^- id: /.test(line))
    .map((line) => line.replace(/^- id: /, '').trim())
  for (const id of ['autoresearch-isolation', 'autoresearch-contact', 'autoresearch-skills']) {
    ok(!topLevelRows.includes(id), `leak guard: ${id} is not a profile-level row`)
  }

  // NO EXTERNAL CHANNEL IS AN MCP ROW, and this fails if one comes back. `mcp-arxiv` cost
  // 17,828 characters (~4.95k tokens) of prompt on EVERY request for 19 tools; `mcp-zotero` cost
  // 59,758 (~16.6k) for 35. Together 21,551 tokens per request, for the handful of tools the
  // disciplines actually call - and the MCP client has no field that filters a server's tool list, so
  // a re-added row is a silent cost nobody would notice from a bill. Every channel is a command-line
  // helper now, at zero resident cost. See docs/decisions.md #29 and #31 for the measurements.
  const blockText = block.join('\n')
  for (const [row, spec] of [
    ['mcp-arxiv', 'arxiv-mcp-server'],
    ['mcp-zotero', 'zotero-mcp-server'],
  ]) {
    ok(!blockText.includes(`- id: ${row}`), `${row} is not mounted as an MCP row again`)
    ok(!blockText.includes(spec), `no ${spec} spec is named in the composition`)
  }

  console.log('\n[4] source persona survives into the composed tree')
  const sourcePersona = extractBlockScalar(readFileSync(patchFile, 'utf8').split('\n'), /^\s+prefix: [|>]-/)
  const composedPersona = extractBlockScalar(composed, /^\s+prefix: [|>]-/)
  ok(Boolean(sourcePersona), 'source persona extracted')
  ok(Boolean(composedPersona), 'composed persona extracted')
  if (sourcePersona && composedPersona) {
    const flat = (t) => t.replace(/\s+/g, '')
    const paras = sourcePersona
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean)
    const composedFlat = flat(composedPersona)
    const missing = paras.filter((p) => !composedFlat.includes(flat(p)))
    ok(missing.length === 0, `all ${paras.length} paragraphs intact`, missing.length ? `missing ${missing.length}` : '')
    missing.forEach((p) => console.log(`         lost: ${p.slice(0, 100)}`))

    console.log('\n[5] discipline rules and routing')
    const rules = composedPersona.match(/^\d+\. \*\*/gm) ?? []
    ok(rules.length === 12, 'twelve numbered discipline rules', `found ${rules.length}`)
    // The count alone cannot tell "12 rules" from "11 rules plus a stray sentence turned rule".
    // Named on purpose: the document-shape rule is the one this preset just paid to add, and it now
    // carries two clauses — one carrier, and the current state first.
    ok(composedPersona.includes('One carrier, current state first'), 'rule 12 carries the one-carrier and state-first rule')
    // Revision 40 moved the TRIGGER out of the resident layer: each discipline's catalog entry states
    // it (only name + description reach the model, capped at 500 characters by `tool-skill`), and the
    // resident layer keeps the three things the catalog cannot say — the order, the force of the rule,
    // and how an entry this preset does not ship is treated. A bullet per discipline is the defect
    // this check exists to prevent: 13 of them cost 747 tokens on every request to repeat the catalog.
    const flatPersona = composedPersona.replace(/\s+/g, '')
    const bullets = SHIPPED_NAMES.filter((n) => flatPersona.includes(`→\`${n}\``))
    ok(bullets.length === 0, 'no per-discipline routing bullet (the catalog carries the trigger)', `found ${bullets.length}`)
    ok(flatPersona.includes('theorderoftheloopdecides'), 'the routing states the order of the loop')
    ok(composedPersona.includes('hard rules'), 'the routing keeps the force of the rule')
    ok(flatPersona.includes('doesnotshipbelongstotheprofile'), 'the routing states how a foreign entry is treated')
    ok(composedPersona.includes('{{model}}'), '{{model}} placeholder intact')
    // Retired on purpose, and named so it cannot come back: 0.2.0 registered `cwd` as a prompt
    // variable and 0.2.1 replaced it with the REQUIRED runtime context "Current working directory:
    // ...". The whole class of that mistake is what the next check catches (#47).
    ok(!blockText.includes('{{cwd}}'), '{{cwd}} is not referenced (the kernel no longer registers it)')
    const registered = registeredPromptVariables()
    const referenced = [...new Set([...blockText.matchAll(/\{\{([^{}]*)\}\}/g)].map((m) => m[1]))]
    const unregistered = registered === null ? referenced : referenced.filter((n) => !registered.includes(n))
    ok(
      registered !== null && unregistered.length === 0,
      'every {{placeholder}} in the preset is a prompt variable the kernel registers',
      registered === null
        ? 'could not read the kernel registry (@deepseek-ai/dsh-agent-loop, from the profile)'
        : `${referenced.map((n) => `{{${n}}}`).join(', ') || '(none)'} / kernel registers: ${registered.join(', ') || '(none)'}`,
    )
    // The reverse of the retired check: the resident layer must not name the disciplines, because
    // naming one here is either a routing bullet growing back or a digest that belongs to its skill.
    // The names stay in this file (SHIPPED_NAMES) so the count in [2] still has one authority.
    const namedInPersona = SHIPPED_NAMES.filter((name) => composedPersona.includes(name))
    ok(namedInPersona.length === 0, 'the resident layer names no discipline (the catalog does)', namedInPersona.join(', '))

    console.log('\n[6] always-on cost')
    console.log(`    persona: ${composedPersona.length} chars, ~${Math.round(composedPersona.length / 3.6)} tokens per request`)
  }
}

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures} check(s))`}`)
process.exit(failures === 0 ? 0 : 1)
