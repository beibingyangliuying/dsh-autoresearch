# `research/experiments/evidence/` — copies of the artifacts a card cites

A versioned copy of every artifact a run card points at, when the run wrote it **outside version
control** (an output directory that is git-ignored, a scratch disk, a machine that will be rebuilt).

## Rules

- **A copy, never a regeneration.** Copy the bytes, do not re-run the script to produce a "clean"
  one; a re-run artifact is a different artifact, and it silently replaces the evidence.
- **The card stays the record.** A copy carries no interpretation, no summary and no verdict — those
  live on the card, and the card is what a disagreement is settled from.
- **Name the artifact the way the card names it**, so the path in the card resolves here by
  substitution of the directory.
- **Only what is cited.** This is not an artifact store: an output nothing points at stays where the
  run put it.
- **Hash it, or at least date it.** A reader who cannot tell whether these are the bytes the card
  describes has no evidence at all.
- If a cited artifact cannot be mirrored, the card says so explicitly. **An unreachable citation is
  a known defect, not a deleted line.**
