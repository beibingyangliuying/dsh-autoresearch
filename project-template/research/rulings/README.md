# `research/rulings/` — structured challenges awaiting a ruling

Produced by the `redteam-ruling` skill. One file per challenged claim:
`ruling_<target>_<YYYYMMDD>.md`.

## Hard rules (from the skill)

- The red team runs as an **independent subagent**: it receives the claim as written plus the
  conclusion, and **not** the author's reasoning chain.
- It must supply at least one of: a counterexample, contradicting evidence, or a testable
  falsification path. If it can supply none, it reports **"unable to challenge"** — that is an
  accepted outcome, not a failure.
- It must point at a specific sentence of the claim.
- It must conclude with one of: `falsified` / `insufficient evidence` / `outside current scope`.
- It never modifies the claim and never issues the ruling. The ruling belongs to the human.

## Required sections

1. `## Claim under challenge` (original sentence, quoted)
2. `## Objections`
3. `## Evidence list`
4. `## My independence and limits`
5. `## Candidate verdicts`
6. `## What I do not claim`

## Ruling record

TODO — where the human's ruling is recorded. Default: append a short `## Ruling` section to the same
file (date, verdict, who ruled, on what grounds). Do not rewrite the objection text.

<!-- EXAMPLE:BEGIN — a filled objection. Delete this block. -->
### Objection 1

Targets: "…the intervention reduces regional risk…" — the word **reduces**.

Evidence: `research/literature/<topic>.md` §Contradicting evidence, grade A source, reports a
non-monotone response in a comparable network.

Strength: **insufficient evidence** — the counterexample is from a different network class, so it
constrains the general claim but does not falsify the study-specific one.
<!-- EXAMPLE:END -->
