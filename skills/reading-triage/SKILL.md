---
name: reading-triage
description: Use before spending time on a paper, at a section boundary, or when a parked paper's condition has come true. Advances one reference section by section for one named question, and records in that question's ledger the depth reached, why it stopped, and what would reopen it.
---

# reading-triage — how far is this paper worth reading, for *this* question

This skill decides **where a reading of one paper stops, for one named research question**, and writes
that decision where the next round can find it. It grades the evidence behind a sentence. It does not
search, explain a section, decide what to borrow, or judge whether a paper is good.

A paper's value is not a property of the paper: one reference can be worth three sections to one question
and its abstract to another. The unit is always **(paper × question)**.

## 1. When to use

- Time is about to be spent reading one reference for one named question.
- A section has just been read and the next one costs more context: continue, or stop?
- A paper parked earlier now satisfies the condition its row said would reopen it.
- A `stop` verdict is being questioned — by the owner, or by a result that contradicts it.

**Not applicable**: a one-off "what does this section say" that nothing later depends on; a question
whose row already carries a current verdict and nothing changed; a paper declared background; deciding
what a section *means* (`section-notes`); deciding what to borrow (`adoption-ruling`).

**This skill does not evaluate quality.** "Weak paper", "not novel", "poorly written" are not verdicts
here. The only verdicts are *this question's need was met* and *this paper does not serve this question*,
each with the sentence that decided it.

## 2. First step: read the ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

Read-only, before reading the paper. Paths are relative to the **layer root** — `research/` where that
directory exists, the study root otherwise (protocol §7):

0. **The library has to answer first.** The helpers reach the reference manager through its local API, so
   run `{{presetTools}}/zotero-ensure.mjs` before them: exit 0 means it answers (the application was
   started when it was not running), exit 1 means it does not — say so, stop, and do not read the
   library's database or its stored PDFs by path instead (`INV-EVID-7`).
1. **The question.** `<layer root>/00_scoping.md` carries the candidate questions with their ids. With no
   named question there is no unit to judge, and the round stops and asks which question it is for.
2. **The question's own ledger** — `<layer root>/references/<topic>.md`, the `## Reference ledger`. Does a
   row for this `itemKey` exist? What are its `depth` and `verdict`, and does its `re-open if` hold? A
   current `enough` or `stop` with no change is closed: do not reopen it.
3. **Whether the record already carries notes** — `{{presetTools}}/zotero-section-note.mjs --item
   <recordKey>` prints every child note's tags **and its first paragraph** in one call, plus `covered`,
   `retired`, `legacy`, `unknown` and `ambiguous`. This is the reuse probe.
4. **What the question needs** — the exact claim or number this paper is supposed to supply, in one
   sentence, before the first slice is read. A reading that starts without it cannot know when to stop.

## 3. Criteria

### 3.1 The unit is (paper × question), never the paper

One paper has one row **per question that reads it**, in that question's own file. Two questions reading
the same paper to different depths is the normal case: each row records its own reading and neither can
overwrite the other. The reuse asset is the **record's section notes**, which live in the library and
belong to no question.

### 3.2 Two closed vocabularies

`depth` — how far the paper was read. `§` appears here and nowhere else.

| `depth` | Means |
|---|---|
| `—` | not started |
| `abstract` | the abstract or the introduction only |
| `§N` | read to the end of the paper's own section N (`§3`, `§4.2` for a subsection) |
| `full` | every section that matters to this question was read |

`verdict` — why the reading stopped there.

| `verdict` | Needs `depth` | Means |
|---|---|---|
| `park` | `—`, or `abstract` | not started; or screened and worth reading once `re-open if` holds |
| `enough` | `§N`, or `full` | §N answered the question — or the reading reached the end, which `full` records |
| `stop` | `abstract`, `§N`, or `—` when no readable text exists | the abstract settled it cannot serve this question; a section settled it; or nothing is readable |
| (empty) | `—`, `abstract`, or `§N` | not judged yet: queued, screened and still queued, or being read |
| (empty) | `full` | every method section read, no verdict yet |

**`enough` is never written at `abstract`.** An abstract can rule a paper out for a question; it cannot
establish that the question's need was met — that claim needs the section it rests on.

`enough` and `stop` are different answers and are never merged: one says the need was met, the other
says it was not.

`re-open if` is required for `park`, for `stop`, and for every `enough` reached **short of `full`**. For
`enough` at `depth: full` the cell may stay empty — an empty cell is honest where the reading did go all
the way.

### 3.3 The named-target rule

Before a `verdict` is written, the round must be able to state, in one sentence:

> this paper supplies **___** for **Q{t}** of this topic.

If that sentence cannot be written, the verdict is `stop`. "Unclear", "interesting but tangential" and
"I could not tell from what I read" are all `stop` — with the section that made it stop.

### 3.4 `grade` and `depth` are two axes, and both are honest

`depth` says how far the **paper** was read; `grade` says how firmly **the sentence we wrote about it**
stands (defined by `literature-recon` §3.1). A grade never claims more than the reading did. Reading §3
line by line and stopping there is `grade=A, depth=§3` — a complete and honest row.

### 3.5 Sequential reading is the default, and it is free

Read front to back, one slice at a time. `--offset` and `--limit` return a slice and the tool prints
`next: --offset N`, and every slice begins inside the section it belongs to — so **"which section am I
in" is answered by the text in front of you**.

1. **Start with the reuse probe** (§2.3). If the record already carries notes for the sections this
   question needs, read their first paragraphs from that one output.
2. **A reusable note, three rungs.** The first paragraph is often enough. If not, read the whole note:
   `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000` and follow the printed offset. If the
   note still does not answer, go to the paper for the next section. Say in `basis` which rung decided it.
3. **No reusable note**: `{{presetTools}}/zotero-read.mjs --fulltext "<recordKey>" --offset 0 --limit
   12000`, then the offset it names, and so on. When the library has not indexed the attachment, the same
   arguments work with `{{presetTools}}/zotero-pdf.mjs --extract`.
4. **A section note is not produced by this round.** Where the record already carries one for the section
   just read, it is the asset the *next* question reuses (report it as reused); where it does not, the gap
   is reported and nothing is written.
5. **At each section boundary, judge.** Met the need → `enough`. Still possible → continue. Settled that
   it cannot serve this question → `stop`.

**Why slices.** A paper's whole indexed text arrives as one result, and an oversized result loses its
**beginning** to the shell's cap and its **middle** to the result pruner once the context is compacted.
Read in slices of about 12,000 characters, which is what one call returns safely. A slice needed a second
time is **re-fetched by its offset, never recalled from a pruned result**: a heading quoted verbatim, or
the sentence that decided a verdict, comes from a live read or it does not go in the record. Name the
offsets the reading covered — "read to §3" is a claim about a range of the text.

### 3.6 Jumping is the exception, and it has three gates

Reading one section out of the middle is allowed only when **all three** hold:

1. `{{presetTools}}/zotero-pdf.mjs --item <recordKey> --outline` lists the section, and its ordinal and
   title are **the paper's own**;
2. `--grep "<that heading, verbatim>"` hits;
3. the matched heading line is **printed verbatim** before it is used, and its character `index` becomes
   the `--offset`.

Gate 3 is not ceremony: a scanned paper's heading can be recognised as `P SOLUTIOCN`, and a `--grep`
against the true title then matches nothing — a silent miss that reads exactly like "the section is not
there". **Any gate failing means sequential reading**, not a best guess.

The only legitimate reason to jump is that the content outside that section has no discriminating power
for this question, and the reason is stated in the report.

### 3.7 What reuse is actually worth

A record another question has already read carries `/section-N` notes, and one `--item` call returns
every note's tags and first paragraph; reading a fresh paper at 12,000 characters a slice costs five to
eight calls. **The reusable object is the note, not the previous question's ledger row** — the row is a
hint about where to look and was written about a different question.

Reuse only pays where a note exists, and notes exist only for top-level method sections the owner has had
written. A paper an earlier question stopped inside its introduction has no note to reuse; that question's
row says `stop`, and this one starts from the paper. Say which happened in the report.

### 3.8 One round's reading budget, and whose hands read it

1. **Screen in batches of five** — one call per record, `zotero-read.mjs --fulltext "<recordKey>" --offset
   0 --limit 3000`. Its `text:` line gives the paper's whole length, its `rung:` line says whether the
   index answers, and the slice is the paper's own abstract. **A queue of one or two is not screened**:
   they would never be handed over, so screening them buys nothing.
2. **One paper is read inline at a time**, and the round's remaining context is the budget. While another
   paper would still fit, keep reading here; when it would not, stop starting new ones.
3. **A record that already carries notes is cheaper than its length says**, so when deciding whether
   another paper fits, the notes it reuses are part of what it costs — not a separate allowance.
4. **Decide at a boundary, and only about papers not yet started.** Hand the next paper and the remaining
   ones to children, one paper per child, under `subagent-contract` — while every library write and every
   ledger row stays here. A paper already started is finished here: a half-read paper handed over is read
   twice.
5. **Say what the split rested on**, not a character count: how many were screened, how many are still
   queued, which papers were read inline, and which went to children.

A child under this rule reads and reports; it does not judge and it does not write. One paper is never
split between two children: a note defines each symbol where it first appears, and two readers of the same
paper disagree quietly about notation.

## 4. Do vs don't

### 4.1 Do

- Report the planned depth and the target sentence **before** reading the first slice.
- Read the ledger row first; a current verdict on an unchanged paper is not reopened "to be sure".
- Write the row after the reading, not before: `depth`, `verdict`, `basis`, `re-open if`, `date`.
- State which sections were read and which were not reached.
- Prefer an existing note over a fresh read of the same section, and say which rung answered.
- Append a `## Reading log` line when a verdict changes, and leave the old judgement in place.
- Correct a transcription error in `itemKey` / `year` / `found via` **in place**, with the old and new
  values on the same dated line: a wrong key makes the row unreachable by `grep`.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No named question | Ask which question this is for. A verdict without a unit is a guess in a table. |
| The record has no readable attachment | Report "no readable text"; `depth=—`, `verdict=stop`, whose `basis` says the bibliographic record is the whole evidence. Never report it as read. |
| Only the abstract is available | `depth=abstract`, `grade ≤ B`. `stop` if it settles the paper cannot serve the question; `park` if the full text would decide it. Write what the full text could change. |
| The outline is missing, or `--grep` does not hit the heading | **Do not jump.** Fall back to sequential reading. |
| `--grep` hits in several places | Take the first, print every hit's position, or fall back to sequential reading. |
| The text layer is unreadable, or a formula exists only in an image | Climb to the rendered page (`--render --pages N` + `read_image`) and say which rung answered. **A verdict built on text that was never read does not stand.** |
| Two questions give opposite verdicts on one paper | Two rows, one per question. Never merge them. |
| The verdict would change the research direction ("there is no literature on this") | Out of scope: ask the owner. A `stop` is about one paper; a claim about a field is not. |
| A `park` row's `re-open if` now holds | Re-triage now. A condition that came true and was not acted on is a stale row. |
| A reused note's first paragraph contradicts the paper's own text | The paper wins. Record the verdict from the paper and report the note as a candidate for `section-notes`' retire path — never edit the note here. |
| A quotation is about to come from a slice whose middle reads `[... tool result middle pruned ...]` | Re-fetch that offset and quote from the live text. |
| The verdict is about to become a plan to read later | Do not: `park` is waiting on a stated condition, not on time. |
| A row would be deleted, or an earlier judgement rewritten in place | Do not. A changed verdict gets a dated log line beside it. |
| A section note would be edited, retired or claimed from here | Do not; that is `section-notes`' act with its own authorization (`INV-EVID-3`). |
| The round is about to `enough` from an abstract or a note's first paragraph | Do not. `enough` needs the section it rests on; an abstract can rule a paper out, never in. |

## 5. Wording discipline

- **"This paper supplies X for Q1 at §3" is a verdict.** "Looks relevant", "seems related",
  "insufficiently innovative" are not, and none may appear in `basis`.
- **`basis` names a section and a sentence**, not an impression, with the ordinal the paper itself uses.
- **Never grade the paper.** The grades here are about our sentence's footing, not the work's quality.
- **Distinguish "read and irrelevant" from "not readable" from "not read".** They are `stop` at the depth
  that settled it, `stop` at `—`, and no verdict at all.
- **A `stop` is not a verdict on the paper.** Say what it was judged against: the question, and the
  section that settled it.

## 6. Report shape

The artifact is the row and the log line, in the question's own file. The report is answered to the owner
and is not saved as a second document:

1. `## Record` — `itemKey`, title, the attachment the reading used, and the sections read with their own
   ordinals.
2. `## Question` — the question id and, in one line, the claim or number this paper was read for.
3. `## Verdict` — `enough` · `stop` · `park` · in progress, and the named target sentence.
4. `## Basis` — the section and the sentence that decided it; the rung that answered, when a note was
   reused.
5. `## Re-open if` — one line, written into the row.

When the round spans papers, the screening result and the inline/child split are one line each. **Not
written** — what the round did not decide (sections not reached, a question not asked, a quality judgement
deliberately not made): one line to the owner.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **No new tool, and none is needed.** The reading is `{{presetTools}}/zotero-read.mjs` (`--fulltext`,
  `--offset`, `--limit`, `--grep`, `--item`) and `{{presetTools}}/zotero-pdf.mjs` (`--outline`,
  `--extract`, `--render`). The ledger is a `read`/`write` on a workspace file.
- **The offset is arithmetic the tool does for you.** Follow the `next: --offset N` line; a hand-computed
  offset walks into the middle of a heading.
- **`--item <noteKey>` reads a note; `--item <recordKey>` on `zotero-section-note.mjs` lists a record's
  notes.** Different calls, different output; confusing them wastes a slice.
- **This skill writes no library note.** The verdict is a workspace row. A section note is
  `section-notes`' work, and exists only where the owner named that section; a reading that continues past
  a method section reports the gap instead of producing one.
- **Never write the ledger before the reading.** A row written first is a plan, and a plan in the ledger's
  columns reads as a judgement.
- **A row is never deleted.** A changed judgement gets a dated `## Reading log` line beside it. A
  transcription error in the key columns is corrected in place, with the old and new value on that line.
- **A subagent may read; it may not judge.** When the budget is crossed, the child returns the sections,
  the sentences and the offsets it covered, and the parent writes the row.
- **A workspace file carries no resolved helper path.** Name the program; the path comes from this
  discipline through the token.
