---
name: reading-triage
description: Advance through one reference section by section for one named research question, stopping when it is enough or when it is irrelevant — and record in that question's own ledger how far the paper was read, why the reading stopped, the sentence that decided it, and the condition that would reopen it. Reuse the section notes another question already wrote. Use before spending time on a paper, at a section boundary when deciding whether to go on, or when a parked paper's condition has come true.
---

# reading-triage — how far is this paper worth reading, for *this* question

This skill does exactly one thing: it decides **where a reading of one paper stops, for one named
research question**, and writes that decision where the next round can find it. It grades the evidence
behind a sentence. It does not search for literature, does not explain a section, does not decide what
to borrow, and does not judge whether a paper is good.

It exists because a paper's value is not a property of the paper. The same reference can be worth three
sections to one question and its abstract to another. Without a record of *which* question stopped at
*which* section, a round either re-reads what was already read or repeats the judgement it made last
time — and "I read it and it turned out not to be relevant" is a judgement no later round can check.

## 1. When to use

- Time is about to be spent reading one reference for one named question
- A section has just been read and the next one costs more context: continue, or stop?
- A paper parked earlier now satisfies the condition its row said would reopen it
- A `stop` verdict is being questioned — by the owner, or by a result that contradicts it

**Not applicable**: a one-off "what does this section say" that nothing later depends on; a question
whose ledger row already carries a current verdict and nothing has changed; a paper declared background
that will not be read at all; deciding what a section *means* (`section-notes` — the paper's own terms,
no evaluation); deciding what to borrow (`adoption-ruling` — per borrowable item, and the owner rules).

**This skill does not evaluate quality.** "This is a weak paper", "not novel enough", "poorly written"
are not verdicts here. The only verdicts are *this question's need was met* and *this paper does not
serve this question*, each with the sentence that decided it.

## 2. First step: read the ruler

Read-only, before reading the paper. Paths below are relative to the study's **layer root** — `research/`
where that directory exists, the study root otherwise (protocol §7):

1. **The question.** `<layer root>/00_scoping.md` carries the candidate questions with their ids. A
   judgement is per **(question × paper)**; with no named question there is no unit to judge, and the
   round stops and asks which question it is for.
2. **The question's own ledger** — `<layer root>/references/<topic>.md`, the `## Reference ledger`. Does a
   row for this `itemKey` already exist? What is its `depth` and `verdict`, and does its `re-open if`
   now hold? A current `enough` or `stop` with no change is a closed question: do not open it again.
3. **Whether the record already carries notes** — `{{presetTools}}/zotero-section-note.mjs --item <recordKey>`
   prints every child note's tags **and its first paragraph** in one call, plus `covered`, `retired`,
   `legacy`, `unknown` and `ambiguous`. This is the reuse probe: another question may already have
   transcribed the sections this one needs.
4. **What the question needs** — the exact claim or number this paper is supposed to supply, in one
   sentence, before the first slice is read. A reading that starts without it cannot know when to stop.

Write the result up as a **ruler list**; it is what the verdict is judged against.

## 3. Criteria

### 3.1 The unit is (paper × question), never the paper

One paper has one row **per question that reads it**, in that question's own file. Two questions reading
the same paper to different depths is the normal case, not a conflict: each row records its own reading
and neither can overwrite the other. Nothing is shared between the files — the reuse asset is the
**record's section notes**, which live in the library and belong to no question.

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
| `park` | `—`, or `abstract` | `—`: not started; `abstract`: screened and worth reading once the condition in `re-open if` holds |
| `enough` | `§N` | §N answered the question; stop reading |
| `stop` | `abstract`, or `§N`, or `—` when the record carries no readable text and the bibliographic record is all the evidence there is | the abstract settled that the paper cannot serve this question; a section settled it; or nothing is readable |
| (empty) | `—`, `abstract`, or `§N` | not judged yet: in the queue (`—`), screened and still queued (`abstract`), or being read (`§N`) |
| (empty) | `full` | every method section read, no verdict yet |

**`enough` is never written at `abstract`.** An abstract can rule a paper out for a question; it cannot
establish that the question's need was met — that claim needs the section it rests on.

`enough` and `stop` are different answers and are never merged: one says the need was met, the other
says it was not. A reader of the ledger is deciding what to read next, and that is the difference they
need.

`re-open if` is required for `park`, for `stop`, and for every `enough` reached **short of `full`**: a
sufficiency claim made at `§3` is exactly the one that has to say what would reopen it.
For `enough` at `depth: full` the cell may stay empty — a condition invented there ("if we need more")
is filler, and an empty cell is honest where the reading did go all the way.

### 3.3 The named-target rule

Before a `verdict` is written, the round must be able to state, in one sentence:

> this paper supplies **___** for **Q{t}** of this topic.

If that sentence cannot be written, the verdict is `stop`. "Unclear", "interesting but tangential" and
"I could not tell from what I read" are all `stop` — with the section that made it stop, so the next
round knows where to resume if the question changes.

### 3.4 `grade` and `depth` are two axes, and both are honest

- `depth` says how far the **paper** was read.
- `grade` says how firmly **the sentence we wrote about it** stands. Its three values are defined by
  `literature-recon` §3.1 and are not restated here; what matters on this axis is that a grade never
  claims more than the reading did, and `depth` is the column that says where the reading stopped, so
  `A` never means "the whole paper was read".

Reading §3 line by line and stopping there is `grade=A, depth=§3`. That is a complete and honest row.

### 3.5 Sequential reading is the default, and it is free

Read front to back, one slice at a time. The instrument already supports exactly this: `--offset` and
`--limit` return a slice and the tool prints `next: --offset N`, and every slice begins inside the
section it belongs to — so **"which section am I in" is answered by the text in front of you**, not by
an outline mapped to a position.

1. **Start with the reuse probe** (§2.3). If the record already carries notes for the sections this
   question needs, read their first paragraphs from that one output.
2. **A reusable note, three rungs.** The first paragraph is often enough. If it is not, read the whole
   note: `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000` and follow the printed offset.
   If the note still does not answer, go to the paper itself for the next section. Say in `basis` which
   rung decided it.
3. **No reusable note**: `{{presetTools}}/zotero-read.mjs --fulltext "<recordKey>" --offset 0 --limit 12000`,
   then the offset it names, and so on. When the library has not indexed the attachment, the same
   arguments work with `{{presetTools}}/zotero-pdf.mjs --extract`.
4. **When a method section is finished and the reading continues, write its `/section-N` note** —
   `section-notes` does that, one section per invocation. That note is the asset the *next* question
   reuses; a reading that stops does not produce one.
5. **At each section boundary, judge.** Met the need → `enough`. Still possible → continue. Settled that
   it cannot serve this question → `stop`.

**Why slices, and why 12,000.** A paper's whole indexed text arrives as one result — measured at 33k to
88k characters for the papers this discipline is used on — so it is read in slices of 12,000 characters,
the reader's own default. Nothing cuts a result at 8,192 characters as it arrives: the shell tool clips
a single command's output at 16,000 characters and says so, spilling the rest to a file, so a
12,000-character slice comes back whole. The composition's result pruner acts elsewhere — when the
context is **compacted**, it rewrites any tool result over 8,192 characters down to its first 4,096 and
last 1,024 around a `[... tool result middle pruned ...]` marker.

A slice is therefore read in full once, and **a slice needed a second time is re-fetched by its offset,
never recalled from a pruned result**. A heading quoted verbatim, or the sentence that decided a verdict,
comes from a live read or it does not go in the record. Name the offsets the reading covered: "read to
§3" is a claim about a range of the text, and the offsets are what the next reader can check.

### 3.6 Jumping is the exception, and it has three gates

Reading one section out of the middle is allowed only when **all three** hold:

1. `{{presetTools}}/zotero-pdf.mjs --item <recordKey> --outline` lists the section, and its ordinal and
   title are **the paper's own**;
2. `--grep "<that heading, verbatim>"` hits;
3. the matched heading line is **printed verbatim** before it is used, and its character `index` becomes
   the `--offset`.

Gate 3 is not ceremony. A scanned paper's heading can be recognised as `P SOLUTIOCN` or
`-P IZATION AND THE CORRECTOR`, and a `--grep` against the true title then matches nothing — a silent
miss that reads exactly like "the section is not there". Printing the hit is the only place that
failure becomes visible. **Any gate failing means sequential reading**, not a best guess.

The only legitimate reason to jump is that the content outside that section has no discriminating power
for this question (a paper consulted only for the structure of one results table, say), and the reason
is stated in the report.

### 3.7 What reuse is actually worth

A record that another question has already read carries `/section-N` notes. One `--item` call returns
every note's tags and first paragraph; reading a fresh 40,000-character paper at 12,000 characters a
slice costs five to eight calls and the context that goes with them. **The reusable object is the note,
not the previous question's ledger row** — the row is a hint about where to look, and it is written
about a different question.

Reuse only pays where a note exists. `section-notes` writes notes for method sections only, so a paper
that an earlier question stopped inside its introduction or its review has no note to reuse; that
question's row says `stop` and this one starts from the paper. Say which happened in the report.

### 3.8 One round's reading budget, and whose hands read it

A round that spans papers is not split by counting papers. What costs context is the source text pulled
in, and that number is on screen before the first slice is read.

1. **Screen in batches of five** — one call per record,
   `node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --offset 0 --limit 3000`. Its
   `text:` line gives the paper's whole length, its `rung:` line says whether the index answers, and
   the slice itself is the paper's own abstract. Five records cost about 15,000 characters — under the
   shell's 16,000-character clip and small against what one paper costs. **A queue of one or two is
   not screened**: they would never be handed over, so screening them buys nothing.
2. **The budget is eight slices of source text (≈96,000 characters) per round**, screening included.
   The figure is not a preference: it is above the largest paper measured for this discipline
   (88,000 characters), so **one paper is always read inline**, and it is 8 × the 12,000 the tool
   returns in one result. A paper's bill is the offsets it actually covered — read them off the slices,
   never off the screening.
3. **A record that already carries notes is cheaper than its length says.** `--item <recordKey>` on
   `zotero-section-note.mjs` names the sections another question transcribed, and reading a note costs
   one slice, not a paper. Bill it at the notes.
4. **Decide at a boundary, and only about papers not yet started.** Before starting the next paper, add
   up what this round has read. If the next one would cross eight slices, hand **it and the remaining
   ones, one per child**, while every library write and every ledger row stays here. A paper already
   started is finished here: a half-read paper handed over is read twice.
5. **The estimate is revised, never trusted.** Screening estimates what the round will cost; a paper
   that stops at §3 refunds what it did not read, and the refund may keep the next one inline. State
   the estimate, the budget and the actual bill in the report — "screened 5 → 3 relevant, 2 stop at the
   abstract; 5 notes estimated, 168,000 characters; budget 8 slices → first paper inline, 2 to
   children" — so that a later reader can check the split against what was read.

A child under this rule reads and reports; it does not judge and it does not write (§3.7, §7). One
paper is never split between two children: a note defines each symbol where it first appears, and two
readers of the same paper disagree quietly about notation.

## 4. Do vs don't

### 4.1 Do

- Report the planned depth and the target sentence **before** reading the first slice
- Read the ledger row first; a current verdict on an unchanged paper is not reopened "to be sure"
- Write the row after the reading, not before: `depth`, `verdict`, `basis`, `re-open if`, `date`
- State which sections were read and which were not reached
- Prefer an existing note over a fresh read of the same section, and say which rung answered
- Append a `## Reading log` line when a verdict changes, and leave the old judgement in place
- When the round spans papers, report what was screened, the round's estimate against the eight-slice
  budget, and the bill as read — before handing anything to a child (§3.8)

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No named question (the candidate questions are not yet decided) | Ask which question this is for. No judgement — a verdict without a unit is a guess in a table. |
| The record has no readable attachment | Report "no readable text"; `depth=—`, `verdict=stop`, whose `basis` states that the bibliographic record is the whole evidence. Never report it as read. |
| Only the abstract is available | `depth=abstract`, `grade ≤ B`. `stop` if the abstract already settles that the paper cannot serve the question; `park` if the full text would decide it. Write what the full text could change. |
| The outline is missing, or `--grep` does not hit the heading | **Do not jump.** Fall back to sequential reading (§3.5). |
| `--grep` hits in several places | Take the first, print every hit's position, or fall back to sequential reading. |
| The text layer is unreadable, or a formula exists only in an image | Climb to the rendered page (`--render --pages N` + `read_image`) and say which rung answered. **A verdict built on text that was never read does not stand.** |
| Two questions give opposite verdicts on one paper | Two rows, one per question. Never merge them into one verdict. |
| The verdict would change the research direction ("there is no literature on this") | Out of scope: ask the owner. A `stop` is about one paper; a claim about a field is not. |
| A `park` row's `re-open if` now holds | Re-triage now. A condition that came true and was not acted on is a stale row. |
| A reused note's first paragraph contradicts the paper's own text | The paper wins. Record the verdict from the paper and report the note as a candidate for `section-notes`' retire path — never edit the note here. |

## 5. Wording discipline

- **"This paper supplies X for Q1 at §3" is a verdict.** "Looks relevant", "seems related",
  "insufficiently innovative" are not, and none of them may appear in `basis`.
- **`basis` names a section and a sentence**, not an impression: "§3 and Fig. 4 give the threshold law
  Q1 needs" — with the section ordinal the paper itself uses.
- **Never grade the paper.** The grades here are about our sentence's footing, not the work's quality.
- **Distinguish "read and irrelevant" from "not readable" from "not read".** They are `stop` at the
  depth that settled it (`abstract` or `§N`), `stop` at `—`, and no verdict at all.
- **A `stop` is not a verdict on the paper.** Say what it was judged against: the question, and the
  section that settled it.

## 6. Report shape

The artifact is the row and the log line. The report is what the next round reads:

1. `## Record` — `itemKey`, title, and which attachment the reading used.
2. `## Question` — the question id and, in one line, the claim or number this paper was read for.
3. `## Depth` — the sections read, their own ordinals and headings, and the offset range each slice
   covered. When the round spans papers, also the screening result, the estimate against the
   eight-slice budget, and the bill as read (§3.8).
4. `## Verdict` — `enough` · `stop` · `park` · in progress, and the named target sentence (§3.3).
5. `## Basis` — the section and the sentence that decided it; the rung that answered, when a note was
   reused.
6. `## Re-open if` — the condition that would make this row be judged again.
7. `## Not judged` — what this round did not decide: sections not reached, a question not asked, a
   quality judgement deliberately not made.

The ledger row and the log line are written to the question's own file; the report is the round's
answer to the owner.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **No new tool, and none is needed.** The reading is `{{presetTools}}/zotero-read.mjs` (`--fulltext`,
  `--offset`, `--limit`, `--grep`, `--item`) and `{{presetTools}}/zotero-pdf.mjs` (`--outline`,
  `--extract`, `--render`). The ledger is a `read`/`write` on a workspace file.
- **The offset is arithmetic the tool does for you.** Follow the `next: --offset N` line it prints
  rather than computing it; a hand-computed offset walks into the middle of a heading.
- **`--item <noteKey>` reads a note; `--item <recordKey>` on `zotero-section-note.mjs` lists a record's
  notes.** They are different calls with different output; confusing them wastes a slice.
- **This skill writes no library note.** The verdict is a workspace row. When the reading continues past
  a method section, the note that gets written is `section-notes`' work, under its own write
  authorization (`INV-EVID-3`) and read-back rules.
- **Never write the ledger before the reading.** A row written first is a plan, and a plan in the
  ledger's columns reads as a judgement that was made.
- **A row is never deleted.** A judgement that changes gets a dated `## Reading log` line beside it, so
  the history of why it changed survives.
- **A subagent may read; it may not judge.** When §3.8 crosses the round's budget, the child returns
  the sections, the sentences and the offsets it covered, and the parent writes the row — one pair of
  hands on the ledger.
- **A workspace file carries no resolved helper path.** Name the program; the path comes from this
  discipline through the token.

## 8. Acceptance checklist

- [ ] The question id is named, and the target sentence was written before the first slice
- [ ] The existing row was read first, and a current unchanged verdict was not reopened
- [ ] Every section read is named by the paper's own ordinal and heading
- [ ] `depth` matches what was actually read, and `grade` matches what the sentence rests on
- [ ] `verdict` is one of `park`, `enough`, `stop`, or empty for a reading still in progress
- [ ] The named target sentence exists for every verdict, and its absence produced `stop`
- [ ] `basis` names a section and a sentence, not an impression
- [ ] `re-open if` is written for every `park`, every `stop`, and every `enough` short of `full`
- [ ] A reused note is reported with the rung that decided it, or its absence is reported
- [ ] Sections not reached are reported as not reached, not as "no note needed"
- [ ] Every slice is named by the offsets it covered, and nothing was quoted from a pruned slice
- [ ] A changed verdict produced a dated `## Reading log` line, and no row was deleted
- [ ] A round spanning papers reported its screening, its estimate against the eight-slice budget, and
  the bill as read; no paper was started inline after the budget was crossed, and none was handed over
  once started
- [ ] No library write was performed by this skill

## 9. Don't

- Do not judge a paper without a named question, and do not merge two questions' verdicts into one row
- Do not quote a heading or a sentence from a slice whose middle reads `[... tool result middle pruned
  ...]`; re-fetch that offset and quote from the live text
- Do not evaluate the paper's quality, novelty, or writing
- Do not read past the section that settles the question: `stop` and `enough` both stop the reading
- Do not write `enough` from a whole-paper summary, a note's first paragraph, or an abstract — an
  abstract can rule a paper out for a question, never in. A `stop` may rest on the abstract, and
  `basis` then says so.
- Do not edit, retire, or claim a section note from here; that is `section-notes`' act, with its own
  rules
- Do not change a research direction, and do not report a field-level absence from one paper's `stop`
- Do not delete a ledger row, and do not rewrite an earlier judgement in place
- Do not turn the verdict into a plan to read later: `park` is waiting on a stated condition, not on
  time
