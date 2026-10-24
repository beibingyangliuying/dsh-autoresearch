---
name: literature-recon
description: Use to judge whether anyone has already done this, to ground a method choice, to draft related work, or to supply evidence for a ruling. Produces a non-normative reconstruction note — every claim locatable, every source graded by what was actually read, contradicting evidence mandatory.
---

# literature-recon — literature search and non-normative reconstruction

This skill turns "what have others done on this" into a note that is **traceable and refutable**. It does
not write review prose and does not pronounce field consensus.

## 1. When to use

- Judging "has this question been asked before" and "how far did it get".
- Grounding a method choice in prior work.
- Collecting material for a related-work or background section.
- Supplying locatable evidence for a ruling request (`redteam-ruling`).

**Not applicable**: a passing question about what a term means (ordinary search suffices), and deciding
**how far a paper is worth reading for a question** — that is `reading-triage`'s judgement, recorded as
`depth` and `verdict`, and this skill makes it nowhere.

## 2. First step: read the existing constraints as a ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

Read-only, never from memory:

1. Does the workspace already have literature notes? Where, under what naming, and in what citation format?
2. Is there an existing citation convention (uniform DOI use, a rule for marking preprints)?
3. Does the project already grade evidence strength? If so, follow it; do not invent a second scheme.

**Search order is part of the ruler.** Check these in order, and say which step produced each source:

```text
1. the owner's local library       curated, already read, and the only channel holding full text of
                                   paywalled work — searched in FULL-TEXT mode, never by title alone
2. index discovery                 `scholarly.mjs` fuses the indexes into ranked leads; `arxiv.mjs` for
                                   the preprint index's own syntax — newest work lives here
3. open-access fallback            a free copy of a paywalled work: repository copy, accepted version,
                                   author copy — still only a lead until it is actually retrieved
4. bibliographic REST              identifiers, venues, counts (`metadata.mjs`): metadata, never evidence
```

Three consequences, stated rather than assumed:

- **A local library is not current.** A hit there is not evidence that nothing newer exists.
- **A local search returning nothing is not evidence of absence.** It is keyword-matched, so a synonym or
  a different spelling looks like a miss. Distinguish "not searched" from "searched and absent".
- **A library search is not a full-text search unless it is run as one.** The default mode matches titles,
  creators and years, so a paywalled paper the owner already holds looks absent.

> **Forbidden**: writing any literature entry before actually searching and reading. **A citation
> generated from model memory counts as fabricated.**

## 3. Criteria

### 3.1 Three evidence grades (**every source must carry one**)

| Grade | Meaning | Usable as |
|---|---|---|
| `A` | The **specific passages the claim rests on** were read, and their locator is recorded | Evidence for a fact |
| `B` | Only the **abstract / introduction** was read | A lead only; not evidence for a fact |
| `C` | Only a **second-hand paraphrase** (another paper or page mentions it) | A paraphrase; upgrade only after retrieving the original |

A grade is about the sentence it sits on, never about how much of the paper was read. A claim resting on
§3 read line by line is `A` while the reading stopped at `§3`: the ledger carries both, `grade=A` and
`depth=§3`, and neither is a lie about the other. **`A` does not mean "the whole paper was read"** — the
column that says where a reading stopped is `depth`.

**This table is the definition of the grades.** The template, `reading-triage` and `adoption-ruling` cite
it; none restates it, so a change lands in one place.

### 3.2 Every citation must be locatable

Give title · authors · year · venue or preprint server · one retrievable identifier (DOI / arXiv id /
URL). **If it has no retrievable identifier, it does not go in.**

### 3.3 Every claim maps to a source

- **Every** claim carries at least one source — once, where the claim enters the file; a row that already
  carries it is cited by its row, not re-sourced in the prose.
- A claim with no source is either deleted or marked `[exploratory]` with an explicit "this is
  speculation".
- Distinguish three kinds of absence: **not searched** / **searched and confirmed absent** / **not yet
  searched**. Never conflate them.

### 3.4 Contradicting evidence is mandatory

Literature that contradicts your expectation or the target claim gets its own section. Collecting only
supporting literature means this skill failed.

## 4. Do vs don't

### 4.1 Do

- State the search question before searching, and record it in the note.
- One note per topic; topics may link to each other.
- Record the query and the search scope (database, time window) so it can be reproduced.
- **Append one row per candidate to that topic's reference ledger**, filling `itemKey`, `year`,
  `found via`, and the `grade` and `depth` the round actually reached. Read no verdict into a row: no
  round here decides whether a paper is worth reading to its end.
- Declare the reading budget before searching — how many sources will be opened and at which grade — and
  stop at it. A round that reads ten full texts to answer one question has spent its budget on the wrong
  thing.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| The source cannot be located (no DOI / no URL / cannot recall where it came from) | **Do not cite it.** Better absent than invented. |
| Only a `C`-grade paraphrase | Mark it a paraphrase; never use it as evidence for a fact. |
| Literature contradicting the claim was found | It must go into the contradicting-evidence section. Never hide it. |
| It is a preprint / not peer reviewed | Mark it explicitly. |
| "Many studies show" with no concrete references | Supply the references, or downgrade to "insufficient evidence found". |
| The record carries a whole-paper summary note | Read it; it is **not** a section note and must not be claimed for one. A `/digest` note is this case: report it as legacy, leave it, do not create a second. |
| The draft is turning into review prose or a meta-analysis | Stop: the deliverable is a reconstruction note, not a review. |
| The draft is about to pronounce field consensus | Do not; report what was found and what was not searched. |
| A normative document is about to be edited | Do not; that needs a revision record. |
| A `verdict`, `basis` or `re-open if` is about to be written into a ledger row | Do not. Those belong to a reading round. |
| Unread passages are about to be filled in to make the note look complete | Do not. An absent line is honest; an unread one is fabrication. |
| An existing literature note is about to be rewritten | Do not modify its conclusions; **append** new evidence. |
| A scaffolded study still carries `research/literature/refs/` | Report it and propose removing it, but **do not delete it**: tidying the owner's workspace is not a search round's act. |

## 5. Wording discipline

- **Forbidden**: "many studies show", "it is widely believed", "the field agrees" — unless you supply the
  **concrete reference list**.
- **Distinguish** "that paper claims X" from "X holds". The first is a citation; the second a judgement.
- **Distinguish** a single result / several consistent results / a genuine systematic review or
  meta-analysis. Their evidential standing differs; do not blur the wording.
- Present inconsistent conclusions side by side. Do not "reconcile" the literature on its behalf.

## 6. Report shape

Artifact: `<layer root>/references/<topic>.md` — `research/` where that directory exists, the study root
otherwise (protocol §7). A study with its own document hierarchy wins: put the file where that hierarchy
puts it. The file states the current state:

1. `## Search question` — what is being answered, the query and its scope; replaced in place when the
   question is unchanged.
2. `## Summary of findings` — ≤10 lines, each carrying its source id; the grade only where it changes what
   the line may be used for (a `B` or `C` line is a lead, not evidence for a fact).
3. `## Reference ledger` — the nine columns of `<layer root>/references/README.md`. This round appends
   `itemKey | year | found via | grade | depth` per candidate; `verdict | basis | re-open if | date` stay
   empty, because they are a reading round's to write.
4. `## Contradicting evidence` — the sources that conflict with the summary; when there are none, one line
   `absent: <targeted check> · <scope> · 0 hits`.
5. `## Gaps and unknowns` — only what still blocks a conclusion, and whether it is "not searched" or
   "confirmed absent".

**Header line** — `non-normative: this file grounds no experiment design and no conclusion`.

**Data** — `## Reading log` is appended when a verdict changes, in
`<date> | <itemKey> | <old> → <new> | <basis> | <who>`; a search round adds no line.

**Budget** — ≤60 lines of prose (ledger and log aside). Past it, cut in this order: evidence restated from
its carrier → a second reason for the same claim → per-object detail the ledger holds → how the statement
changed. Never cut the load-bearing limit or the falsification condition.

## 7. Instrument discipline (where this skill most easily goes wrong)

- **Search the preprint index** with `{{presetTools}}/arxiv.mjs` — an absolute path, because a relative
  `tools/...` resolves to nothing in a study workspace. Use `--search` (its own syntax: `ti:` `au:`
  `abs:` `cat:`, `AND` / `OR`, quoted phrases) or `--id`, and `web_search` / `read_page` / `x_search` for
  anything that is not a preprint record. Four properties are load-bearing:
  - it makes **one** request per run, and the index allows one every three seconds — never loop it.
  - it sorts by **relevance** by default, which is **not** the web interface's date order; pass
    `--sort submittedDate` when recency is what you mean.
  - **read the query it echoes back**: the index silently rewrites some malformed input into a wider
    search, and the echoed line is the only place that rewrite is visible.
  - its output states `total` beside what it showed, so "10 shown" is never read as "10 exist". `0
    results` means the query was answered and matched nothing — a finding, not a failure.
- **Make the library answer before reading from it, and stop if it cannot.** Every library helper reaches
  the reference manager through its local API, so the first move is `{{presetTools}}/zotero-ensure.mjs`:
  exit 0 means it answers; exit 1 means it does not — say so and **stop**. Do not read its database file,
  do not pick stored PDFs out by path, and do not let a preprint or a web copy stand in for the record: a
  reading that cannot name its record can be written onto nothing and checked by no reader
  (protocol `INV-EVID-7`).
- **Search the library in full-text mode.** `{{presetTools}}/zotero-read.mjs --search "<query>"` defaults
  to `qmode=everything` — abstracts, notes and **attachment full text** — while the library's own default
  searches titles, creators and years only, so a paywalled paper the owner already holds looks absent. The
  tool prints the mode it used. Expect a mix of rows (a match inside a record, and metadata matches); the
  tool collapses them onto the record and states what matched.
- **Read a long text without destroying the context.** The library answers with an attachment's whole
  indexed text in one response, and an oversized result loses its **beginning** to the shell's cap and its
  **middle** to the result pruner once the context is compacted. Read in slices, and let the tool do the
  arithmetic:

  ```powershell
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --limit 12000
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --offset 12000    # the first slice names this
  node "{{presetTools}}/zotero-read.mjs" --fulltext "<itemKey>" --grep "<search term>"
  ```

  Full text is keyed by the **attachment**, not the record: the tool lists the children, reads the PDF in
  preference to an HTML snapshot, and says **which** attachment it read — which file was read is part of
  the evidence. A record whose attachment the library has not indexed says so rather than looking like a
  record with no text.
- **Getting a preprint's own text.** The preprint channel returns metadata and abstracts only. When a
  claim needs the body, take it from the cheapest source that has it: the owner's library first, then a
  free copy by URL. To keep the PDF, `curl.exe -sL -o paper.pdf "https://arxiv.org/pdf/<arxivId>"` and
  verify it (content-type `application/pdf`, a size in MB, magic bytes `%PDF`). The index's terms forbid
  serving its e-prints from our servers; retrieving one to read is allowed, and the copy stays a local
  working file this preset never republishes.
- **Adding a reference to the library** uses `{{presetTools}}/zotero-write.mjs`. It is a **dry run unless
  `--write`**, and it never creates a second copy of something already present: it names the existing
  record and exits 0. Propose the addition and let the owner answer the reference manager's dialog;
  "Allow" covers that one write, "Always Allow" is their standing grant and is never ours to request. Use
  `--collection <key>` (`{{presetTools}}/zotero-collection.mjs --list` prints keys, never names) to file
  in the same create; `zotero-collection.mjs --assign <itemKey> --collection <key> --write` files it
  afterwards.

  ```powershell
  node "{{presetTools}}/zotero-write.mjs" --arxiv 1706.03762          # dry run: resolve, build, print
  node "{{presetTools}}/zotero-write.mjs" --doi 10.xxxx/yyyy --write  # owner answers Zotero's dialog
  node "{{presetTools}}/zotero-write.mjs" --doi 10.xxxx/yyyy --collection ABCDEFGH --write
  ```

  The write is accepted only once a **read-back** matches title, DOI and creator count — and the
  collection when one was named. `UNFILED` is its own verdict: the record **is** in the library while the
  filing did not stick; report it that way and run the printed `--assign`, never re-create the record.
- **Read at the cheapest level that can answer the question.** Never load a full text to find one fact:

  ```text
  metadata / abstract   the item's metadata · the preprint abstract      the default starting point
  targeted passage      a page-range read of the item's attachment       take only what is needed
  full text (last)      pull the whole text to a file, read by offset    only when reading through
  ```

  The passage rung is reached by content, not structure: `--grep` locates the term and the tool reports
  the passages around it. This is the ladder of **what to load**; `INV-CTX-1`'s reading ladder is the
  different one of how a text can be obtained, whose third rung is the paper's own table of contents
  (`zotero-pdf.mjs --outline`) — that answers *where* a section is, never *what* it says, so it is climbed
  before a passage read and never quoted as text.
- **Check the topic's ledger before reading anything.** `<layer root>/references/<topic>.md` holds one row
  per paper. A row with no `verdict` is **queued**; a row carrying `park` · `enough` · `stop` plus its
  `depth` says where the last reading stopped and why. Look for the row before opening a paper — in this
  question's file, and in another question's (`grep -r "<itemKey>" <layer root>/references/*.md`).
- **After reading, record what was read in that row**, filling `grade` and `depth` from what was actually
  retrieved — `B` + `abstract` for a screening read, `A` + `§N`/`full` for the sections read. Turning a
  method section into a note is `section-notes`' act, and only when the owner names that section.

  ```powershell
  node "{{presetTools}}/zotero-edit.mjs" --item "<itemKey>" --add-tag /done --remove-tag /unread --write
  ```

  The item's `/done` tag is a **marker, not a record**: it carries neither grade nor depth, and no
  judgement reads it. What the next round reads is the ledger row.

### When no free channel produces the full text (owner-in-the-loop)

Climb these rungs in order and stop at the first one that answers:

```text
1. the local library, full-text mode   already paid for, already on disk        costs nothing
2. the preprint index / OA fallback    a free copy of the same work             costs a lookup
3. the owner's authenticated browser   the only channel holding an institutional
                                       session, and the only one that may use it costs the owner's time
```

Rung 3 produces a **request, never an instruction**:

| Field | Content |
|---|---|
| identifier | DOI / preprint id / landing URL — enough to fetch it without searching again |
| what it settles | the exact claim this source would support, and what stays undecidable without it |
| level needed | abstract · one named section · full text — the cheapest level that settles the claim |
| already tried | which free channels were tried, and what each answered |
| budget | at most N items in one request |
| state | `requested` → `received` → `read` — a file that arrived is not a paper that was read |

Two rules bound rung 3:

- **Do not ask before the free rungs are exhausted and reported.** "I could not get it" with no record of
  what was tried is an instruction with extra steps.
- **Receiving a file is not permission to store it.** Adding it to the library stays the owner's
  authorization, and a file that arrived but was not read appears in neither the ledger nor the summary.

The lookup mechanics for rung 2 belong to `metadata-query`; retrieving and reading a copy belongs to the
reading channels above. This skill decides which rung is reachable and records what each answered.
