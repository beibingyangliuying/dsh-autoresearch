#!/usr/bin/env node
// Leave ONE explanation note per top-level method section on a record.
//
// IDENTITY IS A TAG, NOT A COMMENT
//
// This tool used to open every note with an invisible HTML comment naming its section. Measured on
// this library: when the Zotero application rewrites a note's body it keeps the content and drops the
// comment, so 153 of 378 live notes had lost their identity. A TAG is item metadata, outside the
// body: the application's note editor does not touch it, and `/retired` was measured to survive a real
// application rewrite. Identity therefore travels in `/section-<N>`:
//
//   /section-3       this note claims TOP-LEVEL section 3
//   /imported        this claim came from an imported/pasted note, so it may still be rewritten
//   /digest          this note is the record's paper-level digest, not a section note
//   /retired         out of service: not coverage, and the only note a delete may target
//   /replaces-<key>  this note replaced a retired note
//
// No dotted tag is written or read. A subsection-keyed note from an earlier round is `unknown` here
// and is merged into its top-level section or retired by a later round; nothing is folded silently.
//
// NO PROSE PARSING
//
// A note with no `/section-` tag is UNKNOWN: this tool does not guess from its first paragraph. The
// plan prints every note's first paragraph and names the unknown ones, and the discipline reads those
// before writing. The judgement is the reader's; this tool only refuses what an explicit tag says is
// already claimed. That is why the wide regex and the marker are both gone.
//
// NO AUTOMATIC REPAIR
//
// `--tidy` is deleted with its math-delimiter rules. Writing a note is the agent's work, and a tool
// that rewrote a formula because it looked like LaTeX was making a content decision while claiming to
// format one. A damaged note is rewritten (`--rewrite`, for an import) or retired and written again.
//
// Usage:
//   node tools/zotero-section-note.mjs --item <recordKey>                              # coverage plan
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html    # dry run
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html --write
//   node tools/zotero-section-note.mjs --claim --note <noteKey> --section 2             # dry run
//   node tools/zotero-section-note.mjs --claim --note <noteKey> --section 2 --write
//   node tools/zotero-section-note.mjs --rewrite --note <noteKey> --file n2.html        # dry run
//   node tools/zotero-section-note.mjs --rewrite --note <noteKey> --file n2.html --write
//   node tools/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>"        # dry run
//   node tools/zotero-section-note.mjs --retire --note <noteKey> --undo --write
//   node tools/zotero-section-note.mjs --delete --note <noteKey>                        # plan only
//
// This tool performs no deletion; `--delete` states the plan and the irreversibility facts, and the
// write path is not implemented in this round. Only a `/retired` note is a candidate.
//
// Exit codes: 0 applied, or nothing to do | 1 refused (already claimed, conflict, library error) |
// 2 usage, or a write path this round does not implement.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_NAME, childrenOf, createWriteGate, patchItem, readItem, visibleText } from './zotero-local-api.mjs'

/** The tag prefix that records which top-level section a note explains. */
export const SECTION_TAG_PREFIX = '/section-'

/** The tag that marks a claimed note as an import, which may still be rewritten in place. */
export const IMPORTED_TAG = '/imported'

/** The tag that marks a paper-level digest note. */
export const DIGEST_TAG = '/digest'

/** The tag that takes a note out of service. */
export const RETIRE_TAG = '/retired'

/** The tag that names the retired note a successor replaced. */
export const REPLACES_TAG_PREFIX = '/replaces-'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

const CHINESE_DIGITS = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }

/** A tag as it is compared: trimmed and lower-cased, because a tag is free text a person can edit. */
function lowered(tag) {
  return String(tag ?? '').trim().toLowerCase()
}

/**
 * A section ordinal as a comparable token, so "第三节" and "第3节" cannot both be written for one
 * section.
 *
 * @param {string|number} value The ordinal, in digits or Chinese numerals.
 * @returns {string} The ordinal as digits, or '' when there is no ordinal in the value.
 */
export function normalizeSectionToken(value) {
  const text = String(value ?? '')
    .trim()
    .replace(/^文?章?第/, '')
    .replace(/节$/, '')
    .trim()
  if (/^\d+(\.\d+)*$/.test(text)) return text
  const digits = /^(\d+)$/.exec(text)
  if (digits) return digits[1]
  const chinese = /^([一二三四五六七八九十]+)$/.exec(text)
  if (chinese) {
    const parts = chinese[1].split('')
    if (parts.length === 1) return String(CHINESE_DIGITS[parts[0]] ?? '')
    const tens = parts[0] === '十' ? 1 : (CHINESE_DIGITS[parts[0]] ?? 0)
    const ones = parts[parts.length - 1] === '十' ? 0 : (CHINESE_DIGITS[parts[parts.length - 1]] ?? 0)
    return String(tens * 10 + ones)
  }
  return ''
}

/**
 * A Roman numeral's value.
 *
 * The section-note write path no longer parses prose, but `zotero-pdf.mjs` reads the paper's own
 * table of contents, where `III. PROPOSED ...` is a real heading. This stays exported for that one
 * caller rather than duplicating a numeral parser.
 *
 * @param {string} text A Roman numeral.
 * @returns {number} Its value, or 0 when the text is not a well-formed numeral.
 */
export function romanToNumber(text) {
  const numeral = String(text ?? '').toUpperCase()
  if (numeral === '' || !/^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/.test(numeral)) return 0
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let total = 0
  for (let index = 0; index < numeral.length; index += 1) {
    const current = values[numeral[index]]
    const next = values[numeral[index + 1]] ?? 0
    total += current < next ? -current : current
  }
  return total
}

/**
 * The tag that records a top-level section claim.
 *
 * @param {string} token A normalized top-level ordinal.
 * @returns {string} The tag.
 */
export function sectionTag(token) {
  return `${SECTION_TAG_PREFIX}${token}`
}

/**
 * The ordinal a `/section-` tag carries, or '' when the tag is not a top-level claim.
 *
 * @param {string} tag One tag.
 * @returns {string} The ordinal, in digits.
 */
export function sectionTokenFromTag(tag) {
  const text = String(tag ?? '').trim()
  if (!lowered(text).startsWith(SECTION_TAG_PREFIX)) return ''
  const token = text.slice(SECTION_TAG_PREFIX.length)
  return /^\d+$/.test(token) ? token : ''
}

/**
 * What a note's tags claim, with the ambiguity made explicit.
 *
 * Two `/section-` tags on one note are not a claim this tool can count: the plan names the note and
 * the discipline fixes it. A dotted or empty tag is invalid and lands in `invalid`; it never becomes
 * a top-level claim.
 *
 * @param {string[]} tags The note's tags, bare text.
 * @returns {{token: string, ambiguous: boolean, tags: string[], invalid: string[]}} The claim.
 */
export function readSectionTag(tags) {
  const hits = (tags ?? [])
    .map((tag) => String(tag).trim())
    .filter((tag) => lowered(tag).startsWith(SECTION_TAG_PREFIX))
  const tokens = [...new Set(hits.map(sectionTokenFromTag).filter(Boolean))]
  const invalid = hits.filter((tag) => sectionTokenFromTag(tag) === '')
  if (tokens.length > 1) return { token: '', ambiguous: true, tags: hits, invalid }
  return { token: tokens[0] ?? '', ambiguous: false, tags: hits, invalid }
}

/**
 * Whether a note's tags retire it.
 *
 * Compared case-insensitively because a tag is free text a person can also edit by hand, and a
 * retirement that silently stops counting because someone typed `/Retired` is the failure this whole
 * mechanism exists to avoid.
 *
 * @param {string[]} tags The note's tags, bare text.
 * @returns {boolean} True when the note is a tombstone rather than coverage.
 */
export function isRetired(tags) {
  return (tags ?? []).some((tag) => lowered(tag) === RETIRE_TAG)
}

/**
 * Whether a note came from outside and may still be rewritten in place.
 *
 * @param {string[]} tags The note's tags, bare text.
 * @returns {boolean} True when the note carries `/imported`.
 */
export function isImported(tags) {
  return (tags ?? []).some((tag) => lowered(tag) === IMPORTED_TAG)
}

/**
 * Whether a note is a paper-level digest rather than a section note.
 *
 * @param {string[]} tags The note's tags, bare text.
 * @returns {boolean} True when the note carries `/digest`.
 */
export function isDigest(tags) {
  return (tags ?? []).some((tag) => lowered(tag) === DIGEST_TAG)
}

/**
 * The tag list a retirement leaves behind: every tag the note already had, plus or minus the mark.
 *
 * Idempotent in both directions, and it never drops a tag it did not put there - the owner's own tags
 * on their own note are not this tool's to tidy.
 *
 * @param {string[]} tags The note's current tags.
 * @param {{undo?: boolean}} [options] `undo` removes the mark instead of adding it.
 * @returns {string[]} The tags to send.
 */
export function retireTags(tags, { undo = false } = {}) {
  const kept = (tags ?? []).filter((tag) => !isRetired([tag]))
  return undo ? kept : [...kept, RETIRE_TAG]
}

/** The tag a note carries when it replaces `noteKey`. */
export function replacesTag(noteKey) {
  return `${REPLACES_TAG_PREFIX}${noteKey}`
}

/**
 * The note key a note's tags say it replaces.
 *
 * @param {string[]} tags A note's tags.
 * @returns {string} The retired note's key, or '' when this note names no predecessor.
 */
export function replacesKey(tags) {
  const hit = (tags ?? []).map((tag) => String(tag).trim()).find((tag) => lowered(tag).startsWith(REPLACES_TAG_PREFIX))
  return hit ? hit.slice(REPLACES_TAG_PREFIX.length) : ''
}

/**
 * The live note that says it replaced `noteKey`.
 *
 * @param {Array<{key: string, tags?: string[]}>} notes The record's child notes.
 * @param {string} noteKey The retired note's key.
 * @returns {string} The successor's key, or '' when nothing names one yet.
 */
export function successorOf(notes, noteKey) {
  return notes.find((note) => replacesKey(note.tags) === noteKey)?.key ?? ''
}

/**
 * The ordinal a NEW write may use, or a refusal.
 *
 * The unit this discipline writes is the TOP-LEVEL section. A dotted ordinal is refused with the
 * top-level one to pass instead; the note that already carries a dotted claim is `unknown` and is
 * merged or retired in a migration, never folded silently.
 *
 * @param {string|number} value The `--section` value.
 * @returns {string} The ordinal to write.
 * @throws {UsageError} When the value carries no ordinal, or carries a subsection's.
 */
export function sectionWriteToken(value) {
  const token = normalizeSectionToken(value)
  if (!token) throw new UsageError(`--section '${value}' carries no ordinal this tool can match`)
  if (token.includes('.')) {
    const parent = token.split('.')[0]
    throw new UsageError(
      `--section '${value}' names a subsection, and the unit this discipline writes is the TOP-LEVEL section: pass --section ${parent}. ` +
        `A note already keyed to §${token} is UNKNOWN to this tool and must be merged into §${parent} or retired.`,
    )
  }
  return token
}

/**
 * The note that already claims the section a write is for, and why.
 *
 * Only an explicit `/section-N` tag counts. A retired note is a tombstone and does not cover its
 * section; a digest is not a section note; an unknown note is read by the discipline rather than
 * guessed at here. There is no parent/child folding: dotted keys are not part of this model.
 *
 * @param {Array<{key: string, retired?: boolean, digest?: boolean, claim: {token: string}}>} notes The record's child notes.
 * @param {string} token The top-level section the write is for.
 * @returns {{note: object, why: string}|undefined} The covering note and the reason, if any.
 */
export function coveringNote(notes, token) {
  const covered = notes.filter((note) => note.claim.token && !note.retired && !note.digest)
  const same = covered.find((note) => note.claim.token === token)
  return same ? { note: same, why: `note ${same.key} claims §${token}` } : undefined
}

/**
 * The first block of prose in a note, as a reader sees it.
 *
 * This is DISPLAY, not a claim: the plan prints it so the reader can decide. "First block", not "first
 * N characters": {@link visibleText} collapses whitespace, so the collapsed text has no line to
 * measure a position against, and what makes a paragraph readable is which block it is.
 *
 * @param {string} noteHtml Note body.
 * @returns {string} The visible text of the first paragraph, heading or list item.
 */
export function firstBlockText(noteHtml) {
  const html = String(noteHtml ?? '')
  const block = /<(p|h[1-6]|li)\b[^>]*>([\s\S]*?)<\/\1>/i.exec(html)
  return block ? visibleText(block[2]) : visibleText(html).slice(0, 120)
}

/**
 * Whether the APPLICATION has normalized this note already.
 *
 * Measured: a note the application has written carries its own `<div data-schema-version="...">`
 * wrapper. The plan reports it as `app` rather than `API`; it is also why a read-back compares
 * visible text instead of bytes.
 *
 * @param {string} html Note body.
 * @returns {boolean} True when the body opens with the application's own wrapper.
 */
export function isApplicationWrapped(html) {
  return /^\s*<div data-schema-version="\d+">/.test(String(html ?? ''))
}

/** Whether the body is HTML, because the library stores note bodies as HTML and a Markdown guess
 * would silently change what is stored. */
export function looksLikeHtml(body) {
  return /<(p|div|h[1-6]|ul|ol|li|br|strong|em|code|pre|table|blockquote|hr)\b/i.test(String(body ?? ''))
}

/**
 * The note body a section note is created with.
 *
 * No marker is prepended: the claim is the `/section-N` tag now, and a comment in the body would be
 * eaten by the application while implying an identity the tool no longer reads.
 *
 * @param {string} body The explanation, as HTML.
 * @returns {string} The body to send.
 */
export function composeSectionNote(body) {
  return String(body ?? '').trim()
}

/** The write that creating a note is, so a plan can print it without doing it. */
export function createWriteLine(itemKey) {
  return `POST /api/users/0/items  [{itemType: note, parentItem: ${itemKey}, note: ..., tags: [...]}]`
}

/** Every child note of a record, with the claim its tags carry. */
async function noteChildren(itemKey) {
  const children = await childrenOf(itemKey)
  return children
    .filter((child) => child?.data?.itemType === 'note')
    .map((child) => {
      const tags = (child.data.tags ?? []).map((entry) => entry.tag)
      return {
        key: child.key,
        html: child.data.note ?? '',
        tags,
        retired: isRetired(tags),
        imported: isImported(tags),
        digest: isDigest(tags),
        claim: readSectionTag(tags),
      }
    })
}

/** Whether two tag lists carry the same set, compared case-insensitively. */
function sameTags(left, right) {
  const a = new Set((left ?? []).map(lowered))
  const b = new Set((right ?? []).map(lowered))
  return a.size === b.size && [...a].every((tag) => b.has(tag))
}

/** The live notes whose tags name more than one section, which must be fixed before a write. */
function ambiguousLive(notes) {
  return notes.filter((note) => note.claim.ambiguous && !note.retired)
}

/**
 * The coverage plan as one object.
 *
 * A round that has to hand the owner one list across several records needs the same facts in a shape
 * it can join on, because prose joined by hand is how each round ends up inventing its own list.
 *
 * @param {{record: object, attachment: object|undefined, notes: Array<object>}} input The record's state.
 * @returns {object} A JSON-serializable plan.
 */
export function planJson({ record, attachment, notes }) {
  const live = notes.filter((note) => note.claim.token && !note.retired && !note.digest)
  const retired = notes.filter((note) => note.retired)
  const digests = notes.filter((note) => note.digest && !note.retired)
  const unknown = notes.filter((note) => !note.retired && !note.digest && !note.claim.token && !note.claim.ambiguous)
  const ambiguous = notes.filter((note) => note.claim.ambiguous && !note.retired)
  const covered = new Map()
  for (const note of live) {
    const keys = covered.get(note.claim.token) ?? []
    keys.push(note.key)
    covered.set(note.claim.token, keys)
  }
  return {
    record: { key: record.key, itemType: record.itemType, title: record.title ?? '' },
    file: attachment ? { key: attachment.key, contentType: attachment.data?.contentType ?? '' } : null,
    notes: notes.map((note) => ({
      key: note.key,
      chars: note.html.length,
      origin: isApplicationWrapped(note.html) ? 'app' : 'API',
      tags: note.tags,
      retired: note.retired,
      imported: note.imported,
      digest: note.digest,
      section: note.claim.token,
      sectionTags: note.claim.tags,
      invalidSectionTags: note.claim.invalid,
      ambiguous: note.claim.ambiguous,
      replaces: replacesKey(note.tags),
    })),
    coverage: {
      live: [...covered.entries()].map(([section, keys]) => ({ section, notes: keys })),
      retired: retired.map((note) => ({ section: note.claim.token, note: note.key, successor: successorOf(notes, note.key) })),
      digest: digests.map((note) => ({ note: note.key })),
      unknown: unknown.map((note) => note.key),
      ambiguous: ambiguous.map((note) => note.key),
    },
    counts: {
      notes: notes.length,
      live: live.length,
      retired: retired.length,
      digest: digests.length,
      unknown: unknown.length,
      ambiguous: ambiguous.length,
    },
  }
}

/** The plan half of `--item …, no --section`: what this record covers, and what to go read. */
async function runPlan(itemKey, { json = false } = {}) {
  const record = await readItem(itemKey)
  if (record.itemType === 'note') throw new UsageError(`${itemKey} is itself a note; pass the record the note is about`)
  const children = await childrenOf(itemKey)
  const notes = await noteChildren(itemKey)
  const attachment = children.find(
    (child) =>
      child.data?.itemType === 'attachment' &&
      ['application/pdf', 'application/epub+zip', 'text/html'].includes(child.data?.contentType ?? ''),
  )
  if (json) {
    console.log(JSON.stringify(planJson({ record, attachment, notes }), null, 2))
    return
  }
  console.log(`record : ${itemKey}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(
    `file   : ${attachment ? `${attachment.key}  ${attachment.data.contentType}` : 'NO PDF/EPUB/HTML ATTACHMENT - nothing here can be read as text'}`,
  )
  console.log(`notes  : ${notes.length} child note(s)`)

  for (const note of notes) {
    const label = note.digest
      ? 'digest'
      : note.claim.token
        ? `§${note.claim.token}`
        : note.claim.ambiguous
          ? 'ambiguous'
          : 'unknown'
    const marks = [note.imported ? 'IMPORTED' : '', note.retired ? 'RETIRED' : ''].filter(Boolean).join(' ')
    console.log(
      `\n  ${note.key}  ${String(note.html.length).padStart(6)}c  ${isApplicationWrapped(note.html) ? 'app' : 'API'}  ${label}${marks ? `  ${marks}` : ''}`,
    )
    console.log(`      ${firstBlockText(note.html).slice(0, 96)}`)
    if (note.tags.length) console.log(`      tags: ${note.tags.join(' · ')}`)
  }

  const live = notes.filter((note) => note.claim.token && !note.retired && !note.digest)
  const retired = notes.filter((note) => note.retired)
  const digests = notes.filter((note) => note.digest && !note.retired)
  const unknown = notes.filter((note) => !note.retired && !note.digest && !note.claim.token && !note.claim.ambiguous)
  const ambiguous = notes.filter((note) => note.claim.ambiguous && !note.retired)
  const sections = [...new Set(live.map((note) => note.claim.token))]
  console.log(`\ncovered     : ${sections.length ? sections.map((token) => `§${token}`).join(' · ') : 'none'}`)
  console.log(
    `retired     : ${
      retired.length
        ? retired
            .map((note) => {
              const where = note.claim.token ? `§${note.claim.token}` : '(none)'
              const successor = successorOf(notes, note.key)
              return `${where} (${note.key}${successor ? ` -> superseded by ${successor}` : ' -> nothing names a replacement yet'})`
            })
            .join(' · ')
        : 'none'
    }`,
  )
  console.log(`digest      : ${digests.length ? digests.map((note) => note.key).join(' · ') : 'none'}`)
  console.log(`unknown     : ${unknown.length ? unknown.map((note) => note.key).join(' · ') : 'none'}`)
  console.log(`ambiguous   : ${ambiguous.length ? ambiguous.map((note) => note.key).join(' · ') : 'none'}`)
  console.log('\nNOTE: `covered` is what explicit /section-N tags claim, counted per TOP-LEVEL section.')
  console.log('`unknown` notes have no claim: read the first paragraph above (the whole note with')
  console.log('zotero-read.mjs --item <noteKey> when it is not enough), then --claim it, --rewrite it, or')
  console.log('--retire it. A note marked RETIRED is a tombstone: it is NOT coverage, and only a retired')
  console.log('note is deletable. A /digest note is the record\'s digest, not a section note.')
}

/** Create one section note, refusing when the section is already claimed. */
async function runCreate(options) {
  const body = options.file ? readFileSync(options.file, 'utf8') : options.text
  const composed = composeSectionNote(body)
  if (composed === '') throw new UsageError('the note body is empty')
  if (!looksLikeHtml(composed)) {
    throw new UsageError('the note body is not HTML; the library stores note bodies as HTML and a Markdown guess would silently change what is stored')
  }
  const token = sectionWriteToken(options.section)

  const record = await readItem(options.item)
  if (record.itemType === 'note') throw new UsageError(`${options.item} is itself a note; pass the record the note is about`)
  const notes = await noteChildren(options.item)
  const ambiguous = ambiguousLive(notes)
  if (ambiguous.length) {
    console.error(`\nREFUSED: ${ambiguous.map((note) => note.key).join(' · ')} carry more than one /section- tag.`)
    console.error('Fix the tags before writing: an ambiguous note is not coverage and cannot be counted.')
    process.exitCode = 1
    return
  }

  const replacedKey = String(options.replaces ?? '').trim()
  if (replacedKey) {
    const old = await readItem(replacedKey)
    if (old.itemType !== 'note') throw new UsageError(`--replaces ${replacedKey} is a ${old.itemType}, not a note`)
    const oldTags = (old.tags ?? []).map((entry) => entry.tag)
    if (!isRetired(oldTags)) {
      throw new UsageError(`--replaces ${replacedKey} is not retired, so it still covers its section. Retire it first: --retire --note ${replacedKey} --reason "<why>" --write`)
    }
    if (isDigest(oldTags)) throw new UsageError(`--replaces ${replacedKey} is a digest, not a section note`)
    const oldClaim = readSectionTag(oldTags)
    if (oldClaim.ambiguous) throw new UsageError(`--replaces ${replacedKey} carries more than one /section- tag; fix it first`)
    if (oldClaim.token && oldClaim.token !== token) {
      throw new UsageError(`--replaces ${replacedKey} explains §${oldClaim.token}, not §${token}: retiring one section's note does not free another's`)
    }
  }

  const covering = coveringNote(notes, token)
  const tags = [sectionTag(token), ...(replacedKey ? [replacesTag(replacedKey)] : [])]

  console.log(`record  : ${options.item}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(`section : §${token}`)
  console.log(`notes   : ${notes.length} child note(s); claimed: ${[...new Set(notes.filter((note) => note.claim.token).map((note) => `§${note.claim.token}`))].join(' · ') || 'none'}`)
  console.log(`body    : ${composed.length} characters; tags: ${tags.join(' · ')}`)
  if (options.title) console.log(`title   : "${options.title}" (attempted; the note is written without it if refused)`)
  if (replacedKey) console.log(`replaces: ${replacedKey} (tag ${replacesTag(replacedKey)}) - it is retired, so §${token} is free`)
  console.log(`write   : ${createWriteLine(options.item)}`)

  if (covering) {
    console.error(`\nREFUSED: §${token} is already covered - ${covering.why}.`)
    console.error('Nothing was written. Read that note: if it is NOT about this section, report both readings')
    console.error('and stop. Do not work around this refusal.')
    process.exitCode = 1
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()
  const payload = { itemType: 'note', parentItem: options.item, note: composed, tags: tags.map((tag) => ({ tag })) }
  const withTitle = options.title ? { ...payload, title: options.title } : payload
  let res = await gate.write('POST', '/api/users/0/items', [withTitle])
  if (res.status !== 200 && options.title) {
    console.log(`\nThe library refused the title (HTTP ${res.status}); writing the same note without it.`)
    res = await gate.write('POST', '/api/users/0/items', [payload])
  }
  if (res.status !== 200) {
    console.error(`\nThe library refused the write (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const saved = JSON.parse(res.text)
  const noteKey = saved.successful?.['0'] ?? saved.success?.['0']
  if (!noteKey) {
    console.error(`\nThe library reported no success: ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const back = await readItem(noteKey)
  const backTags = (back.tags ?? []).map((entry) => entry.tag)
  if (!visibleText(back.note ?? '').includes(visibleText(composed))) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back with the text that was sent.`)
    process.exitCode = 1
    return
  }
  if (readSectionTag(backTags).token !== token) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back carrying ${sectionTag(token)}.`)
    console.error(`Tags read back: ${backTags.length ? backTags.join(' · ') : '(none)'}`)
    process.exitCode = 1
    return
  }
  if (replacedKey && replacesKey(backTags) !== replacedKey) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back carrying ${replacesTag(replacedKey)}.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${noteKey} carries §${token} on ${options.item} (now ${back.note.length} characters, version ${back.version}).` + (replacedKey ? ` It replaces ${replacedKey}.` : ''))
}

/**
 * Claim an existing note for a top-level section.
 *
 * The body is never touched. A note with no `/section-` tag receives `/imported` as well, because it
 * came from outside this tool and remains an import that may be rewritten; an agent-created note
 * never carries that tag and is a record.
 */
async function runClaim(options) {
  const note = await readItem(options.note)
  if (note.itemType !== 'note') throw new UsageError(`${options.note} is a ${note.itemType}, not a note`)
  const token = sectionWriteToken(options.section)
  const tags = (note.tags ?? []).map((entry) => entry.tag)
  if (isRetired(tags)) throw new UsageError(`${options.note} is retired; run --retire --note ${options.note} --undo --write first`)
  if (isDigest(tags)) throw new UsageError(`${options.note} is a digest, not a section note; a digest is not claimed for a section`)
  if (!note.parentItem) throw new UsageError(`${options.note} has no parent item; a section note is a child of the record it explains`)
  const claim = readSectionTag(tags)
  if (claim.ambiguous) {
    console.error(`\nREFUSED: ${options.note} carries more than one /section- tag (${claim.tags.join(' · ')}).`)
    console.error('Fix the tags before claiming: an ambiguous note is not coverage.')
    process.exitCode = 1
    return
  }

  const notes = await noteChildren(note.parentItem)
  const ambiguous = ambiguousLive(notes.filter((entry) => entry.key !== options.note))
  if (ambiguous.length) {
    console.error(`\nREFUSED: ${ambiguous.map((entry) => entry.key).join(' · ')} carry more than one /section- tag.`)
    console.error('Fix those tags before claiming another note on this record.')
    process.exitCode = 1
    return
  }
  const covering = coveringNote(notes.filter((entry) => entry.key !== options.note), token)
  if (covering) {
    console.error(`\nREFUSED: §${token} is already claimed - ${covering.why}.`)
    console.error('Nothing was written. Read both notes: if the existing claim is wrong, retire it first;')
    console.error('if this note is about another section, claim that section instead.')
    process.exitCode = 1
    return
  }

  const addImported = claim.token === '' && !isImported(tags)
  const kept = tags.filter((tag) => !lowered(tag).startsWith(SECTION_TAG_PREFIX))
  const after = [...kept, sectionTag(token), ...(addImported || isImported(tags) ? [IMPORTED_TAG] : [])]
    .filter((tag, index, list) => list.findIndex((entry) => lowered(entry) === lowered(tag)) === index)
  const unchanged = claim.token === token && !addImported

  console.log(`note    : ${options.note}  parent ${note.parentItem}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token}` : 'none'}${claim.tags.length ? ` (tags ${claim.tags.join(' · ')})` : ''}  ->  §${token}`)
  console.log(`tags    : ${tags.length ? tags.join(' · ') : '(none)'}  ->  ${after.join(' · ')}`)
  console.log(`change  : ${unchanged ? 'nothing (already claimed)' : addImported ? 'claim + /imported' : 'claim'}   (the body is NOT touched)`)
  console.log(`write   : PATCH /api/users/0/items/${options.note}  [{tags: [...]}]`)

  if (unchanged) {
    console.log('\nnothing to do - the note already claims this section, and this tool writes no no-op.')
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()
  const result = await patchItem({ gate, key: options.note, patch: { tags: after.map((tag) => ({ tag })) }, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: note ${options.note} changed since this plan was read. Nothing was written.`)
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return
  }
  const backTags = (result.after.tags ?? []).map((entry) => entry.tag)
  if (readSectionTag(backTags).token !== token) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back carrying ${sectionTag(token)}.`)
    console.error(`Tags read back: ${backTags.length ? backTags.join(' · ') : '(none)'}`)
    process.exitCode = 1
    return
  }
  if (addImported && !isImported(backTags)) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back carrying ${IMPORTED_TAG}.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${options.note} claims §${token}${addImported ? ' and is marked /imported' : ''} (version ${result.after.version}).`)
}

/** Retire one note, or put its claim back. One note, one write, and the body is never touched. */
async function runRetire(options) {
  const note = await readItem(options.note)
  if (note.itemType !== 'note') throw new UsageError(`${options.note} is a ${note.itemType}, not a note`)
  const tags = (note.tags ?? []).map((entry) => entry.tag)
  const claim = readSectionTag(tags)
  const undo = options.undo === true
  const want = !undo
  const already = isRetired(tags)
  const after = retireTags(tags, { undo })

  console.log(`note    : ${options.note}  parent ${note.parentItem ?? '(none)'}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token}` : claim.ambiguous ? 'ambiguous tags' : 'none (not a section note)'}`)
  console.log(`tags    : ${tags.length ? tags.join(' · ') : '(none)'}  ->  ${after.join(' · ') || '(none)'}`)
  console.log(`change  : ${already ? 'retired' : 'live'} -> ${want ? 'retired' : 'live'}   (the body is NOT touched)`)
  if (options.reason) {
    console.log(`reason  : ${options.reason}`)
    console.log('          a tag cannot hold prose, so this reason is not stored on the note: write it into')
    console.log("          the note that replaces this one, and into the round's owner-action list.")
  }
  console.log(`write   : PATCH /api/users/0/items/${options.note}  [{tags: [...]}]`)

  if (already === want) {
    console.log(`\nnothing to do - the note is already ${already ? 'retired' : 'live'}, and this tool writes no no-op.`)
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()
  const result = await patchItem({ gate, key: options.note, patch: { tags: after.map((tag) => ({ tag })) }, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: note ${options.note} changed since this plan was read. Nothing was written.`)
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return
  }
  const back = (result.after.tags ?? []).map((entry) => entry.tag)
  if (isRetired(back) !== want) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back ${want ? 'retired' : 'live'}.`)
    console.error(`Tags read back: ${back.length ? back.join(' · ') : '(none)'} - the mark did not survive the write.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${options.note} is ${want ? 'retired' : 'live again'} (version ${result.after.version}).`)
  if (want && claim.token) console.log(`§${claim.token} is writable again; the note itself is untouched and --undo puts the claim back.`)
  else if (want) console.log('It covered no section; it is now a tombstone and may be deleted.')
  else if (claim.token) console.log(`§${claim.token} is covered by it again; the note itself was never changed.`)
  else console.log('It is live again and covers no section.')
}

/**
 * Rewrite a note's body in place.
 *
 * Only an import may be rewritten: a note with no `/section-` tag, or a `/section-N` + `/imported`
 * note. A `/section-N` note without `/imported` is a record; changing its prose is a retirement and a
 * new note. The old body is backed up under `.section-notes/` before the write, because this library's
 * API cannot put an item in the trash.
 */
async function runRewrite(options) {
  const body = options.file ? readFileSync(options.file, 'utf8') : options.text
  const composed = composeSectionNote(body)
  if (composed === '') throw new UsageError('the note body is empty')
  if (!looksLikeHtml(composed)) {
    throw new UsageError('the note body is not HTML; the library stores note bodies as HTML and a Markdown guess would silently change what is stored')
  }
  const note = await readItem(options.note)
  if (note.itemType !== 'note') throw new UsageError(`${options.note} is a ${note.itemType}, not a note`)
  const tags = (note.tags ?? []).map((entry) => entry.tag)
  const claim = readSectionTag(tags)
  if (isRetired(tags)) throw new UsageError(`${options.note} is retired; a tombstone is not rewritten`)
  if (claim.ambiguous) throw new UsageError(`${options.note} carries more than one /section- tag; fix it before rewriting`)
  if (claim.token && !isImported(tags)) {
    throw new UsageError(
      `${options.note} is a §${claim.token} record without ${IMPORTED_TAG}: a record's prose is not rewritten in place. Retire it and write the replacement, or claim an import.`,
    )
  }

  const token = options.section ? sectionWriteToken(options.section) : ''
  let after = tags
  let addImported = false
  if (token) {
    if (!note.parentItem) throw new UsageError(`${options.note} has no parent item; a section note is a child of the record it explains`)
    const notes = await noteChildren(note.parentItem)
    const covering = coveringNote(notes.filter((entry) => entry.key !== options.note), token)
    if (covering) {
      console.error(`\nREFUSED: §${token} is already claimed - ${covering.why}.`)
      process.exitCode = 1
      return
    }
    addImported = claim.token === ''
    after = [...tags.filter((tag) => !lowered(tag).startsWith(SECTION_TAG_PREFIX)), sectionTag(token)]
    if (addImported || isImported(tags)) after.push(IMPORTED_TAG)
    after = after.filter((tag, index, list) => list.findIndex((entry) => lowered(entry) === lowered(tag)) === index)
  }

  const backup = join(process.cwd(), '.section-notes', note.parentItem ?? 'standalone', `rewritten-${options.note}-${new Date().toISOString().replace(/[:.]/g, '-')}.html`)
  console.log(`note    : ${options.note}  parent ${note.parentItem ?? '(none)'}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token}` : 'none'}${isImported(tags) ? ' (imported)' : ''}`)
  console.log(`size    : ${String(note.note ?? '').length} -> ${composed.length} characters`)
  console.log(`old     : ${firstBlockText(note.note ?? '').slice(0, 96)}`)
  console.log(`new     : ${firstBlockText(composed).slice(0, 96)}`)
  if (token || !sameTags(after, tags)) console.log(`tags    : ${tags.length ? tags.join(' · ') : '(none)'}  ->  ${after.join(' · ')}`)
  console.log(`backup  : ${backup}`)
  console.log(`write   : PATCH /api/users/0/items/${options.note}  [{note: ...${token ? ', tags: [...]' : ''}}]`)

  if (sameTags(after, tags) && visibleText(note.note ?? '') === visibleText(composed)) {
    console.log('\nnothing to do - the body already reads the same and the tags would not change.')
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return
  }

  try {
    mkdirSync(dirname(backup), { recursive: true })
    writeFileSync(backup, note.note ?? '', 'utf8')
  } catch (error) {
    console.error(`\nREFUSED: could not write the backup ${backup}: ${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
    return
  }
  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()
  const patch = { note: composed }
  if (token) patch.tags = after.map((tag) => ({ tag }))
  const result = await patchItem({ gate, key: options.note, patch, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: note ${options.note} changed since this plan was read. Nothing was written; the backup is at ${backup}.`)
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return
  }
  const afterText = visibleText(result.after.note ?? '')
  if (afterText !== visibleText(composed)) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back with the text that was sent.`)
    console.error(`The old body is at ${backup}.`)
    process.exitCode = 1
    return
  }
  const backTags = (result.after.tags ?? []).map((entry) => entry.tag)
  if (token && readSectionTag(backTags).token !== token) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back carrying ${sectionTag(token)}.`)
    process.exitCode = 1
    return
  }
  if (token && addImported && !isImported(backTags)) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back carrying ${IMPORTED_TAG}.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${options.note} rewritten (now ${result.after.note.length} characters, version ${result.after.version}).`)
  console.log(`The old body is at ${backup}.`)
}

/** Plan a deletion of a retired note. This round does not perform one. */
async function runDelete(options) {
  const note = await readItem(options.note)
  if (note.itemType !== 'note') throw new UsageError(`${options.note} is a ${note.itemType}, not a note`)
  const tags = (note.tags ?? []).map((entry) => entry.tag)
  const claim = readSectionTag(tags)
  if (!isRetired(tags)) {
    console.error(`\nREFUSED: ${options.note} does not carry ${RETIRE_TAG}. Only a retired note may be deleted.`)
    console.error(`Retire it first: --retire --note ${options.note} --reason "<why>" --write`)
    process.exitCode = 1
    return
  }
  const notes = note.parentItem ? await noteChildren(note.parentItem) : []
  const successor = successorOf(notes, options.note)
  const digest = isDigest(tags)

  console.log(`note    : ${options.note}  parent ${note.parentItem ?? '(none)'}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token}` : 'none (not a section note)'}`)
  console.log(`tags    : ${tags.length ? tags.join(' · ') : '(none)'}`)
  console.log(`size    : ${String(note.note ?? '').length} characters`)
  console.log(`body    : ${firstBlockText(note.note ?? '').slice(0, 96)}`)
  console.log(`successor: ${successor ? `${successor} names itself this note's replacement` : 'nothing names a replacement yet'}`)
  if (digest) console.log('DIGEST  : this note is a /digest; deleting it removes the record of what was read.')
  if (!successor) console.log('WARNING : nothing names a replacement; deleting removes the last record of what this note said.')
  console.log(`write   : DELETE /api/users/0/items/${options.note}`)
  console.log('\nThis channel cannot put an item in the trash: DELETE is permanent, the record answers 404')
  console.log('afterwards, and the trash neither grows nor keeps the key. The body cannot be recovered.')
  if (options.write) {
    console.error('\nREFUSED: the write path is not implemented; this round only plans a deletion.')
    process.exitCode = 2
    return
  }
  console.log('\nDRY RUN - nothing was written. Deletion is not implemented in this round.')
}

const USAGE =
  'usage: node tools/zotero-section-note.mjs --item <recordKey> [--plan] [--json]\n' +
  '       node tools/zotero-section-note.mjs --item <recordKey> --section <ordinal> (--text "<html>" | --file <path>)\n' +
  '                                       [--title "<title>"] [--replaces <retiredNoteKey>] [--write]\n' +
  '       node tools/zotero-section-note.mjs --claim --note <noteKey> --section <ordinal> [--write]\n' +
  '       node tools/zotero-section-note.mjs --rewrite --note <noteKey> (--text "<html>" | --file <path>) [--section <ordinal>] [--write]\n' +
  '       node tools/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>" [--write]\n' +
  '       node tools/zotero-section-note.mjs --retire --note <noteKey> --undo [--write]\n' +
  '       node tools/zotero-section-note.mjs --delete --note <noteKey>\n' +
  '       Identity is a tag: /section-N claims a top-level section, /imported marks an import that may\n' +
  '       still be rewritten, /digest marks the paper-level digest, /retired takes a note out of service.\n' +
  '       No invisible marker is written or read, and no prose is parsed: a note with no /section- tag\n' +
  '       is UNKNOWN and is read before anything is written. --tidy does not exist; a damaged body is\n' +
  '       rewritten by the agent or retired and written again. --delete is a plan only in this round.'

function parseArgs(argv) {
  const options = {
    item: '', note: '', section: '', text: '', file: '', title: '', reason: '', replaces: '',
    claim: false, rewrite: false, delete: false, retire: false, undo: false,
    plan: false, json: false, write: false,
  }
  const valued = new Set(['--item', '--note', '--section', '--text', '--file', '--title', '--reason', '--replaces'])
  const switches = new Set(['--claim', '--rewrite', '--delete', '--retire', '--undo', '--plan', '--json', '--write'])
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (switches.has(flag)) {
      options[flag.slice(2)] = true
      continue
    }
    if (!valued.has(flag)) throw new UsageError(`unrecognised argument '${flag}'`)
    const next = argv[index + 1]
    if (next === undefined) throw new UsageError(`${flag} needs a value`)
    options[flag.slice(2)] = next
    index += 1
  }

  const modes = ['claim', 'rewrite', 'delete', 'retire'].filter((mode) => options[mode])
  if (modes.length > 1) throw new UsageError('pass at most one of --claim, --rewrite, --delete, --retire')
  if (options.undo && !options.retire) throw new UsageError('--undo belongs to --retire')
  if (options.reason && !options.retire) throw new UsageError('--reason belongs to --retire')
  if (options.title && !options.section) throw new UsageError('--title belongs to a --section create')
  if (options.replaces && !options.section) throw new UsageError('--replaces goes with the --section it replaces')
  if (options.json && (modes.length || options.section || options.text || options.file || options.title || options.replaces || options.note)) {
    throw new UsageError('--json prints the coverage plan; it goes with --item and nothing else')
  }

  if (options.claim) {
    if (!options.note) throw new UsageError('--claim takes --note <noteKey>')
    if (!options.section) throw new UsageError('--claim takes --section <ordinal>')
    if (options.item || options.text || options.file || options.title || options.reason || options.replaces || options.plan) {
      throw new UsageError('--claim changes one note and nothing else; drop the other arguments')
    }
    return options
  }
  if (options.rewrite) {
    if (!options.note) throw new UsageError('--rewrite takes --note <noteKey>')
    if (Boolean(options.text) === Boolean(options.file)) throw new UsageError('pass --text or --file, not both')
    if (options.item || options.title || options.reason || options.replaces || options.plan) {
      throw new UsageError('--rewrite changes one note and nothing else; drop the other arguments')
    }
    return options
  }
  if (options.delete) {
    if (!options.note) throw new UsageError('--delete takes --note <noteKey>')
    if (options.item || options.section || options.text || options.file || options.title || options.reason || options.replaces || options.plan) {
      throw new UsageError('--delete takes one note and nothing else; drop the other arguments')
    }
    return options
  }
  if (options.retire) {
    if (!options.note) throw new UsageError('--retire takes --note <noteKey>')
    if (!options.undo && String(options.reason).trim() === '') {
      throw new UsageError('--retire needs --reason "<why>": the reason is the record of the change, and this tool stores no prose on the note')
    }
    if (options.item || options.section || options.text || options.file || options.title || options.replaces || options.plan) {
      throw new UsageError('--retire changes one note and nothing else; drop the other arguments')
    }
    return options
  }
  if (options.plan) {
    if (!options.item) throw new UsageError('--plan takes --item <recordKey>')
    if (options.section || options.text || options.file || options.title || options.replaces || options.note || options.write) {
      throw new UsageError('--plan prints a record; it does not take a body or a write')
    }
    return options
  }
  if (options.section) {
    if (!options.item) throw new UsageError('a --section write takes --item <recordKey>')
    if (Boolean(options.text) === Boolean(options.file)) throw new UsageError('pass --text or --file, not both')
    return options
  }
  if (options.note) throw new UsageError('--note belongs to --claim, --rewrite, --delete or --retire')
  if (!options.item) throw new UsageError('pass --item <recordKey>, or one of --claim/--rewrite/--delete/--retire')
  if (options.write) throw new UsageError('--write belongs to --section or one of the note modes')
  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.claim) {
    await runClaim(options)
    return
  }
  if (options.rewrite) {
    await runRewrite(options)
    return
  }
  if (options.delete) {
    await runDelete(options)
    return
  }
  if (options.retire) {
    await runRetire(options)
    return
  }
  if (options.plan || options.json || !options.section) {
    await runPlan(options.item, { json: options.json })
    return
  }
  await runCreate(options)
}

const isEntryPoint = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  main().catch((error) => {
    if (error instanceof UsageError) {
      console.error(`${error.message}\n${USAGE}`)
      process.exit(2)
    }
    console.error(`\nERROR: ${error instanceof Error ? error.message : String(error)}`)
    process.exit(1)
  })
}
