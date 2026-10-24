---
name: adoption-ruling
description: Use after reading a paper the study will build on, before writing code from its equations, or to audit code that cites it. Turns it into a ruled ledger — one verdict per borrowable item, with the paper's locator, our form beside the paper's, and a number a test can assert; no verdict is the agent's.
---

# adoption-ruling — what may be borrowed, under what condition, and what would prove it

This skill does one thing: turn "we have read this paper" into a **ledger whose reader is a future
implementer who never read the paper**. It does not search, explain a section, choose a direction, or
write the implementation.

It exists for the hole between *explained* and *implemented*. A section note explains the paper in its
own terms and without evaluation, on purpose. Nothing then says which equations are ours, under what
conditions they survive contact with our data, into which module they go, or how anyone would notice
that the code implements a different formula.

## 1. When to use

- A paper was **read to the end of the sections the borrowings come from** — `depth: §N` at least, and
  grade `A` — and the study will build on its method, assumptions, data, or evaluation protocol.
- Code is about to be written from a paper's equations and no ruled item covers it.
- Code already cites a paper's formula, and the question is whether the paper supports it and what it
  assumed (the reverse audit — the same artifact answers both directions).
- The next round must know **what not to take** as well as what to take.

**Not applicable**: deciding how far a paper is worth reading (`reading-triage`), explaining a section
(`section-notes`), choosing between directions (`synthesis-plan`), or a background-only paper that a
`literature-recon` note already covers.

**On demand, never a step in reading.** A study that never implements from papers never loads this, and
not having run it says nothing about a paper.

A ledger row is **not** a verdict about a paper's worth: `verdict: enough` says the reading satisfied
*that question*, and `verdict: stop` says nothing about quality. Only `grade: A` read at `depth: §N` or
`full` can carry an adoption — an item built on an abstract is a guess in a table.

## 2. First step: read the ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

Read-only, before writing anything. Paths are relative to the **layer root** — `research/` where that
directory exists, the study root otherwise (protocol §7):

1. **The ledger row** — `<layer root>/references/<topic>.md` holds `grade`, `depth` and `verdict`. The
   grade vocabulary is `literature-recon` §3.1's and is not restated here.
2. **The record's section notes, the primary input.** `{{presetTools}}/zotero-section-note.mjs --item
   <recordKey>` reports the readable attachment, every note's **tags** and **first paragraph**, then
   `covered`, `retired`, `legacy`, `unknown` and `ambiguous`. Read the `unknown` notes yourself: a tag is
   a claim about a note, not a guarantee that it explains that section. **`unknown` is a to-read list,
   not an absence** — a section is not "carrying no note" until every unclaimed note has been read, and
   the report says how many were.
3. **Provenance of every note the ruling leans on.** An `/agent-note` without `/reviewed` is a **draft**:
   it may support a `candidate`, never an `adopt`, `adopt-modified` or `verified`. A note with neither
   tag is the owner's record; an `/imported` note is text the owner pasted.
4. **The study's own constraints** — the scoping document, and `AGENTS.md` for domain invariants,
   notation and units. **An adoption that violates a domain invariant is inadmissible**, however good the
   paper is; without that file there is no invariant to check, and the round says so.
5. **An existing adoption doc** (`<layer root>/adoption/<recordKey>.md`) and the module index
   (`<layer root>/adoption/INDEX.md`). One record has one doc; a second round appends.
6. **Any ruling that already covers an item** — a re-rule without a reason is a regression.

**If a needed equation appears in no section note, there are exactly two moves:** report that the section
carries no note and ask the owner (name that section for `section-notes`, or open a reading round), or
record the item under `## Gaps` and leave it a candidate. **Never re-derive it here, and never read the
paper here** — two authors of one transcription produce two versions, and nothing later can say which one
the code came from.

## 3. Criteria

### 3.1 The unit is the borrowable item, never the paper

| Item kind | Example |
|---|---|
| A formula or a derivation step | the update rule, the closed form, the normalization constant |
| An assumption | linearity, steady state, fixed topology, independence, a unit convention |
| A data set, benchmark instance, or test system | the standard case the field measures on |
| A hyperparameter **with its provenance** | the value and the data set it was tuned on |
| An evaluation protocol or a metric definition | what "error" means in this paper |
| A complexity or scaling statement | holds for n ≪ N, and what N was |
| A stated limitation | the constraint that bounds any use of the method |

Non-formula borrowings are legitimate and must not be starved: a study often takes a test system and
rejects a formula. **Formula-only ledgers are the usual shape of this skill failing quietly.**

### 3.2 One closed vocabulary, and who may move an item

Per item: the pre-ruling state `candidate`, and the verdicts `adopt` · `adopt-modified` ·
`reference-only` · `reject`. Lifecycle: `candidate → ruled → implemented → verified`, or `retired` with
its reason.

| Verdict | Means | What it must have |
|---|---|---|
| `adopt` | usable as the paper writes it | a locator, a precondition, a target, an anchor |
| `adopt-modified` | we use a changed form — units, symbols, discretization | **both** forms, the map between them, and why it changed |
| `reference-only` | orientation, comparison, no code | a locator; no target owed, never a source of code |
| `reject` | refused | the ground, in its own section |

- **The agent proposes; the owner rules.** Confirm item by item with `ask_user_question`, three to five
  per question, each option naming the verdict. A ledger the agent ruled by itself is not a ruling.
- `implemented` requires a **target that exists** (module and symbol, or a commit), not a plan. `verified`
  requires the **anchor to pass as a test**. `implemented` without `verified` is a real, reportable state
  and is never reported as verified.

### 3.3 The six fields every item carries

| Field | Why it is load-bearing |
|---|---|
| **Paper locator**: section ordinal · the paper's own equation number · the slice offset actually read (or "no equation number in the copy") · **the section note it was transcribed from, with that note's provenance** (`owner` / `import` / `agent` / `agent+reviewed`) | A formula with no locator is a memory, not a transcription; a note with no provenance cannot tell the owner's transcription from an agent's draft |
| **The paper's own form, verbatim** (LaTeX) | The only form that can be checked against the source |
| **Our normalized form** + symbol map + units, **in its own field** | What code is written from — never merged into the line above |
| **Holds when**, plus **how we check it here** (`checked: how` / `not checked`) | The standard reason a correct formula is wrong for us |
| **Intended target**: module/function, or `unspecified` | This is the reason the document exists; an unclaimed item stays a candidate |
| **Numeric anchor**: inputs → output, and its provenance | The only check that separates "copied correctly" from "implemented correctly" |

Every item also states **what would refute it** and **the fallback** if a precondition fails. If the
fallback is "nothing", write that.

### 3.4 The numeric anchor is mandatory for `adopt` and `adopt-modified`

- It is either **a number the paper reports** (with its table, figure or equation locator) or **a number
  the reader computed**, marked `reader-computed` — the same rule `section-notes` §5 applies to a
  constant. The two are not the same evidence and are not written the same way.
- It becomes a test, and the item **names that test**. A formula with no computable instance is not yet
  adoptable: it stays `candidate`.
- **A constructed number is not an anchor.** A value that follows from the units, an identity that holds
  by definition, a bound that cannot be otherwise — those are properties of the definition, and a test
  asserting one proves nothing about the implementation.
- **The anchor's source note has to be a record, not a draft.** An anchor or verbatim form resting only
  on an unreviewed `/agent-note` keeps the item `candidate`, and the doc names the note and says so. The
  owner reviews it (`--review --note <key>`) or the item waits. `verified` needs both a reviewed note and
  a test that ran.

### 3.5 Two columns, and stop on ambiguity

- The paper's form is transcribed **verbatim**; our form lives in its own field. Normalizing a formula in
  place is how it drifts while looking transcribed.
- The copy's equation is **ambiguous** — a scanned symbol, a lost delimiter, a missing number the
  surrounding text does not pin — → the item is `ambiguous`, blocked and reported. **Do not reconstruct
  it.** A formula nobody can read is a gap; a formula someone guessed is a defect that reaches the code.
- A symbol the source never defines is recorded as **undefined**, and the item blocks. Do not fill it in.

### 3.6 What is not borrowable is a section, not an omission

Refused items get their own section with grounds, because the reason is what saves the next round:

```text
the paper's notation              never imported; our symbols are the study's
a hyperparameter tuned elsewhere   a value fitted on another data set is not a default
a metric that differs from ours   a protocol answers its own question, not necessarily ours
a heuristic constant              no stated derivation, so nothing to re-derive or check
a scaling claim outside our size  true for the N it was measured at
a result that depends on data      we do not have that data
```

### 3.7 Lifecycle, staleness, re-opening

- **One doc per record**, keyed by the library item key. A second reading **appends** items. A ruled
  item's **verdict** is never reworded: a changed ruling is a new dated line beside the old one. Its
  **transcription** may be corrected in place — a wrong locator, a mis-copied symbol, a dead anchor —
  recorded as a dated correction line; a correction that changes no verdict is not a ruling
  (`INV-ADOPT-3`).
- **Item IDs are stable**: `A-<itemKey>-NN`. Never renumber; a deleted candidate leaves its number unused
  and the doc says so.
- **A re-run that changes nothing reports `already recorded` and writes nothing.**
- **Staleness is counted, not hidden**: items marked `implemented` whose test no longer exists, and
  candidates with no target, are reported as counts. A ledger that claims more than the code does is the
  failure this document exists to prevent.
- **Re-opening is named in the doc**: the paper is retracted or corrected, a precondition is shown false
  on our data, or the code is found to diverge. An item whose re-opening condition is nothing is a
  commitment, not a judgement.

### 3.8 Shape

The language is the study's, not this file's. The fields, not the prose, are the contract:

```text
# 借鉴裁定 — <recordKey> <short title>
读于 <date> · 证据等级 A · 附件 <file> · 读了 <n> 字符 · 节笔记 <noteKey>, <noteKey> · <未覆盖节>
## 这份文献对我们是什么      一段话：方法来源 / 基线 / 对照 / 仅背景
## 索引表                     ID · 一句话 · verdict · 目标 · 锚点
## <A-KEY-01> 一句话标题      六字段 + 反驳条件 + 退路
## 裁定                      逐行：日期 · 项 · verdict · 谁裁 · 依据
## 拒用及理由
## 未决 / Gaps               含"该式子没有被任何节笔记覆盖"
## 重开条件
```

The **index table** is what a human scans; it must agree with the items below it. A mismatch is a defect,
not a formatting detail.

### 3.9 Length and shape signal

A doc for one paper usually lands between one and three items adopted and a longer refused list. **A doc
where everything is adopted has not ruled**; one where nothing is adopted and nothing is refused has not
been read. Say which it is rather than adjusting the numbers.

## 4. Do vs don't

### 4.1 Do

- Report the **candidate table before any ruling**: ID · what it is · recommended verdict · target ·
  whether an anchor exists.
- Name the reader — a future implementer who never opens the paper — and check the draft against that
  reader: every symbol defined, every unit stated, no derivation step assumed.
- Prefer a cheap anchor to a long derivation: one instance a test can run is worth a page of explanation.
- Say which section notes were read and which sections were **not** covered.
- Keep the module index thin: one line per module, pointing at items.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The ledger row says `depth: abstract`, or its grade is below `A` | **Stop.** Report which sections the item would rest on and which of them carry no note, then hand it back — `section-notes`, or `reading-triage` for a depth. Rule only from what the ledger says was read. |
| The needed equation is in no section note | Record it under Gaps and leave it a candidate. **Never re-derive it here.** |
| The only note the item rests on is an unreviewed `/agent-note` | The item stays `candidate`; name the note and say it is a draft. Ask the owner to review it; never add `/reviewed` here. |
| The copy's formula is ambiguous or a symbol is undefined | `ambiguous`, blocked, reported. Never reconstruct, never fill in. |
| A precondition cannot be checked here | Mark `not checked`; the item stays a candidate. Never adopt with an uncheckable condition stated as if checked. |
| No numeric anchor and none computable from the source | The item stays a candidate. It is not "adoptable in principle". |
| The item would violate a domain invariant in `AGENTS.md` | Report the conflict and ask. Never adopt around a domain constraint. |
| No target module exists and the study has no code yet | Keep it a candidate and say the study has no target yet. Do not invent a module path. |
| An existing ruling covers this item | Follow it, or request a new one explicitly. Never re-rule silently. |
| The item duplicates one in another record's doc | Link the two; do not copy it. Two copies of one formula diverge. |
| The paper's code is under a licence that forbids reuse | Re-implementing the formula is the study's business; copying the code is not. Record the line and the choice. |
| `implemented` is claimed and the target code does not exist | Report `implemented` as false and keep the item `ruled`. The ledger never runs ahead of the code. |
| The section note an item rests on was repaired substantively | Its `/reviewed` is cleared, so the item is a `candidate` again until the owner reviews it. Name both. |
| The round is about to rule on the owner's behalf, or adopt "in principle" pending their answer | Do not. No verdict is the agent's. |
| An item is about to be built on an abstract | Do not; that is the first row of this table. |
| The paper's form and ours are about to be merged, or notation "improved" | Do not. Two columns, verbatim left. |
| The round is about to re-read the paper to recover what a note says | Do not (`INV-EVID-4`); the notes are the transcription. |
| A child is about to rule, or to write into `<layer root>/adoption/` | Do not. A child reads and drafts candidates only. |
| A section is about to be called uncovered while an `unknown` note is unread | Do not. Say how many were read, and never read `covered: none` as "no note exists". |

## 5. Wording discipline

- **"The paper states X" and "we will use X" are different sentences.** The first is a transcription, the
  second a decision, and only the second needs a ruling.
- Never write "the formula is standard", "well known", or "textbook". That is not a locator, and it is
  the phrasing that hides a retyped formula.
- A number with no unit and no provenance is not an anchor; it is a number in a document.
- `verified` is a claim about a test that ran. Name the test.
- Keep the paper's symbols in the original column; do not translate a symbol into ours in both columns.
- An item's verdict is the owner's; the document says who ruled and on what grounds, in a dated line.

## 6. Report shape

**Artifact** — `<layer root>/adoption/<recordKey>.md`, plus one line in `<layer root>/adoption/INDEX.md`.
It states where the record stands now:

1. `## Record` — key, title, the ledger's `grade` and `depth`, the section notes the items rest on
   (**each with its provenance**), and one `Basis:` line naming what grounds the ruling — a pointer, not
   an account of what the round did.
2. `## Candidates` — the table: ID · one line · recommended verdict · target · anchor present?
3. `## Rulings` — the owner's rulings, dated, one row each. A correction row states the old value beside
   the new one; a changed verdict is a new dated row, never a rewrite.
4. `## Refusals and gaps` — only what still blocks a decision, and every section no note covers with how
   many `unknown` notes were read before saying so.

**Answered to the owner, not written** — the INDEX lines this round added or changed.

**Budget** — ≤80 lines of prose (the candidate and ruling tables aside). Past it, cut in this order:
evidence restated from its carrier → a second reason for the same claim → per-object detail a ledger
holds → how the statement changed. Never cut the load-bearing limit or the falsification condition. What
remains is each item's current state, not the history of how it got there.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **No new helper exists for this, and none is needed.** The document is a workspace file; the reading it
  depends on is already instrumented: `{{presetTools}}/zotero-section-note.mjs --item <recordKey>` lists a
  record's notes and writes nothing without `--write`; `{{presetTools}}/zotero-read.mjs --item <noteKey>`
  reads one note's body. Everything else is `read` / `write` on the workspace.
- **Reading is a budget.** A tool result that will be needed twice is re-fetched by offset, never recalled
  from a pruned result; read in slices with `--limit 12000` and the printed offset, and use `--grep`
  rather than pulling a full text to find one equation.
- **Never re-read the paper to recover what a section note already says** (`INV-EVID-4`). The notes are
  the transcription; this discipline's job is the ruling.
- **This discipline writes no library note.** A ledger is a workspace document and needs no
  authorization. A section note the round also produces follows its own `--write` + read-back +
  authorization rules (`INV-EVID-3`).
- **The parent rules and writes; a child may only read.** When the reading budget would be crossed, hand
  one record's notes to one child per record under `subagent-contract`: the child writes **candidate
  items** to `<workspace>/.adoption/<recordKey>/` and returns a manifest. **The parent rules, writes the
  doc, and asks the owner.**
- **Workspace drafts are working files**: no authority, no permission needed to delete.
