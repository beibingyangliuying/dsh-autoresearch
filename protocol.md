# Autoresearch protocol — what the research preset guarantees, and where its boundary is

**Status: normative. Revision 22.** This file is the contract of the Autoresearch preset. Where it
conflicts with the implementation — the composition file, the isolation plugin, the discipline
texts — **this file wins**, and the implementation must be corrected. The revision number is
independent of any package version. Revision 22 removes the **study-level reading receipt index**. A
study has several questions in flight, and one line per reference could say only that a paper had been
read — not for which question, nor how far — so a paper one question stopped at its third section and
another read to the end had one blurry row between them. How far a paper was read is now recorded in
**that question's own ledger**, inside the question's literature file: `depth` says where the reading
stopped, `verdict` says why, and `INV-EVID-4`'s judgement is made by reading that row and then the
record's notes rather than by looking up an index. A grade now measures the sentence it sits on and
never how much of the paper was read. The item's `/done` tag survives as a marker the owner may set,
and no decision reads it. §6 and §7 state it, and `INV-EVID-6` is added. Revision 21 lets the preset
erase a retired note: `--delete`
performs the `DELETE` it used to only plan, on a `/retired` note only, carrying the version it was
read at as a precondition, and proving it with a 404. Deletion is therefore a capability of the
preset now, bounded to one note at a time; it is still not a cleanup pass. The same revision keeps
the digest's previous body **in the reference library**: a refresh writes the old body once as a
`/digest` + `/retired` child note and then patches the live digest, rather than leaving the old body
in a workspace file. A section-note rewrite stops writing a workspace backup at all: the paper is
the source, the plan shows the old first block, and a version conflict is refused. §6, §8 and §9
state it. Revision 20 makes the digest a **projection of the section
notes**: one live `/digest` per record, synthesized from its `/section-N` notes rather than from the
raw paper, refreshed in place, and no longer a reading receipt —
the receipt is the question's own ledger row (Revision 22). Revision 19 moves a note's identity
out of the body: `/section-N`, `/imported`, `/digest`, `/retired` and `/replaces-KEY` are tags, no
invisible marker is written or read, a note with no `/section-` tag is **unknown** until it is read
and claimed, the mechanical prose repair is removed, and a pasted note may be rewritten in place
while a claimed record is still retired and replaced. §4, §6, §8 and §9 state it. Revision 18 gives
the third channel the program the other two
already had: the bibliographic REST channel is now reached through a helper this preset ships and its
discipline names, so §6's statement that the channels are reached through such programs holds for all
three rather than for two of them. It adds one rule to §6 — a bibliographic count is quoted with the
source that produced it and the date it was read, because the same work was measured carrying 43,412
citations on one source and 46,513 on the other — and corrects §6's own count of its rules, which said
three while carrying seven. §6 states it.
Revision 17 states three capabilities this contract previously
left without a channel, and corrects one reason it gave. A section a wrong note covers is freed by
**retiring** that note: the note's body is never touched, the mark that retires it is reversible, a
retired note stops counting as coverage, and the note that replaces it names the one it replaced, so
the record of why the section was written again survives though nothing was deleted. What this preset
asks the owner to remove is handed over as an artifact of fixed shape rather than as prose, because "a
list, not a capability" says what the preset will not do and nothing about what it will hand over, and
a round that has to invent that shape produces one no other round can merge. The reading ladder §8
already leaned on is named rung by rung — the library's indexed text, the attachment's own text layer,
and the page as an image — and a reading states which rung answered it, because an index that was never
built, a text layer whose font encoding is broken, and a page whose mathematics never became text are
three different failures that read alike in a transcript. It also corrects §9's reason for performing no
deletion, which is a property of this channel rather than of deletion as such. §6, §7, §8 and §9 state
it. Revision 16 parts what a run was predicted to do from what it
did, and requires the artifacts a record cites to stay obtainable. It records three things as contract
rather than leaving them to the scaffold's own text: the prediction is written **before** the run into
an artifact of its own, because a prediction that shares a file with its outcome cannot be told apart
from one written afterwards; the record of a run is added to and never repaired, so a run that failed
its own gate is recorded as invalid rather than quietly reworded; and an artifact a record cites must
be obtainable by the reader that record is written for — where a study's outputs live outside its own
record, that means a copy kept with it, and a citation nothing can retrieve is a defect stated on the
record rather than a line deleted from it. §1, §4, §7 and §8 state it. Revision 15 adds the tenth on-demand discipline: a paper the study
has read becomes a **ruled ledger of what it may lend**, one verdict per borrowable item, whose reader
is an implementer who never opens the paper. It records four things as contract rather than leaving them
to that discipline's own text — an item reaches code only with the paper's own locator, the condition it
holds under, our normalized form beside the paper's, and **a number a test can assert**, because a
formula copied correctly and a formula implemented differently are otherwise indistinguishable, so an
item without such an anchor stays a candidate; a verdict is the owner's and is dated, and an item is
verified only when that number passes; the ledger grounds no research conclusion, while a module that
disagrees with a ruled item is a defect rather than a difference of opinion; and one formula has one
transcription, so where a section note already holds it the ledger cites that note instead of deriving it
again. §4, §7, §8 and §9 state it. Revision 14 fixes the unit a section note is counted in, and says
who decides it: **coverage is counted per top-level section**, a section written as notes for its own
subsections is covered **in parts** and never also as a whole, and the reading that decides which
sections a record already covers is made by reading the notes — the channel reports the ones it can
read and names the ones it cannot, and a disagreement between the two readings stops the round instead
of being written around. §6 states it. Revision 13 bounds a digest write: a digest the record already
reads with is reported as already recorded and nothing is written, because a round that is re-run must
not turn one reading into the same sentence twice — and that comparison is made on the text a reader
sees rather than byte for byte, because the reference manager rewrites the body of a note its own
application has edited. §6 and `INV-EVID-4` state it. Revision 12 states the boundary this preset measured rather than
assumed: **at that revision it performed no deletion in the reference library.** Deleting through the library's local API is
permanent — measured 2026-10-16, a `204` and the record is a `404` afterwards, while the library's trash
neither grows nor holds the key — whereas the owner deleting in the application moves the item into that
trash and can be undone. The asymmetry is the point: what an agent cannot undo is not something an agent
should be able to do at scale, so removal stayed the owner's act and the preset handed over a list rather
than a button. Revision 21 later allowed one bounded erasure of a retired note; the same asymmetry is
why it is one note at a time and why the plan is separate from the act. §9 states it. Revision 11 adds the ninth on-demand discipline: a paper already
chosen for study becomes **one explanation note per method section**, attached to its reference-library
record, with background, case study and conclusion sections deliberately not written. It records three
things that discipline is built on rather than leaving them to its own text: the note is a different
artifact from the digest `INV-EVID-4` speaks of, and neither replaces the other; a section the record
already covers is never written twice, including coverage recorded only in a note's own opening line;
and repairing an older note's damaged formula delimiters is **mechanical only** — a repair that guesses
at what a broken formula meant is a rewrite, and a rewrite is not a repair. §4 and §6 are restated
accordingly. Revision 10 records what authorizes a write into the reference
library. The reference manager raises its dialog on every request for a key — the local API has no
"this application is already trusted" path, so the answer "Always Allow" chooses the kind of key issued
and never whether the owner is asked again — and this preset then discarded that lasting key when the
process ended, so every run asked again. Measured on the owner's own profile: one helper's 26 lasting
authorizations were 26 dialogs, 25 of them after the first "Always Allow". What was wrong was the
discard, not the dialog. Revision 10 therefore records that a key the owner chose to make lasting is
kept, partitioned by the server id it was granted for; that "Allow" covers exactly one write and is
never written down; that a revocation reaches the tools as a rejected key and is answered by asking
again; and it restates §5, §6, §8 and §9 accordingly, superseding the "per-write authorization" wording
of Revision 7. Revision 9 records how the filter covers a plugin that registers
after the preset activates: it is re-applied on every `tools/change`, the registry's own announcement
that the available tool set changed. The pass it replaces listened on `agent/created`, which — measured
against a real session — never reached this preset's row at all, so five tools of the configuration
bundle, one of them destructive, were reachable by every agent of this preset. §5 and its coverage
block state the mechanism as it now is. Revision 8 records that the preset mounts **no MCP server at all**:
both external channels are helper programs its own disciplines name — Revision 18 extends that to the
third — so a channel nobody uses costs
nothing, and the surface an agent sees is no longer a function of someone else's tool list. It corrects
§6 on two points — the preprint channel carries search and records rather than full text, and the
channels are reached through the preset's own helpers rather than through rows — and it narrows §5's
example accordingly, since the capability it bounds is now shipped as a program rather than registered
as a tool. Revision 7 adds `INV-HELPER-1`: a path this preset hands an agent
for its own helper programs must resolve from the agent's working directory, because a study workspace
carries no copy of them and a path relative to this repository therefore names nothing there. It also
records that the reference-library channel now serves write-capable tools; their use stays bounded by
`INV-EVID-3`'s per-write authorization and by a resident policy line rather than by masking, because §5
shows that a tool a row of this preset registers cannot be hidden. Revision 6 records two resident rules added for failure modes
observed in the field — an absence claim must carry the targeted check, the scope and the hit count
that make it an absence, and a number that follows from how an object was constructed is not a
measurement — together with a re-anchoring rule that keeps the round's original request visible; it
also states the exact scope of the isolation guarantee in §5 as **tools only**, because the skill
catalog merges every layer and the registry exposes no restriction call for it. Revision 5 records the owner's local reference library as a **full-text channel** and not a title index: a library searched only through bibliographic metadata reports an absence that is not an absence for the paywalled work it already holds. Revision 4 added `INV-ROW-1`, which requires every row name this preset declares to resolve through the host's module resolver from the profile's base URL: a package that declares `exports` seals its own subpaths, so a subpath the map omits makes the whole preset unusable while the file sits on disk. Revision 3 recorded a second, best-effort pass applied on every agent creation for plugins that register after the preset activates, and narrowed the guarantee to activation-time coverage, because that pass has not been confirmed to take effect at runtime; Revision 9 supersedes it, having measured both that the pass never ran and which event actually reaches this preset's row. Revision 2 corrected the tool-isolation section: the filter is a deny list over the global view, because a restriction also filters ancestor contributions — the preset's own rows — and an allow list therefore masked the preset's own tools. The concept-to-name index is [`surface.md`](surface.md).

## 1. Notation and units

This contract involves no physical units. Every quantity below is a count, a name, a path, or a
boolean state.

| Term | Meaning |
|---|---|
| **Preset** | A named, selectable composition that defines one agent's identity, tools and discipline. |
| **Bundle** | An installable package that contributes rows to a profile. |
| **Row** | One entry in a composition: a plugin plus its configuration. |
| **Profile** | The composition a running harness boots: bundles, then user overrides. |
| **Global tool** | A tool registered by a profile-level plugin. Visible to every session unless masked. |
| **Scope-local tool** | A tool registered by a row the preset itself declares. Visible to that preset's agents, and unaffected by masking. |
| **Keep-list** | The explicit set of global tools a preset chooses to retain. |
| **Discipline** | A written rule set that constrains how research is conducted. Resident disciplines are always in force; on-demand disciplines are loaded when their trigger is met. |
| **Three-way typing** | The obligation to mark every statement as evidence-backed, an inference, or undecided. |
| **Handoff** | Delegating a deliverable to a subagent, and receiving it back. |
| **Run** | One execution of code intended to test a hypothesis. |
| **Protocol** | What one run was declared to do before it ran: prediction, reference population, the closed variant set, validity gates, decision rule. Written before the run, never revised after it. |
| **Card** | The record of one run as it happened: command, configuration, artifacts, observation, validity, verdict. It cites its protocol rather than restating it. |
| **Study** | One research project, living in its own workspace with its own conventions. |
| **Scaffold** | The default layout and instruction file the preset offers a new study. |

## 2. The chain, and where the boundary is

The system separates three layers, and the boundary between them is the whole design.

```mermaid
flowchart TD
  Profile[Profile composition] --> Bundles[Installed bundles]
  Bundles --> Global[Global tool registry]
  Profile --> Decl[Preset declaration]
  Decl --> Realm[Preset scope]
  Realm --> Agent[Agent scope of this preset]
  Agent --> Local[Scope-local registrations]
  Global -.->|"keep-list only"| Agent
  Global -.->|"everything else"| Masked[Masked from this preset]
```

```mermaid
flowchart LR
  Q[Question] --> L[Literature]
  Q --> C[Challenge]
  L --> H[Handoff]
  H --> R[Run and record]
  R --> S[Settlement]
  S --> Q
```

- **The preset owns how research is conducted**: identity, resident discipline, which disciplines
  exist, which tools are visible, and how evidence and progress are recorded. It is domain-neutral
  and must remain so.
- **The study owns what is researched**: its question, its invariants, its document hierarchy, its
  data and its code. These live in the study's workspace, not in the preset.
- **An existing study hierarchy outranks the scaffold.** Where a study already defines where its
  documents live and which of them are normative, the preset follows it and creates nothing
  parallel. The scaffold is a default for studies that have no convention yet.
- **Nothing of the preset lives at profile level.** A row mounted at profile level is visible to
  every unrelated session in the profile, which is the leak this contract forbids in both
  directions.

## 3. The resident discipline

The resident discipline is part of every request. It is small on purpose, and every rule in it must
be **decidable**: a reader must be able to say whether it was violated.

```text
1  three-way typing          fact | inference | exploratory, on every statement
2  no unfalsifiable wording  no "study further", "promising", "many studies show"
3  no citations from memory  every source actually read, with a path or an identifier
4  read before writing       survey first; follow an existing hierarchy
5  three kinds of "nothing"  not searched | searched and absent | not yet searched; an absence
                             claim carries its targeted check, its scope and its hit count
6  decisions belong to the user
7  no silent contract change  revision + reason, or request a ruling
8  no exceeding the mandate
9  a subagent report is evidence, not a fact
10 a construction is not a   a number that follows from how the object was built is a property
   measurement               of the definition, not a finding
11 re-anchor to the request  the requested items are tracked as delivered or outstanding, and a
                             new branch names the outstanding item it serves
```

```text
fact          the artifact says X, at this path, read this way
inference     my reading of it, together with the reasoning chain
[exploratory] a hunch with no run behind it
```

Rules 3 and 9 are the same idea at two scales: nothing enters the record because it was said.
Rule 9 exists because a handoff is where an unchecked claim most easily becomes the parent's own
voice.

Rule 10 guards the opposite failure: a number that is exact and reproducible yet was never a
measurement, because it follows from how the object was built rather than from the world. Rule 11 is
the only rule aimed at the shape of a session rather than at a statement — it keeps a round's
original request visible, so that a chain of individually justified steps cannot quietly replace it.

The resident discipline also carries **routing**: each on-demand discipline states the situation
that triggers it. Routing is a hard rule, not a suggestion — a trigger that is met without the
discipline being loaded is a violation.

## 4. Disciplines loaded on demand

Each on-demand discipline is a written contract with fixed sections: when to use, the ruler to read
first, criteria, local exclusion conditions, wording discipline, report shape, instrument
discipline, an acceptance checklist, and what it does not do. The **local exclusion conditions** are
the load-bearing part: they say when to stop rather than to make something work.

```text
scoping      a vague topic becomes a decidable question; pseudo-questions are sent back
literature   sources are graded by what was actually read; contradicting evidence is mandatory
sections     a paper already chosen for study becomes one `/section-N` note per TOP-LEVEL method
             section, attached to its library record; background, case study and conclusion
             sections are not written, a claimed section is never written twice, a dotted key is
             neither written nor read, a pasted note is claimed or rewritten in place, a wrong
             record is retired rather than deleted, and a paper-level `/digest` is projected
             from the notes
adoption     what a paper read may lend becomes a ruled ledger: the paper's own locator, the
             condition it holds under, our normalized form beside the paper's, the module it
             becomes, and the number a test can assert — the owner rules, nothing enters code
             without an anchor, and the ledger grounds no conclusion
challenge    a claim is opposed with a counterexample, contradicting evidence, or a
             falsification path — or the challenge reports that it cannot challenge
settlement   conclusions, rejected directions and rulings are settled into three layers
metadata     bibliographic records come from a REST source; metadata is never evidence
handoff      a delegated deliverable is fixed before spawning; a child's conclusion is
             unverified until the parent reads the artifact
run          a hypothesis is written down before it is tested, and the test becomes a card;
             "ran" is not "valid", and a card citing an artifact nobody can retrieve is not
             evidence
synthesis    several explored directions become one executable draft: the choice, the criteria
             it won on, the rejected alternatives and their grounds, and the acceptance
             criterion that would refute it
```

Two invariants follow from the shape of these contracts:

- A discipline that cannot name a **local exclusion condition** is decorative.
- A discipline that cannot state its **artifact shape** produces prose, not evidence.

## 5. Tool visibility and isolation

An agent of this preset sees exactly two groups of tools:

```text
visible = (tools registered by rows this preset declares)      # the preset's own
        ∪ (global tools named in the keep-list)                # explicitly retained
```

```json
{ "deny": ["<global tool names the preset does NOT retain>"] }
```

The filter is expressed as a **deny list over the current global view**, not as an allow list, and that
is a correctness requirement rather than a style choice:

- A restriction filters what a scope **inherits** — the global layer and every ancestor layer on its
  chain — and never what that scope's **own** layer registers. For an agent, the preset's own rows are
  an **ancestor contribution**, so an allow list naming only global tools also masks every tool the
  preset declares itself: the agent ends up with no shell and no file tools.
- The deny list is `(every name in the global view) − keep-list`, and it removes exactly the
  globals outside the keep-list without touching the preset's own tools. **The guarantee is
  activation-time coverage.**
- A second pass runs on every `tools/change`: the registry announces a registration, an unregistration,
  or a change to a scoped restriction, and the filter is recomputed and re-applied. It covers a plugin
  that registers after the preset activates, which is the measured case — the configuration bundle
  reads the `tools` service, so its five tools appear afterwards, one registration at a time. That
  event is dispatched without scope filtering on purpose, which is what lets a listener here see it; a
  pass tied to a scope-filtered event did not, and the coverage it appeared to give did not exist.

The filter is applied only when there is something to deny. It is applied at preset activation — the
guarantee — and again whenever the registry announces that the tool set changed:

```text
at preset activation:   deny = { n ∈ global view : n ∉ keep-list }   # the guarantee
at a tools/change:      deny = { n ∈ global view : n ∉ keep-list }   # covers a late registration
restrictions intersect, so the passes compose; an unchanged set is not re-applied
```

This is a deliberate failure mode. A filter naming an unregistered or scope-local tool is rejected by
the registry, so a keep-list copied naively would take the whole preset down. Building the filter from
the registry's own global view means it can contain neither, and a renamed or absent keep-list entry
degrades the isolation instead of breaking the preset — reported, not silent.

The keep-list exists because the preset's own disciplines depend on some global tools. The memory
disciplines are the clearest case: the settlement discipline records conclusions and rejected
directions through them, so masking them would leave a written discipline with no instrument.

**The scope of this guarantee is tools, and the word is exact.** The skill catalog is not isolated by
any mechanism this preset can reach. A preset's own disciplines are registered into its own layer,
but a catalog read merges the global layer with the viewing scope's chain, and the skill registry
exposes no restriction call that a row could apply to it — so a profile carrying other bundles
contributes their skills to this preset's catalog as well. That is a boundary of the artifact rather
than a defect a row can correct, and the resident discipline states how an entry outside the routing
list is to be treated. Everything above about tool visibility is unaffected.

**A consequence of the same rule: a capability this preset ships cannot be masked.** Because masking
never reaches a tool registered by a row of this preset, a write-capable capability shipped by such a
row is reachable by every agent of this preset, and no restriction call can remove it — the filter is
the wrong instrument for that job and is not the one the contract relies on. The bound on such a
capability is the contract itself: a write into the reference library needs `INV-EVID-3`'s
authorization, which the owner grants in the reference manager's own dialog and can revoke there, §9
forbids an unattended or assumed one, and the preset states that policy in the agent's prompt rather
than depending on the capability's absence.

## 6. External evidence channels

The preset reaches literature through three kinds of channel, and they are not interchangeable:

```text
preprint index        search and records of preprints - metadata and abstracts; no credentials
local reference lib   the study owner's own library, searchable by attachment full text; includes the
                      full text of paywalled works
bibliographic REST    identifiers, venues, years, counts — metadata only, never evidence
```

These rules bound their use:

- **Full text and metadata are different evidence classes.** A record obtained from a bibliographic
  REST source can never be the strongest grade; only text actually read can.
- **A count is quoted with the source that produced it and the date it was read.** The same work was
  measured at 43,412 citations on one bibliographic source and 46,513 on the other, minutes apart, so a
  count without its source is a number a reader cannot check, and a count is a snapshot of a retrieval
  rather than a property of the work.
- **A channel that answers `HTTP/1.0` or rate-limits without a credential must be handled as a
  known constraint**, not retried in a loop. Rate limiting is a finding about the channel.
- **The owner's library is searched by full text, not only by metadata.** A library read as a title
  index turns work it already holds into a false absence, and that absence is a statement about the
  query rather than about the library.
- **The reference-library channel also carries writes, and they are bounded by the same gate.**
  Adding, editing, filing or removing a record is a write, so it needs `INV-EVID-3`'s authorization and
  its read-back before it is reported. The authorization is the reference manager's, not this preset's:
  "Allow" covers the one write and is spent by it, while "Always Allow" is a grant the tools keep for the
  library it was given for, so the owner answers once per library rather than once per write, and revokes
  it there when they want the asking back. A revoked grant reaches the tools as a rejected key, and they
  ask again rather than retry a credential they no longer hold. Which library operations exist is a
  property of the channel, not a permission.
- **A read must say which file it read.** Full text is keyed by an attachment rather than by the record,
  and a record may carry several, so a reading states which one answered and what was not read. A
  channel that returns an empty text for an unindexed attachment, or a failure as if it were a record,
  is reporting about itself rather than about the work.
- **A note written onto a record stays the owner's.** The channel's note writes are additive, a claim,
  or a replacement of an import the owner pasted. Identity is a tag, not a comment in the body: a
  section note carries `/section-N`, a paper-level digest carries `/digest`, a note out of service
  carries `/retired`, and a note that came from outside carries `/imported`. The application may
  rewrite a note's body and eat an invisible comment; it does not touch a tag. A note with no
  `/section-` tag is **unknown**: it is read before anything is written, because the channel does not
  parse prose and a note carrying no claim is not coverage. A reading that disagrees with a tag stops
  the round for the owner to settle; it is never written around. A section a record already claims is
  refused rather than written twice, and **what is counted is the top-level section**: a dotted key is
  neither written nor read, and a note keyed to a subsection is unknown until it is merged into its
  top-level section or retired. A note with no `/section-` tag, or `/section-N` + `/imported`, is an
  import and may be rewritten in place, after a dry run and a version guard. A `/section-N`
  note without `/imported` is a record: its prose is not rewritten in place, and a change to it is a
  retirement and a replacement. There is no automatic prose repair, and a rewrite writes no workspace
  backup: the plan prints the old first block, the paper remains the source, and a note the
  application edited while the write ran is refused rather than overwritten.
- **A note that is wrong is retired, not rewritten in place.** Its body is left exactly
  as it stands and `/retired` is added. A retired note is a tombstone rather than coverage, so the
  section it claimed becomes writable again, and removing the mark restores the claim it made. The note
  that replaces it names the one it replaced and why: that is the record of a supersession. Only a
  retired note is eligible for a deletion: `--delete` states the plan and the irreversibility facts,
  and `--write` performs one erasure — the version it was read at is the precondition, and a read-back
  404 is what proves it.
- **The digest is a projection of the section notes.** One record has one live `/digest` note,
  synthesized from its `/section-N` notes; every sentence traces to a section note and it introduces
  no fact those notes do not carry. It is refreshed in place under a version guard, and the
  same visible text is reported as already recorded with nothing written. The old body is kept **in
  the library**, not in a workspace file: before the patch, it is written once as a `/digest` +
  `/retired` child note on the same record, which takes part in no coverage and may itself be
  deleted later. It is not the reading record: how far a paper was read, and why that reading stopped,
  are a row in the question's own ledger (§7), and a paper with no section notes has no digest.
- **A reading states which rung of the ladder answered it.** The rungs, cheapest first, are the
  library's indexed text, the attachment's own text layer, and the page rendered as an image. A channel
  that returns an empty text for an attachment it never indexed is reporting about itself; a text layer
  whose font encoding is broken reports confidently and wrongly about mathematics; a rendered page
  answers questions neither can. Spending a rung that costs more than the one below it is a decision to
  state, not a default, and what a rendered page yields is read as an image rather than quoted as
  though it were text.

The channels are reached through **helper programs this preset itself ships and its disciplines name**,
never through a profile-level mount, so that enabling a research channel cannot change what an unrelated
session can do. A channel is therefore not a set of tools the harness registers on the preset's behalf:
it is a program the agent runs, which is why an unused channel costs nothing on a request.

## 7. The study scaffold

The scaffold offers a study the minimum it needs to be auditable. Roles, not just paths:

```text
<study>/
  AGENTS.md            domain constraints: invariants, authority order, notation, environment
  research/
    00_scoping.md      question, boundary, non-goals, decidability
    literature/        reconstruction notes — non-normative by construction; one file per research
                       question, and each file carries that question's own reading ledger: one row
                       per paper, the depth the reading reached and the verdict that stopped it
    adoption/          one ruled ledger per reference read: what may be borrowed, on what terms,
                       into which module, and the number that proves the code
    rulings/           challenges and the rulings on them
    journal/           the round-by-round record; never a conclusion
    owner_actions.md   what this preset asks the owner to do, and cannot do itself: one row per item,
                       naming the record, the note, the section, the action, why, the replacement
                       draft's path and its status; a request, never a record
    experiments/       what a run was predicted to do, what it did, and what proves it: the
                       prediction is written before the run, so it lives in its own file
      protocols/       one pre-registration per run, named by the run's id
      evidence/        copies of the cited artifacts a run wrote outside the study's own record
    pitfalls/          symptom-indexed operational record; pruned when obsolete
    archive/           retired documents, and a README saying what they were and what replaced them
  .agents/skills/      study-level discipline, if the domain needs one
```

The authority order is part of the contract: domain constraints outrank the scoping document, which
outranks non-normative notes; a journal is a record and never grounds a claim; a pitfall entry
carries the environment and date it applies to, so it can be deleted when it stops applying. An
adoption ledger sits on both sides of that line and the contract says which is which: it grounds no
claim, like a note, and it **binds the code**, so a module that disagrees with a ruled item is a defect
rather than a difference of opinion. An owner-action list is a third kind of thing: a request, which
states what the round could not do itself, carries the reason and the replacement with it, and grounds
nothing.

A retired document is moved into the study's archive with a note saying what it was and what replaced
it, and is not rewritten there; a live pointer into it is updated, a dated record inside it is not. The
reason a direction was retired is the reusable part of it, and that reason survives only if the file
carrying it survives unchanged.

## 8. Domain invariants

Every row must be falsifiable: a check must exist that can fail.

| ID | Invariant | Why it is semantic |
|---|---|---|
| `INV-SCOPE-1` | An agent of this preset can call exactly the tools its own rows register, plus the global tools in the keep-list. | It defines the surface: what a research agent can do at all. |
| `INV-SCOPE-2` | A tool registered by a row the preset declares is never hidden by masking. | Otherwise the preset could hide its own capabilities, making the contract self-contradictory. |
| `INV-SCOPE-3` | When the keep-list intersects the global registry to nothing, masking is not applied and the omission is reported. | The failure mode must be "no isolation, loudly", never "the preset does not load". |
| `INV-SCOPE-4` | No row of this preset is mounted at profile level. | A profile-level mount leaks into every unrelated session, in both directions. |
| `INV-ROW-1` | Every row name this preset declares resolves, through the host's module resolver and from the profile's base URL, to the module that row intends. | A name that resolves while the composition is built but not during the registry's trial mount marks the whole preset unusable, and the roster hides such a preset instead of reporting it. |
| `INV-HELPER-1` | Every path this preset gives an agent for one of its own helper programs resolves from the agent's working directory. | A study workspace carries no copy of those programs, so a path relative to this repository names nothing there: the discipline reads as actionable while the tool it names is unreachable. |
| `INV-DISC-1` | Every resident rule is decidable by a reader. | An undecidable rule cannot be enforced, so it is decorative. |
| `INV-DISC-2` | Every statement is classed as evidence-backed, inference, or undecided, and is presented as no more than its class. | This is what separates a research record from a plausible narrative. |
| `INV-DISC-3` | A delegated conclusion is not the parent's fact until the parent has read the artifact itself. | Verification and attribution must not collapse into one act. |
| `INV-EVID-1` | A run with no artifact path is not reportable. | Reproducibility is the only property that makes a run evidence. |
| `INV-EVID-2` | A read-only input is never mutated, and a negative result is never deleted. | Both preserve the meaning of results already published. |
| `INV-EVID-3` | A write into the reference library happens only under an authorization the owner granted for that library, and is reported only after a read-back matches what was sent. | The library is the owner's curated evidence base; an unauthorized or unverified write corrupts the very thing the preset depends on. |
| `INV-EVID-4` | A source already read is not read again to recover what it or its section notes say: how far a paper was read, and why that reading stopped, are a row in the question's own ledger, the section notes are the transcription of the reading, the digest is their paper-level projection, and one reading is recorded once, so a round that is re-run writes nothing. | Re-reading is the dominant avoidable cost of a literature round: the ledger row says where the last reading stopped, a transcript plus a projection is what makes that reading reusable, and a study-level receipt can say neither for a question it is not about. |
| `INV-EVID-5` | An artifact a run's record cites is obtainable by a reader of that record: where a run writes outside the study's own record, a copy is kept with the record, and a citation that cannot be obtained is stated as such rather than presented as evidence. | Evidence a later reader cannot reach is not evidence, and a citation that silently degrades into a dangling path is indistinguishable from one that was never checked. |
| `INV-EVID-6` | One paper is recorded once per research question: the question's ledger carries its `depth` and `verdict`, a row is never deleted, a verdict that changes leaves a dated line beside the old one, and no study-level record of what has been read exists. | A study has several questions in flight, and they read the same paper to different depths; a shared read state collapses them into one blurry "read" that neither question can act on, while a deleted row destroys the judgement it recorded. |
| `INV-ADOPT-1` | An item of an adoption ledger reaches code only with the paper's own locator, the condition it holds under, our normalized form beside the paper's verbatim one, and a numeric anchor; an item without an anchor is a candidate and is never reported as adopted or verified. | A correct transcription and a wrong implementation read the same in prose, so the anchor is the only check in this chain that can fail — without it the ledger records an intention rather than a gate. |
| `INV-ADOPT-2` | One formula has one transcription: where a section note already holds it, the ledger cites that note and does not derive the formula again. | Two transcriptions of one equation produce two versions, and nothing later can say which one the code was written from. |
| `INV-ADOPT-3` | Every verdict in the ledger is the owner's, dated and recorded with its grounds; the agent proposes candidates only. | A ledger that rules for its owner replaces the owner's judgement with the agent's, and the record can then no longer be re-examined. |
| `INV-ADOPT-4` | The ledger grounds no research conclusion, and it binds the code it rules into. | Treated as evidence it would let a plan masquerade as a finding; treated as advisory it would let the code drift from what was ruled. |
| `INV-NOTE-1` | One section has one **live claim**: a note with no `/section-` tag is not coverage, a retired note is not coverage, retiring is reversible, retiring changes nothing the note says, and the note that replaces a retired one names it. | The alternatives are both losses: a wrong note that blocks its section forever, or a deletion that takes the record of what was replaced with it. |
| `INV-NOTE-2` | One record has one live `/digest`, and the digest is a projection of the record's section notes: every sentence traces to a `/section-N` note, it introduces no fact those notes do not carry, and a changed digest refreshes that note in place rather than appending to it or creating a second one; the body it replaces stays in the library as a `/digest` + `/retired` child note. | A digest that can introduce its own facts is a second, unaudited reading; one that accumulates versions in its own body is no longer a projection of the notes it claims to summarize, and an old body kept only on a disk is not a record the library can show. |
| `INV-NOTE-3` | A note is removed only after it is retired, one note per command, carrying the version it was read at as a precondition and proved gone by a read-back 404. | This channel has no trash, so a removal is irreversible; the only defensible removal is one whose target was already out of service and whose plan the owner read. |
| `INV-CTX-1` | A full text is loaded only after the cheaper rungs of the reading ladder cannot answer the question; the rungs are the library's indexed text, the attachment's own text layer, and the page rendered as an image, and a reading states which one answered. | Context is the scarce resource of a research session, so loading it is a spending decision rather than a default — and the rungs fail differently, so an unstated rung cannot be told from another. |
| `INV-DEC-1` | A commitment is preceded by an executable draft that names the criteria it won on and the observation that would refute it. | A choice without criteria and without a failure condition cannot be re-examined when it fails. |
| `INV-PROJ-1` | An existing study hierarchy outranks the scaffold's default layout. | The preset is domain-neutral; a study's conventions carry its meaning. |
| `INV-DOC-1` | The contract names no public symbol, and the index is a bijection with the authoritative list. | It keeps the contract stable under renames and stops the index drifting from reality. |

## 9. Outside this domain (non-goals)

- No resident, self-organizing band of agents with consensus voting. The preset is a workbench, not
  a research group simulation.
- No automatic experiment orchestration: the preset provides the record, not a scheduler.
- No adoption that follows from having been read. A paper being relevant never puts a formula into code:
  the ledger's ruling and the number that proves it are the gate, and this preset performs neither on the
  owner's behalf.
- No unattended write-back into the reference library: nothing writes while the owner is not the one who
  asked for it. A write happens only under an authorization they granted in the reference manager — the
  single write their "Allow" covers, or their standing grant for that library — never as a background
  action, and never on the strength of a grant that was refused or has been revoked. A whole-library
  migration is not a write this preset performs at all.
- No deletion as cleanup. This API cannot put an item in the trash — measured 2026-10-16: a `DELETE`
  answers `204`, the record answers `404` afterwards, and the trash neither grows nor keeps the key;
  measured 2026-10-18: an item carries no `deleted` field at all, and the request parameter that would
  ask for trashed items is accepted and ignored, so there is no soft delete to reach for. A removal is
  therefore an erasure, and this preset performs one only on a `/retired` note, one note per command,
  after printing the plan and the irreversibility facts, and only with `--write`; the version it was
  read at is the precondition and a read-back 404 is the proof. A deletion made in the application
  does go into that trash and is recoverable — on 2026-10-18 the trash held 473 items, 315 of them
  notes — so a bulk cleanup remains the owner's act there. A section is freed by retiring a note
  rather than by removing one (§6).
- No version control of the study workspace, and no opinion about it.
- No domain-specific rule. Domain invariants belong to the study.
- No cost, schedule, or resource optimization.
- No direction-divergence loop. Generating several mutually distinct directions and killing them on
  explicit criteria is deliberately deferred; the scoping discipline currently offers candidates but
  not a cull.
- No claim about the truth of any study's conclusion. The preset constrains how conclusions are
  reached and recorded, and nothing more.
