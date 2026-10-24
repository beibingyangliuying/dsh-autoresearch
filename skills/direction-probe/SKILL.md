---
name: direction-probe
description: Use when what the record refused, an unchecked precondition, a parked re-open condition, or two disagreeing sources has to become a next step. Turns those positions into candidate moves, each with a conjecture that could fail and the cheapest observation that would kill it. It probes, never rules.
---

# direction-probe — what the record refused becomes the next cheap question

This skill turns the positions a study's own record has already settled — **against** itself — into
candidate moves, each carrying a conjecture that could fail and the cheapest observation that would kill
it. Only when two surviving moves cannot both hold does it compose **directions**: competing answers to that
conflict, each naming which moves it takes, which it drops, and the single new component whose seed it can
point at.

It does not search for literature, explain a section, rule on what may be borrowed, choose a direction, or
run anything.

It exists because the record is read asymmetrically. A study writes down what it **took** and what it
**refused**, and every later round reads the taken half. A refusal is a statement about a **condition**, and
a condition is a question with a cheap answer. "A hyperparameter tuned on another data set is not a
default" is not the end of that item; it is the beginning of "and on ours?", which one sweep answers.

A direction nobody can kill is a preference. This skill supplies the killing criterion — not the candour.

## 0. Which half of this skill runs

| The situation | Which half | What it may write |
|---|---|---|
| A refusal, an unchecked precondition, a `park` condition that has come true, two sources that disagree, a gap, or a ruled item's boundary is reachable and cheap to test | **Part I — mine** | candidate rows: seed · conjecture · killing observation · gates |
| Two or more `surviving` moves cannot both hold, or the owner asks where to go next | **Part II — compose** | direction candidates: the moves taken, the moves dropped, the one new component and its seed |
| It is not clear which | neither: report and ask | nothing |

**Part I is the default, and it is where most rounds stop.** It writes no direction, chooses nothing, and
needs no direction candidate to be useful: a table of six mined moves with one survivor is a finished
round. Part II's criteria (§3.6) and wording (§5) apply **only** while Part II is running.

## 1. When to use

- A paper was read and its adoption ledger now carries a `## Refused` section or a row whose `checked`
  column says `not checked` — the study has a recorded "not like this" and no next step.
- A parked paper's re-open condition has come true, so that verdict is out of date.
- Two sources give the same quantity two values, two regimes, or two definitions.
- A scaling or applicability statement bounds a result to a range our study is outside.
- A `surviving` move list already exists and two of its rows exclude each other (Part II).
- The owner asks "so where do we go from here", with a record behind the question (Part II).

**Not applicable**: reading a paper, or deciding how far to read one (`reading-triage`); explaining a
section (`section-notes`); deciding whether an item may be borrowed and under what condition (that is a
ruling, and it is the owner's); choosing one route to commit to (`synthesis-plan`, which needs this skill's
survivors as its input); running a test (`experiment-protocol`).

**A move is not a hypothesis of record, and a direction is not a plan.** A run's hypothesis is written into
that run's protocol before the run and never revised after it; a move is cheaper — the smallest proposition
worth one observation, which may fail and change nothing else. A direction has no first step, no budget and
no acceptance criterion: committing to one is `synthesis-plan`'s act and the owner's.

**A killed move is not a ruling.** It records that one observation did not support one conjecture. It does
not retire a ruled item, revise a verdict, or settle a question.

## 2. First step: read the ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

Read-only, before writing anything. Paths are relative to the **layer root** — `research/` where that
directory exists, the study root otherwise (protocol §7):

1. **The scoping document** — the question, the boundary, and above all the **non-goals**. A non-goal is
   the cheapest instrument in this skill: a move that serves a declared non-goal is killed by reading one
   line, before any scoring.
2. **The topic's reference ledger** — one row per paper with `grade`, `depth`, `verdict`, `basis`,
   `re-open if`. A `park` row's re-open condition is a seed (`S3`), and it is written in the row.
3. **The adoption ledgers** — the `## Refused` section with its grounds, every item whose `checked` column
   says `not checked`, the `## Gaps` section, and each item's re-open condition. This is the primary input,
   and the one nothing else in the chain consumes.
4. **Existing rulings** — a move that contradicts one is killed, or the ruling is reopened explicitly; it is
   never written around.
5. **The existing direction document**, if the study has one — every `killed` row and its ground. A killed
   move is not re-opened without naming **which ground changed**.
6. **Experiment protocols and cards** — re-proposing an observation the study has already made is how a
   ledger grows a second copy of itself.

Then write the **seed list**: every position above that is reachable this round, grouped by `S1`–`S6` and
counted. **The seed list is what the round is judged on**, and its most informative output is often that a
class is empty — "no refusals, no unchecked preconditions, no disagreement" is a finding about the record.

## 3. Criteria

### 3.1 The unit is a move, not a paper and not a direction

A **move** is the smallest proposition worth one observation, with exactly three parts:

1. the **action or assertion** it commits to;
2. the **quantifier and threshold** that make it falsifiable ("within 5%", "for every N ≥ 10³");
3. the **observation that would kill it** — a command, a run, or a computation over artifacts already on
   disk, with the threshold that separates support from refutation.

A sentence missing any of the three is not a move. "It would be worth looking at the low-N regime" has part
1 and nothing else; it is `[exploratory]`, and it is labelled as one.

### 3.2 Six seeds, one closed vocabulary

| Seed | What it is | Where the locator points | Why it is worth mining |
|---|---|---|---|
| `S1` | a refused item and its ground | `adoption/<recordKey>#A-KEY-03` | the ground states the condition under which the item *would* hold |
| `S2` | an unchecked precondition | that item's `holds when` + `checked: not checked` | the usual reason a correct formula is wrong for us |
| `S3` | a parked paper's re-open condition | the ledger row's `re-open if` | if it holds, that verdict is stale, not merely old |
| `S4` | two sources that disagree | both locators, one per side | a disagreement has three sources — snapshot, definition, regime — and each has a cheap discriminator |
| `S5` | a gap | `## Gaps`, or a section carrying no note | a gap says which input is missing, which is a question about inputs |
| `S6` | the boundary of a ruled item | that item's `holds when`, or the paper's stated limitation | outside the boundary is measured nowhere |

**A move must name one of the six and one specific row.** A conjecture whose seed cannot be pointed at is
`[exploratory]`: it is not carried, it never enters Part II, and the report counts it as such.

### 3.3 The fields every move carries

| Field | What it must carry |
|---|---|
| **ID** | `M-<topic>-NN`, stable, never renumbered. A removed move leaves its number unused and the document says so. Directions use `D-<topic>-NN`: the two ledgers must not read alike. |
| **Seed** | `S1`–`S6` + the path + the row or item it points at |
| **Conjecture** | one sentence, falsifiable, with its quantifier and threshold |
| **What it serves** | the scoping question it answers, and the non-goal it does not cross |
| **Kill condition** | the observation, executable as written, and the threshold that refutes the conjecture |
| **Gates** | the two answers of §3.4, each with one line of why |
| **State** | `candidate` → `killed` / `surviving` / `composed`, with what it hands on |

### 3.4 Two gates, answered before anything is compared

A move reaches Part II only when both answers are **yes**:

1. **Killable** — one command, or one computation over artifacts already on disk, would refute it, and the
   threshold that separates support from refutation is written down. "Would need a run", "would need a
   paper" or "would need a round" is **no**.
2. **Serves** — it answers a named question in the scoping document and crosses no declared non-goal.

A move that fails a gate stays a `candidate` with the failed gate and its reason in the row; it is never
carried into Part II. **A gate is not evidence**: passing it says the move is cheap to test and on topic,
never that it is true, and no move is reported as supported because it passed. A move that duplicates a
ruled item or a killed move is linked and killed, not gated.

### 3.5 Lifecycle, and the rule against running a round twice

- `killed` carries its **ground**: which observation, what it returned, why that refutes the conjecture,
  with the date. A `killed` row without a ground is an assertion wearing a record's clothes.
- A row is **never deleted**. A move killed for a wrong reason is displaced by a new row that names the
  ground it overturns.
- A re-run that changes nothing reports **`already recorded`** and writes nothing.
- `composed` names the direction ID that took it. When that direction is killed, its moves return to
  `surviving` — a move is not killed by the company it kept.

### 3.6 Part II: a direction is a resolution of a conflict, not a wish

Part II runs on **one of two triggers, and both produce the same artifact**:

- **(a) Exclusion.** Two or more `surviving` moves cannot both hold: mutually exclusive actions, two uses of
  the same budget, two scaling claims meeting at one N, one constant carrying two values.
- **(b) The owner asks where to go**, with a record behind the question.

| Field | What it must carry |
|---|---|
| **ID** | `D-<topic>-NN` |
| **The moves it takes** | at least one `surviving` move, by ID |
| **The moves it drops** | by ID, and whose cost the drop lands on |
| **Its one new component** | exactly one, pointing at an `S1`–`S6` seed |
| **How it differs from a rejected direction** | the record that rejected it, and what changed |
| **What would kill it** | the observation that separates it from its rival, not "if it does not work" |
| **What it costs** | time, compute, or an input the study does not have yet |

**Three answers**: `surviving` · `killed` (with its ground) · **`needs-a-move`**. The third is not a failure
and is often the round's most valuable output: the direction needs a component nobody has established, so
it is a request — for a reading, or for a run — and it goes back to Part I or to the literature round.
**Inventing that component here is the one thing this skill must never do**, because a route carrying an
unsupported component has already decided the question it was supposed to test.

### 3.7 Length and shape signal

A Part I round normally lands **three to six moves, one or two surviving**; a Part II round **two or three
candidates, one surviving**. Everything surviving means nothing was killed; everything killed means nothing
was found. Say which one it was rather than adjusting the numbers.

## 4. Do vs don't

### 4.1 Do

- Report the **seed list before any conjecture**: class · locator · count. A class with nothing in it is
  reported as empty.
- Prefer the cheapest kill: one command over one run, one run over one round. A move whose cheapest kill is
  expensive is a finding about that move, written in its cost cell.
- Name the **one** component a direction adds, never two. Two new components is a research programme
  wearing a candidate's clothes.
- Say what losing the move would cost, and what would then be left.
- State which seeds were **not** reachable this round ("the library is not answering", "no adoption ledger
  exists yet") rather than letting the absence read as "nothing to mine".
- Keep the document thin enough that the owner can rule on it in one sitting.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The conjecture has no seed that can be pointed at | Label `[exploratory]`, do not carry it into Part II. |
| The kill condition is "if it does not work" or similar | The move does not stand. Rewrite it as an observation with a threshold, or kill it with that reason. |
| The move crosses a declared non-goal | Kill it, and record the non-goal it crossed. |
| The move contradicts an existing ruling | Kill it, or request that ruling be reopened explicitly. |
| Killing it would require reading a paper | Stop. Name which reading would settle it and hand it back. |
| Killing it would require a run | Stop. Write the one observation into the move and hand it to the run discipline; **nothing is run here**. |
| The missing component is a theorem or a constant nobody has | `needs-a-move`, back to Part I or the literature round. Do not derive it here. |
| The move was killed before | Report the ground that killed it, and the ground that changed, if any. Without a change it stays killed. |
| The owner asks to diverge but fewer than two moves survive | Report that there are no components to compose, and go back to Part I. |
| More than ten moves in one round | This round does the zero-cost screen only; gating waits. Ten is the ceiling, not a target. |
| A direction carries two new components, or none | It is not a direction. Split it into moves, or return it to Part I. |
| The direction's kill condition cannot separate it from its rival | That is a comparison, not a candidate. Do not carry it. |
| A gate is about to be answered from how promising the move sounds | Do not: `kill` needs a command and a threshold, `serves` needs a named question. |
| A direction is about to be presented as chosen, better, or settled | Do not. Selection belongs to `synthesis-plan` and to the owner. |

## 5. Wording discipline

- A conjecture is a sentence with a quantifier and a threshold. "Better use of the structure" is not a
  conjecture; "for N ≥ 10³ the two estimators differ by under 5%" is.
- Never write "promising", "worth exploring", "has a lot of potential". They are the exact words this skill
  exists to replace.
- Every conjecture carries its seed. An unattributed conjecture is a memory with a table around it.
- Killing a move names the observation that killed it. "After evaluation" is not a ground.
- `needs-a-move` is a result. Writing it as a failure is what makes the next round invent the component.

## 6. Report shape

**Artifact** — `<layer root>/directions/<topic>.md`. It states the move ledger as it now stands:

```text
## Record            topic, layer root, which half ran, what triggers it (exclusion / owner asked)
## Seeds             S1-S6 table: class, locator, count (data; a class with nothing is one row, "none")
## Moves             ID · one line · seed · conjecture · kill condition · gates · state · ground
## Directions        (Part II) ID · moves taken · moves dropped · the one new component · the
                     difference from a rejected direction · kill condition · cost · answer
## Refusals          open refusals only, one line each, with a pointer to the reason
```

A killed move stays as one row whose ground names the observation that killed it; it does not get a second
section. `Zero-cost kills` and `Gates` are columns of `Moves`, not headings.

**Budget** — ≤80 lines of prose (tables aside). Past it, cut in this order: evidence restated from its
carrier → a second reason for the same claim → per-object detail a ledger holds → how the statement changed.
Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **There is no new helper for this, and none is needed.** Every input is a file the study already has, and
  the output is one workspace document. This is the only discipline whose whole evidence base is the
  previous rounds' artifacts — if a round needs the library, it is not this round.
- **No paper is read, no full text is loaded, no library is opened.** A move that cannot be written without
  reading a paper is a request to the reading round, written as that request.
- **Reading is a budget.** One topic's ledger rows plus a handful of adoption ledgers is the normal load.
  When it crosses, hand **one topic's adoption ledger** to one read-only child under `subagent-contract`; the
  parent answers the gates, writes the document, and asks the owner. A child writes nothing into the
  direction ledger.
- **One move, one file, one row is the wrong shape**; one document per topic is right, because the owner
  rules on a table rather than on six files.
- **A move that serves two questions is written once**, in the file of the question that first needed it,
  and the other file links to it.
- **Workspace drafts are working files**: no authority, no permission needed to delete.
