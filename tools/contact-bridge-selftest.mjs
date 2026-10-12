// Unit self-test for the preset's configurable-values bridge, runnable without DSH.
//
// Usage: node tools/contact-bridge-selftest.mjs
//
// It drives `apply()` with a fake prompt registry and asserts what gets registered. The point of the
// row is that an unconfigured preset behaves exactly as before, so "registers nothing when empty" is
// the load-bearing check.
import { apply, contactLine, Config } from '../contact-bridge.js'

const sections = []
const fake = {
  systemPrompt: {
    section: (section) => {
      sections.push(section)
      return () => {}
    },
  },
}

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

const textOf = (section) => (typeof section.text === 'function' ? section.text({}) : section.text)

console.log('contact bridge self-test')

check(contactLine(undefined) === undefined, 'contactLine(undefined) has nothing to announce')
check(contactLine('   ') === undefined, 'a whitespace-only address has nothing to announce')

apply(fake, {})
check(sections.length === 0, 'no config: registers nothing (the preset is unchanged)', `sections=${sections.length}`)

apply(fake, { mailto: '   ' })
check(sections.length === 0, 'blank config: registers nothing', `sections=${sections.length}`)

apply(fake, { mailto: 'someone@example.org' })
check(sections.length === 1, 'configured: registers exactly one section', `sections=${sections.length}`)

const section = sections[0] ?? {}
check(section.name === 'autoresearch-contact', 'section carries a stable name', String(section.name))
check(Number.isFinite(section.order), 'section carries a finite order (a non-finite one throws)', String(section.order))

const text = String(textOf(section) ?? '')
check(text.includes('someone@example.org'), 'section text announces the configured address')
check(text.includes('mailto='), 'section text tells the agent how to use it')

// The address must never be invented when nothing is configured.
check(!String(textOf({ text: contactLine(undefined) ?? '' })).includes('@'), 'no address appears when none is set')

// The loader validates whatever `Config` holds. Exporting a look-alike object (which is what a missing
// schema used to fall back to) fails the mount and marks the WHOLE preset broken, so that contract is
// checked here rather than discovered from a red badge in the settings page.
check(
  Config === undefined || typeof Config?.['~standard']?.validate === 'function',
  'Config is a schema (Standard Schema) or undefined, never a look-alike object',
  typeof Config,
)
check(Config !== undefined, 'the schema resolves in this environment (a missing one drops the settings form)')
console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
