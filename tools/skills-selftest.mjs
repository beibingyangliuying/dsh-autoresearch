// Unit self-test for the shipped-discipline registration, runnable without DSH.
//
// Usage: node tools/skills-selftest.mjs
//
// Two things are load-bearing:
//   1. every shipped skill file parses — a malformed front matter is dropped SILENTLY by skill
//      providers, so a typo would remove a whole discipline with no visible error;
//   2. registration goes through `ctx.skills.register()` for every skill, which is how these reach
//      agents of this preset (and only this preset) without any manual copy step.
import { existsSync } from 'node:fs'
import { TOOLS_TOKEN, cliToolsDir } from '../preset-paths.js'
import { apply, parseSkill, readSkills } from '../skills.js'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('shipped skills self-test')

// --- the front-matter reader -------------------------------------------------------------------

const sample = parseSkill('---\nname: a-skill\ndescription: "quoted: value"\nwhenToUse: b\n---\nbody line\n')
check(sample?.fields.name === 'a-skill', 'reads an unquoted scalar', String(sample?.fields.name))
check(sample?.fields.description === 'quoted: value', 'strips quotes and keeps inner colons', String(sample?.fields.description))
check(sample?.fields.whenToUse === 'b', 'reads the optional whenToUse field')
check(sample?.body.trim() === 'body line', 'body excludes the front matter')
check(parseSkill('no front matter here') === undefined, 'a file without front matter yields undefined')
check(parseSkill('---\nname: a\n') === undefined, 'an unterminated front matter yields undefined')

// --- the shipped files -------------------------------------------------------------------------

const skills = readSkills()
check(skills.length === 13, 'thirteen disciplines ship with the bundle', `found=${skills.length}`)

for (const skill of skills) {
  const problems = []
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill.name)) problems.push('name is not kebab-case')
  if (typeof skill.description !== 'string' || skill.description.length < 20) problems.push('description is missing or too short')
  if (typeof skill.content !== 'string' || skill.content.length < 500) problems.push('body is missing or suspiciously short')
  if (skill.source !== 'bundled') problems.push(`source is ${skill.source}`)
  if (skill.resourceBase?.kind !== 'directory') problems.push('resource base is not a directory')
  if (/^---/.test(skill.content)) problems.push('body still carries front matter')
  check(problems.length === 0, `valid: ${skill.name}`, problems.join('; '))
}

const names = new Set(skills.map((skill) => skill.name))
check(names.size === skills.length, 'no two shipped skills claim the same name')

// The disciplines the persona routes to must all be present, or routing points at nothing.
for (const expected of [
  'research-scoping',
  'literature-recon',
  'reading-triage',
  'section-notes',
  'adoption-ruling',
  'redteam-ruling',
  'progress-sync',
  'metadata-query',
  'subagent-contract',
  'experiment-protocol',
  'synthesis-plan',
  'direction-probe',
]) {
  check(names.has(expected), `shipped: ${expected}`)
}

// --- helper paths named by the shipped bodies ----------------------------------------------------
// A shipped body is static Markdown, so it names this preset's own CLI helpers through the
// `{{presetTools}}` token and `apply()` fills in the absolute directory. Two failures are silent
// otherwise: a relative `tools/...` path resolves against the AGENT's working directory (a study
// workspace, which the scaffold gives no `tools/`) and finds nothing, and a token naming no shipped
// file ships a command that cannot run.

const relativeHelperPath = /(?<![\w/.-])tools\/[a-z0-9-]+\.(?:mjs|ps1|js)\b/
for (const skill of skills) {
  check(!relativeHelperPath.test(skill.content), `no relative helper path in: ${skill.name}`)
}

const namedHelpers = [
  ...new Set(
    skills.flatMap((skill) => [...skill.content.matchAll(/\{\{presetTools\}\}\/([a-z0-9-]+\.mjs)/g)].map((m) => m[1])),
  ),
]
check(namedHelpers.length > 0, 'a shipped body names a helper through the token', namedHelpers.join(', '))
for (const helper of namedHelpers) {
  check(existsSync(new URL(`../tools/${helper}`, import.meta.url)), `the token names a helper that exists: ${helper}`)
}

// --- registration ------------------------------------------------------------------------------

const registered = []
apply({
  skills: {
    register: (skill) => {
      registered.push(skill)
      return () => {}
    },
  },
})

check(registered.length === skills.length, 'apply() registers every shipped skill', `registered=${registered.length}`)
check(
  registered.every((skill) => typeof skill.content === 'string' && skill.content.length > 0),
  'every registration carries its body',
)
check(
  registered.every((skill) => !skill.content.includes(TOOLS_TOKEN)),
  'every registration has its helper token filled in',
)
check(
  registered.every((skill) => !relativeHelperPath.test(skill.content)),
  'no registration carries a relative helper path',
)
check(
  registered.some((skill) => skill.content.includes(cliToolsDir)),
  'the substituted body carries the absolute helper directory',
  cliToolsDir,
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
