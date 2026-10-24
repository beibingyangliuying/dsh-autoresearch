---
name: section-notes
description: Use when method-section notes arrive from outside, when a record must say which sections still carry no note, or when the owner names a section to have a body written. Claims a pasted note to the section its heading names, as a tag and never a body edit, and reports the gaps.
---

# section-notes — keep a paper's record section-addressable

This skill does one thing on one record: it keeps a paper's **method sections** addressable, one durable
explanation per top-level section. Most rounds only claim explanations that already exist and name the
sections still missing one; a body is written from the paper only when the owner asks for that section.
It is not a summary of the paper, not a reading record, and not a review.

## 0. Which half of this skill runs

The request decides. **Part I is the default, and it is where most rounds stop**: it writes no body,
never rewrites, merges, retires or reformats an imported note, and never opens the paper's PDF.

| Situation | Half | What it may write |
|---|---|---|
| A record carries notes pasted in from outside — a browser, a chat model, another editor | **Part I — claim and report** | a `/section-N` tag on a note that already exists, nothing else |
| The owner names a section and asks for a note to be written from the paper | **Part II — generate** | one new body for that section, or a rewrite of an **import** or an **agent draft**; every body carries `/agent-note` |
| The owner asks to correct an error in an existing note | **Part II — repair** | the corrected body **in place**: `/repaired` added, `/reviewed` cleared when a symbol, number or equation changed |
| It is not clear which | neither: report and ask | nothing |

## 1. When to use

- **Default — the record carries imported notes with no claim**, and the study needs to know which
  top-level sections they cover and which still carry none. This is **Part I**.
- **The owner names a section and asks for a note** from the paper, because it must be understood
  durably. This is **Part II**.
- **The owner asks for a section to be explained again**, because the note that claims it explains it
  badly or its formulas are unreadable. **Part II** as well.
- **A record carries a transcription error** — a symbol the paper does not use, a broken delimiter, a
  citation that resolves to nothing — while what the note claims still holds. **Part II — repair**.

**Not applicable**: deciding whether a paper is worth reading to its end (a per-question judgement
recorded in the topic's ledger — `reading-triage`), a topic-level literature note (`literature-recon`),
or a one-off "what does this section say" that nothing later depends on.

**A section note is not the reading record.** The ledger row carries `depth`, `verdict` and `grade`; the
note explains one section and says nothing about how far the paper was read.

**A claim is not a reading.** Claiming an imported note records that a section has an explanation
attached; a claim round never writes a `depth`, and the note's provenance is the `/imported` tag.

## 2. First step: read the current state

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

Read-only, before claiming or writing anything:

1. **The record's own state**: `{{presetTools}}/zotero-section-note.mjs --item <recordKey>` prints every
   child note with its **tags** and **first paragraph**, then five lines:

   | Line | Meaning |
   |---|---|
   | `covered` | what live `/section-N` tags claim, per top-level section |
   | `retired` | notes marked `/retired` (tombstones), each with the note that names itself its successor |
   | `legacy` | a whole-paper summary an earlier version tagged `/digest`; never a section note, never written now |
   | `unknown` | notes with no `/section-` tag; **read these** |
   | `ambiguous` | notes carrying more than one `/section-` tag; **read them, then remove the stale tag** — `--unclaim --note <key> --section <ordinal>`, one tag per command |

   **The tool does not parse prose.** A note is coverage only if it carries `/section-N`; `covered` is a
   claim about a tag, not about content. Every note's line also prints `class:` and the `moves:` the record
   permits — which of those moves this round may take is this discipline's call, not the tool's. A note
   carrying `/repaired` was corrected in place: its claim and provenance are what they were, and when the
   correction touched a symbol, number or equation it no longer carries `/reviewed`, so it supports no more
   than a candidate.

2. **Read every `unknown` note before claiming or writing** — its first paragraph from the plan; open the
   whole note with `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000` when that is not
   enough. Then one of four moves:

   | What the note is | Move |
   |---|---|
   | a usable explanation of §N, in any format | `--claim --note <key> --section N` — tags only, body untouched; a note with no section tag also gets `/imported`, unless it already carries `/agent-note` |
   | about §N but needs our format or prose | `--rewrite --note <key> --section N --file <draft>` — dry run first; no backup is written |
   | wrong, junk, or in the way | `--retire --note <key> --reason "<why>"` — a tombstone, erasable later with `--delete --write` |
   | a whole-paper summary, or not a section note | **leave it**; a `/digest` note is this case (`legacy`) and is never claimed |

   **In Part I only three moves exist**: `--claim`, `--unclaim` on an **ambiguous** note, and *leave it*.
   `--rewrite` and `--retire` are Part II acts. A note that carries **one** tag is a claim and is never
   unclaimed here.

3. **State the coverage table before any claim or write** — one line per section considered: the paper's
   own ordinal and heading · the note key that covers it, or `none` · what it was judged on. Where your
   reading disagrees with a tag, report both and **stop**: a wrong tag is the owner's to settle.

4. **(Part II only) One existing section note as the ruler**, when the library has any:
   `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000`. Its shape — where the heading sits,
   how equations are delimited, how the summary reads — outranks the template in §3.2.

5. **The paper's own section boundaries** — both halves need them. `{{presetTools}}/zotero-pdf.mjs --item
   <recordKey> --outline` first: where the file carries the paper's own table of contents, the ordinals
   come from there; where it carries none, find the headings in slices or with `--grep`. **Write down the
   heading line and its ordinal as you find them**: the write step is keyed on them, and numbering is
   often unreadable in a scanned paper.

Nothing about a paper may be written from memory. A note whose content was not read in this session is a
fabrication with a citation attached.

### 2.1 Part I — the claim decision, and how narrow it is

A claim says "this section is explained by this note". A claimed section is refused to every later
create (`REFUSED: §N is already covered - note <key>`), and a study that adopts from that note cites the
wrong section without ever re-reading the paper (`INV-ADOPT-2`). Where the note's own section cannot be
established, the claim waits for the owner.

| What the note's own text says | Move |
|---|---|
| names a top-level section, and the ordinal agrees with the paper's own list — or, with no outline, with the notes' consistent ordinal sequence | `--claim --note <key> --section N` |
| names a section, but the ordinal disagrees, or two notes claim the same ordinal | **do not claim.** Report both and stop |
| carries no section number, or more than one | **do not claim.** Report it |
| is a whole-paper summary rather than one section | **do not claim**; a `/digest` note is this case |
| the notes' ordinals are not a consistent sequence | **claim nothing.** Report the headings found and ask |

Two conditions ride on the same decision:

- **Only what section it explains is judged, never whether it is a good one.** Open the whole note only
  when the first block cannot settle which section it explains.
- **`--section N` takes the paper's TOP-LEVEL ordinal.** A note keyed to `§3.1` is not a claim on §3;
  Part I reports a subsection note rather than folding it in.

**Where the paper carries no outline, the list is the notes' own titles, and that is a weaker check.**
Claim against their consistent ordinal sequence and say so in `## Coverage`.

## 3. Criteria (Part II — generating a note)

### 3.1 Which sections get a note

Decide from **what the section contains**; position is the check, not the rule.

| The section contains | Note? |
|---|---|
| Model formulation, derivation, method, algorithm, proof, assumptions, an index or factor being defined, a sensitivity being derived | **Yes** |
| One factor per section in a factors paper (§2 … §7 each deriving its own) | **Yes — one note each** |
| Abstract, Introduction, background, literature review, related work, motivation, nomenclature | No |
| Case study, numerical results, experiments, test system, validation, simulation, discussion, conclusions, appendix, references | No |
| Nothing that defines or derives anything — a survey or review paper | **None.** Report "no method section" and stop. |

If you are about to write a note for the **first** section, or for the **last two**, say in one line why
that section is method rather than background or results. Being wrong here is the failure this skill
exists to prevent.

**This round explains the section it was asked for, not the paper.** A section the owner did not name
gets no note, and a round asked for one section may stop inside it: the report says which sections were
not reached rather than "no note was needed".

### 3.2 What one note contains

1. **A heading line** naming the section by ordinal **and** by the paper's own title, translated if the
   note is not in the paper's language. A note has no title field in this library (a `title` patch on a
   note is refused), so the section is named by that first line and by the `/section-N` tag.
2. **The section's core, in two to four sentences**: what problem it solves, by what means, and what it
   establishes.
3. **Subsections mirroring the paper's own numbering** — do not re-invent a structure the paper already
   has. This is about headings **inside** one note; it is not a licence to write a note per subsection.
4. **Every equation worth keeping**, with the paper's own equation number cited in prose where it gives
   one ("公式 (40)"). Inline math is `$ … $`. **Display math is `$$` alone on a line**, the expression on
   its own line, and `$$` alone again — never all on one line. No equation is reproduced without its
   symbols defined at first use.
5. **A closing summary** under its own small heading, naming the section's contribution and what it hands
   to the next section.

**Shape, as a filled example** — every value below is a value such a note actually carries:

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

**Write values, not angle brackets.** A placeholder that reads like content gets copied as content. If
you are about to type `<...>` into a note, you have mistaken the advice for the artifact.

**Length is a signal, not a cap.** Most notes land between 1,500 and 5,000 characters. Much above that
is usually the case study leaking in; much below it usually means the section was not read. Say which it
is in the report — and **never split a section to stay inside that range**.

### 3.3 One note per top-level section, and the claim is a tag

- **`--section 3.1` is refused.** There is no subsection write, and no dotted tag is read. A dotted note
  from an earlier round shows up as `unknown`; read it, merge what it says into the top-level note, and
  retire it.
- **Create refuses a claimed section** (`REFUSED: §N is already covered - note <key>`). Do not work
  around a refusal.
- **`--claim` is how an existing note enters coverage.** It writes `/section-N` and leaves the body
  alone; a note that had no section tag also gets `/imported`, unless it is an `/agent-note`.

**The class is stated, not derived.** Each note's line carries `class:` — `owner`, `import`, `agent` or
`agent+reviewed` — and `moves:`, the writes that class permits. An import and an unreviewed draft are
rewritten in place; a reviewed body and the owner's own record are repaired in place, mechanically only
for the latter; a legacy summary is left alone. A note carrying both `/imported` and `/agent-note` is an
import an agent rewrote: it stays rewritable, and its provenance is `agent`. **A body this discipline
writes carries `/agent-note` from the moment it is created**, and a rewrite stamps it too. `/reviewed` is
written only by `--review --note <key>`, after the owner says the body is right; it is a tag, never a body
edit. A note created as an agent draft never receives `/imported`, and a claim never adds it.

- **A wrong note is retired, never rewritten.** `--retire --note <noteKey> --reason "<why>"` leaves the
  body as it stands, makes the note a tombstone rather than coverage, and frees the section. The
  replacement is written with `--replaces <retiredNoteKey>`, which the tool refuses unless the retired
  note really is retired and explained the same top-level section. `--retire --undo` puts the claim back.
  **Deleting is a separate act**: only a `/retired` note is eligible, `--delete` prints the plan and the
  irreversibility facts, and `--write` erases it permanently — the channel has no trash.
- **A `/digest` note is not a section note.** It is a whole-paper summary, listed as `legacy`, not
  coverage, and never claimed for a section. Notes are created in section order.

### 3.4 Writing a body is the agent's work; there is no tidy

- **There is no `--tidy` and no automatic math repair.** A tool that rewrote a formula because it looked
  like LaTeX would be making a content decision while claiming to format one.
- **`--rewrite` is for an import or an agent draft.** It replaces the body with the draft after a dry run
  and under a version guard, and stamps `/agent-note`. The key does not change and no workspace backup is
  written; the plan prints the old first block. If the note changed in the application meanwhile, the
  tool refuses rather than overwrite it.
- **A record is not rewritten in place, and it may be repaired.** `--repair --note <key> --file <body>
  --reason "<why>"` corrects without replacing: key, claim and provenance stay, `/repaired` is added, and
  the plan prints the old and new first blocks with the reason. **Declare the class**, exactly one of:
  - `--mechanical` for a correction that changes no symbol, number or equation — a misspelling, a broken
    delimiter, a dead citation. It keeps `/reviewed`.
  - `--substantive` for one that does change a symbol, a number or an equation. It clears `/reviewed`, so
    the body reads as a draft until the owner accepts it again.

  The tool refuses `--mechanical` when the change carries a digit, falls inside `$…$`, or rewrites more
  than half the body. **A record the owner wrote is repaired mechanically only**: no tag records the
  owner re-accepting a changed statement, so a substantive correction there is a retirement and a
  replacement, or the owner's own edit in the application. Anything that changes what the note claims is
  a retirement and a replacement — that is the line between a repair and a revision.
  `--review --note <key> --undo` is the way back to a draft.
- **The formula shape is the agent's responsibility**: `$…$` inline, `$$` alone on its own lines for
  display, every symbol defined at first use, the paper's own equation number in prose. If the text layer
  is unreadable, climb the reading ladder and read the rendered page as an image (§7) before writing it.

## 4. Do vs don't

### 4.1 Do

- Report the section list **before** writing: ordinal, the paper's own heading, and note / no-note with
  the reason for each.
- Read every `unknown` note before claiming or writing; say which ones you claimed, rewrote, or retired.
- Prefer **repairing** a record to replacing it when the claim did not change: one note stays one note,
  and a later reader sees `/repaired` instead of reconstructing two notes.
- Keep one note per top-level section, named by the ordinal the paper itself uses.
- Say which attachment the text came from and how many characters of it were read; say which notes are
  agent drafts and whether the owner has reviewed them.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

These are Part II conditions unless a row says otherwise. A claim round reads the notes, not the paper.

| Hit | Action |
|---|---|
| The record has no PDF/EPUB/HTML attachment, or the library has not indexed it | Report "no readable text"; write nothing. The note is not owed from the abstract. |
| The section is already claimed — by the plan, **or by your reading of the notes** | Report "already covered by note `<key>`" and skip it. Never create a second note for one section. |
| A note carries two `/section-` tags (`ambiguous`) | Read it, then remove the stale one with `--unclaim --note <noteKey> --section <ordinal>` (dry run first, one tag per command). If you cannot tell which is stale, report both and **stop**. |
| An `unknown` note explains §N | Claim it — both halves act here. Part II may rewrite it if it needs our format; do not write a second note beside it. |
| A note is subsection-keyed, from an earlier round | Report it. Part II merges its content into the top-level note and retires it; Part I only reports it and claims nothing on the parent. |
| The paper is a survey/review with no derivation anywhere | Report "no method section". Do not force a note onto a background section. |
| The section boundaries cannot be established from the text | Report the headings you did find and **stop**; ask. A note keyed on a guessed ordinal collides later. |
| The section is a case study, a results table, or a conclusion | Do not write it. Say it was skipped and why. |
| The note runs well past the 5,000-character signal | Cut the case-study material and the abstract restatement, not the derivation, and say the method content is long. **Never split the section.** |
| The section is claimed by a note that is **wrong** | **Retire it**, then write the replacement with `--replaces <noteKey>`. Never edit its prose; deleting comes only after retiring. |
| The text layer is unreadable, or a formula exists only in the image | Read the rendered page as an image (`--render` + `read_image`); say which rung answered. Do not trust the text layer for mathematics. |
| A create is refused because the record carries `unknown` notes | Read them first. If none explains the section, `--acknowledge-unknown "<what you read, and why none covers §N>"` is the only way past the refusal — never read `covered: none` as "no note exists". |
| The section is claimed by an **unreviewed agent draft** | Report it as a draft, not as the owner's note. Do not rest a record on its prose. |
| The correction would change what the note claims | **Not a repair.** Retire it and write the replacement: the claim is the record. |
| The note is the owner's own record and the fix changes a symbol, number or equation | Report it. Retire and replace, or the owner corrects it in the application. |
| The note is an import or an unreviewed draft | `--rewrite`, not `--repair`: there is no acceptance to preserve. |
| A claim is about to be made on a note whose own text does not name its section | Do not claim. A wrong claim blocks the section until the owner retires it. |
| A claim round is drifting into reading the paper | Stop. No PDF is opened and no `depth` is written; that is `reading-triage`. |

## 5. Wording discipline (Part II)

- The note explains the paper's method; it does not evaluate it. "This section derives X" is its
  register; "this is a good approach" is not.
- Keep the paper's own terms, with the translation at first use. Do not silently improve notation.
- Distinguish what the paper **states** from what the reader **infers**; an inference not in the paper
  says so.
- No numbers the section did not produce. A constant the paper gives is quoted with its section; one that
  follows from the note's own arithmetic is marked as the reader's.

## 6. Report shape

### 6.1 Part I — claim and gap report

The artifact is the tags on the record plus this table. **No file is written for it**: a gap is
recomputable from the tags, so a saved copy would only age.

1. `## Coverage` — one line per top-level section: ordinal · the paper's own heading · **the note key
   that claims it, or `none`** · what the claim was judged on.
2. `## Claimed` — note key · section · the tag read back after the write, or `none`.
3. `## Missing` — the sections with no note, in the paper's own order. **This is the hand-off**: the
   owner brings an explanation for each, and nothing is generated here.

**One line each, only when non-empty** — `Left alone` (a note read and not claimed: no section number ·
the ordinal disagrees · more than one section · whole-paper summary · subsection key · nothing to check
the ordinal against) and `Not established` (a boundary this round could not settle, and what would).

### 6.2 Part II — generation report

The artifact is the notes on the library record. **Header line** — `record: <key> · <title> · <attachment
read, characters>`.

1. `## Coverage` — one line per section that matters: ordinal · heading · **the note key that claims it,
   or `none`** · what it was judged on. Counted per **top-level** section.
2. `## Sections` — one line each: ordinal · heading · **note / skipped / not reached** and the reason. A
   section the reading never reached names the ledger `verdict` that stopped it.
3. `## Notes written` — note key · section · characters, one line each, or `none`. A written body that
   comes back without `/agent-note` is a failed write, not a done one.
4. `## Changes` — one row per note that left the happy path (unknown note · refusal · retired · repaired
   · provenance): note key · action · **the reason** · the replacement or `nothing names one yet` · the
   read-back that proved it. A substantive repair names the adoption items that now rest on a draft.

**Budget** — ≤100 lines of prose (the Coverage and Sections tables aside). Past it, cut in this order:
evidence restated from its carrier → a second reason for the same claim → per-object detail a ledger
holds → how the statement changed. Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **A claim round reads no paper.** `--json` prints every note's tags and first block, which decides a
  claim in most cases. Opening the PDF in Part I is a sign the round has slipped into Part II.
- **Writing is one section per invocation, dry run first.** The tool states the change, refuses a
  claimed section, writes only with `--write`, and reads back what it wrote. Never batch sections.
- **Read the exit code as three answers.** `0` = written and read back · `1` = refused and **nothing was
  written** · `3` = sent or written but **not confirmed**. Exit 3 is not a failure to retry: re-run the
  plan, read the record, and only then decide. A caller that treats 3 as 1 writes the note twice.
- **`unknown` is a to-read list, never an absence.** `covered: none` says no note *claims* a section, not
  that none *explains* it.
- **A write needs the owner's authorization** (`INV-EVID-3`). "Allow" covers one write; a lasting grant is
  revoked in the reference manager, not here.
- **A failed write is reported, never worked around.** Quote the command, the exit code and the output,
  and stop: a write outside this gate has no read-back and the library keeps no trace of it.
- **Reading is a budget.** An attachment's whole text arrives in one response, and the shell drops the
  **beginning** of an oversized stream, so read in slices of about 12,000 characters and re-fetch by
  offset rather than recall a pruned result:

  ```powershell
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --limit 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --offset 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --grep "heading"
  ```

- **The structure rungs, and what each is worth.** `zotero-pdf.mjs --outline` returns the paper's **own**
  table of contents where the file carries one, each entry with the ordinal this discipline writes
  (`I Introduction` arrives as `§1`); it is authoritative about what the paper says its sections are and
  about nothing else. `--extract` reads the file's own text layer — it answers an unindexed attachment,
  and reads broken mathematics just as wrongly, because it is the same encoding table. `--render --pages
  3` writes page images for mathematics no text layer holds; those are read as images, never quoted.
- **Whose write is it.** One pair of hands performs every library write and read-back, and that is the
  parent's. A child under `subagent-contract` drafts bodies into `<workspace>/.section-notes/<recordKey>/`
  and returns a manifest; it never touches the library. Who *reads* is the round's budget —
  `reading-triage` states it.
- **Workspace drafts are working files**, not deliverables: no authority, and no authority needed to
  delete them. The layout lives in `<workspace>/.section-notes/README.md`. A workspace file does not
  carry the resolved helper path — name the program and pass a resolved path in the child's prompt.
