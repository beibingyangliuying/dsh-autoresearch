#!/usr/bin/env node
// Rewrite ONLY the phrase segment of one record's `remark:` line, and leave every other character of
// `extra` - and every other field - exactly as it was.
//
// WHY THIS FILE EXISTS
//
// The owner keeps a one-line digest of each paper in the record's `extra` field: `remark:` followed by
// a bracketed verdict, three to five phrases naming what the paper does, and sometimes a sentence of
// his own. He asked for the phrases to be drafted from the section notes. `zotero-edit.mjs --set
// extra=...` would replace the WHOLE field, so the caller would have to rebuild the `rate:`,
// `titleTranslation:` and `ISSN:` lines from memory - and one dropped line is a silent loss that
// nothing in the field would ever show. `extra` also carries no provenance mark, unlike a note's tags,
// so "which words are the owner's" has to be decided before the write rather than recorded after it.
//
// So this tool is narrower than the field. The caller NAMES the two parts it means to keep - the terms
// being replaced and the tail being preserved - and the tool refuses unless those parts add up to the
// line exactly. It guesses nothing: no pattern decides which text is an evaluation, because a tool that
// guessed would be making a content decision while claiming to format one.
//
// Usage:
//   node tools/zotero-remark.mjs --item <itemKey>                            # read the line, split
//   node tools/zotero-remark.mjs --item <key> --terms "a；b；c"                # dry run
//   node tools/zotero-remark.mjs --item <key> --terms "a；b；c" \
//        --old-terms "<the exact current phrases>" --keep-eval "<owner's sentence>"   # dry run, keeps the tail
//   node tools/zotero-remark.mjs --item <key> --terms "a；b；c" --create --write      # a record with no remark line
//
// Exit codes: 0 applied and read back, or nothing to do | 1 refused, nothing written | 2 usage |
// 3 sent or written but unconfirmed - the record may already carry the change, so read it, do not
// resend it.
import { APP_NAME, createWriteGate, mayHaveLanded, patchItem, readItem, reportUnconfirmed } from './zotero-local-api.mjs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Refusal, UsageError, reportFailure } from './refusal.mjs'

/** Set immediately before the PATCH is sent, so a failure after that point is never called a refusal. */
let writeAttempted = false

/** The fewest and most phrases one line may carry; the discipline narrows this, the tool only bounds it. */
export const TERM_COUNT = { min: 1, max: 6 }

/** One phrase is a phrase, not a paragraph. Long enough for the owner's longest, short enough to refuse a paste. */
export const TERM_LENGTH_MAX = 60

/** The separator the owner's own lines use between an entry and the next. */
export const SEPARATOR = '；'

/**
 * The line this tool owns, up to and including the space after its label.
 *
 * The space belongs to the label rather than to the value: a record its owner typed as `remark: （…）`
 * must not come back as `remark:（…）`, which reads as a different person's formatting. Case-insensitive,
 * because the field is free text the owner types.
 */
export const REMARK_LINE = /^([ \t]*)remark[ \t]*:[ \t]*/i

/** A bracketed verdict at the start of the line: full-width `（一般）` or half-width `(一般)`. */
export const VERDICT_PREFIX = /^[ \t]*[（(][^）)]*[）)]/

/**
 * Split text into lines, keeping the terminator it used.
 *
 * Rejoining with `\n` would rewrite every line of a field that arrived with `\r\n`, and the read-back
 * would then report a change the caller never asked for. Pure.
 *
 * @param {string} text The field's value.
 * @returns {{lines: string[], eol: string}} The lines, and the terminator to join them with.
 */
export function splitLines(text) {
  const value = String(text ?? '')
  const eol = value.includes('\r\n') ? '\r\n' : '\n'
  return { lines: value.split(/\r?\n/), eol }
}

/**
 * The phrase list a `--terms` value names.
 *
 * @param {string} text Phrases separated by a full-width or half-width semicolon.
 * @returns {string[]} The non-empty phrases, trimmed.
 */
export function splitTerms(text) {
  return String(text ?? '')
    .split(/[；;]/)
    .map((phrase) => phrase.trim())
    .filter((phrase) => phrase !== '')
}

/**
 * The `--terms` value as it is written into the line.
 *
 * @param {string[]} terms The phrases.
 * @returns {string} Joined with the owner's separator, with no trailing one.
 */
export function formatTerms(terms) {
  return terms.join(SEPARATOR)
}

/**
 * The verdict prefix and the rest of a remark line.
 *
 * @param {string} value The line's value, after the `remark:` label.
 * @returns {{prefix: string, body: string}} The bracketed verdict (empty when there is none) and
 *   everything after it.
 */
export function splitRemarkValue(value) {
  const text = String(value ?? '')
  const match = VERDICT_PREFIX.exec(text)
  if (match === null) return { prefix: '', body: text }
  return { prefix: match[0], body: text.slice(match[0].length) }
}

/**
 * Where two strings stop agreeing, as a one-based character position. Pure.
 *
 * @param {string} left One string.
 * @param {string} right The other.
 * @returns {number} The position of the first difference, or the shorter length + 1.
 */
export function firstDifference(left, right) {
  const limit = Math.min(left.length, right.length)
  for (let index = 0; index < limit; index += 1) {
    if (left[index] !== right[index]) return index + 1
  }
  return limit + 1
}

/**
 * The phrase shape a caller may ask for, or a usage error naming the rule broken.
 *
 * @param {string} text The raw `--terms` value.
 * @returns {string[]} The phrases.
 * @throws {UsageError} For too few, too many, a phrase carrying a newline, or one that is too long.
 */
export function checkTermShape(text) {
  const terms = splitTerms(text)
  if (terms.length < TERM_COUNT.min) throw new UsageError('--terms needs at least one phrase')
  if (terms.length > TERM_COUNT.max) {
    throw new UsageError(`--terms takes at most ${TERM_COUNT.max} phrases, got ${terms.length}; merge them rather than lowering the bound`)
  }
  for (const phrase of terms) {
    if (/\r|\n/.test(phrase)) throw new UsageError(`a phrase may not carry a line break: '${phrase.slice(0, 40)}'`)
    if (phrase.length > TERM_LENGTH_MAX) {
      throw new UsageError(`a phrase is at most ${TERM_LENGTH_MAX} characters, got ${phrase.length}: '${phrase.slice(0, 40)}...'`)
    }
  }
  return terms
}

/**
 * The next value of one existing remark line.
 *
 * The caller must account for every character of the line: `oldTerms + keepEval` has to equal the body
 * after the verdict prefix exactly, or nothing is planned. That is the whole guard - it is what makes
 * "only the middle changes" checkable instead of trusted.
 *
 * @param {object} input
 * @param {string} input.value The current value, after the `remark:` label.
 * @param {string[]} input.terms The phrases to write.
 * @param {string} [input.oldTerms] The exact text being replaced.
 * @param {string} [input.keepEval] The exact tail being kept - the owner's own sentence.
 * @returns {{next: string, prefix: string, body: string}} The next value and the parts it was built from.
 *   The separator the old body ended with is kept, so the write changes the phrases and no punctuation.
 * @throws {Refusal} When the named parts do not add up to the current line.
 */
export function planRewrite({ value, terms, oldTerms = '', keepEval = '' }) {
  const { prefix, body } = splitRemarkValue(value)
  const named = oldTerms + keepEval
  if (body !== named) {
    throw new Refusal(
      `the parts you named do not add up to this line: its body is ${body.length} characters, ` +
        `old-terms + keep-eval is ${named.length}, and they first differ at character ${firstDifference(body, named)}.`,
      {
        fix:
          'pass --old-terms as the exact text you are replacing and --keep-eval as the exact tail you mean to keep; ' +
          'together they must reproduce the body character for character. Read the line again with --item and copy from that answer.',
      },
    )
  }
  // The separator the line already ended with is kept, so a rewrite changes the words and nothing
  // else: a line that closed its list with `；` still closes it, and one that did not still does not.
  const closed = keepEval === '' && /[；;]$/.test(body) ? body.slice(-1) : ''
  const next = `${prefix}${formatTerms(terms)}${closed}${keepEval === '' ? '' : `${SEPARATOR}${keepEval}`}`
  return { next, prefix, body }
}

/**
 * The whole `extra` value after replacing (or adding) the remark line.
 *
 * Only the one line is rewritten; every other line is carried over as the string it was. A new line
 * goes FIRST, because that is where the owner keeps it (his own records read `remark:` then `rate:`),
 * and the position is stated in the plan rather than discovered afterwards.
 *
 * @param {object} input
 * @param {string} input.extra The record's current `extra` value.
 * @param {string} input.nextValue The remark line's next value, after the label.
 * @param {boolean} [input.create] Whether a missing remark line may be added.
 * @returns {{extra: string, index: number, created: boolean}} The next field value and what happened.
 * @throws {Refusal} For no remark line without `--create`, or for more than one.
 */
export function planExtra({ extra, nextValue, create = false }) {
  const { lines, eol } = splitLines(extra)
  const found = []
  for (let index = 0; index < lines.length; index += 1) {
    if (REMARK_LINE.test(lines[index])) found.push(index)
  }
  if (found.length > 1) {
    throw new Refusal(`this record carries ${found.length} remark lines; which one is the digest is not a decision this tool makes.`, {
      fix: 'settle it in the reference manager, then run this again - a line this tool cannot tell apart from the digest is not one it may rewrite.',
    })
  }
  if (found.length === 0) {
    if (!create) {
      throw new Refusal('this record has no remark line in its extra field, and --create was not given.', {
        fix: 'run again with --create to add the line, or write the bracketed verdict in the application first and then let this tool place the phrases after it.',
      })
    }
    const line = `remark: ${nextValue}`
    const next = lines.length === 1 && lines[0] === '' ? line : `${line}${eol}${lines.join(eol)}`
    return { extra: next, index: 0, created: true }
  }
  const index = found[0]
  const label = REMARK_LINE.exec(lines[index])[0]
  const next = [...lines]
  next[index] = `${label}${nextValue}`
  return { extra: next.join(eol), index, created: false }
}

/**
 * The phrase count as the reader states it, singular and plural. Pure.
 *
 * @param {number} count How many phrases.
 * @returns {string} The count with its noun.
 */
export function phraseCount(count) {
  return `${count} phrase${count === 1 ? '' : 's'}`
}

const USAGE =
  'usage: node tools/zotero-remark.mjs --item <key>                              # read the line, split\n' +
  '       node tools/zotero-remark.mjs --item <key> --terms "a；b；c" [--old-terms "<current>"] [--keep-eval "<tail>"] [--write]\n' +
  '       node tools/zotero-remark.mjs --item <key> --terms "a；b；c" --create [--write]'

function parseArgs(argv) {
  const options = { key: '', terms: null, oldTerms: '', keepEval: '', create: false, write: false }
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (flag === '--write' || flag === '--create') {
      if (flag === '--write') options.write = true
      else options.create = true
      continue
    }
    if (!['--item', '--terms', '--old-terms', '--keep-eval'].includes(flag)) {
      throw new UsageError(`unrecognised argument '${flag}'`)
    }
    const next = argv[index + 1]
    if (next === undefined) throw new UsageError(`${flag} needs a value`)
    if (flag === '--item') options.key = next
    if (flag === '--terms') options.terms = next
    if (flag === '--old-terms') options.oldTerms = next
    if (flag === '--keep-eval') options.keepEval = next
    index += 1
  }
  if (!options.key) throw new UsageError('pass --item <key>')
  if (options.write && options.terms === null) throw new UsageError('--write needs --terms: a read is never a write')
  return options
}

/** The labelled read-only view of one record's remark line and the lines this tool leaves alone. */
function printState(data, key) {
  const { lines } = splitLines(data.extra ?? '')
  const remark = lines.find((line) => REMARK_LINE.test(line))
  console.log(`item       : ${key}  [${data.itemType}]  "${data.title ?? ''}"`)
  if (remark === undefined) {
    console.log('remark     : (none - this record has no remark line in its extra field)')
    if ((data.extra ?? '').trim() !== '') {
      console.log('other      : the extra field holds these lines, which a write would leave alone')
      for (const line of lines.filter((entry) => entry.trim() !== '')) console.log(`             ${line}`)
    }
    return
  }
  const label = REMARK_LINE.exec(remark)[0]
  const value = remark.slice(label.length)
  const { prefix, body } = splitRemarkValue(value)
  console.log(`remark     : ${value}`)
  console.log(`prefix     : ${prefix === '' ? '(none)' : prefix}`)
  console.log(`body       : ${body === '' ? '(empty)' : body}`)
  console.log(`phrases    : ${phraseCount(splitTerms(body).length)} when split on the separator (a shape check only)`)
  const rate = lines.find((line) => /^[ \t]*rate[ \t]*:/i.test(line))
  const others = lines.filter((line) => line !== remark && line !== rate && line.trim() !== '')
  for (const line of others) console.log(`other      : ${line}`)
  if (rate !== undefined) console.log(`rate       : ${rate.replace(/^[ \t]*rate[ \t]*:/i, '').trim()}`)
  console.log('nothing    : no boundary is inferred here - --old-terms and --keep-eval must add up to body exactly')
}

async function runRead(options) {
  const gate = createWriteGate({ appName: APP_NAME })
  const info = await gate.open()
  const data = await readItem(options.key)
  console.log(`library    : Zotero ${info.version} · server ${info.id}`)
  printState(data, options.key)
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.terms === null) {
    await runRead(options)
    return
  }
  const terms = checkTermShape(options.terms)
  const gate = createWriteGate({ appName: APP_NAME })
  const info = await gate.open()
  const before = await readItem(options.key)
  const { lines } = splitLines(before.extra ?? '')
  const remark = lines.find((line) => REMARK_LINE.test(line))

  let nextValue
  let nextExtra
  if (remark === undefined) {
    nextValue = formatTerms(terms)
    nextExtra = planExtra({ extra: before.extra ?? '', nextValue, create: options.create }).extra
  } else {
    const label = REMARK_LINE.exec(remark)[0]
    const value = remark.slice(label.length)
    nextValue = planRewrite({ value, terms, oldTerms: options.oldTerms, keepEval: options.keepEval }).next
    nextExtra = planExtra({ extra: before.extra ?? '', nextValue }).extra
  }

  console.log(`library    : Zotero ${info.version} · server ${info.id}`)
  console.log(`item       : ${options.key}  [${before.itemType}]  "${before.title ?? ''}"`)
  console.log(`version    : ${before.version}`)
  if (remark === undefined) console.log('remark     : (none)  ->  a new line, placed first in extra')
  else console.log(`remark     : ${remark.replace(REMARK_LINE, '').trim()}`)
  console.log(`     ->    : ${nextValue}`)

  if (nextExtra === (before.extra ?? '')) {
    console.log('\nNo change: the line already reads exactly as asked. Nothing to write.')
    return
  }
  console.log(`body       : ${JSON.stringify({ extra: nextExtra })}`)
  console.log(`write      : PATCH /api/users/0/items/${options.key}  If-Unmodified-Since-Version: ${before.version}`)
  if (!options.write) {
    console.log('\nDRY RUN - nothing was written. Re-run with --write; the reference manager will then')
    console.log('ask you to Allow the write, and is asked once.')
    return
  }

  const result = await patchItem({
    gate,
    key: options.key,
    patch: { extra: nextExtra },
    apply: true,
    beforeWrite: () => {
      writeAttempted = true
    },
  })
  if (result.conflict) {
    console.error(`\nCONFLICT: item ${options.key} changed since this plan was read. Nothing was written.`)
    console.error(`  version : ${result.before?.version}`)
    console.error(`  extra   : ${JSON.stringify(result.before?.extra ?? '')}`)
    console.error('Read the record again and rebuild the plan from what it says now.')
    process.exitCode = 1
    return
  }
  if (!result.applied) {
    if (mayHaveLanded(result.status)) {
      const after = await readItem(options.key).catch(() => null)
      const found = after === null
        ? 'The re-read that would settle it failed as well.'
        : String(after.extra ?? '') === nextExtra
          ? 'A re-read shows the line already as sent: the write landed.'
          : 'A re-read does not show the line as sent; the library may still have applied it.'
      process.exitCode = reportUnconfirmed({
        key: options.key,
        what: `the remark rewrite on ${options.key} answered HTTP ${result.status}${result.detail ? ` (${result.detail.slice(0, 200)})` : ''}`,
        found,
      })
      return
    }
    console.error(`\nThe library refused the write (HTTP ${result.status}): ${result.detail}`)
    process.exitCode = 1
    return
  }
  const after = result.after
  if (String(after?.extra ?? '') !== nextExtra) {
    process.exitCode = reportUnconfirmed({
      key: options.key,
      what: `the library accepted the remark rewrite and the record does not read back as sent (version ${after?.version})`,
      found: 'Nothing further was changed. Read the extra field before deciding: a line the owner wrote may be what is there.',
    })
    return
  }
  console.log(`\nOK - ${options.key} now reads back with the new line, and every other line of extra is unchanged (version ${after?.version}).`)
}

// NOT `await main()`: this module exports pure functions its self-test imports, and a pending
// top-level await would leave an importable module mid-evaluation.
const isEntryPoint =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) {
  main().catch((error) => {
    const code = reportFailure(error, { usage: USAGE })
    if (code === 1 && writeAttempted && !error.refused) {
      process.exitCode = reportUnconfirmed({
        key: '',
        what: 'the change was sent and then the connection failed: OUTCOME UNKNOWN',
        found: 'The PATCH may have been applied. Read the record before trying again.',
      })
      return
    }
    process.exitCode = code
  })
}
