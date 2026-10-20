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
| Conclusions (evidence-backed) | **mnemon Documents** | Project knowledge that can be revisited across sessions |
| **Rejected directions + the reason** | **mnemon Documents** | The single most valuable entry later: it prevents walking the same dead end twice |
| Ruling outcomes (from `redteam-ruling`) | **mnemon Documents** | Decision grounds must be traceable |
| The few cross-session essentials (notation conventions, current main line, user rulings) | **runtime memory** | Needed every round, but **size-capped** |
| Round-by-round log, literature notes, ruling-request originals | **workspace Markdown** | Diffable and replayable; must not enter memory |
| **The reason a contract changed**: what was wrong, what was rejected, on what grounds | **mnemon Documents** | The reason survives the change; it is what stops the same dead end being walked again |
| A description of the state **before** a change that has already landed (a pending list, an "awaiting ruling" inventory) | workspace Markdown, marked superseded — or left unwritten | It is false the moment the change lands, and kept unmarked it reads as current fact |

### 3.1 Every record must carry

**Type** (`fact` / `inference` / `[exploratory]`) · **Source** (which file / which ruling / which search) · **Time**.

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
- Organise mnemon Documents **by topic**, not by round
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

## 5. Wording discipline

- The log must be **replayable**: who · when · on what grounds · what came out.
- Never write process as a conclusion ("analysed the data" is not a conclusion).
- "Done" must carry a **verifiable artifact path** (where the file is).
- Never write "not done" as "deferred" (the latter reads like a decision; the former is the fact).

## 6. Report shape

### 6.1 Workspace journal (append-only)

`<layer root>/journal/<YYYYMMDD>_<short-topic>.md`, fixed sections:

1. `## Goal of this round`
2. `## What was done`
3. `## Observed (facts)`
4. `## Inferences`
5. `## Exploratory ideas` (always marked `[exploratory]`)
6. `## Unresolved`

### 6.2 mnemon Documents (topic-based)

The title is its routing description; the body contains: `conclusions` / `evidence` / `rejected alternatives and why` / `open items`.

### 6.3 runtime memory

Only the few facts needed across sessions; each self-contained and not duplicating Documents.

## 7. Instrument discipline (where this skill most easily goes wrong)

- mnemon Documents are **managed storage**: write only through the managed tools, **never** through file-editing tools.
- Do not delete existing Documents; if something must be retired, use mnemon's own archive flow — the
  study's `archive/` is a different place, and moving a document there is the owner's act, not a round's.
- Runtime memory is hard-capped; check current usage before writing.
- If the workspace already has a document hierarchy, **follow it** (location, naming, authority order).

## 8. Acceptance checklist

- [ ] `search` was run first; no duplicate entry
- [ ] Every record carries type / source / time
- [ ] Rejected directions and reasons are recorded (or "no rejections this round" is stated)
- [ ] Unevidenced content went only to the log, not to the Documents conclusions section
- [ ] Conflicts with existing content are recorded as "revision + reason"
- [ ] Runtime memory is within its caps
- [ ] Every "done" in the log carries an artifact path
- [ ] A contract, invariant or ruling revised this round is recorded now, not only at close-out
- [ ] Change **reasons** are recorded; pre-change state descriptions are marked superseded

## 9. Don't

- Do not issue the study's final rulings
- Do not process raw data or clean datasets
- Do not modify normative documents
- Do not use the log as if it were a conclusion
