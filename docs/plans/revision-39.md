# 方案：文档写到"能决定"，不是"能核对"（草案，未执行）—— Revision 39

> **状态**：已执行（2026-10-23，三个提交）。契约升 **Revision 39**；§12 的四个小项按"我定的"落地，
> junhan 审阅时未改。规范语义在 [`../../protocol.md`](../../protocol.md)；本文件只记录"为什么要改、
> 改成什么形状"。
> 起因：junhan 认为 append→inplace 只解决了一半——预设写出的文档仍有浓重的审计味。触发是一场具体
> 争执：GPT 审了一份《科学问题台账》，说"审计非常严谨，但阅读成本高"，并举例——`A2` 一行同时描述
> `T2/T4/T18` 的分析差异、预测判定、混杂来源、统计限定以及 `T21` 的预注册状态。
> 那份台账是**课题级**产物（预设管不到它的 16 个问题怎么组织），但写它的手法来自预设：本方案只改
> 手法，不改任何一个具体课题的裁定。

## 0. 结论先行

1. **上一轮删的是"重复与历史"，这一轮删的是"辩护密度"。** 一条判断现在只出现一次，但出现的那一次
   仍然自带出处、日期、限定、混杂与状态——每行都对，每行都不好用。
2. **两条判据要合起来用。** 上一轮是**载体测试**："这条判断是不是唯一的载体？"这一轮加**分辨率
   测试**："删掉这段，读者还能不能核？还能不能决定？"——能核不能决定 → 它是台账，移出台账格；
   都不能 → 删；能决定 → 留，且放到开篇。
3. **四条机制 + 一条准入（M1–M5）**，全部落在**已有的句子或已有的预算旁**：不新增纪律、不新增
   产物、常驻规则仍是 12 条。
4. **唯一新增的机器护栏**是"有预算就必须有删减次序"（`skills-selftest`）。散文质量仍不造护栏。

## 1. 还剩哪几条机制（本轮扫描的证据）

| # | 机制 | 证据 | 成品里的样子 |
|---|---|---|---|
| M1 | **逐条盖章**：每条记录都要 Source + Time | [`progress-sync` §3.1](../../skills/progress-sync/SKILL.md#L44) `Every record must carry Class · Source · Time`；[`literature-recon` §6.2](../../skills/literature-recon/SKILL.md#L124) 摘要每行带 grade | 一行的出处其实是块自己的载体，日期什么也不改变；一行的 grade 与实际用途无关 |
| M2 | **一种文件兼两种形状**：台账（每对象一行）与状态记（散文）没有分开 | [protocol §4](../../protocol.md#L461) 只说"形状是当前态"；[`progress-sync` §6.2](../../skills/progress-sync/SKILL.md#L113) 把 `evidence` 放进 120 行散文 | 每个对象一段分析：既太长不能读，又太粗不能比。**这就是那份台账的病：行的格子里装了论证** |
| M3 | **只有预算，没有删减次序**：10 个文件、11 处文件级预算，0 处次序 | [§4 预算表](compaction.md#L71) 的产物；13 处 `Budget —` 句 | 超预算时先丢限定（最好删），留下复述（最好写） |
| M4 | **开篇不承担结论**：规则 12 只说"只写当前态"，没说"先写当前态" | [`cordis.patch.yml` 规则 12](../../cordis.patch.yml#L55) | 读者要读到第三段才知道现在成立什么 |
| M5 | **没有准入**：新增条目不必说它取代谁 | [`research-scoping` §4.2](../../skills/research-scoping/SKILL.md#L56) 只挡"文献里的旧工作" | 换个名字重提旧问题，台账越长、主线越淡 |

## 2. 判据（可判）

```text
载体测试   这条判断是不是唯一的载体？        是 → 展开；否 → 指针        （Revision 38，保留）
分辨率测试 删掉这段，读者还能核？还能决定？  都能 → 留且前置；只能核 → 进台账；都不能 → 删
```

**为什么分辨率测试不是载体测试的重复**：载体测试是二值的（是不是唯一载体），它管"一条判断出现
几次"；分辨率测试管"出现的那一次写多深"。一条判断可以是唯一载体，同时又把"如何核"和"谁在什么时候
读到了什么"全塞进去——Revision 38 之后剩下的味道，就在这一层。

## 3. M2：台账与状态记是两种形状

**问题**：预设让同一份文件既当台账又当状态记。台账的判据是"能不能沿一列往下比"，状态记的判据是
"读完第一段能不能停"。混在一起时两边都失败：格子里的论证无法比较，段落里的逐对象清单无法阅读。

**拟改**（[`protocol.md`](../../protocol.md) §4，在三条不变式后加第四条）：

```text
- An artifact section is a **ledger** or a **state note**, and never both: a ledger carries one row per
  object and fields in its cells, while a state note carries claims in prose and points at the ledgers
  that hold the per-object detail. A cell that has grown an argument is a state note wearing a table,
  and it is then neither: the argument belongs in the note, and the cell keeps the value it is read for
  plus the pointer.
```

**新不变式**（[`protocol.md`](../../protocol.md) §8）：

```text
| `INV-DOC-3` | A ledger row is read as a row: each cell holds a value, a key, or one short phrase,
  and the argument a cell would need is carried by the state note it points at. | A row that argues
  cannot be compared down a column, which is the only thing a ledger is for; the same text in a note
  is where an argument is read. |
```

**落点 [`progress-sync` §6.2](../../skills/progress-sync/SKILL.md#L113)**：Document 明确为状态记；`evidence`
一节只放指针；某主题需要的清单是台账，Document 指向它而不是装下它的行。

**判据**：任取一个格子，问"这是值/键/短语，还是一段论证？"；任取一个段落，问"这是一个主张，还是
一行对象？"——两个问题都能当场答出来。

**为什么这不违反"一条判断一个载体"**：台账的一行是**一个读数的裁定**，状态记的一段是**一个综合
判断**；它们是不同的判断，所以两个产物不冲突。缺的从来不是"允不允许两个文件"，是"哪个文件该长
什么样"。

## 4. M3：给每一处预算配一个删减次序

**拟改**（`protocol.md` §4，第五条 bullet，写一次全句）：

```text
- A budget without a **cut order** is a wish: told only to be shorter, a writer drops what is cheapest
  to drop — the load-bearing limit — and keeps what is easiest to keep — the evidence restated. So an
  artifact with a line budget states the order it gives things up in: evidence restated from its
  carrier, then the second and later reasons for one claim, then per-object detail the ledger already
  holds, then how the statement changed. The load-bearing limit, the falsification condition and a
  rejected alternative's ground are never what is cut.
```

**纪律里的同一句**（10 个文件、11 处文件级预算，逐处替换现有 `Budget —` 句的尾部）：

```text
**Past it, cut in this order: evidence restated from its carrier → a second reason for the same claim
→ per-object detail a ledger holds → how the statement changed. Never cut the load-bearing limit or
the falsification condition.**
```

**机器护栏**（[`tools/skills-selftest.mjs`](../../tools/skills-selftest.mjs)，新循环）：

```js
for (const skill of skills) {
  if (!/\*\*Budget/.test(skill.content)) continue
  check(skill.content.includes('cut in this order'), `a budget states its cut order: ${skill.name}`)
}
```

**判据**：超预算时按序删完，文件还能不能回答它原本要回答的问题？能 → 删对了；不能 → 删到了承重项。

**为什么在 11 处重复而不是只写进契约**：纪律是 agent 实际加载的文本，契约不在它的上下文里。重复
的风险由上面那条自测兜住——它断言的是"有预算就有次序"，不是"次序的措辞一致"。

## 5. M1：出处与日期按载体走，不按行盖章

**落点一**（[`progress-sync` §3.1](../../skills/progress-sync/SKILL.md#L44)，整节改写）：

```text
### 3.1 What every record states, once

- **Class** — the block's footing, stated once; a fact is unmarked, and a block whose class differs
  from its neighbours is marked.
- **Source** — named once, where the claim enters the record (which file / which ruling / which
  search). A later mention of that claim is a pointer, not a fresh citation.
- **Time** — only where the line snapshots something outside the record (a count or a status as read,
  a date a search was run) or where order carries meaning. A conclusion is not dated.
```

**落点二**（[`literature-recon` §6.2](../../skills/literature-recon/SKILL.md#L124) 摘要节）：

```text
2. `## Summary of findings` — ≤10 lines, each carrying its source id; the grade only where it changes
   what the line may be used for (a `B` or `C` line is a lead, not evidence).
```

**落点三**（[`literature-recon` §3.3](../../skills/literature-recon/SKILL.md#L79)）：

```text
- **Every** claim you write must carry at least one source — once, where the claim enters this file;
  a row that already carries it is cited by its row.
```

**判据**：删掉这个出处/日期/等级，读者还能不能核？能 → 它该是指针；不能 → 它承重，留下。

## 6. M4：规则 12 加"先说当前态"

**拟改**（[`cordis.patch.yml`](../../cordis.patch.yml#L55)，仍 12 条，不加第 13 条）：

```text
12. **One carrier, current state first.** A record states what holds now — and states it first: its
    opening block is where a reader stops, so it carries the conclusion that holds and what would
    change it. A replaced statement survives as one dated line naming what replaced it, and the full
    history belongs to git and the log. A judgement has exactly one carrier — every other mention is
    a pointer (a path or an id). An empty section is not written.
```

配套三处必须同改，否则契约与实现不一致：

- [`protocol.md` §3](../../protocol.md#L373) 常驻表的第 12 行（同义压缩）；
- [`protocol.md` §8](../../protocol.md#L746) `INV-DOC-2` 增"and states it first — its opening block carries
  the conclusion and what would change it"；
- [`tools/preset-selftest.mjs`](../../tools/preset-selftest.mjs#L334) 断言字符串改 `'One carrier, current state first'`。

**判据**：只看第一屏，读者能不能说出"现在成立什么 / 什么会推翻它"。

**为什么并进规则 12 而不新增一条**：常驻规则的每一条都在每个请求里付费（persona token），而"先说
当前态"与"只写当前态"是同一个承诺的两面——都为了"读者停在开篇"。分开写会让第 12 条变成两条
互相引用的规则。

## 7. M5：新增条目须指名它取代或细化谁

**落点**（[`research-scoping` §4.2](../../skills/research-scoping/SKILL.md#L56) 排除表加一行）：

```text
| A candidate restates a question the study already has, under a new name | Return it with the path of
  the existing item; a candidate that narrows or refines one names it |
```

**判据**：新条目指不指得出它细化或取代的那一条？指不出 → 它是复述。

## 8. 落点与顺序

| 文件 | 改动 | 层 |
|---|---|---|
| [`protocol.md`](../../protocol.md) | §3 规则 12 行；§4 新增两条 bullet（形状二分、删减次序）；§8 `INV-DOC-2` 改写 + 新增 `INV-DOC-3`；头部加 Revision 39 段 | 契约 |
| [`cordis.patch.yml`](../../cordis.patch.yml) | 规则 12 标题与正文；头部注释的 Revision 记录 | 契约 |
| [`tools/preset-selftest.mjs`](../../tools/preset-selftest.mjs) | 断言字符串改 `current state first` | 契约 |
| [`tools/skills-selftest.mjs`](../../tools/skills-selftest.mjs) | 新增"有预算必须有删减次序"循环 | 契约 |
| [`skills/progress-sync`](../../skills/progress-sync/SKILL.md) | §3.1 改写；§6.2 改为状态记 + 指针；§6.4 越线行对齐次序；§8 checklist 加一条 | 纪律 |
| [`skills/literature-recon`](../../skills/literature-recon/SKILL.md) | §3.3 一句；§6.2 摘要行不再逐行带 grade | 纪律 |
| 其余 8 条纪律 | 各自预算行加同一句删减次序（`research-scoping` 另加 §4.2 准入行） | 纪律 |
| [`docs/coverage.md`](../coverage.md) | `progress-sync` 行补"状态记 / 台账"的分工 | 读者面 |

**执行顺序**：契约 → 纪律 → 读者面。**81 篇 Documents 的合并排在本方案落地之后**——按旧形状合完
还要按新形状再合一次；合并时每篇幸存者按状态记写，逐对象清单留在台账里。

## 9. 不做 / 已知边界

- **不重写任何课题的台账**（含那份 16 问题台账）。问题怎么按决策价值组织、保留哪几条科学边界、
  补哪 2–3 个新问题——那是课题属主的裁定，预设只给形状规则。
- **不重写现有 81 篇 Documents**；下一次 `progress-sync` 按新形状合并并写回执。
- **不为散文质量造护栏**。"论证密度"不是机械可判的；本轮只把"有预算就有次序"这一件可判的事做成
  断言。
- **不新增纪律、不新增产物、不新增常驻规则**（仍 12 条、13 条纪律）。
- **本轮不发布**。`decisions.md` §89 随改动记录；`releases.md` §90 与版本号留到发布那一轮。

## 10. 验证

```powershell
node tools\preset-selftest.mjs .tmp\composed-web.txt   # 12 条规则、13 条路由、persona 成本
node tools\skills-selftest.mjs                          # 名册 + 新增的"预算必有次序"断言
node tools\doc-selftest.mjs --negative-controls         # README / coverage / protocol 的声明分工
node tools\scaffold-selftest.mjs                        # 模板与契约 §7 同一份名单
node tools\release-check.mjs --local
```

**负向控制**（每次改断言都跑一次）：删掉某条纪律的删减次序句 → `skills-selftest` 红；把规则 12
改回旧标题 → `preset-selftest` 红。两者恢复即 PASS。

## 11. 提交拆分（按依赖层）

1. **契约**：`protocol.md` + `cordis.patch.yml` + 两个自测（规则 12、`INV-DOC-2/3`、删减次序断言）。
2. **纪律**：10 个文件的预算行 + `progress-sync` §3.1/§6.2/§6.4 + `literature-recon` 两处 +
   `research-scoping` §4.2。
3. **读者面与账**：`docs/coverage.md`、`docs/decisions.md` §89。

## 12. 我替你定的四个小项（都可推翻）

| # | 选择 | 备选 | 理由 |
|---|---|---|---|
| a | 规则 12 改标题为 **current state first**，不新增第 13 条 | 新增一条常驻规则 | 两者是同一承诺的两面；常驻规则每条都在每个请求里付费 |
| b | 新增 **`INV-DOC-3`** | 并入 `INV-DOC-2` | 载体与形状是两个可分别失败的检查；并进去会让一条不变式有两个失败点 |
| c | 删减次序在 **11 处同句重复** + 一条自测 | 只写进 `protocol.md` §4 | 纪律是实际加载的文本；重复由自测兜住，不靠人记 |
| d | M5 只加一行**排除条件**，不加第 7 条判据 | 在 §3 判据里加"distinct" | 判据表已经 6 条；准入是"什么时候退回"，属于排除表 |
