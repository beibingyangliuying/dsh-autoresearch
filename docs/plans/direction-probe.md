# 方案：`direction-probe` —— 从已裁定记录里榨出可被杀死的候选（Revision 36）

> **状态**：已落地（未发版）。剩两件事：① 随下一个 minor 发布（`preset-release` 那一套）；
> ② 在真实课题上跑第一轮——判据是它能否从一份**既有的** `adoption/` 台账里挖出至少一条 `surviving`，
> 以及种子的六个分类里是否有一类长期为空。
>
> 这份文档记录的是"一轮怎么决定的、执行到哪"。规范语义在 [`../../protocol.md`](../../protocol.md)，
> 判定理由在 [`../decisions.md`](../decisions.md) §86，本文件不重复它们。

## 一、要解决的问题

**前提核对（两条，都成立）。**

1. 本预设的"裁决"实际是三层：`reading-triage` 把（课题 × 文献）的 `depth` / `verdict` 写进该课题台账；
   `adoption-ruling` 把一篇 A 级论文逐项裁定成 `adopt` / `adopt-modified` / `reference-only` / `reject`
   的台账；`section-notes` 提供带 `/agent-note` / `/reviewed` / `/imported` 来源的 `/section-N` 解释。
2. 缺口是仓库自己登记过的：`protocol.md` §9 曾把"方向发散循环"列为 deliberately deferred，
   `docs/decisions.md` §11 记的是"等真实课题暴露需求再做"，`synthesis-plan` 第一句写"不探索"。

**实测到的那一处浪费**：改动前的 12 份纪律正文里 grep `adoption/`，只有 `adoption-ruling` 自己读写。
`adoption-ruling` §3.6 要求拒用项带理由（*the reason is what saves the next round*），而那批理由没有任何
纪律消费。**缺的不是"想法"，是"没人读被拒的那一半"。**

## 二、形状：一个纪律两半

照 `section-notes` §0 的先例（§0 决定哪一半跑，报告与验收清单各分两套）：

| 半边 | 何时跑 | 产物 |
|---|---|---|
| **Part I — mine**（默认） | 拒用项 / 未验前提 / 到期的 `park` / 两份来源矛盾 / 缺口 / 裁定项边界，够得着且便宜 | 候选招的行 |
| **Part II — compose** | 两条以上 `surviving` 招不能同时成立，或属主点名发散 | 方向候选（冲突的解法） |

**三处硬约束**：六类种子是闭词表（指不到具体行的念头标 `[exploratory]`，不打分、不进 Part II）；每条招必须
有一条可执行的杀死条件与阈值；方向的新增成分有且仅有一个、必须指回种子，缺的报 `needs-a-move` 而不是补上。

**招的七字段**：ID（`M-<topic>-NN`）· 种子（`S1`–`S6` + 定位）· 猜想（带量词与阈值）· 服务哪个问题
（并声明不撞非目标）· 杀死条件 · 四轴分（可杀性 / 相关 / 代价 / 位置不重复，各 0–2）· 状态
（`candidate` → `killed` / `surviving` / `composed`）。

**方向**：ID `D-<topic>-NN`；采纳哪些招、放弃哪些（代价落在谁身上）、**唯一**的新增成分 + 种子、与已否方向的
区别、能把它和对手分开的那次观察、代价；三个答案 `surviving` / `killed` / `needs-a-move`。

**词表是故意不复用的**：`collection-sweep` 的 `candidate` 队列、`adoption-ruling` 的 `candidate` 状态各是一套
状态机；本纪律的单位叫 `move`，正是为了让三份台账扫一眼就分得开。

## 三、契约改动（Revision 36）

| 位置 | 改了什么 |
|---|---|
| 版本头 | 新增 Revision 36 段：解除"方向循环"的暂缓，并写明两把锁（种子 / 杀死条件 / 单一新增成分） |
| §4 名册 | 加 `direction` 一条，插在 `adoption` 之后（它读的正是 adoption 的产物） |
| §4 末尾 | 三条自明的纪律判据，新增第三条："候选说不出它会在哪个观察上失败 ⇒ 产出的是意图，不是检验" |
| §7 | 层枚举补 `direction ledgers` —— 否则新层一落地 §7 就过期 |
| §8 | `INV-IDEA-1`（招的三要件）· `INV-IDEA-2`（方向 = 存活招 + 恰好一个新成分 + 成分可溯源） |
| §9 | 原 "No direction-divergence loop" 改写为 "No unseeded divergence"：生成只许从已裁定产物派生，凭空发散仍不做 |

## 四、机械面（每一处都被现有自测卡着）

| 文件 | 改动 | 卡它的自测 |
|---|---|---|
| `skills/direction-probe/SKILL.md` | 新增（英文正文，九节骨架 + §0） | `skills-selftest` 的计数 |
| `tools/skills-selftest.mjs` | `12` → `13`；期望名单加一行 | 自身 |
| `tools/preset-selftest.mjs` | `ROUTED_NAMES` 加一行；散文数词自动比对 | `[2]` / `[5]` |
| `cordis.patch.yml` | 头注 `twelve` → `thirteen`；预设描述插 `direction`；路由块加一条 bullet | `[2]` / `[5]` |
| `package.json` | description `twelve` → `thirteen` | `[2]` |
| `README.md` | `Twelve` → `Thirteen`（**不点名字**：`doc-selftest` DOC-6 禁止散文重复符号） | `[2]` / DOC-6 |
| `surface.md` | 概念 ↔ 符号加一行 | DOC-5 双射 |
| `docs/coverage.md` | 部分 ↔ 覆盖加一行；"借鉴与质疑是按需的"扩成"借鉴、探路与质疑" | DOC-8 / DOC-9 |
| `docs/overview.md` | 流程表插入"探路（新）"一行 | — |
| `skills/synthesis-plan/SKILL.md` | §1 两条触发 · §2 ruler 第五项 · §4.2 两行就地排除 | — |
| `docs/decisions.md` | §86；§11 暂缓表那一行改成"已解除一半"并指过来 | — |

**路由 bullet 的分工**（三者相邻，必须一句话分开）：**探**（这条能不能被杀）· **疑**（打）· **选**（承诺）。
这条 bullet 384 字符 ≈ 107 token/请求；合成后 persona 5,812 字符（约 1,614 token/请求）。

## 五、验证（2026-10-22 实跑）

```text
23 项离线自测                    全 exit 0
node tools\preset-selftest.mjs .tmp\composed-web.txt    PASS（13 条路由 bullet / 13 个名字各有 bullet）
node tools\doc-selftest.mjs --negative-controls          PASS（10 条负向控制全部真红）
node tools\toolchain-page.mjs --check                    25 条出处全部成立
```

`preset-selftest` 的 `[2]` 才是这一轮真正的守门人：它把三处散文计数与 `skills/` 目录比，
把 `ROUTED_NAMES` 与目录比，`[5]` 再把每个名字与合成后的 persona bullet 比 —— 少一条名字、多数一个数、
bullet 丢一行，三种漂移各有一次独立的失败。

## 六、没做、以及为什么

| 没做 | 为什么 |
|---|---|
| 拆成两个纪律（招级 / 方向级） | 依赖是单向的（方向由招供给），拆开要把锚定规则写两遍而"方向"那遍最先漂；路由成本线性，且"两条路线冲突"已有两条 bullet 在管 |
| 凭空生成 N 个互异方向 | 淘汰判据对不存在的东西打不了分 —— 这正是原 §9 那条 non-goal 的理由，半个仍保留 |
| 新增一个 helper 程序 | 输入全是工作区已有文件，输出一份文档，没有新通道、没有需要授权的写 |
| 预建 `directions/` 目录 | 契约 §7：每个层由第一条写它的纪律创建并报路径 |
| 让 Part II 自己补上缺的成分 | 组装时补上，等于这条路线已经替自己回答了它本该检验的问题 |
| 在 `backlog.md` 另开一行 | 这一条原先只活在 §11 的暂缓表里，本轮把那行改指 §86 即可，不制造第二处账 |

## 七、下一轮该盯什么

1. **首轮实测**：拿一份**现成的** `adoption/` 台账跑 Part I，看能不能挖出 ≥1 条 `surviving`。挖不出，说明
   六类种子太窄或台账写法与种子对不上——那是种子的缺陷，不是课题的。
2. **杀死条件是不是真的被执行**：如果连续几轮所有招都停在 `candidate`、没人去跑那次观察，说明第 4 条
   预算（一轮 10 条）与"最便宜观察"的坡度需要在纪律里再压一格。
3. **`needs-a-move` 的比例**：它若长期为 0，方向级就退化成"直接组方向"；它若长期为 1，说明 Part I 供不上。
   两个极端都要在报告里显形，而不是被默默略过。
