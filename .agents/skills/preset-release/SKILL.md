---
name: preset-release
description: Self-check and publish THIS preset repository — the suite that must pass, the reader-facing claims that must be re-scanned against whatever just changed, the surface rules that quietly break a preset (row names vs exports, volatile fields, absolute helper paths, a mounted MCP row), the machine-local traces that must not ship, and how to verify what a new user actually installs from the published tag instead of trusting a green local suite. Use when finishing a change to this repository, before tagging a version, when the preset disappears from the new-session roster, or when asked whether the preset still agrees with its own contract.
whenToUse: A change to this repository is about to be committed or a version is about to be tagged; the preset vanished from the new-session roster; a session shows the previous surface after an edit; someone asks whether the preset still matches protocol.md, or whether installing it needs any extra toolchain.
---

# preset-release — self-check, then publish, then verify from the remote

This skill is about the repository that **ships** the preset, not about doing research with it. Two
phases, and one rule that catches more defects than either.

## 1. When it applies

- A change to this repository is about to be committed, or a version is about to be tagged.
- The preset disappeared from the new-session roster, or a session shows the surface from before an edit.
- Someone asks whether the preset still agrees with `protocol.md`, or whether installing it needs a
  Python environment, `uv`, or anything else.

**Not applicable**: a read-only question about the contract. Read it and answer; do not run a release
flow to answer a documentation question.

**Do not move this skill into `skills/`.** That directory is the preset's shipped disciplines: it is the
authoritative symbol source for `doc-selftest`, and `preset-selftest` asserts one routing bullet per
shipped discipline. A maintenance skill belongs to this checkout, where only sessions opened here can
see it.

## 2. The rule that catches the most: re-scan for the OPPOSITE claim

When behaviour changes, some reader-facing sentence elsewhere still states the old behaviour, and it is
rarely in the file you edited. The two release-blocking defects found on 2026-10-15 were both of this
kind: `README.md` still told a reader that a late-registering plugin is **not** masked (Revision 9 and
§33 had just made it masked), and `docs/overview.md` still narrowed the guarantee to activation time
while citing §17.

Procedure — do it before the commit, not after the release:

1. Name the claim you changed in one sentence, in its own words.
2. Grep that sentence's phrasings across every reader-facing file: `README.md`, `protocol.md`,
   `surface.md`, `docs/overview.md`, `docs/coverage.md`, `docs/decisions.md`, and the comments
   in `isolation.js` / `contact-bridge.js` / `skills.js`. The coverage map states in prose what each
   part covers and refuses, and only its **roster and paths** are machine-checked (`doc-selftest` DOC-8,
   DOC-9): a behaviour change that leaves a row's description stale is exactly what this step is for.
3. Fix every hit, or record why it is history.

**A normative claim lives in `protocol.md` and only there.** When the contract changes, bump its
Revision, state in its header what changed, and record the reason in `docs/decisions.md`. The
implementation is then corrected to match the contract — never the other way round. A retired claim
must also not survive as a *demoted* one: state the correction in the revision log rather than leaving
the old sentence to be read on its own.

## 3. Evidence rules — each of these cost a real investigation

- **`--dump-config` describes the NEXT start.** A running session can differ from the dump in every way
  that matters ([`docs/decisions.md`](../../../docs/decisions.md) §25).
- **Regenerate the dump before `preset-selftest`.** It refuses a dump older than `package.json` or
  `cordis.patch.yml`, on purpose: a stale dump reports both false passes and false failures.
- **Read `isolation-report.json` before running `isolation-selftest`.** The test deletes it; it is a
  gitignored generated file whose content is the verification evidence.
- **A check that cannot fail is not a check.** Drive every new guard with a mutation that must be
  detected, and assert that the old wrong thing is NOT registered — naming a replacement without naming
  the mistake invites the mistake back.
- **A green local suite says nothing about the published artifact.** The release check exists for
  exactly this; see §7.
- **A preset source edit reaches a session only after the HOST restarts.** Opening a new session, or
  reloading the page, is not enough (§25).
- **Never re-run `install_bundle` on the preset.** The entry is a link to this checkout; re-installing
  has been observed to fail on a source mismatch and risks replacing the link with a copy, which
  silently breaks "edit the source and it takes effect".

## 4. Phase 1 — the suite, in this order

```powershell
dsh --profile web --dump-config > .tmp\composed-web.txt
node tools\preset-selftest.mjs .tmp\composed-web.txt   # structure, persona, routing, cost, reverse guards

node tools\isolation-selftest.mjs
node tools\contact-bridge-selftest.mjs
node tools\skills-selftest.mjs
node tools\client-selftest.mjs
node tools\doc-selftest.mjs
node tools\toolchain-selftest.mjs
node tools\scaffold-selftest.mjs
node tools\arxiv-selftest.mjs
node tools\metadata-selftest.mjs
node tools\journal-rank-selftest.mjs
node tools\zotero-read-selftest.mjs
node tools\zotero-pdf-selftest.mjs
node tools\zotero-write-selftest.mjs
node tools\zotero-edit-selftest.mjs
node tools\zotero-collection-selftest.mjs
node tools\zotero-section-note-selftest.mjs
node tools\zotero-link-selftest.mjs
node tools\zotero-local-api-selftest.mjs
node tools\dump-session-selftest.mjs
node tools\release-check-selftest.mjs

node tools\release-check.mjs --local
```

`release-check --local` fails on a dirty working tree on purpose: that check is a precondition for
TAGGING, not for developing. Its other checks are the ones a change actually breaks — the composition
mounting nothing, every row name resolving through `exports`, and every self-test being named in the
README.

**Offline is the point.** None of these need a library, a network, or DSH running. A test that needs the
world is a test that is skipped.

## 5. The surface rules a change breaks quietly

| Symptom | Rule | Broken by |
|---|---|---|
| The preset is gone from the new-session roster | Every row name must resolve through Node **from the profile** — a package that declares `exports` seals its own subpaths | A relative `./x.js` row name, or a subpath missing from `exports` |
| A settings field renders no form, and cannot even be written | Every editable field needs `volatile()`, and a `description()` | Adding a Config field without it |
| The agent reports having no shell | Isolation is a deny list over the global view, never an allow list | Rewriting the filter as a keep-list of global names |
| A discipline names a helper the agent cannot find | Helpers are addressed absolutely; a skill body carries the `{{presetTools}}` token | A relative `tools/...` path in a skill or prompt line |
| The prompt grows by ~20k tokens per request | A channel is a program this package ships, never a mounted server | Adding an MCP row back (the guard fails on purpose) |
| The preset's own plugin leaks into every other session | Its own rows stay nested inside the preset | Moving `autoresearch-*` rows to profile level |

## 6. Machine traces — what must not ship

The repository is public and the preset claims domain neutrality. Before publishing, grep the shipped
files (not `docs/` prose that IS the evidence) for:

- **this machine**: drive letters, `OneDrive`, `%USERPROFILE%`, a home directory, a checkout path. The
  settings page's `placeholder` is part of the UI and counts.
- **the owner's library**: item keys, collection keys, collection names, attachment counts, and any
  example that a reader would paste and expect to resolve.
- **the owner's field**: paper titles, query words and sample texts in fixtures, templates and
  examples — a domain-neutral artifact must not demonstrate itself with one domain.

Keep the quantities that ARE the evidence: character counts, hit counts, versions before and after a
write, and a library size where a before/after comparison is the measurement. Replacing those turns a
measurement into an assertion.

## 7. Phase 2 — publish, then verify from the remote

1. **Bump the version in its OWN commit, after the fixes**, so the tag names a tree that is exactly the
   release. The contract's Revision number is independent of the package version; do not couple them.
2. Run §4 again on the final tree. `release-check --local` must be fully green, clean tree included.
3. **Annotated** tag, with a message a reader can act on: what this version is, how to install it, and
   what changed relative to the previous one.
4. Push the branch, then push the tag.
5. **Verify what a new user gets**: `node tools/release-check.mjs --tag vX.Y.Z`. It reads the published
   `package.json`, the published composition and the published helper programs over the network. This is
   the only check that can see the defect that mattered most here — 47 commits of green local work that
   nobody could install.
   **Read its exit code as three answers, not two**: `0` everything was checked and holds; `1` something
   was checked and is wrong; `3` a check could not RUN (no network, or a git proxy that is not up), with
   the reason printed and nothing proven about that question. `3` is not a softer `1` — during 0.14.0's
   own verification a dead proxy and a failing `fetch` each produced a false accusation, which is why the
   tool now says `UNVERIFIED` instead. On `3`, fix the transport and run it again rather than reading it
   as a defect in the release.
6. Record the release in `docs/decisions.md` when it carries a contract-relevant change.

## 8. Before saying "published"

- [ ] Every offline self-test and `preset-selftest` PASS on the final tree.
- [ ] `release-check.mjs --local` PASS, including the clean-tree check.
- [ ] The claim you changed was re-scanned everywhere (§2), and the contract revision bumped if it was
      normative.
- [ ] No machine trace in anything that ships (§6).
- [ ] Version bumped in its own commit; annotated tag; tag verified from the remote (§7).
- [ ] Decisions record updated with the measurements this round rests on.
- [ ] Choices that belong to the owner were confirmed with them item by item, not decided silently.
