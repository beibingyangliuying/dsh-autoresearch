---
name: experiment-protocol
description: Run code to test a hypothesis and record it as an experiment card — pre-stated prediction, exact command, config/seed, artifact path, what was observed, and an explicit validity check. Use before spawning anyone to write or run code, whenever a run's outcome is reported, and whenever "it worked" needs to become a fact. Enforces that "ran" is not "valid", that negative results are results, and that a read-only baseline is never mutated.
---

# experiment-protocol — make a run reportable

This skill does exactly one thing: turn "I ran something" into a record that another person could
re-run and either reproduce or refute. It does not decide what to test; that comes from the study's
own question.

## 1. When to use

- A hypothesis is ready to be tested by running code
- Before delegating code-writing or code-running to a subagent (then also load `subagent-contract`)
- When reporting what a run produced
- When someone says a result "works" and you need to know what that means

**Not applicable**: exploring an idea with no prediction yet — that is exploration. Label it
`[exploratory]` and do not dress it up as verification.

## 2. First step: read the declared boundary as a ruler

1. Read the project `AGENTS.md`: its invariants (§2), its document authority (§3), its environment
   (§6). **Never run against a read-only input or baseline.**
2. Read any existing execution protocol (for example a `specs/` directory) and follow it; do not
   invent a parallel one.
3. Fix the **reference population** before looking at outcomes. A denominator chosen after seeing
   results is not a denominator.
4. Write the prediction **down** before running. A hypothesis written after seeing the result is not
   a test.

## 3. Criteria: what makes a run valid and reportable

### 3.1 Every run is a card

`research/experiments/<id>.md` (or the project's own location), with these fields:

| Field | Meaning |
|---|---|
| `Hypothesis` | the prediction, stated before the run, and what would refute it |
| `Command` | the exact command, copy-pasteable |
| `Config / seed` | parameters, versions, seed or latent-variable handling |
| `Artifacts` | path(s) the run wrote |
| `Observed (facts)` | numbers read from the artifact, with how they were read |
| `Interpretation (inference)` | what you think it means — marked as inference |
| `Validity` | was this run valid, and what check establishes that |
| `Verdict` | `supports` / `refutes` / `inconclusive` / `invalid run` |

### 3.2 "Ran" is not "valid"

A run is valid only when all of these hold:

- an artifact exists and was **inspected** (not just an exit code);
- the command, config, and seed are captured;
- a stated check shows the run was not degenerate — no empty result set, no all-missing column, no
  swallowed exception, no silently-zero rows.

### 3.3 Comparators share conditions

If the claim is comparative, name the comparator and run it under the **same** conditions. If the
domain requires shared randomness (common random numbers, paired latents), a shared seed alone is
not enough — say how per-coordinate identity was preserved.

### 3.4 Negative results are results

A refuted hypothesis is recorded in the card and in the pitfall/rejected-direction record. Runs are
never deleted to make a record look clean.

### 3.5 Reuse before re-running

Check the card index first. Re-running something already recorded, to get a nicer number, is not
allowed.

## 4. Do vs don't

### 4.1 Do

- Declare a budget before starting (max runs, wall-clock) and stop at it, reporting where you stopped
- Write artifacts to a **new** output namespace and disclose it in the card
- Keep exploratory scripts clearly separate from the recorded experiment path

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No artifact path | The result is **not reportable**. Say so. |
| A read-only baseline was mutated | Stop immediately, report, do not "fix forward". |
| Config or seed not captured | The run is **not reproducible**; mark the card `[exploratory]`. |
| Only the exit code was checked | Invalid run. Inspect the artifact. |
| "It works" with no number | Not a result. Ask for the number and the path. |
| The hypothesis was written after the result | Not a test. Relabel it exploration. |
| The run produced nothing usable (empty / all-missing) | That is a finding about the setup, not a null result. Record it as such. |

## 5. Wording discipline

- `fact` — the artifact says X, at this path, read this way. `inference` — my reading of it.
  `[exploratory]` — a hunch with no run behind it.
- Never write "verified" without naming the artifact. Never write "significant" without naming the
  criterion. Never write "improved" without the comparator.
- One run is one run. Do not write it as a trend.
- Do not launder a subagent's claim into your own voice: if you did not inspect the artifact, it
  stays attributed and `[unverified]` (see `subagent-contract`).

## 6. Report shape

The card in §3.1, plus one line appended to the round's journal pointing at it. When the run decides
a direction, the outcome also goes to mnemon Documents through `progress-sync` — including the
rejected path and why.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Never mutate, migrate, overwrite, or vacuum an original input database or its manifest.
- Keep the artifact, not just the summary: a number without its file cannot be audited later.
- If a subagent runs the experiment, it hands back **paths and commands**, never a long inline
  report — see `subagent-contract` for why (tool results are pruned at 8192 characters).
- Long-running work goes to a background job rather than blocking the turn.
- **A run budget is also a reading budget.** Do not pull a whole artifact into context to check one number: grep it, or read the range. An artifact that exists is not an invitation to paste it.

## 8. Acceptance checklist

- [ ] Prediction was written before the run
- [ ] Command, config, and seed are in the card
- [ ] Artifact path exists and was inspected
- [ ] A validity check is stated (not degenerate)
- [ ] Comparator ran under the same conditions, if the claim is comparative
- [ ] Negative result recorded rather than deleted
- [ ] Read-only inputs untouched
- [ ] Budget declared and respected

## 9. Don't

- Do not invent a metric, threshold, weight, or cost function to make a result legible
- Do not re-run to get a friendlier number
- Do not delete failed runs
- Do not present a single run as a trend
- Do not report a subagent's result as your own verified fact
