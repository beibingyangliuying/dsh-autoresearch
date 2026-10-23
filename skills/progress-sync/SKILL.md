---
name: progress-sync
description: Settle one work round into three layers — mnemon Documents hold conclusions and rejected directions with their reasons, runtime memory holds the few cross-session essentials, and the workspace journal holds the round-by-round log; fact/inference/exploratory is enforced and process may never be written as a conclusion. Use when a round ends, a session is about to end, a direction is rejected, or work must be handed off or resumed.
---

# progress-sync — three-layer progress settlement

This skill does exactly one thing: make "what this round did, what it found, what it killed" **directly usable by the next session**. It does not issue the study's final rulings.

## 1. When to use

- A work round has come to a stop (not after every single step)
- The session is about to end, or context is approaching compaction
- A direction has been rejected or shelved
- **A contract changed in this round**: a normative document, an invariant, a ruling, or an agreed
  convention was revised. Do not wait for the round to end — the next session reads the record, not
  the diff, and an unrecorded revision is invisible to it.
- Work must be handed to the next session or to another person

**Not applicable**: nothing conclusive was produced yet (then write the log only; the full flow of this skill is unnecessary).

## 2. First step: read the existing layering and authority as a ruler

Do a **read-only survey**:

1. What document hierarchy does the workspace have? What is normative, what is a note, what is archived?
2. What is **already** in mnemon? (`search` first, to avoid writing a duplicate)
3. How much of runtime memory is used? (It has two hard caps: MEMORY 10KB / USER 4KB.)

Write the result up as a "ruler" list.

## 3. Criteria: what goes into which layer

| Content | Destination | Reason |
|---|---|---|
| Conclusions (evidence-backed) | **mnemon Documents** — one document per topic, current state | Project knowledge that can be revisited across sessions |
| **Rejected directions + the reason** | **mnemon Documents** | The single most valuable entry later: it prevents walking the same dead end twice |
| Ruling outcomes (from `redteam-ruling`) | **mnemon Documents** | Decision grounds must be traceable |
| The few cross-session essentials (notation conventions, current main line, user rulings) | **runtime memory** | Needed every round, but **size-capped** |
| Round-by-round log, literature notes, ruling-request originals | **workspace Markdown** | Diffable and replayable; must not enter memory |
| **The reason a contract changed**: what was wrong, what was rejected, on what grounds | **mnemon Documents** | The reason survives the change; it is what stops the same dead end being walked again |
| A description of the state **before** a change that has already landed (a pending list, an "awaiting ruling" inventory) | workspace Markdown, marked superseded — or left unwritten | It is false the moment the change lands, and kept unmarked it reads as current fact |

### 3.1 What every record states, once

**Class** — the block's footing, stated once; a fact is unmarked, and a block whose class differs from
its neighbours is marked. **Source** — named once, where the claim enters the record (which file /
which ruling / which search); a later mention of that claim is a pointer, not a fresh citation.
**Time** — only where the line snapshots something outside the record (a count or a status as read, a
date a search was run) or where order carries meaning; a conclusion is not dated.

### 3.2 Rejected directions are mandatory

If any direction was rejected this round, **you must** record "what was rejected + why + on what grounds". If none, write "no rejections this round".

### 3.3 Where pitfalls and experiment cards go

Paths here are relative to the study's **layer root** — `research/` where that directory exists, the study
root otherwise (protocol §7).

| Content | Destination | Why not the obvious alternative |
|---|---|---|
| A pitfall: symptom → cause → fix → environment + date | `<layer root>/pitfalls/` (append-only, symptom-indexed) | **Not** mnemon: pitfalls are numerous, short, looked up by symptom, and pruned when the environment changes |
| An experiment: prediction, command, config/seed, artifacts, validity, verdict | `<layer root>/experiments/<id>.md` (`experiment-protocol` owns the fields) | **Not** the journal: a card is a re-runnable record, a journal line is a log entry |
| The few rules you must obey every round | runtime memory | It is auto-injected, and hard-capped — long lists do not fit |

## 4. Do vs don't

### 4.1 Do

- `search` before writing, so the same fact is not stored twice
- Organise mnemon Documents **by topic**, not by round: a hit is updated in place, and a second
  document on one topic is merged into the survivor rather than kept beside it
- Keep each runtime-memory entry to one line and self-contained

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** force it in)

| Hit | Action |
|---|---|
| It is only "today I did X", with no conclusion | **Log only**; do not put it in Documents. |
| The conclusion has no evidence or source | Mark `[exploratory]`; it **must not** enter the conclusions section of Documents. |
| It conflicts with existing Documents | **Never overwrite silently**; record "revision + reason", or request a ruling. |
| It exceeds the runtime-memory cap | Push it down into Documents; **never** squeeze or truncate it into an unreadable line. |
| It is long prose intended for runtime memory | Refuse; put it in Documents or a workspace file instead. |
| A document only describes the state before a change that has already landed | Mark it superseded, or leave it out. It is a record, not a conclusion. |
| A document on this topic already exists | Update it in place; a second document is a duplicate, not a backup. |
| The topic needs an inventory (one row per question, source or section) | Put it in a ledger of its own and point at it; a Document carrying rows is a ledger with a prose head. |
| A row's cell has grown an argument | Move the argument into the state note; the cell keeps the value it is read for. |

## 5. Wording discipline

- The log must be **replayable**: who · when · on what grounds · what came out.
- Never write process as a conclusion ("analysed the data" is not a conclusion).
- "Done" must carry a **verifiable artifact path** (where the file is).
- Never write "not done" as "deferred" (the latter reads like a decision; the former is the fact).

## 6. Report shape

### 6.1 Workspace journal (append-only, one file per round)

`<layer root>/journal/<YYYYMMDD>_<short-topic>.md`. Sections are optional — write only the ones that
carry content, in this order:

1. `## Goal of this round`
2. `## What was done`
3. `## Observed (facts)`
4. `## Inferences`
5. `## Exploratory ideas` (at most three lines; point at `directions/` when it exists)
6. `## Unresolved`

A fact or a conclusion already settled in a Document is cited by path, not restated here.

**Budget — 60 lines of prose** (commands, tables and quoted output aside). Past it, cut in this order:
evidence restated from its carrier → a second reason for the same claim → per-object detail a ledger
holds → how the statement changed. Never cut the load-bearing limit or the falsification condition. A
journal is not compacted later — it is a round's log — so the cut is made before the line lands: link
the artifact that holds the detail instead of copying it.

### 6.2 mnemon Documents (topic-based, current state)

One document per topic, not per round. `search` first; a hit is **updated**, never duplicated, and a
second document on one topic is merged into the survivor. The title is its routing description and
carries no date, version or revision number.

A Document is a **state note**, not a ledger. Its opening block comes first and is where a reader
stops: the conclusion that holds now, and what would change it. What follows is `conclusions` /
`evidence` / `rejected alternatives and why` / `open items`, each as it currently stands — and
`evidence` holds **pointers** to the carriers (a ledger row, a card, a note), never the evidence
restated. A topic that needs an inventory — one row per question, source or section — keeps a
**ledger**: a workspace file, or the study's own table. The Document points at it and never carries
its rows; a cell that has grown an argument is moved out to the note it belongs to.

**Budget — 120 lines.** Past it, cut in this order: evidence restated from its carrier → a second
reason for the same claim → per-object detail a ledger holds → how the statement changed. Never cut the
load-bearing limit or the falsification condition.

### 6.3 runtime memory

Only the few rules needed across sessions; each self-contained, and never a copy of a conclusion that
already lives in a Document.

### 6.4 Compaction — the three clocks

| Clock | Fires when | Action |
|---|---|---|
| Before writing | the topic already has a document; the section would be empty; the file is already over budget | update, do not create; do not write the empty section; compact first |
| Over budget | the write would pass the file's budget | give things up in this order: evidence restated from its carrier → a second reason for the same claim → per-object detail the ledger holds → how the statement changed; never the load-bearing limit. A replaced statement becomes one dated `superseded <date>: <what> → <where>` line, and totals, exceptions and a pointer stay |
| Settlement | two documents share a topic, or the study has more than 12 journal files | merge the documents into the survivor (conclusions, rejections, open items) and archive the rest through mnemon; add `journal/INDEX.md` instead of merging journal originals |

**Receipt.** Every compaction leaves one line — in the journal for a document merge, at the file's foot
for a compaction: `compacted <date>: <file> −N lines (<what moved where>)`. Compaction never deletes a
judgement: it moves it to its carrier, and git keeps the old text. Journal originals are not merged, and
a journal file is never compacted — it is the round's log, kept as written.

## 7. Instrument discipline (where this skill most easily goes wrong)

- mnemon Documents are **managed storage**: write only through the managed tools, **never** through file-editing tools.
- A Document is **updated in place**, not appended to round by round: an append-only Document is the
  failure this discipline exists to prevent.
- Do not delete existing Documents; if something must be retired, use mnemon's own archive flow — the
  study's `archive/` is a different place, and moving a document there is the owner's act, not a round's.
- Runtime memory is hard-capped; check current usage before writing.
- If the workspace already has a document hierarchy, **follow it** (location, naming, authority order).

## 8. Acceptance checklist

- [ ] `search` was run first; the topic's document was updated, not duplicated
- [ ] Every record states its class, source and time once — not a stamp on every mention
- [ ] The Document opens with the conclusion that holds, and `evidence` points at its carriers
- [ ] No ledger row sits inside a Document: an inventory the topic needs is a ledger of its own
- [ ] Rejected directions and reasons are recorded (or "no rejections this round" is stated)
- [ ] Unevidenced content went only to the log, not to the Documents conclusions section
- [ ] Conflicts with existing content are recorded as "revision + reason"
- [ ] Runtime memory is within its caps
- [ ] Every "done" in the log carries an artifact path
- [ ] A contract, invariant or ruling revised this round is recorded now, not only at close-out
- [ ] Change **reasons** are recorded; pre-change state descriptions are marked superseded
- [ ] No empty section was written, and the journal and Document budgets were kept
- [ ] Every merge or compaction left its one-line receipt

## 9. Don't

- Do not issue the study's final rulings
- Do not process raw data or clean datasets
- Do not modify normative documents
- Do not use the log as if it were a conclusion
