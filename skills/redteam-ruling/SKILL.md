---
name: redteam-ruling
description: Use before a plan is committed to, before a conclusion leaves the room, or when two routes conflict. Produces a ruling request that points at one sentence, supplies a counterexample, contradicting evidence or a falsification path, and ends in falsified, insufficient evidence, or outside scope.
---

# redteam-ruling — structured challenge and ruling request

This skill does exactly one thing: raise a **testable** objection to a claim and write it up as a file that **asks someone else to rule**. It does not issue the ruling.

## 1. When to use

- A claim has formed and work or publication is about to rest on it
- Two mutually exclusive routes need a decidable point of disagreement
- The stakes are high (the claim will enter a normative document, consume compute, or be handed to someone else)

**Not applicable**: the claim has not formed yet (use `research-scoping` first); it is merely a wording disagreement (that is an editorial matter, not a scientific challenge).

**On demand, never a step in reading.** Reading a paper, writing a section note, or producing a routine
result does not trigger this discipline; it exists for the moment a formed claim is about to carry work
or leave the room. With no formed claim, load nothing — and an unused challenge costs nothing, because
it is not in the request.

## 2. First step: read the thing being challenged as a ruler

1. Read the **claim as written**. Never challenge a paraphrase or a summary.
2. Check whether the workspace already has a naming and location convention for rulings or audit documents (if so, **follow it**).
3. Establish the **input boundary** of this challenge: what I received and what I did **not** receive (for example: the conclusion only, without the reasoning chain).

Write the result up as a "ruler" list — §3.4 needs it for the independence statement.

## 3. Criteria: what counts as a valid challenge

### 3.1 At least one of three

| Type | Requirement |
|---|---|
| **Counterexample** | Concrete and reproducible; state why it conflicts with the claim |
| **Contradicting evidence** | Locatable (file path / literature identifier); state which sentence it contradicts |
| **Testable falsification path** | State "what to observe, and which result would mean the claim is wrong" |

If none of the three can be given, apply §4.2. **Do not** pad with empty phrases.

### 3.2 It must point at a specific sentence

Quote the **original sentence** and say which word or which inference step is the problem. A challenge aimed at a whole direction is void.

### 3.3 It must conclude with one of three verdicts

`falsified` / `insufficient evidence` / `outside current scope`. They may not be blurred together.

### 3.4 It must declare its own independence and limits

State what was received, what was not, and therefore which parts the challenge **cannot reach**. If independence is weak, say so.

## 4. Do vs don't

### 4.1 Do

- Challenge **one** claim at a time
- Make each objection its own item, each carrying evidence or a falsification path
- Keep "the claim is false" separate from "the claim is not adequately supported"

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** force it)

| Hit | Action |
|---|---|
| The only output available is "should be studied further / worth exploring" | Exclude it, and report **"unable to challenge"**. That is an honest conclusion, not a failure. |
| The objection points at no specific sentence | Send it back to be rewritten. |
| It is only a disagreement about wording or structure | Classify it as wording, not as a scientific challenge. |
| The objection depends on private information the author never provided | Mark it **undecidable**; do not speculate about what the author was thinking. |
| The red team produces a new claim of its own | Raise it as a **separate claim**; never smuggle it in as a counterexample. |
| The real objection is a data or compute limitation | Classify it as "outside current scope", distinct from "the claim is wrong". |

## 5. Wording discipline

- **Forbidden**: "may be problematic", "arguable", "not rigorous enough", "yet to be verified" — all undecidable.
- Always give a **reachable test**: who, with which data, seeing which result.
- Never personalise ("the authors ignored", "clearly did not consider"); discuss only the claim and the evidence.
- Never write "I found no counterexample" as "the claim holds".

## 6. Report shape

**Artifact** — `<layer root>/rulings/ruling_<target>_<YYYYMMDD>.md`, where the **layer root** is
`research/` if the study has one and the study root otherwise (protocol §7).

1. `## Claim under challenge` — the **original sentence, quoted**, plus its source
2. `## Objections` — one row each: the sentence it targets · the evidence or falsification path (the
   locator) · its strength. The locator column is the evidence list; the same paths are not listed again
3. `## Candidate verdicts` — `falsified` / `insufficient evidence` / `outside current scope`, one line
   each with its reason

**One line each** — `Independence and limits` (what was received, what was not, what cannot be reached)
and `What I do not claim` (no improving the claim, no designing experiments for the author, no issuing
the ruling).

**Budget** — ≤100 lines. Past it, cut in this order: evidence restated from its carrier → a second reason
for the same claim → per-object detail a ledger holds → how the statement changed. Never cut the
load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- The red team must be an **independent subagent** (`subagent`, spawn): it receives "the claim as written + the conclusion" and **not** the author's reasoning chain. Only then is the opposition real rather than a restatement.
- **Do not modify the claim or any existing document**; only add the ruling-request file.
- Do not "just fix it" along the way — revision belongs to the author, the ruling belongs to the human.
- If the input is insufficient for a valid challenge, output "unable to challenge" and state what is missing.

## 8. Acceptance checklist

- [ ] At least one of counterexample / contradicting evidence / falsification path is present
- [ ] Every objection points at a specific original sentence
- [ ] One of the three verdicts is given
- [ ] Independence and unreachable scope are declared
- [ ] "What I do not claim" is written
- [ ] No existing file was modified
- [ ] No undecidable filler wording appears

## 9. Don't

- Do not improve the original claim on the author's behalf
- Do not issue the final ruling (that belongs to the human / the main agent)
- Do not write experiment or implementation plans
- Do not use "should be studied further" style wording
