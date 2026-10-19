---
name: metadata-query
description: Look up bibliographic metadata — DOI, venue, year, authors, citation counts, reference lists — through the free OpenAlex, Crossref and Unpaywall REST APIs, read through this preset's own helper program. Use to resolve or confirm a reference, find a canonical identifier, expand who-cites-whom, or check whether a free copy is listed. This yields metadata only, never full text, and never evidence grades.
---

# metadata-query — bibliographic metadata over REST

This skill does exactly one thing: turn "does this work exist, and what is its canonical record"
into API-sourced facts. It is the cheap path for metadata, and it deliberately uses no mounted server:
these are plain REST APIs, so this preset ships **one small helper program** instead, and the helper is
the instrument.

**Scope boundary**: metadata is **not** full text and **not** evidence. Grading evidence is
`literature-recon`'s job, and so is reading full text — through the helpers it names
(`{{presetTools}}/arxiv.mjs` for the preprint index, `{{presetTools}}/zotero-read.mjs` for the owner's
library). Neither is this skill's instrument: this one asks bibliographic sources what a work **is**.

## 1. When to use

- Resolving a reference to a DOI, or confirming that a DOI exists
- Getting venue, year, authors, or a citation count for a work
- Expanding a reference list or a citation list (who cites whom)
- Checking whether a title you half-remember is real

**Not applicable**: reading a paper's contents; judging whether a claim is supported.

## 2. First step: read the declared conventions as a ruler

1. Read the study's citation convention — `AGENTS.md` §4 if the study has one, and
   `<layer root>/references/README.md`. The **layer root** is `research/` where that directory exists and
   the study root otherwise (protocol §7).
2. Decide which of the three questions you are answering: **find a work**, **resolve an
   identifier**, or **expand references/citations**. They use different endpoints.
3. Note the retrieval date — citation counts are a snapshot, not a stable property.

## 3. The sources, and the helper that reads them (free, no API key, reachability verified on this machine)

Run `{{presetTools}}/metadata.mjs`. One request per invocation, one source per invocation, no mounted
row:

```powershell
node "{{presetTools}}/metadata.mjs" --doi 10.1038/s41586-021-03819-2
node "{{presetTools}}/metadata.mjs" --doi 10.48550/arXiv.1706.03762 --source crossref   # the publisher side
node "{{presetTools}}/metadata.mjs" --search "attention is all you need" --rows 5
node "{{presetTools}}/metadata.mjs" --refs 10.1038/s41586-021-03819-2                  # what it cites
node "{{presetTools}}/metadata.mjs" --cited-by W2626778328                             # who cites it
node "{{presetTools}}/metadata.mjs" --oa 10.1038/s41586-021-03819-2 --mailto <address> # a free copy, if listed
```

It converges the payload to a fixed field set, prints the API's own reading of a query, and prints any
quota notice the API attaches. The tables below say what each source **holds**, which is what you need
in order to read the answer.

### OpenAlex — `https://api.openalex.org/works`

| Goal | Request |
|---|---|
| Search | `?search=<terms>&per-page=<n>` |
| Resolve a DOI | `?filter=doi:10.xxxx/yyyy` |
| Filter by year/type | `&filter=publication_year:2024,type:article` |
| One work, with references | `https://api.openalex.org/works/doi:10.xxxx/yyyy` |

Pass the address with `--mailto <address>` (the one this preset announces in your system prompt; pass
none if none is announced, and the helper omits the parameter entirely). It is identification rather
than a quota lever: measured 2026-10-19, OpenAlex answered a request byte-identical with and without it,
and its own response notice states that the parameter does not raise its shared daily budget. Useful
response fields: `id`, `doi`, `title`,
`publication_year`, `primary_location`, `authorships`, `cited_by_count`, `referenced_works`.

**Gotcha**: OpenAlex has no plain `abstract` field. It ships `abstract_inverted_index`, an
`{word: [positions]}` map that must be reconstructed into a sentence — and it is often absent. Do not
report an abstract you did not reconstruct.

### Crossref — `https://api.crossref.org/works`

| Goal | Request |
|---|---|
| Search | `?query=<terms>&rows=<n>` |
| Resolve a DOI | `https://api.crossref.org/works/<doi>` |

Pass the same `--mailto <address>` for Crossref, which still asks for one. Useful response fields: `DOI`, `title`,
`container-title`, `issued`, `author`, `is-referenced-by-count`, `reference`.

### Open-access fallback — before a full text is fetched by hand

A paywalled record is not a reason to stop: the same work is often free somewhere. This section owns the
lookup; `literature-recon` owns the ladder it feeds.

| Question | Where the answer is |
|---|---|
| Is any version free, and where? | the work record's `open_access.oa_status`, `open_access.oa_url`, `best_oa_location`, and `locations[].is_oa` (OpenAlex) |
| Where is the free file itself? | `{{presetTools}}/metadata.mjs --oa <doi> --mailto <address>` (Unpaywall) — a **real** address is required, which is why that mode refuses to run without one |
| Is there a preprint or accepted version? | the preprint index; the repository entries in `locations` |

`oa_status` reads `gold` / `green` / `hybrid` / `bronze` / `closed`; `green` means a repository copy of a
paywalled paper exists — measured on a paywalled journal article whose free copy sat in an institutional
repository. Record the location that was actually retrieved, never the status field alone.

**A listed free copy is a lead, not a retrieval.** Write "a free copy is listed at <url>" only after that
URL was actually fetched, and report a dead or wrong-version link as a failed lead instead of dropping it
silently. Retrieving a copy does not raise a source's grade: the grade still follows what was read.
Whether a copy is fetched and read is the reading channels' business, not this skill's.

## 4. Do vs don't

### 4.1 Do

- Keep queries small: `--rows` takes 1–10, and the helper refuses more
- Record, for every retrieved record: the identifier, the source you asked, and the date
- Prefer resolving a DOI over searching by title when you already have the DOI

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No JSON body was actually retrieved | Do not report the metadata at all. |
| The abstract is absent or only an inverted index you did not reconstruct | Write "abstract not available". Never invent or paraphrase from the title. |
| HTTP 429 (rate limited) | The helper reports it and stops. Back off and report it; do not retry in a loop. Semantic Scholar behaves this way without a key — use OpenAlex and Crossref instead. |
| Only a search-result list was retrieved, not the work record | Report it as a candidate list, not as confirmed metadata. |
| The title differs slightly between sources | Report both and say which endpoint each came from. |

## 5. Wording discipline

- Distinguish "the metadata record says" from "the paper claims".
- `cited_by_count` / `is-referenced-by-count` is a **snapshot on the retrieval date**; never present
  it as a stable or authoritative number.
- **Never infer a paper's content from its title.**
- A metadata-only source can be at most evidence grade **`B`** in a `literature-recon` note — never
  `A`, which requires the full text.

## 6. Report shape

Append to `<layer root>/references/<topic>.md` as evidence-table rows, e.g.:

```
| Source | Grade | What it actually says | Relation to this study |
|---|---|---|---|
| Author, *Title*, Venue, 2024, DOI:10.xxxx/yyyy (OpenAlex, retrieved 2026-10-11) | B | metadata only: venue, year, cited_by_count=12 | candidate for the contradicting-evidence section |
```

If the study has its own convention, follow it.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Run `{{presetTools}}/metadata.mjs`. It makes exactly one request per invocation and refuses the
  combinations it cannot honour, so "one at a time, never in a loop" is a property of the tool rather
  than a rule to remember. Do not hand-build these urls and do not call them with `web_fetch`: the
  contact address, the four-way classification of a failed answer, and the abstract rule live in the
  helper, and a hand-built request carries none of them.
- Do not paste credentials into conversation text; these sources need none beyond the contact address.
- Never present a metadata lookup as if it were reading the paper.
- Do not modify anything under the layer root other than appending evidence rows.

## 8. Acceptance checklist

- [ ] Every reported record has a retrievable identifier and the source it came from
- [ ] Every count is quoted with the source that gave it and the retrieval date
- [ ] When the DOI that came back differs from the one asked for, **both** are reported
- [ ] No abstract was invented; absent abstracts are stated as absent
- [ ] Metadata-only rows are graded `B` or lower
- [ ] 429s are reported, not retried in a loop

## 9. Don't

- Do not read or claim to read full text: the channel helpers named in §0 own that, not this skill
- Do not hand-build these requests with `web_fetch`: `{{presetTools}}/metadata.mjs` carries the contact
  address, the refusals and the classification that keep a failed lookup from reading like an answer
- Do not assign evidence grades (that is `literature-recon`)
- Do not cite a work you only saw in a search-result list
- Do not build a citation graph beyond what the returned `referenced_works` / `reference` fields give
