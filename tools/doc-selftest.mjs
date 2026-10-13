// Documentation structure self-test for the contract/index split.
//
// Usage: node tools/doc-selftest.mjs [--negative-controls]
//
// Checks the split between the normative contract and the non-normative index, and the entry
// document's obligation to link both without repeating the symbol list. The authoritative symbol
// list is derived from the sources of truth (discipline front-matter and the composition's server
// names), never from a copy inside the documents.
//
// `--negative-controls` mutates the documents in memory and asserts the checks actually fail.
// A check that cannot fail is not a check.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const PROTOCOL = join(ROOT, 'protocol.md')
const SURFACE = join(ROOT, 'surface.md')
const README = join(ROOT, 'README.md')
const SKILLS_DIR = join(ROOT, 'skills')
const PATCH = join(ROOT, 'cordis.patch.yml')

const MIN_STRUCTURED_BLOCKS = 8
const MIN_MERMAID_DIAGRAMS = 2

/** Authoritative public symbols: discipline names + MCP server names. */
function authoritativeSymbols() {
  // Deliberately not `Dirent.isDirectory()`: on Windows a reparse point (OneDrive placeholder, a
  // junction) reports false there while still holding files, which silently emptied this list.
  const skills = readdirSync(SKILLS_DIR)
    .map((name) => {
      try {
        const text = readFileSync(join(SKILLS_DIR, name, 'SKILL.md'), 'utf8')
        return text.match(/^name:\s*([\w-]+)\s*$/m)?.[1] ?? null
      } catch {
        return null
      }
    })
    .filter(Boolean)
  const servers = [...readFileSync(PATCH, 'utf8').matchAll(/^\s*serverName:\s*'?"?([\w-]+)'?"?\s*$/gm)].map(
    (match) => match[1],
  )
  return [...new Set([...skills, ...servers])].sort()
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
}

const checks = [
  {
    id: 'DOC-1',
    label: 'the contract names no public symbol',
    run: ({ protocol, symbols }) => {
      const leaked = symbols.filter((name) => protocol.includes(name))
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
    run: ({ protocol, surface, readme }) => {
      const rootEntries = new Set(readdirSync(ROOT))
      const stale = []
      for (const [name, text] of [
        ['protocol.md', protocol],
        ['surface.md', surface],
        ['README.md', readme],
      ]) {
        for (const token of pathTokens(text)) {
          const head = token.split('/')[0]
          // Only judge a path whose head is a root entry today, or a relative prefix. A path under a
          // package outside this repository is not a claim about this repository's layout, and the
          // documents legitimately name those. The limitation is real and stated rather than hidden:
          // this cannot catch a directory that was RENAMED away, because the old name is no longer a
          // root entry. Catching that case is what DOC-7 is for.
          if (head !== '.' && head !== '..' && !rootEntries.has(head)) continue
          if (!documentedPathExists(token)) stale.push(`${name}: ${token}`)
        }
      }
      return stale.length === 0 ? null : `stale path in ${stale.join('; ')}`
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
const missingFiles = Object.entries(files)
  .filter(([, text]) => text === null)
  .map(([name]) => name)
if (missingFiles.length) {
  console.error(`missing document(s): ${missingFiles.join(', ')}`)
  process.exit(2)
}

console.log(`authoritative symbols (${symbols.length}): ${symbols.join(', ')}`)
const results = runChecks({ ...files, symbols })
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
]

console.log('\nnegative controls (each mutation must break at least one check):')
let controlFailures = 0
for (const mutation of mutations) {
  const mutated = runChecks(mutation.apply({ ...files, symbols }))
  const broken = mutated.filter((result) => result.failure)
  const detected = broken.length > 0
  if (!detected) controlFailures += 1
  console.log(`  ${detected ? 'OK  ' : 'FAIL'} ${mutation.label}  -> detected by ${broken.map((b) => b.id).join(', ') || 'nothing'}`)
}

console.log(`\n${failed.length === 0 && controlFailures === 0 ? 'PASS (including negative controls)' : 'FAIL'}`)
process.exit(failed.length === 0 && controlFailures === 0 ? 0 : 1)
