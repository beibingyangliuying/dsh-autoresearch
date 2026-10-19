# 04 — 工具链的能力与边界

**非规范，且是派生文档。** 契约永远是 [`protocol.md`](../protocol.md)。本页由
[`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) 生成，只回答一个问题：**手上这件工具现在能做什么、
明确拒绝什么、撞上了怎么办。**

它的价值全在一个性质上——**每一行都挂着一条能被机械校验的出处**，所以一句声明无法比它描述的代码活得更久：

```powershell
node tools\toolchain-page.mjs --check    # 页面是否与生成器一致、每条出处是否还在
node tools\toolchain-page.mjs --write    # 重新生成
node tools\toolchain-selftest.mjs        # 同一件事，外加负向控制
```

## 一、先看这几条（不知道它们，会各花掉一轮）

| 事实 | 出处（机械校验） |
| --- | --- |
| 读不需要授权；写要参考管理器**当场**给一次授权，`Always Allow` 的长期 key 按 server id 存在本机。 | `tools/zotero-local-api.mjs` · `createWriteGate`<br>`README.md` · `standing grant` |
| 写成功不只是 200：**204 无 body 也算成功**，把 200 当唯一成功会把已完成的写报成"被拒绝"。 | `tools/zotero-local-api.mjs` · `isWriteAccepted` |
| 写后回读按**读者可见文本**比，不按字节：应用会给它碰过的笔记套 `<div data-schema-version>`，并吃掉隐形注释。 | `tools/zotero-local-api.mjs` · `visibleText`<br>`tools/zotero-section-note.mjs` · `isApplicationWrapped` |
| **tag 活得过**应用对正文的重写（2026-10-18 真笔记实测）；**隐形 marker 活不过**。所以跨轮的身份标记用 tag。 | `docs/decisions.md` · `tag 活过应用改写`<br>`tools/zotero-section-note.mjs` · `RETIRE_TAG = '/retired'` |
| 记录的 `version` 可能是 0：那种记录上"别人改过没有"的守卫是**空转**，不是通过。 | `docs/decisions.md` · `39.3` |
| 回收站端点**静默忽略 `itemType`**：`?itemType=note` 会答 `Total-Results: 0`，而回收站里可能躺着几百条 note。 | `README.md` · `ignores the type filter silently` |
| 本地 API 的 `DELETE` 即擦除、进不了回收站；进回收站、可恢复的是**应用里**删除的那条路。 | `protocol.md` · `cannot put an item in the trash`<br>`tools/zotero-section-note.mjs` · `DELETION IS PERMANENT` |
| 抽取出来的数学**不可靠**（字体编码坏了：`⩾` 变 `P`、`1⁄4` 变字形），只有把页面渲成图、**当图像读**能救。 | `docs/coverage.md` · `字体编码坏掉的数学`<br>`tools/zotero-pdf.mjs` · `(4) the page as an image` |
| 结果超过 **8,192 字符**会被重写成头 4,096 + 尾 1,024，但那发生在**压缩**时、不是到达时；单条命令的输出另在 **16,000 字符**处被 shell 截断 ⇒ 长文本切片读，被裁的片按 offset 重取。 | `docs/coverage.md` · `8,192`<br>`docs/coverage.md` · `16,000` |
| 本预设**不做 OCR**，也不带第二个运行时：两个阅读引擎只经 `zotero-pdf.mjs` 使用，不读附件的请求不为它们付费。 | `docs/coverage.md` · `不做 OCR`<br>`README.md` · `Seven helper programs` |
| helper 的路径必须从 agent 的工作目录可解析：技能体里是 `{{presetTools}}`，**工作区文件不许写解析后的绝对路径**。 | `protocol.md` · `INV-HELPER-1` |
| **同一个作品在不同书目源上的引用数不同**（43,412 vs 46,513，2026-10-19 分钟级相邻实测）⇒ 引用数必须带**来源与检索日期**。 | `protocol.md` · `quoted with the source that produced it`<br>`tools/metadata.mjs` · `cited_by_count` · `is-referenced-by-count` |
| **答回来的 DOI 可能不是问的那个**（实测：arXiv DOI 被 OpenAlex 答成该作品的另一个 DOI）⇒ 两个都要报，不许只报标题。 | `tools/metadata.mjs` · `DIFFERENT from the DOI asked for`<br>`README.md` · `can answer a different DOI` |
| `mailto` 在 OpenAlex **不是配额杠杆**（它自己的 notice 明说该参数不提高共享日预算），Crossref 仍要它。 | `tools/metadata.mjs` · `mailto parameter doesn't raise this limit` |

## 二、每个 helper

### 参考库通道

#### `zotero-read.mjs` — 读：检索 / 一条记录 / 笔记正文 / 附件文本切片 / 分类树 / 标签

**能做**

- `--search`（默认搜摘要＋笔记＋附件全文）· `--item`（笔记会打印正文**和它的 `tags :`**）
- `--fulltext --offset/--limit/--grep`：按片读附件文本，上一片会打印 `next --offset`
- `--collections` / `--collection <key>` / `--tags`

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 一次只允许一种模式
- 没有索引的附件：它报的是**库自己的状态**，不是"这篇没有正文"

**撞上怎么办**

- 读到空文本 → 换 `zotero-pdf.mjs --extract`（文件自己的文字层）；输出头里的 `rung` 行会说明这一级是谁
- 文本很长 → 按 `--offset` 接着读，别让裁剪器替你做决定

**出处**：`tools/zotero-read.mjs` · `rung   : (1) the library's indexed text` · `nextOffset`<br>`tools/zotero-pdf.mjs` · `(2) the file`

#### `zotero-pdf.mjs` — 读附件本身（梯级 2/3/4）：文件文字层 · 论文自带目录 · 页面渲成图

**能做**

- `--outline`：论文**自带**的目录，条目映射成写入侧认的序号（`I Introduction` → `§1`）
- `--extract`：文件自己的文字层，补"库里没索引"的洞
- `--render --pages 3-5 --scale 1.5`：把页面渲成 PNG，默认落到 `.section-notes/<recordKey>/pages/`

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 一次一级：`one rung per invocation`
- `--render` 不给 `--pages`（一轮不许把整篇渲出来）
- 页号超出文件页数；`--pages` 不是页号或区间
- 文件没有自带目录时，rung 3 **明说空手**并 exit 1

**撞上怎么办**

- 公式读出来是乱码 → `--render` 后用 `read_image` **当图像读**（不许当文本引用）
- 没索引 → `--extract`，注意它和索引读的是**同一张编码表**，修不了字体编码的洞

**出处**：`tools/zotero-pdf.mjs` · `one rung per invocation` · `--render needs --pages` · `no table of contents, so rung (3) has nothing to give`

#### `zotero-section-note.mjs` — 逐节解释笔记：覆盖计划 · 写 · claim · 原地改写 · 归退 · 删除（仅 `/retired`，永久）

**能做**

- `--item` / `--json`：这条记录 claim 了哪些节、哪些是 `unknown`、`ambiguous`、墓碑、legacy
- 写一条节的解释笔记（干跑默认，写后回读 `/section-N`）
- `--claim --note <key> --section N`：给已有笔记打 claim，正文不动；无 tag 时带 `/imported`
- `--rewrite --note <key> --file ...`：只改无 tag 或 `/imported` 的导入笔记（版本守卫，不写备份）
- `--retire --note <key> --reason "<why>"`：任何笔记都可变成**墓碑**，`--undo` 可逆
- `--replaces <旧key>`：新笔记带走"我取代了谁"的指针
- `--delete --note <key> [--write]`：只对 `/retired`；`--write` 永久擦除，404 回读

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 已被 claim 的顶层节（`REFUSED: §…`）——**不要绕过它**
- 点号序号 `--section 3.1`：**不写也不读**（计数单位是顶层节）
- 带 `/section-N` 但没有 `/imported` 的记录：**不原地改写**，走退休 + 新写
- 多条 `/section-` tag 的笔记：`ambiguous`，不计覆盖
- `--replaces` 的对象没退休，或它讲的是另一节
- `--delete` 一个不是 `/retired` 的笔记：`REFUSED`

**撞上怎么办**

- 要改正一条已有记录：**先 `--retire`，再 `--replaces`**——不删、不重写，正文一个字不动
- 网页版粘贴的笔记：读 → `--claim` 或 `--rewrite`；垃圾 → `--retire`
- 确认一条 retired 笔记没有保留价值 → `--delete --write`；不可恢复，且回收站里不会有它
- 没有 `--tidy`；公式坏了由 agent 读文字层/页图后重写

**出处**：`tools/zotero-section-note.mjs` · `SECTION_TAG_PREFIX` · `IMPORTED_TAG` · `NO PROSE PARSING` · `unknown` · `ambiguous` · `REFUSED: §` · `the body is NOT touched`

#### `zotero-edit.mjs` — 改一条记录的字段与标签

**能做**

- 白名单字段（`EDITABLE_FIELDS`）与标签（`--add-tag` / `--remove-tag`，写成一个 diff）

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 结构化字段（`REFUSED_FIELDS`）：creators · itemType · key · version · collections · relations · 两个日期

**撞上怎么办**

- 要改上面那些：**在应用里改**，工具会说明每条为什么不是一行能表达

**出处**：`tools/zotero-edit.mjs` · `EDITABLE_FIELDS` · `REFUSED_FIELDS` · `a creator list is structured`

#### `zotero-collection.mjs` — 分类：列出 / 建 / 改名 / 归档 / 移出

**能做**

- `--list` · `--create` · `--rename` · `--assign` · `--assign --remove`

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 改名是**实测可用**的（2026-10-16），但分类的 `version` 常为 0 ⇒ 那条守卫在多数分类上是空转

**撞上怎么办**

- 改名被库拒绝时，工具**停下**，不会用"新建一个再搬"来假装成功（那会换 key）

**出处**：`tools/zotero-collection.mjs` · `--rename <collectionKey> --name`<br>`README.md` · `unreliable rather than absent`

#### `zotero-write.mjs` — 新建一条记录（按 arXiv id / DOI）

**能做**

- `--arxiv <id>` / `--doi <doi>`（干跑默认）
- `--selftest`：不写库，只查接缝

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 库里已有的重复（DOI / archiveID / 标题）→ `REFUSING to create a duplicate`，除非显式 `--force`

**撞上怎么办**

- "加一篇"之前先搜一遍：重复条目在库里比缺条目更难收拾

**出处**：`tools/zotero-write.mjs` · `REFUSING to create a duplicate` · `--selftest`

#### `zotero-link-attachments.mjs` — 存储型附件 → 链接附件（增量）

**能做**

- `--target <dir>`（干跑默认）· `--limit N` · `--no-wake`
- 会留一条 `WAKE_NOTE_MARKER` 笔记说明它动过什么

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- **整库迁移不是它**：那是 `zotero-link-snippet.js`，由**属主自己在应用里跑**，不经 API 授权

**撞上怎么办**

- 要动全库 → 停下来问属主，别用增量工具假装做迁移

**出处**：`tools/zotero-link-attachments.mjs` · `WAKE_NOTE_MARKER`<br>`README.md` · `A whole-library migration is`

### 预印本通道

#### `arxiv.mjs` — 预印本索引（不是全文通道）

**能做**

- `--search`（索引查询）· `--id`（按标识读一条）· `--selftest`

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 只给题录与摘要，**不是全文**
- 上游把错误塞在形状正常的 feed 里时，它拒绝把错误当记录打印

**撞上怎么办**

- 需要正文 → 走参考库那条路（`zotero-read` / `zotero-pdf`），预印本索引给不了

**出处**：`tools/arxiv.mjs` · `node tools/arxiv.mjs --search` · `--selftest`<br>`README.md` · `not full text`

### 书目元数据通道

#### `metadata.mjs` — 书目元数据（不是全文通道）：解析一条记录 · 检索候选 · 它引了谁 / 谁引了它 · 有没有列免费副本

**能做**

- `--doi <doi|W-id>`（默认 OpenAlex）· `--source crossref`（出版方那一侧）
- `--search` 候选列表（`--rows` 1–10）· `--refs` · `--cited-by <W-id>` · `--oa <doi> --mailto <地址>`
- `--json`：打印的是**收敛后的记录**，不是原始响应（实测 24,580 字符 → 4,867）

**明确拒绝**（这一栏是没人读到、直到它开火的那一栏）

- 一次调用只发**一个**请求、只用**一种**模式；翻页是下一次调用
- `--cited-by` 只收 OpenAlex id：`cites:` 是 id 过滤器，给 DOI 就拒绝并说明先 `--doi`
- `--rows` 只用于结果列表，`--abstract` 只用于作品记录
- `--oa` 没有联系地址就不发请求（Unpaywall 用 `email=` 收地址）
- 答回来的 DOI 与问的不同：**两个都打印并标注**
- 四种"没有"分开报：404（这个源没有它）· body 不是 JSON · 429（限流）· 请求失败
- 摘要只在能从倒排索引**完整重建**时打印（位置有洞 ⇒ 报 absent），绝不从标题写

**撞上怎么办**

- 要引用一个数字 → 抄输出那一行，它带着来源与检索日期；别把它当作品的稳定属性
- 搜出候选 → 先 `--doi` 确认那一条；把搜索结果当元数据报告是不允许的
- 免费副本 → 那是**线索不是取回**：没真取到就写"列在 <url>"，坏链按失败线索报

**出处**：`tools/metadata.mjs` · `classifyResponse` · `DIFFERENT from the DOI asked for` · `rebuilt from abstract_inverted_index` · `one request per invocation`<br>`docs/coverage.md` · `书目元数据`

## 三、这套校验能证明什么、不能证明什么

- **能证明**：这一行所依据的那段源码/契约/实测记录**还在**。重命名、删常量、改消息，都会让
  [`tools/toolchain-selftest.mjs`](../tools/toolchain-selftest.mjs) 变红，而不是让一句话悄悄过期。
- **不能证明**：这句话是对那段源码的**公平概括**。概括是人写的，机械的只是"它站的那块地在不在"。
  这是刻意的分工：能机械化的部分窄到可信，判断留在读得懂两边的人手上。

