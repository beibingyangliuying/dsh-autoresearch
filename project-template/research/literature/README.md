# `research/literature/` — one archive per research question

One file per topic: `<topic>.md`. Each file belongs to **one** research question: the search round
appends what it found, and every reading round records, per paper, how far it got and why it stopped
there. Nothing here is shared between topics — a paper that serves two questions appears once in each
file, and the two readings are independent of each other.

## Conventions

- **Citation format**: TODO (default: title · authors · year · venue · DOI/arXiv id/URL).
- **One row per (research question × paper)**, keyed by the library `itemKey`.
- **Evidence grades are about the sentence, not the paper**: `A` the specific passages the claim rests
  on were read · `B` only the abstract or the introduction · `C` a second-hand paraphrase. The
  ledger's `depth` column is what says how far the paper itself was read; a grade never claims more
  than a reading did.
- Every claim carries a source, or is marked `[exploratory]`.
- Contradicting evidence gets its own section. "None found" must state the search scope.
- Files here are **non-normative**: they never ground an experiment or a conclusion on their own.

## Required sections

1. `## Search question`
2. `## Summary of findings`
3. `## Reference ledger`
4. `## Contradicting evidence`
5. `## Gaps and unknowns`
6. `## Reading log`
7. `## Non-normative declaration`

## The reference ledger

One row per paper. The search round appends a row and every reading round advances it. **A row is never
deleted** — a paper judged irrelevant to this question keeps its row, because the judgement is the
record.

| itemKey | year | found via | grade | depth | verdict | basis | re-open if | date |
|---|---|---|---|---|---|---|---|---|

| Column | Written by | Means |
|---|---|---|
| `itemKey` `year` `found via` | the search round, append-only | which library record, which year, and which query or channel produced it |
| `grade` | the round that read it | how firmly our sentence about this paper stands: `A` / `B` / `C` |
| `depth` | the round that read it | how far the paper was read: `—` / `abstract` / `§N` / `full` |
| `verdict` | a reading round | why the reading stopped: `park` / `enough` / `stop`; empty = nobody has judged it yet |
| `basis` | a reading round | the section, and the sentence, that decided it; name the note when the judgement came from one |
| `re-open if` | a reading round | what change would make this row be judged again |
| `date` | a reading round | the date the verdict last changed |

The search round fills `grade` and `depth` with what it actually retrieved — a screening pass that read
the abstract appends `B | abstract` — and it writes no `verdict`, no `basis` and no `date`. A reading
round may correct `grade` and `depth` in either direction, because it read the paper; what no round does
is remove a row or rewrite its provenance.

**`verdict` empty is the unscreened state.** The row exists, `depth` says what is already in hand, and
nobody has judged this paper for this question yet. That is not "no papers found" and it is not a
judgement; it is the queue.

### The two vocabularies

`depth` — how far the paper was read. `§` appears here and nowhere else.

| `depth` | Means |
|---|---|
| `—` | not started |
| `abstract` | the abstract or the introduction only |
| `§N` | read to the end of the paper's own section N (`§3`; `§4.2` for a subsection) |
| `full` | every section that matters to this question was read |

`verdict` — why the reading stopped there.

| `verdict` | Needs `depth` | Means |
|---|---|---|
| `park` | `—` | not started; waiting on a stated condition |
| `enough` | `§N` | §N answered the question; stop reading |
| `stop` | `§N`, or `—` when the record carries no readable text and the bibliographic record is all the evidence there is | §N settled that it is irrelevant to this question |
| (empty) | `§N` | reading in progress |
| (empty) | `full` | every method section read, no verdict yet |

`enough` and `stop` are kept apart on purpose: one says the need was met, the other says it was not, and
that difference is what the next question most needs to read.

**The named-target rule.** A reading round must be able to state *"this paper supplies ___ for Q{t} of
this topic"*. If that sentence cannot be written, the verdict is `stop` — not "unclear", not
"interesting but tangential".

## Reading log

Appended whenever a verdict changes, in date order. The ledger holds only the current state; the log is
what makes a changed judgement traceable, and it never edits the notes a previous round wrote.

```text
<date> | <itemKey> | <old> → <new> | <basis> | <who>
```

<!-- EXAMPLE:BEGIN — a filled ledger and the two log lines it came from. Delete this block. -->
| itemKey | year | found via | grade | depth | verdict | basis | re-open if | date |
|---|---|---|---|---|---|---|---|---|
| ABCD1234 | 2024 | library full-text `"threshold response"` | A | §3 | enough | §3 and Fig. 4 answer Q1 directly; §4 onward is the authors' own case study | a correction, or our voltage moves out of the range §3 covers | 2026-10-19 |
| EFGH5678 | 2023 | preprint index `abs:"corrector"` | B | abstract | park | no full text in hand; the abstract claims the same threshold | a copy of the full text becomes retrievable | 2026-10-19 |
| IJKL9012 | 2019 | library full-text `"ionization"` | B | abstract | stop | abstract: a different correction scheme, with no threshold to borrow | it is cited to us for a threshold result | 2026-10-19 |

```text
2026-10-19 | ABCD1234 | (none) → enough | §3 and Fig. 4 | reading round
2026-10-19 | EFGH5678 | (none) → park   | abstract only, full text not retrievable | reading round
```
<!-- EXAMPLE:END -->
