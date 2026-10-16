// Unit self-test for the section-note tool, runnable without a library.
//
// Usage: node tools/zotero-section-note-selftest.mjs
//
// Three things are load-bearing, and every one of them is tested with its negative control:
//   1. a section note that already exists is FOUND - including the notes in this library that were
//      written before the tool existed and carry no marker, whose claim is read from their opening
//      phrase. Missing one creates a duplicate note on someone else's reading.
//   2. the mechanical math repair converts only what it can prove, and says what it left alone.
//      A repair that guesses at a broken formula is a rewrite wearing a formatter's clothes.
//   3. it never produces `$` inside `$$`, which is not valid MathJax and would render as prose.
// Nothing here touches a library: every function under test is pure.
import { readFileSync } from 'node:fs'
import {
  composeSectionNote,
  displayMathRegions,
  looksLikeHtml,
  normalizeMath,
  normalizeSectionToken,
  readSectionMarker,
  sectionClaim,
  sectionMarker,
  topLevelSpans,
} from './zotero-section-note.mjs'

let failures = 0
const check = (condition, label, detail = '') => {
  console.log(`  ${condition ? 'OK  ' : 'FAIL'} ${label}${detail ? `  ${detail}` : ''}`)
  if (!condition) failures += 1
}

const same = (actual, expected, label) => check(actual === expected, label, actual === expected ? '' : `got ${JSON.stringify(actual)}`)

console.log('section-note self-test')

// --- the ordinal -------------------------------------------------------------------------------

console.log('\n[1] the ordinal a note claims')
same(normalizeSectionToken('2'), '2', 'digits pass through')
same(normalizeSectionToken('二'), '2', 'a Chinese numeral becomes digits')
same(normalizeSectionToken('十'), '10', 'ten is ten')
same(normalizeSectionToken('十二'), '12', 'twelve is twelve')
same(normalizeSectionToken('第三节'), '3', 'a wrapped phrase is unwrapped')
same(normalizeSectionToken('文章第7节'), '7', 'the article prefix is unwrapped too')
same(normalizeSectionToken('Methodology'), '', 'no ordinal means no token - negative control')
same(normalizeSectionToken(''), '', 'empty means empty')

const marked = composeSectionNote('2', '<p>解释</p>')
check(marked.startsWith(sectionMarker('2')), 'a composed note opens with its marker')
same(readSectionMarker(marked), '2', 'the marker reads back as the ordinal')
same(readSectionMarker('<p>文章第2节标题是 “X”</p>'), '', 'an unmarked note has no marker')

console.log('\n[2] what a note says it is about')
same(sectionClaim('<p>文章第2节标题是 “X”，即…</p>').token, '2', 'the opening phrase is read (文章第2节标题是)')
same(sectionClaim('<p>第三节题为 Methodology（方法论）…</p>').token, '3', 'the shortened opening phrase is read (第三节题为)')
same(sectionClaim('<p>第二节标题是 GSDF…</p>').token, '2', 'the other shortened form is read (第二节标题是)')
same(sectionClaim(marked).by, 'marker', 'a marker outranks the opening phrase')
same(sectionClaim('<p>这一节讨论的是…</p>').token, '', 'a note that names no section claims none')
same(
  sectionClaim('<p>这一节的内容与第2节相关，但本节讲的是算法。</p>').token,
  '',
  'a section number mentioned later is a cross-reference, not a claim - negative control',
)
same(sectionClaim('<p>文章第3节给出的因子…</p>').by, 'opening', 'the opening phrase is attributed to the opening')

console.log('\n[3] the body must be HTML')
check(looksLikeHtml('<p>解释</p>'), 'a paragraph is HTML')
check(looksLikeHtml('<div data-schema-version="9"><ul><li>x</li></ul></div>'), 'a Zotero note shape is HTML')
check(!looksLikeHtml('## Markdown heading\n\n- a bullet'), 'Markdown is refused - the library stores HTML')
check(!looksLikeHtml('plain prose'), 'plain prose is refused')

// --- the mechanical repair ----------------------------------------------------------------------

console.log('\n[4] the mechanical math repair, and its refusals')
const bracket = normalizeMath('<p>[ \\alpha = a P^L_{ij} + b Q^L_{ij} ]</p>')
same(bracket.html, '<p>$$ \\alpha = a P^L_{ij} + b Q^L_{ij} $$</p>', 'a bracket span with LaTeX becomes display math')
same(bracket.applied.filter((r) => r.rule === 'bracket-to-display-math')[0]?.count, 1, 'the rule is counted once')
same(normalizeMath('<p>[ \\alpha = \\beta ]</p>').applied.length, 1, 'one rule applied, one entry')

const nested = normalizeMath('<p>[ [\\Delta P; \\Delta Q] = M [\\Delta \\theta; \\Delta V] ]</p>')
same(
  nested.html,
  '<p>$$ [\\Delta P; \\Delta Q] = M [\\Delta \\theta; \\Delta V] $$</p>',
  'nested brackets are one display span, not two',
)

const emphasis = normalizeMath("<p>P_i = -\\sum B'<em>{ij}\\theta_j + \\sum</em>{j\\in S_B} G_{ij}V_j</p>")
check(emphasis.html.includes("B'_{ij}"), 'the underscore a Markdown emphasis ate is restored')
check(!emphasis.html.includes('<em>'), 'no emphasis tag is left behind')
same(
  normalizeMath('<p>这是一段<em>普通的强调</em>文字。</p>').html,
  '<p>这是一段<em>普通的强调</em>文字。</p>',
  'prose emphasis is left alone - negative control',
)

const citation = normalizeMath('<p>详见文献 [1,2] 与 [3]。</p>')
same(citation.html, '<p>详见文献 [1,2] 与 [3]。</p>', 'a citation bracket is not math - negative control')
same(citation.applied.length, 0, 'nothing was applied to a citation')

const unmatched = normalizeMath('<p>[ \\min \\sum_{g\\in S_G} f_g(p_g^G)</p>')
same(unmatched.html, '<p>[ \\min \\sum_{g\\in S_G} f_g(p_g^G)</p>', 'an unclosed bracket is never closed by guesswork')
check(unmatched.leftAlone.length === 1, 'the node it could not balance is reported as left alone', `leftAlone=${unmatched.leftAlone.length}`)
same(
  unmatched.applied.length,
  0,
  'and nothing inside that node is converted either - the parentheses are still prose parens',
)

const inline = normalizeMath('<p>其中 (\\theta_i - \\theta_j) 是相角差。</p>')
same(inline.html, '<p>其中 ($\\theta_i - \\theta_j$) 是相角差。</p>', 'a parenthesised LaTeX span becomes inline math')
same(normalizeMath('<p>见公式 (40) 与式 (41)。</p>').html, '<p>见公式 (40) 与式 (41)。</p>', 'an equation number is not math')
same(normalizeMath('<p>矩阵 (M^*) 的逆。</p>').html, '<p>矩阵 ($M^*$) 的逆。</p>', 'a bare sub/superscript counts as markup')
same(normalizeMath('<p>对一个 (A) 求逆。</p>').html, '<p>对一个 (A) 求逆。</p>', 'a lone letter is not enough - negative control')

// The parentheses stay outside the delimiters, because "(S^max)^2" and "$S^max$^2" differ.
const power = normalizeMath('<p>[ (S_{mn}^{\\max,c})^2 \\le 1 ]</p>')
same(power.html, '<p>$$ (S_{mn}^{\\max,c})^2 \\le 1 $$</p>', 'inside display math, parens stay parens')
check(
  normalizeMath('<p>取 (S_{mn}^{\\max})^2 为限值。</p>').html === '<p>取 ($S_{mn}^{\\max}$)^2 为限值。</p>',
  'a superscript applied to a parenthesised term keeps its parentheses',
)
check(!power.html.replace(/\$\$/g, '').includes('$'), 'never `$` inside `$$` - it is not valid MathJax')
check(power.changed.length === 1, 'a conversion is reported, so the heuristic can be eyeballed', `changed=${power.changed.length}`)
same(normalizeMath('<p>见 [Smith 2019] 与 [12] 的讨论。</p>').skipped, 2, '"nothing to do" and "a span I declined" are counted apart')

const alreadyDelimited = normalizeMath('<p>见 $x_i$ 与 (A_i) 的关系。</p>')
same(alreadyDelimited.html, '<p>见 $x_i$ 与 (A_i) 的关系。</p>', 'a node already using $ is not this tool\'s business')

const acrossTags = normalizeMath('<p>[ \\min \\sum_{g</p><p>} f_g ]</p>')
same(acrossTags.html, '<p>[ \\min \\sum_{g</p><p>} f_g ]</p>', 'a span split across paragraphs is not converted')

const pair = topLevelSpans('[a [b] c]', '[', ']')
same(pair.length, 1, 'only the outermost bracket pair is a span')
same(pair[0].inner, 'a [b] c', 'the inner text keeps the nested pair')
same(displayMathRegions('$$a$$ and $$b$$').length, 2, 'two display regions are found')
same(displayMathRegions('no math here').length, 0, 'no delimiter means no region')

// --- the file itself ---------------------------------------------------------------------------

console.log('\n[5] the tool reads its own documentation the way the disciplines will')
const source = readFileSync(new URL('./zotero-section-note.mjs', import.meta.url), 'utf8')
check(source.includes('REFUSED: §'), 'the refusal names the section it refuses')
check(!/require\(/.test(source), 'the tool is ESM, like the rest of the suite')

console.log(`\n${failures === 0 ? 'PASS' : `FAIL (${failures})`}`)
process.exit(failures === 0 ? 0 : 1)
