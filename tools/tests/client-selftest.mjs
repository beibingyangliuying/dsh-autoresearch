// Self-test for the bundle's browser half, runnable without DSH and without a browser.
//
// Usage: node tools/tests/client-selftest.mjs
//
// Why this file exists. The page loads client.js as an ordinary CLASSIC SCRIPT that registers itself
// with the module loader. The web shell awaits every client entry while booting and REFUSES TO MOUNT
// THE APPLICATION when one of them fails, so a single syntax error here takes down the whole GUI while
// the host stays perfectly healthy: the CLI still prints its URL, no host log complains, and the only
// description of the fault is in the browser console. That failure was shipped once (one stray closing
// brace from an edit that kept the line it was replacing), and this was the ONLY shipped module no
// test read - every other entry is imported by isolation-, contact-bridge- or skills-selftest, so a
// syntax error there already fails a test. This closes that hole for the browser half.
//
// The check is deliberately not `node --check`: this package is ESM, so Node would parse the file with
// ESM grammar, while the page parses it as a classic script. `vm.Script` is the grammar that actually
// runs. Executing it in a sandbox goes one step further than parsing: a module that parses but throws
// while registering also fails the boot audit.
import { readFileSync } from 'node:fs'
import { Script, createContext } from 'node:vm'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8')
const parse = (source, filename) => {
  try {
    new Script(source, { filename })
    return undefined
  } catch (error) {
    return error
  }
}

console.log('browser half self-test')

// --- the manifest the host scans ----------------------------------------------------------------
// The scanner reads `dsh.client` from package.json and then requires the "./client" export; a
// declaration without one throws while composing the boot graph, which fails the same boot audit.

const pkg = JSON.parse(read('../../package.json'))
const decl = pkg?.dsh?.client
check(decl?.platform === 'web', 'package.json declares a web client half', JSON.stringify(decl ?? null))
check(
  pkg?.exports?.['./client'] === './client.js',
  'the client half is exported at ./client (the scanner throws without it)',
  String(pkg?.exports?.['./client']),
)

// --- the parse the page performs ------------------------------------------------------------------

const clientSource = read('../../client.js')
const parseError = parse(clientSource, 'client.js')
check(
  parseError === undefined,
  'client.js parses as a classic script (a syntax error here blanks the whole GUI)',
  parseError === undefined ? '' : parseError.message,
)

// --- the registration it must perform --------------------------------------------------------------

const registrations = []
const sandbox = {
  console,
  window: { __ModuleLoader__: { load: (registration) => registrations.push(registration) } },
}
let loadError
if (parseError === undefined) {
  try {
    new Script(clientSource, { filename: 'client.js' }).runInContext(createContext(sandbox))
  } catch (error) {
    loadError = error
  }
}
check(
  parseError === undefined && loadError === undefined,
  'loading it registers without throwing',
  parseError !== undefined ? 'not reached: the parse failed' : loadError === undefined ? '' : String(loadError),
)
check(registrations.length === 1, 'it registers exactly one module', `count=${registrations.length}`)

const registration = registrations[0] ?? {}
check(
  registration.id === pkg.name,
  'it registers under the package name the host scans for (a mismatch fails the boot audit)',
  `${String(registration.id)} vs ${String(pkg.name)}`,
)
check(typeof registration.factory === 'function', 'the registration carries a factory', typeof registration.factory)

// The factory receives the page's module table. `react` is one of its seed words, so a factory that
// asks for it is resolvable; anything it asks for and cannot get would throw here.
const stubReact = {}
const requested = []
const face = typeof registration.factory === 'function'
  ? registration.factory((specifier) => {
    if (specifier === 'react') return stubReact
    requested.push(specifier)
    throw new Error(`the page's module table has no "${specifier}"`)
  })
  : undefined

check(requested.length === 0, 'the factory requests only seed words', requested.join(', '))
check(face !== null && typeof face === 'object', 'the factory answers a module face', typeof face)
// Both keys are load-bearing: `remote` is the namespace root and `remote.settings` its generated
// sub-namespace - declaring only the latter raises "cannot get property remote without inject" on
// first use, and both are exact service names, so nothing else may be shortened or dropped.
const inject = face?.inject ?? []
check(
  ['slots', 'remote', 'remote.settings'].every((name) => inject.includes(name)) && inject.length === 3,
  'the face injects exactly slots, remote and remote.settings',
  JSON.stringify(inject),
)
check(typeof face?.apply === 'function', 'the face exports apply', typeof face?.apply)

// --- what apply registers in the settings panel ----------------------------------------------------

const injections = []
const sections = []
const fakeCtx = {
  slots: {
    inject: (name, callback) => {
      injections.push(name)
      return callback()
    },
    register: (options, component) => {
      sections.push({ options, component })
      return () => {}
    },
  },
}
if (typeof face?.apply === 'function') face.apply(fakeCtx)

check(
  injections.length === 1 && injections[0] === 'settings.section',
  'apply injects into settings.section',
  JSON.stringify(injections),
)
check(sections.length === 1, 'apply registers exactly one section', `count=${sections.length}`)
const section = sections[0] ?? {}
check(section.options?.id === 'autoresearch', 'the section carries a stable id', String(section.options?.id))
check(section.options?.label === 'Autoresearch', 'the section carries its label', String(section.options?.label))
check(Number.isFinite(section.options?.order), 'the section carries a finite order', String(section.options?.order))
check(typeof section.component === 'function', 'the section carries a component', typeof section.component)

// --- the second executable artifact no test read --------------------------------------------------
// The in-app snippet is pasted into the reference manager's "Run JavaScript" window, which supplies
// the enclosing function. So its top-level `return` is legal THERE and illegal in a plain script -
// parsing it unwrapped would report a defect that does not exist. Wrap it the way its host does.

const snippet = read('../owner/zotero-link-snippet.js')
const snippetError = parse(`log = await (async function () {\n${snippet}\n})()`, 'zotero-link-snippet.js')
check(
  snippetError === undefined,
  'the in-app snippet parses inside the function wrapper its host supplies',
  snippetError === undefined ? '' : snippetError.message,
)

// --- can this test fail ---------------------------------------------------------------------------
// A guard that cannot report the defect it exists for reads as a pass forever. This one shipped
// once as a stray closing brace left behind by an edit, so prove the parse step rejects that shape.

const control = parse('const render = () => {\n  return h(\'div\', null)\n  }), \n}\n', 'negative-control.js')
check(
  control !== undefined,
  'the parse step rejects a stray closing brace, so this test can fail',
  String(control?.message ?? 'no error was raised'),
)

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
