# 方案：文档精简与合并（草案，未执行）

> **状态**：已执行（2026-10-23，契约 / 纪律 / 脚手架三个提交）。契约升 **Revision 38**；四条待裁都取
> 推荐项（见 §9 与 [`../decisions.md`](../decisions.md) §88）。规范语义在
> [`../../protocol.md`](../../protocol.md)；本文件只记录"为什么要改、改成什么形状"。
> 起因：junhan 认为这套预设写出的文档"太臃肿"，主因是日志式追加；上一轮（Revision 37）只把
> 库内笔记的"修复"改成了原地，其余七类成因未动。

## 0. 结论先行

1. **臃肿不是"写得详细"，是审计轨迹被当成了文档本身。** 每轮的"我读过什么、我回读了什么、
   我没判什么"被要求留在成品里，而真正的结论只有三五行。
2. **一条总原则**：产物只放**当前态**；一条判断只有**一个载体**；历史给 git 与一行
   `old → new`。这条原则上一轮只用于库内笔记，本方案把它用于层与层之间。
3. **"什么时候提示 agent 精简合并"**：不靠对话里临时提醒——那不可判、不可测、触发时机也不对。
   把闸放在**写入路径**上，三道时钟：写前 · 越线 · 结算（§3）。
4. 改动分两类：**A 类**（形式与路径，不动认识论）直接做；**B 类**（类型标注粒度、non-goals 下限）
   要 junhan 逐项裁定（§9）。

## 1. 八条成因（本轮扫描的证据）

| # | 成因 | 证据 | 成品里的样子 |
|---|---|---|---|
| 1 | 固定小节模板，空节也要留痕 | 10 条纪律的产物是 6–10 个固定节；[`research-scoping` §6](../../skills/research-scoping/SKILL.md#L67) 明写 "Seven fixed sections"；[:71](../../skills/research-scoping/SKILL.md#L71) 至少 3 条 non-goals；[`progress-sync`](../../skills/progress-sync/SKILL.md#L50)、[`literature-recon`](../../skills/literature-recon/SKILL.md#L129) 要求空态也写一句话 | 一轮只决定一件事，成品仍开 7–10 个标题，一半填 `none / not judged / left alone` |
| 2 | 过程证据进产物 | [`adoption-ruling`](../../skills/adoption-ruling/SKILL.md#L273) `## Ruler`、[:280](../../skills/adoption-ruling/SKILL.md#L280) `## Read-back`；[`direction-probe`](../../skills/direction-probe/SKILL.md#L255)；[`section-notes`](../../skills/section-notes/SKILL.md#L372)、[:395](../../skills/section-notes/SKILL.md#L395)；[`reading-triage`](../../skills/reading-triage/SKILL.md#L280) | 成品永久保留"我读过哪些文件、回读几行、没判什么" |
| 3 | 报告与产物没分流 | 只有 [`reading-triage`](../../skills/reading-triage/SKILL.md#L269) 明说报告回给属主；其余 7 条只写 "Report shape"，没说写文件还是回话 | agent 默认整份报告写进文件，下一轮再写一份 |
| 4 | 一份判断多层复写 | [`progress-sync` §3](../../skills/progress-sync/SKILL.md#L34-L42) 结论→Documents、日志→文件、要点→memory；[`experiment-protocol`](../../skills/experiment-protocol/SKILL.md#L151) 卡片外"再加一行 journal" | 同一结论三种措辞出现三遍 |
| 5 | Documents 按轮建、不合并 | [§4.1](../../skills/progress-sync/SKILL.md#L68) 只说"按主题"，13 条纪律里没有一条 `document_manage update` 指令；实测 `.mnemon/documents/active` **80 篇 / 521 KB**，43 篇标题带日期/版本/Revision | 每轮新增"0.14.0 发布""Revision 37 落地"一篇 |
| 6 | 只加不减的记账面 | journal 每轮新文件 + append-only（[§6.1](../../skills/progress-sync/SKILL.md#L91)）；reading log 追加（[`literature-recon`](../../skills/literature-recon/SKILL.md#L131)）；pitfalls append-only；[`references/README`](../../project-template/references/README.md#L14) "rows are added or advanced, never rewritten"；本仓库 [`decisions.md`](../decisions.md) 79 节 / 2457 行、[`releases.md`](../releases.md) 687 行 | 修正=加一行、发布=加一节 |
| 7 | 清单式审计 | [`section-notes` §6.2](../../skills/section-notes/SKILL.md#L361-L407) 的 Coverage/Provenance/Retired/Repaired 全是"每个对象一行"；direction 的 Seeds/Moves/Zero-cost kills；collection 的"每条被排除的单写一行" | 行数随语料线性增长，三行结论被几十行清单淹没 |
| 8 | 每句贴类型 + 缺席三件套 | [`cordis.patch.yml`](../../cordis.patch.yml#L44) "Every output must let the reader separate…"；[`protocol.md`](../../protocol.md#L346) "on every statement"、[:703](../../protocol.md#L703) `INV-DISC-2`；[:350](../../protocol.md#L350) 缺席声明带 targeted check + scope + hits | 每个论断后挂限定语；一次"没搜到"写成三句 |

另有一条**结果性证据**：上述模板叠加后，Documents 的单篇中位数 **78 行**（p90 101，最大 124）。
单篇不算长；**80 篇 × 78 行**才是"臃肿"的体感来源。

## 2. 总原则：新增常驻规则 12

英文原文（拟）：

```text
12. **One carrier, current state only.** A record states what holds now; a replaced statement
    survives as one dated line naming what replaced it, and the full history belongs to git and the
    log. A judgement has exactly one carrier — every other mention is a pointer (a path or an id).
    An empty section is not written.
```

中文释义与判据：

- **当前态**：文档回答"现在成立什么"，不回答"这一轮我先看了什么、后来改了什么"。
- **唯一载体**：同一条判断只在一处展开；其余位置只放指针。判据沿用 Revision 37 那条——
  "这条记录是不是某个判断的唯一载体？"只是从库内笔记推广到 journal / Documents / 产物三者之间。
- **空节不写**：`none`、`not judged`、`left alone` 只在**异常**时出现（"这一节没有"本身不是内容），
  一条说明即可，不占标题。
- **可判性**：读者能对一段文字问"它展开的是判断，还是指向判断？"并得到答案；这满足 `INV-DISC-1`。

## 3. 什么时候精简合并（三档时钟）

| 时钟 | 触发条件 | 判据（可判） | 动作 | 回执 |
|---|---|---|---|---|
| **写前** | 每次准备写一个文件或一个主题 | 同主题已有文档；目标文件已超预算；本节将为空 | 同主题 → `update` 不 `create`；超预算 → 先合后写；空节 → 不写 | — |
| **越线** | 单次写入会让文件越过预算 | 行数（表格与逐行日志不计）> 本产物预算 | 被取代的段落压成一行 `superseded <date>: <what> → <where>`；逐对象清单移入台账；正文留"总数 + 异常 + 指针" | 文件末尾一行 `compacted <date>: −N 行（<去向>）` |
| **结算** | `progress-sync` 每轮收口 | 同一主题的 Documents ≥ 2 篇；本研究 journal 文件 > 12 个 | 合并同主题 Documents（保留结论/已否决/未决，丢叙事），多余篇按 managed 流程归档；journal 不合并原文，只建 `journal/INDEX.md` | 本轮 journal 一行 `merged: <doc ids> → <surviving id>` |

**为什么不靠对话提示**：一句"文档有点长了，精简一下"不可判（多长算长？删哪段？）、不可测、
而且触发在写完以后。放在写入路径上，agent 每次落笔都会过一次闸；三道时钟覆盖三种尺度
（一次写入、一篇文档、一个研究）。

**N = 12 / 2 的来源**：12 个 journal 文件 ≈ 一个月的轮次量级；同主题 2 篇是"重复已经发生"的
最低证据，不猜第三篇。两个数写进纪律后可调，但不留空。

## 4. 预算（建议值，见 §9-B2）

正文行数**不含**表格与逐行日志（台账、Coverage、Reading log 按数据计，不设上限）：

| 产物 | 建议上限 | 依据 |
|---|---|---|
| 轮次 journal | 60 行 | 现中位 78 行 → 逼掉推测性小节；`Exploratory ideas` ≤3 行 |
| mnemon Document | 120 行 | 约当前 p90 的 1.2 倍；超了就说明该拆主题而不是换行 |
| `references/<topic>.md` | 60 行 | 台账表不计 |
| `adoption/<recordKey>.md` | 80 行 | |
| `directions/<topic>.md` | 80 行 | 表不计 |
| `rulings/*.md` | 100 行 | |
| `experiments/<id>.md` | 80 行 | 九个字段本身约 40 行 |
| `00_scoping.md` | 80 行 | 七节，但 Non-goals 不必凑三条（§9-B3） |

## 5. 逐文件改动

### 5.1 契约与常驻层（A）

| 文件 | 改什么 |
|---|---|
| [`cordis.patch.yml`](../../cordis.patch.yml#L31) | 新增规则 12（§2 原文）；规则 1 改为**按块**标注（§9-B1）；规则 5 的缺席声明压成一行 `absent: <check> · scope · N hits`；头部注释同步 |
| [`protocol.md`](../../protocol.md#L340) | §3 常驻表加第 12 行、规则 1/5 按裁定改；§4 三条不变式加一句"产物的形状是当前态，不是一轮的转写"；§8 新增 `INV-DOC-2`（一条判断一个载体），`INV-DISC-2` 按 B1 改 |
| [`tools/preset-selftest.mjs`](../../tools/preset-selftest.mjs#L330) | 规则数 `11 → 12`；路由断言不动（仍 13 条）。**不加**"模板不得有 Ruler"这类文本护栏——模板质量不是机械可判的，加了就是脆判据 |

### 5.2 纪律的 §6（A）

每条纪律的"Report shape"统一改成三段，并把固定节分成**必写 / 按需 / 只回话**：

```text
产物（写进文件）：<2–4 个必写节>
按需（有内容才写，一行即可）：<节名>
只回话（不落盘）：<过程与清单>
预算：正文 ≤ N 行；超预算先合再写（§3 越线）
```

逐条要点：

| 纪律 | 现在 | 改为 |
|---|---|---|
| `research-scoping` | 七节固定、non-goals ≥3 | 必写 Question / Boundary / Decidability；Non-goals、Prerequisites、Notation、Open items 按需；节名保留（后文按名引用） |
| `literature-recon` | 七节 | 必写 Search question / Reference ledger / Summary（≤10 行）/ Contradicting evidence；Gaps 一行；"非规范声明"移到文件头一行；Reading log 保留（数据） |
| `collection-sweep` | 七节 | 必写 This round / Enumeration / Screening 计数；Budget、Not swept、Not judged 各一行，不单独成节 |
| `reading-triage` | 七节 | 必写 Record / Question / Verdict / Basis；Depth 并入 Record 一行；Re-open 进台账行；Not judged 只回话 |
| `section-notes` Part I | 六节 | Coverage / Claimed / Missing 三节（表驱动）；Left alone 只列异常；Not established 一行 |
| `section-notes` Part II | **十节** | Record 一行；Coverage / Sections / Notes written 必写；**把 Unknown / Refusals / Retired / Repaired / Provenance 合并成一张 `Changes` 表**（note key · 动作 · 理由 · 去向 · 回读）——理由仍留在库里，只是不再各占一节 |
| `adoption-ruling` | 七节 | 必写 Record / Candidates / Rulings；Ruler → 回话一行；Refusals 只列异常；Read-back 一行；Index 只写 INDEX |
| `direction-probe` | **九节** | 必写 Record / Moves / Directions（Part II）；Seeds / Zero-cost kills / Scores 保留为表（数据）；Refusals 一行 + 指向；Ruler、Read-back 各一行 |
| `redteam-ruling` | 六节 | 必写 Claim / Objections / Evidence / Candidate verdicts；"Independence and limits" 一行；"What I do not claim" 一行 |
| `synthesis-plan` | 九项 | 九项本身是决策内容，不动；只把 "Question being answered" 移进文件头一行，Open items 按需 |
| `experiment-protocol` | 九字段 | 字段不动（都是承重的）；卡片加 80 行上限；"再加一行 journal" 保留 |
| `metadata-query` / `subagent-contract` | 无固定节 | 各加一句"报告回给属主/父代理，不落盘" |

### 5.3 `progress-sync`（A）

- §3 表：Documents 明确为"结论 / 已否决 / 未决的**当前态**"；memory 只放"每轮都要遵守的规则"
  与"跨会话主线一行"，不再收纳结论副本。
- §6.1 journal：六节改为"有内容才写"，整篇 ≤60 行；`Exploratory ideas` ≤3 行并指向
  `directions/`（若存在）。
- 新增 §6.4 **Compaction**：§3 的三档时钟、回执格式、禁止项（不删判断、不合并 journal 原文、
  合并前先读）。
- §8 checklist：加两条——"这次写入前合并了什么"与"有没有空节"。

### 5.4 模板（A）

- [`project-template/references/README.md`](../../project-template/references/README.md#L14)：
  "rows are added or advanced" 保留；补一句"一行说明是历史的全部，不在正文里再讲一遍"。
- [`00_scoping.md`](../../project-template/00_scoping.md)：保留 TODO 结构；Non-goals 的 "at least
  three" 按 §9-B3 裁。

### 5.5 本仓库 docs（C，单独裁，见 §9-B4）

若同一轮做：[`decisions.md`](../decisions.md) 每条 ≤40 行（"起因/裁定/落点/边界"四段，测量移进
[`releases.md`](../releases.md)），releases 每条 ≤60 行。追加与节号不动。

## 6. 迁移（不回溯）

- **现有 81 篇 Documents 不批量重写**（含本轮稍后自动生成的一篇）。下一次 `progress-sync` 对"同主题 ≥2 篇"执行合并：
  15 篇发布类 → 1 篇发布史；13 篇 Zotero → 1–2 篇；10 篇 section-notes → 1 篇；27 篇 Revision
  按主题并入。标题去掉日期/版本/Revision 标记，旧篇按 mnemon 归档流程处理。
- **现有研究项目的 journal 与产物不回溯**；新规则只作用于下一轮。回溯要属主逐文件点头，不在本方案内。

## 7. 验证

```powershell
node tools\preset-selftest.mjs .tmp\composed-web.txt   # 12 条规则、13 条路由、persona 成本
node tools\skills-selftest.mjs                          # 纪律名册与前言
node tools\doc-selftest.mjs --negative-controls         # README / coverage / protocol 的声明分工
node tools\scaffold-selftest.mjs                        # 模板与契约 §7 同一份名单
node tools\release-check.mjs --local
```

负向控制：删掉规则 12 → `preset-selftest` [5] 红。**模板层面的"空节/预算"没有机器护栏**，
按 §5.1 的决定，靠人读；不为它造脆判据。

## 8. 提交拆分（按依赖层）

1. **契约**：`protocol.md` + `cordis.patch.yml` + `preset-selftest`（规则 12、B1/B2 裁定结果）。
2. **纪律**：12 条 §6 + `progress-sync` 压缩规则。
3. **模板与读者面**：`project-template`、`README`、`docs/coverage.md`、`docs/overview.md`、
   重生成 `docs/toolchain.md`（`preset-release` §2 的反向重扫）。
4. （可选）本仓库 `decisions.md` / `releases.md` 的条目预算。

## 9. 待裁（junhan）

| 编号 | 问题 | 选项 | 裁定（2026-10-23，junhan） |
|---|---|---|---|
| B1 | 类型标注放在什么粒度？ | (a) 每句（现状） (b) 整段/整节默认，只标偏差 (c) 事实默认不标，只标推断与探索 | **(b)**：保住"读者能分开三类"，但不再每句挂尾巴 |
| B2 | 预算数值是否采用 §4？ | 采用 / 调整后采用 / 只给 journal 设上限 | 采用 §4 |
| B3 | `research-scoping` 的 "at least 3 non-goals" 是否放宽？ | 保持 3 / 改为 1–3（有内容才写） | **改为 1–3**：凑数会制造假边界 |
| B4 | 本仓库 `decisions.md` / `releases.md` 是否同一轮压缩？ | 同一轮 / 下一轮 / 不动 | **下一轮**：它与预设输出是两条线，混在一轮会让裁定失焦 |
