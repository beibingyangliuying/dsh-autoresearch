// Unit self-test for the shared local-API module, runnable without a library.
//
// Usage: node tools/zotero-local-api-selftest.mjs
//
// This module is the one place every reference-library tool goes through, so its two contracts are
// worth pinning here rather than from a caller:
//
//   * WHICH STATUSES MEAN "ACCEPTED". A `PATCH` answers 204 when it succeeds, and the first real write
//     this preset ever made was reported as a refusal because only 200 counted - a write tool saying
//     the library refused a change it had already applied.
//   * THAT A WRITE CANNOT HAPPEN WITHOUT AN OPENED GATE. The server id comes from `open()`, and a
//     write carrying no server id is malformed. The guard fires before any request, which is what
//     makes this testable without a reference manager running.
import { createWriteGate, isWriteAccepted } from './zotero-local-api.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  -> ${detail}` : ''}`)
  if (!condition) failures += 1
}

console.log('local API module self-test')

console.log('\n[1] any 2xx is an accepted write')

check(isWriteAccepted(200), '200 with a body is accepted')
check(isWriteAccepted(204), '204 with NO body is accepted - this is what a successful PATCH answers')
check(isWriteAccepted(201), 'any other 2xx is accepted too')
check(!isWriteAccepted(199), 'below 200 is not')
check(!isWriteAccepted(300), '300 is not')
check(!isWriteAccepted(401), '401 is not: the key was rejected')
check(!isWriteAccepted(412), '412 is not: the version precondition failed')
check(!isWriteAccepted(429), '429 is not: too many dialogs')
check(!isWriteAccepted(500), '500 is not')

console.log('\n[2] a write cannot happen without an opened gate')

const gate = createWriteGate({ appName: 'self-test' })
let refused = ''
try {
  await gate.write('PATCH', '/api/users/0/items/AAAAAAA', { title: 'x' })
} catch (error) {
  refused = error.message
}
check(/not opened/.test(refused), 'writing before open() is refused, and says why', refused)
check(refused !== '', 'and it refuses rather than attempting a request without the server id')

const unauthorized = createWriteGate({ appName: 'self-test' })
let second = ''
try {
  await unauthorized.write('DELETE', '/api/users/0/items/AAAAAAA')
} catch (error) {
  second = error.message
}
check(/not opened/.test(second), 'the guard covers every method, not only PATCH')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
