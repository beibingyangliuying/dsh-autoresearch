# `research/experiments/` — run cards

One card per run, named by the run's id. A card is a **re-runnable record**, not a log entry: someone
else must be able to reproduce the run from it and either reproduce or refute the result.

## Card format

```text
Hypothesis        the prediction, stated BEFORE the run, and what would refute it
Command           the exact command, copy-pasteable
Config / seed     parameters, versions, seed or latent-variable handling
Artifacts         path(s) the run wrote
Observed (facts)  numbers read from the artifact, and how they were read
Interpretation    what you think it means — marked as inference
Validity          was this run valid, and what check establishes that
Verdict           supports | refutes | inconclusive | invalid run
```

## Rules

- **"Ran" is not "valid".** A run is valid only when an artifact exists, was inspected, and a stated
  check shows the run was not degenerate — no empty result set, no all-missing column, no swallowed
  exception.
- Write the prediction **down before** running. A hypothesis written after seeing the result is not a
  test; relabel it as exploration.
- A negative result is recorded, never deleted.
- If the claim is comparative, the comparator ran under the **same** conditions, and the card says how
  shared randomness was preserved if the domain requires it.
- Read the artifact by grep or by range; do not paste a whole artifact into context to check one
  number.
- Check the existing cards before re-running something already recorded — re-running for a friendlier
  number is not allowed.
- A run that decided a direction also goes to the settlement record, including the rejected path and
  why.
