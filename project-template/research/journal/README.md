# `research/journal/` — round-by-round log (append-only)

Written at the end of a work round by the `progress-sync` skill. One file per round:
`<YYYYMMDD>_<short-topic>.md`.

## Rules

- **Append-only.** A later round gets a new file; earlier files are not rewritten.
- The log is a **record, never a conclusion**. Conclusions go to mnemon Documents.
- "Done" must carry a verifiable artifact path.
- Rejected directions and their reasons are mandatory (write "no rejections this round" if none).

## Required sections

1. `## Goal of this round`
2. `## What was done`
3. `## Observed (facts)`
4. `## Inferences`
5. `## Exploratory ideas` (always marked `[exploratory]`)
6. `## Unresolved`

<!-- EXAMPLE:BEGIN — the distinguishing part is the fact/inference split. Delete this block. -->
## Observed (facts)

**fact** — The paired evaluation ran to completion on 4 of 9 strata; artifacts at
`out/paired/2026-10-11/` (manifest present, 4 directories).

**fact** — Stratum (M6, L2) produced a negative mean response with overlapping intervals.

## Inferences

**inference** — The negative sign in (M6, L2) is more likely a small-sample artifact than a real
inversion; the interval width is comparable to the effect. Not yet tested.

## Exploratory ideas

`[exploratory]` Treat the reference population as a per-stratum object and report the nine strata
separately rather than pooling.
<!-- EXAMPLE:END -->
