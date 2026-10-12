// Unit self-test for the prompt bridge, runnable without DSH.
//
// Usage: node tools/contact-bridge-selftest.mjs
//
// The load-bearing property is freshness: the section text is a function that re-reads the bundle
// row's configuration on every prompt assembly, so a settings edit reaches the next agent with no
// listener and no staleness window. The second is safety: a settings read that fails, or a value that
// is absent, must leave the preset working rather than take it down.
import { readFileSync } from 'node:fs'
import * as contact from '../contact-bridge.js'
import { apply, contactLine, readContactAddress } from '../contact-bridge.js'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('prompt bridge self-test')

// --- the pure pieces ----------------------------------------------------------------------------

check(contactLine(undefined) === undefined, 'contactLine(undefined) has nothing to announce')
check(contactLine('   ') === undefined, 'a whitespace-only address has nothing to announce')
check(String(contactLine('a@b.c')).includes('a@b.c'), 'contactLine carries the address')
check(String(contactLine('a@b.c')).includes('mailto='), 'contactLine tells the agent how to use it')

const throwing = () => { throw new Error('settings unavailable') }
check(readContactAddress({ describe: throwing }) === '', 'a failing settings read yields an empty address, not a throw')
check(readContactAddress(undefined) === '', 'a missing settings service yields an empty address')
check(readContactAddress({ describe: () => [] }) === '', 'no entries yields an empty address')
check(
  readContactAddress({ describe: () => [{ ns: 'x', value: { other: 1 } }] }) === '',
  'an entry without mailto does not match',
)
check(
  readContactAddress({ describe: () => [{ ns: 'x', value: { mailto: ' a@b.c ' } }] }) === 'a@b.c',
  'a matching entry is trimmed',
)

// --- the registration and its freshness ---------------------------------------------------------

const sections = []
let described = [{ ns: 'include:autoresearch-bundle', value: { mailto: 'first@example.org' }, revision: 1 }]
const fake = {
  settings: { describe: () => described },
  systemPrompt: {
    section: (section) => {
      sections.push(section)
      return () => {}
    },
  },
}

apply(fake)

check(sections.length === 1, 'apply registers exactly one prompt section', `sections=${sections.length}`)
const section = sections[0] ?? {}
check(section.name === 'autoresearch-contact', 'section carries a stable name', String(section.name))
check(Number.isFinite(section.order), 'section carries a finite order (a non-finite one throws)', String(section.order))
check(typeof section.text === 'function', 'section text is a function, so it can be re-read', typeof section.text)

const textOf = () => String(section.text({}) ?? '')
check(textOf().includes('first@example.org'), 'the first assembly announces the configured address')

// The point of the function: change the stored value and the very next assembly reflects it.
described = [{ ns: 'include:autoresearch-bundle', value: { mailto: 'second@example.org' }, revision: 2 }]
check(textOf().includes('second@example.org'), 'a later assembly picks up a settings edit with no listener')
check(!textOf().includes('first@example.org'), 'the stale address is gone', textOf().slice(0, 60))

// And an unreadable configuration is announced as nothing rather than as an error.
described = []
check(textOf() === '', 'an unreadable configuration yields empty text, not a broken section', JSON.stringify(textOf()))

// --- the bundle row's Config contract -----------------------------------------------------------

const bundle = await import('../index.js')
const Config = bundle.Config
check(
  Config === undefined || typeof Config?.['~standard']?.validate === 'function',
  'the bundle row Config is a Standard Schema or undefined, never a look-alike object',
  typeof Config,
)
check(Config !== undefined, 'the schema resolves here (a missing one drops the settings form)')

// The settings layer projects ONLY fields whose nearest volatile ancestor is marked, and drops the
// whole entry - not just the field - when there is none: `volatileForm(schema)` returns undefined and
// `describe()` skips the entry without a word, so the panel shows nothing and even a write is refused
// with "has no volatile fields". Assert the shape that rule needs.
const hasVolatileField = (node) => {
  if (node?.meta?.volatile === true) return true
  if (node?.type !== 'object') return false
  return Object.values(node.dict ?? {}).some(hasVolatileField)
}
check(
  hasVolatileField(Config),
  'the Config carries a volatile field (without one the entry is invisible AND unwritable)',
)
const mailtoField = Config?.dict?.mailto
check(
  mailtoField?.meta?.volatile === true,
  'the contact field is marked volatile',
  `meta=${JSON.stringify(mailtoField?.meta ?? null)}`,
)
check(
  typeof mailtoField?.meta?.description === 'string' && mailtoField.meta.description.length > 40,
  'the contact field explains itself in the form',
)
check(typeof bundle.apply === 'function', 'the bundle row exports apply')

// --- the export and access contract ---------------------------------------------------------------
// A row whose `inject` is missing leaves its service accesses undeclared, and a row that hard-injects a
// service its mount does not provide never starts. Either one marks the WHOLE preset broken and hides
// it from the new-session roster, so both are asserted here rather than discovered from a badge.

check(
  typeof contact.apply === 'function' && Array.isArray(contact.inject) && contact.inject.every((s) => typeof s === 'string'),
  'the row exports apply and a string inject list',
  JSON.stringify(contact.inject),
)

const source = readFileSync(new URL('../contact-bridge.js', import.meta.url), 'utf8')
const declared = new Set(contact.inject ?? [])
// `settings` is read through ctx.get on purpose, so it appears without being injected.
const undeclared = [...new Set([...source.matchAll(/\bctx\??\.([a-zA-Z_][a-zA-Z0-9_]*)/g)].map((m) => m[1]))].filter(
  (name) => name !== 'get' && name !== 'settings' && !declared.has(name),
)
check(undeclared.length === 0, 'every ctx.<service> access is injected or read optionally', undeclared.join(', '))

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)