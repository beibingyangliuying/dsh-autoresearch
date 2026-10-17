# Project scaffold for the Autoresearch preset

This directory is a template for **one study**, not a preset. The division of labour:

- the **preset** owns *how to research* — three-way typing, no unfalsifiable wording, no citations
  from memory, and the discipline skills it ships on demand (the roster lives in the preset's
  `surface.md`, so this file does not repeat it);
- this **scaffold** owns *what is being researched* — domain invariants, document authority, notation.

## Use it

```powershell
# from the dsh-autoresearch workspace
.\tools\new-project.ps1 -Target D:\path\to\new-study
```

The script only creates files. An existing file is reported and skipped, never overwritten.
`-DryRun` previews without writing.

Copying by hand also works, but `.agents/` is a hidden directory and is easy to miss.

## What to change

| File | Change |
|---|---|
| `AGENTS.md` (shipped as `AGENTS.md.template`) | The scaffolder renames it. Fill every `TODO`; this is the only file that must be written before real work starts. |
| `research/00_scoping.md` | Fill it by running the `research-scoping` skill, which defines its seven sections. |
| `.agents/skills/domain-discipline/SKILL.md` | Rename the directory to your domain discipline and fill it, or delete it if the study needs none. |
| `research/*/README.md` | Adjust the naming and citation conventions to the study. |

> **Why `AGENTS.md.template`?** DSH loads any `AGENTS.md` in the tree as live project instructions.
> While this scaffold is still a template, that would inject placeholder rules — and the EXAMPLE
> invariants — into every session working under it. The scaffolder renames it at the destination,
> where it is meant to be live.

## What NOT to change

- **Do not restate the preset skills' general discipline in `AGENTS.md`.** Two copies of one rule
  drift apart. `AGENTS.md` carries **domain** constraints only.
- **Do not rename `research/` if the study already has a document hierarchy.** Declare that hierarchy
  in `AGENTS.md` §3 and let it win — the preset's `research-scoping` §7 requires following an
  existing convention.

## Layout

```
<study>/
  AGENTS.md                          domain constraints (the only mandatory file)
  research/
    00_scoping.md                    question / boundary / non-goals / decidability / ...
    literature/<topic>.md            non-normative reconstruction notes
    rulings/ruling_<target>_<date>.md  structured challenges awaiting a ruling
    journal/<date>_<topic>.md        round-by-round log (append-only)
    experiments/<id>.md              experiment cards: prediction / command / artifacts / validity
    pitfalls/README.md               symptom-indexed pitfalls (append-only, pruned when obsolete)
    literature/refs/README.md        digest index: one line per reference actually read
    adoption/<itemKey>.md            what this study may borrow from one reference, and on what terms
    adoption/INDEX.md                module -> adopted item, so code can find its formula
  .agents/skills/<discipline>/SKILL.md   project-level domain discipline
```

Anything marked `EXAMPLE:BEGIN … EXAMPLE:END` is a filled sample so the intended shape is
unambiguous. Delete those blocks once the real content is in.
