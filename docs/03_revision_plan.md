# 03 — Autoresearch 修订草案（Revision 17）

**状态：执行中（草案已获批，按 §9 分多个逻辑提交；进度见 §11）。** 起草 2026-10-18 · 裁定者：junhan

**依据**：三条课题会话（课题A《地震后区域电网功能恢复与安全再投运机制》· 课题B《局部电气设备减隔震…跨尺度影响机制》· 课题C《电力系统韧性文献分类》）的现状梳理，加上 2026-10-18 对预设本体与真库的**只读复核**。

**范围**：凡"不便之处"都在本文件内分账——该修的修，该保留的写明理由，**归错账的销案**。

---

## 0. 分账：三类，改法完全不同

| 类 | 内容 | 处理 |
| --- | --- | --- |
| **A 设计边界** | 不能删、不能重写散文、隔离只到 tools、skill 目录合并 | **不修**。把措辞与依据写准（其中删除一条今天有实质更正，见 §6.5） |
| **B 断头路（真缺陷）** | ① 改正一条已有笔记没有通道 ② 协议承诺的"清单"没有形状 ③ 读库没有结构梯级 ④ `.section-notes/` 无名无姓 ⑤ 协议版本号与变更记录不一致且无护栏 ⑥ 写侧允许创建子节键而纪律禁止 | **本草案的主体** |
| **C 归错账（销案）** | `math_symbols`（不在预设里，全 git 历史 0 命中）、412/428/204（已处理）、每次弹窗（Rev 10 已修）、`{{presetTools}}`（注册时填绝对路径，`INV-HELPER-1` 成立） | **不动代码**，在 §7 记清以免下一个人重查 |

**一句话**：真正卡住两个课题 39 条待办的，不是"不能删"，而是**"不能取代"**。

---

## 1. 今天新拿到的实测证据（本草案的依据）

全部为 `GET`，未写库、未用授权。

| # | 探针 | 结果 | 影响 |
| --- | --- | --- | --- |
| E1 | 全库 live 笔记普查（`/items?itemType=note`，360 条） | 应用包裹体 146 · 裸体 214 · **带 tag 0** · 带 `autoresearch-section` marker 208 | D3 的 tag 前提**未证** |
| E2 | 回收站普查（`/items/trash`，473 条） | **315 note** · 147 attachment · 10 journalArticle · 1 conferencePaper；其中 285 应用包裹体、**1 条带 tag**（`QE78EVJR`，`tags=[/section-note]`，裸体） | ① 应用删除**确实进回收站、可恢复** ② **已有会话用过 tag 通道**，新方案必须兼容该方言 |
| E3 | `GET /items/trash?itemType=note` | **200 + `Total-Results: 0`**，而回收站实有 315 条 note；`?itemType=book` 同样 0；而 `/items?itemType=note` 正常答 360 | **端点静默忽略 `itemType`** ⇒ 按类型查回收站会读出干净的 0（假absence，resident rule 5 的教科案例） |
| E4 | Item JSON 形状 | `data` 键＝`dateAdded/dateModified/itemType/key/note/parentItem/relations/tags/version`，**无 `deleted`**；`includeTrashed=1`／`trashed=1` 被静默忽略（360→360，首条 key 相同） | 这个 API **没有"放进回收站"这个动作**；只有"擦掉"或"不动" |
| E5 | 官方文档 | Web API *Deleting an Item* 只写 `204 The item was deleted`，**未说**永久还是进回收站；本地 API 页只说支持 DELETE，且"does not attempt to replicate every implementation detail" | "API 删除是永久的"是**实测边界，不是文档承诺**（措辞需改，见 §6.5） |
| E6 | 本地 API 新增能力（文档读到，**待实测**） | `GET /items/<key>/file`（与 `/file/view`）→ **302 到 `file://`**；`PUT /items/<key>/fulltext`（批量 `POST /fulltext` ≤10，需 `If-Unmodified-Since-Version`）**可写附件全文** | 梯级 ②④ 与"写回库索引"的技术前提 |
| E7 | 环境与先例 | 预设唯一依赖＝`@deepseek-ai/schemastery`；**全仓 0 个 `.py`／`pyproject.toml`／`uv.lock`**；`tools/release-check.mjs:69-70` 明确把 `command:` 与 `uvx` 判为问题；`docs/01_decisions.md` §34 记录：**旧发布版需要 Python 环境（`uvx` MCP 行）正是被修掉的缺陷** | §4.3 依赖路线的裁定依据 |

---

## 2. P1｜断头路①：改正一条已有笔记 → 新增「归退」（retire）

### 2.1 现状与设计目标

现状：写＝新增；改正文＝禁止；`--tidy`＝4 类机械修复。中间那个最常用的动作（这一节写错了，换一条对的）缺失 ⇒ 必修走「属主界面手删 → agent 重写」⇒ **note key 变了**（课题A 的台账引用随之作废）、次序是硬的（先删才能写）、两个课题共 39 条卡在同一个手动步骤上。

**设计**：不动"不许重写"，**另加一条不是重写的路**——旧笔记**归退**，新笔记照常写。

| 动作 | 内容 |
| --- | --- |
| `--retire --note <noteKey> --reason "<为什么>"` | 干跑打印该笔记与其现有声明（节号 / 认读规则 / 依据）＋将要发生的变化（tags 加 `/retired`）＋**正文不动**；`--write` 才写 |
| 覆盖判定 | 带归退标记的笔记**不计入覆盖**（它是墓碑，不是活笔记）⇒ 那一节重新可写 |
| 可逆 | `--retire --undo` 去掉标记即可恢复覆盖；**这是本动作"可撤销"的全部依据** |
| 永不删除 | 归退**不改动正文、不移动、不删除**；正文留在库里，直到属主自行清理 |
| 归退不是搬家 | "为什么被换掉"由两处承载：**新笔记的开场点名它取代了哪个 key**，以及属主清单的一行 |

**关键性质**：这条设计**不放松任何既有禁令**——协议里"a rewrite is the owner's decision, never a formatter's"**原句不动**，归退是它旁边新开的一条路。

### 2.2 未证前提与退路

**未证前提**：应用在重写一条笔记的**正文**时，会不会顺手丢掉它的 **tag**。
证据只到 E1/E2：全库 675 条笔记里只有 1 条带 tag，而它**没被应用改过**。

**为什么必须处理**：若 tag 被丢掉，归退标记会**静默消失** ⇒ 同一节出现两条活笔记 ⇒ 正是这门纪律存在的理由被击穿，且失败是静默的。

**处理（按 junhan 裁定：折进实现 + 同时定好退路）**：

1. **快路**：tag 放在笔记上（`/retired`）。
2. **慢路（退路）**：标记放**父条目**上（应用重写的是笔记正文，不碰父条目）——`zotero-edit.mjs --add-tag retired:<noteKey>`。
3. **对账**：工作区台账也记一行；**两种读法不一致就停下问**（复用协议既有的"两种读法不一致停下"规则，不新造机制）。
4. **回归测试**（实现时一并写）：写入带 tag 的笔记 → 属主在应用里改一次正文 → 断言 tag 仍在。**不单独花一轮**。

### 2.3 兼容已有方言（E2 的硬约束）

`QE78EVJR` 已经带着 `/section-note` 躺在库里。⇒ 新方案**必须**：

- 读侧认 `/retired` **与** `/section-note` 两种既有写法；
- 写侧只写 `/retired`，并在文档里说明 `/section-note` 是历史方言（只读不写）；
- **不得**为同一含义引入第三种写法。

### 2.4 工具改动（`tools/zotero-section-note.mjs`）

| 改动 | 说明 |
| --- | --- |
| `--retire --note <key>` / `--retire --undo` | 一条一次、干跑默认、写后回读（沿用既有闸门与 `INV-EVID-3`） |
| `--plan` 增印墓碑行 | 例：`§3  retired by QE78EVJR → superseded by <newKey>` |
| `--plan` 读 tag | 现有 `childrenOf` 已返回完整 item data（含 `tags`），无需新请求 |
| `--item <noteKey>`（`zotero-read.mjs`） | 增印该笔记的 tags——目前只打正文，读不到 tag |
| 新增不变量 | `INV-NOTE-1`：一节只有一条**活**笔记；被取代的笔记带归退标记、不再计入覆盖；归退可逆且从不删除 |

---

## 3. P2｜断头路②：协议承诺的"清单"要有一个形状

`protocol.md:421` 与 `README.md:174` 都说 hands over **a list**，但**没有定义**字段、位置、生成方式。结果三个会话各造一份，跨课题合并只能人肉读台账。

**草案**：

1. **固定字段**（一行一条）：`记录key · 标题 · 笔记key · §号 · 动作（删/取代/重写）· 为什么 · 重建稿路径 · 状态`。
2. **默认落点**：`<study>/research/owner_actions.md`（进脚手架）；**已有的 study 层级优先**（`INV-PROJ-1` 原样适用）。
3. **机器出口**：`zotero-section-note.mjs --plan --json`，输出
   `{ record, notes:[{key, section, chars, wrapped, tags, markers, claimRule, claimEvidence}], coverage:{live:[], retired:[], inParts:[]}, unreadable:[] }`
   ——让父代**机械汇总**跨课题清单，不再靠解析散文。
4. **报告必含一节**：skill §6 增 `## Owner actions`。
5. **价值**：课题A 27 条 + 课题B 12 条合成**一次手删**成为预设支持的动作，而不是运气。

---

## 4. P3｜断头路③：把"读的梯级"写出来，并给它一个结构出口

### 4.1 梯级与"每一级补哪个洞"

| 级 | 来源 | 补哪个洞 | 依赖 |
| --- | --- | --- | --- |
| ① 库索引全文 | `/items/<key>/fulltext`（`.zotero-ft-cache`） | 现状；**便宜** | 无 |
| ② 文件文字层 | `GET /items/<key>/file` → `file://` 路径，直接读 | **索引没建/过期**时的假"没有可读文本"（`protocol.md:313-316` 自己写着这是"在报告它自己") | PDF 引擎 |
| ③ 自带目录（`/Outlines`、EPUB nav、HTML `h1–h6`） | 同上 | **结构**：现在 `section-notes` §7 自认 *"No outline rung exists"* | 同上 |
| ④ 页图渲染 + `read_image`（视觉） | 渲染成 PNG 后用已保留的 `read_image` 读 | **字体编码坏掉的数学**（`1⁄4` 代 ¼、`⩾` 抄成 `P`）；扫描件 | 引擎（渲染）+ 视觉 |
| ⑤ OCR | — | ④ 已覆盖同一需求，**不引入** | — |

**一条必须说清的区分**：② **不补**字体编码的洞（索引与引擎读的是同一份 ToUnicode 表）；字体编码坏了**只有 ④ 能救**。

### 4.2 大纲怎么用（回答 junhan 的问题）

**该做，而且这是这条链里投入产出比最高的一环。** 但它的作用不是"帮你写笔记"，而是**换掉覆盖表的地基**：

- 现在覆盖表只能列**"我读到的节"** ⇒ "某一节有没有被漏掉"**无法检查**。
- 有了大纲，覆盖表变成**"论文自己的每一节 × 有无笔记"** ⇒ skill §3.3 的"no duplicate"与 §3.1 的"method 节一个不漏"**第一次变得可查**。
- **大纲只回答"哪里是节"，永不回答"哪一节该写笔记"**——后者是 §3.1 的判断，仍归 agent 读完再决定。

**三条限定（都要写进纪律）**：

1. 从大纲拿到的标题，**仍须在正文里看见才算数**（重排本、running head、书目与正文编号不一致都会骗人）——正好复用 §2.4 已有的"把据以切分的标题行原文写进报告"。
2. 扫描件/无文字层 ⇒ 大纲也没有 ⇒ 明确报"结构无法建立"并**停下问**（现有 exclusion 条款已有）。
3. 标题候选（启发式）**永远是候选**：输出必带原文行 + 偏移 + `candidate` 字样。

### 4.3 依赖路线（junhan 问"有没有现成经验"）

**结论：不做第二个运行时；用 Node 内的 WASM/纯 JS 引擎，许可证是硬闸门。**

| 路线 | 许可证 | 判断 |
| --- | --- | --- |
**尝试顺序（junhan 2026-10-18 裁定：Node 优先；Node 都不可行时才引入 Python 运行时）**

| 顺序 | 路线 | 许可证 | 判断 |
| --- | --- | --- | --- |
| **①** | **`@hyzyla/pdfium`**（PDFium 编译成 WASM，**零依赖**，Node + 浏览器，主要用途就是渲染 PDF 为图片；v3.0.0，39 个下游项目） | 引擎 PDFium＝BSD-3、包装＝宽松 | **候选主路**：②③④ 可能一个引擎全覆盖 |
| **②** | `pdfjs-dist`（纯 JS，`getOutline()` + 文本） | Apache-2.0 | 备选：②③ 够用，渲染需 canvas |
| **③** | Python（`uv` + **pypdfium2**） | 需核对（pdfium 引擎本身 BSD-3） | **最后手段**：Node 两条都不行时才走 |
| ✗ | `mupdf`（WASM，无原生依赖） | **AGPL-3.0 / 商业** | **任何路线下都出局**：本预设是 MIT，不能把 AGPL 依赖发出去 |
| ✗ | PyMuPDF（`fitz`） | **AGPL-3.0 / 商业** | **同上**：即使走 Python，也**不得**用 PyMuPDF（会话侧用的是它，那是工作区自用，不进包） |

**Python 为什么排在最后（而不是永不）**——依据是你们自己的记录，加上今天的裁定：

- `docs/01_decisions.md` §34：旧发布版挂两个 `uvx` MCP 行、**需要 Python 环境**，那正是被修掉的缺陷；
- `tools/release-check.mjs:69-70`：组合里出现 `command:` 或 `uvx` 即判为问题；
- 全仓 **0 个 `.py`**，唯一依赖是 `schemastery`；所有 helper 都是 `.mjs` + `*_selftest.mjs`；
- **诚实限定**：那道守卫只扫**组合**，一个由 skill 正文调用的 `.py` 不会触发它。⇒ **若真走到 ③，必须先扩守卫**（扫 skill 正文里的 `.py` 引用；且运行时缺失要**响亮报错**并报"本功能不可用"，而不是静默降级——同 `INV-SCOPE-3` 的"没有隔离就响亮地说"）。

**依赖成本为什么可接受**：本预设的通道是**helper 程序**、不是 MCP 行 ⇒ 引擎的字节只在使用它的那一轮付费，**不进每轮提示词**（这正是 `README.md:132-139` 论证过的架构优势）。

**实现第一步必须先验（不打包票）**：① 能否安装并运行 ② 是否同时给出大纲与文本 ③ 许可证与体积 ④ 单页渲染耗时与产物大小。

### 4.3.1 实测结果（2026-10-18，沙箱 `.tmp/engine-probe/`，未触碰预设 `package.json`）

**装了：** `@hyzyla/pdfium` 3.0.0（**声明依赖为空**，包内唯一二进制 `pdfium.wasm` **5.05 MB**，许可证 MIT／引擎 BSD-3）＋ `pdfjs-dist` 6.4.299（Apache-2.0，**33.3 MB** 安装量；其 `@napi-rs/canvas` 是 **optionalDependency**，是那个原生 skia 二进制的来源）。

| 验的是 | 结果 |
| --- | --- |
| `/items/<key>/file` → 真实路径（E6） | ✅ `302 → file:///D:/OneDrive/Zotero/<title>.pdf` |
| `library.init()` / `loadDocument()` | ✅ 24 ms / 4 ms（1.27 MB、8 页论文） |
| 文本 `page.getText()` | ✅ 第 1 页 **5,255 字符 / 7 ms**，头部就是正文；第 2 页 7,442 字符 |
| 渲染 `page.render({scale:1.5, render:'bitmap'})` | ✅ 892×1189、**77 ms**、裸 RGBA 4.24 MB |
| **自写 PNG 编码**（`node:zlib`，无 sharp） | ✅ **24 ms → 324 KB/页**（与会话侧 310 MB ÷ 718 张 ≈ 430 KB/页同量级） |
| **大纲 / 书签** | ❌ **pdfium 的 WASM 只导出了渲染与文本那一小撮函数**，`FPDFBookmark_*`、`FPDF_GetMetaText` **都不在里面** |
| `getOriginalSize()` | ⚠️ 字段名是 `originalWidth`/`originalHeight`（不是 `width`/`height`）——包装层的小陷阱，不影响渲染 |

**大纲覆盖率普查（20 篇真论文，pdfjs 的 `getOutline()`）**：

```
papers read 20 · 自带大纲 11 篇（55%）· 大纲空/缺失 9 篇 · 读不出 0 篇
```

条目就是论文自己的节标题，**而且带着论文自己的编号形式**：

```
XDZBJ3WU  "I Introduction" / "II Measure of Stress" / "III Transmission Switching" / "IV Case Studies" / "V Conclusion" / "References"
I6IR7B4G  "I Introduction" / "II Atomic Event Simulator Based on HE" / "III Steady-state & Dynamic Hybrid Simulation" / …
IT6YDHUJ  "Introduction" / "Proposed Methodology" / "Numerical Results" / "Conclusion" / "Appendix: Passive and Active Loading"
```

⇒ **大纲的价值被实测确认**（含罗马数字、含 Appendix 条目——正好是今天工具写不进、排成 §5/§6 的那两类），**但 pdfium 给不了它**。这是本草案唯一需要为"加一个依赖"付账的地方，见 §10 待裁定第 7 项。

### 4.4 保真度标签（junhan 已选）

`--fulltext` 与 `--extract` 的输出头增一行**来源与保真度**，例如：

```
source  : library index (.zotero-ft-cache), indexed 41,238 chars — math glyphs in extracted text are NOT reliable
source  : attachment text layer, read from <path> — same ToUnicode table as the index
```

并明确：**扫描件 ⇒ "this preset does not OCR"**（`docs/02_coverage.md` §3 已有立场，此处把话说在工具输出里，而不是只在文档里）。

---

## 5. M1–M7：便宜的机械改进

| # | 改动 | 为什么 |
| --- | --- | --- |
| **M1** | `project-template/.section-notes/README.md`：草稿目录约定 + 子代理 manifest 字段 + "工作文件无权威" | skill §7 **已点名**这个目录，脚手架却不建它 ⇒ 每个会话自造 `_BRIEF.md` |
| **M2** | 契约/简报模板加**署名头**（课题 · 批次 · 日期 · 属主） | 三个会话都花时间判断"这是谁的"，代价本可由一行省掉 |
| **M3** | skill §3.2 模板的 `第&lt;X&gt;节`、`&lt;原文标题&gt;` 占位符**换成填好的实例** | 已被两次证明诱导子代理把字面 `<2>` 抄进成品。**不换成 `{{…}}`**：本预设的 `{{presetTools}}` 就是替换令牌，会撞 |
| **M4** | `--section` **写侧**加窄守卫：点号序号**读得到、写不了**，命中就响亮拒绝 | 现在 `--section 3.1` 写得进去，而纪律说"永不创建子节键"——**读要宽、写要窄** |
| **M5** | `doc-selftest` 加 **DOC-11**：`protocol.md` 头部 Revision ＝ 变更记录里出现的最高 Revision | 现在头部写 15、同一段却在记录 16，**且无护栏** |
| **M6** | 能力/边界单页**由工具自身导出常量生成**（`EDITABLE_FIELDS`/`REFUSED_FIELDS` 已是这个模式），配 selftest 断言页面最新 | 会话提的"固化成单页"是对的，但**手写必然漂移**；生成＋断言才能同时满足"下次不再花一整轮试出来" |
| **M7** | skill 加一句：**工作区文件里不写解析后的 helper 绝对路径** | 硬编码发生在会话自写契约里；仓库一改名，那些文件全部失效 |

---

## 6. 契约改动逐条

### 6.1 `protocol.md`

| 位置 | 改动 |
| --- | --- |
| `:3` 头部 | `Revision 15` → **`Revision 16`**（§1 的更正）；本草案另立 **Revision 17** 段落，记录：归退、清单形状、读的梯级 |
| §3 常驻纪律 | 不改（归退是纪律外的机制） |
| §6 笔记写入 | 增：一个已覆盖的节**可以**在旧笔记归退后重写；**"a rewrite is the owner's decision"原句不动**；增归退的**可逆性**与"永不删除" |
| §6 读的梯级 | 增梯级表与"②不补字体编码"的区分；增 §4.4 的保真度要求（接住既有的"a read must say which file it read"） |
| §7 脚手架 | 增 `research/owner_actions.md`（默认形状，`INV-PROJ-1` 优先） |
| §8 不变量 | 增 `INV-NOTE-1`（归退）；`INV-CTX-1` 的"cheaper levels of the reading ladder"**补明是哪些级** |
| §9 非目标 | **删除条款重写理由**（见 6.5） |

### 6.2 `README.md`

- `170-174` 删除段：理由改准（E5）＋补"归退是删除的替代品"；
- 新增一句：读的梯级与"本预设不做 OCR"；
- 命令清单增 `--retire`、`--outline`/`--extract`、`--plan --json`。

### 6.3 `skills/section-notes/SKILL.md`

| 位置 | 改动 |
| --- | --- |
| §2.4 | 增"先取大纲（③），再在正文里看见"的顺序 |
| §3.2 | **M3** 占位符改实例；tag 方言说明 |
| §3.3 | 增归退与"活笔记"的定义：**一节一条活笔记** |
| §3.4 | 原样不动（机械修复的范围不变） |
| §6 | 增 `## Owner actions`（P2 的字段） |
| §7 | **删掉/替换" No outline rung exists "**；增梯级与保真度；**M7** |

### 6.4 其他自测与索引

- `docs/02_coverage.md`：**必须同批更新**（它是 DOC-9 管的覆盖图：部分↔纪律，且要求出现"非规范"/`protocol.md`）；
- `surface.md`：若新增 helper，按 `DOC-5`（双射）与 `DOC-1`（契约不出现符号名）同步；
- `doc-selftest`：新增 **DOC-11**；若走 Python 路线则**先**扩 `release-check` 的守卫。

### 6.5 删除条款的措辞更正（今天唯一实质更正的既有结论）

**原文**（`protocol.md:418-422` / `README.md:170-174`）：API 删除是永久的 ⇒ 删除始终是属主的动作，预设给一张清单。

**更正后**（实测更强、理由更准）：

> 本预设**不做**参考库内的删除，理由是**这个 API 根本没有"放进回收站"这个动作**：item JSON 里没有 `deleted` 字段（2026-10-18 实测），`includeTrashed`／`trashed` 被静默忽略，而 `DELETE` 实测为擦除（2026-10-16：`204` 后 `404`，回收站计数 114→114 不变、键不在回收站）。回收站**只由应用产生**（2026-10-18 实测：回收站 473 条，其中 315 条 note，皆属主在应用内删的，可恢复）。官方文档**未写明**删除语义是永久还是进回收站，因此这条是**实测边界**而非文档承诺；Web API 的删除语义同样未写明，本预设不使用它。⇒ 删除是属主的动作；本预设的答案是**一张有形状的清单**（§3）＋一条**可逆的归退**（§2）。

**同时记入 pitfalls**：`GET /items/trash?itemType=<type>` **静默忽略类型过滤**并答 `200 + Total-Results: 0`（E3）——任何"按类型查回收站"的脚本都会读出假absence。

---

## 7. 归错账的销案记录（避免下一个人重查）

| 会话结论 | 实况 |
| --- | --- |
| `math_symbols` 是失效的仪器 | **预设里、全部 git 历史里 0 命中**。症状（`1⁄4`、`⩾`→`P`）是 **PDF 字体编码/文字层**的产物，不是预设仪器 ⇒ 归到 ④ 级（页图+视觉）才治得了 |
| 412/428/204 | `isWriteAccepted()`、401 重问、版本守卫均已在；README `164-170` 自己也记了 collection version 0 |
| 每次取 key 都弹窗 | **Rev 10 已修**（长期 key 按 server id 存） |
| helper 路径要自己对 | `{{presetTools}}` 在**注册时**由 `preset-paths.js` 填绝对路径，`INV-HELPER-1` 成立；硬编码发生在**会话自写的工作区契约**里（→ M7） |
| 隔离只到 tools | `protocol.md:268-274` 明写，且给了理由；不修 |

---

## 8. 不做的事

- **不给删除开口子**（§6.5 是理由更正，不是权限放开）。
- **不放松 `--tidy`**：仍只做 4 类机械修复，declined 必报。
- **不为隔离加机制**：skill catalog 合并是内核边界，`protocol.md:268-274` 已如实声明；能做的只有署名与单一路径（M1/M2）。
- **不引入 AGPL 依赖，不引入第二个运行时**（§4.3 已附先例与许可证依据）。
- **不把大纲当作"哪一节该写笔记"的依据**（§4.2）。

---

## 9. 执行顺序（按依赖拆多个逻辑提交）

1. `docs`：本草案定稿 + `docs/02_coverage.md` 同步 + `docs/01_decisions.md` 记 E1–E7；
2. **M5**：`doc-selftest` DOC-11 + 修 `protocol.md:3` 头部版本（先立护栏，后改内容）；
3. **Revision 17 契约**：`protocol.md` §6/§7/§8/§9 + `README.md` + `surface.md`；
4. **P1 归退**：`zotero-section-note.mjs --retire/--undo` + `--plan` 墓碑行 + `zotero-read.mjs` 打 tag + 自测（含应用改写回归测试与父条目退路）；
5. **P2 清单**：`--plan --json` + skill §6 `## Owner actions` + 脚手架 `owner_actions.md`；
6. **M1/M2/M3/M7**：脚手架与技能骨架；
7. **M4**：写侧窄守卫 + 自测；
8. **P3 梯级**：先验 §4.3 的四项 → 再定依赖 → `--outline`/`--extract`/`--render` + 保真度标签 + 自测；
9. **M6**：生成式能力单页 + 断言不漂移 + 发版检查（`preset-release`）。

---

## 10. 裁定结果（junhan，2026-10-18）

| # | 项 | 裁定 |
| --- | --- | --- |
| 1 | **依赖路线** | **Node 生态内的纯 JS/WASM 优先**；**若 Node 两条都不可行，才引入 Python 运行时**（用 pypdfium2，**不用 PyMuPDF**）。**先实测能用，再写进契约。** 验收顺序见 §4.3 |
| 2 | **Revision 号** | 头部 `15 → 16`（补既有欠账）；本草案的改动另立 **Revision 17** |
| 3 | **归退标记名** | **`/retired`**；库中已有的 `/section-note` 只读兼容，不造第三种写法 |
| 4 | **清单默认落点** | **`<study>/research/owner_actions.md`**（进脚手架；已有 study 层级优先，`INV-PROJ-1` 原样适用） |
| 5 | **写回库索引**（`PUT /fulltext`） | 本次**不做**，仅登记为后续可选项 |
| 6 | **只读探针** | 探针命令固化进 `docs/01_decisions.md`，**脚本删除** |

**由 1 产生的连带项**（写进执行清单，不是待裁定）：若最终走到 Python，**先扩 `release-check` 的守卫**（现只扫组合，扫不到 skill 正文里的 `.py` 引用），并规定**运行时缺失必须响亮报错**。

---

## 11. 进度（本文件随执行更新）

| §9 步骤 | 状态 | 提交 |
| --- | --- | --- |
| 1 文档与决策记录 | 进行中（本文件 · `docs/01_decisions.md` §50） | — |
| 2 M5 版本护栏 + 头部 15→16 | ✅ | `6ec4d1d` |
| 3 Revision 17 契约（§6 归退与梯级 · §7 清单产物 · §8 `INV-NOTE-1` · §9 删除理由 · README 删除段更正） | ✅ | `1754e83` |
| 4 P1 归退：`--retire/--undo` · `--replaces` · `--plan` 墓碑行 · 21 条新断言 · 真库干跑 | ✅ | `423b37a` |
| 4b 纪律文本：`section-notes` 的归退（§2 · §3.3 · §3.4 · §4.2 · §6 · §7 · §8 · §9 · 路由描述） | ✅ | `9f08fb1` |
| 5 P2 清单：`--plan --json` · skill `## Owner actions` · 脚手架 `research/owner_actions.md` | ✅ | `806fbed` |
| 6 M1/M2/M3/M7：`.section-notes` 骨架 · 署名头 · 占位符换实例 · 不写解析后路径 | ✅ | `8697611` |
| 7 M4 写侧窄守卫（点号序号读得到、写不了） | ✅ | `65491ef` |
| 8 P3 读的梯级（组合 A：`@hyzyla/pdfium` + `pdfjs-dist`；`--outline`/`--extract`/渲染 + 保真度标签） | ✅ 引擎实测见 §4.3.1；三个梯级在真库跑通，渲染页已当图像读回 | `ae75e6d` · `1d78c9b` |
| 9 M6 生成式能力单页 + 不漂移断言 | **发布后单独一轮**（junhan 裁定） | — |
| 10 `zotero-read.mjs --item` 增印笔记 tags | ✅ **本来就有**（`zotero-read.mjs:445` 一直打印 `tags :`；用带 `/retired` 的真笔记验过）——原列项是我记错的假待办 | — |
| 11 **tag 活过应用改写**：真笔记归退 → 属主在应用里改一次 → 读回 → 撤销 | ✅ **成立且已闭环**（正文被重写、marker 被吃，tag 存活；详见 `docs/01_decisions.md` §51.2）。父条目标记退路经实证**不需要** | 见 §51.2 |
| 11b 发布前清理：README 依赖声明 + 两处 fixture 去掉属主库痕迹 | ✅ | `ff46dbd` |
| 12 **发布**：版本号 `0.4.0`（单独提交）· 注释 tag · 推分支与 tag · `release-check --tag` | 进行中 | — |
| — | 清理 `.tmp/` 两百余个往轮遗留文件（junhan 未定） | — |
