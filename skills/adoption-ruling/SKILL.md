---
name: adoption-ruling
description: Turn a paper already read into a ruled ledger of what this study may borrow — one verdict per borrowable item, each carrying the paper's own locator, the condition under which it holds, our normalized form beside the paper's verbatim one, the module it will become, and a numeric anchor a test can check; an item without an anchor stays a candidate, no item is adopted or rejected by the agent alone, and the document never grounds a research conclusion. Use after reading a paper the study will build on, before writing code from a paper's equations, or to audit whether code already written is actually supported by the paper it cites.
---

# adoption-ruling — what may be borrowed, under what condition, and what would prove it

This skill does exactly one thing: turn "we have read this paper" into a **ledger whose reader is a
future implementer who never read the paper**. It does not search for literature, does not explain a
section, does not choose a direction, and does not write the implementation.

It exists because the chain has a hole between *explained* and *implemented*. A section note explains
the paper **in the paper's own terms and without evaluation**, on purpose. Nothing then says which of
those equations are ours, under what conditions they survive contact with our data, into which module
they go, or how anyone would notice that the code implements a different formula. A paper's equations
are the most hallucination-prone object in a research record: a formula retyped from memory, a symbol
silently renamed, a copy that lost a delimiter — all read the same as a correct transcription, and all
of them become code.

## 1. When to use

- A paper was **read to the end of the sections the borrowings come from** — `depth: §N` at least, and
  grade `A` — and the study will build on its method, assumptions, data, or
  evaluation protocol
- Code is about to be written from a paper's equations and no ruled item covers it
- Code already cites a paper's formula, and the question is whether the paper actually supports it and
  what it assumed (the reverse audit — the same artifact answers both directions)
- A paper's method was understood and the next round must know **what not to take** as well as what to take

**Not applicable**: deciding how far a paper is worth reading (`literature-recon` appends and screens the
candidate; the reading round records how far it read in the topic's ledger), explaining a section
(`section-notes` — the paper's terms, no evaluation); choosing between directions (`synthesis-plan` —
direction-level, not equation-level); a paper that contributes only background, which a
`literature-recon` note already covers.

A ledger row is **not** a readable verdict about a paper's worth. `verdict: enough` says the reading
satisfied *that question*; it says nothing about whether the sections carry anything borrowable, and
`verdict: stop` says nothing about the paper's quality. The evidence grade is a separate cell, and only
`grade: A` read at `depth: §N` or `full` can carry an adoption.

**On demand, never a step in reading.** This discipline is loaded when code is about to be built from a
paper, or when code already cites one. Reading a paper does not trigger it, and a study that never
implements from papers never loads it — which is why it is absent from the reading flow, and why not
having run it says nothing about a paper. When it does not trigger it costs nothing.

## 2. First step: read the ruler

Read-only, before writing anything. Paths below are relative to the study's **layer root** — `research/`
where that directory exists, the study root otherwise (protocol §7):

1. **The ledger row** — the topic's reference ledger (`<layer root>/references/<topic>.md`)
   holds one row per paper: `grade` is the evidence grade, `depth` how far it was read, `verdict` why
   the reading stopped. The grade vocabulary is defined by `literature-recon` §3.1 and is not restated
   here. Only grade `A` read at `depth: §N` or `full` can carry an adoption: an item built on an
   abstract is a guess in a table.
2. **The record's section notes, which are the primary input.**
   `{{presetTools}}/zotero-section-note.mjs --item <recordKey>` reports the readable attachment, and for
   every note its **tags** and **first paragraph**, then `covered`, `retired`, `legacy`, `unknown` and
   `ambiguous`. Read the `unknown` notes yourself: the tool does not parse prose, and a note with no
   `/section-` tag is not coverage until it is read and claimed. A tag is a claim about a note, not a
   guarantee that the note explains that section.
3. **The study's own constraints** — the scoping document (what the study is for), and the study's
   `AGENTS.md` for domain invariants, notation and units, read when the study has one. **An adoption that
   violates a domain invariant is not admissible**, however good the paper is; without that file there is
   no invariant to check, and the round reports that instead of assuming one.
4. **An existing adoption doc for this record** (`<layer root>/adoption/<recordKey>.md`) and the module index
   (`<layer root>/adoption/INDEX.md`). One record has one doc; a second round appends.
5. **Any ruling that already covers one of these items** — a re-rule without a reason is a regression.

Write the result up as a **ruler list**; it is what the round is judged on.

**If a needed equation appears in no section note, there are exactly two moves:** report that the section
carries no note and ask the owner — to name that section for `section-notes`, or to open a reading round —
or record the item under `## Gaps` and leave it a candidate. **Never re-derive it here, and never read the
paper here.** Two authors of one transcription produce two versions of one formula, and nothing later can
say which one the code was written from.

## 3. Criteria

### 3.1 The unit is the borrowable item, never the paper

A verdict on the paper ("useful", "closely related") is not a ruling. The items are:

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
`reference-only` · `reject`. Lifecycle states: `candidate → ruled → implemented → verified`, or
`retired` with its reason.

| Verdict | Means | What it must have |
|---|---|---|
| `adopt` | usable as the paper writes it | a locator, a precondition, a target, an anchor |
| `adopt-modified` | we use a changed form — units, symbols, discretization | **both** forms, the map between them, and why it changed |
| `reference-only` | orientation, comparison, no code | a locator; no target owed, never a source of code |
| `reject` | refused | the ground, in its own section |

- **The agent proposes; the owner rules.** Resident rule 6 applies: confirm item by item with
  `ask_user_question`, three to five items per question, each option naming the verdict. A ledger the
  agent ruled by itself is not a ruling.
- `implemented` requires a **target that exists** (module and symbol, or a commit) — not a plan.
  `verified` requires the **anchor to pass as a test**. `implemented` without `verified` is a real and
  reportable state, and it is never reported as verified.

### 3.3 The six fields every item carries

| Field | Why it is load-bearing |
|---|---|
| **Paper locator**: section ordinal · the paper's own equation number · the slice offset actually read (or "no equation number in the copy") | A formula with no locator is a memory, not a transcription, and a later challenge cannot reach it |
| **The paper's own form, verbatim** (LaTeX) | The only form that can be checked against the source |
| **Our normalized form** + symbol map + units, **in its own field** | What code is written from — but never merged into the line above |
| **Holds when**, plus **how we check it here** (`checked: how` / `not checked`) | The standard reason a correct formula is wrong for us |
| **Intended target**: module/function, or `unspecified` | This is the reason the document exists; an unclaimed item stays a candidate |
| **Numeric anchor**: inputs → output, and its provenance | The only check that separates "copied correctly" from "implemented correctly" |

Every item also states **what would refute it** (the observation after which we must stop using it) and
**the fallback** if a precondition fails. If the fallback is "nothing", write that.

### 3.4 The numeric anchor is mandatory for `adopt` and `adopt-modified`

- It is either **a number the paper reports** (with its table, figure or equation locator) or **a number
  the reader computed** — and the second is marked `reader-computed`, the same rule `section-notes` §5
  applies to a constant. The two are not the same evidence and are not written the same way.
- It becomes a test, and the item **names that test**. A formula with no computable instance is not yet
  adoptable: it stays `candidate`, and the round says so rather than adopting it on confidence.
- **A constructed number is not an anchor.** A value that follows from the units, an identity that holds
  by definition, a bound that cannot be otherwise — resident rule 10: those are properties of the
  definition, and a test asserting one proves nothing about the implementation.

### 3.5 Two columns, and stop on ambiguity

- The paper's form is transcribed **verbatim**; our form lives in its own field. Normalizing a formula
  in place is how a formula drifts while looking transcribed — the same reasoning that makes a
  section-note repair mechanical or nothing.
- The copy's equation is **ambiguous** — a scanned symbol, a lost delimiter, a missing equation number
  the surrounding text does not pin — → the item is `ambiguous`, blocked, and reported. **Do not
  reconstruct it.** A formula nobody can read is a gap; a formula someone guessed is a defect that
  reaches the code.
- A symbol the source never defines is recorded as **undefined**, and the item blocks. Do not fill it in
  from what it probably means.

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

- **One doc per record**, keyed by the library item key. A second reading **appends** items. A ruled item
  is never reworded: a changed ruling is a new dated line beside the old one, so the history of the
  judgement survives.
- **Item IDs are stable**: `A-<itemKey>-NN`. Never renumber. A deleted candidate leaves its number
  unused and the doc says so.
- **A re-run that changes nothing reports `already recorded` and writes nothing** — the same rule a
  section-note write follows, so re-running a round cannot turn one judgement into two.
- **Staleness is counted, not hidden**: items marked `implemented` whose test no longer exists, and
  candidates with no target, are reported as counts. A ledger that claims more than the code does is a
  defect, and it is the failure this document exists to prevent.
- **Re-opening is named in the doc**: the paper is retracted or corrected, a precondition is shown false
  on our data, or the code is found to diverge from the item. State which of these would reopen each
  item; an item whose re-opening condition is nothing is a commitment, not a judgement.

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

The **index table** is what a human scans; it must agree with the items below it. A mismatch between the
table and the items is a defect, not a formatting detail.

### 3.9 Length and shape signal

A doc for one paper usually lands between one and three items adopted and a longer refused list. **A doc
where everything is adopted has not ruled**; a doc where nothing is adopted and nothing is refused has
not been read. Say which it is in the report rather than adjusting the numbers.

## 4. Do vs don't

### 4.1 Do

- Report the **candidate table before any ruling**, one line per item: ID · what it is · recommended
  verdict · target · whether an anchor exists.
- Name the reader of the document — a future implementer who never opens the paper — and check the draft
  against that reader: every symbol defined, every unit stated, no step of the derivation assumed.
- Prefer a cheap anchor to a long derivation: one instance a test can run is worth a page of explanation.
- Say which section notes were read and which sections were **not** covered.
- Keep the module index thin: one line per module, pointing at items — the docs stay the single source.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The ledger row says `depth: abstract`, or its grade is below `A` | **Stop.** An adoption on an abstract is a guess in a table, and getting the paper read is not this round's work: report which sections the item would rest on and which of them carry no note, then hand it back — `section-notes` for the section the owner names, `reading-triage` for a depth. Rule only from what the ledger says was read. |
| The needed equation is in no section note | Record it under Gaps and leave the item a candidate. **Never re-derive it here.** |
| The copy's formula is ambiguous or a symbol is undefined | `ambiguous`, blocked, reported. Never reconstruct, never fill in. |
| A precondition cannot be checked here | Mark `not checked`; the item stays a candidate. Never adopt with an uncheckable condition stated as if it were checked. |
| No numeric anchor and none computable from the source | The item stays a candidate. It is not "adoptable in principle". |
| The item would violate a domain invariant in the study's `AGENTS.md`, if it has one | Report the conflict and ask. Never adopt around a domain constraint. |
| No target module exists and the study has no code yet | Keep it a candidate and say the study has no target yet. Do not invent a module path. |
| An existing ruling covers this item | Follow the ruling, or request a new one explicitly. Never re-rule silently. |
| The item duplicates one in another record's doc | Link the two; do not copy the item. Two copies of one formula diverge. |
| The paper's own code is under a licence that forbids reuse | Re-implementing the formula is the study's business; copying the code is not. Record the line and the choice. |
| `implemented` is claimed and the target code does not exist | Report `implemented` as false and keep the item `ruled`. The ledger never runs ahead of the code. |

## 5. Wording discipline

- **"The paper states X" and "we will use X" are different sentences.** The first is a transcription, the
  second is a decision, and only the second needs a ruling.
- Never write "the formula is standard", "well known", or "textbook". That is not a locator, and it is
  the phrasing that hides a retyped formula.
- A number with no unit and no provenance is not an anchor; it is a number in a document.
- `verified` is a claim about a test that ran. Name the test.
- Keep the paper's symbols in the original column. Do not silently improve notation, and do not
  translate a symbol into ours in both columns.
- An item's verdict is the owner's; the document says who ruled and on what grounds, in a dated line.

## 6. Report shape

The artifact is `<layer root>/adoption/<recordKey>.md`, plus the line it contributes to
`<layer root>/adoption/INDEX.md`. The report is what a later round needs:

1. `## Record` — key, title, the ledger's `grade` and `depth`, the attachment read and how many
   characters, the section notes read and the sections not covered.
2. `## Ruler` — what was checked: the ledger row, the section notes, scoping document, domain invariants,
   existing adoption doc, existing rulings.
3. `## Candidates` — the table: ID · one line · recommended verdict · target · anchor present?
4. `## Rulings` — what the owner ruled this round, dated, item by item.
5. `## Refusals and gaps` — every ambiguous formula, undefined symbol, uncheckable precondition, missing
   note, missing target, and domain conflict.
6. `## Index` — the module-index lines added or changed, or "none".
7. `## Read-back` — the path and the item count as it reads back after the write. The read-back is the
   only evidence the write happened.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **No new helper exists for this, and none is needed.** The document is a workspace file; the reading it
  depends on is already instrumented:
  `{{presetTools}}/zotero-section-note.mjs --item <recordKey>` lists a record's notes with their first
  paragraphs and writes nothing without `--write`; `{{presetTools}}/zotero-read.mjs --item <noteKey>`
  reads one note's body. Everything else is `read` / `write` on the study workspace.
- **Reading is a budget.** A note or a full text comes back whole, and a tool result over 8,192
  characters loses its middle when the context is compacted — so what is needed twice is re-fetched by
  offset. Read in slices with `--limit 12000` and the printed offset; never pull a full text to find one
  equation — `--grep` locates the passage.
- **Never re-read the paper to recover what a section note already says** (`INV-EVID-4`). The section
  notes are the transcription; this discipline's job is the ruling, not a second reading.
- **This discipline writes no library note.** A ledger is a workspace document and needs no
  authorization. If the round also produces a section note, that write follows its own discipline and
  its own `--write` + read-back + authorization rules (`INV-EVID-3`).
- **The parent rules and writes; a child may only read.** The round's reading budget is
  `reading-triage` §3.8's eight slices, counted in whatever the round reads — here, the section notes.
  When it would cross, hand one record's notes to one child per record under `subagent-contract`: the
  child writes **candidate items** to files under `<workspace>/.adoption/<recordKey>/` and returns a
  manifest. **The parent rules, writes the doc, and asks the owner** — a child never issues a ruling
  and never writes into `<layer root>/adoption/`.
- **Workspace drafts are working files**: no authority, no permission needed to delete.

## 8. Acceptance checklist

- [ ] The ledger row is grade `A` at `depth: §N` or `full`; the round says which attachment and how many
  characters were read
- [ ] Every item carries a paper locator: section ordinal, equation number, slice offset
- [ ] The paper's verbatim form and our normalized form are separate, with a symbol map and units
- [ ] Every `adopt` / `adopt-modified` item has a numeric anchor and names the test that asserts it
- [ ] Every anchor states its provenance: the paper's own locator, or `reader-computed`
- [ ] Every item states "holds when" and how it is checked here (`checked` / `not checked`)
- [ ] Every `adopt` / `adopt-modified` item names a target, or is a candidate and says so
- [ ] Refused items are listed with grounds
- [ ] Rulings are dated, attributable to the owner, and item by item
- [ ] Item IDs are stable; unused numbers and retired items are explained
- [ ] A re-run that changed nothing reports `already recorded`
- [ ] Nothing in the doc is written from memory of the paper
- [ ] The document names what would reopen each item, and grounds no research conclusion
- [ ] The module index was updated, or the report says why not

## 9. Don't

- Do not rule for the owner, and do not adopt "in principle" pending their answer
- Do not build an item on an abstract
- Do not merge the paper's form with ours, and do not improve notation silently
- Do not guess an ambiguous formula or an undefined symbol
- Do not re-read the paper to recover what a section note says
- Do not write code from a candidate item
- Do not let a child rule, or write into `<layer root>/adoption/`
- Do not let the ledger claim an implementation, a test, or a verification the code does not have
- Do not turn the doc into a literature note or a review: it is a ledger of what we take, under what
  condition, into what module
