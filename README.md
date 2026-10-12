# Autoresearch — a domain-neutral research workbench

A selectable agent preset, a set of on-demand research disciplines, and a scaffold for one study.
It constrains **how** research is conducted — evidence typing, challenge, handoff, run records,
settlement — and deliberately says nothing about **what** is researched.

**The contract is normative: [`protocol.md`](protocol.md).** Where this README, the composition file,
or any discipline text disagrees with it, the protocol wins.

**Names live in the index: [`surface.md`](surface.md).** This file intentionally does **not** repeat
the symbol list; two lists of the same names always drift apart.

## Install

The preset is a DSH bundle: a package whose `package.json` points at a composition patch. Installing
the package registers the preset.

```powershell
# from GitHub (expected to work: the bundle needs no build step)
dsh plugin --profile web add github:<user>/<repo>

# or, while developing against a checkout, install it as a bundle whose entry is a LINK to the
# checkout, so edits here are live for new sessions
dsh plugin --profile web add <path-to-checkout>/autoresearch-preset
```

Confirm it registered — the composition should carry the preset row:

```powershell
dsh --profile web --dump-config | Select-String 'preset-autoresearch'
```

The GitHub path above has not been exercised yet; the local-link path has. If GitHub installation
fails, open an issue with the error rather than working around it silently.

## Start a session with the preset

**Select the preset where the new session is created.** This matters more than it looks:

> A session is created with the **default** preset and only then records a later preset selection.
> The live agent keeps the preset it was created with, so switching the preset inside an existing
> session does **not** re-create it — your first message is still handled by the default agent.

So: pick the preset at the new-session entry, then talk. If you already have a session and switched
the preset afterwards, trigger a **new** agent (restart the host and resume the session, or spawn a
subagent from it); the change applies to agents created after the switch, not to the live one.

## What you get

- **A composition of its own.** The preset declares its own rows rather than inheriting the default
  surface, and a small isolation plugin masks the profile's other global tools so a research session
  is not buried in unrelated capabilities.
- **Disciplines on demand.** Eight written disciplines ship **inside the bundle** and the preset
  registers them itself, so they are available to its agents — and to no other session in the
  profile — with no copying step.
- **Two external channels.** A preprint index (search plus full text, no credentials) and the
  owner's local reference library (including paywalled full text). Both are optional; see
  [`protocol.md`](protocol.md) §6.
- **A study scaffold.** A per-study directory layout with the journals, pitfalls, rulings and
  literature indexes a study accumulates.

## Configure it

Open the preset's settings page. Every row's `Config` is projected into an editable form, so nothing
requires hand-editing a YAML file:

- **Contact address** (`mailto`) — identifying yourself to the free metadata APIs gets faster service
  and gentler rate limits. Leave it empty and no contact is sent; the preset behaves exactly as it
  does with no configuration at all.

Two channels need setup outside this repository:

- the local reference library requires the desktop reference manager to be **running** with its local
  API enabled (Settings → Advanced → allow other applications on this computer to communicate with it);
- the preprint channel needs no credentials.

## Start a study

```powershell
.\tools\new-project.ps1 -Target D:\path\to\new-study -DryRun   # show what would be created
.\tools\new-project.ps1 -Target D:\path\to\new-study           # create it
```

The scaffolder is PowerShell today, so this step is Windows-only. Copy `project-template/` by hand
elsewhere; the layout is the same.

## Layout

```text
protocol.md            normative contract (semantics, boundary, invariants, non-goals)
surface.md             non-normative index: concept <-> name
README.md              this entry document
autoresearch-preset/   the composition, the preset's own plugin rows, the persona text
autoresearch-preset/skills/   the on-demand disciplines (shipped in the bundle; registered by the preset itself)
project-template/      the study scaffold, copied per study
tools/                 self-tests, probes and the scaffolder
docs/                  Chinese review aids and the frozen development log
```

## Develop it

```powershell
# preset structure: composition, persona, routing, leak guards
dsh --profile web --dump-config > .tmp\composed-web.txt
node tools\preset-selftest.mjs .tmp\composed-web.txt

# the preset's own plugins, without DSH
node tools\isolation-selftest.mjs        # tool isolation
node tools\contact-bridge-selftest.mjs   # configurable values -> prompt
node tools\skills-selftest.mjs           # shipped disciplines parse and register

# documentation structure (contract/index split)
node tools\doc-selftest.mjs

# MCP servers, without DSH
node tools\mcp-probe.mjs uvx arxiv-mcp-server
$env:ZOTERO_LOCAL='true'; node tools\mcp-probe.mjs uvx zotero-mcp

# reference library writes: dry run first; --write makes Zotero ask you to Allow
node tools\zotero-write.mjs --arxiv 1706.03762
node tools\zotero-write.mjs --arxiv 1706.03762 --write
```

**Do not re-run `install_bundle` on the preset.** The bundle entry is a link to this directory, so
editing the composition file here is already live for new sessions; re-installing has been observed
to fail with a source-mismatch and risks replacing the link with a copy, which would silently break
that property. `preset-selftest.mjs` asserts the link is still a link.

## Known constraints

- **A preset's own rows are registered under the preset's scope.** A plugin mounted by a preset's
  standing composition contributes only to that preset — that is what lets the disciplines stay out
  of unrelated sessions, and it is also why some hooks behave differently here than in a host-level
  plugin. Two observed cases: `agent/created` is dispatched before an agent is linked to its scope,
  so a preset-scoped listener never receives it; `agent/pre-step`, `tools/result` and `session/event`
  do arrive.
- **A plugin that waits on a late service registers its tools after the preset activates.** The
  isolation filter is computed at activation, so such a tool is not masked (the preset carries a
  best-effort second pass, but it has not been observed to take effect). A plugin injecting
  `settings` or `credentials` is the common case.
- **Cloud sync breaks hash-anchored edits.** A sync client watching the workspace changes file
  timestamps underneath the editor, which the version guard reports as a stale read. Pause sync for
  the workspace.
- **A Windows reparse point defeats `Dirent.isDirectory()`.** A directory synced by a cloud client (or
  a junction) reports `false` there while still holding files, so a directory scan that filters on it
  silently finds nothing. Probe for the file instead.
- **The reference manager's local API answers `HTTP/1.0`.** Query it with `curl.exe`; the PowerShell
  web cmdlet fails on that response.
- **A full text can be ~80k characters.** The tool-result pruner keeps only a result's head and tail,
  so long texts are pulled to a file and read by offset instead.
- **A rate-limited metadata source is a constraint, not a bug.** It is not retried in a loop.
- **A `patch: entry "..." not found` warning is usually not junk.** In a profile patch layer, a row
  that only sets `disabled: true` is a *conditional* switch: it does nothing today, and takes effect
  the moment a bundle provides that row again. Deleting such a row silently **re-enables** the
  plugin. Only a row that carries configuration or an insertion *and* has no target is genuinely
  dead. Check which of the two you are looking at before cleaning anything up.
- **A request that waits for a human must not use `fetch`.** Zotero's authorization dialog blocks the
  response until the user answers, and fetch's default headers timeout turns that into a bare
  `fetch failed` with no cause. Local calls use `node:http` with the timeout disabled.
- **An array `POST` to the local API answers with the saved object, not the key.** Read `.key` from
  `successful["0"]`; treating it as a string yields `[object Object]` and a broken read-back URL.
- **A relative row name in a preset declaration makes the preset unselectable.** `name: './x.js'`
  resolves against the patch file while the composition is built, but against a different base URL
  during the registry's trial mount. The row then reports `never started`, the whole preset is marked
  `broken`, and the new-session roster **silently filters it out**. Name such a plugin by a resolvable
  package subpath (for example `@local/<bundle>/isolation.js`). Diagnose it on the preset settings
  page: the card carries a red "failed to load" badge whose tooltip is the reason — and that page
  reads a cached store, so refresh before concluding anything.
- **Tool isolation must be a deny list, not an allow list.** `ctx.tools.restrict()` filters what a
  scope **inherits** — the global layer and every ancestor layer on its chain — and never its own
  layer. For an agent, the preset's own rows are an **ancestor contribution**, so an `allow` list of
  global names also masks the preset's own shell, filesystem, skill and subagent tools, and the agent
  reports having no shell. Use `deny = (global view) − keep-list`. That single pass at activation is
  the guarantee; `isolation-selftest.mjs` asserts the filter carries no `allow` list.

## Language

The contract pair and this README are English, because they describe an English artifact (the
persona text and the discipline texts). `docs/` holds Chinese review aids for the repository owner
and the frozen development log; each subtree is uniform on purpose.

## License

MIT — see [`LICENSE`](LICENSE).
