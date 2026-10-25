---
name: key-terms
description: Use when the owner asks for a paper's key terms, or names a collection whose remark lines still need them. Drafts three to five phrases naming what the paper does from its section notes, and rewrites only that middle segment of the record's remark line.
---

# key-terms — the phrases that say what a paper does

One record, one line, one segment of it. The owner keeps a one-line digest of each paper in the record's
`extra` field: a bracketed verdict, then three to five phrases naming what the paper does, and sometimes a
sentence of his own. **This discipline drafts the phrases and rewrites nothing else.** The verdict and the
rating are his; his sentence is his; the other lines of `extra` are not this record's digest at all.

**It is not a summary and not a review.** A summary would say more than the phrases can carry, and a
review would say whether the paper is any good — which is the verdict's job, and the verdict is his.

## 0. The two parts that are not ours

| Part of the line | Whose | This discipline |
|---|---|---|
| the bracketed verdict, `（一般）` | the owner's | reads it, never writes it |
| the phrases | **drafted here** | the only segment the write replaces |
| a closing sentence of his own, if any | the owner's | carried through verbatim, never paraphrased |
| `rate:` | the owner's | never read as an instruction, never written |

`extra` carries **no provenance mark** — unlike a note, which says `/agent-note` or `/imported` in its
tags. So "who wrote these words" cannot be recorded after the fact, and it has to be settled before the
write: the tool takes the whole next line and the exact current line, and **you** are the one who decides
what inside it is the phrases. What no tool can check is that you kept the owner's words; the dry run is
what makes that checkable by him.

## 1. When to use

- The owner names a record and asks for its key terms, or asks where its remark line stands.
- The owner names a collection and asks for the phrases of the records in it.
- A `section-notes` round has just written the notes for a paper and the owner asks for its line.

**Not applicable**: deciding whether a paper is worth reading (`reading-triage`), writing or claiming a
section note (`section-notes`), deciding what to borrow from a paper (`adoption-ruling`), or judging the
paper's quality — that is the owner's verdict, and it is already in the line.

**A record with no section notes gets no phrases, and no reminder.** The phrases are owed by the notes;
a record that has none is not a gap to queue, and **nothing is generated until the owner asks for that
record or that collection**. Do not offer to fill it later, and do not list the library's unannotated
records as work.

## 2. First step: the line, then the notes

Read-only, in this order:

1. **The line as it stands** — `{{presetTools}}/zotero-remark.mjs --item <recordKey>` prints the remark
   value, its bracketed verdict, the body after it, and every other line of `extra` the write will leave
   alone. It **infers no boundary**: which text is his closing sentence is your reading, and the write
   quotes that whole value back so a stale line cannot be rewritten from an earlier round.

2. **The notes' own first paragraphs** — `{{presetTools}}/zotero-section-note.mjs --item <recordKey>`
   prints one block per child note: key, characters, its first paragraph, and the tags that say whether a
   section is covered. **This decides most records.** The first paragraph of a section note names the
   section's own subject, which is the phrase.

3. **The part of the note that decides it** — `{{presetTools}}/zotero-read.mjs --item <noteKey> --headings`
   lists the note's own headings with the offset and the length of each; `--offset N --limit M` then reads
   just that part, and `--grep "<term>"` reads the paragraphs that mention a term. Reading the whole note
   is the last resort, not the first: `--limit 12000` on a section note costs its entire length (measured,
   9,413 characters for 27 headings). Say which notes were opened, and to which part of them.

4. **The paper's own outline** — `{{presetTools}}/zotero-pdf.mjs --item <recordKey> --outline` only when
   the notes' headings carry no ordinal and the order is in doubt. It is authoritative about what the
   paper says its sections are, and about nothing else.

**Nothing is written from memory, and the abstract is not a substitute for a missing note.** A phrase
that came from the abstract would read exactly like one that came from the method, and nothing in the
field would ever show the difference.

## 3. Criteria

### 3.1 Which sections contribute a phrase

**One phrase per method section, in the paper's own order.** A "method section" is the one that defines
or derives something — the same table `section-notes` §3.1 uses:

| The section contains | A phrase? |
|---|---|
| A representation, model, derivation, method, algorithm, index, or assumption | **Yes — one** |
| One contribution per section (a multi-factor paper) | **Yes — one each** |
| Abstract, introduction, background, related work, motivation, nomenclature | No |
| Case study, numerical results, experiments, validation, discussion, conclusion, appendix | No |

A five-section paper with three method sections gets three phrases. A paper whose case study invents a
metric gets no phrase for it. **Say the section order you used** in the report; that order is the only
thing making the phrase list readable as "what this paper does, in the order it does it".

### 3.2 What a phrase is

A phrase names **a thing the paper contributes**: a representation or a model, a metric, an algorithm, or
the object a method computes. It is a noun phrase in the paper's own vocabulary, not a sentence about the
paper.

| A phrase is | Not a phrase |
|---|---|
| `母线连续故障概率矩阵` — a representation | `提出了一种矩阵方法` — a claim about the paper |
| `三类相关性指标` — a metric set | `级联故障` — a topic the paper merely sits in |
| `FPG-GS 算法` — a named artifact | `IEEE 118-bus 验证` — the testbed, not a contribution |
| `关键元件与故障链` — the computed object | `框架还可以` — an opinion, which is the verdict's |

- **Merge what reads as one thing.** `X 模型` plus `X 的构建` plus `X 的计算` is one contribution written
  three times; a subsection is not a contribution. The test is whether a reader could say which of the
  two a later note is about — if not, they are one phrase.
- **Keep the paper's vocabulary**, with the original in full-width brackets where the Chinese alone would
  not be recognised: `交互矩阵`, `st-GCN`, `Inter-Regional Interaction Graph（跨区域交互图，IRIG）`. A
  named algorithm stays in English; a translated object keeps its Chinese name first.
- **Phrases are short.** His own lines run about eight characters at the median and rarely past twenty;
  the tool's bound is a shape check, not a target. A phrase that needs a clause is usually two phrases,
  or the wrong section.
- **Joined by a full-width `；`.** The write joins them, and keeps the separator the line already
  ended with — a line that closed with `；` still closes with one, so a rewrite changes the words and no
  punctuation. Do not hand-format the line.

### 3.3 How many

**Three to five is the target, not a quota.** Two is right for a paper with two method sections. One is
right for a paper with one contribution — his own line for a one-method paper is a single phrase. Never
pad to three, and never split a contribution to reach it: a phrase list read aloud should sound like the
paper's method sections, in order, and nothing else.

## 4. The seam: the whole line, and the two things that are not yours

`{{presetTools}}/zotero-remark.mjs --item <key> --new-line "<the whole value>" --expect-current "<the exact current value>"`

**The tool assumes no shape.** It does not parse phrases, does not decide where a sentence starts, and
accepts a line whose closing sentence sits in the middle as readily as one that ends with it. You compose
the whole value; `--new-line` is what the line will say.

What it does check is structural, and only that: the current value must be quoted back **character for
character** (`--expect-current`), a record with more than one `remark:` line is refused, a value carrying
a line break is refused, `--write` is refused without `--new-line`, and every other line of `extra` is
carried over as it was. So:

- **Quote the old line from the read output**, never from memory: a line read in an earlier round is
  refused rather than allowed to overwrite what the owner has written since. That refusal is the read-before-write
  rule, not a format rule.
- **The verdict inside the new line is his.** The dry run prints a `NOTE` when the bracketed value changes
  — it does not block you, and it should never print, because changing it is not yours to do.
- **His closing sentence is yours to carry.** Nothing mechanical protects it any more: it survives only
  because you kept it, and because the dry run prints the old line beside the new one before anything is
  sent. That is the trade the owner chose, and it makes this paragraph the load-bearing one.
- **A record whose `extra` has no remark line** needs `--create`; the line is added first, with no verdict
  invented and no rating. Say in the report that the line now carries phrases and no verdict.
- **`rate:` is never written.** It is his rating, it is a different line, and a write that changed it would
  be invisible in the phrases he asked for.
- **The format is a convention, not a gate** — `（评价）词；词；我的一句话`, full-width `；`, his own
  vocabulary. Follow it because a line that does not read like his others is a line he has to fix by hand.
  When a record genuinely cannot take that shape, say which part and why instead of bending the format.

## 5. Do vs don't

### 5.1 Do

- Read the line and the notes' first paragraphs **before** drafting a phrase, and say which notes the
  phrases came from.
- Draft in the paper's order, and say which section each phrase answers to.
- Say every record whose phrases you could not draft, and why (no notes · a section whose note does not
  say what it contributes · a record whose line already holds a sentence you were not asked to touch).
- Dry run, then show the change, then write. **One record per write**, with the read-back.

### 5.2 Stop conditions — hit one, stop and ask, do not work around it

| Hit | What to do |
|---|---|
| The record has no section notes | Report "no notes, no phrases". Do not draft from the abstract, and do not queue it. |
| The notes' own headings do not say which section each explains | Report the headings found and stop; a phrase keyed to a guessed section is the wrong contribution. |
| The line carries a closing sentence | Compose the new value so it survives **verbatim**, and say so in the report. Nothing checks it for you. |
| The line's shape is not the usual one (two verdicts, a sentence in the middle) | Expressible: send the whole new value, keep every part you were not asked to change. Say in the report that the line's shape was not the usual one. |
| The record carries more than one remark line | Report it and stop. |
| The draft would need a sixth phrase | Merge, or drop the weakest — and say which contribution went unrepresented. |
| A phrase is about the paper's quality, its venue, or its data | Not a phrase. That is the verdict's business. |
| The write would change `rate:` or any other line | Do not. The tool carries them over; a plan that cannot is a plan to stop. |
| The owner asks to fill every unannotated record in the library | Not this round: he asks per record or per collection, and a record with no notes gets nothing. |

## 6. Report shape

The artifact is the rewritten line; the report is answered to the owner and **is not saved as a file**.

1. `## This round` — the record keys, the collection if one was named, and the date.
2. `## Draft` — per record: the paste-ready line · then one row per phrase: `phrase · section ordinal ·
   the note key it came from`. **The phrase table is the evidence**; a phrase with no section row is a
   phrase that was invented.
3. `## Written` — per record: the read-back line, or `none`. A line that comes back without the phrases is
   a failed write, not a done one.
4. `## Not drafted` — per record, one line: why (no notes · heading ambiguous · a sentence that would not
   match · more than one remark line).

**Budget** — ≤40 lines of prose (the phrase tables aside). Past it, cut in this order: a repeated reason →
per-record detail the read-back already shows → how the phrases were worded. Never cut the phrase-to-section
evidence or the list of records that got nothing.

## 7. Instrument discipline

- **Read the line with `zotero-remark.mjs --item`, not with `zotero-read.mjs --json`.** The JSON answer is
  the whole record *including every child note's stored HTML*: tens of thousands of characters for a field
  of a few dozen. A plain read prints `extra` as lines.
- **The notes' first paragraphs are the cheap pass.** One `zotero-section-note.mjs --item` call answers the
  whole record; open a note in full only when its first paragraph does not settle the contribution.
- **Dry run first, every time, and show the change.** The write is one record, and the reference manager
  asks the owner to Allow it — that dialog is his, not a formality to get past.
- **Read the exit code as three answers.** `0` = written and read back · `1` = refused and **nothing was
  written** · `3` = sent or written but **not confirmed**. Exit 3 is not a failure to retry: read the record,
  then decide. A caller that treats 3 as 1 writes the line twice.
- **A collection is drafted one record at a time, and written one record at a time.** Say before starting
  how many records this round can reach: each costs a line read plus a notes plan, and the records not
  reached are reported as not reached rather than dropped.
- **The write needs the owner's authorization.** "Allow" covers one write; a lasting grant is revoked in the
  reference manager, not here. Never ask for `Always Allow`.
