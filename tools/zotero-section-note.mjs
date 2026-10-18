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
//            a note this tool did not write, which is most of them: the notes already in this library
//            carry no marker. Coverage is READ from the note's first paragraph, and only in forms that
//            cannot be a list marker or an ordinary sentence ("第N节", "Section N", "§N", a Roman
//            numeral heading, an appendix label).
//   tidy     a MECHANICAL repair of the math delimiters in one existing section note: the "<em>" that
//            a Markdown underscore became, and "[ ... ]" / "( ... )" restored to "$$ ... $$" / "$...$".
//            Display math also ends up on lines of its own ("$$\nx\n$$"), which is the shape the notes
//            are read and edited in - and that rule is idempotent, so a note already in that shape is
//            left byte-for-byte alone. It never rewrites prose, never guesses, and reports every span
//            it refused to touch.
//
// COVERAGE IS COUNTED PER TOP-LEVEL SECTION
//
// A section is written as ONE note, however long the section is. The discipline does not split a section
// into notes keyed to its subsections: the key then has to be counted back into its parent, and it covers
// nothing a long note would not have. The parent/child reading stays anyway, for two reasons - a library
// can already carry notes keyed that way (this one did, and they can be restored from its trash), and
// "which section is this" is a question about the PAPER rather than about how we chose to write it. So a
// write is refused three ways - the section itself is claimed, a subsection is asked for whose parent is
// covered as a whole, or a top-level section is asked for that is already covered in parts - while a
// SIBLING subsection is never coverage, because the missing part is exactly what may be written next.
// Comparing tokens as whole strings expresses none of that, which is why every comparison goes through
// {@link parentSectionToken}.
//
// WHY A CLAIM IS READ NARROWLY, AND WHAT CARRIES THE REST
//
// A bare leading number is NOT a claim, and that is measured rather than cautious: in the owner's
// library, sixteen notes open "1. 一段话总结" (a whole-paper summary, not a note about section 1) while
// "2 仿真结果及分析" is a real section note. No rule over "digit, dot, text" tells those apart. So the
// plan prints every note's first paragraph and lists the keys it could not read, and the judgement is
// made by a reader: the discipline reads those paragraphs against the paper's own section list, decides
// which sections are covered, and reports the decision before writing. Where that reading disagrees with
// this tool's, both readings are reported and the round stops - this tool refuses a claim it read, and
// never overrules a reading.
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
// RETIRING A NOTE THAT IS WRONG
//
// A section that a bad note explains cannot be written again while that note covers it, and this tool
// performs no deletion - the library's local API has no way to put an item in the trash, so a delete
// here is permanent. The third way out is the one this tool now offers: RETIRE the note. Its body is
// left exactly as it stands, a `/retired` tag is added to it, the section it claimed becomes writable
// again, and removing the tag puts the claim back. Nothing is deleted and nothing is rewritten, so what
// the note said survives for whoever asks later why the section was written twice.
//
// The retirement mark is a TAG rather than the invisible comment this tool writes at the top of a note,
// because that comment is not durable: measured on this library, the application drops it when it
// rewrites a note's body. Whether a tag survives the same rewrite is not yet measured, which is why the
// read-back below asserts the mark is there and why the reading that cannot find one is reported rather
// than assumed.
//
// Usage:
//   node tools/zotero-section-note.mjs --item <recordKey>                              # coverage plan
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html    # dry run
//   node tools/zotero-section-note.mjs --item <recordKey> --section 2 --file n2.html --write
//   node tools/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>"        # dry run
//   node tools/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>" --write
//   node tools/zotero-section-note.mjs --retire --note <noteKey> --undo --write          # put it back
//   node tools/zotero-section-note.mjs --tidy --note <noteKey>                          # dry run
//   node tools/zotero-section-note.mjs --item <recordKey> --tidy --write                # all its sections
//
// Exit codes: 0 applied, or nothing to do | 1 refused (already covered, conflict, library error) | 2 usage.
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { APP_NAME, childrenOf, createWriteGate, patchItem, readItem, visibleText } from './zotero-local-api.mjs'

/** The marker that identifies a section note this tool wrote. Invisible in the application's view. */
export const SECTION_MARKER_PREFIX = '<!-- autoresearch-section:'

/**
 * The tag that retires a section note.
 *
 * A tag rather than a second comment, because the comment this tool already writes is not durable:
 * measured on this library, a note the application rewrites comes back with its invisible marker
 * comment gone. Whether a tag survives that same rewrite is NOT yet measured - it is the regression
 * test this change ships with - so the claim is read from the tag, and a reading that cannot see one
 * is reported rather than assumed away.
 *
 * `/section-note` is a tag an earlier round left on its notes. It says a note IS a section note, which
 * this tool reads from the note's own opening anyway: it is recognised and never written, and
 * retirement is a tag of its own, so the two cannot be confused for one another.
 */
export const RETIRE_TAG = '/retired'

/**
 * The tag that names the note a new section note replaces.
 *
 * The retirement mark frees the section but says nothing about what took the retired note's place, and
 * the replacement is written after the retirement - so its key cannot be known when the mark is added.
 * The pointer therefore travels on the note that does the replacing, where it is durable, readable by
 * this tool, and visible in the library.
 */
export const REPLACES_TAG_PREFIX = '/replaces-'

/** A malformed command line, as opposed to a write that failed. Exit code 2 rather than 1. */
class UsageError extends Error {}

const CHINESE_DIGITS = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 }

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
  // A dotted ordinal is a subsection's own number (3.1, 2.1.3), kept exactly as written because it comes
  // from the paper. This skill does not write notes keyed that way any more, but a library can carry them
  // from before (or from its trash), and then the number is how they are recognised.
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
  const match = new RegExp(`${SECTION_MARKER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d+(?:\\.\\d+)*)\\s*-->`).exec(
    String(noteHtml ?? ''),
  )
  return match ? match[1] : ''
}

/**
 * A Roman numeral's value, for the "III. PROPOSED ..." heading form.
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
 * The first block of prose in a note, as a reader sees it.
 *
 * "First block", not "first N characters": {@link visibleText} collapses every run of whitespace, so
 * the collapsed text has no line to measure a position against, and what makes a section number a claim
 * rather than a cross-reference is which PARAGRAPH it sits in. A note the application wrote is wrapped
 * in its own `<div>`, which is not prose, so the first `p` / `h1`-`h6` / `li` element is taken instead.
 * A note with no block element at all is read the old way, by its first 120 visible characters.
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
 * The forms a section claim may take, in the order they are tried.
 *
 * Two conditions, both narrow on purpose, because this reading can REFUSE a write:
 *
 *   * the form itself cannot be a list marker or an ordinary sentence - so a bare leading number is
 *     never one, measured: "1. 一段话总结" (a whole-paper summary) and "2 仿真结果及分析" (a real
 *     section note) are the same shape on the owner's library, and no rule over "digit, dot, text"
 *     separates them;
 *   * the ordinal must BEGIN a clause - the start of the paragraph, right after whitespace or
 *     punctuation, or right after a document label. A section number in the middle of a sentence is a
 *     cross-reference ("这一节的内容与第2节相关"), while the notes that do name their own section name it
 *     at the start of one - sometimes glued to a label ("文章第2节标题是 ..."), sometimes after a colon
 *     ("解释文章的这一节（渲染好公式）：第二节 扰动后响应的推导").
 */
const CLAUSE_START = '(?:^|[\\s：:。；;！!？?、，,（(【「]|文\\s*章?|本\\s*文|论\\s*文|全\\s*文)'
const CLAIM_FORMS = [
  { rule: '第N节', pattern: new RegExp(`${CLAUSE_START}第\\s*(\\d+(?:\\.\\d+)*|[一二三四五六七八九十]+)\\s*节`), token: (match) => normalizeSectionToken(match[1]) },
  { rule: 'Section N', pattern: new RegExp(`${CLAUSE_START}Section\\s+(\\d+(?:\\.\\d+)*)`, 'i'), token: (match) => normalizeSectionToken(match[1]) },
  { rule: '§N', pattern: new RegExp(`${CLAUSE_START}§\\s*(\\d+(?:\\.\\d+)*)`), token: (match) => normalizeSectionToken(match[1]) },
  // "II. DERIVING RESPONSE PROFILES ...", "III. PROPOSED ..." - the FORM was measured on the owner's
  // library as the one a note uses where the Chinese label is absent; the wording here stands in for it,
  // since what is parsed is the form. Two characters or more, so a bare
  // "I." (a plausible list marker) is not read as a section.
  { rule: '罗马数字', pattern: new RegExp(`${CLAUSE_START}([IVX]{2,6})\\.\\s*\\S`), token: (match) => String(romanToNumber(match[1]) || '') },
  // "Appendix A.2". Read and reported, so a reader can see why a note looks like a section note; it can
  // never equal a writable section, because this tool writes numerals only.
  { rule: 'Appendix X', pattern: new RegExp(`${CLAUSE_START}Appendix\\s+([A-Z](?:\\.\\d+)*)\\b`, 'i'), token: (match) => match[1].toUpperCase() },
]

/**
 * Which section a note's own words say it is about.
 *
 * Only the first paragraph is read: a section number mentioned later in the prose is a cross-reference,
 * not a claim about which section this note is.
 *
 * This reading is a BACKSTOP, not the judgement. It catches the notes that say what they are; it cannot
 * catch the ones that merely look like they do, and those are not guessed at - the plan prints every
 * note's first paragraph, and the discipline decides coverage by reading them against the paper's own
 * section list. A wrong reading here is loud (a refusal naming the words it went by) rather than silent,
 * which is the direction that costs a look instead of a section.
 *
 * @param {string} noteHtml Note body.
 * @returns {{token: string, rule: string, evidence: string}|undefined} The section, the form that
 *   matched, and the words it was read from.
 */
export function readSectionFromParagraph(noteHtml) {
  const paragraph = firstBlockText(noteHtml)
  for (const form of CLAIM_FORMS) {
    const match = form.pattern.exec(paragraph)
    if (!match) continue
    const token = form.token(match)
    if (token) return { token, rule: form.rule, evidence: match[0].trim() }
  }
  return undefined
}

/**
 * Which section a note is a note ABOUT, however that is recorded.
 *
 * @param {string} noteHtml Note body.
 * @returns {{token: string, by: 'marker'|'paragraph'|'none', rule: string, evidence: string}} The claim,
 *   how it was read, the form that matched, and the words it was read from - the last two so that a
 *   refusal can be audited without opening the note.
 */
export function sectionClaim(noteHtml) {
  const marked = readSectionMarker(noteHtml)
  if (marked) return { token: marked, by: 'marker', rule: 'marker', evidence: sectionMarker(marked) }
  const paragraph = readSectionFromParagraph(noteHtml)
  if (paragraph) return { token: paragraph.token, by: 'paragraph', rule: paragraph.rule, evidence: paragraph.evidence }
  return { token: '', by: 'none', rule: '', evidence: '' }
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
  return (tags ?? []).some((tag) => String(tag).trim().toLowerCase() === RETIRE_TAG)
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
  const hit = (tags ?? []).map((tag) => String(tag).trim()).find((tag) => tag.startsWith(REPLACES_TAG_PREFIX))
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
 * The top-level section a token belongs to.
 *
 * Coverage is counted per TOP-LEVEL section: a section is one note, and a note keyed to a subsection -
 * which this skill no longer writes, but a library may carry from before - belongs to the section it is
 * numbered under. Comparing tokens as whole strings cannot express that, because "3" and "3.1" are simply
 * different strings, so every comparison goes through this.
 *
 * @param {string} token A normalized ordinal, e.g. `3` or `3.1`.
 * @returns {string} Its top-level part (`3`), or '' for an empty token.
 */
export function parentSectionToken(token) {
  return String(token ?? '').split('.')[0]
}

/**
 * The note that already covers the section a write is for, and why.
 *
 * Three ways a section is covered, and each one refuses the write:
 *
 *   * a note claims that very section;
 *   * the section asked for is a SUBSECTION whose parent is already covered as a whole;
 *   * the section asked for is TOP-LEVEL and is already covered in parts.
 *
 * A sibling subsection is not coverage: a note about 3.2 says nothing about 3.1.
 *
 * @param {Array<{key: string, claim: {token: string}}>} notes The record's child notes.
 * @param {string} token The section the write is for.
 * @returns {{note: object, why: string}|undefined} The covering note and the reason, if any.
 */
export function coveringNote(notes, token) {
  // A retired note is a tombstone: it still claims the section it was written for, and it no longer
  // covers it. That filter is the whole point of retiring, so it lives here rather than in each caller,
  // and every question of the form "is this section covered" gets the same answer.
  const covered = notes.filter((note) => note.claim.token && !note.retired)
  const same = covered.find((note) => note.claim.token === token)
  if (same) return { note: same, why: `note ${same.key} claims §${token}` }

  const parent = parentSectionToken(token)
  const whole = covered.find((note) => note.claim.token === parent && parent !== token)
  if (whole) return { note: whole, why: `note ${whole.key} covers §${parent} as a whole, and §${token} is part of it` }

  const parts = parent === token
    ? covered.filter((note) => parentSectionToken(note.claim.token) === parent && note.claim.token !== token)
    : []
  if (parts.length) {
    return {
      note: parts[0],
      why: `§${parent} is already covered in parts by ${parts.map((note) => `${note.key} (§${note.claim.token})`).join(' · ')}, and §${parent} is the unit that is counted`,
    }
  }
  return undefined
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
        leftAlone.push(`unbalanced delimiter in one text node: ${visibleText(segment).slice(0, 60)}`)
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
  const options = {
    item: '', note: '', section: '', text: '', file: '', title: '', reason: '', replaces: '',
    tidy: false, plan: false, write: false, retire: false, undo: false, json: false,
  }
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
    if (flag === '--json') {
      options.json = true
      continue
    }
    if (flag === '--retire') {
      options.retire = true
      continue
    }
    if (flag === '--undo') {
      options.undo = true
      continue
    }
    if (!['--item', '--note', '--section', '--text', '--file', '--title', '--reason', '--replaces'].includes(flag)) throw new UsageError(`unrecognised argument '${flag}'`)
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
  if (options.retire) {
    if (!options.note) throw new UsageError('--retire takes --note <noteKey>: one retirement, one write')
    if (options.item || options.section || options.text || options.file || options.tidy || options.plan) {
      throw new UsageError('--retire changes one note and nothing else; drop the other arguments')
    }
    if (!options.undo && String(options.reason).trim() === '') {
      throw new UsageError('--retire needs --reason "<why>": the reason is the record of the change, and this tool stores no prose on the note')
    }
  } else {
    if (options.undo) throw new UsageError('--undo belongs to --retire')
    if (options.reason) throw new UsageError('--reason belongs to --retire')
  }
  if (options.replaces && !options.section) {
    throw new UsageError('--replaces names the note a new section note replaces, so it goes with the --section that note is written for')
  }
  if (options.json && (options.section || options.tidy || options.retire)) {
    throw new UsageError('--json prints the coverage plan; it goes with --item and nothing else')
  }
  return options
}

const USAGE =
  'usage: node tools/zotero-section-note.mjs --item <recordKey> [--plan] [--json]\n' +
  '       node tools/zotero-section-note.mjs --item <recordKey> --section <ordinal> (--text "<html>" | --file <path>)\n' +
  '                                       [--title "<title>"] [--replaces <retiredNoteKey>] [--write]\n' +
  '       node tools/zotero-section-note.mjs --retire --note <noteKey> --reason "<why>" [--write]\n' +
  '       node tools/zotero-section-note.mjs --retire --note <noteKey> --undo [--write]\n' +
  '       node tools/zotero-section-note.mjs --tidy --note <noteKey> [--write]\n' +
  '       node tools/zotero-section-note.mjs --item <recordKey> --tidy [--write]\n' +
  '       --retire marks a wrong note as a tombstone instead of deleting it: the body is untouched, the\n' +
  '       section it claimed becomes writable again, and --undo puts the claim back. The reason is\n' +
  '       printed and must be written into the note that replaces it, because a tag cannot hold prose.\n' +
  '       --title is attempted and, if the library refuses it (measured: a title patch on a note answers\n' +
  '       HTTP 500 here), the same note is written WITHOUT it rather than not at all.'

/** Every child note of a record, with the section it claims. */
async function noteChildren(itemKey) {
  const children = await childrenOf(itemKey)
  return children
    .filter((child) => child?.data?.itemType === 'note')
    .map((child) => {
      const tags = (child.data.tags ?? []).map((entry) => entry.tag)
      const html = child.data.note ?? ''
      return { key: child.key, html, tags, retired: isRetired(tags), claim: sectionClaim(html) }
    })
}

/**
 * The coverage plan as one object.
 *
 * The prose plan is written for a person deciding what to read next. A round that has to hand the owner
 * one list across several records needs the same facts in a shape it can join on, because prose joined
 * by hand is how each round ends up inventing its own list. This is that shape, and it carries only what
 * the tool can read: which sections are covered, by which note, which notes are tombstones and what
 * names itself their successor, and which notes it could not read at all.
 *
 * @param {{record: object, attachment: object|undefined, notes: Array<object>}} input The record's state.
 * @returns {object} A JSON-serializable plan.
 */
export function planJson({ record, attachment, notes }) {
  const live = notes.filter((note) => note.claim.token && !note.retired)
  const retired = notes.filter((note) => note.claim.token && note.retired)
  const sections = new Map()
  for (const note of live) {
    const top = parentSectionToken(note.claim.token)
    if (!sections.has(top)) sections.set(top, [])
    sections.get(top).push(note.claim.token)
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
      section: note.claim.token,
      sectionTop: parentSectionToken(note.claim.token),
      claimRule: note.claim.rule,
      claimEvidence: note.claim.evidence,
      replaces: replacesKey(note.tags),
    })),
    coverage: {
      live: [...sections.entries()].map(([section, parts]) => ({ section, notes: parts })),
      retired: retired.map((note) => ({ section: note.claim.token, note: note.key, successor: successorOf(notes, note.key) })),
      unreadable: notes.filter((note) => !note.claim.token).map((note) => note.key),
    },
    counts: {
      notes: notes.length,
      live: live.length,
      retired: retired.length,
      unreadable: notes.length - live.length - retired.length,
    },
  }
}

/** The plan half of `--item …, no --section`: what this record covers, and what to go read. */
async function runPlan(itemKey, { json = false } = {}) {
  const record = await readItem(itemKey)
  const children = await childrenOf(itemKey)
  const notes = await noteChildren(itemKey)
  const attachment = children.find((child) => child.data?.itemType === 'attachment' && ['application/pdf', 'application/epub+zip', 'text/html'].includes(child.data?.contentType ?? ''))
  // The machine plan is the whole output in this mode: a caller that has to parse one is a caller that
  // will parse it wrongly, and this file is not the place to learn that.
  if (json) {
    console.log(JSON.stringify(planJson({ record, attachment, notes }), null, 2))
    return
  }
  console.log(`record : ${itemKey}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(
    `file   : ${attachment ? `${attachment.key}  ${attachment.data.contentType}` : 'NO PDF/EPUB/HTML ATTACHMENT - nothing here can be read as text'}`,
  )
  console.log(`notes  : ${notes.length} child note(s)`)

  // Every note is shown with the first paragraph a reader would see, because that is what the coverage
  // decision is made from - and it is printed for the notes the tool DID read too, since "§2" is a
  // reading, and a reading is only as good as the words behind it.
  for (const note of notes) {
    const token = note.claim.token
    const read = token
      ? `§${token}${parentSectionToken(token) === token ? '' : ` → counts as §${parentSectionToken(token)}`}  (${note.claim.rule}: "${note.claim.evidence}")`
      : '-'
    console.log(`\n  ${note.key}  ${String(note.html.length).padStart(6)}c  ${isApplicationWrapped(note.html) ? 'app' : 'API'}  ${read}${note.retired ? '  RETIRED' : ''}`)
    console.log(`      ${firstBlockText(note.html).slice(0, 96)}`)
    if (note.tags.length) console.log(`      tags: ${note.tags.join(' · ')}`)
  }

  // A retired note still claims the section it was written for and no longer covers it, so it is
  // counted apart from the coverage: a plan that folded the two together would hide the one thing
  // retiring is for - that the section is free to be written again.
  const read = notes.filter((note) => note.claim.token && !note.retired)
  const retired = notes.filter((note) => note.claim.token && note.retired)
  const unread = notes.filter((note) => !note.claim.token)
  const topLevel = [...new Set(read.map((note) => parentSectionToken(note.claim.token)))]
  const describe = (parent) => {
    const tokens = read.filter((note) => parentSectionToken(note.claim.token) === parent).map((note) => note.claim.token)
    return tokens.length > 1 ? `§${parent} (in parts: ${tokens.map((token) => `§${token}`).join(' · ')})` : `§${parent}`
  }
  console.log(`\nread here   : ${topLevel.length ? topLevel.map(describe).join(' · ') : 'none'}`)
  console.log(`retired     : ${retired.length ? retired.map((note) => `§${note.claim.token} (${note.key}${successorOf(notes, note.key) ? ` → superseded by ${successorOf(notes, note.key)}` : ' → nothing names a replacement yet'})`).join(' · ') : 'none'}`)
  console.log(`judge these : ${unread.length ? unread.map((note) => note.key).join(' · ') : 'none'}`)
  console.log('\nNOTE: `read here` is what this tool could read from a marker or a first paragraph, counted by')
  console.log('TOP-LEVEL section - §3 covered as 3.1 and 3.2 is §3. `judge these` are the notes it could not')
  console.log('read, and they are not guesses: read the first paragraph above (the whole note, with')
  console.log('zotero-read.mjs --item <noteKey>, when it is not enough), say which section of THIS paper each')
  console.log('one explains, and report the coverage before writing. Measured on one library: a note opening')
  console.log('"1. 一段话总结" is a whole-paper summary while "2 仿真结果及分析" is a section note - the same')
  console.log('shape, so the judgement is yours and this tool does not pretend to make it.')
  console.log('A note marked RETIRED is a tombstone: it is listed above, it is NOT coverage, and its section')
  console.log('can be written again. A live note carrying a /replaces- tag names the retired note it succeeded;')
  console.log('where no live note names one, nothing has replaced the retired note yet.')
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

  // A replacement names its predecessor, and the pair is refused while the predecessor is not retired:
  // a note that still covers its section makes a second note for that section the exact duplicate this
  // discipline exists to prevent, whatever the new note's tag says.
  const replacedKey = String(options.replaces ?? '').trim()
  if (replacedKey) {
    const old = await readItem(replacedKey)
    if (old.itemType !== 'note') throw new UsageError(`--replaces ${replacedKey} is a ${old.itemType}, not a note`)
    if (!isRetired((old.tags ?? []).map((entry) => entry.tag))) {
      throw new UsageError(`--replaces ${replacedKey} is not retired, so it still covers its section. Retire it first: --retire --note ${replacedKey} --reason "<why>" --write`)
    }
    const oldSection = parentSectionToken(sectionClaim(old.note ?? '').token)
    if (oldSection !== parentSectionToken(token)) {
      throw new UsageError(`--replaces ${replacedKey} explains §${oldSection || '?'}, not §${parentSectionToken(token)}: retiring one section's note does not free another's`)
    }
  }

  const covering = coveringNote(notes, token)
  const composed = composeSectionNote(token, body)
  const tags = replacedKey ? [{ tag: replacesTag(replacedKey) }] : []

  console.log(`record  : ${options.item}  [${record.itemType}]  "${record.title ?? ''}"`)
  console.log(`section : §${token}${parentSectionToken(token) === token ? '' : `  (counts as §${parentSectionToken(token)})`}`)
  console.log(`notes   : ${notes.length} child note(s); covered: ${[...new Set(notes.filter((note) => note.claim.token).map((note) => `§${parentSectionToken(note.claim.token)}`))].join(' · ') || 'none'}`)
  console.log(`body    : ${body.length} characters -> ${composed.length} with the marker`)
  if (options.title) console.log(`title   : "${options.title}" (attempted; the note is written without it if refused)`)
  if (replacedKey) console.log(`replaces: ${replacedKey} (tag ${replacesTag(replacedKey)}) - it is retired, so §${parentSectionToken(token)} is free`)
  console.log(`write   : ${createWriteLine(options.item)}`)

  if (covering) {
    console.error(`\nREFUSED: §${token} is already covered - ${covering.why}.`)
    console.error(`  read it as: §${covering.note.claim.token} (${covering.note.claim.rule}: "${covering.note.claim.evidence}")`)
    console.error('Nothing was written. Use --tidy to repair that note\'s delimiters, a different --section, or write')
    console.error('the part of a section that is missing when the coverage is in parts.')
    console.error('If you have read that note and it is NOT a note about this section, report both readings and')
    console.error('stop - do not work around this refusal.')
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
  if (tags.length) withTitle.tags = tags
  let res = await gate.write('POST', '/api/users/0/items', [withTitle])
  // A title this library refuses must cost the note, not the note's existence: a refused POST created
  // nothing, so the same note is written again without it and the refusal is reported.
  if (res.status !== 200 && options.title) {
    console.log(`\nThe library refused the title (HTTP ${res.status}); writing the same note without it.`)
    res = await gate.write('POST', '/api/users/0/items', [
      { itemType: 'note', parentItem: options.item, note: composed, ...(tags.length ? { tags } : {}) },
    ])
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
  // The pointer to the retired note is a tag, and a tag is the one part of a write this tool cannot
  // verify by reading text back. It is asserted separately, and a library that drops it is reported
  // rather than assumed to have kept it.
  if (tags.length && replacesKey((back.tags ?? []).map((entry) => entry.tag)) !== replacedKey) {
    console.error(`\nREAD-BACK MISMATCH: note ${noteKey} does not read back carrying ${replacesTag(replacedKey)}.`)
    console.error('The note exists and carries the text; the link to the note it replaces is what did not survive.')
    process.exitCode = 1
    return
  }
  console.log(
    `\nOK - note ${noteKey} carries §${token} on ${options.item} (now ${back.note.length} characters, version ${back.version}).` +
      (replacedKey ? ` It replaces ${replacedKey}.` : ''),
  )
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
  console.log(`claim   : ${claim.token ? `§${claim.token} (${claim.rule}: "${claim.evidence}")` : 'NOT a section note - refusing to touch it'}`)
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

/** Retire one note, or put its claim back. One note, one write, and the body is never touched. */
async function runRetire(options) {
  const note = await readItem(options.note)
  if (note.itemType !== 'note') throw new UsageError(`${options.note} is a ${note.itemType}, not a note`)
  const tags = (note.tags ?? []).map((entry) => entry.tag)
  const claim = sectionClaim(note.note ?? '')
  const undo = options.undo === true
  const want = !undo
  const already = isRetired(tags)
  const after = retireTags(tags, { undo })

  console.log(`note    : ${options.note}  parent ${note.parentItem ?? '(none)'}  version ${note.version}`)
  console.log(`claim   : ${claim.token ? `§${claim.token} (${claim.rule}: "${claim.evidence}")` : 'NOT a section note'}`)
  console.log(`tags    : ${tags.length ? tags.join(' · ') : '(none)'}  ->  ${after.join(' · ') || '(none)'}`)
  console.log(`change  : ${already ? 'retired' : 'live'} -> ${want ? 'retired' : 'live'}   (the body is NOT touched)`)
  if (options.reason) {
    console.log(`reason  : ${options.reason}`)
    console.log('          a tag cannot hold prose, so this reason is not stored on the note: write it into')
    console.log("          the note that replaces this one, and into the round's owner-action list.")
  }
  console.log(`write   : PATCH /api/users/0/items/${options.note}  [{tags: [...]}]`)

  if (!claim.token) {
    console.error('\nREFUSED: a note this tool did not identify as a section note is never modified.')
    console.error('Retiring is for a section note that is wrong. If this note IS a section note, report both')
    console.error('readings and stop - do not work around this refusal.')
    process.exitCode = 1
    return
  }
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
  // Whether a tag survives the application rewriting a note's body is NOT measured yet. This read-back
  // is where it gets measured, and a library that drops the mark is reported rather than believed.
  if (isRetired(back) !== want) {
    console.error(`\nREAD-BACK MISMATCH: note ${options.note} does not read back ${want ? 'retired' : 'live'}.`)
    console.error(`Tags read back: ${back.length ? back.join(' · ') : '(none)'} - the mark did not survive the write.`)
    process.exitCode = 1
    return
  }
  console.log(`\nOK - note ${options.note} is ${want ? 'retired' : 'live again'} (version ${result.after.version}).`)
  console.log(
    want
      ? `§${claim.token} is writable again; the note itself is untouched and --undo puts the claim back.`
      : `§${claim.token} is covered by it again; the note itself was never changed.`,
  )
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.retire) {
    await runRetire(options)
    return
  }
  if (options.plan || options.json || (!options.tidy && !options.section)) {
    await runPlan(options.item, { json: options.json })
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
