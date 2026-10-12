# Autoresearch public surface — concept ↔ symbol

**Status: non-normative index.** The contract is [`protocol.md`](protocol.md), which wins on any
conflict. The authoritative lists are the discipline front-matter under `skills/*/SKILL.md` and the
`serverName` fields of the preset composition. This file answers one question only — *which name
implements which concept*.

| Concept (protocol) | Symbol |
| --- | --- |
| Scoping discipline — a topic becomes a decidable question (§4) | `research-scoping` |
| Literature discipline — sources graded by what was read (§4) | `literature-recon` |
| Challenge discipline — objections, or an honest refusal (§4) | `redteam-ruling` |
| Settlement discipline — conclusions, rejections and rulings (§4) | `progress-sync` |
| Metadata discipline — bibliographic records, never evidence (§4) | `metadata-query` |
| Handoff discipline — what a subagent must return (§4) | `subagent-contract` |
| Run discipline — a hypothesis becomes a card (§4) | `experiment-protocol` |
| Synthesis discipline — several directions become one executable draft (§4) | `synthesis-plan` |
| Preprint index — search and full text of preprints (§6) | `arxiv` |
| Local reference library — the owner's library, including paywalled full text (§6) | `zotero` |

## Notes

- Each external channel exposes tools named `mcp__<server>__<tool>`; the indexed symbol is the
  server name, and the prefix is derived from it.
- The composition's row identifiers are **not** part of this surface. They are internal wiring, they
  change for implementation reasons, and several of them are common English words that would collide
  with the contract's prose.
- The preset's own identifier names the system rather than a concept inside it, so it is the subject
  of the contract rather than an entry in this index.
