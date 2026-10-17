# `research/experiments/` — protocol (before), card (after), evidence (after)

Three things, kept in three places, because **a result and the prediction it tested must not be the
same document**:

| | Written | Carries | Why it cannot be merged |
|---|---|---|---|
| `protocols/<id>.md` | **before** the run | prediction · reference population · the closed variant set · validity gates · decision rule | its whole value is existing before the outcome; a prediction bundled into a card written afterwards is indistinguishable from a story told after the fact |
| `<id>.md` (the card) | after the run | command · config/seed · artifact paths · what was observed and how it was read · validity · verdict | it must be able to record "this run was invalid" without touching the prediction |
| `evidence/` | after the run | versioned copies of the artifacts the card cites | a card pointing at a path the next reader cannot obtain points nowhere |

The skill `experiment-protocol` owns the fields of all three. This file only fixes **where they
live and what they are called**.

## One run, one id

The id is the slug of the run's evidence script (`paired_response`), and the protocol, the card and
the artifact files all use it. That is what makes "which run wrote this number?" answerable without
a lookup table. **Never renumber.** A dropped run leaves its id unused, and the file or index that
would have used it says so.

**A run that predates this convention has no protocol file.** Register the gap — "no preregistration
existed when this ran" — and never write one afterwards. Which runs those are is itself a dated
fact worth keeping.

## Protocol format

```text
Prediction           what will be observed, stated before the run, and what would refute it
Reference population the denominator, fixed before outcomes are examined
Variants (closed)    every arm / stratum / comparator that will be run
Validity gates       the checks that make the run valid rather than merely finished
Decision rule        which observation leads to which verdict
```

- A protocol may be revised **before** the run (`Revision N, with reason`) and never after it.
- If the implementation and the protocol disagree about validity, **change neither**: record the
  disagreement on the card and hand it to the owner. The protocol's claim is that it was written
  first, and editing it destroys exactly the thing it exists to prove.

## Card format

```text
Hypothesis        the prediction, cited from protocols/<id>.md — not retyped from memory
Command           the exact command, copy-pasteable
Config / seed     parameters, versions, seed or latent-variable handling
Artifacts         path(s) the run wrote, and the versioned copy if it wrote outside version control
Observed (facts)  numbers read from the artifact, and how they were read
Interpretation    what you think it means — marked as inference
Validity          was this run valid, and what check establishes that
Verdict           supports | refutes | inconclusive | invalid run
```

## Rules

- **"Ran" is not "valid".** A run is valid only when an artifact exists, was inspected, and a stated
  check shows the run was not degenerate — no empty result set, no all-missing column, no swallowed
  exception.
- **The prediction is written before the run.** A hypothesis written after seeing the result is not a
  test; relabel it exploration.
- **A negative result is recorded, never deleted** — including a run that was `invalid`, which is a
  finding about the setup rather than a null result.
- If the claim is comparative, the comparator ran under the **same** conditions, and the card says how
  shared randomness was preserved if the domain requires it.
- Read the artifact by grep or by range; do not paste a whole artifact into context to check one
  number.
- Check the existing cards before re-running something already recorded — re-running for a friendlier
  number is not allowed.
- A run that decided a direction also goes to the settlement record, including the rejected path and
  why.
