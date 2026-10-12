// Host half of the bundle's own row: it CARRIES the editable configuration.
//
// Only a top-level Loader entry has a Config entry, and only a Config entry appears in the settings
// panel and crosses `ctx.remote.settings` to the browser. Rows nested inside the preset's `plugins:`
// list are invisible to that layer - which is why the contact address lives here and the prompt text
// that consumes it lives in a preset-scoped row.
//
// The client half (client.js) is the settings page; this half has no other behaviour.
const schema = await import('@deepseek-ai/schemastery')
  .then((module) => module.default)
  .catch(() => undefined)

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
        .description(
          'Contact address for the metadata APIs (the "polite pool"): OpenAlex and Crossref serve faster and rate-limit less when requests identify a contact. It is also passed to the reference-library writer. Leave empty to send none.',
        ),
    })

export function apply() {
  // no host behaviour: the settings page is client-side and the prompt text is the preset row's job
}
