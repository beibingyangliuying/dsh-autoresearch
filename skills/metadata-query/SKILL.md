---
name: metadata-query
description: Use to resolve or confirm a reference, find a canonical identifier, expand who-cites-whom, or check whether a free copy is listed. Reads DOI, venue, year, authors, citation counts and reference lists from OpenAlex, Crossref and Unpaywall — metadata only, never full text or evidence grades.
---

# metadata-query — bibliographic metadata over REST

This skill does exactly one thing: turn "does this work exist, and what is its canonical record" into
API-sourced facts. It is the cheap path for metadata, and it uses no mounted server: these are plain REST
APIs, so this preset ships **one small helper program**, and the helper is the instrument.

**Scope boundary**: metadata is **not** full text and **not** evidence. Reading full text and grading
evidence are `literature-recon`'s job, through the helpers it names (`{{presetTools}}/arxiv.mjs` for the
preprint index, `{{presetTools}}/zotero-read.mjs` for the owner's library). This skill asks bibliographic
sources what a work **is**.

## 1. When to use

- Resolving a reference to a DOI, or confirming that a DOI exists.
- Getting venue, year, authors, or a citation count for a work.
- Expanding a reference list or a citation list (who cites whom).
- Checking whether a title you half-remember is real.

**Not applicable**: reading a paper's contents; judging whether a claim is supported.

## 2. First step: read the declared conventions as a ruler

**The round's entry state.** If `<layer root>/00_state.md` exists, read it first: it names the current
question, the main line, the latest settled judgements and the open items, each with a pointer. Follow
only the pointers this stage needs, and do not re-derive what it already states.

1. Read the study's citation convention — its `AGENTS.md` if it has one, and
   `<layer root>/references/README.md` (`research/` where that directory exists, the study root otherwise).
2. Decide which question you are answering: **find a work**, **resolve an identifier**, or **expand
   references/citations**. They use different endpoints.
3. Note the retrieval date — citation counts are a snapshot, not a stable property.

## 3. The instrument, and what each source holds

Run `{{presetTools}}/metadata.mjs`. One request per invocation, one source per invocation, no mounted row:

```powershell
node "{{presetTools}}/metadata.mjs" --doi 10.1038/s41586-021-03819-2
node "{{presetTools}}/metadata.mjs" --doi 10.48550/arXiv.1706.03762 --source crossref   # the publisher side
node "{{presetTools}}/metadata.mjs" --search "attention is all you need" --rows 5
node "{{presetTools}}/metadata.mjs" --refs 10.1038/s41586-021-03819-2                  # what it cites
node "{{presetTools}}/metadata.mjs" --cited-by W2626778328                             # who cites it
node "{{presetTools}}/metadata.mjs" --oa 10.1038/s41586-021-03819-2 --mailto <address> # a free copy, if listed
```

It converges the payload to a fixed field set, prints the API's own reading of a query, and prints any
quota notice the API attaches. The three sources, and what each is for:

| Source | Holds | Notes |
|---|---|---|
| OpenAlex | works, venues, authorships, `cited_by_count`, `referenced_works` | no plain abstract field — see below |
| Crossref | the publisher's record: `container-title`, `issued`, `author`, `is-referenced-by-count`, `reference` | the authority for what the publisher registered |
| Unpaywall | where a free copy sits | refuses to run without a real `--mailto` |

- **Pass the contact address this preset announces in your prompt** (none if none is announced; the
  helper then omits the parameter). It identifies the caller; it does not raise OpenAlex's shared daily
  budget, so it is not a quota lever.
- **OpenAlex has no plain abstract field.** It ships `abstract_inverted_index`, an `{word: [positions]}`
  map that must be reconstructed — and it is often absent. **Do not report an abstract you did not
  reconstruct.**

### 3.1 Open-access fallback — before a full text is fetched by hand

A paywalled record is not a reason to stop: the same work is often free somewhere. This section owns the
lookup; `literature-recon` owns the ladder it feeds.

| Question | Where the answer is |
|---|---|
| Is any version free, and where? | the work record's `open_access.oa_status`, `oa_url`, `best_oa_location`, `locations[].is_oa` |
| Where is the free file itself? | `metadata.mjs --oa <doi> --mailto <address>` (Unpaywall) — a **real** address is required |
| Is there a preprint or accepted version? | the preprint index; the repository entries in `locations` |

`oa_status` reads `gold` / `green` / `hybrid` / `bronze` / `closed`; `green` means a repository copy of a
paywalled paper exists. Record the location that was actually retrieved, never the status field alone.

**A listed free copy is a lead, not a retrieval.** Write "a free copy is listed at <url>" only after that
URL was actually fetched, and report a dead or wrong-version link as a failed lead instead of dropping it
silently. Retrieving a copy does not raise a source's grade: the grade still follows what was read, and
whether a copy is fetched and read is the reading channels' business.

**Fetching it is a reading act with a tool of its own.** When the free copy is a PDF or an HTML article,
`{{presetTools}}/scholarly-read.mjs --id <doi|arxiv|pmid|pmcid|url>` routes arXiv HTML → ar5iv → arXiv
PDF → PMC JATS → an OpenAlex OA PDF, and names each route it failed; `--outline` lists sections,
`--section "3"` reads one, `--query "<terms>"` ranks passages (BM25), `--start/--max-chars` reads a slice.
It reads open access only — no route means exit 1, never a paywall bypass. A formula printed from HTML or
JATS is markup, not text: read the page image instead (`zotero-pdf --url ... --render --pages`).

### 3.2 The venue's record — a provider's reading, never the paper's standing

`{{presetTools}}/journal-rank.mjs --journal "<exact title>"` (or `--doi <doi>`, which resolves the real
title first) asks the ranking provider the reference manager's own plugin trusts, and prints what it holds
with the provider's labels kept apart: `sci` is the current JCR quartile (one collapsed value per journal,
with the per-category detail in `sciUpSmall`/`xrSmall`), `sciUp` the current CAS-upgraded partition, `xr`
the XinRui partition. `--json` keeps the whole context.

- **Ask with the exact title, or with a DOI.** An ISSN is rejected: asked for one, the provider answered a
  record about something else, so it does not fail closed. A near-miss name fails closed (`all: null`),
  which is the good case.
- **It is a transcription with no edition stamp.** The payload names no journal and no year; the output
  says "provider says" and repeats the retrieval date for that reason. Quote it that way — never as a JCR
  export, never as a property of the paper.
- **Exit 2 is "this machine cannot ask"** (no key), not a coverage gap. A throttle is its own answer: wait
  a moment and ask again — the helper does not retry, and a retry loop against a metered endpoint is how a
  working key gets spent on nothing.


## 4. Do vs don't

### 4.1 Do

- Keep queries small: `--rows` takes 1–10, and the helper refuses more.
- Record, for every retrieved record: the identifier, the source you asked, and the date.
- Prefer resolving a DOI over searching by title when you already have the DOI.

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No JSON body was actually retrieved | Do not report the metadata at all. |
| The abstract is absent, or only an inverted index you did not reconstruct | Write "abstract not available". Never invent or paraphrase from the title. |
| HTTP 429 (rate limited) | The helper reports it and stops. Back off and report it; do not retry in a loop. Semantic Scholar behaves this way without a key — use OpenAlex and Crossref instead. |
| Only a search-result list was retrieved, not the work record | Report it as a candidate list, not as confirmed metadata. |
| The title differs slightly between sources | Report both and say which endpoint each came from. |
| The DOI that came back differs from the one asked for | Report **both**; do not silently prefer one. |
| A metadata lookup is about to be presented as reading the paper | Do not. This skill reads no text, so it supports no grade at all. |
| A work that is not in the library is about to get a ledger row | Do not: it has no `itemKey`, so no later round's `grep` can find it. Report it under `## Candidates`. |
| The request is about to be hand-built and sent with `web_fetch` | Do not. The helper carries the contact address, the refusals and the failure classification. |

## 5. Wording discipline

- Distinguish "the metadata record says" from "the paper claims".
- `cited_by_count` / `is-referenced-by-count` is a **snapshot on the retrieval date**; never present it as
  a stable or authoritative number.
- **Never infer a paper's content from its title.**
- **A metadata lookup supports no grade at all.** A grade says what was read, and this skill reads no
  text — `B` already requires that the abstract was read. A row whose only source is metadata keeps its
  `grade` empty and says which REST source answered it, and when, in `found via`.

## 6. Report shape

**Two destinations, and neither is a table of its own.**

1. **A work already in the library** — append one row to that question's ledger
   (`<layer root>/references/<topic>.md`), filling `itemKey`, `year` and `found via` (the source and the
   date it answered: `OpenAlex, retrieved 2026-10-11`). `grade` and `depth` stay empty: nothing was read,
   and those cells belong to a reading round.
2. **A work that is not in the library** — it has no `itemKey`, and a row without one is a row no later
   round's `grep` can find. Report it under `## Candidates` in this round's answer and hand it to
   `literature-recon`, which decides whether it earns a row.

Do not invent a second table in that file. Its nine columns are the ledger, and a fourth shape beside them
is a thing the next round cannot read. If the study has its own convention, follow it.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Run `{{presetTools}}/metadata.mjs`. It makes exactly one request per invocation and refuses the
  combinations it cannot honour, so "one at a time, never in a loop" is a property of the tool rather than
  a rule to remember. Do not hand-build these URLs and do not call them with `web_fetch`.
- Do not paste credentials into conversation text; these sources need none beyond the contact address.
- Never present a metadata lookup as if it were reading the paper.
- Do not modify anything under the layer root other than appending the ledger row a lookup earns.
