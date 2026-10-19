// Preset-scoped half: reads the bundle row's configuration and states it in the system prompt.
//
// Three things travel through here: the contact address, the stored-PDF conversion policy, and the
// absolute directory of this preset's own command-line helpers. They are announced through ONE section
// on purpose - a second section would cost every prompt for lines that are usually empty, and the
// settings row is the same row for both configured values.
//
// The helper directory is announced UNCONDITIONALLY, unlike the two configured values: an agent whose
// working directory is a study workspace has no other way to learn where this preset's scripts live,
// and a relative `tools/...` path resolves to nothing there.
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
import { cliToolsDir } from './preset-paths.js'

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
    'Pass it as `--mailto <address>` to the command-line helpers this preset ships: `metadata.mjs` puts it',
    'on the bibliographic requests it makes, and `zotero-write.mjs` uses it when it resolves metadata. Do',
    'not build those requests by hand. If this line announces no address, omit the parameter entirely —',
    'the requests are still valid, just unpolite.',
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

/**
 * The conversion line, or undefined when the switch is off or no directory was configured.
 *
 * The command carries the ABSOLUTE helper path and the configured directory, for the reason
 * {@link helpersLine} states: the agent's working directory is a study workspace, where `tools/...`
 * resolves to nothing. Both values are already in hand here - the path beside this module's own URL,
 * the directory from the settings row - so leaving a relative path or a `<directory>` placeholder for
 * the agent to fill in would be handing it a command that fails where it usually runs.
 */
export function attachmentLine(policy) {
  if (policy?.auto !== true || String(policy.storePath ?? '').trim() === '') return undefined
  const storePath = String(policy.storePath).trim()
  return [
    `Stored-PDF conversion is on for this preset, with the attachment store directory ${storePath}.`,
    'When a literature round finds PDFs the reference library stores rather than links, report the list to the',
    `owner first; once the owner agrees, run \`node "${cliToolsDir}/zotero-link-attachments.mjs" --target "${storePath}"\``,
    'as a dry run and then with `--write`. Those writes are gated by the owner in the reference manager.',
  ].join(' ')
}

/**
 * The helper-directory line, or nothing when the directory cannot be resolved.
 *
 * @returns {string|undefined} One sentence naming the absolute directory of this preset's own CLI helpers.
 */
export function helpersLine() {
  const dir = String(cliToolsDir ?? '').trim()
  if (dir === '') return undefined
  return [
    `This preset's own command-line helpers live in ${dir}; invoke them by absolute path`,
    '(a relative `tools/...` path does not resolve in a study workspace).',
  ].join(' ')
}

/**
 * The reference-library write gate. Always present, because the tools it governs are always present.
 *
 * The write path belongs to helper programs this preset itself ships, and §5 of the contract states
 * why that matters: a capability a row of this preset provides cannot be hidden by the isolation
 * filter, so its bound is the contract rather than the capability's absence. §6 and Revision 10 state
 * what that bound now is: the reference manager's dialog, answered once per library, and either answer
 * is the owner's to give. The line below therefore tells the agent to state the change first and to
 * leave the choice alone — asking for a lasting grant would be the agent campaigning for standing
 * authority over the owner's curated evidence base, which §9 keeps out of this preset's scope.
 *
 * @returns {string} One sentence stating how a write to the reference library may be authorized.
 */
export function writeGateLine() {
  return [
    'Reference-library writes are gated by the owner: the reference manager asks once per library,',
    '"Allow" covering that one write and "Always Allow" a grant this preset keeps for it, revocable',
    'there — so a write may raise no dialog. Say what you will write before the dialog appears; never',
    'ask for "Always Allow".',
  ].join(' ')
}

export function apply(ctx) {
  ctx.systemPrompt.section({
    name: 'autoresearch-contact',
    order: SECTION_ORDER,
    text: () => {
      const settings = optionalSettings(ctx)
      return [
        helpersLine(),
        writeGateLine(),
        contactLine(readContactAddress(settings)),
        attachmentLine(readAttachmentPolicy(settings)),
      ]
        .filter((line) => line !== undefined)
        .join(' ')
    },
  })
}