---
name: metadata-query
description: Look up bibliographic metadata — DOI, venue, year, authors, citation counts, reference lists — through the free OpenAlex and Crossref REST APIs, called with web_fetch. Use to resolve or confirm a reference, find a canonical identifier, or expand who-cites-whom. This yields metadata only, never full text, and never evidence grades.
---

# metadata-query — bibliographic metadata over REST

This skill does exactly one thing: turn "does this work exist, and what is its canonical record"
into API-sourced facts. It is the cheap path for metadata, and it deliberately uses no MCP server:
OpenAlex and Crossref are plain REST APIs, so `web_fetch` is enough and there is one less process to
break.

**Scope boundary**: metadata is **not** full text and **not** evidence. Grading evidence is
`literature-recon`'s job; reading full text is the arXiv or Zotero MCP's job.

## 1. When to use

- Resolving a reference to a DOI, or confirming that a DOI exists
- Getting venue, year, authors, or a citation count for a work
- Expanding a reference list or a citation list (who cites whom)
- Checking whether a title you half-remember is real

**Not applicable**: reading a paper's contents; judging whether a claim is supported.

## 2. First step: read the declared conventions as a ruler

1. Read the study's citation convention (`AGENTS.md` §4 and `research/literature/README.md`).
2. Decide which of the three questions you are answering: **find a work**, **resolve an
   identifier**, or **expand references/citations**. They use different endpoints.
3. Note the retrieval date — citation counts are a snapshot, not a stable property.

## 3. The two sources (both free, no API key, reachability verified from this machine)

### OpenAlex — `https://api.openalex.org/works`

| Goal | Request |
|---|---|
| Search | `?search=<terms>&per-page=<n>` |
| Resolve a DOI | `?filter=doi:10.xxxx/yyyy` |
| Filter by year/type | `&filter=publication_year:2024,type:article` |
| One work, with references | `https://api.openalex.org/works/doi:10.xxxx/yyyy` |

Add `&mailto=<contact-address>` (the contact address configured in the preset settings, if any) to join the polite pool. Useful response fields: `id`, `doi`, `title`,
`publication_year`, `primary_location`, `authorships`, `cited_by_count`, `referenced_works`.

**Gotcha**: OpenAlex has no plain `abstract` field. It ships `abstract_inverted_index`, an
`{word: [positions]}` map that must be reconstructed into a sentence — and it is often absent. Do not
report an abstract you did not reconstruct.

### Crossref — `https://api.crossref.org/works`

| Goal | Request |
|---|---|
| Search | `?query=<terms>&rows=<n>` |
| Resolve a DOI | `https://api.crossref.org/works/<doi>` |

Add `&mailto=<contact-address>` (the contact address configured in the preset settings, if any) for the polite pool. Useful response fields: `DOI`, `title`,
`container-title`, `issued`, `author`, `is-referenced-by-count`, `reference`.

## 4. Do vs don't

### 4.1 Do

- Keep queries small (`per-page` / `rows` ≤ 10) so the payload stays readable
- Record, for every retrieved record: the identifier, the endpoint you called, and the date
- Prefer resolving a DOI over searching by title when you already have the DOI

### 4.2 Local exclusion conditions (if any one hits, act on the spot — do **not** work around it)

| Hit | Action |
|---|---|
| No JSON body was actually retrieved | Do not report the metadata at all. |
| The abstract is absent or only an inverted index you did not reconstruct | Write "abstract not available". Never invent or paraphrase from the title. |
| HTTP 429 (rate limited) | Back off and report it. Do not retry in a loop. Semantic Scholar behaves this way without a key — use OpenAlex and Crossref instead. |
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

Append to `research/literature/<topic>.md` as evidence-table rows, e.g.:

```
| Source | Grade | What it actually says | Relation to this study |
|---|---|---|---|
| Author, *Title*, Venue, 2024, DOI:10.xxxx/yyyy (OpenAlex, retrieved 2026-10-11) | B | metadata only: venue, year, cited_by_count=12 | candidate for the contradicting-evidence section |
```

If the study has its own convention, follow it.

## 7. Instrument discipline (where this skill most easily goes wrong)

- Use `web_fetch` on the URLs above. One request at a time; no request loops.
- Do not paste credentials into conversation text; these two sources need none beyond `mailto`.
- Never present a metadata lookup as if it were reading the paper.
- Do not modify anything under `research/` other than appending evidence rows.

## 8. Acceptance checklist

- [ ] Every reported record has a retrievable identifier and the endpoint it came from
- [ ] The retrieval date is recorded wherever a count is quoted
- [ ] No abstract was invented; absent abstracts are stated as absent
- [ ] Metadata-only rows are graded `B` or lower
- [ ] 429s are reported, not retried in a loop

## 9. Don't

- Do not read or claim to read full text (arXiv MCP / Zotero own that)
- Do not assign evidence grades (that is `literature-recon`)
- Do not cite a work you only saw in a search-result list
- Do not build a citation graph beyond what the returned `referenced_works` / `reference` fields give
