---
name: literature-recon
description: Search the literature and produce a "literature reconstruction note" — every claim carries a locatable source, every source is graded for evidence strength (read the full text / read only the abstract / second-hand paraphrase), contradicting evidence must be recorded, and the note declares itself non-normative. Use to judge "has anyone already done this", to ground a method choice, to draft related work, or to supply evidence for a ruling.
---

# literature-recon — literature search and non-normative reconstruction

This skill does exactly one thing: turn "what have others done on this" into a note that is **traceable and refutable**. It does not write review prose and does not pronounce field consensus.

## 1. When to use

- Judging "has this question been asked before" and "how far did it get"
- Grounding a method choice in prior work
- Collecting material for a related-work or background section
- Supplying locatable evidence for a ruling request (`redteam-ruling`)

**Not applicable**: a passing question about what a term means (ordinary search suffices), and deciding
**how far a paper is worth reading for a question**. This skill appends candidates and reads whatever a
claim needs in order to stand; how far the *paper* is read, and why that reading stopped, is a reading
round's judgement — `depth` and `verdict` in the topic's ledger — and this skill makes it nowhere.

## 2. First step: read the existing constraints as a ruler

Do a **read-only survey** first. Never rely on memory:

1. Does the workspace already have literature notes? Where, under what naming, and in what citation format?
2. Is there an existing citation convention (uniform DOI use, a rule for marking preprints)?
3. Does the project already grade evidence strength? (If so, follow it; do not invent a second scheme.)

Write the result up as a **"ruler" list** — it is the input to §3.

**Search order is part of the ruler.** Check these in order, and say which step produced each source:

```text
1. the owner's local library       curated, already read, and the only channel holding full text of
                                   paywalled work — searched in FULL-TEXT mode, never by title alone
2. the preprint index              newest work — nothing is in a library the day it appears
3. open-access fallback            a free copy of a paywalled work: repository copy, accepted version,
                                   author copy — still only a lead until it is actually retrieved
4. bibliographic REST              identifiers, venues, counts: metadata, never evidence
```

Three consequences must be stated rather than assumed:

- **A local library is not current.** A hit there is not evidence that nothing newer exists.
- **A local search returning nothing is not evidence of absence.** Local search is keyword-matched,
  so a synonym or a different spelling looks like a miss. Distinguish "not searched" from "searched
  and absent" (resident discipline, rule 5).
- **A library search is not a full-text search unless it is run as one.** The default mode matches
  titles, creators and years, so a paywalled paper the owner already holds looks absent. Full-text mode
  also reaches abstracts, notes and attachment full text — stored and linked attachments alike.

> **Forbidden**: writing any literature entry before actually searching and reading. **A citation generated from model memory counts as fabricated.**

## 3. Criteria

### 3.1 Three evidence grades (**every source must carry one**)

| Grade | Meaning | Usable as |
|---|---|---|
| `A` | The **specific passages the claim rests on** were read, and their locator is recorded | Evidence for a fact |
| `B` | Only the **abstract / introduction** was read | A lead only; not evidence for a fact |
| `C` | Only a **second-hand paraphrase** (another paper or page mentions it) | A paraphrase; upgrade only after retrieving the original |

A grade is about the sentence it sits on, never about how much of the paper was read. A claim resting
on §3 read line by line is `A` while the reading stopped at `§3`: the ledger carries both, `grade=A` and
`depth=§3`, and neither is a lie about the other. **`A` does not mean "the whole paper was read"** — the
column that says where a reading stopped is `depth`.

**This table is the definition of the grades.** The study template, the triage discipline and the
adoption discipline cite it; none of them restates it, so a change lands in one place.

### 3.2 Every citation must be locatable

Give title · authors · year · venue or preprint server · one retrievable identifier (DOI / arXiv id / URL). **If it has no retrievable identifier, it does not go in.**

### 3.3 Every claim maps to a source

- **Every** claim you write must carry at least one source.
- A claim with no source is either deleted or marked `[exploratory]` with an explicit "this is speculation".
- Distinguish three kinds of absence: **not searched** / **searched and confirmed absent** / **not yet searched**. Never conflate them.

### 3.4 Contradicting evidence is mandatory

Literature that contradicts your expectation or the target claim gets its own section. Collecting only supporting literature means this skill failed.

## 4. Do vs don't

### 4.1 Do

- State the search question before searching, and record it in the note
- One note per topic; topics may link to each other
- Record the query and the search scope (database, time window) so it can be reproduced
- **Append one row per candidate to that topic's reference ledger**, filling `itemKey`, `year`,
  `found via`, and the `grade` and `depth` the round actually reached. Read no verdict into a row: no
  round here decides whether a paper is worth reading to its end.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The source cannot be located (no DOI / no URL / cannot recall where it came from) | **Do not cite it.** Better absent than invented. |
| Only a `C`-grade paraphrase | Mark it a paraphrase; never use it as evidence for a fact. |
| Literature contradicting the claim was found | It must go into the contradicting-evidence section. Never hide it. |
| It is a preprint / not peer reviewed | Mark it explicitly. |
| "Many studies show" with no concrete references | Either supply the concrete references, or downgrade to "insufficient evidence found". |
| The record already carries a note that reads as a whole-paper summary | Read it; it is **not** a section note and must not be claimed for one. A note an earlier version tagged `/digest` is this case: report it as a legacy digest, leave it, and do not create a second one. |

## 5. Wording discipline

- **Forbidden**: "many studies show", "it is widely believed", "the field agrees" — unless you supply the **concrete reference list**.
- **Distinguish**: "that paper claims X" from "X holds". The first is a citation; the second is a judgement.
- **Distinguish**: a single result / several consistent results / a genuine systematic review or meta-analysis. Their evidential standing differs; do not blur the wording.
- Present inconsistent conclusions side by side. Do not "reconcile" the literature on its behalf.

## 6. Report shape

Artifact: `<layer root>/references/<topic>.md`, relative to the study's **layer root** — `research/`
where that directory exists, the study root otherwise (protocol §7). A study with its own document
hierarchy wins over both: put the file where that hierarchy puts it.

Fixed sections:

1. `## Search question` — what I am answering, the query and its scope
2. `## Summary of findings` — ≤10 lines, each carrying a source id and its grade
3. `## Reference ledger` — the nine columns of `<layer root>/references/README.md`. This round appends
   `itemKey | year | found via | grade | depth` per candidate; `verdict | basis | re-open if | date`
   stay empty, because they are a reading round's to write.
4. `## Contradicting evidence` — literature conflicting with the summary; if none, write "none found" and state the search scope
5. `## Gaps and unknowns` — what was not found, and whether that is "not searched" or "confirmed absent"
6. `## Reading log` — appended when a verdict changes, in `<date> | <itemKey> | <old> → <new> | <basis> | <who>`. A search round adds no line.
7. `## Non-normative declaration` — one fixed line: **this file is a non-normative reference and must not by itself ground an experiment design or a conclusion**

## 7. Instrument discipline (where this skill most easily goes wrong)

- **Search the preprint index** with `{{presetTools}}/arxiv.mjs` — an absolute path, because this preset
  ships its helpers outside your workspace and a relative `tools/...` resolves to nothing there. Give it
  a query with `--search` (the index's own syntax: `ti:` `au:` `abs:` `cat:`, `AND` / `OR`, quoted
  phrases) or identifiers with `--id`, and use `web_search` / `read_page` / `x_search` for everything
  that is not a preprint record. Four properties of it are load-bearing:
  - it makes **one** request per run, and the index allows one request every three seconds — never loop
    it. Several ids ride one request: `--id 1706.03762 --id 2610.19549`.
  - it sorts by **relevance** by default, which is **not** the web interface's date order. Pass
    `--sort submittedDate` when recency is what you mean.
  - **read the query it echoes back.** The index silently rewrites some malformed input — a measured
    stray quote turned `abs:"unclosed` into `abs:unclosed OR all:quote`, a wider and different search
    that still returned results. The echoed line is the only place that rewrite is visible.
  - its output states `total` beside what it showed, so "10 shown" is never read as "10 exist". A
    printed row is always a real record, because an upstream failure is refused rather than printed;
    and `0 results` means the query was answered and matched nothing — a finding, not a failure.
- **A study scaffolded before Revision 22 may still carry `research/literature/refs/`.** Nothing reads
  it: the study-level receipt index was abolished, and a ledger now lives in each question's own
  literature file. Report it in the round's result and propose removing it — but **do not delete it**.
  Tidying the owner's workspace is not a search round's act, and a stale index that is silently gone is
  worse than one that was named out loud and left in place.
- **Search the library in full-text mode.** `{{presetTools}}/zotero-read.mjs --search "<query>"` defaults
  to the mode that matters: `qmode=everything` looks in abstracts, notes and **attachment full text**,
  while the library's own default searches titles, creators and years only — so a paywalled paper the
  owner already holds looks absent. Measured on one query: **177 hits under `everything` against 2**
  under `titleCreatorYear`. The tool prints the mode it used, so a report can say which one answered.
  Expect a MIX of rows: an attachment or a note that matched *inside* a record, and records that matched
  by metadata. The tool collapses them onto the record and states what matched, so one paper is one line;
  a hit gives the record key, and the ladder below says where to go from there.
- **A source may enter the ledger only if a page or abstract was actually retrieved.** Literature from memory does not count.
- Do not modify the conclusions of existing literature notes; only **append** new evidence.
- **Reading a long full text without destroying the context.** The library answers with an attachment's
  whole indexed text in one response — measured **76,908 characters** for a 17-page paper — which is far
  above the 16,000 characters the shell tool returns from one command, and far above the 8,192-character
  point at which the result pruner reduces a tool result to its head and tail when the context is
  compacted. Read it in slices, and let the tool do the arithmetic:

  ```powershell
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --limit 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --offset 12000    # the first slice names this
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --grep "<search term>"
  ```

  Two facts it states rather than hides. Full text is keyed by the **attachment**, not by the record, so
  it lists the children, reads the PDF in preference to an HTML snapshot, and says **which** attachment
  it read — because which file was read is part of the evidence. And a record whose attachment the
  library has not indexed says so, rather than looking like a record with no text. If you ever call the
  local API by hand instead, use `curl.exe`: it answers `HTTP/1.0`, and `Invoke-WebRequest` fails on it.
- **Getting a preprint's own text.** The preprint channel returns metadata and abstracts only — it has no
  full-text reader. When a claim needs the body, take it from the cheapest source that actually has it:
  the owner's library first, whose full-text search reaches a stored copy, then a free copy by URL. To
  keep the PDF itself:

  ```powershell
  curl.exe -sL -o paper.pdf "https://arxiv.org/pdf/<arxivId>"
  # verify, or it is not a download: content-type application/pdf, a size in MB, magic bytes %PDF
  ```

  The index's terms of use forbid serving its e-prints from our own servers; retrieving a copy in order
  to read it is allowed, and that copy stays a local working file this preset never republishes.
- **Adding a reference to the owner's library.** Use `{{presetTools}}/zotero-write.mjs` — an absolute path, because this preset ships its helpers outside your workspace and a relative `tools/...` resolves to nothing there. It is a **dry run unless `--write` is given**, and it never creates a second copy of something already in the library: it names the record that is there and exits **0**, because the state asked for already holds — nothing was written, and `--force` is the only way to ask for a duplicate. Propose the addition and let the owner answer the reference manager's dialog: "Allow" covers that one write, and "Always Allow" is their standing grant for that library, which this preset keeps on their machine and they can revoke in the reference manager. Never ask for "Always Allow", and never treat a refused or revoked authorization as granted. Adding to a collection is **the same write**, not a follow-up: `--collection <key>` puts the filing in the create body. It takes a collection **key** (`{{presetTools}}/zotero-collection.mjs --list` prints them), never a name — two collections may share a name under different parents, so a name is refused instead of guessed. A record created without one is not stuck at the library's root: `{{presetTools}}/zotero-collection.mjs --assign <itemKey> --collection <key> --write` files it afterwards, at the cost of a second write.

  ```powershell
  node "{{presetTools}}/zotero-write.mjs" --arxiv 1706.03762          # dry run: resolve, build, print
  node "{{presetTools}}/zotero-write.mjs" --doi 10.xxxx/yyyy --write  # owner answers Zotero's dialog
  node "{{presetTools}}/zotero-write.mjs" --doi 10.xxxx/yyyy --collection ABCDEFGH --write  # filed in the same create
  ```

  The write is only accepted once a **read-back** of the created item matches the title, DOI and creator count — and, when a collection was named, its `collections`. Never report "added" from the POST response alone. `UNFILED` is its own verdict: the record **is** in the library while the filing did not stick, so report it that way, run the `--assign` command the tool prints, and never re-create the record to cover for it.
- **Read at the cheapest level that can answer the question.** Never load a full text to find one fact. The channels offer a ladder, and the discipline is to climb it in order:

  ```text
  metadata / abstract   the item's metadata · the preprint abstract      the default starting point
  targeted passage      a page-range read of the item's attachment       take only what is needed
  full text (last)      pull the whole text to a file, read by offset    only when reading through
  ```

  Every rung here is backed by an instrument this preset ships, and the passage rung is reached by
  content rather than by structure: `--grep` locates the term and the tool reports the passages around
  it. This is the ladder of **what to load**. The reading ladder the contract counts in `INV-CTX-1` is a
  different one — the four ways a text can be obtained, whose third rung is the paper's own table of
  contents (`zotero-pdf.mjs --outline`). That rung answers *where* a section is and never *what it
  says*, so it is climbed before a passage read and is never quoted as text. A rung nothing can climb
  is still not named.

  A full text pulled for one paragraph is context spent for nothing.
- **Check the topic's ledger before reading anything.** `<layer root>/references/<topic>.md` holds one row
  per paper. A row whose `verdict` is empty is **queued**: the paper is in scope and nobody has judged it
  for this question yet. A row that carries a `verdict` — `park` · `enough` · `stop` — plus its `depth`
  says where the last reading stopped and why, which is the state this round starts from. Before opening
  a paper for this question, look for its row; before opening one for another question, look for it in
  that question's file (`grep -r "<itemKey>" <layer root>/references/*.md`).
- **After reading, record what was read in that row.** Append the row if this is
  the paper's first appearance, then fill `grade` and `depth` from what was actually retrieved — `B` +
  `abstract` for a screening read, `A` + `§N` or `full` for the sections actually read. Nothing else
  records how far a paper was read, and both cells are written from the text in front of you or not at
  all. Turning a method section into a note is `section-notes`' act, and only when the owner names that
  section; a paper nobody wrote notes for is still recorded here: the row is the record, not a summary.

  ```powershell
  node "{{presetTools}}/zotero-edit.mjs" --item "<itemKey>" --add-tag /done --remove-tag /unread --write
  ```

  The item's `/done` tag is a **marker, not a record**: it carries neither a grade nor a depth, and no
  judgement reads it. What the next round reads is the ledger row.
- **Declare the reading budget before searching.** Name how many sources will be opened and at which grade, and stop at it. A round that reads ten full texts to answer one question has spent its budget on the wrong thing.
- Do not fill in unread passages to make the note look complete.

### When no free channel produces the full text (owner-in-the-loop)

Climb these rungs in order and stop at the first one that answers:

```text
1. the local library, full-text mode   already paid for, already on disk        costs nothing
2. the preprint index / OA fallback    a free copy of the same work             costs a lookup
3. the owner's authenticated browser   the only channel holding an institutional
                                       session, and the only one that may use it costs the owner's time
```

Rung 3 is the last resort, and what it produces is a **request, never an instruction**:

| Field | Content |
|---|---|
| identifier | DOI / preprint id / landing URL — enough to fetch it without searching again |
| what it settles | the exact claim this source would support, and what stays undecidable without it |
| level needed | abstract · one named section · full text — ask for the cheapest level that settles the claim |
| already tried | which free channels were tried, and what each answered |
| budget | at most N items in one request |
| state | `requested` → `received` → `read` — a file that arrived is not a paper that was read |

Two rules bound rung 3:

- **Do not ask before the free rungs are exhausted and reported.** "I could not get it" with no record
  of what was tried is an instruction with extra steps.
- **Receiving a file is not permission to store it.** Adding it to the library stays the owner's
  authorization, given in the reference manager, and a file that arrived but was not read appears in
  neither the topic's ledger nor its summary of findings.

The lookup mechanics for rung 2 belong to `metadata-query`; retrieving and reading a copy belongs to the
reading channels above. This skill decides which rung is reachable, and records what each answered.

## 8. Acceptance checklist

- [ ] Every source has a retrievable identifier
- [ ] Every source carries an A/B/C grade, and a `depth` consistent with what was actually read
- [ ] Every claim carries a source, or is marked `[exploratory]`
- [ ] The contradicting-evidence section is filled (including a stated "none found")
- [ ] The query and search scope are recorded
- [ ] Preprints are marked
- [ ] Each candidate has one ledger row, and no row carries a `verdict` this round did not reach
- [ ] The non-normative declaration is present

## 9. Don't

- Do not write review prose or perform a meta-analysis
- Do not pronounce field consensus
- Do not modify normative documents (that requires a revision record)
- Do not make research decisions for the user, and do not decide how far a paper is worth reading: that
  judgement belongs to a reading round, and it is recorded as `depth` and `verdict` in the topic's ledger
- Do not write a `verdict`, a `basis`, or a `re-open if` into a ledger row
