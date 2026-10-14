// Where this preset's own command-line helpers live, as an absolute path.
//
// The scripts under `tools/` are NOT DSH tools: they are Node programs the agent runs through the
// shell. Every instruction that names one therefore needs an ABSOLUTE path, because the agent's
// working directory is a study workspace, not this checkout — the scaffold copies no `tools/`
// directory, so `node tools/zotero-write.mjs` resolves to nothing there.
//
// A shipped skill is static Markdown and cannot compute an absolute path, so a body that names a
// helper carries the `{{presetTools}}` token and this module fills it in when the skill is
// registered. The directory comes from this module's own URL, so it is correct wherever the package
// is installed — a checkout, or a junction in the profile — with no configuration and no rebuild.
import { fileURLToPath } from 'node:url'

/** The token a shipped skill body uses for the helper directory. */
export const TOOLS_TOKEN = '{{presetTools}}'

/**
 * Absolute directory of the helpers shipped beside this module.
 *
 * Forward slashes are kept deliberately: Windows accepts them, and a path pasted into a shell
 * command or a prompt needs no escaping that way. The trailing slash is dropped so a body can write
 * `{{presetTools}}/zotero-write.mjs`.
 */
export const cliToolsDir = fileURLToPath(new URL('./tools/', import.meta.url))
  .replace(/\\/g, '/')
  .replace(/\/+$/, '')

/**
 * Replace every helper-directory token in one text.
 *
 * @param {string} text A skill body, or any text that may name a helper.
 * @returns {string} The same text with every token replaced; unchanged when there is none.
 */
export function fillToolsPath(text) {
  return String(text).split(TOOLS_TOKEN).join(cliToolsDir)
}
