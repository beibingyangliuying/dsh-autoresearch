// Ships this preset's discipline skills inside the bundle.
//
// `ctx.skills.register()` files a registration into the CALLING scope's layer, and — per the skills
// registry — "a plugin mounted by an agent preset's standing composition lands in that preset's
// layer". So these disciplines reach agents of this preset and nobody else, which is the right
// boundary: copying them into the user skill directory instead would inject the whole discipline set
// into every session in the profile, including unrelated work.
//
// The bodies are read from disk rather than embedded, so the files under `skills/` remain the single
// source of truth and editing one needs no rebuild.
//
// A body that names one of this preset's own command-line helpers does so with the `{{presetTools}}`
// token, which is filled in at registration with the absolute helper directory (`preset-paths.js`).
// A relative `tools/...` path would point at the AGENT's working directory — a study workspace, which
// the scaffold gives no `tools/` — and the agent would have to hunt for this checkout instead of
// running the tool.
//
// Why not `skill-filesystem`'s `bundledSkillDir`: that field is passed through Node's `path.resolve`,
// which resolves a relative value against the host process's working directory. A checked-in bundle
// cannot supply a correct absolute path, and config expressions cannot see `import.meta`. Registering
// from this row's own module URL avoids the whole question.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { fillToolsPath } from './preset-paths.js'

export const name = 'autoresearch-skills'

/** The skill registry this row contributes to. */
export const inject = ['skills']

/** Package-relative root of the shipped disciplines. */
const SKILLS_DIR = new URL('./skills/', import.meta.url)

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

/** Read `key: value` scalars from a skill's YAML front matter. This preset's skills use no nesting. */
export function parseSkill(source) {
  const match = FRONT_MATTER.exec(source)
  if (match === null) return undefined

  const fields = {}
  for (const line of match[1].split(/\r?\n/)) {
    const field = /^([A-Za-z_][A-Za-z0-9_-]*):[ \t]*(.*)$/.exec(line.trim())
    if (field === null) continue
    let value = field[2].trim()
    const quoted = value.length > 1 && (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'"))
    if (quoted) value = value.slice(1, -1)
    fields[field[1]] = value
  }
  return { fields, body: source.slice(match[0].length) }
}

/** Every shipped discipline, read from disk. A malformed or unnamed file is skipped, not thrown. */
export function readSkills(dir = SKILLS_DIR) {
  const skills = []
  // Deliberately not `Dirent.isDirectory()`: on Windows a reparse point (OneDrive placeholders, a
  // junction) reports false there while still holding files, so look for the skill file instead.
  for (const name of readdirSync(dir)) {
    const file = new URL(`${name}/SKILL.md`, dir)
    if (!existsSync(file)) continue
    const parsed = parseSkill(readFileSync(file, 'utf8'))
    if (parsed?.fields.name === undefined || parsed.fields.description === undefined) continue
    skills.push({
      name: parsed.fields.name,
      description: parsed.fields.description,
      ...(parsed.fields.whenToUse === undefined ? {} : { whenToUse: parsed.fields.whenToUse }),
      content: parsed.body,
      source: 'bundled',
      resourceBase: { kind: 'directory', path: fileURLToPath(new URL(`${name}/`, dir)) },
    })
  }
  return skills
}

export function apply(ctx) {
  for (const skill of readSkills()) {
    // The helper path is filled HERE rather than in `readSkills`, so the files under `skills/` stay
    // the single source of truth: a reader sees the token they contain, and a test can assert both
    // the token and its substitution.
    ctx.skills.register({ ...skill, content: fillToolsPath(skill.content) })
  }
}
