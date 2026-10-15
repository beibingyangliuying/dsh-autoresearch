# `research/literature/refs/` — the digest index

One line per reference **actually read**. The durable digest lives in the reference library as a note
on the item; this file is only a **fast lookup**, so that nobody re-reads a paper to rediscover what
it said. It is derived data: if it is lost, rebuild it from the library.

## Format

```
<itemKey> | <year> | <grade> | <tags> | <one-line digest> | note: zotero
```

| Field | Meaning |
|---|---|
| `itemKey` | The library item key (8 characters) — the join back to the library |
| `year` | Publication year |
| `grade` | `A` = full text read · `B` = abstract/introduction only (the literature discipline's grades) |
| `tags` | The same tags set on the library item, comma-separated |
| digest | **One line.** The longer digest belongs in the library note, not here |

Example:

```
ABCD1234 | 2017 | A | transformer,attention,baseline | Self-attention replaces recurrence; 8 authors; no DOI on arXiv | note: zotero
```

## Rules

- **Look here before reading anything.** A hit means you already know what this paper says.
- **Append only after reading.** Never write a line for a paper you merely saw cited.
- A `B` line is a **lead, not evidence**; upgrade it to `A` once the full text is read, or delete it.
- The library note is the durable copy. This file must never become the only copy of a digest.
- When the two disagree, the library wins — then fix this file.

## Writing the library note

The note is a child item of the reference, so it travels with the library and is visible in the
library's own UI and plugins:

```json
{ "itemType": "note", "parentItem": "<itemKey>", "note": "<p>…digest…</p>", "tags": [{"tag": "read:A"}] }
```

`POST` it to the local API the same way a reference is created (see the write tool). Tag the item
with its read state so the library itself can be filtered by "have I read this".
