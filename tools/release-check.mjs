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
// Exit codes: 0 every check passed | 1 at least one check failed | 2 usage.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const DEFAULT_REPO = 'beibingyangliuying/dsh-autoresearch'

/** Helpers whose absence means the external channels do not work in the published package. */
export const REQUIRED_HELPERS = [
  'preset-paths.js',
  'tools/arxiv.mjs',
  'tools/metadata.mjs',
  'tools/zotero-read.mjs',
  'tools/zotero-pdf.mjs',
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

const g = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

/** One `PASS`/`FAIL` line per check, and the failures that decide the exit code. */
function report(label, problems) {
  const failed = problems.length > 0
  console.log(`  ${failed ? 'FAIL' : 'OK  '} ${label}`)
  for (const problem of problems) console.log(`         ${problem}`)
  return failed ? 1 : 0
}

async function checkLocal() {
  const pkgText = readFileSync(join(ROOT, 'package.json'), 'utf8')
  const patchText = readFileSync(join(ROOT, 'cordis.patch.yml'), 'utf8')
  const readmeText = readFileSync(join(ROOT, 'README.md'), 'utf8')
  const bundleName = JSON.parse(pkgText).name
  let failures = 0

  console.log(`[local] ${bundleName} at ${ROOT}`)
  // The version alone is not a failure: a working tree is allowed to be mid-release. It is printed so
  // the number someone is about to tag is on screen while they read the rest.
  console.log(`  OK   declared version ${JSON.parse(pkgText).version}`)
  failures += report('composition mounts no MCP server and launches nothing', compositionProblems(patchText))
  failures += report(
    'every row name resolves through exports',
    exportProblems(pkgText, bundleName, bundleRowSpecs(patchText, bundleName)),
  )
  const tests = documentedSelftests(readmeText, readdirSync(join(ROOT, 'tools')))
  failures += report('every self-test in tools/ is documented in the README', tests.undocumented.map((n) => `${n} exists but the README does not name it`))
  failures += report('the README names no self-test that is gone', tests.stale.map((n) => `${n} is documented but does not exist`))
  console.log(`         ${tests.documented.length} self-tests documented`)

  const dirty = g(['status', '--porcelain'])
  failures += report(
    'the working tree is clean (a precondition for tagging, not for developing)',
    dirty === '' ? [] : dirty.split('\n').map((path) => `uncommitted: ${path.trim()}`),
  )
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
  return failures
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
  let failures = 0
  const raw = (path) => `https://raw.githubusercontent.com/${repo}/${tag}/${path}`

  let pkgText
  let patchText
  try {
    pkgText = await (await fetch(raw('package.json'))).text()
    patchText = await (await fetch(raw('cordis.patch.yml'))).text()
  } catch (error) {
    console.log(`  FAIL the tag is readable: ${error.message}`)
    return 1
  }
  if (!pkgText.trim().startsWith('{')) {
    console.log(`  FAIL ${tag} has no package.json at its root - an install from this tag cannot work`)
    return 1
  }
  failures += report(
    `the published package declares the version the tag implies (${versionOfTag(tag)})`,
    versionProblems(pkgText, { expected: versionOfTag(tag) }),
  )
  failures += report('the published composition mounts no MCP server and launches nothing', compositionProblems(patchText))

  const missing = []
  for (const path of REQUIRED_HELPERS) {
    const response = await fetch(raw(path))
    if (!response.ok) missing.push(`${path} answers HTTP ${response.status}`)
  }
  failures += report('every helper program the channels need is inside the published package', missing)

  const refs = g(['ls-remote', 'origin', ...tagRefQuery(tag)])
  const head = branchHead(refs)
  const tagged = taggedCommit(refs, tag)
  console.log(`  OK   ${tag} -> ${tagged ?? '(not fetched)'}, main -> ${head ?? '(not fetched)'}`)
  if (tagged !== undefined && head !== undefined && tagged !== head) {
    // Not a failure: main is allowed to move on after a release. It matters because "the fix is
    // published" and "the release contains the fix" are different statements.
    console.log('         NOTE: the branch head has moved past this tag, so main carries changes this release does not.')
  }
  return failures
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
  const failures = tag === undefined ? await checkLocal() : await checkTag(tag, repo)
  console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures} check(s))`}`)
  process.exit(failures === 0 ? 0 : 1)
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
