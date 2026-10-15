// Tool isolation for the `autoresearch` preset.
//
// Profile-level ("global") plugins register their tools into the global registry, so without this
// plugin every agent in the profile sees mnemon, univer, config-manager, code-review and whatever
// else is installed. This plugin masks those by calling `ctx.tools.restrict()`.
//
// WHY A DENY LIST AND NOT AN ALLOW LIST
//
// `restrict()` filters what a scope INHERITS — the global layer and every ancestor layer on its
// chain — and never what that scope's OWN layer registers (see `view()` in `@deepseek-ai/dsh-tools`).
// For an agent, THIS PRESET'S OWN ROWS ARE AN ANCESTOR CONTRIBUTION, not the agent's own layer. An
// `allow` list holding only global names therefore also masks every tool the preset declares
// itself — shell, filesystem, skills, subagents — and the agent ends up with no shell and no file
// tools. The registry source states the trap directly: reading the exempt set as "the global layer"
// instead of "not mine" is the mistake.
//
// So the filter names only the globals to remove:
//
//   deny = (every name in the global view) − KEEP
//
// COVERAGE: THE FILTER IS RE-APPLIED WHENEVER THE TOOL SET CHANGES
//
//   1. On this row's activation, which covers every global tool registered *before* the preset
//      activates.
//   2. On every `tools/change`, which the registry emits when a tool is registered or unregistered or
//      a scoped restriction changes. A plugin that waits for a late service registers after (1):
//      `config-manager` reads the `tools` service through `ctx.get`, so its five tools - including
//      `config_restore`, which overwrites the harness configuration - reached every research agent
//      while this row listened for the wrong event.
//
// WHY NOT `agent/created`, WHICH THIS FILE USED TO LISTEN TO: measured 2026-10-15, that listener never
// ran. The report it wrote carried no `agentKept`, no `agentDenied` and no `agentError` across
// sessions, so the pass was decoration. `tools/change` is dispatched WITHOUT scope filtering on
// purpose - "a scoped listener subscribing here sees every change" - which is the delivery this needs.
// The deny computation itself was never the problem: the activation pass demonstrably removed its 15
// names while the five late ones stayed.
//
// Re-entry is expected and handled: `restrict()` counts as a scoped restriction changing, so it
// announces another `tools/change`. The applied signature is recorded BEFORE the call, so the nested
// round computes the same set and returns.
//
// `restrict()` rejects unknown names and scope-local names; building the list from the registry's
// own global view means it can contain neither.
//
// It writes `isolation-report.json` beside itself so the result can be inspected offline (that file
// is data, not instructions, and is not auto-loaded).
import { writeFileSync } from 'node:fs'

export const name = 'autoresearch-isolation'

/** The tool registry this row contributes to. */
export const inject = ['tools']

/** Global tools this preset deliberately keeps. Every other GLOBAL tool is denied. */
const KEEP = [
  // mnemon — the memory layer `progress-sync` depends on
  'mnemon_document_create',
  'mnemon_document_manage',
  'mnemon_document_search',
  'mnemon_forget',
  'mnemon_link',
  'mnemon_memory_bodies',
  'mnemon_memory_body_create',
  'mnemon_memory_body_merge',
  'mnemon_memory_body_update',
  'mnemon_recall',
  'mnemon_related',
  'mnemon_remember',
  'mnemon_runtime_memory',
  'mnemon_status',
  'mnemon_subagent_result',
  'mnemon_view_action',
  'mnemon_view_route',
  // modsearch — page reading and X search, used by literature work
  'read_page',
  'x_search',
  // better-edit — hash-anchored editing and its undo, when they are registered globally
  'str_replace_editor',
  'undo_last_edit',
  // image reading (screenshots, figures, scanned pages), when registered globally
  'read_image',
]

/** Write the outcome beside this module so the restriction can be inspected offline. */
function writeReport(report) {
  try {
    writeFileSync(new URL('./isolation-report.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  } catch {
    // A report is diagnostic only; never let it break activation.
  }
}

/** Split the registry's global view into what this preset keeps and what it denies. */
function splitGlobalView(scope) {
  const globalNames = [...new Set(scope.tools.schemas().map((schema) => schema.name))].sort()
  return {
    kept: globalNames.filter((toolName) => KEEP.includes(toolName)),
    denied: globalNames.filter((toolName) => !KEEP.includes(toolName)),
  }
}

export function apply(ctx) {
  let appliedSignature = null
  const report = { applied: false, kept: [], denied: [], checks: 0, rounds: [] }

  /**
   * Recompute the deny list, and apply it when it differs from what is already applied.
   *
   * `appliedSignature` is set BEFORE `restrict()` on purpose: a restriction change is itself announced
   * as `tools/change`, so the nested round must find the same set and return instead of recursing.
   *
   * @param {string} when How this round was triggered, recorded in the report.
   * @param {{always?: boolean}} [options] `always` writes a round at activation even when nothing is
   *   denied, so the report exists even on a profile with nothing to mask.
   */
  const applyRestriction = (when, { always = false } = {}) => {
    try {
      const view = splitGlobalView(ctx)
      const signature = view.denied.join('\n')
      if (signature === appliedSignature && !always) return
      appliedSignature = signature
      report.checks += 1
      if (view.denied.length > 0) {
        // `deny` only rejects the names it lists, so the preset's own tools are unaffected.
        ctx.tools.restrict({ deny: view.denied })
        // Recorded only when something was really applied: a round our own restriction triggered
        // computes an empty deny list, and letting that overwrite the evidence would hide what was done.
        report.applied = true
        report.kept = view.kept
        report.denied = view.denied
        report.rounds = [...report.rounds.slice(-9), { when, kept: view.kept.length, denied: view.denied.length }]
        console.log(`[autoresearch-isolation] ${when}: kept ${view.kept.length}, denied ${view.denied.length}`)
      }
      writeReport(report)
    } catch (error) {
      // Isolation must never fail an agent creation or a tool registration.
      report.error = String(error?.message ?? error)
      console.log(`[autoresearch-isolation] ${when}: could not restrict - ${report.error}`)
      writeReport(report)
    }
  }

  applyRestriction('at activation', { always: true })

  // The registry's own announcement that the available tool set changed - possibly for one scope only,
  // and possibly because a late plugin just registered. It is dispatched without scope filtering, so
  // this listener sees every change rather than only its own scope's.
  ctx.on('tools/change', () => applyRestriction('at a tool-set change'))
}
