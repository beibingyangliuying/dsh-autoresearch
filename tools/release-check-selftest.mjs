// Self-test for the release check, runnable offline.
//
// Usage: node tools/release-check-selftest.mjs
//
// The load-bearing property is that these checks can FAIL. A release check that reads the working tree
// and always says PASS is worse than none: it certifies exactly the situation that published 0.2.0 -
// a green local suite over an unpublished composition that still mounted two MCP servers. So every
// pure check is driven with a mutation that must be detected, and the composition's own comments
// (which name the removed servers on purpose) must NOT be.
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  bundleRowSpecs,
  codeLines,
  compositionProblems,
  documentedSelftests,
  exportProblems,
  versionOfTag,
  versionProblems,
} from './release-check.mjs'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))
const read = (path) => readFileSync(join(ROOT, path), 'utf8')

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('release-check self-test')

const patch = read('cordis.patch.yml')
const pkg = read('package.json')
const readme = read('README.md')
const bundleName = JSON.parse(pkg).name

console.log('\n[1] the composition check, and the comments it must ignore')

check(compositionProblems(patch).length === 0, 'the shipped composition is clean')
// The file explains in a comment why the two rows were removed, and names them while doing it. Excluding
// comments is what keeps this check on, so the exclusion itself is asserted rather than assumed.
check(
  codeLines(patch).some((line) => line.includes('mcp-')) === false && patch.includes('mcp-arxiv'),
  'the removed servers are still named in a comment, and comments are not read as configuration',
)
for (const [label, mutation] of [
  ['an MCP row mounted again', '- insert:\n    - id: mcp-arxiv\n      name: x\n'],
  ['a server naming itself', '- insert:\n    - id: x\n      serverName: zotero\n'],
  ['a launched command', '- insert:\n    - id: x\n      command: uvx\n'],
  ['a python tool runner named', '- insert:\n    - id: x\n      config:\n        args: uvx zotero-mcp\n'],
]) {
  check(compositionProblems(`${patch}\n${mutation}`).length > 0, `detected: ${label}`)
}

console.log('\n[2] the version check')

check(versionProblems(pkg).length === 0, 'the real manifest declares a usable version')
check(versionProblems(pkg, { expected: JSON.parse(pkg).version }).length === 0, 'an expected version that matches passes')
check(versionProblems(pkg, { expected: '9.9.9' }).length === 1, 'a mismatched expected version fails')
check(versionProblems('{"version":"0.2"}').length === 1, 'a non-semver version fails')
check(versionProblems('{"version":1}').length === 1, 'a non-string version fails')
check(versionProblems('not json').length === 1, 'an unparseable manifest fails rather than throwing')
check(versionOfTag('v0.2.0') === '0.2.0' && versionOfTag('0.2.0') === '0.2.0', 'a tag name yields its version')

console.log('\n[3] row names against the exports map')

const specs = bundleRowSpecs(patch, bundleName)
check(specs.length === 4, 'the composition names this bundle four times', specs.join(', '))
check(specs.includes(bundleName), 'including the bundle row itself')
check(exportProblems(pkg, bundleName, specs).length === 0, 'every declared row name is exported')
check(
  exportProblems(pkg, bundleName, [...specs, `${bundleName}/invented.js`]).length === 1,
  'a row naming a subpath that exports omits is reported - the failure that hides a whole preset',
)
check(
  exportProblems('{"name":"x","exports":{".":"./index.js"}}', 'x', ['x/isolation.js']).length === 1,
  'a manifest with no matching key at all is reported',
)

console.log('\n[4] the README against the self-tests that exist')

const tests = documentedSelftests(readme, readdirSync(join(ROOT, 'tools')))
check(tests.undocumented.length === 0, 'every self-test in tools/ is documented', tests.undocumented.join(', '))
check(tests.stale.length === 0, 'the README names no self-test that is gone', tests.stale.join(', '))
check(
  documentedSelftests(readme, ['aaa-selftest.mjs']).undocumented.includes('aaa-selftest'),
  'an undocumented self-test is reported - this test can fail',
)
check(
  documentedSelftests('node tools\\gone-selftest.mjs', []).stale.includes('gone-selftest'),
  'a documented self-test that does not exist is reported',
)
check(
  documentedSelftests('node tools\\windows-selftest.mjs and node tools/posix-selftest.mjs', []).stale.length === 2,
  'both path separators are read',
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
