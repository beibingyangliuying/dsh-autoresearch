// Unit self-test for the prompt bridge, runnable without DSH.
//
// Usage: node tools/tests/contact-bridge-selftest.mjs
//
// The load-bearing property is freshness: the section text is a function that re-reads the bundle
// row's configuration on every prompt assembly, so a settings edit reaches the next agent with no
// listener and no staleness window. The second is safety: a settings read that fails, or a value that
// is absent, must leave the preset working rather than take it down.
import { existsSync, readFileSync } from 'node:fs'
import * as contact from '../../contact-bridge.js'
import {
  apply,
  attachmentLine,
  contactLine,
  helpersLine,
  readAttachmentPolicy,
  readContactAddress,
  writeGateLine,
} from '../../contact-bridge.js'
import { cliToolsDir } from '../../preset-paths.js'

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
check(String(contactLine('a@b.c')).includes('--mailto'), 'contactLine tells the agent how to pass it')
check(
  !String(contactLine('a@b.c')).includes('&mailto='),
  'and no longer asks the agent to build the request itself, because the helper does that',
)

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

check(readAttachmentPolicy(undefined).auto === false, 'a missing settings service means the switch is off')
check(
  readAttachmentPolicy({ describe: throwing }).storePath === '',
  'a failing settings read yields an empty store path, not a throw',
)
check(
  readAttachmentPolicy({ describe: () => [{ ns: 'x', value: { other: 1 } }] }).auto === false,
  'an entry without the switch does not match',
)
const policy = readAttachmentPolicy({
  describe: () => [{ ns: 'x', value: { autoLinkAttachments: true, attachmentStorePath: ' D:\\Store ' } }],
})
check(policy.auto === true && policy.storePath === 'D:\\Store', 'a matching entry yields a trimmed policy')
check(
  readAttachmentPolicy({ describe: () => [{ ns: 'x', value: { autoLinkAttachments: 'true' } }] }).auto === false,
  'only a real boolean turns the switch on',
)

check(attachmentLine(undefined) === undefined, 'attachmentLine(undefined) has nothing to announce')
check(attachmentLine({ auto: false, storePath: 'D:\\Store' }) === undefined, 'a disabled switch announces nothing')
check(attachmentLine({ auto: true, storePath: '  ' }) === undefined, 'an enabled switch with no directory announces nothing')
check(
  String(attachmentLine({ auto: true, storePath: 'D:\\Store' })).includes('D:\\Store'),
  'an enabled switch announces where files go',
)
check(
  String(attachmentLine({ auto: true, storePath: 'D:\\Store' })).includes('zotero-link-attachments.mjs'),
  'the line names the tool that does the work',
)

// The command has to be runnable where the agent actually stands. A repo-relative `tools/...` path
// resolves to nothing in a study workspace, and a `<directory>` placeholder asks the agent to supply a
// value the prompt already carries - so both are asserted against, not just the tool's name.
const conversionLine = String(attachmentLine({ auto: true, storePath: 'D:\\Store' }))
check(
  conversionLine.includes(`${cliToolsDir}/zotero-link-attachments.mjs`),
  'the announced command carries the absolute helper path',
  cliToolsDir,
)
check(
  !/\bnode\s+["']?tools[\\/]/.test(conversionLine),
  'the announced command never uses a repo-relative tools/ path',
)
check(
  conversionLine.includes('--target "D:\\Store"'),
  'the announced command carries the configured directory rather than a placeholder',
)

// The helper directory is announced whether or not anything is configured: an agent working in a
// study workspace has no other way to find this preset's scripts.
check(String(helpersLine()).includes(cliToolsDir), 'the helper line names the absolute helper directory', cliToolsDir)
check(!String(helpersLine()).includes('\\'), 'the announced directory needs no escaping in a shell command')
check(/\/tools$/.test(cliToolsDir), 'the announced directory is the package tools directory', cliToolsDir)
check(
  existsSync(new URL('../zotero-write.mjs', import.meta.url)),
  'the announced directory really holds the helpers (a moved tools/ makes the line a lie)',
)

// The reference-library write gate: the write path ships with this preset's own helpers, so the
// isolation filter cannot hide it (contract §5), and the prompt carries the rule instead.
check(/gated by the owner/i.test(String(writeGateLine())), 'the write gate names the owner as the one who authorizes')
check(/once per library/i.test(String(writeGateLine())), "the write gate states the grant's granularity, which is the library")
check(/never\s+ask/i.test(String(writeGateLine())), 'the write gate forbids the agent asking for a standing grant')
check(/Say what you will write/i.test(String(writeGateLine())), 'the write gate requires the change to be stated first')
check(!/click Allow/i.test(String(writeGateLine())), 'the write gate does not steer the owner toward the single-write answer')

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

// The second value on the same section: announced only when it is actionable.
described = [
  {
    ns: 'include:autoresearch-bundle',
    value: { mailto: 'third@example.org', autoLinkAttachments: true, attachmentStorePath: 'D:\\Store' },
    revision: 3,
  },
]
check(textOf().includes('third@example.org'), 'the address rides along with the policy')
check(textOf().includes('D:\\Store'), 'an enabled policy announces its directory')

described = [
  {
    ns: 'include:autoresearch-bundle',
    value: { mailto: 'third@example.org', autoLinkAttachments: false, attachmentStorePath: 'D:\\Store' },
    revision: 4,
  },
]
check(!textOf().includes('D:\\Store'), 'a disabled switch announces no directory')
check(textOf().includes('third@example.org'), 'the address survives the switch being off')

// And an unreadable configuration is announced as nothing rather than as an error - except for the
// helper directory, which is not configuration and is therefore always stated.
described = []
check(
  textOf().includes(cliToolsDir),
  'the helper directory survives an unreadable configuration',
  JSON.stringify(textOf().slice(0, 60)),
)
check(!textOf().includes('@'), 'an unreadable configuration invents no contact address', JSON.stringify(textOf()))
check(!textOf().includes('--mailto'), 'an unreadable configuration announces no contact instruction')
check(
  textOf().includes('Always Allow'),
  'the write gate survives an unreadable configuration',
  JSON.stringify(textOf().slice(0, 60)),
)
check(
  !textOf().includes('zotero-link-attachments'),
  'an unreadable configuration announces no attachment policy',
  JSON.stringify(textOf()),
)

// --- the bundle row's Config contract -----------------------------------------------------------

const bundle = await import('../../index.js')
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
// Each new field needs the same three properties as the contact field, or it is invisible in the form.
for (const key of ['autoLinkAttachments', 'attachmentStorePath']) {
  const field = Config?.dict?.[key]
  check(field?.meta?.volatile === true, `${key} is marked volatile`, `meta=${JSON.stringify(field?.meta ?? null)}`)
  check(
    typeof field?.meta?.description === 'string' && field.meta.description.length > 40,
    `${key} explains itself in the form`,
  )
}
check(
  Config?.dict?.autoLinkAttachments?.type === 'boolean',
  'the switch is a boolean, so the page can render it as a checkbox',
  String(Config?.dict?.autoLinkAttachments?.type),
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

const source = readFileSync(new URL('../../contact-bridge.js', import.meta.url), 'utf8')
const declared = new Set(contact.inject ?? [])
// `settings` is read through ctx.get on purpose, so it appears without being injected.
const undeclared = [...new Set([...source.matchAll(/\bctx\??\.([a-zA-Z_][a-zA-Z0-9_]*)/g)].map((m) => m[1]))].filter(
  (name) => name !== 'get' && name !== 'settings' && !declared.has(name),
)
check(undeclared.length === 0, 'every ctx.<service> access is injected or read optionally', undeclared.join(', '))

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)