---
name: collection-sweep
description: Use when the owner points at a reference-library collection and asks which of its references can serve one named question, or when a question's anchor set has never been swept. Enumerates every record, rules out at the abstract what cannot serve it, and queues the survivors for reading-triage.
---

# collection-sweep — which references of this collection can serve *this* question

This skill does exactly one thing: it turns **a whole collection** into **a queue for one named research
question**, and it records the queue where the next round can find it. It is an entrance, not a reading:
it decides which papers are worth reading and in what order, never how far one is read.

It exists because the three steps around it already had disciplines and the first step had none. Reading a
paper section by section is `reading-triage`; writing a note on a method section the owner names is
`section-notes`; deciding what may be borrowed is `adoption-ruling`. Nothing turned "this collection" into
"these candidates, in this order, with the ones that cannot serve us already ruled out" — so a collection
was either read in whatever order the library listed it, or screened by hand with nothing recorded.

**This skill does not judge how far a paper is read.** That is `reading-triage`'s decision, made at each
section boundary. This skill stops before the first section is opened.

## 1. When to use

- The owner names a collection and asks what of it can serve this study
- A question's anchor set has collections that have never been enumerated
- A `park` row left by an earlier sweep now satisfies its `re-open if`

**Not applicable**: no named question (that is a browse, and a browse records nothing); reading one known
paper (`reading-triage`); searching for what might exist outside the library (`literature-recon`); deciding
what to borrow from a paper already read (`adoption-ruling`); writing a note about a section
(`section-notes`).

**A collection is not a corpus.** A collection is a filing decision someone made once. It can hold papers
for three unrelated questions, and it can miss the one paper that answers yours. A sweep says what is in
the collection and what it can serve; it never says the field contains nothing else.

## 2. First step: read the ruler

Read-only, before enumerating anything. Paths below are relative to the study's **layer root** —
`research/` where that directory exists, the study root otherwise (protocol §7):

1. **The question.** `<layer root>/00_scoping.md` carries the candidate questions and their ids. The unit
   of every judgement here is **(collection × question)**: the same collection swept for a second question
   is a new round, and its rows are new rows.
2. **The anchor set** — the entrance file in `<layer root>/references/` (`zotero_anchor_map.md`,
   `zotero_anchor_set.md`, or whatever that study calls it). It says which collection is an entrance, how
   many items it held when it was written, and the line it came from. **No anchor set and no collection
   named by the owner ⇒ stop and ask which collection.** Do not sweep the whole library looking for one.
3. **This question's ledger** — `<layer root>/references/<topic>.md`, its `## Reference ledger`. What rows
   already exist for these `itemKey`s, and is their `verdict` and `re-open if` still current?
4. **This round's budget**, stated before the first slice is read (§3.4).

If the anchor set and the ledger disagree about a collection's size, report both numbers and the dates:
the collection grew or the anchor line was written from a different view, and neither is the other's typo.

## 3. Criteria

### 3.1 The unit is (collection × question); a row is still (question × paper)

One sweep produces **one queue**: the papers of this collection that this question still wants. A paper in
two collections appears once, under the collection that was swept first, and the report says so. A paper
already carrying a current verdict for this question is **not** re-judged — the sweep reports it as
already judged and moves on.

### 3.2 The vocabulary is `reading-triage`'s, and this skill adds none

| What the sweep found | The row it writes |
|---|---|
| the abstract already settles that the paper cannot serve this question | `depth: abstract` · `verdict: stop` · `basis`: the abstract's own sentence · `re-open if` |
| in scope, and this round will read it | `depth: —` · `verdict` empty · no `basis` |
| in scope, and this round cannot read it (no full text in hand, no time) | `depth: abstract` · `verdict: park` · `re-open if` |
| in scope, and the record turns out to have nothing readable | `depth: —` · `verdict: stop` · `basis`: the bibliographic record is all the evidence there is — **but this is `reading-triage` §4.2's probe**, which reads the record's children; inferring it from a missing abstract is a false absence |
| already carrying a current verdict | nothing. The row is left exactly as it is |

`depth` and `verdict` are defined once, by `reading-triage` §3.2. **A sweep writes no new word**, and
above all never writes `enough`: an abstract can rule a paper out for a question, never in.

### 3.3 Each excluded paper keeps a row

A paper the abstract ruled out **keeps its row**. The judgement is the record: without it, the next round
finds the paper in the collection again and judges it again. `basis` names the sentence in the abstract that
decided it, quoted or closely paraphrased, and `re-open if` says what would make it be judged again.

### 3.4 Batch, and the budget is the round's, not the paper's

Screen **five records at a time** (`reading-triage` §3.8's batch size), which is one look at five abstracts
rather than five reads. A round is **8 slices ≈ 96,000 characters of source text**, and screening counts
against it: 34 records at 300 characters of abstract is ~10,000, so screening a whole collection is one
small part of the round — the reading it hands over is the part that spends it.

Say before starting how much of the queue this round can actually read: a 34-record collection is always
several reading rounds, and a sweep that does not say so has promised a queue it cannot deliver.

### 3.5 The section-note seam

A note body exists only where the owner has named that section and `section-notes` wrote one, one note
per top-level section; reading to a method section's end does not produce one. A sweep never writes
one, never claims one, and never predicts one as done — it reports which papers it is handing over,
and which sections those papers have (from their own outlines), as an expectation only.

## 4. Do vs don't

### 4.1 Do

- State the question id, the collection key, its total, and the budget **before** the first abstract
- Judge five at a time, and write the rows as the batches finish, not at the end of the round
- Quote the deciding sentence in `basis`; a row that says "not relevant" and nothing else cannot be checked
- Re-read the ledger before writing a row: a duplicate row per paper is how a ledger stops being readable
- Report what was not swept: truncated enumeration, duplicate keys, already-judged rows, missing collection

### 4.2 Stop conditions — hit one, stop and ask, do not work around it

| Hit | What to do |
|---|---|
| No named question | Stop. Ask which question this sweep is for. |
| The collection key does not exist, or the collection is empty | Report it and stop. Do not guess a similar collection. |
| No anchor set, and the owner named no collection | Stop. Ask for the entrance. Do not sweep the whole library. |
| The enumeration could not read every row | Report "read N of M" and stop calling it swept. |
| The same `itemKey` appears twice | One row. Report the duplicate. |
| A row already carries a current verdict and its `re-open if` does not hold | Skip it. Report it as already judged. |
| The ledger's location is unknown, or both layer roots exist | Stop. Ask where the ledger is. |
| The collection is a reading pile spanning unrelated questions | Stop. Ask whether this is this question's literature. |
| The owner's next request is to write a note now | Not this round: a sweep reads no paper and writes no note. Point at `section-notes`, which writes a body only for the section the owner names. |

## 5. Wording discipline

- Say **"screened"** or **"ruled out at the abstract"**, never "discarded", "irrelevant", or "not useful".
  The record of a judgement is a judgement about a question, not a verdict about a paper.
- Say **"in the queue"** for a paper with no verdict. A paper nobody has judged is not a paper that
  passed: an empty `verdict` is the absence of a judgement, and it must not read as one.
- Say **"read N of M rows"** whenever the enumeration was partial, and never let a partial pass be
  described as a sweep of the collection.
- Never say a paper "was not found" of a collection that was not enumerated, and never say a collection
  "is complete" of one whose size you took from a tree.
- Report a count with what produced it: the tree's item count and the items endpoint's total are different
  numbers (§7.3), and quoting one as the other is a false statement about the library.

## 6. Report shape

The artifact is the ledger rows this round wrote; the report is answered to the owner and is not saved
as a second document.

1. `## This round` — question id, collection key and name, date, the anchor-set line it came from
2. `## Enumeration` — total rows · rows read · records vs notes/attachments · whether it was complete
3. `## Screening` — ruled out N, in scope M, unreadable K. Each ruled-out item's ground is its ledger
   row's `basis`; the report gives the count, not the list.
4. `## Budget` — the estimate, the eight-slice budget, slices actually spent, papers still queued
5. `## Handover` — the `itemKey`s going to `reading-triage` and their order; each paper's top-level
   sections only where they differ from its own outline

**One line each, only when non-empty** — `Not swept` (truncation, duplicate keys, already-judged rows,
records with no abstract) and `Not judged` (no adoption, no borrowing, no note written, and why).

**Budget** — ≤40 lines; the per-item grounds live in the ledger, not here. Past it, cut in this order:
evidence restated from its carrier → a second reason for the same claim → per-object detail a ledger
holds → how the statement changed. Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

### 7.1 The screening pass, not one `--item` per paper

```powershell
node "{{presetTools}}/zotero-read.mjs" --collection <collectionKey> --screen [--screen-limit 300]
```

It enumerates the collection itself and prints one abstract per record. Screening 34 papers one `--item`
call at a time costs 34 round trips and pulls metadata the sweep does not need; the pass costs one call
and states what it read.

### 7.2 Truncation is loud, and it is the honest failure

`--screen` pages the collection (`start` is honoured — measured 2026-10-19) and prints
`total · showing 1-N`, plus `INCOMPLETE` if it stopped short. A plain `--collection` listing reports
`truncated : showing N of M` when the page is full. **Read that line before writing any row**: a pass that
read 10 of 34 and reports "screened the collection" is the one failure this whole skill exists to prevent.

### 7.3 A parent collection does not contain its children's items — measured

Asked for a collection whose subcollections held items, the items endpoint answered **total 0** (measured
2026-10-19). A sweep of a parent therefore sweeps nothing. Sweep the leaves, one key each, and say in the
report which level was swept. (The tree's item count and the items endpoint's total also differ — 13
against 33 on one measured collection, because the endpoint counts notes and attachments too. Report the
number you actually enumerated.)

### 7.4 The pass claims nothing about attachments

Whether a record has readable text needs its children, which a screening pass does not read. Do not write
"no full text" from an absent abstract: an absent abstract is a metadata fact, and the two are different
findings with different rows (§3.2).

## 8. Acceptance checklist

- [ ] The question id, collection key, total and budget were stated before the first abstract
- [ ] Every ruled-out paper has `depth: abstract`, `verdict: stop`, and a `basis` pointing at the abstract
- [ ] No `enough` was written from an abstract
- [ ] One row per `itemKey`, and cross-collection duplicates are reported
- [ ] Rows that already carried a current verdict were left alone
- [ ] Truncation, if any, is reported and the collection is not described as fully swept
- [ ] `found via` in every new row names the collection key and its name
- [ ] The word adoption, borrow, or "we can use this" appears nowhere in the report
- [ ] No library note was written, and no section note was claimed
- [ ] Every "in scope" row states why this round can or cannot read it

## 9. Don't

- Do not sweep without a named question and a named collection
- Do not write `enough`, and do not write a verdict from a title, a venue, or a citation count
- Do not delete a row, rewrite an earlier judgement in place, or "clean up" a `stop` you disagree with
- Do not read a paper here: the first section boundary belongs to `reading-triage`
- Do not write, claim, retire, or plan a library note from here
- Do not copy the collection into a workspace file: the rows and the anchor set are the record, and a
  third copy is a third thing to keep true
- Do not treat the collection's size as the field's size, and do not report a field-level absence from a
  collection-level sweep
- Do not decide what may be borrowed; that is a chain of its own, and entering the queue is not entering it
