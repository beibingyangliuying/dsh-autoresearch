// Unit self-test for the preset's tool isolation, runnable without DSH.
//
// Usage: node tools/isolation-selftest.mjs
//
// It drives `apply()` with a fake tool registry whose global view is a known set, then asserts the
// filter handed to `restrict()`.
//
// The load-bearing assertion is that the filter carries NO `allow` list. `restrict()` filters what a
// scope inherits — for an agent, the preset's own rows are an ancestor contribution — so an allow
// list would mask the preset's own shell/filesystem/skill tools along with the globals. That was a
// real defect: the preset shipped with no shell and no file tools. A deny list naming only the
// unwanted globals cannot do that.
import { rmSync } from 'node:fs'
import { apply } from '../autoresearch-preset/isolation.js'

const GLOBAL_VIEW = [
  { name: 'mnemon_recall' },
  { name: 'mnemon_runtime_memory' },
  { name: 'read_page' },
  { name: 'x_search' },
  { name: 'str_replace_editor' },
  { name: 'undo_last_edit' },
  { name: 'read_image' },
  { name: 'univer_api' },
  { name: 'univer_execute' },
  { name: 'config_backup' },
  { name: 'code_review' },
  { name: 'some_future_plugin_tool' },
]

const calls = []
const fake = {
  tools: {
    schemas: () => GLOBAL_VIEW,
    restrict: (filter) => {
      calls.push(filter)
      return () => {}
    },
  },
}

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('isolation self-test')
apply(fake)

check(calls.length === 1, 'restrict() called exactly once', `calls=${calls.length}`)
const filter = calls[0] ?? {}

// The regression guard for the shipped defect.
check(!('allow' in filter), 'filter carries NO allow list (an allow list masks the preset\'s own tools)')
check(Array.isArray(filter.deny) && filter.deny.length > 0, 'filter carries a non-empty deny list')

const denied = new Set(filter.deny ?? [])
const kept = new Set(GLOBAL_VIEW.map((s) => s.name).filter((n) => !denied.has(n)))

check(kept.has('mnemon_recall'), 'keeps mnemon (progress-sync depends on it)')
check(kept.has('read_page') && kept.has('x_search'), 'keeps modsearch page/X search')
check(kept.has('str_replace_editor') && kept.has('undo_last_edit'), 'keeps better-edit tools')
check(kept.has('read_image'), 'keeps read_image')

check(denied.has('univer_api') && denied.has('univer_execute'), 'denies univer')
check(denied.has('config_backup'), 'denies config-manager')
check(denied.has('code_review'), 'denies code-review')
check(denied.has('some_future_plugin_tool'), 'denies a plugin installed later (recomputed per activation)')

// Every denied name must exist in the global view, or restrict() would reject the filter.
const known = new Set(GLOBAL_VIEW.map((s) => s.name))
const unknown = [...denied].filter((n) => !known.has(n))
check(unknown.length === 0, 'no unknown name in the deny list', unknown.join(','))

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
