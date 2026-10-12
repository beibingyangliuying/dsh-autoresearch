// Preset-scoped half: reads the bundle row's configuration and states it in the system prompt.
//
// A discipline skill is static Markdown, so it cannot read a value the user typed into the settings
// page. This row bridges it: the value lives in the bundle's own top-level row (the only place the
// settings layer can see), and this row announces it to the agents of THIS preset.
//
// Why the section text is a function: the host `settings.describe()` is synchronous, so the text is
// re-read on every prompt assembly. The value therefore tracks a settings edit with no listener, no
// cache and no staleness window.
//
// Why a prompt section and not `agent/created`: a listener registered in this row's scope never
// receives `agent/created` (it is dispatched before an agent is linked to its scope), while
// `ctx.systemPrompt.section()` is the prompt registry's own scoped extension point.
export const name = 'autoresearch-contact'

/** The host services this row reads and contributes through. */
// systemPrompt is a hard dependency; settings is NOT injected on purpose. It is read through the
// service registry's optional access (ctx.get), because a hard inject blocks activation wherever the
// service is absent - a preset trial mount is one such place - and one row that never starts marks
// the WHOLE preset broken and hides it from the new-session roster.
export const inject = ['systemPrompt']

/** Section placement. Any finite order is accepted; duplicate section NAMES are what throw. */
const SECTION_ORDER = 62

/** The settings service if this mount has it, else undefined; never throws. */
export function optionalSettings(ctx) {
  try {
    return ctx?.get?.('settings') ?? ctx?.settings
  } catch {
    return undefined
  }
}
export function readContactAddress(settings) {
  try {
    const entries = settings?.describe?.() ?? []
    for (const entry of entries) {
      const value = entry?.value
      if (value !== null && typeof value === 'object' && 'mailto' in value) {
        return String(value.mailto ?? '').trim()
      }
    }
  } catch {
    // A settings read must never take the preset down; an unannounced address is recoverable.
  }
  return ''
}

/** The single prompt line, or undefined when there is nothing configured to announce. */
export function contactLine(mailto) {
  const address = String(mailto ?? '').trim()
  if (address === '') return undefined
  return [
    `Contact address configured for this preset: ${address}.`,
    'Append it as `&mailto=<address>` on OpenAlex and Crossref requests, and pass it as',
    '`--mailto <address>` when running `tools/zotero-write.mjs`. If this line announces no address,',
    'omit the parameter entirely — the requests are still valid, just unpolite.',
  ].join(' ')
}

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'autoresearch-contact',
    order: SECTION_ORDER,
    text: () => contactLine(readContactAddress(optionalSettings(ctx))) ?? '',
  })
}