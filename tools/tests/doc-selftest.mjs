// Documentation structure self-test for the contract/index split.
//
// Usage: node tools/tests/doc-selftest.mjs [--negative-controls]
//
// Checks the split between the normative contract and the non-normative index, the entry document's
// obligation to link both without repeating the symbol list, and the reader-facing coverage map's
// obligation to list every part that exists and no part that does not. The authoritative symbol list
// is derived from the sources of truth (discipline front-matter and the composition's server names),
// never from a copy inside the documents.
//
// The coverage map is the SECOND list of discipline names in this repository, and the rule it has to
// satisfy is stated where it lives: a list nobody checks drifts. `surface.md` is held to the roster by
// DOC-5; the map is held to it by DOC-9, and its paths by DOC-8. One checks concept-to-name, the other
// part-to-coverage; neither is the other's copy.
//
// `--negative-controls` mutates the documents in memory and asserts the checks actually fail.
// A check that cannot fail is not a check.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const PROTOCOL = join(ROOT, 'protocol.md')
const SURFACE = join(ROOT, 'surface.md')
const README = join(ROOT, 'README.md')
const COVERAGE = join(ROOT, 'docs', 'coverage.md')
const SKILLS_DIR = join(ROOT, 'skills')
const PATCH = join(ROOT, 'cordis.patch.yml')

const MIN_STRUCTURED_BLOCKS = 8
const MIN_MERMAID_DIAGRAMS = 2

/** Discipline names, from the front-matter of the shipped skill files. */
function disciplineNames() {
  // Deliberately not `Dirent.isDirectory()`: on Windows a reparse point (OneDrive placeholder, a
  // junction) reports false there while still holding files, which silently emptied this list.
  return readdirSync(SKILLS_DIR)
    .map((name) => {
      try {
        const text = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8')
        return text.match(/^name:\s*([\w-]+)\s*$/m)?.[1] ?? null
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

/** Authoritative public symbols: discipline names + MCP server names. */
function authoritativeSymbols() {
  const servers = [...readFileSync(PATCH, 'utf8').matchAll(/^\s*serverName:\s*'?"?([\w-]+)'?"?\s*$/gm)].map(
    (match) => match[1],
  )
  return [...new Set([...disciplineNames(), ...servers])].sort()
}

/** Info strings of every fenced block, in document order. */
function fencedInfos(text) {
  const infos = []
  let inside = false
  for (const line of text.split('\n')) {
    if (!line.startsWith('```')) continue
    if (inside) inside = false
    else {
      inside = true
      infos.push(line.slice(3).trim())
    }
  }
  return infos
}

/** Symbols listed in the Symbol column of the index table. */
function indexedSymbols(text) {
  const symbols = new Set()
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|')
    if (cells.length < 4) continue
    for (const span of cells[2].matchAll(/`([^`]+)`/g)) symbols.add(span[1])
  }
  return [...symbols].sort()
}

/**
 * Disciplines the coverage map gives a row to, read from the source path each row cites.
 *
 * The map names its authoritative text as an inline-code path, so the roster it claims is exactly the
 * set of `skills/<name>/SKILL.md` paths it prints. A row deleted, or a path pointing at a discipline
 * that does not exist, therefore changes this list.
 */
function mapDisciplines(text) {
  const names = [...text.matchAll(/`skills\/([\w-]+)\/SKILL\.md`/g)].map((match) => match[1])
  return [...new Set(names)].sort()
}

// Names this repository retired. The reader-facing documents describe the artifact as it is now, so
// naming a retired location there sends a reader to something that no longer exists; the Chinese
// review aids and the frozen development log may of course keep their historical references.
const RETIRED_REFERENCES = ['autoresearch-preset/', '@local/dsh-autoresearch-preset']

/** Every repo-relative path a document names in inline code, e.g. `tools/preset-selftest.mjs`. */
function pathTokens(text) {
  return [...text.matchAll(/`([A-Za-z0-9_./*-]+\.(?:md|js|mjs|yml|json|ps1))`/g)]
    .map((match) => match[1])
    .filter((token) => token.includes('/') && !token.startsWith('/'))
}

/**
 * Whether a documented path exists, where `*` matches exactly one path segment.
 *
 * It walks segment by segment and never asks whether an entry is a directory: on Windows a reparse
 * point (a OneDrive placeholder, a junction) answers false to that question while still holding files,
 * and the trap has silently emptied a list in this repository once already. Matching a file where a
 * directory was expected is harmless, because the next segment simply does not exist under it.
 */
function documentedPathExists(token) {
  const segments = token.split('/').filter((segment) => segment !== '' && segment !== '.')
  let frontier = [ROOT]
  for (const segment of segments) {
    if (segment.includes('*') && segment !== '*') return false
    const next = []
    for (const base of frontier) {
      if (segment !== '*') {
        next.push(join(base, segment))
        continue
      }
      try {
        // `readdirSync` yields names, not Dirents: asking for `withFileTypes` here would re-introduce
        // the reparse-point trap this walk avoids on purpose.
        for (const name of readdirSync(base)) next.push(join(base, name))
      } catch {
        // Not a directory, so it has no children to match.
      }
    }
    frontier = next.filter((candidate) => existsSync(candidate))
    if (frontier.length === 0) return false
  }
  return frontier.length > 0
}

const files = {
  protocol: existsSync(PROTOCOL) ? readFileSync(PROTOCOL, 'utf8') : null,
  surface: existsSync(SURFACE) ? readFileSync(SURFACE, 'utf8') : null,
  readme: existsSync(README) ? readFileSync(README, 'utf8') : null,
  coverage: existsSync(COVERAGE) ? readFileSync(COVERAGE, 'utf8') : null,
}

/**
 * Whether a document names a public symbol, as opposed to merely containing its letters inside a longer
 * path token.
 *
 * The contract states the study scaffold's layout, and one of the directories a study carries is named
 * after the discipline that fills it (`.section-notes/`). A substring test cannot tell that path from a
 * mention of the discipline, and reporting it would push the contract into describing the layout without
 * naming one of its own directories. A symbol is therefore matched only where it stands as a word: not
 * glued to the `/`, `.` or `-` of a surrounding path segment.
 */
function mentionsSymbol(text, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^\\w./-])${escaped}(?![\\w/-])`, 'm').test(text)
}

const checks = [
  {
    id: 'DOC-1',
    label: 'the contract names no public symbol',
    run: ({ protocol, symbols }) => {
      const leaked = symbols.filter((name) => mentionsSymbol(protocol, name))
      return leaked.length === 0 ? null : `leaked: ${leaked.join(', ')}`
    },
  },
  {
    id: 'DOC-2',
    label: 'the contract carries enough structure (blocks + diagrams)',
    run: ({ protocol }) => {
      const infos = fencedInfos(protocol)
      const diagrams = infos.filter((info) => info === 'mermaid').length
      const structured = infos.length - diagrams
      return structured >= MIN_STRUCTURED_BLOCKS && diagrams >= MIN_MERMAID_DIAGRAMS
        ? null
        : `structured=${structured} (need ${MIN_STRUCTURED_BLOCKS}), diagrams=${diagrams} (need ${MIN_MERMAID_DIAGRAMS})`
    },
  },
  {
    id: 'DOC-3',
    label: 'the contract declares normative precedence',
    run: ({ protocol }) => {
      const head = protocol.slice(0, 800).toLowerCase()
      const missing = ['normative', 'wins'].filter((word) => !head.includes(word))
      return missing.length === 0 ? null : `header missing: ${missing.join(', ')}`
    },
  },
  {
    id: 'DOC-4',
    label: 'the index defers to the contract',
    run: ({ surface }) => {
      const text = surface.toLowerCase()
      const missing = ['non-normative', 'protocol.md'].filter((needle) => !text.includes(needle))
      return missing.length === 0 ? null : `index missing: ${missing.join(', ')}`
    },
  },
  {
    id: 'DOC-5',
    label: 'the index is a bijection with the authoritative list',
    run: ({ surface, symbols }) => {
      const indexed = indexedSymbols(surface)
      const missing = symbols.filter((name) => !indexed.includes(name))
      const extra = indexed.filter((name) => !symbols.includes(name))
      return missing.length === 0 && extra.length === 0
        ? null
        : `not indexed: ${missing.join(', ') || '-'}; indexed but unknown: ${extra.join(', ') || '-'}`
    },
  },
  {
    id: 'DOC-6',
    label: 'the entry document links both documents and repeats no symbol list',
    run: ({ readme, symbols }) => {
      const missing = ['protocol.md', 'surface.md'].filter((needle) => !readme.includes(needle))
      if (missing.length) return `entry missing link: ${missing.join(', ')}`
      // Runnable commands legitimately name packages, so the prohibition covers prose only:
      // a fenced block is executable text, not a second copy of the index.
      const prose = readme.replace(/```[\s\S]*?```/g, '')
      const repeated = symbols.filter((name) => prose.includes(name))
      return repeated.length === 0 ? null : `entry repeats symbols in prose: ${repeated.join(', ')}`
    },
  },
  {
    id: 'DOC-7',
    label: 'no reader-facing document names the retired bundle layout',
    run: ({ protocol, surface, readme }) => {
      const hits = RETIRED_REFERENCES.flatMap((token) =>
        [
          ['protocol.md', protocol],
          ['surface.md', surface],
          ['README.md', readme],
        ]
          .filter(([, text]) => text.includes(token))
          .map(([name]) => `${name}: ${token}`),
      )
      return hits.length === 0 ? null : `retired layout still referenced by ${hits.join('; ')}`
    },
  },
  {
    id: 'DOC-8',
    label: 'every path in reader-facing prose still exists',
    run: ({ protocol, surface, readme, coverage }) => {
      const rootEntries = new Set(readdirSync(ROOT))
      const stale = []
      for (const [name, text] of [
        ['protocol.md', protocol],
        ['surface.md', surface],
        ['README.md', readme],
        ['docs/coverage.md', coverage],
      ]) {
        for (const token of pathTokens(text)) {
          // A path that climbs out of the repository — `../protocol.md`, the label the review aids in
          // `docs/` give a sibling document — is a link label, not a claim about this repository's
          // layout, and the walk below resolves from the root rather than from the document's own
          // directory, so it cannot judge one. Judging it anyway reported every such label as stale.
          if (token.startsWith('..')) continue
          const head = token.split('/')[0]
          // Only judge a path whose head is a root entry today, or a relative prefix. A path under a
          // package outside this repository is not a claim about this repository's layout, and the
          // documents legitimately name those. The limitation is real and stated rather than hidden:
          // this cannot catch a directory that was RENAMED away, because the old name is no longer a
          // root entry. Catching that case is what DOC-7 is for.
          if (head !== '.' && !rootEntries.has(head)) continue
          if (!documentedPathExists(token)) stale.push(`${name}: ${token}`)
        }
      }
      return stale.length === 0 ? null : `stale path in ${stale.join('; ')}`
    },
  },
  {
    id: 'DOC-9',
    label: 'the coverage map gives every part a row, and no part that does not exist',
    run: ({ coverage, disciplines }) => {
      const mapped = mapDisciplines(coverage)
      const missing = disciplines.filter((name) => !mapped.includes(name))
      const extra = mapped.filter((name) => !disciplines.includes(name))
      return missing.length === 0 && extra.length === 0
        ? null
        : `not mapped: ${missing.join(', ') || '-'}; mapped but not a discipline: ${extra.join(', ') || '-'}`
    },
  },
  {
    id: 'DOC-10',
    label: 'the coverage map defers to the contract',
    run: ({ coverage }) => {
      const missing = ['非规范', 'protocol.md'].filter((needle) => !coverage.includes(needle))
      return missing.length === 0 ? null : `coverage map missing: ${missing.join(', ')}`
    },
  },
  {
    id: 'DOC-11',
    label: 'the contract header states the revision its own changelog records',
    // The header declares one revision and the preamble records every revision this contract has
    // reached, newest first. They drifted once already: the header still said 15 while the preamble
    // recorded 16, and nothing in this repository looked at either. A header nobody checks is a
    // header that lies about which contract a reader is holding.
    run: ({ protocol }) => {
      const declared = protocol.match(/\*\*Status:\s*normative\.\s*Revision\s+(\d+)\s*\.\*\*/i)?.[1]
      if (declared === undefined) return 'the header declares no revision'
      const preamble = protocol.split(/\n{2,}/).find((block) => /Status:\s*normative/i.test(block)) ?? ''
      const recorded = [...preamble.matchAll(/Revision\s+(\d+)/g)].map((match) => Number(match[1]))
      if (recorded.length === 0) return 'the changelog names no revision'
      const highest = Math.max(...recorded)
      return Number(declared) === highest ? null : `header says ${declared}, the changelog reaches ${highest}`
    },
  },
]

function runChecks(input) {
  return checks.map((check) => {
    try {
      const failure = check.run(input)
      return { id: check.id, label: check.label, failure }
    } catch (error) {
      return { id: check.id, label: check.label, failure: `threw: ${error.message}` }
    }
  })
}

const symbols = authoritativeSymbols()
const disciplines = disciplineNames()
const missingFiles = Object.entries(files)
  .filter(([, text]) => text === null)
  .map(([name]) => name)
if (missingFiles.length) {
  console.error(`missing document(s): ${missingFiles.join(', ')}`)
  process.exit(2)
}

console.log(`authoritative symbols (${symbols.length}): ${symbols.join(', ')}`)
console.log(`disciplines (${disciplines.length}): ${disciplines.join(', ')}`)
const results = runChecks({ ...files, symbols, disciplines })
for (const result of results) {
  console.log(`  ${result.failure ? 'FAIL' : 'OK  '} ${result.id}  ${result.label}${result.failure ? `  -> ${result.failure}` : ''}`)
}
const failed = results.filter((result) => result.failure)
console.log(`\n${failed.length === 0 ? 'PASS' : `FAIL (${failed.length})`}`)

if (!process.argv.includes('--negative-controls')) process.exit(failed.length === 0 ? 0 : 1)

// Negative controls: each mutation must make at least one check fail.
const mutations = [
  {
    label: 'a public symbol injected into the contract',
    apply: (input) => ({ ...input, protocol: `${input.protocol}\n\nLeaked: \`${input.symbols[0]}\`\n` }),
  },
  {
    label: 'a bogus row added to the index table',
    apply: (input) => ({
      ...input,
      surface: input.surface.replace(/\n## Notes/, '\n| Bogus concept | `not-a-real-symbol` |\n\n## Notes'),
    }),
  },
  {
    label: 'a mermaid diagram removed from the contract',
    apply: (input) => ({ ...input, protocol: input.protocol.replace(/```mermaid[\s\S]*?```\n/, '') }),
  },
  {
    label: 'the normative precedence word removed from the contract header',
    apply: (input) => ({ ...input, protocol: input.protocol.replace(/\*\*this file wins\*\*/i, '**see below**') }),
  },
  {
    label: 'the retired bundle directory restored in the index',
    apply: (input) => ({
      ...input,
      surface: input.surface.replace('`skills/*/SKILL.md`', '`autoresearch-preset/skills/*/SKILL.md`'),
    }),
  },
  {
    label: 'a documented path renamed to something that does not exist',
    apply: (input) => ({
      ...input,
      surface: input.surface.replace('`skills/*/SKILL.md`', '`skills/*/NOTES.md`'),
    }),
  },
  {
    label: 'a part removed from the coverage map',
    apply: (input) => ({
      ...input,
      coverage: input.coverage.replace(/^\| 文献 `literature-recon`.*\n/m, ''),
    }),
  },
  {
    label: 'a documented helper renamed in the coverage map',
    // Deliberately not a case-only rename: `existsSync` is case-insensitive on Windows, so
    // `tools/zotero-READ.mjs` still resolves there and this control would pass without checking
    // anything. The control has to differ by more than case to be a control on this machine.
    apply: (input) => ({
      ...input,
      coverage: input.coverage.replaceAll('`tools/zotero-read.mjs`', '`tools/zotero-library.mjs`'),
    }),
  },
  {
    label: 'the coverage map no longer defers to the contract',
    apply: (input) => ({ ...input, coverage: input.coverage.replaceAll('protocol.md', 'the contract') }),
  },
  {
    label: 'the contract header left one revision behind its changelog',
    // One lower, not a fixed number: the control must keep working after the next revision bumps the
    // header, and it must be the drift this check was written for rather than an unrelated breakage.
    apply: (input) => ({
      ...input,
      protocol: input.protocol.replace(
        /(\*\*Status:\s*normative\.\s*Revision\s+)(\d+)/,
        (whole, prefix, revision) => `${prefix}${Number(revision) - 1}`,
      ),
    }),
  },
]

console.log('\nnegative controls (each mutation must break at least one check):')
let controlFailures = 0
for (const mutation of mutations) {
  const mutated = runChecks(mutation.apply({ ...files, symbols, disciplines }))
  const broken = mutated.filter((result) => result.failure)
  const detected = broken.length > 0
  if (!detected) controlFailures += 1
  console.log(`  ${detected ? 'OK  ' : 'FAIL'} ${mutation.label}  -> detected by ${broken.map((b) => b.id).join(', ') || 'nothing'}`)
}

console.log(`\n${failed.length === 0 && controlFailures === 0 ? 'PASS (including negative controls)' : 'FAIL'}`)
process.exit(failed.length === 0 && controlFailures === 0 ? 0 : 1)
