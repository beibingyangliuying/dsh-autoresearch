// Self-test for the release check, runnable offline.
//
// Usage: node tools/release-check-selftest.mjs
//
// The load-bearing property is that these checks can FAIL. A release check that reads the working tree
// and always says PASS is worse than none: it certifies exactly the situation that published 0.2.0 -
// a green local suite over an unpublished composition that still mounted two MCP servers. So every
// pure check is driven with a mutation that must be detected, and the composition's own comments
// (which name the removed servers on purpose) must NOT be.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  REQUIRED_HELPERS,
  branchHead,
  bundleRowSpecs,
  codeLines,
  compositionProblems,
  documentedSelftests,
  exportProblems,
  namedHelperProblems,
  refusalVoiceProblems,
  summary,
  taggedCommit,
  tagRefQuery,
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

console.log('\n[4] the README and the release procedure against the self-tests that exist')

const tools = readdirSync(join(ROOT, 'tools'))
const tests = documentedSelftests(readme, tools)
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

// The release procedure carries its own ordered copy of the suite, and that copy was prose with no
// instrument behind it. It drifted twice: a section-note test and the scaffold guard were both added
// without it, so a release could have run "the whole suite" and skipped them. Same instrument, second
// list - and the check is driven with a block that names one test, which must report the rest.
const suiteBlock =
  read('.agents/skills/preset-release/SKILL.md').match(/```powershell\r?\n([\s\S]*?)```/)?.[1] ?? ''
const suite = documentedSelftests(suiteBlock, tools)
check(suiteBlock !== '', 'the release procedure still carries a runnable suite block')
check(suite.undocumented.length === 0, 'the release procedure names every self-test', suite.undocumented.join(', '))
check(
  documentedSelftests('node tools\\preset-selftest.mjs', tools).undocumented.length > 0,
  'a self-test missing from the release procedure would be reported - this check can fail',
)


console.log('\n[5] the required-helper roster against the helpers a discipline names')

// The roster is hand-written, so what it OMITS is invisible to the check that reads it. This drives the
// demand side instead - the `{{presetTools}}` commands the shipped disciplines hand an agent - and it
// has to FAIL when a named helper is not on the roster, which is the state the roster sat in twice.
const disciplineTexts = readdirSync(join(ROOT, 'skills')).map((name) => read(join('skills', name, 'SKILL.md')))
const gaps = namedHelperProblems(disciplineTexts, REQUIRED_HELPERS)
check(gaps.length === 0, 'every helper a discipline hands an agent is on the roster', gaps.join('; '))
check(
  namedHelperProblems(['run {{presetTools}}/invented.mjs'], REQUIRED_HELPERS).length === 1,
  'a discipline naming a helper the roster omits is reported - this check can fail',
)
check(
  namedHelperProblems(['{{presetTools}}/zotero-read.mjs and {{presetTools}}/invented.mjs'], REQUIRED_HELPERS).length === 1,
  'a known helper is no problem, and two mentions of one gap are still one problem',
)
check(
  namedHelperProblems(['read tools/zotero-read.mjs, no token'], REQUIRED_HELPERS).length === 0,
  'a path without the presetTools token is not read as a discipline command - the guard is narrow on purpose',
)
const absent = REQUIRED_HELPERS.filter((path) => !existsSync(join(ROOT, path)))
check(absent.length === 0, 'every path on the roster exists in this tree - a typo would fail every tag', absent.join(', '))

console.log('\n[5b] every helper that can fail speaks through one voice')

// Ten helpers each carried their own `class UsageError` and their own catch, so the shape of a failure
// was a per-program decision, and a reader had to learn a layout per program. This guard is narrow on
// purpose: two tokens and one absence, never a judgement about wording.
const voice = (name, body) => refusalVoiceProblems([{ name, text: body }])
check(
  voice('a.mjs', "import { reportFailure } from './refusal.mjs'\n  process.exitCode = reportFailure(error)").length === 0,
  'a helper that imports the voice and reports through it is fine',
)
check(
  voice('a.mjs', "console.error('\\nERROR: ' + error.message)\n  process.exit(1)").length === 2,
  'a helper that prints its own failure block is reported twice: no import, and no renderer - this check can fail',
)
check(
  voice('a.mjs', "import { reportFailure } from './refusal.mjs'\nclass UsageError extends Error {}\nprocess.exitCode = reportFailure(error)").length === 1,
  'a helper that keeps its own UsageError is reported - a second class is where the two behaviours drift',
)
check(
  voice('a.mjs', "import { UsageError } from './refusal.mjs'").length === 1,
  'importing only the usage class still leaves the failure unwritten',
)

console.log('\n[6] which commit a tag names')

// The real shape of `git ls-remote origin refs/heads/main refs/tags/vX.Y.Z` for an ANNOTATED tag: the
// tag object AND the commit it peels to. Comparing the first line that ends with the tag name put a tag
// object's hash next to a branch head's commit hash, which never match - so the "main has moved past
// this tag" note was printed one commit after v0.2.1 was published, when the two were the same commit.
const tagObject = '18a2627ca7c23e26da31feefdccd5e750c00d09f'
const released = '776a4b7041ab06d7dac17e4b5669f3e77d16b117'
const movedOn = 'aaaabbbbccccddddeeeeffff0000111122223333'
const refsFor = (branch, ...tagLines) => [`${branch}\trefs/heads/main`, ...tagLines].join('\n')
const annotated = refsFor(released, `${tagObject}\trefs/tags/v0.2.1`, `${released}\trefs/tags/v0.2.1^{}`)
const afterMovingOn = refsFor(movedOn, `${tagObject}\trefs/tags/v0.2.1`, `${released}\trefs/tags/v0.2.1^{}`)
const lightweight = refsFor(released, `${released}\trefs/tags/v0.2.1`)

check(
  taggedCommit(annotated, 'v0.2.1') === branchHead(annotated),
  'an annotated tag that names the branch head compares equal - this is what it got wrong',
)
check(taggedCommit(annotated, 'v0.2.1') !== tagObject, 'the tag OBJECT is not mistaken for the commit it names')
check(taggedCommit(annotated, 'v0.2.1') === released, 'and it resolves to the peeled commit', String(taggedCommit(annotated, 'v0.2.1')))
check(
  taggedCommit(afterMovingOn, 'v0.2.1') !== branchHead(afterMovingOn),
  'a branch that really did move past the tag is still reported - the check can fail',
)
check(taggedCommit(lightweight, 'v0.2.1') === branchHead(lightweight), 'a lightweight tag needs no peeling')
check(taggedCommit('', 'v0.2.1') === undefined, 'output with no such ref yields nothing rather than throwing')

// Why the query has to ASK for the peeled ref, rather than only prefer it when it happens to be there:
// `git ls-remote <remote> refs/tags/v0.2.1` answers the tag object alone. A fixture that includes the
// peeled line - as the one above does - certifies a fix that still fails on the real remote, which is
// exactly what happened before this line existed.
const exactRefOnly = refsFor(released, `${tagObject}\trefs/tags/v0.2.1`)
check(
  taggedCommit(exactRefOnly, 'v0.2.1') === tagObject,
  'an exact-ref query carries no peeled line, so preferring one is not enough',
)
check(
  tagRefQuery('v0.2.1').includes('refs/tags/v0.2.1^{}'),
  'the ref query asks for the peeled commit - dropping it silently restores the false note',
  tagRefQuery('v0.2.1').join(' '),
)

console.log('\n[7] three outcomes, and the code each one means')

// A check that could not RUN is not a check that failed. Verifying 0.14.0 produced both mistakes: a
// dead git proxy ended a run whose substantive checks had all passed (it threw instead of saying so),
// and a network error printed as "FAIL the tag is readable" (it accused the package). These four drive
// the separation, including the ordering between the two.
check(summary({}).code === 0 && summary({}).text === 'PASS', 'nothing wrong is PASS and exit 0')
check(summary({ failed: 2 }).code === 1 && summary({ failed: 2 }).text.startsWith('FAIL'), 'a failed check is exit 1 and says FAIL', summary({ failed: 2 }).text)
check(
  summary({ unverified: 1 }).code === 3 && summary({ unverified: 1 }).text.startsWith('UNVERIFIED'),
  'a check that could not run is exit 3, and says so - nothing was examined',
  summary({ unverified: 1 }).text,
)
check(
  summary({ failed: 1, unverified: 2 }).code === 1,
  'a real failure outranks an unverifiable check, because something IS known to be wrong',
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
