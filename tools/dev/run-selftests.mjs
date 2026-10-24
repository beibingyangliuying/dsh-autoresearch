#!/usr/bin/env node
// Run every self-test in this repository, in one command, discovered from disk.
//
// WHY THIS FILE EXISTS
//
// The suite was a hand-written list, and the list lived in four places: `README.md` ("Develop it"),
// `docs/README.md` ("how to verify"), `.agents/skills/preset-release/SKILL.md` (§4, the order a release
// runs), and the author's habit. A hand-written list of programs has one failure mode, and this repository
// has hit it: a self-test is added and the list is not, so the new guard runs in nobody's round. That is
// the same defect class as a roster that cannot see beyond its own entries (`release-check.mjs`).
//
// So the list is DERIVED: every `*-selftest.mjs` under `tools/`, wherever it sits. A new test runs the day
// it lands. What stays hand-written is the ORDER of two runs, and both reasons are real:
//
//   - `preset-selftest.mjs` needs the composed tree, so the dump is regenerated first. It refuses a dump
//     older than `package.json` or `cordis.patch.yml` on purpose (docs/decisions.md §25): a stale dump
//     reports both false passes and false failures.
//   - `isolation-selftest.mjs` DELETES `isolation-report.json` at the end, and that gitignored file is
//     the verification evidence for tool isolation. It is copied aside before the run, not after.
//
// Offline is the point: none of these need a library, a network, or DSH running. The one thing that needs
// the `dsh` command is the dump, and when it is missing this runner says UNVERIFIED rather than FAIL -
// nothing was examined, so neither PASS nor FAIL is true of `preset-selftest` (the same three answers
// `release-check` gives, and for the same reason).
//
// Usage:
//   node tools/dev/run-selftests.mjs                  # everything
//   node tools/dev/run-selftests.mjs --list           # what a run would execute, and exit
//   node tools/dev/run-selftests.mjs --only zotero    # only matching paths
//
// Exit codes: 0 every test passed | 1 at least one failed | 3 nothing failed, but one could not run.
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const OUT_DIR = join(ROOT, '.tmp')
const COMPOSED = join(OUT_DIR, 'composed-web.txt')
const REPORT = join(ROOT, 'isolation-report.json')

/** Every `*-selftest.mjs` under `tools/`, as paths relative to the repository root, sorted. */
function discoverTests() {
  const found = []
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, name.name)
      if (name.isDirectory()) {
        if (name.name !== 'node_modules') walk(full)
        continue
      }
      if (name.name.endsWith('-selftest.mjs')) found.push(relative(ROOT, full))
    }
  }
  walk(join(ROOT, 'tools'))
  return found.sort()
}

/**
 * Regenerate the composed tree `preset-selftest.mjs` reads.
 *
 * @returns {{ok: true} | {ok: false, reason: string}} Whether the dump exists and is fresh.
 */
function regenerateDump() {
  mkdirSync(OUT_DIR, { recursive: true })
  // `shell: true` because on Windows `dsh` is a `.cmd` shim, which spawn cannot execute directly.
  const result = spawnSync('dsh', ['--profile', 'web', '--dump-config'], { cwd: ROOT, shell: true, encoding: 'utf8' })
  if (result.error || result.status !== 0) {
    const reason = result.error?.message ?? `dsh exited ${result.status}: ${(result.stderr ?? '').trim().split(/\r?\n/)[0]}`
    return { ok: false, reason }
  }
  writeFileSync(COMPOSED, result.stdout)
  return { ok: true }
}

/** Keep the isolation evidence a run is about to delete, under a name that says when it was taken. */
function preserveIsolationReport() {
  if (!existsSync(REPORT)) return null
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const kept = join(OUT_DIR, `isolation-report.${stamp}.json`)
  mkdirSync(OUT_DIR, { recursive: true })
  copyFileSync(REPORT, kept)
  return relative(ROOT, kept)
}

const argv = process.argv.slice(2)
const onlyIndex = argv.indexOf('--only')
const only = onlyIndex === -1 ? undefined : argv[onlyIndex + 1]
const tests = discoverTests().filter((path) => only === undefined || path.includes(only))

if (argv.includes('--list')) {
  for (const path of tests) console.log(path)
  console.log(`\n${tests.length} self-test(s)`)
  process.exit(0)
}
if (only !== undefined && tests.length === 0) {
  console.error(`no self-test path contains "${only}"`)
  process.exit(2)
}

const results = []

// The dump first: it is what one of the tests below reads, and regenerating it is the step that used to
// be skipped (a stale dump reports both false passes and false failures).
const needsDump = tests.some((path) => path.endsWith('preset-selftest.mjs'))
let dump = { ok: true }
if (needsDump) {
  process.stdout.write('regenerating .tmp/composed-web.txt ... ')
  dump = regenerateDump()
  console.log(dump.ok ? 'ok' : `SKIPPED (${dump.reason})`)
}

const keptReport = preserveIsolationReport()
if (keptReport) console.log(`kept the isolation evidence before the run deletes it: ${keptReport}\n`)

for (const path of tests) {
  if (path.endsWith('preset-selftest.mjs') && !dump.ok) {
    results.push({ path, outcome: 'UNVERIFIED', detail: dump.reason })
    continue
  }
  console.log(`\n=== ${path} ===`)
  const run = spawnSync(process.execPath, [path], { cwd: ROOT, stdio: 'inherit' })
  results.push({ path, outcome: run.status === 0 ? 'PASS' : 'FAIL', detail: run.status === 0 ? '' : `exit ${run.status}` })
}

console.log('\n--- suite ---')
for (const { path, outcome, detail } of results) {
  console.log(`  ${outcome.padEnd(10)} ${path}${detail ? `  (${detail})` : ''}`)
}
const failed = results.filter((result) => result.outcome === 'FAIL').length
const unverified = results.filter((result) => result.outcome === 'UNVERIFIED').length
console.log(`\n${results.length} self-test(s): ${results.length - failed - unverified} passed, ${failed} failed, ${unverified} unverified`)
process.exit(failed > 0 ? 1 : unverified > 0 ? 3 : 0)
