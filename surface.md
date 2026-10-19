# Autoresearch public surface — concept ↔ symbol

**Status: non-normative index.** The contract is [`protocol.md`](protocol.md), which wins on any
conflict. The authoritative lists are the discipline front-matter under `skills/*/SKILL.md` and the
`serverName` fields of the preset composition — of which there are currently none, because this preset
mounts no MCP server. This file answers one question only — *which name implements which concept*.

| Concept (protocol) | Symbol |
| --- | --- |
| Scoping discipline — a topic becomes a decidable question (§4) | `research-scoping` |
| Literature discipline — sources graded by what was read (§4) | `literature-recon` |
| Section-notes discipline — one `/section-N` explanation note per top-level method section, plus the paper-level `/digest` projection (§4) | `section-notes` |
| Adoption discipline — what a paper read may lend, under what condition, into which module (§4) | `adoption-ruling` |
| Challenge discipline — objections, or an honest refusal (§4) | `redteam-ruling` |
| Settlement discipline — conclusions, rejections and rulings (§4) | `progress-sync` |
| Metadata discipline — bibliographic records, never evidence (§4) | `metadata-query` |
| Handoff discipline — what a subagent must return (§4) | `subagent-contract` |
| Run discipline — a hypothesis becomes a card (§4) | `experiment-protocol` |
| Synthesis discipline — several directions become one executable draft (§4) | `synthesis-plan` |
| Preprint index — search the index, read one record by identifier (§6) | no symbol: a shipped helper program |
| Local reference library — the owner's library, including paywalled full text (§6) | no symbol: shipped helper programs |
| Bibliographic metadata — identifiers, venues, years, counts (§6) | no symbol: a shipped helper program |

## Notes

- **All three external channels are reached through shipped helper programs**, so none contributes a
  symbol: this index covers the names that exist in the tool namespace (`mcp__<server>__<tool>`) and the
  discipline names. Which program implements which channel is stated by the disciplines that name them,
  not here. A channel mounted as an MCP row would be indexed by its server name; this preset mounts none.
- The composition's row identifiers are **not** part of this surface. They are internal wiring, they
  change for implementation reasons, and several of them are common English words that would collide
  with the contract's prose.
- The preset's own identifier names the system rather than a concept inside it, so it is the subject
  of the contract rather than an entry in this index.
