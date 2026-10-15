// Unit self-test for the preset's tool isolation, runnable without DSH.
//
// Usage: node tools/isolation-selftest.mjs
//
// It drives `apply()` with a fake tool registry whose global view is a known set, then asserts the
// filters handed to `restrict()`.
//
// Three load-bearing assertions:
//   1. the filter carries NO `allow` list — `restrict()` filters what a scope inherits, and for an
//      agent this preset's own rows are an ancestor contribution, so an allow list would mask the
//      preset's own shell/filesystem/skill tools along with the globals (a defect that shipped);
//   2. a tool that registers AFTER activation is still denied — `config-manager` reads the `tools`
//      service through `ctx.get`, so its five tools do not exist when the preset activates;
//   3. applying a filter does not re-enter itself into a loop. A restriction change is announced as
//      `tools/change` like any other, so the fake registry invokes the handler from inside
//      `restrict()` exactly as the real one does. Without this the guard is assumed, not tested.
//
// The fake models ONE scope whose registry view GROWS — and, in the last scenario, SHRINKS, because a
// registry that reports the VISIBLE set would shrink it as soon as our own filter applies. Which of
// those two the real registry does has not been measured, so both are pinned here and the
// implementation must be correct either way.
//
// An earlier version fabricated a listener `this` that carried `tools`; the test passed while the real
// handler failed on `this.tools === undefined`. A fake must not be more capable than reality.
import { readFileSync, rmSync } from 'node:fs'
import { apply } from '../isolation.js'

/** The global view at activation: nothing from a late-registering plugin yet. */
const VIEW_AT_ACTIVATION = [
  { name: 'mnemon_recall' },
  { name: 'mnemon_runtime_memory' },
  { name: 'read_page' },
  { name: 'x_search' },
  { name: 'str_replace_editor' },
  { name: 'undo_last_edit' },
  { name: 'read_image' },
  { name: 'univer_api' },
  { name: 'univer_execute' },
  { name: 'code_review' },
]

/** Tools that appear only later: a plugin waiting on a late service, plus a future install. */
const LATE_TOOLS = [{ name: 'config_backup' }, { name: 'config_restore' }, { name: 'some_future_plugin_tool' }]

const calls = []
const handlers = {}
let currentView = [...VIEW_AT_ACTIVATION]
let registryBroken = false
let reentrant = false

const scope = {
  tools: {
    schemas: () => {
      if (registryBroken) throw new Error('registry unavailable')
      return currentView
    },
    restrict: (filter) => {
      calls.push(filter)
      // The real registry announces a restriction change as another `tools/change`, which lands in
      // this same handler. Model it, or the anti-loop property stays untested.
      if (reentrant) handlers['tools/change']?.()
      return () => {}
    },
  },
  on: (event, handler) => {
    handlers[event] = handler
    return () => {}
  },
}

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('isolation self-test')
apply(scope)

check(calls.length === 1, 'restrict() called once at activation', `calls=${calls.length}`)
check(typeof handlers['tools/change'] === 'function', 'a handler is registered for tools/change')
// The event this row used to listen to. Measured 2026-10-15: it never fired, so the late registrations
// it was meant to catch reached every research agent. Naming the replacement without naming the
// mistake leaves the next reader free to add it back.
check(handlers['agent/created'] === undefined, 'and NOT for agent/created, which never fired')

const first = calls[0] ?? {}

// The regression guard for the shipped defect.
check(!('allow' in first), "activation filter carries NO allow list (an allow list masks the preset's own tools)")
check(Array.isArray(first.deny) && first.deny.length > 0, 'activation filter carries a non-empty deny list')

const deniedAtActivation = new Set(first.deny ?? [])
const keptAtActivation = new Set(VIEW_AT_ACTIVATION.map((s) => s.name).filter((n) => !deniedAtActivation.has(n)))

check(keptAtActivation.has('mnemon_recall'), 'keeps mnemon (progress-sync depends on it)')
check(keptAtActivation.has('read_page') && keptAtActivation.has('x_search'), 'keeps modsearch page/X search')
check(keptAtActivation.has('str_replace_editor') && keptAtActivation.has('undo_last_edit'), 'keeps better-edit tools')
check(keptAtActivation.has('read_image'), 'keeps read_image')
check(deniedAtActivation.has('univer_api') && deniedAtActivation.has('univer_execute'), 'denies univer')
check(deniedAtActivation.has('code_review'), 'denies code-review')
check(!deniedAtActivation.has('config_backup'), 'config-manager is invisible at activation (that is the gap)')

// --- the late plugin registers, and the registry announces it -------------------------------------

console.log('\n[1] a late registration is denied when the registry says the set changed')

reentrant = true
currentView = [...VIEW_AT_ACTIVATION, ...LATE_TOOLS]
handlers['tools/change']()

check(
  calls.length === 2,
  'restrict() called again, and the re-entry it caused did NOT add a third call',
  `calls=${calls.length}`,
)
const second = calls[1] ?? {}
check(!('allow' in second), 'the late filter carries NO allow list')
const deniedLate = new Set(second.deny ?? [])

check(deniedLate.has('config_backup') && deniedLate.has('config_restore'), 'config-manager is denied')
check(deniedLate.has('some_future_plugin_tool'), 'a plugin installed later is denied too')
check(!deniedLate.has('mnemon_recall'), 'and mnemon is still kept')
check(!deniedLate.has('read_page'), 'and modsearch is still kept')

// Every denied name must exist in the global view, or restrict() would reject the filter.
const known = new Set(currentView.map((s) => s.name))
const unknown = [...deniedLate].filter((n) => !known.has(n))
check(unknown.length === 0, 'no unknown name in the late deny list', unknown.join(','))

// --- the guard against re-applying what is already applied ----------------------------------------

console.log('\n[2] an unchanged set is not applied twice')

handlers['tools/change']()
check(calls.length === 2, 'a second announcement of the same set restricts nothing', `calls=${calls.length}`)

// A registry that reports the VISIBLE set shrinks its view as soon as our filter applies. Both shapes
// must be safe, and the report must keep the last filter that was really applied.
currentView = currentView.filter((schema) => !deniedLate.has(schema.name))
handlers['tools/change']()
check(calls.length === 2, 'a view that shrank because of our own filter restricts nothing', `calls=${calls.length}`)

console.log('\n[3] what the report says, because a real verification reads it')

const REPORT = new URL('../isolation-report.json', import.meta.url)
const report = JSON.parse(readFileSync(REPORT, 'utf8'))
check(report.applied === true, 'the report says a restriction was applied')
check(
  Array.isArray(report.denied) && report.denied.includes('config_backup') && report.denied.includes('config_restore'),
  'it names the late tools it denied, and keeps them even after the shrinking round',
  `${(report.denied ?? []).length} names`,
)
check(
  Array.isArray(report.rounds) && report.rounds.some((round) => round.when === 'at a tool-set change'),
  'and records the round that caught them, so a session can be traced to a pass',
)
check(!('agentError' in report), 'and carries no field from the pass that never ran')

console.log('\n[4] a failing registry never breaks anything')

registryBroken = true
let survived = true
try {
  handlers['tools/change']()
} catch {
  survived = false
}
check(survived, 'a failing pass never throws (isolation must not break an agent or a registration)')

// The plugin writes its report beside itself. This test drives a FAKE registry, so the report it
// produces would be misleading evidence: remove it, and say so. Run this test AFTER reading a real
// report, never before: it deletes the file a real activation wrote.
try {
  rmSync(REPORT, { force: true })
  console.log('\n(removed the report this test produced — only a real composition activation writes a trustworthy one)')
} catch {
  /* nothing to remove */
}

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
