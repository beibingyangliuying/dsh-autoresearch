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
// This is equivalent to an allow list over globals (no global outside KEEP survives), it leaves the
// preset's own tools untouched, and it stays future-proof: the list is recomputed on every
// activation, so a plugin installed later is denied the next time this preset activates.
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

export function apply(ctx) {
  const globalNames = [...new Set(ctx.tools.schemas().map((schema) => schema.name))].sort()
  const kept = globalNames.filter((toolName) => KEEP.includes(toolName))
  const denied = globalNames.filter((toolName) => !KEEP.includes(toolName))

  if (denied.length === 0) {
    // Nothing global to remove: applying an empty filter is a no-op, so report and stop.
    writeReport({ applied: false, reason: 'no global tool to deny', kept, denied })
    console.log('[autoresearch-isolation] nothing to deny; restriction NOT applied')
    return
  }

  // `deny` only rejects the names it lists, so the preset's own tools are unaffected.
  ctx.tools.restrict({ deny: denied })
  writeReport({ applied: true, kept, denied })
  console.log(
    `[autoresearch-isolation] kept ${kept.length} global tool(s); denied ${denied.length}: ${denied.join(', ')}`,
  )
}
