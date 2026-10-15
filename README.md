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
# from GitHub: the repository root IS the bundle, and it needs no build step
dsh plugin --profile web add github:beibingyangliuying/dsh-autoresearch

# or, while developing against a checkout, install it as a bundle whose entry is a LINK to the
# checkout: no re-install is needed after an edit, but the edit reaches a session only after the host
# process restarts (the preset registry mounts the definition it parsed at startup)
dsh plugin --profile web add <path-to-checkout>
```

Confirm it registered — the composition should carry the preset row:

```powershell
dsh --profile web --dump-config | Select-String 'preset-autoresearch'
```

That GitHub path is verified end to end: the package lands in the profile as a real copy, pnpm
hoists the one dependency so the row's import resolves, and the composition then carries the preset and
its three rows. The local-link path is for developing against a checkout.

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
- **Convert new stored PDFs** (`autoLinkAttachments`) — off by default. When on, a literature round
  offers to convert PDFs the reference library *stores* into linked files under the directory below:
  the file is copied out, and the library keeps only a link to it. The agent reports the list first,
  and every write still needs your approval in the reference manager.
- **Attachment store directory** (`attachmentStorePath`) — where those converted PDFs go. Use the same
  directory the reference manager uses as its linked-attachment base: a file under it is recorded as a
  relative path and survives moving to another machine, while a file elsewhere is recorded as an
  absolute path. Empty disables the conversion.

The conversion ships in two halves, and the split is deliberate: a bulk run through the local API
would need one authorization dialog per write, and the contract forbids an unattended or bulk
write-back into the reference library ([`protocol.md`](protocol.md) §9). So the increment goes through
the API, and the bulk migration runs inside the application, at your keyboard.

```powershell
# increment: a few new stored PDFs per round. Dry run unless --write is given.
node tools\zotero-link-attachments.mjs --target D:\OneDrive\Zotero
node tools\zotero-link-attachments.mjs --target D:\OneDrive\Zotero --write

# bulk migration: paste the file below into the reference manager's Run JavaScript window.
tools\zotero-link-snippet.js
```

Two channels need setup outside this repository:

- the local reference library requires the desktop reference manager to be **running** with its local
  API enabled (Settings → Advanced → allow other applications on this computer to communicate with it);
- the preprint channel needs no credentials.

**What the reference-library channel can do.** Its server exposes collection management (create,
rename, nest, delete), item add and update, notes, annotations and bibliography export, alongside
search and full-text reading — and it reports that it cannot write at all until you authorize a write
in the reference manager's own dialog. That dialog is the gate the contract names: each write needs its
own approval, "Always Allow" is refused, and the rule is stated in the agent's prompt because a tool
this preset's own row registers cannot be masked by the isolation filter. The row is pinned to one
server version with its optional tool groups off, so the surface an agent sees cannot drift under a
settings edit; [`docs/01_decisions.md`](docs/01_decisions.md) records the measurements behind both choices.

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
package.json           the bundle manifest: name, the composition patch, the one dependency
index.js               the bundle's own row: it carries the editable configuration
client.js              the settings page for that configuration (browser half)
cordis.patch.yml       the composition: the preset declaration and its rows
isolation.js           tool isolation (a deny list over the global view)
contact-bridge.js      configurable values -> system prompt
preset-paths.js        where this package's own helper programs live, as an absolute path
skills.js              registers the shipped disciplines into this preset's layer
skills/                the on-demand disciplines, one <name>/SKILL.md each
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
node tools\client-selftest.mjs           # the browser half parses, loads and registers

# documentation structure (contract/index split)
node tools\doc-selftest.mjs

# MCP servers, without DSH (both rows are pinned in the composition; probe the same pinned spec)
node tools\mcp-probe.mjs -- uvx --from 'arxiv-mcp-server==0.8.2' arxiv-mcp-server
$env:ZOTERO_LOCAL='true'; node tools\mcp-probe.mjs -- uvx --from 'zotero-mcp-server==0.14.1' zotero-mcp

# what a server's tool schema costs per request, and which version answered
node tools\mcp-toolsize.mjs -- uvx --from 'zotero-mcp-server==0.14.1' zotero-mcp

# call one tool and keep the FULL result (mcp-probe truncates a result at 1500 characters)
$env:ZOTERO_LOCAL='true'; node tools\mcp-call.mjs zotero_get_collections -- uvx --from 'zotero-mcp-server==0.14.1' zotero-mcp

# reference library writes: dry run first; --write makes Zotero ask you to Allow
node tools\zotero-write.mjs --arxiv 1706.03762
node tools\zotero-write.mjs --arxiv 1706.03762 --write
```

**The preset's helper programs are addressed absolutely, on purpose.** An agent of this preset works in
a study workspace, which carries no copy of them, so the prompt announces this package's helper
directory and the shipped disciplines name those programs through a token that `skills.js` fills in when
it registers them. A path relative to this repository names nothing where the agent actually runs.

### Session diagnostics

```powershell
# which preset each session RAN: the last selection, with the creation-time value when they differ
node tools\dump-session.mjs --scan %USERPROFILE%\.dsh\sessions
node tools\dump-session.mjs <sessionDir> [outFile]        # decompress one transcript
node tools\session-shape.mjs <session.jsonl>             # structural shape, bounded output
node tools\probe-session.mjs <session.jsonl> <needle>    # record census + context around a needle
node tools\list-tools.mjs <session.jsonl>                # tool names its request header carried
```

These read the transcripts alone, and together they answer "which preset did that session really run,
and what tools did its agent see". That pair of questions settled two investigations here, so reach for
these before asking for another restart.

**A session record's own `agentPreset` is the value at creation**, normally the profile default, while
the preset a session actually runs is recorded separately a moment later and again on every switch.
`--scan` therefore reports the effective selection and shows the creation-time value beside it when the
two differ; reading the first record alone reports the default for sessions that plainly ran a preset,
which is what it did until 2026-10-15 ([`docs/01_decisions.md`](docs/01_decisions.md) §26). The tool
names inside `request/header` remain the hard evidence for what an agent actually saw.

**Do not re-run `install_bundle` on the preset.** The bundle entry is a link to this directory, so an
edit needs no re-install; re-installing has been observed to fail with a source-mismatch and risks
replacing the link with a copy, which would silently break that property. `preset-selftest.mjs`
asserts the link is still a link.

**An edit here reaches a session only after the HOST restarts — not at the next session.** The preset
registry stores the definition it parsed when the host started and mounts that stored definition for
every new session, and the host process's module cache keeps the plugin code from the same moment. A
session created after an edit therefore still runs the previous composition: verified on 2026-10-14,
where a session opened after the edit reported the old server's tools and a prompt without the new
lines, while the host process had started 90 minutes before the edit. `--dump-config` and the
self-tests above describe what the NEXT start will mount, so they can pass in full while a running
session still shows the earlier surface. See [`docs/01_decisions.md`](docs/01_decisions.md) §25.

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
  package subpath (for example `@<scope>/<bundle>/isolation.js`) **that Node can actually resolve** —
  see the next entry, which is how that requirement is checked.
  page: the card carries a red "failed to load" badge whose tooltip is the reason — and that page
  reads a cached store, so refresh before concluding anything.
- **A package that declares `exports` seals itself against its own row names.** Node resolves a row
  name written as a package subpath (`<bundle>/isolation.js`) through the package's `exports` map, so a
  subpath that map omits throws `ERR_PACKAGE_PATH_NOT_EXPORTED` **while the file sits right there on
  disk**. The row reports `never started`, the whole preset is marked `broken`, and the roster hides it —
  the same outcome as a relative name, from the opposite cause. Declaring a client half is what seals a
  package, so every declared row subpath belongs in that map. `preset-selftest.mjs` resolves each
  declared row name through Node **from the profile**, which is the check that sees this; asking the
  file system whether the file exists does not.
- **Tool isolation must be a deny list, not an allow list.** `ctx.tools.restrict()` filters what a
  scope **inherits** — the global layer and every ancestor layer on its chain — and never its own
  layer. For an agent, the preset's own rows are an **ancestor contribution**, so an `allow` list of
  global names also masks the preset's own shell, filesystem, skill and subagent tools, and the agent
  reports having no shell. Use `deny = (global view) − keep-list`. That single pass at activation is
  the guarantee; `isolation-selftest.mjs` asserts the filter carries no `allow` list.
- **The settings panel projects only fields marked `volatile()`.** A Config field without it makes the
  settings layer's form projection return nothing for the entry, and the entry is then dropped from
  `describe()` **without a word**: the panel renders no form, and the remote surface cannot even write
  it — a write is refused with "has no volatile fields". The row keeps its Config the whole time; only
  the surface disappears, which is why the schema looks correct in every other check. Mark every field
  meant to be editable, and give it a `description()`: that text is what the form renders beside it.
- **A preset cannot mask the skill catalog.** Tool isolation is a deny list over the global view, but
  the skill registry exposes no equivalent restriction: a catalog read merges the global layer with
  the viewing scope's chain, and the preset's own registrations win only on a duplicate name. A
  preset session therefore sees every skill the profile carries. This was measured rather than
  assumed, on two sessions created with this preset: each received a **20-entry** catalog, of which
  **8** were the preset's shipped disciplines and **12** came from the profile, the foreign entries
  taking **3,367 of the catalog's 6,971 characters**. Both available levers are unusable —
  `includeDefaultRoots: false` would also drop each study's project-level skill directory, and
  shadowing a foreign name replaces its description without removing the entry. Treat the catalog as
  untrusted breadth: the resident discipline says a listed skill outside the routing list is not this
  preset's method.

## Language

The contract pair and this README are English, because they describe an English artifact (the
persona text and the discipline texts). `docs/` holds Chinese review aids for the repository owner
and the frozen development log; each subtree is uniform on purpose.

## License

MIT — see [`LICENSE`](LICENSE).
