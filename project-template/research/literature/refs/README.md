# `research/literature/refs/` — the reading receipt index

One line per reference **actually read**. This line plus the item's `/done` tag is the **receipt**:
it says "this was read, at what grade, and what it settled". It is the thing that stops the next round
from paying the same reading cost again.

The **digest is a different artifact**: one `/digest` note on the record, synthesized by `section-notes`
from that record's `/section-N` notes. It is a paper-level projection, not a receipt, and a paper with
no section notes has no digest. Do not put a paper-level summary here and call it the digest.

## Format

```
<itemKey> | <year> | <grade> | <tags> | <one-line takeaway>
```

| Field | Meaning |
|---|---|
| `itemKey` | The library item key (8 characters) — the join back to the library |
| `year` | Publication year |
| `grade` | `A` = full text read · `B` = abstract/introduction only (the literature discipline's grades) |
| `tags` | The read-state tags set on the library item, comma-separated |
| takeaway | **One line.** The receipt; the longer projection belongs in the `/digest` note, not here |

Example:

```
ABCD1234 | 2017 | A | done | Self-attention replaces recurrence; 8 authors; no DOI on arXiv
```

## Rules

- **Look here before reading anything.** A hit means you already know what this paper settles.
- **Append only after reading.** Never write a line for a paper you merely saw cited.
- A `B` line is a **lead, not evidence**; upgrade it to `A` once the full text is read, or delete it.
- **This line is the receipt, not the digest.** It is what `INV-EVID-4` reads for "already read";
  the `/digest` note is derived from the section notes and is not a substitute for it.
- **A paper with no section notes has no digest.** The receipt here is the whole record; say so in the
  one-line takeaway rather than writing a paper-level summary into this file.
- When the digest and this line disagree about what the paper settles, the digest is a projection and
  this line is the receipt: re-read the notes, then fix whichever one is wrong. Do not paper over the
  difference.
