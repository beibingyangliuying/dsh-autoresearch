#!/usr/bin/env node
// Leave ONE explanation note per method section on a record, and repair the math delimiters of the
// section notes a record already carries.
//
// WHY THIS FILE EXISTS
//
// The literature discipline's digest is a single note per record: `zotero-note.mjs` appends to the one
// note carrying its marker and never touches another. What a reading of the METHOD sections produces
// is the opposite shape - one note per section, each standing on its own so a later round can find,
// and revise, a single section without rewriting the rest. That is a different write, and giving the
// digest tool a second personality would have made "which note is ours" ambiguous.
//
// The two modes are deliberately one file, because they are the same object: a section note.
//
//   create   a NEW note for one section. Refused when that section is already covered - including by
//            a note this tool did not write. Existing notes in this library carry no marker, so
//            coverage is also read from the note's own opening phrase ("文章第2节标题是 ...").
//   tidy     a MECHANICAL repair of the math delimiters in one existing section note: the "<em>" that
//            a Markdown underscore became, and "[ ... ]" / "( ... )" restored to "$$ ... $$" / "$...$".
//            Display math also ends up on lines of its own ("$$\nx\n$$"), which is the shape the notes
//            are read and edited in - and that rule is idempotent, so a note already in that shape is
//            left byte-for-byte alone. It never rewrites prose, never guesses, and reports every span
//            it refused to touch.
//
// A title is attempted, not required: measured on this library, a `title` field on a note is refused
// with HTTP 500 (while a `tags` patch on the same note answers 204), so the create path tries the
// title and writes the same note without it if the library says no. A refused POST created nothing.
//
// WHAT "TIDY" WILL NOT DO, AND WHY THAT IS THE POINT
//
// A tidy is content-preserving by construction: a span is converted only when it carries LaTeX markup
// (`\command` or a braced sub/superscript) and only when it is one closed span inside a single text
// node. Anything else - a bracket split across paragraphs, a parenthesised prose aside, a bare
// variable - is left exactly as it was and listed as "left alone". A repair that guesses at what a
// broken formula meant is a rewrite wearing a formatter's clothes.
//
// Usage:
//   node tools/zotero-section-note.mjs --item <recordKey>                              # coverage plan
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html    # dry run
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html --write
//   node tools/zotero-section-note.mjs --tidy --note <noteKey>                          # dry run
//   node tools/zotero-section-note.mjs --item <recordKey> --tidy --write                # all its sections
//
// Exit codes: 0 applied, or nothing to do | 1 refused (already covered, conflict, library error) | 2 usage.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_NAME, childrenOf, createWriteGate, patchItem, readItem } from './zotero-local-api.mjs'

/** The marker that identifies a section note this tool wrote. Invisible in the application's view. */
export const SECTION_MARKER_PREFIX = '<!-- autoresearch-section:'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

const CHINESE_DIGITS = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }

/**
 * Strip HTML tags so a note's prose can be examined.
 *
 * @param {string} html Note body as the library stores it.
 * @returns {string} The text with tags removed and whitespace collapsed.
 */
export function stripTags(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * A section ordinal as a comparable token, so "第三节" and "第3节" cannot both be written for one
 * section, and so a note read back from the library matches the ordinal it was asked for.
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
  // A dotted ordinal is a section's own number carried down to its subsections (3.1, 2.1.3), which a
  // section whose method content exceeds the note budget is split by. It is matched exactly as written
  // because it comes from the paper, not from this tool.
  if (/^\d+(\.\d+)*$/.test(text)) return text
  const digits = /^(\d+)$/.exec(text)
  if (digits) return digits[1]
  const chinese = /^([一二三四五六七八九十]+)$/.exec(text)
  if (chinese) {
    const parts = chinese[1].split('')
    if (parts.length === 1) return String(CHINESE_DIGITS[parts[0]] ?? '')
    // 十 / 十一 / 二十 - enough for a paper's section count.
    const tens = parts[0] === '十' ? 1 : (CHINESE_DIGITS[parts[0]] ?? 0)
    const ones = parts[parts.length - 1] === '十' ? 0 : (CHINESE_DIGITS[parts[parts.length - 1]] ?? 0)
    return String(tens * 10 + ones)
  }
  return ''
}

/**
 * The marker line a section note opens with.
 *
 * @param {string} token A normalized ordinal, e.g. `2`.
 * @returns {string} The HTML comment.
 */
export function sectionMarker(token) {
  return `${SECTION_MARKER_PREFIX} ${token} -->`
}

/**
 * Which section a note claims, from the tool's own marker.
 *
 * @param {string} noteHtml Note body.
 * @returns {string} The ordinal, or '' when the note carries no marker.
 */
export function readSectionMarker(noteHtml) {
  const match = new RegExp(`${SECTION_MARKER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d+)\\s*-->`).exec(
    String(noteHtml ?? ''),
  )
  return match ? match[1] : ''
}

/**
 * Which section a note claims, read from its opening phrase.
 *
 * The notes already in this library were written before this tool existed and carry no marker, so
 * coverage has to be readable from what they say: "文章第2节标题是 ...", "第三节题为 ...",
 * "第二节标题是 ...". Only the opening is examined - a section number mentioned later in the prose is
 * a cross-reference, not a claim about which section this note is.
 *
 * @param {string} noteHtml Note body.
 * @returns {string} The ordinal, or '' when the opening names none.
 */
export function readSectionFromOpening(noteHtml) {
  const opening = stripTags(noteHtml).slice(0, 120)
  const match = /^文?章?第\s*(\d+(?:\.\d+)*|[一二三四五六七八九十]+)\s*节/.exec(opening)
  return match ? normalizeSectionToken(match[1]) : ''
}

/**
 * Which section a note is a note ABOUT, however that is recorded.
 *
 * @param {string} noteHtml Note body.
 * @returns {{token: string, by: 'marker'|'opening'|'none'}} The claim and how it was read.
 */
export function sectionClaim(noteHtml) {
  const marked = readSectionMarker(noteHtml)
  if (marked) return { token: marked, by: 'marker' }
  const opening = readSectionFromOpening(noteHtml)
  if (opening) return { token: opening, by: 'opening' }
  return { token: '', by: 'none' }
}

/** Whether a span carries a LaTeX command or a braced sub/superscript - enough to make it math. */
function containsLatex(text) {
  return /\\[a-zA-Z]+|[_^]\{/.test(text)
}

/** The looser test: a bare `_`/`^` with an operand is math too, while a lone letter is not. */
function containsMathMarkup(text) {
  return containsLatex(text) || /[_^]\*|[_^][A-Za-z0-9]/.test(text)
}

/**
 * The regions already delimited as display math, so the inline pass never nests `$` inside `$$`.
 *
 * @param {string} text One text node.
 * @returns {Array<{start: number, end: number}>} Half-open offsets of each `$$...$$` region.
 */
export function displayMathRegions(text) {
  const marks = []
  let at = text.indexOf('$$')
  while (at !== -1) {
    marks.push(at)
    at = text.indexOf('$$', at + 2)
  }
  const regions = []
  for (let index = 0; index + 1 < marks.length; index += 2) {
    regions.push({ start: marks[index], end: marks[index + 1] + 2 })
  }
  return regions
}

/** Whether the body is HTML, because the library stores note bodies as HTML and a Markdown guess
 * would silently change what is stored. */
export function looksLikeHtml(body) {
  return /<(p|div|h[1-6]|ul|ol|li|br|strong|em|code|pre|table|blockquote|hr)\b/i.test(String(body ?? ''))
}

/** Text nodes of an HTML string, with the tags left in place. */
function textSegments(html) {
  return String(html ?? '').split(/(<[^>]*>)/)
}

/**
 * Every closed `[open]` … `[close]` span at nesting depth zero, in order.
 *
 * @param {string} text One text node.
 * @returns {Array<{start: number, end: number, inner: string}>} Half-open offsets and the inner text.
 */
export function topLevelSpans(text, open, close) {
  const spans = []
  const stack = []
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === open) stack.push(index)
    else if (char === close && stack.length > 0) {
      const start = stack.pop()
      if (stack.length === 0) spans.push({ start, end: index + 1, inner: text.slice(start + 1, index) })
    }
  }
  return spans
}

/**
 * The mechanical math repair: `$`/`$$` where the copy left plain brackets, and the underscore that
 * Markdown turned into `<em>`.
 *
 * Content-preserving by construction. A span is converted only when it carries LaTeX markup and is
 * one closed span inside a single text node; a span inside one that already reads as display math is
 * skipped, because `$` inside `$$` is not valid MathJax; and everything else is reported as left
 * alone rather than guessed at.
 *
 * @param {string} html Note body as the library stores it.
 * @param {{lineBreaks?: boolean}} [options] `lineBreaks: false` skips the block-form rule, for a note
 *   whose body the application will store back on one line whatever this tool sends.
 * @returns {{html: string, applied: Array<{rule: string, count: number}>, changed: string[],
 *   skipped: number, leftAlone: string[]}} The repaired body, what was applied, the spans that were
 *   converted (so a reader can eyeball the heuristic), how many candidates were declined, and the
 *   declined spans worth naming.
 */
export function normalizeMath(html, { lineBreaks = true } = {}) {
  const applied = new Map()
  const leftAlone = []
  const bump = (rule, count = 1) => applied.set(rule, (applied.get(rule) ?? 0) + count)
  // Every span that was a candidate and was NOT converted, whether or not it is worth reporting:
  // "nothing to do" and "a span I declined" must not look the same.
  let skipped = 0

  // Rule 1 - "<em>x</em>" is a Markdown underscore that got rendered: the copy lost the "_" of
  // "B'_{ij}" and kept the emphasis tag. Only inside something that reads as math.
  let current = String(html ?? '').replace(/<em>([^<]*)<\/em>/g, (whole, inner) => {
    if (!containsLatex(inner)) return whole
    bump('underscore-as-emphasis')
    return `_${inner}_`
  })

  // Rule 2/3 - brackets and parentheses, per text node, never across a tag boundary.
  const changed = []
  current = textSegments(current)
    .map((segment, index) => {
      if (index % 2 === 1) return segment // a tag
      if (segment.includes('$')) return segment // already delimited; not this tool's business

      // A node whose delimiters do not pair up lost one in the copy. Closing it is a guess, and
      // converting the parentheses inside it would be a second guess: leave the whole node alone.
      const count = (char) => segment.split(char).length - 1
      if (count('[') !== count(']') || count('(') !== count(')')) {
        leftAlone.push(`unbalanced delimiter in one text node: ${stripTags(segment).slice(0, 60)}`)
        return segment
      }

      let text = segment

      for (const span of topLevelSpans(text, '[', ']').reverse()) {
        const inner = span.inner
        if (!containsMathMarkup(inner)) {
          skipped += 1
          if (/\\/.test(inner) || /[_^]/.test(inner)) leftAlone.push(`[…] ${inner.trim().slice(0, 60)}`)
          continue
        }
        changed.push(`[…] ${inner.trim().slice(0, 50)} -> $$…$$`)
        text = `${text.slice(0, span.start)}$$${inner}$$${text.slice(span.end)}`
        bump('bracket-to-display-math')
      }

      const display = displayMathRegions(text)
      const parens = topLevelSpans(text, '(', ')').filter(
        (span) => !display.some((region) => span.start >= region.start && span.end <= region.end),
      )
      for (const span of parens.reverse()) {
        const inner = span.inner
        const strict =
          containsMathMarkup(inner) &&
          inner.length <= 80 &&
          !/[\u3400-\u9fff]/.test(inner) &&
          !/\$/.test(inner) &&
          !/^\d+[.,\d\s-]*$/.test(inner)
        if (!strict) {
          skipped += 1
          if (containsMathMarkup(inner) || /\\/.test(inner)) leftAlone.push(`(…) ${inner.trim().slice(0, 60)}`)
          continue
        }
        // The parentheses stay OUTSIDE the delimiters: "(S_{mn}^{max})^2" and "$S_{mn}^{max}$^2" are
        // different expressions, and only one of them is what the paper said.
        changed.push(`(${inner.trim().slice(0, 50)}) -> ($…$)`)
        text = `${text.slice(0, span.start)}($${inner}$)${text.slice(span.end)}`
        bump('parens-to-inline-math')
      }

      return text
    })
    .join('')

  // Rule 4 - display math on lines of its own: "$$ x $$" becomes "$$\nx\n$$". This is how the note is
  // read and edited, and it is idempotent, so a note written this way never changes again.
  if (lineBreaks) {
    current = current.replace(/\$\$([\s\S]*?)\$\$/g, (whole, inner) => {
      const trimmed = inner.trim()
      if (trimmed === '') return whole
      const block = `$$\n${trimmed}\n$$`
      if (whole !== block) bump('display-math-on-its-own-lines')
      return block
    })
  }

  return {
    html: current,
    applied: [...applied].map(([rule, count]) => ({ rule, count })),
    changed,
    skipped,
    leftAlone: [...new Set(leftAlone)],
  }
}

/**
 * The text a reader sees: tags and comments removed, whitespace collapsed.
 *
 * This is how a read-back is compared. A note body is NOT stored byte-for-byte as it was sent: the
 * application normalizes one it has edited (measured: the note gained a `<div data-schema-version="9">`
 * wrapper and LOST the invisible marker comment), so a byte comparison reports a mismatch on a write
 * that in fact landed - a false alarm about the owner's library, which is the worst kind.
 *
 * @param {string} html Note body as the library stores it.
 * @returns {string} Its visible text.
 */
export function visibleText(html) {
  return stripTags(html)
}

/**
 * Whether the repair has nothing left to do, i.e. re-running it would change nothing.
 *
 * @param {string} html Note body as the library stores it.
 * @param {{lineBreaks?: boolean}} [options] Must match the options the repair was planned with.
 * @returns {boolean} True when the body is already in the repaired shape.
 */
export function repairConverged(html, options = {}) {
  return normalizeMath(html, options).html === html
}

/**
 * Whether the APPLICATION has normalized this note already.
 *
 * Measured: a note the application has written carries its own `<div data-schema-version="...">`
 * wrapper and no longer carries this tool's invisible marker comment, while a note written only
 * through the local API stays bare. The difference matters for exactly one rule - the line breaks
 * around display math: on a wrapped note the library stores the body back on one line, so a repair
 * that kept asking for the break would write the same no-op on every run and report the same change
 * forever. That is the failure mode this predicate exists to prevent.
 *
 * @param {string} html Note body as the library stores it.
 * @returns {boolean} True when the body opens with the application's own wrapper.
 */
export function isApplicationWrapped(html) {
  return /^\s*<div data-schema-version="\d+">/.test(String(html ?? ''))
}

/**
 * The note body a section note is created with: the marker, then the explanation.
 *
 * @param {string} token The section ordinal.
 * @param {string} body The explanation, as HTML.
 * @returns {string} The body to send.
 */
export function composeSectionNote(token, body) {
  return `${sectionMarker(token)}\n${String(body ?? '').trim()}`
}

/** The write that creating a note is, so a plan can print it without doing it. */
export function createWriteLine(itemKey) {
  return `POST /api/users/0/items  [{itemType: note, parentItem: ${itemKey}, note: ...}]`
}

function parseArgs(argv) {
  const options = { item: '', note: '', section: '', text: '', file: '', title: '', tidy: false, plan: false, write: false }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    const next = argv[index + 1]
    if (flag === '--write') {
      options.write = true
      continue
    }
    if (flag === '--tidy') {
      options.tidy = true
      continue
    }
    if (flag === '--plan') {
      options.plan = true
      continue
    }
    if (!['--item', '--note', '--section', '--text', '--file', '--title'].includes(flag)) throw new UsageError(`unrecognised argument '${flag}'`)
    if (!next) throw new UsageError(`${flag} needs a value`)
    options[flag.slice(2)] = next
    index += 1
  }
  if (!options.item && !options.note) throw new UsageError('pass --item <recordKey>, or --tidy --note <noteKey>')
  if (options.tidy && options.section) throw new UsageError('--tidy does not take --section: it repairs the notes that exist')
  if (!options.tidy && options.section && Boolean(options.text) === Boolean(options.file)) {
    throw new UsageError('pass --text or --file, not both')
  }
  if (!options.tidy && !options.section && (options.text || options.file)) {
    throw new UsageError('a body was given without --section <ordinal>; say which section it explains')
  }
  return options
}

const USAGE =
  'usage: node tools/zotero-section-note.mjs --item <recordKey> [--plan]\n' +
  '       node tools/zotero-section-note.mjs --item <recordKey> --section <ordinal> (--text "<html>" | --file <path>)\n' +
  '                                       [--title "<title>"] [--write]\n' +
  '       node tools/zotero-section-note.mjs --tidy --note <noteKey> [--write]\n' +
  '       node tools/zotero-section-note.mjs --item <recordKey> --tidy [--write]\n' +
  '       --title is attempted and, if the library refuses it (measured: a title patch on a note answers\n' +
  '       HTTP 500 here), the same note is written WITHOUT it rather than not at all.'

/** Every child note of a record, with the section it claims. */
async function noteChildren(itemKey) {
  const children = await childrenOf(itemKey)
  return children
    .filter((child) => child?.data?.itemType === 'note')
    .map((child) => ({ key: child.key, html: child.data.note ?? '', claim: sectionClaim(child.data.note ?? '') }))
}

/** The plan half of `--item …, no --section`: what this record already covers. */
async function runPlan(itemKey) {
  const record = await readItem(itemKey)
  const children = await childrenOf(itemKey)
  const notes = await noteChildren(itemKey)
  const attachment = children.find((child) => child.data?.itemType === 'attachment' && ['application/pdf', 'application/epub+zip', 'text/html'].includes(child.data?.contentType ?? ''))
  console.log(`record : ${itemKey}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(
    `file   : ${attachment ? `${attachment.key}  ${attachment.data.contentType}` : 'NO PDF/EPUB/HTML ATTACHMENT - nothing here can be read as text'}`,
  )
  console.log(`notes  : ${notes.length} child note(s)`)
  for (const note of notes) {
    const label = note.claim.token ? `§${note.claim.token} (${note.claim.by})` : '(not a section note)'
    console.log(`  ${note.key}  ${String(note.html.length).padStart(6)} chars  ${label}`)
  }
  const covered = notes.filter((note) => note.claim.token).map((note) => note.claim.token)
  console.log(`covered: ${covered.length ? covered.map((token) => `§${token}`).join(' · ') : 'none'}`)
}

/** Create one section note, refusing when the section is already covered. */
async function runCreate(options) {
  const body = options.file ? readFileSync(options.file, 'utf8') : options.text
  if (body.trim() === '') throw new UsageError('the note body is empty')
  if (!looksLikeHtml(body)) {
    throw new UsageError('the note body is not HTML; the library stores note bodies as HTML and a Markdown guess would silently change what is stored')
  }
  const token = normalizeSectionToken(options.section)
  if (!token) throw new UsageError(`--section '${options.section}' carries no ordinal this tool can match`)

  const record = await readItem(options.item)
  if (record.itemType === 'note') throw new UsageError(`${options.item} is itself a note; pass the record the note is about`)
  const notes = await noteChildren(options.item)
  const covering = notes.find((note) => note.claim.token === token)
  const composed = composeSectionNote(token, body)

  console.log(`record  : ${options.item}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(`section : §${token}`)
  console.log(`notes   : ${notes.length} child note(s); covered: ${notes.filter((note) => note.claim.token).map((note) => `§${note.claim.token}`).join(' · ') || 'none'}`)
  console.log(`body    : ${body.length} characters -> ${composed.length} with the marker`)
  if (options.title) console.log(`title   : "${options.title}" (attempted; the note is written without it if refused)`)
  console.log(`write   : ${createWriteLine(options.item)}`)

  if (covering) {
    console.error(`\nREFUSED: §${token} is already covered by note ${covering.key} (read from its ${covering.claim.by}).`)
    console.error('Nothing was written. Use --tidy to repair that note\'s delimiters, or a different --section.')
    process.exitCode = 1
    return
  }
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return
  }

  const gate = createWriteGate({ appName: APP_NAME })
  await gate.open()
  const withTitle = { itemType: 'note', parentItem: options.item, note: composed }
  if (options.title) withTitle.title = options.title
  let res = await gate.write('POST', '/api/users/0/items', [withTitle])
  // A title this library refuses must cost the note, not the note's existence: a refused POST created
  // nothing, so the same note is written again without it and the refusal is reported.
  if (res.status !== 200 && options.title) {
    console.log(`\nThe library refused the title (HTTP ${res.status}); writing the same note without it.`)
    res = await gate.write('POST', '/api/users/0/items', [{ itemType: 'note', parentItem: options.item, note: composed }])
  }
  if (res.status !== 200) {
    console.error(`\nThe library refused the write (HTTP ${res.status}): ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const payload = JSON.parse(res.text)
  const saved = payload.successful?.['0'] ?? payload.success?.['0']
  const noteKey = typeof saved === 'string' ? saved : saved?.key
  if (!noteKey) {
    console.error(`\nThe library reported no success: ${res.text.slice(0, 300)}`)
    process.exitCode = 1
    return
  }
  const back = await readItem(noteKey)
  // Compared as TEXT, not bytes: the application rewrites a note it touches (wrapper added, marker
  // comment dropped), so a byte comparison would call a delivered note undelivered.
  if (!visibleText(back.note ?? '').includes(visibleText(body))) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back with the text that was sent.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${noteKey} carries §${token} on ${options.item} (now ${back.note.length} characters, version ${back.version}).`)
}

/** Repair one note's delimiters, refusing anything that is not a section note. */
async function tidyOne({ noteKey, gate, write }) {
  const note = await readItem(noteKey)
  if (note.itemType !== 'note') throw new UsageError(`${noteKey} is a ${note.itemType}, not a note`)
  const claim = sectionClaim(note.note ?? '')
  const before = note.note ?? ''
  // A note the application has already written keeps its display math on one line whatever is sent:
  // the block-form rule is therefore not attempted on it, and that is SAID rather than silently
  // skipped or retried forever.
  const appOwned = isApplicationWrapped(before)
  const repaired = normalizeMath(before, { lineBreaks: !appOwned })
  console.log(`\nnote    : ${noteKey}  parent ${note.parentItem ?? '(none)'}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token} (${claim.by})` : 'NOT a section note - refusing to touch it'}`)
  if (appOwned) {
    console.log('          the application has normalized this note already; the display-math line break')
    console.log('          is NOT attempted on it (measured: this library stores such a note back on one line)')
  }
  console.log(`size    : ${before.length} -> ${repaired.html.length} characters`)
  for (const rule of repaired.applied) console.log(`  applied: ${rule.rule} x${rule.count}`)
  console.log(`  spans   : ${repaired.changed.length} converted, ${repaired.skipped} left as they were`)
  for (const span of repaired.changed.slice(0, 10)) console.log(`  converted: ${span}`)
  if (repaired.changed.length > 10) console.log(`  converted: ... and ${repaired.changed.length - 10} more`)
  for (const span of repaired.leftAlone.slice(0, 8)) console.log(`  left alone: ${span}`)
  if (repaired.leftAlone.length > 8) console.log(`  left alone: ... and ${repaired.leftAlone.length - 8} more`)

  if (!claim.token) {
    console.error('\nREFUSED: a note this tool did not identify as a section note is never modified.')
    process.exitCode = 1
    return 0
  }
  if (repaired.html === before) {
    console.log('nothing to do - no span qualified for a mechanical repair.')
    return 0
  }
  if (!write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write.')
    return 0
  }
  const result = await patchItem({ gate, key: noteKey, patch: { note: repaired.html }, apply: true })
  if (result.conflict) {
    console.error(`\nCONFLICT: note ${noteKey} changed since this plan was read. Nothing was written.`)
    process.exitCode = 1
    return 0
  }
  if (!result.applied) {
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return 0
  }
  const readBack = result.after.note ?? ''
  // Two conditions, because the application normalizes a note it rewrites (measured: a
  // `<div data-schema-version="9">` wrapper appears and the invisible marker comment disappears), so a
  // byte comparison would report a delivered repair as failed.
  if (!repairConverged(readBack, { lineBreaks: !isApplicationWrapped(readBack) })) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} still has spans the repair would change.`)
    process.exitCode = 1
    return 0
  }
  if (visibleText(readBack) !== visibleText(repaired.html)) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back with the same visible text.`)
    process.exitCode = 1
    return 0
  }
  console.log(`\nOK - note ${noteKey} repaired (now ${result.after.note.length} characters, version ${result.after.version}).`)
  return 1
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.plan || (!options.tidy && !options.section)) {
    await runPlan(options.item)
    return
  }

  if (options.tidy) {
    const targets = options.note
      ? [options.note]
      : (await noteChildren(options.item)).filter((note) => note.claim.token).map((note) => note.key)
    if (targets.length === 0) {
      console.log(`${options.item} carries no note this tool identifies as a section note; nothing to tidy.`)
      return
    }
    const gate = options.write ? createWriteGate({ appName: APP_NAME }) : null
    if (gate) await gate.open()
    let repaired = 0
    for (const target of targets) repaired += await tidyOne({ noteKey: target, gate, write: options.write })
    console.log(`\n${targets.length} note(s) examined, ${repaired} repaired.`)
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
