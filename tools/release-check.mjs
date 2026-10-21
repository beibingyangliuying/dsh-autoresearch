#!/usr/bin/env node
// Release check: what the working tree says, and what a NEW user would actually install.
//
// WHY THIS FILE EXISTS
//
// 0.2.0 was published after 47 commits had accumulated unpublished. The local suite was green, the
// reader-facing documents were correct, and `--dump-config` described the new composition - while
// anyone following the README's install command got a version that still mounted two MCP servers
// through `uvx`. Every other check in this repository reads the working tree, so none of them could
// see it. This one has a mode that reads the PUBLISHED artifact instead.
//
//   --local        the working tree: version, composition, row names against `exports`, and whether
//                  every self-test that exists is documented in the README.
//   --tag vX.Y.Z   the published package at that tag: its version, its composition, its helper
//                  programs, and whether the tag still names the commit the branch head does.
//
// Usage:
//   node tools/release-check.mjs --local
//   node tools/release-check.mjs --tag v0.2.0 [--repo owner/name]
//
// Exit codes: 0 every check passed | 1 at least one check failed - the artifact is wrong | 2 usage |
// 3 at least one check could not run (no network, no git) and nothing that did run failed. 3 is not a
// weaker 1: nothing was examined there, so neither PASS nor FAIL would be true of it.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DEFAULT_REPO = 'beibingyangliuying/dsh-autoresearch'

/**
 * Helpers whose absence means the external channels do not work in the published package.
 *
 * A hand-written roster, and a roster-based check cannot see what its own roster omits: this list was
 * written before the reading ladder existed, so the published package was checked for a helper nobody
 * had added yet, and `zotero-pdf.mjs` was missing until 6f80323. The same held for every write-side
 * helper named after that, and for `metadata.mjs`, which the disciplines name ten times.
 *
 * Two directions are checked, and only one of them is this list: `namedHelperProblems` derives the
 * DEMAND side from the text a discipline hands an agent, and fails when this roster does not carry a
 * helper it names. An entry here is therefore not a claim that the helper is named anywhere - the
 * shared transport, the in-app snippet and the attachment tool are listed because a channel stops
 * working without them.
 */
export const REQUIRED_HELPERS = [
  'preset-paths.js',
  'tools/arxiv.mjs',
  'tools/metadata.mjs',
  'tools/zotero-read.mjs',
  'tools/zotero-pdf.mjs',
  'tools/zotero-write.mjs',
  'tools/zotero-edit.mjs',
  'tools/zotero-collection.mjs',
  'tools/zotero-section-note.mjs',
  'tools/zotero-link-attachments.mjs',
  'tools/zotero-local-api.mjs',
  'tools/zotero-link-snippet.js',
]

class UsageError extends Error {}

/**
 * The composition's executable lines, with comments removed.
 *
 * A composition EXPLAINS its decisions in comments, and the names of the removed servers appear there
 * on purpose (`do not add either row back`). A check that flagged those would be turned off within a
 * day, so only non-comment lines count.
 *
 * @param {string} text The composition file.
 * @returns {string[]} Lines that the loader would read as configuration.
 */
export function codeLines(text) {
  return String(text)
    .split(/\r?\n/)
    .filter((line) => !/^\s*#/.test(line))
}

/**
 * What the composition must never contain again.
 *
 * @param {string} text The composition file.
 * @returns {string[]} One message per offending line; empty when the composition is clean.
 */
export function compositionProblems(text) {
  const problems = []
  for (const line of codeLines(text)) {
    const trimmed = line.trim()
    if (/^-?\s*id:\s*mcp-/.test(trimmed)) problems.push(`an MCP row is mounted again: ${trimmed}`)
    if (/^serverName:\s*\S/.test(trimmed)) problems.push(`a server names itself in the composition: ${trimmed}`)
    if (/^command:\s*\S/.test(trimmed)) problems.push(`the composition launches an external command: ${trimmed}`)
    if (/\buvx\b/.test(trimmed)) problems.push(`a Python tool runner is named: ${trimmed}`)
  }
  return problems
}

const SEMVER = /^\d+\.\d+\.\d+$/

/**
 * Whether a `package.json` declares a usable version, optionally the one expected.
 *
 * @param {string} text The file's contents.
 * @param {{expected?: string}} [options] The version a tag implies, when checking a published package.
 * @returns {string[]} Problems; empty when the declaration is usable.
 */
export function versionProblems(text, { expected } = {}) {
  let pkg
  try {
    pkg = JSON.parse(text)
  } catch (error) {
    return [`package.json is not valid JSON: ${error.message}`]
  }
  if (typeof pkg.version !== 'string' || !SEMVER.test(pkg.version)) {
    return [`version is not a plain semver: ${String(pkg.version)}`]
  }
  if (expected !== undefined && pkg.version !== expected) {
    return [`the package declares ${pkg.version} while the tag says ${expected}`]
  }
  return []
}

/** The version a tag name implies, e.g. `v0.2.0` -> `0.2.0`. */
export function versionOfTag(tag) {
  return String(tag).replace(/^v/, '')
}

/** Every row name in the composition that belongs to this bundle (its own name, or a subpath). */
export function bundleRowSpecs(patchText, bundleName) {
  return [
    ...String(patchText).matchAll(/^\s*name:\s*['"]?([^'"\s]+)['"]?\s*$/gm),
  ]
    .map((match) => match[1])
    .filter((spec) => spec === bundleName || spec.startsWith(`${bundleName}/`))
}

/**
 * Whether each row name this bundle's composition declares can be resolved at all.
 *
 * A package that declares `exports` seals its own subpaths: a subpath the map omits throws
 * ERR_PACKAGE_PATH_NOT_EXPORTED while the file sits on disk, the row never starts, the whole preset is
 * marked broken, and the new-session roster hides it. The map is the only thing this check can read
 * without a profile, and it is where that failure comes from.
 *
 * @param {string} pkgText This bundle's manifest.
 * @param {string} bundleName Its package name.
 * @param {string[]} specs Row names taken from the composition.
 * @returns {string[]} Problems; empty when every row name is exported.
 */
export function exportProblems(pkgText, bundleName, specs) {
  const map = JSON.parse(pkgText).exports ?? {}
  const problems = []
  for (const spec of new Set(specs)) {
    const key = spec === bundleName ? '.' : `./${spec.slice(bundleName.length + 1)}`
    if (typeof map[key] !== 'string') problems.push(`${spec} is declared by a row but exports has no "${key}"`)
  }
  return problems
}

/**
 * Which self-tests exist, which the README documents, and each list's extras.
 *
 * The README states the suite inside a fenced block, and the documentation self-test only judges prose
 * paths - so a new tool that nobody documented was, until now, nobody's check.
 *
 * @param {string} readmeText The entry document.
 * @param {string[]} files Names in `tools/`.
 * @returns {{documented: string[], undocumented: string[], stale: string[]}}
 */
export function documentedSelftests(readmeText, files) {
  const documented = new Set(
    [...String(readmeText).matchAll(/tools[\\/]([A-Za-z0-9._-]+-selftest)\.mjs/g)].map((match) => match[1]),
  )
  const actual = files
    .filter((name) => name.endsWith('-selftest.mjs'))
    .map((name) => name.replace(/\.mjs$/, ''))
  return {
    documented: [...documented].sort(),
    undocumented: actual.filter((name) => !documented.has(name)).sort(),
    stale: [...documented].filter((name) => !actual.includes(name)).sort(),
  }
}

/**
 * The helpers a discipline hands an agent, against the roster the published-package check fetches.
 *
 * Why this exists: `REQUIRED_HELPERS` is written by hand, so it only ever contained the helpers someone
 * remembered. It was written before the reading ladder, and `zotero-pdf.mjs` was missing from it while
 * Revision 17's disciplines already told an agent to run that program (closed in 6f80323). That fix
 * added the one helper the round had noticed and left the class open: every write-side helper, and
 * `metadata.mjs`, were still outside the roster while the disciplines named them in commands.
 *
 * The guard is deliberately narrow. It reads ONE token, `{{presetTools}}`, because that is the only way
 * a shipped discipline may address a helper at all; prose that names a path without the token is a
 * documentation question, and a regex over every path-looking string would fire on fixtures too.
 *
 * @param {string[]} texts Discipline bodies in which a helper command appears.
 * @param {string[]} roster Paths as {@link REQUIRED_HELPERS} spells them, e.g. `tools/arxiv.mjs`.
 * @returns {string[]} One message per named helper the roster does not carry; empty when it carries all.
 */
export function namedHelperProblems(texts, roster) {
  const known = new Set(roster)
  const problems = new Set()
  for (const text of texts) {
    for (const match of String(text).matchAll(/\{\{presetTools\}\}\/([A-Za-z0-9._-]+)/g)) {
      const path = `tools/${match[1]}`
      if (!known.has(path)) problems.add(`${match[1]} is handed to an agent but REQUIRED_HELPERS omits ${path}`)
    }
  }
  return [...problems]
}

// stderr is piped rather than inherited: `gitReason` turns it into one printed line, so a check that
// could not run does not also spray git's own "fatal:" text above the explanation.
const g = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

/** Why a git call failed, without git's "Command failed: ..." wrapper in front of the real reason. */
function gitReason(error) {
  const stderr = String(error.stderr ?? '').trim()
  return (stderr || String(error.message)).split(/\r?\n/)[0]
}

/**
 * The three outcomes, and the exit code each one means.
 *
 * A check that could not RUN is not a failed check. When the network or git is unavailable the artifact
 * was never examined, so `FAIL` accuses a release nobody looked at and `PASS` certifies one nobody read.
 * Both halves of that happened while verifying 0.14.0: a dead git proxy ended a run in which every
 * substantive check had passed, and a network error printed as `FAIL the tag is readable`, which reads
 * like a defect in the package.
 *
 * A failure outranks an unverifiable check: something IS known to be wrong.
 *
 * @param {{failed?: number, unverified?: number}} tally What the checks reported.
 * @returns {{text: string, code: number}} The closing line and the exit code.
 */
export function summary({ failed = 0, unverified = 0 } = {}) {
  if (failed > 0) return { text: `FAIL (${failed} check(s))`, code: 1 }
  if (unverified > 0) {
    return {
      text: `UNVERIFIED (${unverified} check(s) could not run - nothing was proven about the artifact there)`,
      code: 3,
    }
  }
  return { text: 'PASS', code: 0 }
}

/** One check line. `problems` name what is wrong with the artifact, so any of them fails the run. */
function report(tally, label, problems = []) {
  if (problems.length === 0) {
    console.log(`  OK   ${label}`)
    return
  }
  tally.failed += 1
  console.log(`  FAIL ${label}`)
  for (const problem of problems) console.log(`         ${problem}`)
}

/** A check that never ran, counted apart because it says nothing about the artifact. */
function unverified(tally, label, reason) {
  tally.unverified += 1
  console.log(`  UNVERIFIED ${label}`)
  console.log(`         ${reason}`)
}

function checkLocal() {
  const tally = { failed: 0, unverified: 0 }
  const pkgText = readFileSync(join(ROOT, 'package.json'), 'utf8')
  const patchText = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8')
  const readmeText = readFileSync(join(ROOT, 'README.md'), 'utf8')
  const bundleName = JSON.parse(pkgText).name

  console.log(`[local] ${bundleName} at ${ROOT}`)
  // The version alone is not a failure: a working tree is allowed to be mid-release. It is printed so
  // the number someone is about to tag is on screen while they read the rest.
  console.log(`  OK   declared version ${JSON.parse(pkgText).version}`)
  report(tally, 'composition mounts no MCP server and launches nothing', compositionProblems(patchText))
  report(
    tally,
    'every row name resolves through exports',
    exportProblems(pkgText, bundleName, bundleRowSpecs(patchText, bundleName)),
  )
  const tests = documentedSelftests(readmeText, readdirSync(join(ROOT, 'tools')))
  report(tally, 'every self-test in tools/ is documented in the README', tests.undocumented.map((n) => `${n} exists but the README does not name it`))
  report(tally, 'the README names no self-test that is gone', tests.stale.map((n) => `${n} is documented but does not exist`))
  console.log(`         ${tests.documented.length} self-tests documented`)

  // The demand side of the roster: what the skills actually tell an agent to run. Reading it here is
  // what makes the roster fail when a discipline starts naming a helper nobody added.
  const skillDir = join(ROOT, 'skills')
  const disciplineTexts = readdirSync(skillDir).map((name) => readFileSync(join(skillDir, name, 'SKILL.md'), 'utf8'))
  report(tally, 'every helper a discipline hands an agent is on the required roster', namedHelperProblems(disciplineTexts, REQUIRED_HELPERS))

  // The clean-tree line is a precondition for tagging, so it has to be able to say "I could not look"
  // rather than "the tree is dirty" when git itself is what failed.
  try {
    const dirty = g(['status', '--porcelain'])
    report(
      tally,
      'the working tree is clean (a precondition for tagging, not for developing)',
      dirty === '' ? [] : dirty.split('\n').map((path) => `uncommitted: ${path.trim()}`),
    )
  } catch (error) {
    unverified(tally, 'the working tree is clean (a precondition for tagging, not for developing)', gitReason(error))
  }
  try {
    const unpublished = Number(g(['rev-list', '--count', 'origin/main..HEAD']))
    console.log(`         ${unpublished} commit(s) not on origin/main`)
    if (unpublished > 0) {
      console.log('         NOTE: this number was 47 on the day 0.2.0 was published, and no local check')
      console.log('               could see it. `--tag` reads what a new user would actually install.')
    }
  } catch {
    console.log('         NOTE: no origin/main is known here, so unpublished work cannot be counted')
  }
  return tally
}

/**
 * The refs to ask `git ls-remote` for, in order to resolve a tag to its commit.
 *
 * The peeled form must be requested EXPLICITLY. `git ls-remote <remote> refs/tags/v0.2.1` answers only
 * the tag object, so `taggedCommit` would fall back to a hash that can never equal a branch head - the
 * false note would survive a fix that merely prefers the peeled line. Asking for `^{}` costs nothing:
 * a lightweight tag simply has no such ref, and the fallback below covers it.
 *
 * @param {string} tag The tag name, e.g. `v0.2.1`.
 * @returns {string[]} Arguments to hand `git ls-remote` after the remote name.
 */
export function tagRefQuery(tag) {
  return ['refs/heads/main', `refs/tags/${tag}`, `refs/tags/${tag}^{}`]
}

/**
 * The commit a tag names, out of `git ls-remote`'s output.
 *
 * An annotated tag answers TWO lines: the tag object, and the commit it peels to under `^{}`. Taking
 * the first line that ends with the tag's own name therefore compared a tag object's hash against a
 * branch head's commit hash - different kinds of object that can never be equal - so the note in
 * `checkTag` fired on every annotated release, including one whose tag named the branch head exactly.
 * It said the branch had moved past v0.2.1 while `refs/tags/v0.2.1^{}` and `refs/heads/main` were the
 * same commit.
 *
 * @param {string} refs The stdout of `git ls-remote`, from a query that includes {@link tagRefQuery}'s.
 * @param {string} tag The tag name, e.g. `v0.2.1`.
 * @returns {string|undefined} The commit the tag names, or undefined when the output carries no such ref.
 */
export function taggedCommit(refs, tag) {
  const hashAfter = (suffix) =>
    String(refs)
      .split('\n')
      .filter(Boolean)
      .find((line) => line.endsWith(suffix))
      ?.split('\t')[0]
  // A lightweight tag answers only the second form; an annotated one must be peeled to reach its commit.
  return hashAfter(`refs/tags/${tag}^{}`) ?? hashAfter(`refs/tags/${tag}`)
}

/**
 * The branch head commit out of the same `git ls-remote` output.
 *
 * @param {string} refs The stdout of `git ls-remote`.
 * @returns {string|undefined} The commit `refs/heads/main` names.
 */
export function branchHead(refs) {
  return String(refs)
    .split('\n')
    .filter(Boolean)
    .find((line) => line.endsWith('refs/heads/main'))
    ?.split('\t')[0]
}

async function checkTag(tag, repo) {
  console.log(`[${tag}] published package in ${repo}`)
  const tally = { failed: 0, unverified: 0 }
  const raw = (path) => `https://raw.githubusercontent.com/${repo}/${tag}/${path}`

  /**
   * One file from the published tag. A 404 is the answer "it is not there" - which is a statement about
   * the release - while a thrown fetch is the answer "nobody asked", which is not.
   */
  const fetchText = async (path) => {
    const response = await fetch(raw(path))
    if (response.status === 404) return { missing: true }
    if (!response.ok) throw new Error(`${raw(path)} answered HTTP ${response.status}`)
    return { text: await response.text() }
  }

  let pkgText
  let patchText
  try {
    const manifest = await fetchText('package.json')
    if (manifest.missing) {
      report(tally, `${tag} exists on the remote and carries a package.json at its root`, [
        `${raw('package.json')} answers HTTP 404 - an install from this tag cannot work`,
      ])
      return tally
    }
    pkgText = manifest.text
    const patch = await fetchText('cordis.patch.yml')
    if (patch.missing) {
      report(tally, `the tag carries a composition`, [`${raw('cordis.patch.yml')} answers HTTP 404`])
      return tally
    }
    patchText = patch.text
  } catch (error) {
    unverified(tally, 'the published package could be read', error.message)
    return tally
  }
  report(
    tally,
    `the published package declares the version the tag implies (${versionOfTag(tag)})`,
    versionProblems(pkgText, { expected: versionOfTag(tag) }),
  )
  report(tally, 'the published composition mounts no MCP server and launches nothing', compositionProblems(patchText))

  const missing = []
  let unreadable = ''
  for (const path of REQUIRED_HELPERS) {
    try {
      const response = await fetch(raw(path))
      if (response.status === 404) missing.push(`${path} is not in the published package`)
      else if (!response.ok) missing.push(`${path} answers HTTP ${response.status}`)
    } catch (error) {
      unreadable = error.message
      break
    }
  }
  const helperLabel = 'every helper program the channels need is inside the published package'
  if (unreadable) unverified(tally, helperLabel, unreadable)
  else report(tally, helperLabel, missing)

  // The comparison with the branch head needs git, and git needs a working network of its own. When it
  // cannot answer, that is one unexamined question - not a broken release, which is what 0.14.0's own
  // verification was told while every other check had passed.
  try {
    const refs = g(['ls-remote', 'origin', ...tagRefQuery(tag)])
    const head = branchHead(refs)
    const tagged = taggedCommit(refs, tag)
    console.log(`  OK   ${tag} -> ${tagged ?? '(not fetched)'}, main -> ${head ?? '(not fetched)'}`)
    if (tagged !== undefined && head !== undefined && tagged !== head) {
      // Not a failure: main is allowed to move on after a release. It matters because "the fix is
      // published" and "the release contains the fix" are different statements.
      console.log('         NOTE: the branch head has moved past this tag, so main carries changes this release does not.')
    }
  } catch (error) {
    unverified(tally, `${tag} names the commit the branch head does`, `git could not ask the remote: ${gitReason(error)}`)
  }
  return tally
}

async function main() {
  const argv = process.argv.slice(2)
  const value = (flag) => {
    const index = argv.indexOf(flag)
    return index === -1 ? undefined : argv[index + 1]
  }
  const tag = value('--tag')
  const repo = value('--repo') ?? DEFAULT_REPO
  if (tag === undefined && !argv.includes('--local')) {
    throw new UsageError('pass --local, or --tag <tag> to check a published package')
  }
  const tally = tag === undefined ? checkLocal() : await checkTag(tag, repo)
  const { text, code } = summary(tally)
  console.log(`\n${text}`)
  process.exit(code)
}

// Only act when this file IS the command: the self-test imports the pure functions above, and an
// import must not read the network or exit the process.
const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

// NOT `await main()`: see tools/arxiv.mjs - a pending top-level await here would leave the module
// mid-evaluation for anything that imports it.
if (isEntryPoint) {
  main().catch((error) => {
    if (error instanceof UsageError) {
      console.error(`${error.message}\nUsage: node tools/release-check.mjs --local | --tag <tag> [--repo owner/name]`)
      process.exit(2)
    }
    console.error(`\nERROR: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
