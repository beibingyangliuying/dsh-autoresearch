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
//   [2] the composed dump is NEWER than the preset source, and the composed tree it holds contains
//       the preset with the expected plugin rows
//       (a stale dump is worse than none: it reports both false passes and false failures about a
//        reality that no longer exists. This check exists because that actually happened.)
//   [3] every paragraph of the source persona survives into the composed tree
//       (the tree re-serialises the scalar with `>-`, so compare ignoring whitespace)
//   [4] all discipline rules and skill-routing bullets are present
//   [5] always-on cost of the persona
// Exit code is 1 when any check fails.
import { readFileSync, lstatSync, readlinkSync, realpathSync, existsSync, statSync } from 'node:fs'
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

console.log('\n[2] composed tree carries the preset')
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
  for (const id of ['present', 'tool-ralph']) {
    ok(!rowIds.includes(id), `removed by decision: ${id} absent`)
  }
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

  console.log('\n[3] source persona survives into the composed tree')
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

    console.log('\n[4] discipline rules and routing bullets')
    const rules = composedPersona.match(/^\d+\. \*\*/gm) ?? []
    ok(rules.length === 11, 'eleven numbered discipline rules', `found ${rules.length}`)
    const flatPersona = composedPersona.replace(/\s+/g, '')
    const bullets = ['research-scoping', 'literature-recon', 'collection-sweep', 'reading-triage', 'section-notes', 'adoption-ruling', 'redteam-ruling', 'progress-sync', 'metadata-query', 'subagent-contract', 'experiment-protocol', 'synthesis-plan'].filter(
      (n) => flatPersona.includes(`→\`${n}\``),
    )
    ok(bullets.length === 12, 'twelve skill-routing bullets', `found ${bullets.length}`)
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
    for (const name of ['research-scoping', 'literature-recon', 'collection-sweep', 'reading-triage', 'section-notes', 'adoption-ruling', 'redteam-ruling', 'progress-sync', 'metadata-query', 'subagent-contract', 'experiment-protocol', 'synthesis-plan']) {
      ok(composedPersona.includes(name), `routing names: ${name}`)
    }

    console.log('\n[5] always-on cost')
    console.log(`    persona: ${composedPersona.length} chars, ~${Math.round(composedPersona.length / 3.6)} tokens per request`)
  }
}

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures} check(s))`}`)
process.exit(failures === 0 ? 0 : 1)
