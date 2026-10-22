---
name: subagent-contract
description: Hand work to a subagent and receive it back without laundering claims — fix the deliverable before spawning, require artifact paths and the exact command in the return, write reports to files and pass only a pointer, and treat every subagent conclusion as unverified until the main agent re-derives it. Use when spawning an explorer or an implementer, and when deciding whether to accept what one returned.
---

# subagent-contract — what a subagent must hand back

This skill does exactly one thing: make delegated work **auditable**. A subagent is the place where
"claimed but never checked" most easily enters the record, so the contract is asymmetric: the child
produces evidence, the parent produces facts.

## 1. When to use

- Spawning a subagent to explore a direction, or to write or run code
- Receiving a subagent's report and deciding whether to accept it
- Deciding between `subagent` (independent context) and `subagent_fork` (inherits this conversation)

**Not applicable**: a task small enough to do inline. Delegation costs a round trip and loses
context; see §9.

## 2. First step: fix the deliverable before spawning

Write the request as a contract, not a wish. Before spawning, decide:

1. **What file must exist when it returns** (a note, a card, a script, an artifact).
2. **What command proves it ran.**
3. **What it must NOT touch** (read-only inputs, other people's documents, the baseline).
4. **What would make its answer wrong** — the check it must run on itself.

A request without a deliverable produces a paragraph of prose that cannot be checked.

## 3. Criteria: what a return must contain

| Required | Why |
|---|---|
| **Artifact path(s)** | Without a path there is nothing to inspect |
| **The exact command** | So the parent can re-run it |
| **What was observed, as numbers** | "It works" is not an observation |
| **What was NOT done** | The boundary of the claim; omissions are the usual source of false confidence |
| **Anything that surprised it** | Cheap, high-value signal |

### 3.1 Reports go to files; the message is a pointer

A tool result over 8,192 characters is rewritten to its first 4,096 and last 1,024 **when the context is
compacted**, so a long inline report cannot be read back afterwards; and one command's output is capped
by the shell before that — `dsh-tool-pwsh` keeps the **last 64,000 bytes** of a stream (measured on DSH
0.2.1-rc.2) and drops the beginning, so an oversized report loses its **start**, not its middle. Require
the child to write its report to a file and return only: `path + one-line conclusion + the command`.

### 3.2 A subagent's conclusion is `[unverified]` until re-derived

The parent turns it into a `fact` only by **reading the artifact itself** (or re-running the
command). Repeating the child's sentence in the parent's own voice is exactly the laundering this
skill exists to prevent. If it cannot be re-derived, it stays attributed: "the explorer reported X
(unverified)".

### 3.3 Independence is a property of the context

For a challenge, the child receives the **claim and the conclusion**, never the author's reasoning
chain — that is what makes the opposition real rather than a restatement (`redteam-ruling` §7). Use
`subagent` (spawn) for that; `subagent_fork` inherits this conversation and is therefore **not**
independent.

### 3.4 One child, one deliverable

Extra claims a child volunteers are separate items with their own evidence. Do not absorb them into
the original deliverable's verdict.

## 4. Do vs don't

### 4.1 Do

- Name the child's scope explicitly and keep it narrow
- Ask for the **negative** result too ("what did you try that failed")
- Keep the child's own words for its claims; attribute, do not paraphrase into certainty

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** accept it)

| Hit | Action |
|---|---|
| Return has no artifact path | Not accepted. Ask for it, or discard the conclusion. |
| Return is long and inline | Require a file; the middle is already being truncated. |
| Return says "done" with no numbers | Not a result. |
| The child touched something outside its scope | Stop, audit what changed, record it as a pitfall. |
| The child silently re-scoped the request | Record the disagreement as a finding; do not accept the substituted deliverable. |
| The child's claim contradicts the artifact you read | The artifact wins. Record the discrepancy. |

## 5. Wording discipline

- Never write "we verified" when only a child ran it and you did not inspect the artifact.
- Keep attribution visible: "child R reported …"; "I read `path` and it says …".
- Do not upgrade a child's `[exploratory]` into an `inference` by restating it more confidently.

## 6. Report shape

**Request** (what you send): deliverable · command to prove it · forbidden zones · self-check.

**Return** (what you require): `report path` · `artifact paths` · `exact command` ·
`observed numbers` · `not done` · `surprises` · `own confidence and why`.

The parent then writes the accepted part into the study's record through `progress-sync`, keeping
the attribution.

## 7. Instrument discipline (where this skill most easily goes wrong)

- `subagent` = independent context (use for challenges and for work that must not inherit your
  assumptions); `subagent_fork` = inherits this conversation (use when the task depends on it).
- Continuable children can be woken with `send_message`; stop one with `interrupt_agent`; never leave
  a child running unnoticed.
- Long experiments inside a child are still experiments: `experiment-protocol` applies to the child
  too, and its cards land in the same `<layer root>/experiments/` (`research/` where the study has one,
  else its root — protocol §7).
- **Budget the round trip.** Give the child a reading budget along with its deliverable, and require the report as a file. A child that returns everything it read has spent the parent's context, which is the opposite of the point.
- Do not let a child write outside the workspace, or to a read-only input.

## 8. Acceptance checklist

- [ ] The deliverable was fixed before spawning
- [ ] The return carries artifact paths and the exact command
- [ ] Observed numbers are present, not adjectives
- [ ] "Not done" is stated
- [ ] Long reports arrived as files, not inline
- [ ] Every accepted claim was re-derived by the parent, or is still marked `[unverified]`
- [ ] Attribution survives into the study record

## 9. Don't

- Do not delegate the main line of work merely to save context; delegation is for genuinely
  independent work, not for offloading the critical path
- Do not accept a conclusion because it is convenient
- Do not paraphrase a child's uncertainty into the parent's confidence
- Do not spawn a child without saying what file must exist afterwards
