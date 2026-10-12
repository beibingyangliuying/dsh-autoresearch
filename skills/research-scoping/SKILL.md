---
name: research-scoping
description: Turn a vague topic into a decidable research question — produce "question / boundary / non-goals / decidability / prerequisites / notation / open items", and reject pseudo-questions on the spot (no falsification condition, a method disguised as a question, an old symbol reused for a new meaning). Use when starting a study, when a topic is vague, before committing to work, or to settle "what would count as answering it".
---

# research-scoping — converge a topic into a decidable research question

This skill does exactly one thing: turn "an idea" into "a question that can be answered or falsified", and **send pseudo-questions back on the spot**. It does not design experiments and does not write literature reviews.

## 1. When to use

- Starting a study, when the user gave only one sentence, a direction, or a pile of material
- Several possible questions are competing inside the topic and it must converge to 1–3
- Before committing to work, to settle "what would count as answering this"
- A "question" keeps being discussed but never acquires a falsification condition

**Not applicable**: the question is already settled and only execution remains (that is a downstream stage).

## 2. First step: read the existing constraints as a ruler

Do a **read-only survey** first (`glob` / `grep` / reading files). Never rely on memory:

1. Does the workspace already have a document hierarchy and an authority order (what is normative, what is an exploratory note, what is archived)?
2. Has a similar question been asked or rejected before? What was the reason for rejection?
3. What hard constraints already exist (data availability, compute, time, domain invariants)?

Write the result up as a **"ruler" list** — it is the input to §3.

> **Forbidden**: asserting "nobody has done this" or "this is entirely new" before searching.

## 3. Criteria: what counts as a scientific question

Check every item; if any one fails, send it back:

1. **Falsifiable**: you can state "if I observe this result, I will consider it falsified".
2. **Not a method**: "study Y using method X" is not a question. A question must be "is Y so / under which conditions / through which mechanism".
3. **Bounded**: the physical/mathematical/data boundary is explicit; anything outside goes into non-goals.
4. **Decidable**: you can state "what counts as answering it", and that criterion **does not depend on a metric that does not exist yet**.
5. **Nothing smuggled in**: no undeclared weight, threshold, score, or classification. Those belong to downstream design, not to the question.
6. **Clean symbols**: a new concept gets a new symbol; **never reuse an old symbol for a new meaning**. If the project has a notation table, check it item by item.

## 4. Do vs don't

### 4.1 Do

- Split the user's sentence into 1–3 **independent** candidate questions
- For each candidate give: a one-sentence statement / its falsification condition / which prerequisites it needs

### 4.2 Local exclusion conditions (if any one hits, send it back on the spot — do **not** try to make it work)

| Hit | Action |
|---|---|
| No falsification condition can be found | It is a **direction**, not a **question**. Label it a direction and return it. |
| The answer depends on a quantity that is not defined yet | Define it first, or downgrade it to an "open item". |
| The required data/asset is demonstrably unavailable | Return it, unless the user explicitly accepts a study premised on its unavailability. |
| It is existing work under a new name | Return it, and give the path to the existing work. |

## 5. Wording discipline

- **Forbidden**: "study further", "explore in more depth", "of great significance", "promising" — all unfalsifiable.
- **Three-way typing is mandatory**: `**fact**` (evidence-backed, reproducible) / `**inference**` (reasoning chain but unverified) / `[exploratory]` (unverified and undecided). Mark every statement in the document.
- Scope words ("some", "may", "most") must be quantified or explicitly marked as undecided.
- Never write a hypothesis as a conclusion; never write "I found no counterexample" as "it holds".

## 6. Report shape

Seven fixed sections, **in this order** (later skills and reviewers cite them by section):

1. `## Question` — one-line positioning + 1–3 candidates
2. `## Boundary` — what is in scope
3. `## Non-goals` — **at least 3**, each with "why not now"
4. `## Decidability` — each candidate's falsification condition and "counts as answered" criterion
5. `## Prerequisites` — what is needed, what exists now, what is missing
6. `## Notation` — symbols used by this study and their definitions (**every new symbol is registered here**)
7. `## Open items` — undecided questions, all marked `[exploratory]`

Start the file with a one-line summary (≤5 lines): the question + the suggested first action.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Every "has this been done" judgement must come from a **read-only search** and cite a **file path**. Never from memory.
- **Do not modify any workspace file** except the artifact this skill produces.
- If the workspace already has a document hierarchy (directory convention, authority order, archiving rules), **follow it**: put the artifact where it belongs; do not create a parallel structure and do not rename existing directories.
- The default location `<workspace>/research/00_scoping.md` is used **only when the project has no existing convention**.

## 8. Acceptance checklist

- [ ] Every candidate question has a falsification condition
- [ ] Non-goals: at least 3, each with a reason
- [ ] No undeclared weight / threshold / score anywhere
- [ ] New symbols registered; no old symbol reused
- [ ] Three-way typing complete
- [ ] Every "has this been done" judgement carries the path it came from
- [ ] If the project has an existing document hierarchy, the artifact location follows it

## 9. Don't

- **Do not choose the study for the user**: ranking candidates and advising is fine, but the choice is theirs; confirm decision points item by item with the question tool.
- Do not write experiment or implementation plans (downstream)
- Do not write literature review prose (that is `literature-recon`)
- Do not introduce domain-specific conclusions; domain constraints come from the project's `AGENTS.md`
