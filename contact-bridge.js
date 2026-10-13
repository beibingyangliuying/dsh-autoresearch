// Preset-scoped half: reads the bundle row's configuration and states it in the system prompt.
//
// Two values travel through here: the contact address, and the stored-PDF conversion policy. They are
// announced through ONE section on purpose - a second section would cost every prompt for a line that
// is usually empty, and the settings row is the same row for both.
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

/**
 * The stored-PDF conversion policy, defaulting to "off" for anything unreadable.
 *
 * @param {object|undefined} settings The settings service, if this mount has one.
 * @returns {{auto: boolean, storePath: string}} Whether conversion is on, and where files go.
 */
export function readAttachmentPolicy(settings) {
  try {
    const entries = settings?.describe?.() ?? []
    for (const entry of entries) {
      const value = entry?.value
      if (value !== null && typeof value === 'object' && 'autoLinkAttachments' in value) {
        return {
          auto: value.autoLinkAttachments === true,
          storePath: String(value.attachmentStorePath ?? '').trim(),
        }
      }
    }
  } catch {
    // Same rule as the contact read: an unreadable policy is announced as nothing, never as a throw.
  }
  return { auto: false, storePath: '' }
}

/** The conversion line, or undefined when the switch is off or no directory was configured. */
export function attachmentLine(policy) {
  if (policy?.auto !== true || String(policy.storePath ?? '').trim() === '') return undefined
  return [
    `Stored-PDF conversion is on for this preset, with the attachment store directory ${policy.storePath}.`,
    'When a literature round finds PDFs the reference library stores rather than links, report the list to the',
    'owner first; once the owner agrees, run `node tools/zotero-link-attachments.mjs --target <directory>` as a',
    'dry run and then with `--write`. Every write still needs the owner\u2019s approval in the reference manager.',
  ].join(' ')
}

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'autoresearch-contact',
    order: SECTION_ORDER,
    text: () => {
      const settings = optionalSettings(ctx)
      return [contactLine(readContactAddress(settings)), attachmentLine(readAttachmentPolicy(settings))]
        .filter((line) => line !== undefined)
        .join(' ')
    },
  })
}