# Autoresearch — a domain-neutral research workbench

A selectable agent preset, a set of on-demand research disciplines, and a scaffold for one study.
It constrains **how** research is conducted — evidence typing, challenge, handoff, run records,
settlement — and deliberately says nothing about **what** is researched.

**The contract is normative: [`protocol.md`](protocol.md).** Where this README, the composition file,
or any discipline text disagrees with it, the protocol wins.

**Names live in the index: [`surface.md`](surface.md).** This file intentionally does **not** repeat
the symbol list; two lists of the same names always drift apart.

## Use it

```powershell
# 1. the preset is installed as a bundle in the current profile; confirm it is live
#    (roster shows it, and the composition carries it)
dsh --profile web --dump-config | Select-String 'preset-autoresearch'

# 2. start a NEW session and select the preset in the roster
#    (an existing session keeps the composition it started with)

# 3. scaffold a study
.\tools\new-project.ps1 -Target D:\path\to\new-study -DryRun
.\tools\new-project.ps1 -Target D:\path\to\new-study
```

Two channels are optional and need setup outside this repository:

- the reference-library channel requires the desktop reference manager to be **running** with its
  local API enabled (Settings → Advanced → allow other applications on this computer to communicate
  with it);
- the preprint channel needs no credentials.

## Develop it

```powershell
# preset structure: composition, persona, routing, leak guards
dsh --profile web --dump-config > .tmp\composed-web.txt
node tools\preset-selftest.mjs .tmp\composed-web.txt

# isolation plugin, without DSH
node tools\isolation-selftest.mjs

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

## Layout

```text
protocol.md            normative contract (semantics, boundary, invariants, non-goals)
surface.md             non-normative index: concept <-> name
README.md              this entry document
autoresearch-preset/   the composition, the isolation plugin, the persona text
skills/                the on-demand disciplines (source; install into the user skill directory)
project-template/      the study scaffold, copied per study
tools/                 self-tests, probes and the scaffolder
docs/                  Chinese review aids and the frozen development log
```

## Known constraints

- **Cloud sync breaks hash-anchored edits.** A sync client watching the workspace changes file
  timestamps underneath the editor, which the version guard reports as a stale read. Pause sync for
  the workspace.
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
  global names also masks the preset's own shell, filesystem, skill and subagent tools; the agent then
  reports having no shell. Use `deny = (global view) − keep-list`, recomputed per activation (which
  also covers a plugin installed later). `isolation-selftest.mjs` asserts the filter carries no
  `allow` list.

## Language

The contract pair and this README are English, because they describe an English artifact (the
persona text and the discipline texts). `docs/` holds Chinese review aids for the repository owner
and the frozen development log; each subtree is uniform on purpose.
