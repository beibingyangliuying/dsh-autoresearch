// Where the external-channel command-line helpers live, as an absolute path.
//
// The scripts are NOT DSH tools: they are Node programs the agent runs through the shell. Every
// instruction that names one therefore needs an ABSOLUTE path, because the agent's working directory
// is a study workspace, not this checkout — the scaffold copies no `tools/` directory, so
// `node tools/zotero-write.mjs` resolves to nothing there.
//
// The helpers no longer ship in this package: they live in `@beibingyangliuying/dsh-zotero` and this
// module resolves THAT package. The resolution is a package-subpath lookup rather than a guess, so it
// is correct wherever the channel package is installed — a checkout, a junction in the profile, or an
// npm install — and it fails loudly here, at preset load, when the dependency is missing. A silent
// fallback would print a command that cannot run.
//
// A shipped skill is static Markdown and cannot compute an absolute path, so a body that names a
// helper carries the `{{presetTools}}` token and this module fills it in when the skill is registered.
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/** The token a shipped skill body uses for the helper directory. */
export const TOOLS_TOKEN = '{{presetTools}}'

/** The package that ships the helpers. A peer this preset needs installed beside it, not a sibling checkout. */
export const CHANNEL_PACKAGE = '@beibingyangliuying/dsh-zotero'

/**
 * Absolute directory of that package.
 *
 * `import.meta.resolve` answers the URL of its `tools-dir` entry, and the helpers sit one level below
 * the package root. Resolving the entry rather than a guessed path is what keeps this correct under a
 * junction: the entry resolves through the package's own `exports`, not through the profile layout.
 *
 * It is a PEER, and pnpm refuses a git-resolved subdependency, so the two packages are installed one
 * after the other. That makes a missing peer a normal state rather than an impossible one, and the
 * failure is loud on purpose: the alternative is a preset that loads and then hands an agent commands
 * that resolve to nothing.
 */
export const channelPackageDir = (() => {
  try {
    return dirname(fileURLToPath(import.meta.resolve(`${CHANNEL_PACKAGE}/tools-dir`)))
  } catch (error) {
    throw new Error(
      `${CHANNEL_PACKAGE} is not installed, so every channel command this preset hands an agent would ` +
        `resolve to nothing. Install it first, then this preset:\n` +
        `  dsh plugin --profile web add github:beibingyangliuying/dsh-zotero#v0.1.0\n` +
        `  dsh plugin --profile web add github:beibingyangliuying/dsh-autoresearch\n` +
        `(${CHANNEL_PACKAGE}/tools-dir did not resolve: ${error?.code ?? error?.message ?? String(error)})`,
    )
  }
})()

/**
 * Absolute directory of the helpers.
 *
 * Forward slashes are kept deliberately: Windows accepts them, and a path pasted into a shell
 * command or a prompt needs no escaping that way. The trailing slash is dropped so a body can write
 * `{{presetTools}}/zotero-write.mjs`.
 */
export const cliToolsDir = join(channelPackageDir, 'tools').replace(/\\/g, '/').replace(/\/+$/, '')

/**
 * Replace every helper-directory token in one text.
 *
 * @param {string} text A skill body, or any text that may name a helper.
 * @returns {string} The same text with every token replaced; unchanged when there is none.
 */
export function fillToolsPath(text) {
  return String(text).split(TOOLS_TOKEN).join(cliToolsDir)
}
