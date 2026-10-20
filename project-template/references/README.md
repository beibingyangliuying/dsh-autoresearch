# `references/` — where a question's literature is read, and what a reading may say

One archive per research question: `<topic>.md`. This file states the rules, `ledger.md` carries the
empty table, and the first round copies it to `<topic>.md`. **Nothing here is authoritative**, and
nothing here decides whether a paper is used.

## Rules

- **Pointers only.** A file here says which record was consulted, for which question, and how far the
  reading got. It does not restate the paper and does not replace a note in the library.
- **No new judgement.** The grade and the depth/verdict words are defined once, by the disciplines that
  produce them; a file here copies the value it was given and never refines it. A round that wants a
  different grade re-reads the paper and says so, rather than editing the word.
- **Rows are added or advanced, never rewritten.** The reading log below the table is what makes a changed
  judgement traceable; a previous round's note is never edited by a later one.
- **Adoption is decided elsewhere.** What may be borrowed, on what terms, and the number that proves the
  code belongs to the adoption chain and its own ledger. A row here saying a paper was read is not a claim
  that anything was taken from it.
- **This layer does not pre-create the study's other layers.** A directory a study needs — rulings, a
  journal, experiments, pitfalls, an archive — is created by the discipline that first
  writes there, and that round reports the path it used. Do not create one now to have somewhere to put
  something later.

## The ledger

One row per (research question × paper), keyed by the library `itemKey`:

| itemKey | year | found via | grade | depth | verdict | basis | re-open if | date |
|---|---|---|---|---|---|---|---|---|

| Column | Written by | Means |
|---|---|---|
| `itemKey` `year` `found via` | the round that found it, append-only | which record, which year, and which query or collection produced it |
| `grade` | the round that read it | how firmly a sentence about this paper stands — the grade the `literature-recon` skill defines |
| `depth` | the round that read it | how far the paper itself was read |
| `verdict` | a reading round | why the reading stopped there, or nothing while the paper is still queued |
| `basis` | a reading round | the section, and the sentence, that decided it |
| `re-open if` | a reading round | what change would make this row be judged again |
| `date` | a reading round | the date the verdict last changed |

The `depth` and `verdict` vocabularies, and which combinations are legal, are stated **once** — by the
`reading-triage` skill — and are deliberately not copied here: a second copy is a second thing to keep
true. The question's ledger is `<topic>.md`; `ledger.md` is only the shape it starts from, and a
judgement that changes is appended to that file's reading log rather than overwriting the row's history.

A **screening** pass writes one row per item it rules out, and writes the abstract's own sentence as the
`basis`: a paper that cannot serve the question is a judgement, and an unjudged item is the queue, not a
silent omission.
