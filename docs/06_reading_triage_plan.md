# 06 — 筛读（reading-triage）：按课题顺序推进，每节一次"继续/停止"

**状态：草案 v2，S1–S3 已实施（2026-10-19）；S4（反向重扫 + 全套自测）待实施。实施记录见 [`docs/01_decisions.md` §62](01_decisions.md)。**
v2 相对 v1 的变化：判定词汇从四值降为"depth 载水位 + verdict 三值"；`refs/` 从"加一列"改为**废除**；
读法从"入口节优先"改为**从前往后顺序读**（跳读降为带护栏的可选路径）；新增"复用已有笔记"路径。
实施口径：台账落在英文模板文档里，九列表头用英文（`itemKey | year | found via | grade | depth |
verdict | basis | re-open if | date`），单元格内容按课题自己的语言写。

## 0. 一句话

读文献是一个**按节推进、每节停下来判一次**的动作：`depth` 记读到第几节，`verdict` 记为什么停在那里。
判定按（课题 × 文献）存进**该课题自己的台账**，不设任何 study 级共享读态。

## 1. 要解决的问题

| # | 现状 | 后果 |
|---|---|---|
| 1 | `literature-recon` 唯一允许做的阅读决定在**读之前**，判据是摘要（B 级） | 摘要是被设计来说服你"这篇相关"的；用它判相关性，方向是反的 |
| 2 | `section-notes` 进入后要给每个顶层方法节写笔记，合法不写的只有引言/背景/案例/结论 | **"读到 §2 发现不相关"没有合法出口** |
| 3 | 没有任何地方记录"停在哪一节、为什么停" | 下一轮重读，或把同一个判断再做一遍 |
| 4 | `refs/` 是 study 级共享索引，`/done` 是记录级 tag | 一篇文献被多个课题参考时，**这两个都答不出"对哪个课题读到哪"**，只能是模糊的"读过" |
| 5 | `adoption-ruling` §4.2 把等级挂在 digest 上 | digest 只覆盖方法节；只读 §3 之后这句会合法地误判 |

先验前提均来自现有文本：第 1 条 `literature-recon` §1 与 §9 末行；第 2 条 `section-notes` §1、§3.1；
第 3 条 `refs/README.md` 的格式表；第 5 条 `adoption-ruling` §4.2 第一行。

## 2. 三层压缩，三个写者

| 压缩 | 回答 | 产物 | 写者 | 切分单位 | 读者 |
|---|---|---|---|---|---|
| 论文 → 课题 | 这篇对 Q1 有什么、读到哪 | 课题文档的参考台账 | `reading-triage` | **文献 × 子命题** | 选题时的我 |
| 论文 → 内容 | 这篇的方法是什么 | `/digest`（库里） | `section-notes` | 论文的节 | 未来的我 |
| 论文 → 实现 | 我们借什么、进哪个模块 | `adoption/<key>.md` | `adoption-ruling` | 借用项 | 实现者 |

- digest 只从节笔记合成、ruling 只从节笔记取事实（`INV-EVID-4` 原样有效）；两者不互相引用。
- triage 只从**论文本身或其已有笔记**取证据，不消费 digest。
- 反向阅读链：`课题台账 → 笔记（若有）→ 原文细节 → digest → 裁定`。裁决不是第三次压缩，是按借用项切。

## 3. 判定模型

### 3.1 台账 = 课题文档里的那张表

替换 `project-template/research/literature/README.md` 的 §3 `## Evidence table`：

```
| itemKey | year | 来源 | grade | depth | verdict | 判定依据 | 复看条件 | 日期 |
```

| 列 | 写者 | 含义 |
|---|---|---|
| `itemKey` `year` `found via` | **literature-recon**（只增不改） | 哪条记录、哪年、经哪个查询/通道找到 |
| `grade` | 读它的人（搜索轮先填实际读到的） | 我们据此说的话能站到哪一级：`A`/`B`/`C` |
| `depth` | 读它的人（搜索轮先填实际读到的） | 实际推进到哪：`—` / `abstract` / `§N` / `full` |
| `verdict` | 读轮 | 为什么停：`park` / `enough` / `stop`，空 = 正在读 |
| `判定依据` | 读轮 | 读到哪一节、哪一句决定（复用笔记时写明"经笔记判定"） |
| `复看条件` | 读轮 | 什么变化会让这条重判 |
| `日期` | 读轮 | 最近一次判定变化的日期 |

**一句可判定的边界**：literature-recon 只追加行，写左三列加上它筛选时实际读到的 `grade`/`depth`，
不写 `verdict`/判定依据/复看条件/日期；读轮写那四列，并可就地改正 `grade`/`depth`（它真读了论文）；
**两者都不删行**。

（2026-10-19 junhan 裁定：不采用"读轮独占 grade/depth"——那会让 A/B/C 在同一个文件里有两个家，
或让搜索轮已经读过的全文在台账里看不出来，从而被重读。）

### 3.2 闭集与最小字段

| verdict | depth | 含义 | 必填 |
|---|---|---|---|
| `park` | `—` | 未开始，等条件 | 复看条件 |
| `enough` | `§N` | 读到 §N 为止**够用**了 | 判定依据（复看条件建议填） |
| `stop` | `§N`，或 `—`（无可读文本，仅据书目信息判定） | 读到 §N 判定**不相关** | 判定依据 + 复看条件 |
| （空） | `§N` | 正在读 | — |
| （空） | `full` | 全部方法节读完 | — |

`§` 只出现在 `depth`，不在 verdict 里重复。`enough` 与 `stop` 的区别是"需要满足了没有"——这是下一个课题最需要的那个区别，所以单独留一档。

### 3.3 `unscreened` 就是文献层的 `unknown`

`section-notes` 已立：**没有 `/section-N` 的笔记不是覆盖，必须读**。台账同构：**只要那一行在、
`verdict` 空着，就是没人判过**——`depth` 说明手上已经有什么（`—` 什么也没有，`abstract` 只有摘要），
不是"判过了"。

### 3.4 grade 与 depth 是两个轴

- `grade` = 我们的断言站得多稳（A/B/C，属于 claim）；
- `depth` = 论文被推进到哪（属于 paper）。

只读 §3 而把该节读透，`grade=A, depth=§3` 是正确的一行。今天只用一个 `A`，于是 `refs/README.md` 只能写 "A = full text read"，两者都是谎——这也是废除该文件的原因之一。

### 3.5 判定可改，改法是一条日期行

台账只留当前状态；变化进课题文档的 `## 筛读日志`：`<日期> | <itemKey> | <旧> → <新> | <依据> | <谁判的>`。

## 4. 读法：顺序推进，跳读是例外

### 4.1 默认路径（顺序读，零新工具）

工具今天支持的就是这条路：`--offset/--limit` 给切片并打印 `next: --offset N`，每片开头就是那一节的标题，所以**"读到第几节"由读到的文字自己给出，不需要任何大纲到位置的映射**。

1. 起点：`zotero-section-note.mjs --item <recordKey>` —— 一次调用，看这条记录有没有笔记。
2. **有笔记**（别的课题读过）：该输出已打印每条笔记的 tags + **首段**（`firstBlockText`，取第一个 `<p>/<h>/<li>` 块）。读首段判够不够；
   不够再 `zotero-read.mjs --item <noteKey> --limit 12000` 读整条；仍不够，进下一节。
3. **无笔记**：`zotero-read.mjs --fulltext <key> --offset 0 --limit 12000` 逐片推进（库未索引时用 `zotero-pdf --extract`，参数相同）。
4. 每读完一个**方法节**且判定为继续，写一条 `/section-N` 笔记——这是留给下一个课题的资产。
5. 判断必须能落成一句"**这篇供的是 ___，落在 Q{t} 的 ___**"；写不出就是 `stop`。

**切片为什么取工具的默认 12000**：起草时按配置里的裁剪阈值（`thresholdChars: 8192 / headChars: 4096 /
tailChars: 1024`）取过 7000，理由是"两种解释下都安全"。实施时改了主意：本轮实测一次 14,999 字符的结果
**完整到达、没被裁剪**，与配置对不上，而工具自己的默认就是 12000、既有文档也全用 12000。**为一个没查清的
配置再引入第二个切片数**，只会让仓库里同时存在两个数字；所以沿用 12000，并把"报告里写明实际读到多少字符"
写成硬要求——被裁的片要看得见。**未决**：配置与该实测仍不一致。

### 4.2 跳读（可选，带硬护栏）

只有当下面三条同时成立才允许跳：

1. `zotero-pdf.mjs --item <key> --outline` 存在，且目标节的序号与标题是**论文自己写的**；
2. `--grep "<该标题原文>"` 命中，且**把命中的标题行原文打印出来**（OCR 会把 `POLARIZATION` 认成 `P IZATION`，打印是唯一能看出来的地方）；
3. 用命中项的字符 `index` 作 `--offset` 继续读。

任一条不成立，退回 §4.1。跳读的理由只能有一个：**这一节之外的内容对这个课题没有判别力**（例如只关心它的结果表结构），且要写进报告。

## 5. 触发与权限

**触发**：即将为一篇文献花时间读；读到某节末尾要决定是否继续；一条 `park` 的复看条件成立；一条 `stop` 正被质疑。

**不适用**：一次性的"这节说什么"；本课题已有当前判定且未变；明确只作背景、不打算读。

**权限**（junhan 2026-10-19）：

| 决定 | 谁下 | 形式 |
|---|---|---|
| 继续读下一节 / `stop` / `enough` / `park` | agent | 直接落台账，不必提问 |
| 判定会滑向研究方向（"这个方向没有文献"）或要改课题 | owner | `ask_user_question` |

**没有"宣布要深读"这一步**——读是渐进的，停下才是判断。

## 6. 新 discipline 的骨架（`skills/reading-triage/SKILL.md`）

front-matter 草案（英文，与其余九条同风格）：

```
name: reading-triage
description: Advance through one reference section by section for one named research question,
  stopping when it is enough or when it is irrelevant: records depth and why it stopped in the
  topic's own ledger, with the sentence that decided it and the condition that would reopen it;
  reuses section notes another topic already wrote. Use before spending time on a paper, at a
  section boundary, or when a parked paper's condition has come true.
```

九节提纲：

1. **When to use** — 四种触发；不适用情形；声明"筛读不评价论文质量"。
2. **First step: read the ruler** — `00_scoping.md` 的候选问题 id、本课题台账现状、该记录的 `--item` 计划。
3. **Criteria** —（文献 × 子命题）为单位；depth/verdict 闭集；named target；grade 与 depth 两轴；顺序读为默认、跳读护栏；12000 切片；复用笔记的三级阶梯。
4. **Do vs don't** — 含 §7 的排除条件表。
5. **Wording discipline** — "这篇对 Q1 供的是 X"是判定；"看起来不相关""不够创新"都不是；不评价论文质量。
6. **Report shape** — 台账行 + 日志行 + 短报告（Record / Question / Depth / Verdict / Basis / Not judged）。
7. **Instrument discipline** — 顺序切片；`--item` 复用；跳读护栏；只写工作区；不写库；无新工具。
8. **Acceptance checklist**。
9. **Don't** — 不替 owner 改方向；不写节笔记（那是 `section-notes`）；不写库；不给论文打分；不猜节号。

## 7. 本地排除条件（草案）

| 命中 | 动作 |
|---|---|
| 没有命名子命题（Q1/Q2 未定） | 先问是哪个问题；不落判定——没有问题就没有判定的单位 |
| 记录没有可读文本 | 报告"无可读附件"；`depth=—`，可 `stop`（说明书目信息即全部证据），不得写成读过 |
| 只有摘要 | `depth=abstract`、`grade ≤ B`；写明"全文能改变什么" |
| 大纲不存在，或 `--grep` 未命中标题 | **不许跳读**，退回顺序推进 |
| 跳读命中多处 | 取第一处并打印全部命中位置；或退回顺序推进 |
| 文字层不可读 | 爬到页图（`--render` + `read_image`）；**基于没读到的文字做的判定不成立** |
| 两个子命题给出相反判定 | 两行，一行一个；绝不合并 |
| 判定会改变研究方向 | 越界，提问 |
| `park` 的复看条件已成立 | 当场重筛，不留着 |
| 复用的笔记首段与全文结论不一致 | 以全文为准，并报告该笔记可能需要重修（`section-notes` 的 retire 路径） |

## 8. 契约与文本改动清单

**S1 台账与词汇（不删目录）**

| 文件 | 改动 |
|---|---|
| `project-template/research/literature/README.md` | §3 换成参考台账（九列）；加 `## Reading log`；开头改成"课题的文献档案：搜索轮追加、读轮推进"；`A` 的定义从"读了全文"改成"读了这句话靠的那几段" |
| `skills/literature-recon/SKILL.md` | §6 的证据表 → 台账行；§7 回执 → 台账行（并删掉指向 `refs/` 的三处）；§1 的"是否值得读"指向读轮；§3.1 的 `A` 改成按句子；§9 去掉"是否值得读" |
| `skills/section-notes/SKILL.md` | §1 增"范围由台账推进"；§3.1 增"读到中途停"的出口；§4 增"`stop` 不产 digest"、删掉 `refs/` 句 |
| `skills/adoption-ruling/SKILL.md` | §4.2 的 grade 归属改成读台账；§1 补"台账 verdict 不是证据等级"；§2.1 改成查台账（删掉 `refs/`） |

**S2 废除 `refs/`（结构 + 不变量）**

| 文件 | 改动 |
|---|---|
| `project-template/research/literature/refs/` | **删除目录**（`refs/README.md` 一并删） |
| `protocol.md` | §7 布局删 `refs/`；`INV-EVID-4` 改写：判据从"查索引"变成"查本课题台账，再看记录上的笔记"；§6 的 notes 条款同步；一次 Revision（22） |
| `README.md`（第 241 行）· `AGENTS.md.template` §3 表 | 布局同步（`scaffold-selftest` 会拦） |
| `docs/02_coverage.md`（第 80、168 行） | 同步 |
| `adoption/README.md`（两处） | 删掉指向 `refs/` 的句 |
| `/done` tag | 保留但**降为人工标记**：任何判断不得读它；只在某课题做出终局判定时可打（三条 skill 的 `/done` 句一并降级） |

> 三条 skill 里指向 `refs/` 的句子已在 S1 一并改掉（S1 不能同时描述两个"回执"，否则读到的是两套账）。
> S2 剩下的只有目录、契约布局和不变量。

**S3 新 discipline（文本 + 计数）**

| 文件 | 改动 |
|---|---|
| `skills/reading-triage/SKILL.md` | 新文件（§6 骨架） |
| `cordis.patch.yml` | persona 路由加一条；改 `literature-recon`/`section-notes` 两条触发语 |
| `tools/skills-selftest.mjs` | `10 → 11`（35）+ 期望名单（52–63） |
| `tools/preset-selftest.mjs` | 路由数组（250）· `count===10`（253）· 名字数组（269） |
| `protocol.md` | §4 清单 10→11；新增 `INV-EVID-6` |
| `surface.md` · `docs/02_coverage.md` · `README.md` | 各加一行 |
| `docs/04_toolchain.md` | 由 `toolchain-page.mjs` 重生成 |
| `docs/01_decisions.md` | 新增一节：起因、已核实前提、裁定、否掉的方案 |

**不变式草案**

> `INV-EVID-6` — 一篇文献对一个研究问题只由一个课题的台账记一次：`depth` 说读到哪，`verdict` 说为什么停；
> 判定必须带判定依据与复看条件，`refs/` 一类的 study 级读态不存在；判定变化留日期行，不改已写的笔记。

## 9. 分阶段实施

| 阶段 | 内容 | 验证 |
|---|---|---|
| S1 | 台账九列 + 词汇 + 顺序读 + 复用路径 | `doc-selftest`（`toolchain-page --check`） |
| S2 | 废除 `refs/`：删目录、三处布局、`INV-EVID-4` | `scaffold-selftest`（S1/S2 会拦布局不一致）、`doc-selftest` |
| S3 | 新 discipline + 路由 + 计数 | `skills-selftest`、`preset-selftest`、`isolation-selftest` |
| S4 | 反向重扫：每一句"谁决定要不要读""读过了看哪里" | 全套离线自测 + `preset-release` 的读者面检查 |

## 10. 风险

1. **废除 `refs/` 后没有 study 级一眼索引**：跨课题查重靠 `grep -r "<itemKey>" research/literature/*.md`。可接受，但要求台账行**必须带 itemKey**。
2. **复用路径依赖前一个课题写了笔记**：停在前言/综述区的文献没有笔记，Q2 只拿到一条台账——水位是提示，笔记才是资产。
3. **首段可能不足以判定**：三级阶梯是 首段 → 整条笔记 → 原文切片；跨阶时在 `判定依据` 里写明用了哪一级。
4. **`stop` 变成永久盲点**：靠复看条件兜底。
5. **并发写同一记录**：两个课题同时给同一节写笔记时，`section-notes` 的"已 claim 即拒绝"是护栏；单用户下概率低但会以 `REFUSED` 出现，不是数据损坏。
6. **跳读在 OCR 件上静默出错**：护栏要求打印命中的标题行原文；做不到就退回顺序读。
7. **切片大小与裁剪器的不一致未查清**（§4.1）：沿用工具默认 12000；若裁剪器真的生效，12000 的片会掉中间——这是**已知未决缺陷**，两条修法（把阈值抬到 16000，或把默认降到 7000）都还没定。
8. **列级边界工具不拦**：只有一句文本约定；报告要说明"这一行谁写的"。

## 11. 已裁定（2026-10-19，junhan）

| # | 项 | 裁定 |
|---|---|---|
| 1 | 一文件多课题 | 可能；判定按（课题 × 文献）存 |
| 2 | 台账落点 | 课题文档内，**每个课题自己的文件**，不是项目根共享文件 |
| 3 | `refs/` | **废除**；`grep` 代索引；`/done` 降为人工标记 |
| 4 | 读法 | 从前往后顺序读为默认；跳读仅在"大纲存在 + grep 命中 + 打印标题行"时允许 |
| 5 | 词汇 | `depth` 载水位（`—`/`abstract`/`§N`/`full`）；`verdict` 三值 `park`/`enough`/`stop` + 空=正在读 |
| 6 | 权限 | 继续/停由 agent 决定，不提问；滑向方向决策时提问 |
| 7 | 归属 | 新开 discipline `reading-triage`；台账列级归属（literature-recon 左三列、triage 其余六列） |
| 8 | 复用 | 跨课题复用读的是**记录上已有的节笔记**（`--item` 一次拿到全部首段），不是台账 |
| 9 | `grade`/`depth` 的写者 | 搜索轮**先填它实际读到的**，读轮可改正；`verdict`/判定依据/复看条件/日期只归读轮（见 §3.1 末） |
