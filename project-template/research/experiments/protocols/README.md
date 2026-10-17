# `research/experiments/protocols/` — what was declared *before* the run

One file per run, named by the run's id: `<id>.md` — the same id as the card and the evidence
script it belongs to. The card is written afterwards and points here.

## Format

```text
Prediction           what will be observed, stated before the run, and what would refute it
Reference population the denominator, fixed before outcomes are examined
Variants (closed)    every arm / stratum / comparator that will be run
Validity gates       the checks that make the run valid rather than merely finished
Decision rule        which observation leads to which verdict
```

## Rules

- **Written before the run.** This file is the only artifact whose value is entirely in its date: it
  is what makes "we predicted this" different from "we noticed this afterwards".
- **Revise before, never after.** A revision is `Revision N, with reason` at the top. After the run
  the file is closed: corrections go on the card, which is allowed to record that the protocol was
  wrong.
- **Do not backfill.** A run executed before this convention has no protocol; register the gap
  instead of writing one now.
- **The variant set is closed on write.** Adding an arm after seeing the data is not a smaller
  experiment; it is a protocol change, and the honest record is an open item on the card.
- A protocol is **not** a plan of record for the study's direction — that is `research/00_scoping.md`
  and the journal. It covers one run.
