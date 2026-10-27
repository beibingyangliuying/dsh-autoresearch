// Where the external-channel command-line helpers live, and what they currently ship.
//
// The helpers used to live under `tools/` in this repository. They now ship in a package of their own,
// and this preset consumes them by package subpath: `preset-paths.js` resolves the same entry to fill
// `{{presetTools}}` in a skill body. Two development instruments need the same answer - the release
// check reads the roster and the shared failure voice, and the toolchain page holds every citation to a
// file - so the lookup lives here once instead of being spelled twice with two chances to drift.
//
// The lookup is a package-subpath resolution rather than a guessed path, so it is correct under a
// junction, a checkout or an npm install. It is allowed to FAIL: an unresolved package is a real state
// (a fresh checkout that has not installed yet), and the callers turn it into a sentence rather than a
// crash.
import { createRequire } from 'node:module'
import { readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** The package that ships the helpers. A dependency of this repository, not a sibling checkout. */
export const CHANNEL_PACKAGE = '@beibingyangliuying/dsh-zotero'

/** The prefix a citation uses for a file inside that package, e.g. `channel/zotero-read.mjs`. */
export const CHANNEL_CITE_PREFIX = 'channel/'

/**
 * Absolute directory of the channel package's helpers, or undefined when the package is not installed.
 *
 * `tools-dir` is the package's own entry for this fact; resolving the entry rather than walking the
 * profile's `node_modules` is what makes the answer independent of how the package got here.
 *
 * @returns {string|undefined} The directory, or undefined when resolution fails.
 */
export function channelToolsDir() {
  try {
    return join(dirname(createRequire(import.meta.url).resolve(`${CHANNEL_PACKAGE}/tools-dir`)), 'tools')
  } catch {
    return undefined
  }
}

/**
 * The helper programs that package currently ships, as bare file names.
 *
 * Read from disk rather than written down: a helper added to the package is covered the day it lands,
 * which is the property a hand-written roster could never have.
 *
 * @returns {string[]} Sorted `.mjs` file names; empty when the package is absent.
 */
export function channelHelpers() {
  const dir = channelToolsDir()
  if (dir === undefined) return []
  return readdirSync(dir)
    .filter((name) => name.endsWith('.mjs'))
    .sort()
}

/**
 * Absolute path of a file a citation names with the `channel/` prefix.
 *
 * @param {string} file A citation path such as `channel/zotero-read.mjs`.
 * @returns {string} The absolute path, whether or not the file exists.
 */
export function channelFile(file) {
  return join(channelToolsDir() ?? '', file.slice(CHANNEL_CITE_PREFIX.length))
}
