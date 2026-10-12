// Unit self-test for the preset's tool isolation, runnable without DSH.
//
// Usage: node tools/isolation-selftest.mjs
//
// It drives `apply()` with a fake tool registry whose global view is a known set, then asserts the
// filters handed to `restrict()`.
//
// Two load-bearing assertions:
//   1. the filter carries NO `allow` list — `restrict()` filters what a scope inherits, and for an
//      agent this preset's own rows are an ancestor contribution, so an allow list would mask the
//      preset's own shell/filesystem/skill tools along with the globals (a defect that shipped);
//   2. a second pass runs on `agent/created` — a plugin that registers after the preset activates
//      (config-manager waits for `settings` and `credentials`) is only visible then, and without
//      this pass it leaks into research sessions.
//
// The fake models ONE scope whose registry view GROWS, because that is what the real plugin sees.
// An earlier version fabricated a listener `this` that carried `tools`; the test passed while the
// real handler failed on `this.tools === undefined`. A fake must not be more capable than reality.
import { rmSync } from 'node:fs'
import { apply } from '../autoresearch-preset/isolation.js'

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

const scope = {
  tools: {
    schemas: () => {
      if (registryBroken) throw new Error('registry unavailable')
      return currentView
    },
    restrict: (filter) => {
      calls.push(filter)
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
check(typeof handlers['agent/created'] === 'function', 'a handler is registered for agent/created')

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

// The late plugin registers, then an agent is created: the same scope, a complete view.
currentView = [...VIEW_AT_ACTIVATION, ...LATE_TOOLS]
handlers['agent/created']()

check(calls.length === 2, 'restrict() called a second time on agent creation', `calls=${calls.length}`)
const second = calls[1] ?? {}
check(!('allow' in second), 'agent filter carries NO allow list')
const deniedAtAgent = new Set(second.deny ?? [])

check(deniedAtAgent.has('config_backup') && deniedAtAgent.has('config_restore'), 'agent pass denies config-manager')
check(deniedAtAgent.has('some_future_plugin_tool'), 'agent pass denies a plugin installed later')
check(!deniedAtAgent.has('mnemon_recall'), 'agent pass still keeps mnemon')
check(!deniedAtAgent.has('read_page'), 'agent pass still keeps modsearch')

// Every denied name must exist in the global view, or restrict() would reject the filter.
const known = new Set(currentView.map((s) => s.name))
const unknown = [...deniedAtAgent].filter((n) => !known.has(n))
check(unknown.length === 0, 'no unknown name in the agent deny list', unknown.join(','))

// A failing agent-time pass must not throw out of the handler.
registryBroken = true
let survived = true
try {
  handlers['agent/created']()
} catch {
  survived = false
}
check(survived, 'a failing agent-time pass never throws (agent creation must not break)')

// The plugin writes its report beside itself. This test drives a FAKE registry, so the report it
// produces would be misleading evidence: remove it, and say so.
const REPORT = new URL('../autoresearch-preset/isolation-report.json', import.meta.url)
try {
  rmSync(REPORT, { force: true })
  console.log('\n(removed the report this test produced — only a real composition activation writes a trustworthy one)')
} catch {
  /* nothing to remove */
}

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
