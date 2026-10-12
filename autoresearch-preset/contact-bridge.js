// Configurable values for the `autoresearch` preset, bridged into the system prompt.
//
// A discipline skill is static Markdown, so it cannot read a value the user typed into the settings
// page. This row carries the configurable values and registers them as a system-prompt section, so
// an agent of this preset knows them without an extra tool call — and no checked-in file has to hold
// anyone's personal address.
//
// Why a prompt section:
//   * `agent/created` never reaches a listener registered in this row's scope (it fires before the
//     agent is linked to its scope), so it is not a usable hook here;
//   * `system-prompt/assemble` is a waterfall on the same scoped event family, and re-implementing
//     assembly by hand is more surface than this needs;
//   * `ctx.systemPrompt.section()` is the registry's own extension point and is scoped to this row,
//     like every other contribution this preset makes.
//
// The schema is imported dynamically so the module also loads outside a DSH install (the self-test
// runs it straight from the repository, where the bare specifier does not resolve). At runtime it
// always resolves.
const schema = await import('@deepseek-ai/schemastery')
  .then((module) => module.default)
  .catch(() => undefined)

export const name = 'autoresearch-contact'

/** The prompt registry this row contributes to. */
export const inject = ['systemPrompt']

/** Section placement. Any finite order is accepted; duplicate section NAMES are what throw. */
const SECTION_ORDER = 62

/**
 * Editable per profile. Empty by default, and an empty value registers nothing at all — the preset
 * behaves exactly as before until someone fills the field in.
 */
// The loader validates whatever this holds, so an unavailable schema must yield `undefined` - the
// ordinary "this plugin has no config" case - and never a look-alike object: exporting a plain
// object fails the mount, which marks the WHOLE preset broken and hides it from the roster.
export const Config = schema === undefined
  ? undefined
  : schema.object({
      mailto: schema
        .string()
        .default('')
        .description(
          'Contact address for the metadata APIs (the "polite pool"). OpenAlex and Crossref serve faster and rate-limit less when requests identify a contact; leave empty to send none.',
        ),
    })

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

export function apply(ctx, config) {
  const text = contactLine(config?.mailto)
  if (text === undefined) return

  ctx.systemPrompt.section({
    name: 'autoresearch-contact',
    order: SECTION_ORDER,
    text,
  })
}
