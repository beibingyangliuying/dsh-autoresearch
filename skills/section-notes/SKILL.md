---
name: section-notes
description: Turn a paper already chosen for study into one explanation note per TOP-LEVEL method section, attached to the library record, and then a paper-level digest synthesized from those notes. Identity is a tag (`/section-N`), never an invisible marker; a note with no tag is read before anything is written; a pasted note is claimed or rewritten in place, a wrong record is retired first and may be deleted only after that; the digest is refreshed in place and its old body stays in the library. Use after reading a method-heavy paper you will build on, when a record carries pasted notes that must enter the convention, and when a section is blocked by a note that explains it badly.
---

# section-notes — one explanation note per method section, plus the digest

This skill does two things on one record: it turns **reading a paper's method** into one durable
explanation note per top-level section, and then it turns those notes into **one paper-level digest**.
It is not a summary of the paper, not a digest of what was read, and not a review prose exercise.

It exists because a paper's value to a study is concentrated in two or three of its sections. A note
that explains Introduction and Numerical results costs the same to write as the one that explains the
derivation, and a later round pays the same cost to read it. **The head and the tail are cut off on
purpose.** The digest is the one-page projection of what was kept.

## 1. When to use

- A reading round has reached the end of a **method section** of a paper this study will build on (a
  method you may build on, a derivation you must reproduce, a factor you need the exact definition of)
  and that section must be understood durably. The round may stop part-way through the paper: the note
  covers the sections the reading actually reached, and the topic's ledger (`depth`) says where that was.
- A record already carries notes pasted from a browser or another editor, with no claim, and they must
  be read and either claimed, rewritten, or retired.
- A record carries a section note whose formulas are wrong or unreadable, and the section must be
  explained again.

**Not applicable**: deciding whether a paper is worth reading to its end — that is a per-question
judgement made section by section and recorded in the topic's ledger (`literature-recon` appends the
candidate and screens it; how far a paper is worth reading is a reading round's call, not this skill's),
a topic-level literature note (also `literature-recon`), or a one-off "what does this section say"
question that nothing later will depend on.

**A section note is not the digest, and the digest is not the reading record.** The reading record is
the topic's ledger row: `depth` says how far the paper was read, `verdict` says why it stopped, `grade`
how firmly we may speak about it. The section note explains one section; the digest is their paper-level
projection (§4).

## 2. First step: read the current state

Read-only, before writing anything:

1. **The record's own state**: `{{presetTools}}/zotero-section-note.mjs --item <recordKey>`. It prints
   every child note with its **tags** and **first paragraph**, then five lines:

   | Line | Meaning |
   |---|---|
   | `covered` | what live `/section-N` tags claim, per top-level section |
   | `retired` | notes marked `/retired` (tombstones), each with the note that names itself its successor |
   | `digest` | the live `/digest` note, if any |
   | `unknown` | notes with no `/section-` tag; **read these** |
   | `ambiguous` | notes carrying more than one `/section-` tag; fix them first |

   **The tool does not parse prose.** A note is coverage only if it carries `/section-N`; a note
   without one is `unknown`, and the judgement is yours. The tool's `covered` line is a claim about a
   tag, not about the note's content.

2. **Read every `unknown` note before writing.** Take its first paragraph from the plan; open the whole
   note with `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000` when the paragraph is not
   enough. Then make one of four moves:

   | What the note is | Move |
   |---|---|
   | a usable explanation of §N, in any format | `--claim --note <key> --section N` — only tags are written; the body is untouched; a note with no section tag also gets `/imported` |
   | about §N but needs our format or prose | `--rewrite --note <key> --section N --file <draft>` — dry run first; no backup is written |
   | wrong, junk, or in the way | `--retire --note <key> --reason "<why>"` — a tombstone; it may be erased later with `--delete --write` |
   | a digest, a whole-paper summary, or not a section note | **leave it.** It is not a section note and must not be claimed for one |

3. **State the coverage table before writing.** One line per section you are considering: the paper's
   own ordinal and heading · the note key that already covers it, or `none` · what it was judged on.
   Where your reading disagrees with a tag, report both and **stop** — a wrong tag is the owner's to
   settle, not something to write around.

4. **One existing section note as the ruler**, when the library has any:
   `{{presetTools}}/zotero-read.mjs --item <noteKey> --limit 12000`. The note's shape — where the
   heading line sits, how equations are delimited, how the closing summary reads — is the convention
   this skill follows. **An existing convention outranks the template below.**

5. **The paper's own section boundaries**, before reading for content. Ask
   `{{presetTools}}/zotero-pdf.mjs --item <recordKey> --outline` first: where the file carries the
   paper's own table of contents, the section list and its ordinals come from there. Where it carries
   none, pull the text in slices and find the headings, or locate one with `--grep`. Either way, **write
   down the heading line and its ordinal as you find them**: the heading is what the write step is keyed
   on, and section numbering is often unreadable in a scanned paper.

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

**The reading may stop inside the paper, and that is not a failure of this skill.** The unit is the
section the reading reached, not the paper. A section that was never reached gets no note and no
apology: the ledger's `depth` says where the reading stopped and its `verdict` says why, and those two
are the whole reason the remaining sections carry no note. In the report, say which sections were not
reached and that the reading stopped there — never "no note was needed". **An absent note is not
evidence that a section was read.**

### 3.2 What one note contains

1. **A heading line** naming the section by ordinal **and** by the paper's own title, translated if the
   note is not in the paper's language. Where the library can carry a note title, the title carries the
   same name — **attempted, never required**: measured here, a `title` patch on a note answers HTTP 500
   while a `tags` patch on the same note answers 204, so the section is named by the first line and by
   the `/section-N` tag, and the child-note list shows an untitled note.
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
  alone; a note that had no section tag also gets `/imported`. A claim is a durable statement that a
  later round can check; a note left unclaimed is read again every round.
- **A claimed import may be rewritten in place; a record may not.** `/section-N` + `/imported` is an
  import: `--rewrite` may replace its body (dry run, version guard). `/section-N` without
  `/imported` is a record: its prose is never rewritten in place. Retire it and write the replacement.
- **A wrong note is retired, never rewritten.** When a note explains its section
  badly enough that the section has to be explained again:
  `{{presetTools}}/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>"`. Its body is left
  exactly as it stands, a `/retired` tag makes it a tombstone rather than coverage, and the section
  becomes writable again. The replacement is then written with `--replaces <retiredNoteKey>`, which
  the tool refuses unless the retired note really is retired and really did explain the same top-level
  section. `--retire --undo` puts the claim back. **Deleting is a separate act**: only a `/retired`
  note is eligible, `--delete` prints the plan and the irreversibility facts, and `--write` erases it
  permanently — the channel has no trash. Do not delete what you have not read and retired.
- **The digest is not a section note.** One `/digest` per record, synthesized from the section notes
  after they exist (§4). It is not counted as coverage and is never claimed for a section.
- Notes are created in section order, so the record reads in the order the paper reads.

### 3.4 Rewriting an import is the agent's work; there is no tidy

- **There is no `--tidy` and no automatic math repair.** Writing a note is the agent's job. A tool that
  rewrote a formula because it looked like LaTeX was making a content decision while claiming to format
  one. The old mechanical rules are gone.
- **`--rewrite` is for an import**: a note with no `/section-` tag, or `/section-N` + `/imported`. It
  replaces the body with the draft the agent wrote, after a dry run and under a version guard. The
  note's key does not change, and no workspace backup is written: a section note transcribes the
  paper, the paper remains the source, and the plan prints the old first block before the write. If the
  note changed in the application while the draft was being written, the tool refuses rather than
  overwrite it.
- **A record is not rewritten in place.** Retire it and write the replacement (§3.3).
- **The formula shape is the agent's responsibility**: `$…$` inline, `$$` alone on its own lines for
  display, every symbol defined at first use, the paper's own equation number in prose. If the text
  layer is unreadable, climb the reading ladder and read the rendered page as an image (§7) before
  writing the formula.

## 4. The digest, after the notes

The digest is **the paper-level projection of the section notes**, not a reading receipt and not a
summary of the whole paper.

- **Write it after the section notes exist.** Every sentence in it must be traceable to a `/section-N`
  note; it introduces no fact those notes do not carry. That provenance rule is what makes it safe to
  build the digest from notes rather than from a raw, badly encoded PDF in one pass.
- **It covers the sections that have notes.** Say which ones, and say that results, conclusions and
  background are outside it. It is not a whole-paper summary; writing notes for the head and the tail
  would break the rule this skill exists for.
- **One record, one live `/digest`.** Write it with
  `{{presetTools}}/zotero-note.mjs --item <recordKey> --file <digest.html>`. When the synthesis changes,
  the same note is refreshed in place under a version guard, and the body it replaces is kept in the
  library: before the patch, the old body is written as a `/digest` + `/retired` child note. That
  snapshot takes part in no coverage and can be deleted later like any other retired note. The same
  visible text is `ALREADY RECORDED` and writes nothing.
- **A record with no section notes has no digest.** A survey, an abstract-only reading, or a paper whose
  reading stopped before the first method section is recorded in the topic's ledger row and gets no
  digest: a `stop` writes no notes, so there is nothing to project.
- **The reading record is elsewhere.** The topic's ledger row says how far the paper was read (`depth`)
  and why the reading stopped (`verdict`); the item's `/done` tag marks the record as read and carries
  neither. The digest says "this is what the sections that were read amount to". Do not use the digest
  as the reading record, and never write a `verdict` from a digest.

## 5. Do vs don't

### 5.1 Do

- Report the section list **before** writing: ordinal, the paper's own heading, and note / no-note with
  the reason for each.
- Read every `unknown` note before writing; say which ones you claimed, rewrote, or retired.
- Keep one note per top-level section, and name the section by the ordinal the paper itself uses.
- Say which attachment the text came from, and how many characters of it were read.
- Write the digest only after the notes, and cite the notes it projects.

### 5.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The record has no PDF/EPUB/HTML attachment, or the library has not indexed it | Report "no readable text"; write nothing. The note is not owed from the abstract. |
| The section is already claimed — the plan says so, **or your reading of the notes says so** | Report "already covered by note `<key>`" and skip it. Never create a second note for one section. |
| A note carries two `/section-` tags (`ambiguous`) | Fix the tags first; do not write while coverage is ambiguous. |
| An `unknown` note explains §N | Claim it (`--claim`), or rewrite it if it needs our format; do not write a second note beside it. |
| A note is a subsection-keyed note from an earlier round | Report it; merge its content into the top-level note, then retire it. Never create a note for the parent while it is there. |
| The paper is a survey/review with no derivation anywhere | Report "no method section". Do not force a note onto a background section. |
| The section boundaries cannot be established from the text | Report the headings you did find and **stop**; ask. A note keyed on a guessed ordinal collides with the real one later. |
| The section is a case study, a results table, or a conclusion | Do not write it. Say it was skipped and why. |
| The note runs long — well past the 5,000-character signal | Cut the case-study material and the restatement of the abstract, not the derivation, and say in the report that the section's method content is long. **Never split the section.** |
| The section is claimed by a note that is **wrong** | **Retire it** (`--retire --note <noteKey> --reason "<why>"`), then write the replacement with `--replaces <noteKey>`. Never edit its prose; deleting it is a separate act, allowed only once it is retired. |
| The text layer is unreadable, or a formula only exists in the image | Read the rendered page as an image (`--render` + `read_image`); say which rung answered. Do not trust the text layer for mathematics. |

## 6. Wording discipline

- The note explains the paper's method; it does not evaluate it. "This section derives X" is the
  note's register; "this is a good approach" is not in it.
- Keep the paper's own terms, with the translation at first use. Do not silently improve notation.
- Distinguish what the paper **states** from what the reader **infers**. An inference that is not in
  the paper says so.
- No numbers that the section did not produce. A constant that appears in the paper is quoted with its
  section; a constant that follows from the note's own arithmetic is marked as the reader's.

## 7. Report shape

The artifact is the notes and the digest on the library record. The report is what a later round needs:

1. `## Record` — key, title, the attachment read and how many characters of it.
2. `## Coverage` — one line per section of the paper that matters: ordinal · the paper's heading ·
   **the note key that claims it, or `none`** · what it was judged on. Counted per **top-level** section.
3. `## Unknown notes` — every note read from the plan's `unknown` list, and what was done with it:
   claimed · rewritten · retired · left as a non-section note.
4. `## Sections` — one line each: ordinal · the paper's heading · **note / skipped / not reached** and
   the reason. A section the reading never reached is `not reached`, and the line names the ledger's
   `verdict` that stopped the reading.
5. `## Notes written` — note key · section · characters, one line each, or "none".
6. `## Digest` — the `/digest` note key, the sections it covers, and the section notes it projects; or
   "none, because no section note was written".
7. `## Refusals and what was left alone` — every duplicate, ambiguous tag, missing file, unreadable
   boundary, and any note left as an import.
8. `## Read-back` — each note key and size as it read back after the write, which is the only evidence
   that the write happened.
9. `## Retired` — one line per note retired this round: note key · the section it claimed · **the
   reason** · the key of the note that replaced it, or `nothing names a replacement yet` · **whether it
   was then deleted** and the read-back that proved it. A tag cannot hold prose, so the reason is
   stored nowhere else: this section is where it is written down.
10. `## Owner actions` — one row per thing the round cannot do itself: the record · the note · the
    section · the action (retire · write the replacement · delete in Zotero · decide) · **why** · the
    draft's path. A deletion the preset may not perform lands here: a note that was never retired, or
    anything the owner would have to do in the application instead. A retired note the round deleted
    itself is reported under `## Retired`, not here.

## 8. Instrument discipline (where this skill most easily goes wrong)

- **Writing is one section per invocation, dry run first.** `{{presetTools}}/zotero-section-note.mjs`
  states the change, refuses a claimed section, and writes only with `--write`; it reads back what it
  wrote before reporting success. Never batch several sections into one command.
- **The judgement about coverage is yours; the tag is the backstop.** The plan prints every note's tags
  and first paragraph and names the `unknown` ones. A tag is a claim; a note with no tag is read. Where
  your reading and the tag disagree, report both and stop.
- **A write needs the owner's authorization** (`INV-EVID-3`). "Allow" covers one write; a lasting grant
  for that library means no dialog at all, and it is revoked in the reference manager, not here. A
  digest refresh is two writes — the retired snapshot, then the patch — so a single-use `Allow` is
  asked once for each, and one lasting grant covers both.
- **Retiring is one note, one write, and it states its reason before it acts.** Dry run first, then
  `--write`; the read-back asserts that `/retired` came back. Whether a tag survives the application
  rewriting a note's body is measured: it does (`/retired`, 2026-10-18). A missing tag is reported, not
  assumed away.
- **Deleting is the one irreversible act, and it comes after retiring.** `--delete --note <key>` prints
  the plan and the irreversibility facts; `--write` erases the note, and the tool proves it with a 404.
  Only a `/retired` note is eligible: this channel has no trash, so the note and its key are gone. The
  request carries the version the plan was read at; a note that moved is refused. Bulk cleanup stays
  the owner's act in the application.
- **When the round spans records, ask for the plan as JSON.**
  `{{presetTools}}/zotero-section-note.mjs --item <recordKey> --json` prints the same facts the prose
  plan does: every note's tags, section, retired/imported/digest state, and the `unknown` and
  `ambiguous` lists. Assemble the owner-action table from that, never by parsing the prose.
- **Reading is a budget.** An attachment's whole text comes back in one response — measured at 33k to
  88k characters for the papers this discipline is used on — while this preset's result pruner keeps
  only a result's head and tail above 8,192 characters. Read in slices:

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
- **Whose write is it.** One paper is done inline. From three papers onward, hand each paper to one
  child under `subagent-contract` — the child reads the text and writes the note bodies to files under
  `<workspace>/.section-notes/<recordKey>/` and returns a manifest, and **the parent performs every
  library write and every read-back**. A library change is the gated, auditable act, and keeping it in
  one pair of hands is what makes "no duplicate, no overwritten note" checkable.
- **Workspace drafts are working files**, not deliverables; they carry no authority and need no
  authority to delete. The layout lives in `<workspace>/.section-notes/README.md`.
- **A workspace file does not carry the resolved helper path.** Name the program, say the path comes
  from this discipline, and pass a resolved path to a child in its prompt when one round needs it.

## 9. Acceptance checklist

- [ ] The section list was reported before any write, each with note / skipped and a reason
- [ ] Every `unknown` note was read, and the report says what was done with it
- [ ] The coverage table was reported per **top-level** section, with the claiming note or `none`
- [ ] No note was written for a subsection; no dotted tag was created
- [ ] No note was written for the abstract, the introduction, the case study, or the conclusions
- [ ] Sections the reading never reached are reported as `not reached`, with the ledger verdict that
  stopped it, rather than as "no note needed"
- [ ] Every note carries `/section-N` and the paper's own ordinal and heading
- [ ] Every equation is inside `$…$` or `$$…$$`, with display math on lines of its own
- [ ] Every symbol used is defined at its first appearance
- [ ] Each note ends with a summary naming its contribution and its hand-off to the next section
- [ ] Any note outside the 1,500–5,000 signal range is explained
- [ ] Each write was a dry run first, and its read-back is quoted
- [ ] The digest was written after the notes, cites the sections it covers, and every sentence traces to a section note
- [ ] No section is claimed twice; every skip is reported
- [ ] Every retirement is reported with its reason and its successor
- [ ] Every deletion was a `/retired` note, planned first, and the report quotes its read-back 404
- [ ] `## Owner actions` is reported, and written to the study's `research/owner_actions.md` when anything is left for the owner

## 10. Don't

- Do not summarize the paper. The unit is the method section, not the paper.
- Do not write a note keyed to a subsection, and do not fold a dotted note silently: merge it or retire it.
- Do not write a note for a section that was not read in this session.
- Do not duplicate coverage to "complete" a record, and do not delete someone else's note.
- Do not delete a note that is not retired, and do not delete one to free its section: retiring frees
  it, and deletion is permanent. Do not retire a note you have not read: retiring asserts that the note
  is wrong, and that is a claim you have to be able to state the grounds for.
- Do not rewrite a `/section-N` record in place; retire it and write the replacement. Only an
  `/imported` note is rewritten in place.
- Do not use `--tidy`: there is no automatic repair. Read the text or the page image and write the body.
- Do not let a child write into the reference library.
- Do not turn the note or the digest into review prose, a grade, or a judgement of the paper's quality.
