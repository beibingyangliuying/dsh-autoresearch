// Unit self-test for the session dumper, runnable without a real session store.
//
// Usage: node tools/dump-session-selftest.mjs
//
// Two things are pinned here, and both were defects found in the field rather than imagined:
//
//   * `--scan` looked only at the sessions root's own children, which are WORKSPACE directories, so it
//     printed `ERROR no .zstd transcript` for every workspace and the documented entry point for "which
//     preset did each session run" answered nothing. The fixture below holds both layouts on purpose:
//     a transcript one level down (what the store actually does) and one directly in a workspace.
//   * the preset a session RAN is not the value its own record carries. That record holds the creation
//     default (`standard`), and the real choice is a separate `agent-preset/selected` record written a
//     moment later - the trap #26 was about, which this function exists to avoid.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parsePresetFacts, sessionDirs } from './dump-session.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('session dumper self-test')

// --- the fixture: both transcript layouts, and two directories that hold none ---------------------

const ROOT = join('.tmp', 'dump-session-fixture')
rmSync(ROOT, { recursive: true, force: true })
for (const dir of ['ws-nested/session-abc', 'ws-flat', 'ws-empty/not-a-session', 'ws-bare']) {
  mkdirSync(join(ROOT, dir), { recursive: true })
}
writeFileSync(join(ROOT, 'ws-nested', 'session-abc', 'session.v4.jsonl.zstd'), '')
writeFileSync(join(ROOT, 'ws-flat', 'session.v4.jsonl.zstd'), '')

console.log('\n[1] the scan descends to where the transcripts actually are')

const found = sessionDirs(ROOT)
check(found.length === 2, 'two sessions found, and neither empty directory counts', `${found.length}`)
check(
  found.some((entry) => entry.workspace === 'ws-nested' && entry.session === 'session-abc'),
  'the nested layout is found - this is what the real store does',
)
check(
  found.some((entry) => entry.workspace === 'ws-flat' && entry.session === 'ws-flat'),
  'a transcript directly in a workspace is found too',
)
check(
  !found.some((entry) => entry.workspace.startsWith('ws-empty') || entry.workspace === 'ws-bare'),
  'a workspace with no transcript of its own contributes nothing',
)
check(sessionDirs(join(ROOT, 'ws-bare')).length === 0, 'an empty root is no sessions, not a crash')

// --- which preset a session ran ------------------------------------------------------------------

console.log('\n[2] the preset reported is the one that RAN')

const transcript = (created, ...selected) =>
  [
    JSON.stringify({ type: 'session', agentPreset: created }),
    ...selected.map((name) => JSON.stringify({ type: 'agent-preset/selected', data: { agentPreset: name } })),
  ].join('\n')

const ran = parsePresetFacts(transcript('standard', 'autoresearch'))
check(ran.effective === 'autoresearch', 'a selected preset wins over the creation default', ran.effective)
check(ran.created === 'standard', 'and the creation value is still reported, so the difference stays visible')
check(ran.selections === 1, 'the number of selection records is counted')

const plain = parsePresetFacts(transcript('standard'))
check(plain.effective === 'standard', 'with no selection record the creation value is the answer')
check(plain.selections === 0, 'and no selection is counted')

const switched = parsePresetFacts(transcript('standard', 'autoresearch', 'cordis'))
check(switched.effective === 'cordis', 'the LAST selection wins, because a session can switch', switched.effective)
check(switched.selections === 2, 'both switches are counted')

const broken = parsePresetFacts(`${transcript('standard')}\n{"broken json agent-preset/selected`)
check(broken.effective === 'standard', 'a line that does not parse is not evidence about the preset')

rmSync(ROOT, { recursive: true, force: true })

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
