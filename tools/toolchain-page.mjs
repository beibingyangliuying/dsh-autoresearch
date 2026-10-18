#!/usr/bin/env node
// Generate the toolchain capability-and-boundary page, and hold every line of it to a source.
//
// WHY THIS FILE EXISTS
//
// Three literature rounds each spent part of a session rediscovering what these helpers refuse: the
// boundaries lived in source comments and in nothing a round reads before it acts. One round put it
// plainly - "the interface boundary is only in the source comments, you find it by walking into it".
//
// The page this file generates is the answer, and its value rests on one property: EVERY LINE CITES
// SOMETHING A CHECK CAN LOOK AT. `tools/toolchain-selftest.mjs` fails when a citation is gone and when
// the page on disk is not what this file renders, so a claim cannot outlive the code it describes.
//
// WHAT THIS DOES NOT PROVE, stated rather than hidden: a citation proves the source it names still
// exists, not that the sentence is a fair summary of it. The sentence is authored; the grounding is
// mechanical. A page like this is worth having only if that limit is visible on its own face.
//
// Usage:
//   node tools/toolchain-page.mjs --check     # report drift or a missing citation; write nothing
//   node tools/toolchain-page.mjs --write     # regenerate the page
// Exit codes: 0 current | 1 stale or a citation is gone | 2 usage.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)))

/** Where the generated page lives, relative to the repository root. */
export const PAGE_PATH = 'docs/04_toolchain.md'

/** A citation: a file that must exist, and literals that must appear in it. */
const cite = (file, ...must) => ({ file, must })

/**
 * Facts about the CHANNEL rather than about one helper: what the library does, and what this preset
 * therefore cannot do. These are the ones a round pays for by not knowing them.
 */
export const FACTS = [
  {
    says: '读不需要授权；写要参考管理器**当场**给一次授权，`Always Allow` 的长期 key 按 server id 存在本机。',
    cites: [cite('tools/zotero-local-api.mjs', 'createWriteGate'), cite('README.md', 'standing grant')],
  },
  {
    says: '写成功不只是 200：**204 无 body 也算成功**，把 200 当唯一成功会把已完成的写报成"被拒绝"。',
    cites: [cite('tools/zotero-local-api.mjs', 'isWriteAccepted')],
  },
  {
    says: '写后回读按**读者可见文本**比，不按字节：应用会给它碰过的笔记套 `<div data-schema-version>`，并吃掉隐形注释。',
    cites: [cite('tools/zotero-local-api.mjs', 'visibleText'), cite('tools/zotero-section-note.mjs', 'isApplicationWrapped')],
  },
  {
    says: '**tag 活得过**应用对正文的重写（2026-10-18 真笔记实测）；**隐形 marker 活不过**。所以跨轮的身份标记用 tag。',
    cites: [cite('docs/01_decisions.md', 'tag 活过应用改写'), cite('tools/zotero-section-note.mjs', "RETIRE_TAG = '/retired'")],
  },
  {
    says: '记录的 `version` 可能是 0：那种记录上"别人改过没有"的守卫是**空转**，不是通过。',
    cites: [cite('docs/01_decisions.md', '39.3')],
  },
  {
    says: '回收站端点**静默忽略 `itemType`**：`?itemType=note` 会答 `Total-Results: 0`，而回收站里可能躺着几百条 note。',
    cites: [cite('README.md', 'ignores the type filter silently')],
  },
  {
    says: '本地 API 的 `DELETE` 即擦除、进不了回收站；进回收站、可恢复的是**应用里**删除的那条路。',
    cites: [cite('protocol.md', 'cannot put an item in the trash'), cite('tools/zotero-section-note.mjs', 'performs no deletion')],
  },
  {
    says: '抽取出来的数学**不可靠**（字体编码坏了：`⩾` 变 `P`、`1⁄4` 变字形），只有把页面渲成图、**当图像读**能救。',
    cites: [cite('docs/02_coverage.md', '字体编码坏掉的数学'), cite('tools/zotero-pdf.mjs', '(4) the page as an image')],
  },
  {
    says: '单次工具结果超过 **8,192 字符**会被裁剪器掐掉中间（留头 4,096 + 尾 1,024）⇒ 长文本必须切片读。',
    cites: [cite('docs/02_coverage.md', '8,192')],
  },
  {
    says: '本预设**不做 OCR**，也不带第二个运行时：两个阅读引擎只经 `zotero-pdf.mjs` 使用，不读附件的请求不为它们付费。',
    cites: [cite('docs/02_coverage.md', '不做 OCR'), cite('README.md', 'Eight helper programs')],
  },
  {
    says: 'helper 的路径必须从 agent 的工作目录可解析：技能体里是 `{{presetTools}}`，**工作区文件不许写解析后的绝对路径**。',
    cites: [cite('protocol.md', 'INV-HELPER-1')],
  },
]

/**
 * One block per helper: what it does, what it refuses, and what to do when the refusal lands.
 *
 * `refuses` is the load-bearing list - a refusal is the part nobody reads until it fires.
 */
export const HELPERS = [
  {
    name: 'zotero-read.mjs',
    role: '读：检索 / 一条记录 / 笔记正文 / 附件文本切片 / 分类树 / 标签',
    can: [
      '`--search`（默认搜摘要＋笔记＋附件全文）· `--item`（笔记会打印正文**和它的 `tags :`**）',
      '`--fulltext --offset/--limit/--grep`：按片读附件文本，上一片会打印 `next --offset`',
      '`--collections` / `--collection <key>` / `--tags`',
    ],
    refuses: ['一次只允许一种模式', '没有索引的附件：它报的是**库自己的状态**，不是"这篇没有正文"'],
    when: [
      '读到空文本 → 换 `zotero-pdf.mjs --extract`（文件自己的文字层）；输出头里的 `rung` 行会说明这一级是谁',
      '文本很长 → 按 `--offset` 接着读，别让裁剪器替你做决定',
    ],
    cites: [cite('tools/zotero-read.mjs', "rung   : (1) the library's indexed text", 'nextOffset'), cite('tools/zotero-pdf.mjs', '(2) the file')],
  },
  {
    name: 'zotero-pdf.mjs',
    role: '读附件本身（梯级 2/3/4）：文件文字层 · 论文自带目录 · 页面渲成图',
    can: [
      '`--outline`：论文**自带**的目录，条目映射成写入侧认的序号（`I Introduction` → `§1`）',
      '`--extract`：文件自己的文字层，补"库里没索引"的洞',
      '`--render --pages 3-5 --scale 1.5`：把页面渲成 PNG，默认落到 `.section-notes/<recordKey>/pages/`',
    ],
    refuses: [
      '一次一级：`one rung per invocation`',
      '`--render` 不给 `--pages`（一轮不许把整篇渲出来）',
      '页号超出文件页数；`--pages` 不是页号或区间',
      '文件没有自带目录时，rung 3 **明说空手**并 exit 1',
    ],
    when: ['公式读出来是乱码 → `--render` 后用 `read_image` **当图像读**（不许当文本引用）', '没索引 → `--extract`，注意它和索引读的是**同一张编码表**，修不了字体编码的洞'],
    cites: [cite('tools/zotero-pdf.mjs', 'one rung per invocation', '--render needs --pages', 'no table of contents, so rung (3) has nothing to give')],
  },
  {
    name: 'zotero-note.mjs',
    role: '在记录上留一条 digest（读过的记录）',
    can: ['追加到带 `DIGEST_MARKER` 的那条笔记；没有就新建一条'],
    refuses: ['内容该笔记已经读过 → `ALREADY RECORDED`，**什么都不写**（exit 0）', '没有 marker 的笔记**从不触碰**'],
    when: ['一轮被重跑时，它不会把同一句话写第二遍——所以重跑是安全的'],
    cites: [cite('tools/zotero-note.mjs', 'DIGEST_MARKER', 'ALREADY RECORDED', 'never touched')],
  },
  {
    name: 'zotero-section-note.mjs',
    role: '逐节解释笔记：覆盖计划 · 写 · 归退 · 机械修',
    can: [
      '`--plan` / `--plan --json`：这条记录覆盖了哪些节、哪些笔记读不出、哪些是墓碑',
      '写一条节的解释笔记（干跑默认，写后回读）',
      '`--retire --note <key> --reason "<why>"`：把讲错的笔记变成**墓碑**，那一节重新可写，`--undo` 可逆',
      '`--replaces <旧key>`：新笔记带走"我取代了谁"的指针',
      '`--tidy`：只做 4 类机械修复，修不了的跨度报出来',
    ],
    refuses: [
      '已被覆盖的节（三种形态，`REFUSED: §…`）——**不要绕过它**',
      '点号序号 `--section 3.1`：**读得到、写不了**（计数单位是顶层节）',
      '不是节笔记的笔记：**从不修改**',
      '`--replaces` 的对象没退休，或它讲的是另一节',
    ],
    when: [
      '要改正一条已有笔记：**先 `--retire`，再 `--replaces`**——不删、不重写，正文一个字不动',
      '公式分隔符坏了 → `--tidy`；它猜不出的，交给人或写新笔记',
    ],
    cites: [
      cite('tools/zotero-section-note.mjs', "RETIRE_TAG = '/retired'", "REPLACES_TAG_PREFIX = '/replaces-'", 'REFUSED: §', 'the body is NOT touched', "rewrite wearing a formatter's clothes"),
    ],
  },
  {
    name: 'zotero-edit.mjs',
    role: '改一条记录的字段与标签',
    can: ['白名单字段（`EDITABLE_FIELDS`）与标签（`--add-tag` / `--remove-tag`，写成一个 diff）'],
    refuses: ['结构化字段（`REFUSED_FIELDS`）：creators · itemType · key · version · collections · relations · 两个日期'],
    when: ['要改上面那些：**在应用里改**，工具会说明每条为什么不是一行能表达'],
    cites: [cite('tools/zotero-edit.mjs', 'EDITABLE_FIELDS', 'REFUSED_FIELDS', 'a creator list is structured')],
  },
  {
    name: 'zotero-collection.mjs',
    role: '分类：列出 / 建 / 改名 / 归档 / 移出',
    can: ['`--list` · `--create` · `--rename` · `--assign` · `--assign --remove`'],
    refuses: ['改名是**实测可用**的（2026-10-16），但分类的 `version` 常为 0 ⇒ 那条守卫在多数分类上是空转'],
    when: ['改名被库拒绝时，工具**停下**，不会用"新建一个再搬"来假装成功（那会换 key）'],
    cites: [cite('tools/zotero-collection.mjs', '--rename <collectionKey> --name'), cite('README.md', 'unreliable rather than absent')],
  },
  {
    name: 'zotero-write.mjs',
    role: '新建一条记录（按 arXiv id / DOI）',
    can: ['`--arxiv <id>` / `--doi <doi>`（干跑默认）', '`--selftest`：不写库，只查接缝'],
    refuses: ['库里已有的重复（DOI / archiveID / 标题）→ `REFUSING to create a duplicate`，除非显式 `--force`'],
    when: ['"加一篇"之前先搜一遍：重复条目在库里比缺条目更难收拾'],
    cites: [cite('tools/zotero-write.mjs', 'REFUSING to create a duplicate', '--selftest')],
  },
  {
    name: 'zotero-link-attachments.mjs',
    role: '存储型附件 → 链接附件（增量）',
    can: ['`--target <dir>`（干跑默认）· `--limit N` · `--no-wake`', '会留一条 `WAKE_NOTE_MARKER` 笔记说明它动过什么'],
    refuses: ['**整库迁移不是它**：那是 `zotero-link-snippet.js`，由**属主自己在应用里跑**，不经 API 授权'],
    when: ['要动全库 → 停下来问属主，别用增量工具假装做迁移'],
    cites: [cite('tools/zotero-link-attachments.mjs', 'WAKE_NOTE_MARKER'), cite('README.md', 'A whole-library migration is')],
  },
  {
    name: 'arxiv.mjs',
    role: '预印本索引（不是全文通道）',
    can: ['`--search`（索引查询）· `--id`（按标识读一条）· `--selftest`'],
    refuses: ['只给题录与摘要，**不是全文**', '上游把错误塞在形状正常的 feed 里时，它拒绝把错误当记录打印'],
    when: ['需要正文 → 走参考库那条路（`zotero-read` / `zotero-pdf`），预印本索引给不了'],
    cites: [cite('tools/arxiv.mjs', 'node tools/arxiv.mjs --search', '--selftest'), cite('README.md', 'not full text')],
  },
]

/** Every claim as `{ label, cites }`, so a checker has one flat list to walk. */
export function claimList() {
  return [
    ...FACTS.map((fact) => ({ label: `fact: ${fact.says}`, cites: fact.cites })),
    ...HELPERS.map((helper) => ({ label: `helper: ${helper.name}`, cites: helper.cites })),
  ]
}

/**
 * Citations that no longer hold.
 *
 * @param {Array<{label: string, cites: Array<{file: string, must: string[]}>}>} claims The claims to check.
 * @param {(file: string) => string|undefined} readText Reads a repository-relative file, or undefined.
 * @returns {string[]} One line per gap, empty when every citation holds.
 */
export function citationGaps(claims, readText) {
  const cache = new Map()
  const read = (file) => {
    if (!cache.has(file)) cache.set(file, readText(file))
    return cache.get(file)
  }
  const gaps = []
  for (const claim of claims) {
    for (const citation of claim.cites) {
      const text = read(citation.file)
      if (text === undefined) {
        gaps.push(`${claim.label} -> ${citation.file} does not exist`)
        continue
      }
      for (const needle of citation.must) {
        if (!text.includes(needle)) gaps.push(`${claim.label} -> ${citation.file} no longer contains ${JSON.stringify(needle)}`)
      }
    }
  }
  return gaps
}

const CELL = (citations) => citations.map((citation) => `\`${citation.file}\` · ${citation.must.map((needle) => `\`${needle}\``).join(' · ')}`).join('<br>')
const BULLETS = (lines) => lines.map((line) => `- ${line}`).join('\n')

/** The page, as one string. The only place its shape is decided. */
export function renderPage() {
  const parts = []
  parts.push('# 04 — 工具链的能力与边界')
  parts.push('')
  parts.push('**非规范，且是派生文档。** 契约永远是 [`protocol.md`](../protocol.md)。本页由')
  parts.push('[`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) 生成，只回答一个问题：**手上这件工具现在能做什么、')
  parts.push('明确拒绝什么、撞上了怎么办。**')
  parts.push('')
  parts.push('它的价值全在一个性质上——**每一行都挂着一条能被机械校验的出处**，所以一句声明无法比它描述的代码活得更久：')
  parts.push('')
  parts.push('```powershell')
  parts.push('node tools\\toolchain-page.mjs --check    # 页面是否与生成器一致、每条出处是否还在')
  parts.push('node tools\\toolchain-page.mjs --write    # 重新生成')
  parts.push('node tools\\toolchain-selftest.mjs        # 同一件事，外加负向控制')
  parts.push('```')
  parts.push('')
  parts.push('## 一、先看这几条（不知道它们，会各花掉一轮）')
  parts.push('')
  parts.push('| 事实 | 出处（机械校验） |')
  parts.push('| --- | --- |')
  for (const fact of FACTS) parts.push(`| ${fact.says} | ${CELL(fact.cites)} |`)
  parts.push('')
  parts.push('## 二、每个 helper')
  parts.push('')
  parts.push('### 参考库通道')
  for (const helper of HELPERS.filter((entry) => entry.name.startsWith('zotero-'))) {
    parts.push('')
    parts.push(`#### \`${helper.name}\` — ${helper.role}`)
    parts.push('')
    parts.push('**能做**')
    parts.push('')
    parts.push(BULLETS(helper.can))
    parts.push('')
    parts.push('**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）')
    parts.push('')
    parts.push(BULLETS(helper.refuses))
    parts.push('')
    parts.push('**撞上怎么办**')
    parts.push('')
    parts.push(BULLETS(helper.when))
    parts.push('')
    parts.push(`**出处**：${CELL(helper.cites)}`)
  }
  parts.push('')
  parts.push('### 预印本通道')
  for (const helper of HELPERS.filter((entry) => !entry.name.startsWith('zotero-'))) {
    parts.push('')
    parts.push(`#### \`${helper.name}\` — ${helper.role}`)
    parts.push('')
    parts.push('**能做**')
    parts.push('')
    parts.push(BULLETS(helper.can))
    parts.push('')
    parts.push('**明确拒绝**')
    parts.push('')
    parts.push(BULLETS(helper.refuses))
    parts.push('')
    parts.push('**撞上怎么办**')
    parts.push('')
    parts.push(BULLETS(helper.when))
    parts.push('')
    parts.push(`**出处**：${CELL(helper.cites)}`)
  }
  parts.push('')
  parts.push('## 三、这套校验能证明什么、不能证明什么')
  parts.push('')
  parts.push('- **能证明**：这一行所依据的那段源码/契约/实测记录**还在**。重命名、删常量、改消息，都会让')
  parts.push('  [`tools/toolchain-selftest.mjs`](../tools/toolchain-selftest.mjs) 变红，而不是让一句话悄悄过期。')
  parts.push('- **不能证明**：这句话是对那段源码的**公平概括**。概括是人写的，机械的只是"它站的那块地在不在"。')
  parts.push('  这是刻意的分工：能机械化的部分窄到可信，判断留在读得懂两边的人手上。')
  parts.push('')
  return `${parts.join('\n')}\n`
}

/**
 * Whether the page on disk is what this generator renders.
 *
 * A value rather than a boolean, because a missing page and an outdated one need different sentences -
 * and because a check that cannot say which of the two it found gets read as "something is wrong" and
 * then ignored.
 *
 * @param {string} rendered What `renderPage()` produces.
 * @param {string|undefined} onDisk The file as read, or undefined when there is no such file.
 * @returns {'current'|'stale'|'missing'} The state.
 */
export function pageStatus(rendered, onDisk) {
  if (onDisk === undefined) return 'missing'
  return onDisk === rendered ? 'current' : 'stale'
}

const USAGE = 'usage: node tools/toolchain-page.mjs --check | --write'

function readRepoFile(file) {
  try {
    return readFileSync(resolve(ROOT, file), 'utf8')
  } catch {
    return undefined
  }
}

function main() {
  const mode = process.argv[2]
  if (mode !== '--check' && mode !== '--write') {
    console.error(USAGE)
    process.exit(2)
  }
  const gaps = citationGaps(claimList(), readRepoFile)
  const rendered = renderPage()
  const status = pageStatus(rendered, readRepoFile(PAGE_PATH))
  if (gaps.length) {
    console.error(`citation gaps (${gaps.length}):`)
    for (const gap of gaps) console.error(`  ${gap}`)
  }
  if (status === 'stale' && mode === '--check') {
    console.error(`${PAGE_PATH} is not what this generator renders — run: node tools/toolchain-page.mjs --write`)
  }
  if (status === 'missing' && mode === '--check') {
    console.error(`${PAGE_PATH} does not exist — run: node tools/toolchain-page.mjs --write`)
  }
  if (mode === '--write') {
    if (status === 'current') {
      console.log(`${PAGE_PATH} already current`)
    } else {
      writeFileSync(resolve(ROOT, PAGE_PATH), rendered)
      console.log(`wrote ${PAGE_PATH} (${rendered.length} characters)`)
    }
  }
  if (gaps.length) process.exit(1)
  if (mode === '--check' && status !== 'current') process.exit(1)
  console.log(mode === '--check' ? `${PAGE_PATH} is current and every citation holds (${claimList().length} claims)` : 'done')
}

const isEntryPoint = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isEntryPoint) main()
