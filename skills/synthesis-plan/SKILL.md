---
name: synthesis-plan
description: Turn several explored directions into one executable draft — the chosen path and why it beat the alternatives, what was rejected and on what grounds, the acceptance criterion that would count as success or failure, the first concrete step, and the risks with their fallbacks. Use when exploration has produced candidates and a commitment is needed, when the user asks "so what do we do", or when two routes conflict and one must be chosen.
---

# synthesis-plan — from candidates to one executable draft

This skill does exactly one thing: force a **choice** out of everything that was explored, and write
that choice so that work can start without another question. It does not explore; exploration is
already finished by the time it runs.

## 1. When to use

- Exploration produced several candidate paths and one must be committed to
- The user asks "so what do we do now"
- Two routes conflict and the work cannot proceed on both
- A probing round left two or more surviving moves that cannot both hold, so the conflict is resolved by
  a commitment rather than by another probe
- A direction candidate came back `needs-a-move` and that piece is now in hand
- A round of experiments came back and the next round must be chosen

**Not applicable**: there is only one obvious next step (just do it), or the question itself is still
unsettled (that is the scoping discipline's job — a plan for an undecidable question is noise).

## 2. First step: read the ruler, including what was already killed

1. The scoping document: question, boundary, **non-goals**, decidability.
2. The rulings: what was already challenged and how it came out.
3. The rejected directions and **why** they were rejected — a plan that resurrects one silently is a
   regression.
4. The experiment cards: what was actually observed, and what was ruled invalid.
5. **The move ledger** (`<layer root>/directions/<topic>.md`), when the study has one: which moves
   survived, which were killed and on what ground, and which direction candidates came back
   `needs-a-move`. A plan that commits to a route cites the survivors it took and the moves it dropped;
   a route no surviving move supports is a preference, and the plan says so rather than dressing it as
   a finding.

**A plan that contradicts an existing ruling is not a plan.** Either follow the ruling or ask for it
to be revisited, explicitly. **A plan that revives a killed move is not a plan either**: the killed row
already carries the observation that refuted it, so reviving it means naming what changed.

## 3. Criteria: what makes a draft executable

A draft is executable only when all of these are present:

| Element | Why it is required |
|---|---|
| **The chosen path**, in one sentence | Otherwise it is a survey, not a plan |
| **The criteria it won on**, named | A choice without criteria cannot be re-examined when it fails |
| **What was rejected and on what grounds** | The next person must not re-explore it by accident |
| **The acceptance criterion**: what result counts as success, and what would count as failure | A plan with no failure condition is a hope |
| **The first concrete step** | Executable means someone can start now |
| **Risks and their fallbacks** | The plan must survive its most likely failure |
| **The declared budget** | Steps, runs, or wall-clock — so stopping is a decision, not an accident |

### 3.1 A plan states its own death condition

Every draft must say what observation would make it wrong. If nothing could, it is not a plan but a
commitment, and commitments do not belong in a research record.

### 3.2 Alternatives are compared, not listed

Two candidates compared on a named criterion is a choice. Five candidates described in sequence is a
reading list. If the criteria were never applied, do not choose yet — apply them first.

### 3.3 Typing survives into the plan

Facts, inferences and undecided items keep their class inside the plan. The step everyone is most
confident about is usually the inference.

## 4. Do vs don't

### 4.1 Do

- Write the draft as a **proposal** and let the owner rule on it
- Keep it short enough to be read in one sitting; link evidence instead of restating it
- Name the cheapest test that would disconfirm the chosen path first

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** paper over it)

| Hit | Action |
|---|---|
| The alternatives were never compared on explicit criteria | Do not choose. Compare first. |
| The chosen path contradicts a ruling | The ruling wins; follow it, or request a new ruling. |
| There is no acceptance criterion | Not executable. A plan without a failure condition is a hope. |
| "Explore further" / "study more" appears anywhere | Rewrite it as a testable step, or delete it. |
| The plan needs a decision that belongs to the owner | Stop and ask; never decide it for them. |
| The draft lists everything instead of choosing | Force the choice; a plan that does everything decides nothing. |
| The plan silently assumes a rejected direction is still live | Point at the rejection; either revive it explicitly or drop the assumption. |
| The chosen path rests on a move the ledger records as `killed` | The killing observation already settled it. Pick a path that survives it, or name what changed about the observation. |
| The chosen path needs a component that no seed supports | That is a `needs-a-move`, not a plan. Send it back to probing, or write the reading it requires as the first step. |

## 5. Wording discipline

- Say "we will do X; if Y appears, we do Z" — not "X seems promising".
- State the **cost of being wrong**, not just the expected gain.
- Never call a path "best" without naming the criterion it is best on.
- Do not convert an inference into a fact by writing it in the plan's imperative mood.

## 6. Report shape

Fixed sections of the executable draft; `Question being answered` is the header line, and `Open items`
is written only while something is undecided:

```text
Question being answered   (header, one line, from the scoping document)
Chosen path               (one sentence)
Why it won                (the criteria, and the alternatives' scores)
Rejected                  (what, and on what grounds)
Acceptance criterion      (what counts as success; what would refute it)
First step                (concrete, startable now)
Risks and fallbacks       (each risk with its response)
Budget                    (steps / runs / time, and the stop condition)
```

**Budget — ≤100 lines.** Past it, link the evidence instead of restating it.

## 7. Instrument discipline (where this skill most easily goes wrong)

- The draft is a **workspace document**, not a memory entry: it is diffable and it will be revised.
- It is a **proposal** until the owner rules; do not present it as settled.
- Link the evidence (paths, keys, cards) rather than copying conclusions into it.
- When the draft is accepted, the rejected alternatives go to the settlement record — the *reason*
  is the part that saves future work.
- Do not re-open an exploration because the plan is hard to write; hardness is information.

## 8. Acceptance checklist

- [ ] The chosen path is one sentence
- [ ] The criteria it won on are named
- [ ] The rejected alternatives and their grounds are recorded
- [ ] The acceptance criterion includes a failure condition
- [ ] The first step can be started without another question
- [ ] Risks have fallbacks
- [ ] A budget and a stop condition are declared
- [ ] Every statement keeps its fact / inference / undecided class
- [ ] Owner decisions were asked, not taken

## 9. Don't

- Do not present a survey of options as a plan
- Do not choose without criteria
- Do not resurrect a rejected direction without saying so
- Do not hide the failure condition to make the plan look safer
- Do not let the plan grow into a specification; that is the next step's job
