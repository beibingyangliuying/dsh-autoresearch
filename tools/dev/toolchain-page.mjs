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
// SOMETHING A CHECK CAN LOOK AT. `tools/tests/toolchain-selftest.mjs` fails when a citation is gone and when
// the page on disk is not what this file renders, so a claim cannot outlive the code it describes.
//
// WHAT THIS DOES NOT PROVE, stated rather than hidden: a citation proves the source it names still
// exists, not that the sentence is a fair summary of it. The sentence is authored; the grounding is
// mechanical. A page like this is worth having only if that limit is visible on its own face.
//
// Usage:
//   node tools/dev/toolchain-page.mjs --check     # report drift or a missing citation; write nothing
//   node tools/dev/toolchain-page.mjs --write     # regenerate the page
// Exit codes: 0 current | 1 stale or a citation is gone | 2 usage.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))

/** Where the generated page lives, relative to the repository root. */
export const PAGE_PATH = 'docs/toolchain.md'

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
    cites: [cite('docs/decisions.md', 'tag 活过应用改写'), cite('tools/zotero-section-note.mjs', "RETIRE_TAG = '/retired'")],
  },
  {
    says: '记录的 `version` 可能是 0：那种记录上"别人改过没有"的守卫是**空转**，不是通过。',
    cites: [cite('docs/decisions.md', '39.3')],
  },
  {
    says: '回收站端点**静默忽略 `itemType`**：`?itemType=note` 会答 `Total-Results: 0`，而回收站里可能躺着几百条 note。',
    cites: [cite('README.md', 'ignores the type filter silently')],
  },
  {
    says: '本地 API 的 `DELETE` 即擦除、进不了回收站；进回收站、可恢复的是**应用里**删除的那条路。',
    cites: [cite('protocol.md', 'cannot put an item in the trash'), cite('tools/zotero-section-note.mjs', 'DELETION IS PERMANENT')],
  },
  {
    says: '抽取出来的数学**不可靠**（字体编码坏了：`⩾` 变 `P`、`1⁄4` 变字形），只有把页面渲成图、**当图像读**能救。',
    cites: [cite('docs/coverage.md', '字体编码坏掉的数学'), cite('tools/zotero-pdf.mjs', '(4) the page as an image')],
  },
  {
    says: '结果超过 **8,192 字符**会被重写成头 4,096 + 尾 1,024，但那发生在**压缩**时、不是到达时；单条命令的输出另有一道上限，它属于**所挂的 shell 工具**（`dsh-tool-pwsh` 在 DSH 0.2.1-rc.2 上实测每流保留**最后 64,000 字节**，超过丢**开头**并给 spill 文件）⇒ 长文本切片读（12,000），被裁的片按 offset 重取。',
    cites: [cite('docs/coverage.md', '8,192'), cite('docs/coverage.md', '64,000')],
  },
  {
    says: '本预设**不做 OCR**，也不带第二个运行时：两个阅读引擎只经 `zotero-pdf.mjs` 使用，不读附件的请求不为它们付费。',
    cites: [cite('docs/coverage.md', '不做 OCR'), cite('README.md', 'Nine helper programs')],
  },
  {
    says: 'helper 的路径必须从 agent 的工作目录可解析：技能体里是 `{{presetTools}}`，**工作区文件不许写解析后的绝对路径**。',
    cites: [cite('protocol.md', 'INV-HELPER-1')],
  },
  {
    says: '失败只有**一种形状**：说清发生了什么；下一步唯一时给一行 `fix`，并且只在命令**能照抄执行**时才给 `try`。不知道该怎么做时**不写建议**——猜出来的建议会把"重试"变成"漂移"。',
    cites: [
      cite('tools/refusal.mjs', 'export function refusalLines'),
      cite('README.md', 'What a failure says'),
      cite('protocol.md', 'INV-FAIL-1'),
    ],
  },
  {
    says: '**同一个作品在不同书目源上的引用数不同**（43,412 vs 46,513，2026-10-19 分钟级相邻实测）⇒ 引用数必须带**来源与检索日期**。',
    cites: [
      cite('protocol.md', 'quoted with the source that produced it'),
      cite('tools/metadata.mjs', 'cited_by_count', 'is-referenced-by-count'),
    ],
  },
  {
    says: '**答回来的 DOI 可能不是问的那个**（实测：arXiv DOI 被 OpenAlex 答成该作品的另一个 DOI）⇒ 两个都要报，不许只报标题。',
    cites: [cite('tools/metadata.mjs', 'DIFFERENT from the DOI asked for'), cite('README.md', 'can answer a different DOI')],
  },
  {
    says: '`mailto` 在 OpenAlex **不是配额杠杆**（它自己的 notice 明说该参数不提高共享日预算），Crossref 仍要它。',
    cites: [cite('tools/metadata.mjs', "mailto parameter doesn't raise this limit")],
  },
]

/**
 * One block per helper: what it does, what it refuses, and what to do when the refusal lands.
 *
 * `refuses` is the load-bearing list - a refusal is the part nobody reads until it fires.
 */
export const HELPERS = [
  {
    name: 'zotero-ensure.mjs',
    role: '让库答话，或说清为什么它不会答',
    can: [
      '探测 `127.0.0.1:23119`；没人应答且进程不在 → 启动应用，等它答话（`--wait 30`，默认 30 秒，500 ms 一轮）',
      '`--dry-run`：只打印将执行的命令与解析到的路径，**不启动**',
      '四态各自附一行原因：`already answering` · `started` · `not answering`（含 `fix`）· `cannot start`（含 `checked` 清单）',
    ],
    refuses: [
      '`ZOTERO_LOCAL_API` 指了别的地址时**绝不启动**：那条缝意味着桩库或另一个实例，测试以为在打桩却惊动了真应用是它唯一不能有的失效',
      '`ZOTERO_EXE=off` 只探测；找不到可执行时报 `cannot start` 并列出查过的地方（注册表 → 标准路径 → PATH）',
      '不写偏好、不杀进程、不重启；应用是单实例，重复调用只会把窗口提到前面',
    ],
    when: [
      '第一次碰参考库之前**先跑它**；exit 1 ⇒ 库不可用，说清并**停下**，不换一条路读（数据库文件、按路径挑附件）',
      '其他 helper 报 `the reference library is not answering` 时，它给出的就是这条命令',
    ],
    cites: [cite('tools/zotero-ensure.mjs', 'ZOTERO_LOCAL_API', 'ZOTERO_EXE=off', 'already answering', 'cannot start')],
  },
  {
    name: 'zotero-read.mjs',
    role: '读：检索（含分面与排序）/ 一条记录 / 笔记正文 / 段落检索 / 附件文本切片 / 附件定位 / 分类 / 结构 / 变更 / 库内查重',
    can: [
      '`--search`（默认搜摘要＋笔记＋附件全文）· `--sort` / `--direction` / `--item-type` / `--trash` / `--library user:0|group:<id>`',
      '`--item`：题录块（venue/卷期页/publisher/repository 等）＋笔记正文按**可读文本**印，`--json` 保留原始 HTML 与题录字段',
      '`--item` 还把业主自己写在 `extra` 里的行按行印出（`remark:` / `rate:` / `titleTranslation:` 等）：这不是题录，是**库主自己的批注**；超过 12 行才印标记，`--json` 给整字段',
      '`--item <noteKey> --headings`：笔记自己的 `h1`-`h6` 清单（没有标题就退到 `p`），每条带**字符 offset 与该节长度**，`--offset N --limit M` 直接读那一节；`--grep TERM` 读提到该词的段落（此前 `--grep` 只对 `--fulltext` 生效，在笔记上是**静默忽略**）；两者用在记录上会**响亮拒绝**并点名该用哪条命令',
      '`--json` 不带子笔记的正文：孩子的 body 只报 `noteCharacters`，要正文就 `--item <noteKey> --json`；`--json` 时身份行改走 stderr，stdout 是可直接解析的 JSON',
      '`--collection <key>` 默认只列**记录**：`--limit` 按记录计数，笔记/附件计数后隐藏（`56 row(s) · 12 record(s) · 44 note/attachment hidden`），`--all-rows` 才逐个列成员',
      '`--retrieve <key> --query "<terms>" [--passages N] [--sources abstract,notes,fulltext]`：BM25 排段落，每条带 sourceRef/offset/score；缺的源进 `sourcesSkipped`',
      '`--locate <key>`：最佳附件是本地 path（并报 exists）还是 web URL',
      '`--changes [--since N]`：基线版本或增量 diff；`--item-types` / `--item-fields <type>` / `--saved-searches`',
      '`--find-doi <doi>`：按 DOI 反查本库，返回 key/ref',
      '`--fulltext --offset/--limit/--grep`：按片读附件文本，上一片会打印 `next --offset`；`--collection <key> --screen` 把整个分类读满',
    ],
    refuses: [
      '一次只允许一种模式',
      '没有索引的附件：404 现在给出 `zotero-pdf --extract` 的可执行命令，而不是只说"重开应用"',
      '批注 reader **不做**：Zotero 把批注挂在 PDF 附件下，本工具只列直接 children；需要时再补',
      '`--library` 只接受 `user:0` 或 `group:<id>`，不猜别人的 user id',
    ],
    when: [
      '要写一条可定位引用 → `--item` 看 venue/卷期页；要引原文 → `--retrieve` 或 `--fulltext --grep`',
      '读到空文本 → 换 `zotero-pdf.mjs --extract`（文件自己的文字层）；输出头里的 `rung` 行会说明这一级是谁',
      '问"这本书/这篇还在我库里吗" → `--find-doi`，不要用标题猜',
      '问"上次之后库里多了什么" → 先 `--changes` 记下 cursor，下一轮 `--changes --since <version>`',
      '要读一条长笔记的某一节 → 先 `--headings` 拿 offset 与长度，再 `--offset/--limit`；整篇读是最后一档（一篇 9,413 字的节笔记有 27 个标题）',
      '问"这个分类里有哪些论文" → `--collection <key>`（默认只列记录）；要连笔记一起看才加 `--all-rows`',
    ],
    cites: [
      cite('tools/zotero-read.mjs', '--retrieve', '--changes', '--find-doi', 'citationLines', 'tokenize', 'extraLines'),
      cite('tools/zotero-read.mjs', 'noteHeadings', 'printTermPassages', 'itemForJson', 'LISTING_SCAN'),
      cite('tools/zotero-local-api.mjs', 'changedItemsSince', 'fieldNamesForType'),
    ],
  },
  {
    name: 'zotero-export.mjs',
    role: '导出：逐条 citation / 整段 bibliography / bibtex / biblatex / ris / csljson',
    can: [
      '`--item <key>`（可重复）或 `--collection <key>`；`--format` 选一种；`--style` / `--locale` 给 CSL',
      'citation 走 `include=citation`，bibliography 走 `format=bib`，其余格式原样走 translator；逐条保留请求顺序',
      '一次最多 50 个 key（Zotero 的 itemKey 上限）；更大的集合是下一次调用，不静默拆批',
    ],
    refuses: [
      'notes / attachments 不进引用：它们不是作品',
      '库漏答某条 citation 时**拒绝并点名**，不印空行',
      '导出文本不中途截断：超过上限就报错，而不是给半段',
    ],
    when: [
      '写论文/笔记要引用 → 先用它生成，不要凭记忆写 BibTeX 或作者年份',
      '要引一整批 → 先 `--collection`，再按 `--limit` 分批；每批不超过 50',
    ],
    cites: [cite('tools/zotero-export.mjs', 'buildExportPath', 'selectExportKeys', 'orderCitations', 'ITEMKEY_CAP')],
  },
  {
    name: 'zotero-pdf.mjs',
    role: '读附件本身（梯级 2/3/4）：文件文字层 · 论文自带目录 · 页面渲成图；也可读一个 OA PDF URL',
    can: [
      '`--outline`：论文**自带**的目录，条目映射成写入侧认的序号（`I Introduction` → `§1`）',
      '`--extract`：文件自己的文字层，补"库里没索引"的洞',
      '`--render --pages 3-5 --scale 1.5`：把页面渲成 PNG，默认落到 `.section-notes/<recordKey>/pages/`',
      '`--url <https-pdf>`：同一个梯级读一个库外的开放获取 PDF；输出来源是 URL，不是库记录',
    ],
    refuses: [
      '一次一级：`one rung per invocation`',
      '`--render` 不给 `--pages`（一轮不许把整篇渲出来）',
      '页号超出文件页数；`--pages` 不是页号或区间',
      '文件没有自带目录时，rung 3 **明说空手**并 exit 1',
      '`--url` 只收 http(s)，并且要真的是 PDF：落地页不是文件，空 body 与超过 80 MB 都拒绝',
    ],
    when: [
      '公式读出来是乱码 → `--render` 后用 `read_image` **当图像读**（不许当文本引用）',
      '没索引 → `--extract`，注意它和索引读的是**同一张编码表**，修不了字体编码的洞',
      '库里没有、OA 有 → 先 `metadata --oa` 拿 PDF URL，再 `--url` 读；引用时写明来源是 URL',
    ],
    cites: [
      cite('tools/zotero-pdf.mjs', 'one rung per invocation', '--render needs --pages', 'no table of contents, so rung (3) has nothing to give', 'urlSlug', '--url takes an http(s) URL'),
    ],
  },
  {
    name: 'zotero-section-note.mjs',
    role: '逐节解释笔记：覆盖计划（含作者） · 写 · claim · 解 ambiguous · 复核 · 原地改写 · 原地修复 · 归退 · 删除（仅 `/retired`，永久）',
    can: [
      '`--item` / `--json`：这条记录 claim 了哪些节、哪些是 `unknown`、`ambiguous`、墓碑、legacy，以及每条的**作者**（`owner` / `import` / `agent` / `agent+reviewed`）',
      '写一条节的解释笔记（干跑默认，写后回读 `/section-N`＋`/agent-note`）',
      '`--claim --note <key> --section N`：给已有笔记打 claim，正文不动；无 tag 时带 `/imported`，**agent 笔记除外**',
      '`--unclaim --note <key> --section N`：**只**对带多枚 `/section-` tag 的笔记，移掉陈旧那一枚（干跑 + 版本守卫 + 回读；正文不动）',
      '`--rewrite --note <key> --file ...`：改导入笔记或**未复核的 agent 草稿**（版本守卫，不写备份），改写后带 `/agent-note`',
      '`--repair --note <key> --file ... --reason "<why>" --mechanical|--substantive`：把一条**记录**原地改正，键、节号与出处不动，加 `/repaired`；substantive 清 `/reviewed`（干跑 + 版本守卫 + 回读）',
      '`--review --note <key>`：业主确认一份 agent 正文，加 `/reviewed`（只改 tag、正文不动）；`--undo` 退回草稿',
      '`--retire --note <key> --reason "<why>"`：任何笔记都可变成**墓碑**，`--undo` 可逆',
      '`--replaces <旧key>`：新笔记带走"我取代了谁"的指针',
      '`--delete --note <key> [--write]`：只对 `/retired`；`--write` 永久擦除，404 回读',
      '`--acknowledge-unknown "<读了什么>"`：记录上还有无 tag 笔记时，create 的放行条件',
    ],
    refuses: [
      '已被 claim 的顶层节（`REFUSED: §…`）——**不要绕过它**',
      '点号序号 `--section 3.1`：**不写也不读**（计数单位是顶层节）',
      '记录（`/section-N` 无 `/imported`、无未复核 `/agent-note`）与**已复核**的 agent 笔记：**不原地改写**，只能原地修（`--repair`），主张变了就走退休 + 新写',
      '`--repair` 打到草稿/导入/墓碑/ambiguous：各自指向 `--rewrite`、先解 ambiguity，或本身就不是修复；属主自己的记录只接受 mechanical 修复',
      '多条 `/section-` tag 的笔记：`ambiguous`，不计覆盖，**写前必须用 `--unclaim` 解掉**；单枚 tag 的笔记**拒绝 unclaim**——那是 claim，分歧归业主裁定',
      '`--replaces` 的对象没退休，或它讲的是另一节',
      '`--delete` 一个不是 `/retired` 的笔记：`REFUSED`',
      '记录上还有无 tag 笔记时的 create（`--acknowledge-unknown` 是唯一的放行口）',
    ],
    when: [
      '要改正一条已有记录：**主张没变**就用 `--repair`（声明 mechanical/substantive）；**主张变了**才 `--retire` + `--replaces`——不删、不重写，正文一个字不动',
      '网页版粘贴的笔记：读 → `--claim` 或 `--rewrite`；垃圾 → `--retire`',
      '`ambiguous`：读过之后 `--unclaim` 移掉陈旧那枚，一次一枚；分不清哪枚陈旧就报出两枚并停',
      '确认一条 retired 笔记没有保留价值 → `--delete --write`；不可恢复，且回收站里不会有它',
      '没有 `--tidy`；公式坏了由 agent 读文字层/页图后**修**（`--repair --substantive`），工具不替人猜',
      '**退出码是三种答案**：0 写入并回读 · 1 拒绝且确定没写 · 3 已发送/已写但未确认（打印 key，**不要重发**）',
      'agent 草稿要升成记录：**业主**说可以之后 `--review`，工具不替业主加 `/reviewed`',
    ],
    cites: [
      cite(
        'tools/zotero-section-note.mjs',
        'SECTION_TAG_PREFIX',
        'IMPORTED_TAG',
        'AGENT_TAG',
        'REVIEWED_TAG',
        'REPAIRED_TAG',
        'changeClass',
        '--repair',
        'NO PROSE PARSING',
        'unknown',
        'ambiguous',
        'REFUSED: §',
        'the body is NOT touched',
        'WRITTEN BUT UNCONFIRMED',
        'SENT BUT UNCONFIRMED',
        '--acknowledge-unknown',
        '--unclaim',
        'protocol §6',
      ),
    ],
  },
  {
    name: 'zotero-edit.mjs',
    role: '改一条记录的字段与标签；写前按 itemType 校验字段',
    can: [
      '白名单字段（`EDITABLE_FIELDS`）与标签（`--add-tag` / `--remove-tag`，写成一个 diff）',
      '写前读 `/itemTypeFields`：字段不属于该类型时**拒绝并点名**，给出 `zotero-read --item-fields` 的命令',
    ],
    refuses: [
      '结构化字段（`REFUSED_FIELDS`）：creators · itemType · key · version · collections · relations · 两个日期',
      '库不提供 schema（404）时**不假装校验过**：退回静态白名单，不阻止合法编辑',
      '失败分三种答案：0 写入并回读 · 1 拒绝（冲突、4xx）· **3 已发送或已写但未确认**——5xx 或断线不等于没写，报告点名条目并说清重读看到什么',
    ],
    when: ['要改上面那些：**在应用里改**，工具会说明每条为什么不是一行能表达'],
    cites: [
      cite('tools/zotero-edit.mjs', 'EDITABLE_FIELDS', 'REFUSED_FIELDS', 'invalidFields', '--item-fields', 'OUTCOME UNKNOWN'),
    ],
  },
  {
    name: 'zotero-remark.mjs',
    role: '整行重写一条记录 `extra` 里的 `remark:` 行，其余每个字符原样保留',
    can: [
      '只读：`--item <key>` 把该行拆成 前缀（括号评价）/ 正文 / 其余行 / `rate`，并**说明它不推断任何形状**',
      '写：`--new-line "<整行新值>" --expect-current "<旧行原文>"`；工具**不解析短语**、不判断哪一句是业主的话',
      '没有 `remark:` 行时 `--create` 新建一行并放在最前；括号里的评价变了会打印 `NOTE`，但**不拦**——那是业主的，不是工具能裁的',
    ],
    refuses: [
      '来不及：**不做形状校验**（短语几个、有没有评价、括号在不在开头，一律不管）——格式是约定，写在纪律里',
      '`--expect-current` 与当前行**逐字不符** ⇒ 拒绝并给第一个不同的字符位置（先读后写，不是格式）',
      '`remark:` 行多于一行 ⇒ 拒绝（哪一行是简记不是本工具裁决的）；`--new-line` 含换行 ⇒ 用法错误（会把一行拆成两行）',
      '除该行外的任何一行变了都不写：新 `extra` 只是旧 `extra` 换掉一行',
      '0/1/3 三种答案同其他写侧：冲突 1 · 4xx 1 · 5xx 或断线 3',
    ],
    when: [
      '要给某个条目的简记补/改那些短语 → 先 `--item` 读行并照抄，再干跑（会把新旧行并排打印），再 `--write`',
      '干跑里出现 `NOTE: the verdict changed` → 停下：括号里的评价是业主的，不该被改',
    ],
    cites: [
      cite('tools/zotero-remark.mjs', 'REMARK_LINE', 'planLine', 'verdictNotice', 'expect-current', 'OUTCOME UNKNOWN'),
      cite('skills/key-terms/SKILL.md', 'key-terms'),
    ],
  },
  {
    name: 'zotero-collection.mjs',
    role: '分类：列出 / 建 / 改名 / 归档 / 移出',
    can: ['`--list` · `--create` · `--rename` · `--assign` · `--assign --remove`'],
    refuses: [
      '改名是**实测可用**的（2026-10-16），但分类的 `version` 常为 0 ⇒ 那条守卫在多数分类上是空转',
      '没拿回 key 时**先重读分类树再判断**（exit 3），而不是报"没写成"让调用方再建一个同名分类',
    ],
    when: ['改名被库拒绝时，工具**停下**，不会用"新建一个再搬"来假装成功（那会换 key）'],
    cites: [
      cite('tools/zotero-collection.mjs', '--rename <collectionKey> --name', 'The tree lists no collection'),
      cite('README.md', 'unreliable rather than absent'),
    ],
  },
  {
    name: 'zotero-write.mjs',
    role: '新建一条记录（按 arXiv id / DOI），并可**同时**归入分类',
    can: [
      '`--arxiv <id>` / `--doi <doi>`（干跑默认）',
      '`--collection <key>`：建条目时把 `collections` 放进**同一个 create body**——一次写入、一次授权；key 在写入前按库里的分类树校验，**不接受分类名**',
      '`--selftest`：不写库，只查接缝；纯函数那半边在 `zotero-write-selftest.mjs`',
    ],
    refuses: [
      '库里已有同一篇（DOI / archiveID / 标题）→ **不建第二份**，打印 `ALREADY IN THE LIBRARY` 并 **exit 0**（无事可做，与 `zotero-edit` 的 No change 同构）；要第二份才 `--force`',
      '`--collection` 的 key 形状不对或库里没有 → **在第一次请求之前**拒绝，不猜分类名',
      '回读里没有这个归档 → 报 `UNFILED` 并 **exit 3**：条目**已建**，它只给 `zotero-collection.mjs --assign` 一条命令，**不会补写第二次**',
      '断线或 5xx 且没拿回 key → **先搜一遍**（DOI / archiveID / 标题）再说：搜到就点名 key，搜不到也说明请求已发出、别再建第二份',
    ],
    when: [
      '"加一篇"之前先搜一遍：重复条目在库里比缺条目更难收拾',
      '要归档又不想多写一次 → 建的时候带 `--collection`；事后补档才是 `zotero-collection.mjs --assign`',
    ],
    cites: [
      cite(
        'tools/zotero-write.mjs',
        'ALREADY IN THE LIBRARY',
        'UNFILED',
        '--selftest',
        'search again before creating it twice',
      ),
    ],
  },
  {
    name: 'zotero-link-attachments.mjs',
    role: '存储型附件 → 链接附件（增量）',
    can: ['`--target <dir>`（干跑默认）· `--limit N` · `--no-wake`', '会留一条 `WAKE_NOTE_MARKER` 笔记说明它动过什么'],
    refuses: [
      '**整库迁移不是它**：那是 `zotero-link-snippet.js`，由**属主自己在应用里跑**，不经 API 授权',
      '每条转换写两次；链接建好却读不回时**保留存储副本**、报 `UNCONFIRMED` 并以 exit 3 结束，不重试',
    ],
    when: ['要动全库 → 停下来问属主，别用增量工具假装做迁移'],
    cites: [
      cite('tools/zotero-link-attachments.mjs', 'WAKE_NOTE_MARKER', 'no matching link in the parent yet'),
      cite('README.md', 'A whole-library migration is'),
    ],
  },
  {
    name: 'arxiv.mjs',
    role: '预印本索引（不是全文通道）',
    can: ['`--search`（索引查询）· `--id`（按标识读一条）· `--selftest`'],
    refuses: ['只给题录与摘要，**不是全文**', '上游把错误塞在形状正常的 feed 里时，它拒绝把错误当记录打印'],
    when: ['需要正文 → 走参考库那条路（`zotero-read` / `zotero-pdf`），预印本索引给不了'],
    cites: [cite('tools/arxiv.mjs', 'node tools/arxiv.mjs --search', '--selftest'), cite('README.md', 'not full text')],
  },
  {
    name: 'metadata.mjs',
    role: '书目元数据（不是全文通道）：解析一条记录 · 检索候选 · 引用 / 被引 · 免费副本 · 正式引用 · 核验 · 相关作品',
    can: [
      '`--doi <doi|W-id>`（默认 OpenAlex）· `--source crossref`（出版方那一侧）',
      '`--search` 候选列表（`--rows` 1–10）· `--refs` · `--cited-by <W-id>` · `--oa <doi> --mailto <地址>`',
      '`--cite <doi|arxiv-id> [--format bibtex|ris|csljson|text] [--style apa] [--locale en-US]`：从 doi.org 的内容协商取**正式引用**，不是从记忆写',
      '`--verify <doi> [--expect-title …] [--expect-year …] [--expect-author …]`：Crossref 记录 + 撤稿公告 + 与声明的逐项比对',
      '`--related <doi|W-id>`：OpenAlex 的 related_works 列表，一条线索而不是引用',
      '`--json`：打印的是**收敛后的记录**，不是原始响应（实测 24,580 字符 → 4,867）',
    ],
    refuses: [
      '一次调用只发**一个**请求、只用**一种**模式；翻页是下一次调用',
      '`--cited-by` 只收 OpenAlex id：`cites:` 是 id 过滤器，给 DOI 就拒绝并说明先 `--doi`',
      '`--rows` 只用于结果列表，`--abstract` 只用于作品记录',
      '`--oa` 没有联系地址就不发请求（Unpaywall 用 `email=` 收地址）',
      '答回来的 DOI 与问的不同：**两个都打印并标注**',
      '四种"没有"分开报：404（这个源没有它）· body 不是 JSON · 429（限流）· 请求失败',
      '摘要只在能从倒排索引**完整重建**时打印（位置有洞 ⇒ 报 absent），绝不从标题写',
      '`--cite` 只收 DOI 或 arXiv id：PMID 需要先解析成 DOI；注册局答 HTML 落地页时**拒绝**，不把网页当引用',
      '`--verify` 只收 DOI（OpenAlex id 没有注册局记录）；"match" 只说注册局不反驳该声明，不说论文支持它',
    ],
    when: [
      '要引用一个数字 → 抄输出那一行，它带着来源与检索日期；别把它当作品的稳定属性',
      '搜出候选 → 先 `--doi` 确认那一条；把搜索结果当元数据报告是不允许的',
      '免费副本 → 那是**线索不是取回**：没真取到就写"列在 <url>"，坏链按失败线索报',
      '要写一条参考文献 → `--cite`；要核一条已有引用 → `--verify --expect-*`；要找相邻工作 → `--related`',
    ],
    cites: [
      cite(
        'tools/metadata.mjs',
        'classifyResponse',
        'DIFFERENT from the DOI asked for',
        'rebuilt from abstract_inverted_index',
        'one request per invocation',
        'citeAccept',
        'citeDoi',
        'verifyWork',
        'formatRelated',
      ),
      cite('docs/coverage.md', '书目元数据'),
    ],
  },
  {
    name: 'scholarly.mjs',
    role: '跨源发现：7 个索引 · 短语路由 · 加权 RRF 去重 · 引用图 · 库内标记',
    can: [
      '`--search`：每源一次请求（PubMed 两次），并行；显式 `--sources` 覆盖路由',
      '加权 RRF + canonical ID + 标题 fuzzy 去重；`--sort` / `--year-from` / `--year-to` / `--open-access`',
      '`--citations <id> --direction citations|references|related`：DOI/arXiv/PMID/PMCID 经 OpenAlex 解析',
      '`--mark-library`：只查前 10 条；`in` / `not-in` / `unavailable` 三态，失败不当作不在库',
      '`--json`：`sourcesAsked` / `sourcesAnswered` / `sourcesFailed` / `partial` / `totalFetched`',
    ],
    refuses: [
      'DBLP **默认不进路由**：显式 `--sources dblp` 会报 `blocked`（202 反爬页），不伪装成空结果',
      'Semantic Scholar 没有 `AUTORESEARCH_S2_KEY` 时报 `no-key`，不先撞一次 429',
      '不重试、不读全文、不写库；全源失败 exit 1，部分失败标 `partial` 并逐源报原因',
      '融合后的记录只是**线索**：不是证据等级，确认单篇仍要 `metadata --doi`，读全文仍要 `metadata --oa` + `zotero-pdf --url`',
    ],
    when: [
      '文献发现第一轮用它：先看有哪些工作，再对候选逐条 `metadata --doi` 确认',
      '要读 OA 全文 → 用 `scholarly-read.mjs --id`（arXiv HTML/JATS/PDF），或从结果的 `pdf:` 取 URL 交给 `zotero-pdf --url`',
      '库里有没有这条 → `--mark-library`；`unavailable` 时停下说库没答，不要说"不在库"',
    ],
    cites: [
      cite('tools/scholarly.mjs', 'fusePapers', 'routeSources', 'markLibrary', 'sourcesFailed', '--mark-library'),
      cite('tools/scholarly-sources.mjs', 'SourceError', 'searchDblp', 'searchSemanticScholar', 'searchPubMed'),
    ],
  },
  {
    name: 'scholarly-read.mjs',
    role: 'OA 全文阅读：arXiv HTML/ar5iv/PDF · PMC JATS · OpenAlex OA PDF；分节 / BM25 / 切片',
    can: [
      '`--id <doi|arxiv|pmid|pmcid|url>` 依次试 arXiv HTML → ar5iv → arXiv PDF → PMC JATS → OpenAlex OA PDF；每条路由失败都点名',
      '`--outline`：按标题层级列节与字符区间；`--section "3"` / `"3.1"` / 标题读一节（含子节）',
      '`--query "<terms>"`：把该文本切块后 BM25 排段落，报 score 与绝对字符区间',
      '`--start` / `--max-chars`：分片读，输出 `next: --start N`；`--json` 只给元数据与切片，不把全文塞进一条 JSON',
    ],
    refuses: [
      '不读付费墙：没有 OA 路由时 exit 1，并把每条路由的失败原因列出，不说"大概是付费墙"',
      '不缓存、不重试；HTML 超 5M 字符、PDF 超 80MB 都拒绝',
      'LaTeXML/JATS 里的数学是重复、带标记的文本：**公式不能当文本引用**，要读公式仍走 `zotero-pdf --render` + `read_image`',
      '没有标题的 PDF 是 `unstructured`：只能切片或 BM25，不能 `--outline`/`--section`',
    ],
    when: [
      '发现之后要正文：先 `--outline` 看结构，再 `--section` 读那一节，最后 `--query` 定位句子',
      '数学/公式必须核验 → 记下 PDF URL，用 `zotero-pdf --url ... --render --pages` 渲成图再读',
      '引用时写明 `source` 与 `url`：arXiv HTML、PMC JATS 和 OA PDF 是三种不同来源',
    ],
    cites: [
      cite('tools/scholarly-read.mjs', 'parseHtmlToText', 'parseJatsToText', 'extractSections', 'resolveFullText', 'routeFailure'),
      cite('tools/scholarly-sources.mjs', 'resolveIdentifier'),
      cite('tools/zotero-pdf.mjs', 'extractPdfText', 'pdfOutline'),
    ],
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

/**
 * The page's channel sections, in order, and the rule that puts a helper in one of them.
 *
 * Every helper must match exactly one. A helper that matched none would silently vanish from a page
 * whose whole promise is that it lists what exists, so a mismatch is reported instead of dropped.
 */
const CHANNELS = [
  { title: '参考库通道', match: (helper) => helper.name.startsWith('zotero-') },
  { title: '预印本通道', match: (helper) => helper.name === 'arxiv.mjs' },
  { title: '书目元数据通道', match: (helper) => helper.name === 'metadata.mjs' },
  { title: '学术发现通道', match: (helper) => helper.name.startsWith('scholarly') },
]

/**
 * Which section of the page a helper belongs to.
 *
 * @param {{name: string}} helper A helper entry.
 * @returns {string} The channel title.
 * @throws {Error} When the helper matches zero or more than one channel.
 */
export function channelOf(helper) {
  const matches = CHANNELS.filter((channel) => channel.match(helper))
  if (matches.length !== 1) {
    throw new Error(`helper ${helper.name} matches ${matches.length} channels on the toolchain page`)
  }
  return matches[0].title
}

/** The page, as one string. The only place its shape is decided. */
export function renderPage() {
  const parts = []
  parts.push('# 04 — 工具链的能力与边界')
  parts.push('')
  parts.push('**非规范，且是派生文档。** 契约永远是 [`protocol.md`](../protocol.md)。本页由')
  parts.push('[`tools/dev/toolchain-page.mjs`](../tools/dev/toolchain-page.mjs) 生成，只回答一个问题：**手上这件工具现在能做什么、')
  parts.push('明确拒绝什么、撞上了怎么办。**')
  parts.push('')
  parts.push('它的价值全在一个性质上——**每一行都挂着一条能被机械校验的出处**，所以一句声明无法比它描述的代码活得更久：')
  parts.push('')
  parts.push('```powershell')
  parts.push('node tools\\dev\\toolchain-page.mjs --check    # 页面是否与生成器一致、每条出处是否还在')
  parts.push('node tools\\dev\\toolchain-page.mjs --write    # 重新生成')
  parts.push('node tools\\tests\\toolchain-selftest.mjs     # 同一件事，外加负向控制')
  parts.push('```')
  parts.push('')
  parts.push('## 一、先看这几条（不知道它们，会各花掉一轮）')
  parts.push('')
  parts.push('| 事实 | 出处（机械校验） |')
  parts.push('| --- | --- |')
  for (const fact of FACTS) parts.push(`| ${fact.says} | ${CELL(fact.cites)} |`)
  parts.push('')
  parts.push('## 二、每个 helper')
  for (const channel of CHANNELS) {
    parts.push('')
    parts.push(`### ${channel.title}`)
    for (const helper of HELPERS.filter((entry) => channelOf(entry) === channel.title)) {
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
  }
  parts.push('')
  parts.push('## 三、这套校验能证明什么、不能证明什么')
  parts.push('')
  parts.push('- **能证明**：这一行所依据的那段源码/契约/实测记录**还在**。重命名、删常量、改消息，都会让')
  parts.push('  [`tools/tests/toolchain-selftest.mjs`](../tools/tests/toolchain-selftest.mjs) 变红，而不是让一句话悄悄过期。')
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

const USAGE = 'usage: node tools/dev/toolchain-page.mjs --check | --write'

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
    console.error(`${PAGE_PATH} is not what this generator renders — run: node tools/dev/toolchain-page.mjs --write`)
  }
  if (status === 'missing' && mode === '--check') {
    console.error(`${PAGE_PATH} does not exist — run: node tools/dev/toolchain-page.mjs --write`)
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
