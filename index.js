// Host half of the bundle's own row: it CARRIES the editable configuration.
//
// Only a top-level Loader entry has a Config entry, and only a Config entry appears in the settings
// panel and crosses `ctx.remote.settings` to the browser. Rows nested inside the preset's `plugins:`
// list are invisible to that layer - which is why the contact address lives here and the prompt text
// that consumes it lives in a preset-scoped row.
//
// The client half (client.js) is the settings page; this half has no other behaviour.
const schemastery = await import('@deepseek-ai/schemastery').catch((error) => {
  // An unreachable schema must degrade to "this plugin has no config" rather than to a look-alike
  // object, which would fail validation and mark the whole preset broken. But it must not degrade
  // SILENTLY: a missing schema and a schema without volatile fields look identical from the settings
  // panel - no form at all - and the second one cost a long investigation. Report it where it happens.
  console.log(
    `[autoresearch-bundle] the configuration schema is unavailable (${error?.code ?? error?.message ?? error}); the contact-address form will not appear. Install the bundle with its dependencies.`,
  )
  return undefined
})
const schema = schemastery?.default

export const name = 'autoresearch-bundle'

/**
 * The loader validates whatever this holds, so an unreachable schema must yield `undefined` - the
 * ordinary "this plugin has no config" case - and never a look-alike object: a plain object fails the
 * mount and marks the whole preset broken.
 */
export const Config = schema === undefined
  ? undefined
  : schema.object({
      mailto: schema
        .string()
        .default('')
        // The settings layer projects ONLY fields marked volatile: `volatileForm(schema)` returns
        // undefined for a field that needs a remount, and `describe()` then drops the WHOLE entry
        // without a word. Without this call the row keeps its Config and stays invisible in the
        // settings panel and to `ctx.remote.settings`, which is exactly how it behaved.
        .volatile()
        .description(
          'Contact address for the metadata APIs (the "polite pool"): OpenAlex and Crossref serve faster and rate-limit less when requests identify a contact. It is also passed to the reference-library writer. Leave empty to send none.',
        ),
    })

export function apply() {
  // no host behaviour: the settings page is client-side and the prompt text is the preset row's job
}
