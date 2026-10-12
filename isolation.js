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
// COVERAGE: THE FILTER IS APPLIED TWICE, AND RESTRICTIONS INTERSECT
//
//   1. On this row's activation, which covers every global tool registered *before* the preset
//      activates.
//   2. On every `agent/created`, when the global view is complete. A plugin that waits for a late
//      service registers after (1): `config-manager` injects `settings` and `credentials`, so its
//      five tools appeared only in the later view and leaked into research sessions.
//
// (1) is the guarantee. (2) is best-effort and was NOT observed to take effect: a listener
// registered in this row's own scope did not receive `agent/created` in a user-visible check. The
// handler stays wrapped so isolation can never fail an agent creation.
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
  const atActivation = splitGlobalView(ctx)
  if (atActivation.denied.length > 0) {
    // `deny` only rejects the names it lists, so the preset's own tools are unaffected.
    ctx.tools.restrict({ deny: atActivation.denied })
  }
  const report = {
    applied: atActivation.denied.length > 0,
    kept: atActivation.kept,
    denied: atActivation.denied,
  }
  console.log(
    `[autoresearch-isolation] at activation: kept ${atActivation.kept.length}, denied ${atActivation.denied.length}`,
  )

  // Second pass, when the global view is complete. It restricts THIS row's scope on purpose: the
  // listener's own scope does not carry the tools service, and it does not need to — a restriction
  // on an ancestor layer reaches every agent below it.
  ctx.on('agent/created', () => {
    try {
      const atAgent = splitGlobalView(ctx)
      if (atAgent.denied.length > 0) ctx.tools.restrict({ deny: atAgent.denied })
      report.agentKept = atAgent.kept
      report.agentDenied = atAgent.denied
      console.log(
        `[autoresearch-isolation] at agent creation: kept ${atAgent.kept.length}, denied ${atAgent.denied.length}`,
      )
    } catch (error) {
      // Isolation must never fail an agent creation.
      report.agentError = String(error?.message ?? error)
      console.log(`[autoresearch-isolation] agent scope could not be restricted: ${report.agentError}`)
    }
    writeReport(report)
  })

  writeReport(report)
}
