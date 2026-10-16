---
name: section-notes
description: Turn a paper already chosen for study into one explanation note per METHOD section, attached to the library record — background, case study and conclusion sections are not written; every write is a dry run first, an existing section is never duplicated, and an old note is only ever repaired mechanically (bracket/underscore math delimiters restored to $ and $$), never rewritten. Use after reading a method-heavy paper you will build on, and when a record's existing section notes have unreadable formulas.
---

# section-notes — one explanation note per method section

This skill does exactly one thing: it turns **reading a paper's method** into a durable artifact that
lives on the library record and can be re-opened section by section. It is not a summary of the paper,
not a digest of what was read, and not a review prose exercise.

It exists because a paper's value to a study is concentrated in two or three of its sections. A note
that explains Introduction and Numerical results costs the same to write as the one that explains the
derivation, and a later round pays the same cost to read it. **The head and the tail are cut off on
purpose.**

## 1. When to use

- A paper has been chosen for study (a method you may build on, a derivation you must reproduce, a
  factor you need the exact definition of) and its **method sections** must be understood durably.
- A record already carries section notes whose formulas are unreadable because the copy lost its
  delimiters, and they should be **repaired**, not rewritten.

**Not applicable**: deciding whether a paper is worth reading (`literature-recon` — that is its search
and grading job), a topic-level literature note (also `literature-recon`), or a one-off "what does this
section say" question that nothing later will depend on.

**A section note is not the digest.** `literature-recon` leaves a digest — what was read, at what
grade, and what it settles — and `INV-EVID-4` treats that digest as the record of one reading. The
section note is a different artifact: an explanation of the method, kept on the record. Both may exist
on one record; neither replaces the other.

## 2. First step: read the current state as a ruler

Read-only, before writing anything:

1. **The record's own state**: `{{presetTools}}/zotero-section-note.mjs --item <recordKey>`. It reports
   whether a readable attachment exists, every note already on the record, and which sections those
   notes claim.
2. **One existing section note as the ruler**, when the library has any:
   `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000`. The note's shape — where the
   heading line sits, how equations are delimited, how the closing summary reads — is the convention
   this skill follows. **An existing convention outranks the template below**; the template is what to
   use when there is none.
3. **The paper's own section boundaries**, before reading for content: pull the text in slices and find
   the headings, or locate a heading with `--grep`. Section numbering is often unreadable in a scanned
   paper (the heading may be an unnumbered uppercase line), so **write down the heading line and its
   ordinal as you find them** — that note is what the write step is keyed on, and it is the only thing
   that makes a later re-run idempotent.

Nothing about a paper may be written from memory. A section note whose content was not read in this
session is a fabrication with a citation attached.

## 3. Criteria

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

### 3.2 What one note contains

1. **A heading line** naming the section by ordinal **and** by the paper's own title, translated if the
   note is not in the paper's language. Where the library can carry a note title, the title carries the
   same name — **attempted, never required**: measured here, a `title` patch on a note answers HTTP 500
   while a `tags` patch on the same note answers 204, so the section is named by the first line and by
   the marker, and the child-note list shows an untitled note. That is a property of the library; the
   note is written either way.
2. **The section's core, in two to four sentences**: what problem it solves, by what means, and what it
   establishes.
3. **Subsections mirroring the paper's own numbering** — do not re-invent a structure the paper
   already has.
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
   to the next section. A reader who stops here must still know why the section exists.

**Shape, as a template** (the language is the record's, not this file's):

```html
<p>文章第&lt;X&gt;节标题是 <strong>“&lt;原文标题&gt;”（&lt;译名&gt;）</strong>。这一节的核心是：…
下面分&lt;小节/部分&gt;解释。</p>
<hr>
<h2>&lt;小节号&gt; &lt;小标题&gt;</h2>
<p>…每个符号第一次出现时给出含义…</p>
<p>$$
&lt;行间公式&gt;
$$</p>
<p>…引用原文的公式号，如「公式 (40)」…</p>
<h2>小结</h2>
<ol><li>…</li></ol>
```

**Budget**: 1,500–5,000 characters per note. Above that is almost always the case study leaking in;
below it, the section was probably not read.

### 3.3 One note per section, and never a duplicate

- The tool refuses to create a note for a section the record already covers — including a note written
  before this tool existed, whose claim is read from its own opening line. **Do not work around a
  refusal**; report it.
- Notes are created in section order, so the record reads in the order the paper reads.

### 3.4 Repairing an old note is mechanical, and only mechanical

`--tidy` restores what the copy damaged, and nothing else:

| Damage | Repair |
|---|---|
| `<em>x</em>` where a Markdown underscore was eaten (`B'_{ij}` → `B'<em>{ij}`) | `_x_` |
| `[ … ]` holding LaTeX | `$$ … $$`, on lines of its own |
| `( … )` holding LaTeX markup | `($ … $)` — the parentheses stay **outside**, because `(S^{max})^2` and `$S^{max}$^2` are different expressions |
| Display math written all on one line | `$$` alone on a line, the expression on its own line, `$$` alone again — idempotent, so a note already in that shape never moves |

A span is converted only when it carries LaTeX markup and sits inside one closed span of one text
node. An unbalanced bracket, a span split across paragraphs, a parenthesised prose aside: all left
exactly as they were and reported. **A repair that guesses at what a broken formula meant is a
rewrite wearing a formatter's clothes** — if a section needs re-explaining, that is a new note or an
explicit owner decision, never a tidy.

**The library owns two things, and the repair must not fight them.** Measured here:

- A note the **application** has written — its body opens with the application's own
  `<div data-schema-version="…">` wrapper, and the invisible marker comment is gone — keeps its display
  math on **one line**: this library stores such a note back on one line whatever is sent. The
  line-break rule is therefore not attempted on it, and the run **says so** instead of writing the same
  no-op on every run and reporting the same change forever.
- A note written only through the API stays bare, and there the line breaks persist.

A read-back is compared as **visible text**, never byte-for-byte, and a repaired note is accepted when
re-running the repair would change nothing. Byte comparison would report a delivered write as failed,
which is the one thing a write tool must never say about the owner's library.

## 4. Do vs don't

### 4.1 Do

- Report the section list **before** writing: ordinal, the paper's own heading, and note / no-note with
  the reason for each.
- Keep one note per section, and name the section by the ordinal the paper itself uses.
- Say which attachment the text came from, and how many characters of it were read.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The record has no PDF/EPUB/HTML attachment, or the library has not indexed it | Report "no readable text"; write nothing. The note is not owed from the abstract. |
| The section is already covered (marker, or its opening line names it) | Report "already covered by note `<key>`" and skip it. Never create a second note for one section. |
| The paper is a survey/review with no derivation anywhere | Report "no method section". Do not force a note onto a background section. |
| The section boundaries cannot be established from the text | Report the headings you did find and **stop**; ask. A note keyed on a guessed ordinal collides with the real one later. |
| The section is a case study, a results table, or a conclusion | Do not write it. Say it was skipped and why. |
| A `--tidy` run reports a span it left alone | That span needs a human or a rewrite. Report it; do not hand-close or hand-rewrite the formula. |
| The note would exceed the budget | Cut the case-study material and the restatement of the abstract, not the derivation. |

## 5. Wording discipline

- The note explains the paper's method; it does not evaluate it. "This section derives X" is the
  note's register; "this is a good approach" is not in it.
- Keep the paper's own terms, with the translation at first use. Do not silently improve notation.
- Distinguish what the paper **states** from what the reader **infers**. An inference that is not in
  the paper says so.
- No numbers that the section did not produce. A constant that appears in the paper is quoted with its
  section; a constant that follows from the note's own arithmetic is marked as the reader's.

## 6. Report shape

The artifact is the note itself, on the library record. The report is what a later round needs:

1. `## Record` — key, title, the attachment read and how many characters of it.
2. `## Sections` — one line each: ordinal · the paper's heading · **note / skipped** and the reason.
3. `## Notes written` — note key · section · characters, one line each, or "none".
4. `## Refusals and what was left alone` — every duplicate, missing file, unreadable boundary, and, for
   a tidy, the spans converted and the spans declined.
5. `## Read-back` — the note key and size as it read back after the write, which is the only evidence
   that the write happened.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **Writing is one section per invocation, dry run first.** `{{presetTools}}/zotero-section-note.mjs`
  states the change, refuses a duplicate, and writes only with `--write`; it reads back what it wrote
  before reporting success. Never batch several sections into one command — one invocation, one change.
- **A write needs the owner's authorization** (`INV-EVID-3`). "Allow" covers one write; a lasting grant
  for that library means no dialog at all, and it is revoked in the reference manager, not here. Never
  treat a refused or revoked grant as granted.
- **Reading is a budget.** An attachment's whole text comes back in one response — measured at 33k to
  88k characters for the papers this discipline is used on — while this preset's result pruner keeps
  only a result's head and tail above 8,192 characters. Read in slices:

  ```powershell
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --limit 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --offset 12000   # this offset was printed
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<recordKey>" --grep "heading"
  ```
- **No outline rung exists.** Nothing in this toolchain returns a paper's structure; the boundary step
  in §2 is done by reading, and the headings are written down as they are found.
- **Whose write is it.** One paper is done inline. From three papers onward, hand each paper to one
  child under `subagent-contract` — the child reads the text and writes the note bodies to files under
  `<workspace>/.section-notes/<recordKey>/` and returns a manifest, and **the parent performs every
  library write and every read-back**. The reason is not context economy alone: a library change is the
  gated, auditable act, and keeping it in one pair of hands is what makes "no duplicate, no overwritten
  note" checkable. A child's drafted note is `[unverified]` until the parent reads it back.
- **Workspace drafts are working files**, not deliverables; they carry no authority and need no
  authority to delete.

## 8. Acceptance checklist

- [ ] The section list was reported before any write, each with note / skipped and a reason
- [ ] No note was written for the abstract, the introduction, the case study, or the conclusions
- [ ] Every note names its section by the paper's own ordinal and heading
- [ ] Every equation is inside `$…$` or `$$…$$`, with display math on lines of its own and no `$` nested in `$$`
- [ ] Every symbol used is defined at its first appearance
- [ ] Each note ends with a summary naming its contribution and its hand-off to the next section
- [ ] Each note is within the character budget
- [ ] Each write was a dry run first, and its read-back is quoted
- [ ] No section is covered twice; every skip is reported
- [ ] For a tidy: the converted and the declined spans are both reported, and no prose was rewritten

## 9. Don't

- Do not summarize the paper. The unit is the method section, not the paper.
- Do not write a note for a section that was not read in this session.
- Do not duplicate coverage to "complete" a record, and do not delete someone else's note.
- Do not rewrite prose during a tidy, and do not close a delimiter the copy lost.
- Do not let a child write into the reference library.
- Do not turn the note into review prose, a grade, or a judgement of the paper's quality.
