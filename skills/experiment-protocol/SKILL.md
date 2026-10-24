---
name: experiment-protocol
description: Use before anyone is spawned to write or run code, whenever a run's outcome is reported, and whenever it worked has to become a fact. Writes a protocol before the run — prediction, variants, gates, decision rule — and a card after it, carrying command, seed, artifacts, observation and verdict.
---

# experiment-protocol — make a run reportable

This skill turns "I ran something" into a record another person could re-run and either reproduce or
refute. It does not decide what to test; that comes from the study's own question.

## 1. When to use

- A hypothesis is ready to be tested by running code.
- Before delegating code-writing or code-running to a subagent (then also load `subagent-contract`).
- When reporting what a run produced.
- When someone says a result "works" and you need to know what that means.

**Not applicable**: exploring an idea with no prediction yet — label it `[exploratory]` and do not dress it
up as verification.

## 2. First step: read the declared boundary as a ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

1. Read the study's `AGENTS.md`, if it has one: its invariants, its document authority and its environment.
   **Never run against a read-only input or baseline.** With no such file there is no declared boundary,
   and the round says so rather than writing a card against an assumed one.
2. Read any existing execution protocol (for example a `specs/` directory) and follow it; do not invent a
   parallel one.
3. Fix the **reference population** before looking at outcomes. A denominator chosen after seeing results
   is not a denominator.
4. Write the prediction **down** before running, in an artifact of its own — `protocols/<id>.md` under the
   project's experiment location. A hypothesis written after seeing the result is not a test, and a
   prediction sharing a file with its outcome cannot be told apart from one written afterwards.

## 3. Criteria: what makes a run valid and reportable

### 3.1 Every run is a protocol and a card

**The protocol** is written **before** the run — `<layer root>/experiments/protocols/<id>.md`, or the
project's own location, where the layer root is `research/` if the study has one and the study root
otherwise (protocol §7). It carries exactly what must not be decided after seeing the data:

| Field | Meaning |
|---|---|
| `Prediction` | what will be observed, stated before the run, and what would refute it |
| `Reference population` | the denominator, fixed before outcomes are examined |
| `Variants (closed)` | every arm / stratum / comparator that will be run |
| `Validity gates` | the checks that make the run valid rather than merely finished |
| `Decision rule` | which observation leads to which verdict |

It may be revised **before** the run (`Revision N, with reason`) and never after it. If the implementation
and the protocol disagree about validity, change neither: record the disagreement on the card and hand it
to the owner.

A run executed before this convention has no protocol. **Register the gap** rather than writing one now;
which runs those are is itself a dated fact.

**The card** is written after the run — `<layer root>/experiments/<id>.md`, or the project's own location:

| Field | Meaning |
|---|---|
| `Protocol` | the run's id; the prediction itself is in `protocols/<id>.md`, **cited rather than retyped**, so one prediction has one transcription |
| `Command` | the exact command, copy-pasteable |
| `Config / seed` | parameters, versions, seed or latent-variable handling |
| `Artifacts` | path(s) the run wrote, and the copy kept with the record if it wrote outside it |
| `Corrections` | one dated line per locator that was wrong: field · old → new · why · who. Only `Protocol`, `Command` and `Artifacts` are correctable; `Observed`, `Validity` and `Verdict` are never repaired |
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

If the claim is comparative, name the comparator and run it under the **same** conditions. If the domain
requires shared randomness (common random numbers, paired latents), a shared seed alone is not enough —
say how per-coordinate identity was preserved.

### 3.4 Negative results are results

A refuted hypothesis is recorded in the card and in the pitfall/rejected-direction record. Runs are never
deleted to make a record look clean.

### 3.5 Reuse before re-running

Check the card index first. Re-running something already recorded, to get a nicer number, is not allowed.

### 3.6 A consequence of the construction is not a measurement

Before a number enters the card as an observation, name the rule it follows from. If it follows from how
the object was built — a fixed step size, an identity that must hold by definition, a bound that cannot be
otherwise — record it as a property of the definition, not as a result, and let no verdict rest on it. That
number is the most convincing kind of wrong: it is exact, it reproduces, and it says nothing about the
world.

### 3.7 A declared variant set is closed

When the protocol declares variants — sensitivity arms, strata, comparators — the set is fixed before the
run. Run all of them, or record the unrun ones as open items in the card **before** reporting. An arm
declared and silently dropped is not a smaller experiment; it is a missing check, and it is
disproportionately often the one that would have tested the load-bearing confound.

## 4. Do vs don't

### 4.1 Do

- Declare a budget before starting (max runs, wall-clock) and stop at it, reporting where you stopped.
- Write artifacts to a **new** output namespace and disclose it in the card.
- Keep exploratory scripts clearly separate from the recorded experiment path.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No artifact path | The result is **not reportable**. Say so. |
| The only copy of a cited artifact is outside the study's own record | **Not yet evidence.** Copy it beside the record, or state on the card that the citation cannot be obtained independently. |
| The prediction exists only inside the card | Not a test. Write the protocol first, or relabel the run exploration. |
| A read-only baseline was mutated | Stop immediately, report, do not "fix forward". |
| Config or seed not captured | The run is **not reproducible**; mark the card `[exploratory]`. |
| Only the exit code was checked | Invalid run. Inspect the artifact. |
| "It works" with no number | Not a result. Ask for the number and the path. |
| The hypothesis was written after the result | Not a test. Relabel it exploration. |
| The run produced nothing usable (empty / all-missing) | That is a finding about the setup, not a null result. Record it as such. |
| A reported number follows from how the object was constructed | It is a property of the definition. Relabel it; let no verdict rest on it. |
| A variant the protocol declared was not run | Run it, or record the omission as an open item **before** reporting. |
| A metric, threshold, weight or cost function is about to be invented to make a result legible | Do not. That is a decision the study must own, not a formatting choice. |
| A single run is about to be written as a trend | Do not. One run is one run. |
| A number is about to be pulled by pasting a whole artifact into context | Do not; grep it or read the range. |

## 5. Wording discipline

- `fact` — the artifact says X, at this path, read this way. `inference` — my reading of it.
  `[exploratory]` — a hunch with no run behind it.
- Never write "verified" without naming the artifact. Never write "significant" without naming the
  criterion. Never write "improved" without the comparator.
- Do not launder a subagent's claim into your own voice: if you did not inspect the artifact, it stays
  attributed and `[unverified]` (`subagent-contract`).

## 6. Report shape

The card in §3.1 is the artifact; one line in the round's journal points at it, never a copy of it. When
the run decides a direction, the outcome also goes to mnemon Documents through `progress-sync` — the
rejected path and why.

**Budget** — ≤80 lines of prose (the command block aside). Past it, cut in this order: evidence restated
from its carrier → a second reason for the same claim → per-object detail a ledger holds → how the
statement changed. Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Never mutate, migrate, overwrite, or vacuum an original input database or its manifest.
- **A corrected locator resolves to the artifact the card already cited** — same command, same bytes.
  Changing which artifact is cited is a different run, not a correction; `Observed`, `Validity` and
  `Verdict` are never repaired, and the correction states the old value beside the new one.
- Keep the artifact, not just the summary: a number without its file cannot be audited later.
- If a subagent runs the experiment, it hands back **paths and commands**, never a long inline report
  (`subagent-contract`).
- Long-running work goes to a background job rather than blocking the turn.
