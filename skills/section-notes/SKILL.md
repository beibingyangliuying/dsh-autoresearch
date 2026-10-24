---
name: section-notes
description: Use when method-section notes arrive from outside, when a record must say which sections still carry no note, or when the owner names a section to have a body written. Claims a pasted note to the section its heading names, as a tag and never a body edit, and reports the gaps.
---

# section-notes — keep a paper's record section-addressable

This skill does one thing on one record: it keeps a paper's **method sections** addressable, one
durable explanation per top-level section. Most rounds only claim explanations that already exist and
name the sections still missing one; a note body is written from the paper only when the owner asks for
that section. It is not a summary of the paper, not a reading record, and not a review prose exercise.

It exists because a paper's value to a study is concentrated in two or three of its sections. A note
that explains Introduction and Numerical results costs the same to write as the one that explains the
derivation, and a later round pays the same cost to read it. **The head and the tail are cut off on
purpose.**

## 0. Which half of this skill runs

This skill has two halves, and **the request decides which one runs**:

| The situation | Which half | What it may write |
|---|---|---|
| A record carries notes pasted in from outside — a browser, a chat model, another editor | **Part I — claim and report** | a `/section-N` tag on a note that already exists, and nothing else |
| The owner names a section and asks for a note to be written from the paper | **Part II — generate** | one new note body for that section, or a rewrite of an **import** or an **agent draft**; every body it writes carries `/agent-note` |
| The owner asks to correct an error in an existing note — a mis-transcribed symbol, a broken formula, a citation that no longer resolves | **Part II — repair** | the corrected body **in place**, under `--repair`: `/repaired` is added, and `/reviewed` is cleared when a symbol, a number or an equation changed |
| It is not clear which | neither: report and ask | nothing |

**Part I is the default, and it is where most rounds stop.** It writes no note body, never rewrites,
merges, retires or reformats an imported note, and never opens the paper's PDF. Its rules are §2 and
§2.1, its report is §6.1, its checklist is §8.1. Part II's criteria (§3), wording (§5) and generation
checks (§8.2) apply **only** while Part II is running. A repair is Part II's smallest act: it changes
how the note states something, never what it claims, and it keeps the note's key, its section and its
provenance.

A claim is a write to the reference library: one note per invocation, dry run first, under the owner's
authorization (`INV-EVID-3`). The report states how many tags the round wrote.

## 1. When to use

- **Default — the record carries notes pasted in from outside** (a browser, a chat model, another
  editor), with no claim, and the study needs to know which top-level sections they cover and which
  still carry none. This is **Part I**: claim what names its section, report the gaps, write nothing.
- **The owner names a section and asks for a note** to be written from the paper, because that
  section must be understood durably (a method you may build on, a derivation you must reproduce, a
  factor you need the exact definition of). This is **Part II**.
- **The owner asks for a section to be explained again**, because the note that claims it explains it
  badly or its formulas are unreadable. This is **Part II** as well.
- **A record carries a transcription error** — a symbol the paper does not use, a formula whose
  delimiter broke, a citation that resolves to nothing — while what the note claims still holds. This
  is **Part II — repair**: correct the text in place and keep the note, its claim and its provenance.

**Not applicable**: deciding whether a paper is worth reading to its end — that is a per-question
judgement made section by section and recorded in the topic's ledger (`literature-recon` appends the
candidate and screens it; how far a paper is worth reading is a reading round's call, not this skill's),
a topic-level literature note (also `literature-recon`), or a one-off "what does this section say"
question that nothing later will depend on.

**A section note is not the reading record.** The reading record is the topic's ledger row: `depth`
says how far the paper was read, `verdict` says why it stopped, `grade` how firmly we may speak about
it. The section note explains one section.

**A claim is not a reading either.** Claiming an imported note records that a section has an
explanation attached; it does not mean this session read the paper. A claim round never writes a
`depth` for that paper — the note's provenance is the `/imported` tag, and the ledger's reading row
stays exactly as it was.

## 2. First step: read the current state

Read-only, before claiming or writing anything:

1. **The record's own state**: `{{presetTools}}/zotero-section-note.mjs --item <recordKey>`. It prints
   every child note with its **tags** and **first paragraph**, then five lines:

   | Line | Meaning |
   |---|---|
   | `covered` | what live `/section-N` tags claim, per top-level section |
   | `retired` | notes marked `/retired` (tombstones), each with the note that names itself its successor |
   | `legacy` | a whole-paper summary an earlier version tagged `/digest`; never a section note, never written now |
   | `unknown` | notes with no `/section-` tag; **read these** |
   | `ambiguous` | notes carrying more than one `/section-` tag; **read them, then remove the stale tag** — `--unclaim --note <key> --section <ordinal>`, one tag per command |

   **The tool does not parse prose.** A note is coverage only if it carries `/section-N`; a note
   without one is `unknown`, and the judgement is yours. The tool's `covered` line is a claim about a
   tag, not about the note's content.

   A note carrying `/repaired` was corrected in place: its claim and its provenance are what they
   were, and when the correction touched a symbol, a number or an equation it no longer carries
   `/reviewed`, so it reads as a draft and supports no more than a candidate.

2. **Read every `unknown` note before claiming or writing.** Take its first paragraph from the plan; open the whole
   note with `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000` when the paragraph is not
   enough. Then make one of four moves:

   | What the note is | Move |
   |---|---|
   | a usable explanation of §N, in any format | `--claim --note <key> --section N` — only tags are written; the body is untouched; a note with no section tag also gets `/imported`, unless it already carries `/agent-note` |
   | about §N but needs our format or prose | `--rewrite --note <key> --section N --file <draft>` — dry run first; no backup is written |
   | wrong, junk, or in the way | `--retire --note <key> --reason "<why>"` — a tombstone; it may be erased later with `--delete --write` |
   | a whole-paper summary, or not a section note | **leave it.** It is not a section note and must not be claimed for one. A note an earlier version tagged `/digest` is this case: the plan lists it as `legacy`, and it is never claimed for a section |

   **In Part I only three moves exist**: `--claim`, `--unclaim` on an **ambiguous** note (a tag
   mistake, resolved by removing one tag), and *leave it*. `--rewrite` and `--retire` are Part II
   moves, taken only when the owner asks for a section. An ambiguous note claims nothing, so resolving
   it is what makes the record's other notes claimable again; a note that carries **one** tag is a
   claim and is never unclaimed here.

3. **State the coverage table before any claim or write.** One line per section you are considering: the paper's
   own ordinal and heading · the note key that already covers it, or `none` · what it was judged on.
   Where your reading disagrees with a tag, report both and **stop** — a wrong tag is the owner's to
   settle, not something to write around.

4. **(Part II only) One existing section note as the ruler**, when the library has any:
   `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000`. The note's shape — where the
   heading line sits, how equations are delimited, how the closing summary reads — is the convention
   this skill follows. **An existing convention outranks the template below.**

5. **The paper's own section boundaries** — both halves need this list: Part I checks a claim's
   ordinal against it, Part II reads within it. Ask
   `{{presetTools}}/zotero-pdf.mjs --item <recordKey> --outline` first: where the file carries the
   paper's own table of contents, the section list and its ordinals come from there. Where it carries
   none, pull the text in slices and find the headings, or locate one with `--grep`. Either way, **write
   down the heading line and its ordinal as you find them**: the heading is what the write step is keyed
   on, and section numbering is often unreadable in a scanned paper.

Nothing about a paper may be written from memory. A section note whose content was not read in this
session is a fabrication with a citation attached.

### 2.1 Part I — the claim decision, and how narrow it is

A claim says "this section is explained by this note". It is cheap to make and expensive to get wrong:
a claimed section is refused to every later create (`REFUSED: §N is already covered - note <key>`),
and a study that adopts from that note cites the wrong section without ever re-reading the paper
(`INV-ADOPT-2`). Where the note's own section cannot be established, the claim waits for the owner.

| What the note's own text says | Move |
|---|---|
| names a top-level section, and the ordinal agrees with the paper's own section list — or, where the file carries no outline, with the notes' own consistent ordinal sequence | `--claim --note <key> --section N` |
| names a section, but the ordinal disagrees with the paper's own list, or two notes claim the same ordinal | **do not claim.** Report both and stop |
| carries no section number, or carries more than one | **do not claim.** Report it |
| is a whole-paper summary rather than one section | **do not claim.** Report it; a `/digest` note is this case, and the plan calls it `legacy` |
| the notes' ordinals are not a consistent sequence (duplicates, a title naming a different section, or no ordinals at all) | **claim nothing.** Report the headings found and ask |

Two conditions ride on the same decision:

- **The note's own first block is what is judged, and only what section it explains.** Part I asks
  whether the note *is* an explanation of §N, never whether it is a good one. Open the whole note with
  `{{presetTools}}/zotero-read.mjs --item <noteKey>` only when the first block cannot settle which
  section it explains.
- **`--section N` takes the paper's TOP-LEVEL ordinal**, the one the paper itself uses. A note keyed
  to `§3.1` is not a claim on §3; Part I reports a subsection note rather than folding it in.

**Where the paper carries no outline, the list is the notes' own titles, and that is a weaker check.**
Measured on one library, 11 of 20 papers carried an outline and 9 did not (`zotero-pdf.mjs --outline`),
so this case is common rather than exceptional: claim against the notes' consistent ordinal sequence,
and say so in `## Coverage` — "ordinals from the notes; the file carries no outline" — so a later round
knows what the claim rested on.

## 3. Criteria (Part II — generating a note)

### 3.1 Which sections get a note

Decide from **what the section contains**; position is the check, not the rule.

| The section contains | Note? |
|---|---|
| Model formulation, derivation, method/methodology, algorithm, proof, assumptions, an index or factor being defined, a sensitivity being derived | **Yes** |
| One factor per section in a factors paper (§2 … §7 each deriving its own) | **Yes — one note each** |
| Abstract, Introduction, background, literature review, related work, motivation, nomenclature | No |
| Case study, numerical results, experiments, test system, validation, simulation, discussion, conclusions, appendix, references | No |
| Nothing that defines or derives anything — a survey or review paper | **None.** Report "no method section" and stop. |

If you are about to write a note for the **first** section, or for the **last two**, say in one line
why that section is method rather than background or results. Being wrong here is the whole failure
mode this skill exists to prevent.

**This round explains the section it was asked for, not the paper.** A section the owner did not name
gets no note, and a round asked for one section may stop inside it: the coverage table says which
sections carry a note, and the report says which ones were not reached rather than "no note was
needed". Where a reading round stopped short of a section, that question's ledger says so — `depth`
where the reading stopped, `verdict` why. **An absent note is not evidence that a section was read.**

### 3.2 What one note contains

1. **A heading line** naming the section by ordinal **and** by the paper's own title, translated if the
   note is not in the paper's language. A note has no title field in this library — measured here, a
   `title` patch on a note answers HTTP 500 while a `tags` patch on the same note answers 204 — so the
   section is named by that first line and by the `/section-N` tag, the tool does not attempt a title,
   and the child-note list shows an untitled note.
2. **The section's core, in two to four sentences**: what problem it solves, by what means, and what it
   establishes.
3. **Subsections mirroring the paper's own numbering** — do not re-invent a structure the paper
   already has. This is about headings **inside** one note; it is not a licence to write a note per
   subsection.
4. **Every equation worth keeping**, with the paper's own equation number cited in prose where the
   paper gives one ("公式 (40)"). Inline math is `$ … $`. **Display math is `$$` alone on a line**, the
   expression on its own line, and `$$` alone again — never all on one line:

   ```html
   <p>$$
   \Delta Q = J_R\,\Delta V
   $$</p>
   ```

   No equation is reproduced without its symbols defined at first use.
5. **A closing summary** — its own small heading — naming the section's contribution and what it hands
   to the next section.

**Shape, as a filled example** — every value in it is a value a note of this kind actually carries:

```html
<p>文章第 2 节标题是 <strong>“Model formulation”（模型表述）</strong>。这一节的核心是：定义一组变量，
给出它们之间的关系，并说明每个量的量纲。下面分两部分解释。</p>
<hr>
<h2>2.1 定义</h2>
<p>其中 $x$ 是自变量，$y$ 是因变量；每个符号第一次出现时给出含义。</p>
<p>$$
y = f(x)
$$</p>
<p>上式即原文「公式 (12)」。</p>
<h2>小结</h2>
<ol><li>本节给出变量的定义与量纲。</li><li>下一节给出该关系的求解方法。</li></ol>
```

**Write values, not angle brackets.** A placeholder that reads like content gets copied as content:
measured twice in this discipline's own rounds, a child wrote the literal `&lt;2&gt;` from a template
into a finished note. If you are about to type `<...>` into a note, you have mistaken the advice for the
artifact.

**Length is a signal, not a cap.** Most notes land between 1,500 and 5,000 characters. Much above that
is usually the case study leaking in; much below it usually means the section was not read. Say which it
is in the report — and **never split a section to stay inside that range**.

### 3.3 One note per top-level section, and the claim is a tag

**The unit is the TOP-LEVEL section, and one section is one `/section-N` note.**

- **`--section 3.1` is refused.** There is no subsection write, and no dotted tag is read. A note from
  an earlier round keyed to `3.1` shows up as `unknown`; read it, merge what it says into the top-level
  note, and retire it. Do not create a second note for the parent while the dotted note still exists.
- **Create refuses a claimed section.** The tool prints `REFUSED: §N is already covered - note <key>
  claims §N`. Do not work around a refusal.
- **`--claim` is how an existing note enters coverage.** It writes `/section-N` and leaves the body
  alone; a note that had no section tag also gets `/imported`, unless it is an `/agent-note`. A claim
  is a durable statement that a later round can check; a note left unclaimed is read again every round.
- **Four classes, and the tags say which.** The class is what decides whether a body may be replaced
  in place:

  | Tags on the note | Class | Rewritten in place? | Repaired in place? |
  |---|---|---|---|
  | `/section-N` + `/imported` | an import the owner pasted | yes | no — rewrite it |
  | `/section-N` + `/agent-note` (no `/reviewed`) | an agent draft | yes | no — rewrite it |
  | `/section-N` + `/agent-note` + `/reviewed` | a record the owner accepted | **no** | **yes** — mechanical keeps `/reviewed`, substantive clears it |
  | `/section-N` alone | the owner's record | **no** | **yes, mechanically only** |

  A note carrying both `/imported` and `/agent-note` is an import an agent rewrote: it stays
  rewritable, and its provenance is `agent`, because the prose is the agent's now.

  **A body this discipline writes carries `/agent-note` from the moment it is created.** The tool adds
  it and the read-back asserts it; a rewrite stamps it too, because the body is now an agent's prose.
  `/reviewed` is written only by `--review --note <key>`, after the owner says the body is right; it is
  a tag and never a body edit. A note created as an agent draft never receives `/imported`, and a
  claim never adds it to one: calling an agent's own body an import would say the wrong thing about
  where it came from. A rewritten import keeps the mark it had, because that mark records the text it
  replaced.
- **A wrong note is retired, never rewritten.** When a note explains its section
  badly enough that the section has to be explained again:
  `{{presetTools}}/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>"`. Its body is left
  exactly as it stands, a `/retired` tag makes it a tombstone rather than coverage, and the section
  becomes writable again. The replacement is then written with `--replaces <retiredNoteKey>`, which
  the tool refuses unless the retired note really is retired and really did explain the same top-level
  section. `--retire --undo` puts the claim back. **Deleting is a separate act**: only a `/retired`
  note is eligible, `--delete` prints the plan and the irreversibility facts, and `--write` erases it
  permanently — the channel has no trash. Do not delete what you have not read and retired.
- **A note an earlier version tagged `/digest` is not a section note.** It is a whole-paper summary;
  the plan lists it as `legacy`, it is not counted as coverage, and it is never claimed for a section.
- Notes are created in section order, so the record reads in the order the paper reads.

### 3.4 Writing a body is the agent's work; there is no tidy

- **There is no `--tidy` and no automatic math repair.** Writing a note is the agent's job. A tool that
  rewrote a formula because it looked like LaTeX was making a content decision while claiming to format
  one. The old mechanical rules are gone.
- **`--rewrite` is for an import or an agent draft**: a note with no `/section-` tag, `/section-N` +
  `/imported`, or `/section-N` + `/agent-note` without `/reviewed`. It replaces the body with the draft
  the agent wrote, after a dry run and under a version guard, and stamps `/agent-note`. The note's key
  does not change, and no workspace backup is written: a section note transcribes the paper, the paper
  remains the source, and the plan prints the old first block before the write. If the note changed in
  the application while the draft was being written, the tool refuses rather than overwrite it.
- **A record is not rewritten in place, and it may be repaired.** An owner's note and a reviewed agent
  note are records. `--repair --note <key> --file <body> --reason "<why>"` corrects one without
  replacing it: the key, the claim and the provenance stay, `/repaired` is added, and the plan prints
  the old and new first blocks with the reason. **Declare the class**, exactly one of:
  - `--mechanical` for a correction that changes no symbol, number or equation — a misspelling, a
    broken delimiter, a citation that resolves to nothing. It keeps `/reviewed`.
  - `--substantive` for one that does change a symbol, a number or an equation. It clears
    `/reviewed`, so the body reads as a draft until the owner accepts it again.

  The tool refuses `--mechanical` when the change carries a digit, falls inside `$…$`, or rewrites
  more than half the body, and it reports which one it saw. **A record the owner wrote is repaired
  mechanically only**: no tag records the owner re-accepting a changed statement, so a substantive
  correction there is a retirement and a replacement, or the owner's own edit in the application.
  Anything that changes what the note claims is a retirement and a replacement too — that is the line
  between a repair and a revision. `--review --note <key> --undo` is the way back to a draft when the
  owner withdraws their acceptance; it changes a tag, never a word.
- **The formula shape is the agent's responsibility**: `$…$` inline, `$$` alone on its own lines for
  display, every symbol defined at first use, the paper's own equation number in prose. If the text
  layer is unreadable, climb the reading ladder and read the rendered page as an image (§7) before
  writing the formula.

## 4. Do vs don't

### 4.1 Do

- Report the section list **before** writing: ordinal, the paper's own heading, and note / no-note with
  the reason for each.
- Read every `unknown` note before claiming or writing; say which ones you claimed, rewrote, or retired.
- Prefer **repairing** a record to replacing it when the claim did not change: one note stays one note,
  and a later reader can see the correction as `/repaired` rather than reconstructing two notes.
- Keep one note per top-level section, and name the section by the ordinal the paper itself uses.
- Say which attachment the text came from, and how many characters of it were read.
- Say which notes are agent drafts and whether the owner has reviewed them. An unreviewed
  `/agent-note` is a candidate-grade draft, and `adoption-ruling` may rest no more than a candidate
  on it; do not let a report call one "the note on §N" without that word.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

**These are Part II conditions unless a row says otherwise.** A claim round does not care whether the
record carries an attachment: it reads the notes, not the paper. Two rows belong to both halves — an
`ambiguous` tag, and a note that already claims the section.

| Hit | Action |
|---|---|
| The record has no PDF/EPUB/HTML attachment, or the library has not indexed it | Report "no readable text"; write nothing. The note is not owed from the abstract. |
| The section is already claimed — the plan says so, **or your reading of the notes says so** | Report "already covered by note `<key>`" and skip it. Never create a second note for one section. |
| A note carries two `/section-` tags (`ambiguous`) | Read it, then remove the stale one: `--unclaim --note <noteKey> --section <ordinal>` (dry run first; one tag per command). If you cannot tell which tag is stale, report both and **stop** — do not write while coverage is ambiguous. |
| An `unknown` note explains §N | Claim it (`--claim`) — both halves act here. Part II may rewrite it if it needs our format; do not write a second note beside it. |
| A note is a subsection-keyed note from an earlier round | Report it. Part II merges its content into the top-level note and retires it; Part I only reports it and claims nothing on the parent. Never create a note for the parent while it is there. |
| The paper is a survey/review with no derivation anywhere | Report "no method section". Do not force a note onto a background section. |
| The section boundaries cannot be established from the text | Report the headings you did find and **stop**; ask. A note keyed on a guessed ordinal collides with the real one later. |
| The section is a case study, a results table, or a conclusion | Do not write it. Say it was skipped and why. |
| The note runs long — well past the 5,000-character signal | Cut the case-study material and the restatement of the abstract, not the derivation, and say in the report that the section's method content is long. **Never split the section.** |
| The section is claimed by a note that is **wrong** | **Retire it** (`--retire --note <noteKey> --reason "<why>"`), then write the replacement with `--replaces <noteKey>`. Never edit its prose; deleting it is a separate act, allowed only once it is retired. |
| The text layer is unreadable, or a formula only exists in the image | Read the rendered page as an image (`--render` + `read_image`); say which rung answered. Do not trust the text layer for mathematics. |
| A create is refused because the record carries `unknown` notes | Read them first. If none explains the section, `--acknowledge-unknown "<what you read, and why none covers §N>"` is the only way past the refusal — never claim "no note exists" from `covered: none`. |
| The section is claimed by an **unreviewed agent draft** | Report it as a draft, not as the owner's note. Do not treat its prose as settled, and do not rest a record on it. |
| The correction would change what the note claims | **Not a repair.** Retire it and write the replacement with `--replaces`: the claim is the record, and a changed claim is a revision. |
| The note is the owner's own record, and the fix changes a symbol, a number or an equation | Report it. Retire and replace, or the owner corrects their own note in the application: no tag records their re-acceptance here. |
| The note is an import or an unreviewed draft | `--rewrite`, not `--repair`: there is no acceptance to preserve, and rewriting is the shorter path. |

## 5. Wording discipline (Part II)

- The note explains the paper's method; it does not evaluate it. "This section derives X" is the
  note's register; "this is a good approach" is not in it.
- Keep the paper's own terms, with the translation at first use. Do not silently improve notation.
- Distinguish what the paper **states** from what the reader **infers**. An inference that is not in
  the paper says so.
- No numbers that the section did not produce. A constant that appears in the paper is quoted with its
  section; a constant that follows from the note's own arithmetic is marked as the reader's.

## 6. Report shape

### 6.1 Part I — claim and gap report

The artifact is the tags on the record plus this table. **No file is written for it**: a gap is
recomputable from the tags, so a saved copy would only age. Where the owner wants it kept, they say so.

1. `## Coverage` — one line per top-level section of the paper: ordinal · the paper's own heading ·
   **the note key that claims it, or `none`** · what the claim was judged on.
2. `## Claimed` — note key · section · the tag read back after the write, or `none`.
3. `## Missing` — the sections with no note, in the paper's own order. **This is the hand-off**: the
   owner brings an explanation for each, and nothing is generated here.

**One line each, only when non-empty** — `Left alone` (a note read and not claimed: no section number ·
the ordinal disagrees · more than one section · whole-paper summary · subsection key · nothing to check
the ordinal against) and `Not established` (a boundary this round could not settle, and what would).

### 6.2 Part II — generation report

The artifact is the notes on the library record. The report states what now holds:

**Header line** — `record: <key> · <title> · <attachment read, characters>`.

1. `## Coverage` — one line per section of the paper that matters: ordinal · the paper's heading ·
   **the note key that claims it, or `none`** · what it was judged on. Counted per **top-level** section.
2. `## Sections` — one line each: ordinal · the paper's heading · **note / skipped / not reached** and
   the reason. A section the reading never reached is `not reached`, and the line names the ledger's
   `verdict` that stopped the reading.
3. `## Notes written` — note key · section · characters, one line each, or `none`.
4. `## Changes` — one table row per note that left the happy path (unknown note · refusal · retired ·
   repaired · provenance): note key · action · **the reason** · the replacement or `nothing names one
   yet` · the read-back that proved it. A tag cannot hold prose, so a retirement's reason is stored
   nowhere else — it is a row here, not its own section. A substantive repair names the adoption items
   that now rest on a draft.

**Closing line** — `read-back: <n> notes` with each note's tags as they read back. A body with no
`/agent-note` in the read-back is a write to report as failed, not as done.

**Budget** — ≤100 lines of prose (the Coverage and Sections tables aside). Past it, cut in this order:
evidence restated from its carrier → a second reason for the same claim → per-object detail a ledger
holds → how the statement changed. Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **A claim round reads no paper.** Its whole instrument is the record's plan: `--item <recordKey>
  --json` prints every note's tags and first block, and that is enough to decide a claim in most
  cases. Opening the paper's PDF in Part I is a sign the round has slipped into Part II.
- **Writing is one section per invocation, dry run first.** `{{presetTools}}/zotero-section-note.mjs`
  states the change, refuses a claimed section, and writes only with `--write`; it reads back what it
  wrote before reporting success. Never batch several sections into one command.
- **Read the exit code as three answers, not two.** `0` = written and read back · `1` = refused and
  **nothing was written** · `3` = sent or written but **not confirmed**. Exit 3 is not a failure to
  retry: the tool prints the key it found and says so. Re-run the plan, read the record, and only then
  decide. A caller that treats 3 as 1 writes the same note twice.
- **`unknown` is a to-read list, never an absence.** `covered: none` says no note *claims* a section; it
  does not say no note *explains* it. A create on a record with `unknown` notes is refused until they
  are read, and `--acknowledge-unknown "<what you read, and why none covers §N>"` is the only way past
  that refusal. A report that calls a section uncovered without saying how many `unknown` notes were
  read is a guess.
- **The judgement about coverage is yours; the tag is the backstop.** The plan prints every note's tags
  and first paragraph and names the `unknown` ones. A tag is a claim; a note with no tag is read. Where
  your reading and the tag disagree, report both and stop.
- **A write needs the owner's authorization** (`INV-EVID-3`). "Allow" covers one write; a lasting grant
  for that library means no dialog at all, and it is revoked in the reference manager, not here.
- **Resolving an ambiguous note is a tag removal, and the tool is narrow about it.** `--unclaim
  --note <key> --section <ordinal>` removes exactly one `/section-N`, dry run first, version guarded,
  body untouched, and it **refuses a note carrying a single tag** — that is a claim, not a tag mistake.
  The plan names both tags and the one that survives, so the report can quote it. One tag per
  command: an ambiguous note with three tags needs two invocations, and each is its own decision.
- **Retiring is one note, one write, and it states its reason before it acts.** Dry run first, then
  `--write`; the read-back asserts that `/retired` came back. Whether a tag survives the application
  rewriting a note's body is measured: it does (`/retired`, 2026-10-18). A missing tag is reported, not
  assumed away.
- **Deleting is the one irreversible act, and it comes after retiring.** `--delete --note <key>` prints
  the plan and the irreversibility facts; `--write` erases the note, and the tool proves it with a 404.
  Only a `/retired` note is eligible: this channel has no trash, so the note and its key are gone. The
  request carries the version the plan was read at; a note that moved is refused. Bulk cleanup stays
  the owner's act in the application.
- **Reviewing is a tag, not an edit.** `--review --note <key>` records that the owner accepted an agent
  body; `--review --note <key> --undo --write` puts it back. Only an `/agent-note` has that state, the
  body is never touched, and a reviewed note is a record. The owner's sentence is the ground; the tag
  is where a later round reads it.
- **A repair states its class, and the tool checks the claim.** `--repair` takes exactly one of
  `--mechanical` or `--substantive`, plus `--reason`, and it refuses `--mechanical` when the changed
  span carries a digit, falls inside `$…$`, or rewrites more than half the body. Read that refusal as
  the answer to "which class is this", not as an obstacle: re-run with `--substantive`, or retire the
  note if the claim changed. `--repair` never writes a second note and never adds a `/replaces-`
  pointer — if the plan offers one, the request was a revision, not a repair.
- **A failed write is reported, never worked around.** If the tool fails, quote the command, the exit
  code and the output, and stop. Do not hand-roll a write script: a write outside this tool's gate has
  no read-back, and the library keeps no trace of which hand wrote it. A workaround the owner
  authorizes still runs through the same gate and the same read-back, and the report names it.
- **When the round spans records, ask for the plan as JSON.**
  `{{presetTools}}/zotero-section-note.mjs --item <recordKey> --json` prints the same facts the prose
  plan does: every note's tags, section, retired/imported/legacy state, and the `unknown` and
  `ambiguous` lists. Assemble the coverage and gap table from that, never by parsing the prose.
- **Reading is a budget.** An attachment's whole text comes back in one response — measured at 33k to
  88k characters for the papers this discipline is used on — while the result pruner reduces any tool
  result over 8,192 to its head and tail once the context is compacted, and the shell's own cap sits
  above that: `dsh-tool-pwsh` retains the **last 64,000 bytes** of a stream (measured on DSH
  0.2.1-rc.2), so a pull past it loses the **beginning**. Read in slices:

  ```powershell
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --limit 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --offset 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --grep "heading"
  ```

- **The structure rungs, and what each is worth.** `{{presetTools}}/zotero-pdf.mjs --outline` returns
  the paper's **own** table of contents where the file carries one (measured on one library: 11 of 20
  papers did, 9 carried none), each entry with the ordinal this discipline writes — `I Introduction`
  arrives as `§1`. It is authoritative about what the paper says its sections are and about nothing
  else. `--extract` reads the file's own text layer: it answers an attachment the library never
  indexed, and it reads broken mathematics just as wrongly, because it is the same encoding table.
  `--render --pages 3` writes page images into the study's draft directory — the rung for mathematics
  no text layer holds — and those are read as images, never quoted as text.
- **Whose write is it.** One pair of hands performs every library write and every read-back, and that
  is the parent's. A child under `subagent-contract` drafts note bodies into
  `<workspace>/.section-notes/<recordKey>/` and returns a manifest; it never touches the library. Who
  *reads* is the round's reading budget — eight slices of source text — and `reading-triage` §3.8
  states it. A library change is the gated, auditable act, and keeping it in one pair of hands is what
  makes "no duplicate, no overwritten note" checkable.
- **Workspace drafts are working files**, not deliverables; they carry no authority and need no
  authority to delete. The layout lives in `<workspace>/.section-notes/README.md`.
- **A workspace file does not carry the resolved helper path.** Name the program, say the path comes
  from this discipline, and pass a resolved path to a child in its prompt when one round needs it.

## 8. Acceptance checklist

### 8.1 Part I — claim and report

- [ ] No note body was written, and no note was rewritten, merged, retired or reformatted
- [ ] Every note carrying no `/section-` tag was read — its first block, the whole note only where the
  first block could not settle which section it explains — before anything was claimed
- [ ] Every claim names a section the note itself names, and that section exists in the paper's list —
  the file's outline, or the notes' consistent ordinals where the file carries none, said which
- [ ] No claim was made against a claim the plan already reports; no section is claimed twice
- [ ] Every claim was a dry run first, and its tag read-back is quoted
- [ ] Any `ambiguous` note was either resolved with `--unclaim`, one tag at a time and quoted from the
  plan, or reported unresolved with both tags named — never guessed at, and no single-tag note was
  unclaimed
- [ ] Every note left unclaimed is reported, one line each, with its reason
- [ ] The `## Missing` list is in the paper's own order, and nothing in it was generated
- [ ] The number of tags the round wrote is stated
- [ ] The round was not recorded as a reading in the topic's ledger

### 8.2 Part II — generation (only when the owner asked for a section)

- [ ] The section list was reported before any write, each with note / skipped and a reason
- [ ] Every `unknown` note was read, and the report says what was done with it
- [ ] The coverage table was reported per **top-level** section, with the claiming note or `none`
- [ ] No note was written for a subsection; no dotted tag was created
- [ ] No note was written for the abstract, the introduction, the case study, or the conclusions
- [ ] Sections the reading never reached are reported as `not reached`, with the ledger verdict that
  stopped it, rather than as "no note needed"
- [ ] Every note carries `/section-N` and the paper's own ordinal and heading
- [ ] Every note this round wrote or rewrote carries `/agent-note`, quoted from the read-back; a
  repaired note keeps the provenance it already had
- [ ] Every repair declared `--mechanical` or `--substantive`, and the class matches what the change
  did: no digit, no math and no half-body rewrite was passed off as mechanical
- [ ] A substantive repair cleared `/reviewed`, and the report names the adoption items that now rest
  on a draft
- [ ] A repair kept the note's key, its `/section-N` and its provenance, and wrote no `/replaces-`
  pointer
- [ ] No `/reviewed` was written by this round: that tag is the owner's, and only `--review` after
  their answer may add it
- [ ] A create on a record with `unknown` notes was preceded by reading them, or
  `--acknowledge-unknown` names what was read and why none covers the section
- [ ] Every equation is inside `$…$` or `$$…$$`, with display math on lines of its own
- [ ] Every symbol used is defined at its first appearance
- [ ] Each note ends with a summary naming its contribution and its hand-off to the next section
- [ ] Any note outside the 1,500–5,000 signal range is explained
- [ ] Each write was a dry run first, and its read-back is quoted
- [ ] Any exit 3 is reported as "sent but unconfirmed", with the key the tool found — never as refusal
- [ ] Every retirement is reported with its reason and its successor
- [ ] A note an earlier version tagged `/digest` was reported as legacy and left alone, never claimed
- [ ] Every deletion was a `/retired` note, planned first, and the report quotes its read-back 404

## 9. Don't

- Do not claim a note whose own text does not name its section. A claim is a durable statement a later
  round checks, and a wrong one blocks the section until the owner retires it.
- Do not unclaim a single-tag note. One tag is a claim, and a reading that disagrees with a claim stops
  the round for the owner to settle (protocol §6); `--unclaim` exists only to resolve a note that
  carries more than one tag.
- Do not rewrite, merge, retire or reformat an imported note in a claim round. What the owner pasted
  is the owner's text; Part II touches an import only when the owner asks for that section.
- Do not turn a claim round into a reading: no paper is opened, and no `depth` is written for it.
- Do not summarize the paper. The unit is the method section, not the paper.
- Do not write a note keyed to a subsection, and do not fold a dotted note silently: Part II merges it
  or retires it; Part I reports it and claims nothing on the parent.
- Do not write a note for a section that was not read in this session.
- Do not duplicate coverage to "complete" a record, and do not delete someone else's note.
- Do not delete a note that is not retired, and do not delete one to free its section: retiring frees
  it, and deletion is permanent. Do not retire a note you have not read: retiring asserts that the note
  is wrong, and that is a claim you have to be able to state the grounds for.
- Do not rewrite a `/section-N` record in place: **repair** it (`--repair`, with its class and reason)
  when the claim did not change, and retire it and write the replacement when it did. Only an
  `/imported` note and an unreviewed `/agent-note` draft are rewritten in place.
- Do not call a repair a revision, or the reverse: a changed claim is a retirement even if the diff is
  one word, and a corrected formula is a repair even though it is a large edit.
- Do not repair a record the owner wrote substantively. No tag records their re-acceptance; retire and
  replace, or leave it to them.
- Do not present an unreviewed `/agent-note` as the owner's note, and do not add `/reviewed` yourself:
  that tag records the owner's judgement, and an agent that writes it has ruled for them.
- Do not call an agent draft an import, and do not let `--claim` add `/imported` to one.
- Do not write through a hand-rolled script when this tool fails. Report the command, the exit code and
  the output, and stop: a write outside the gate has no read-back.
- Do not use `--tidy`: there is no automatic repair. Read the text or the page image and write the body.
- Do not let a child write into the reference library.
- Do not turn the note into review prose, a grade, or a judgement of the paper's quality.
- Do not claim a legacy `/digest` note for a section, and do not write one.
