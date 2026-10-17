---
name: domain-discipline
description: TODO — one sentence naming the trigger: when this study's domain rules must be applied (for example "audit this repository's X and Y, and give the fix / don't-fix criteria"). Keep it about *when to load*, not about the study's content.
---

# domain-discipline — TODO short title

Rename this directory to the discipline's real name (for example `storage-audit`, `calibration-review`)
and rewrite this file. Delete it if the study needs no domain-specific discipline.

This file follows the same nine-section shape as the preset's shipped disciplines, so that a reader who
knows one knows all of them. Keep that shape.

## 1. When to use

TODO — the concrete triggers, and the cases where this skill does **not** apply.

## 2. First step: read the declared boundary as a ruler

TODO — what to read before judging anything (which documents, which manifests, which conventions),
and the rule that nothing may be asserted from memory.

## 3. Criteria

TODO — the actual judgements this discipline makes, ordered by information value. Each criterion
must be checkable, not an attitude.

## 4. Do vs don't

### 4.1 Do

TODO.

### 4.2 Local exclusion conditions

TODO — a table of `hit → action`. This is the most valuable part of the file: it stops the agent
from "making it work" when the honest answer is to stop.

| Hit | Action |
|---|---|
| TODO | TODO |

## 5. Wording discipline

TODO — the phrases that are banned here because they cannot be checked, and the distinctions that
must be kept (for example claim vs citation, measured vs inferred).

## 6. Report shape

TODO — the artifact path and its fixed sections.

## 7. Instrument discipline (where this skill most easily goes wrong)

TODO — what must not be touched, what must be read-only, and which instruments (if any) the skill
ships under `instruments/`.

## 8. Acceptance checklist

- [ ] TODO — each item checkable by someone else

## 9. Don't

TODO — the things this discipline explicitly does not do.

<!-- EXAMPLE:BEGIN — the shape of a filled "local exclusion" table. Delete this block. -->
| Hit | Action |
|---|---|
| The proposed change only moves bytes without changing a query plan | Exclude it; report "no measurable benefit". |
| The column is derivable but the derivation is O(n) per read | Exclude it; report the cost alongside the saving. |
<!-- EXAMPLE:END -->
