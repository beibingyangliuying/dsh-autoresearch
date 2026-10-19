# 05 — 笔记管线草案：tag 身份、claim/rewrite、digest 投影

**状态：Phase 1–6 已实施（2026-10-19）；Phase 7 已跑 187 条顶层 tag 迁移，剩余 38 条点号 / 153 条无 marker / 34 条 retired 待后续批次。** 起草 2026-10-19 · 依据：本日对话 + 真库只读普查。实施记录见 [`docs/01_decisions.md` §58](01_decisions.md#L1638)。

## 0. 一句话

把"状态"从正文搬进 tag：章节笔记用 `/section-N` 声称自己解释哪一节，工具不再解析散文；粘贴笔记先读、再 `--claim` 或 `--rewrite`；章节笔记写完后，从它们合成一条 `/digest`（论文级投影）；裁定按需，不进主流程。

## 1. 要解决的问题

| # | 现状 | 后果 |
|---|---|---|
| 1 | 身份写在正文的隐形 marker 里 | 应用改正文会吃掉 marker；本库 **153/378** 条已丢 |
| 2 | 工具用首段正则猜 claim | 猜不出的笔记无法 claim/tidy/retire；猜宽了会把整篇总结误判成节笔记 |
| 3 | 粘贴笔记没有 claim/rewrite 通道 | 只能报告，不能纳入覆盖，也不能改成我们的格式 |
| 4 | digest 被当成"阅读回执"，写在读完后 | 本库 **0 条**；且它无法承担"论文级总结"的角色 |
| 5 | 裁定被误当成每篇必做 | 不做实现的课题被无谓的台账拖住 |

## 2. 实测（2026-10-19，只读）

| 口径 | 数值 |
|---|---|
| live 笔记 | 378 |
| 带 section marker | 225 |
| 其中带**点号** section marker（旧工具的子节） | 38（9 条记录） |
| 无 marker（首段仍写"文章第N节"） | 153（40.5%） |
| 带 digest marker | 0 |
| 带 `/retired` | 34 |
| 带 `/replaces-` | 15（15 条笔记） |
| 带任意 tag | 49 |
| 应用包裹体 | 147 |
| 回收站 | 481 项 / 323 note / 0 digest marker |

点号 marker 的分布：9 条记录，最多 10 条，其次 5 · 5 · 4 · 4 · 3 · 3 · 2 · 2。

结论：

1. **40.5% 的节笔记已经丢了 marker**，且 378 条 live 笔记全部是节笔记——tag 身份不是优化，是修复。
2. **没有证据表明 digest 曾落库**：live 0 条带 digest marker；153 条无 marker 笔记的首段没有 "Read" 形态；回收站 0 条。所以现在改它的语义没有迁移成本。
3. 34 条 `/retired` + 15 条 `/replaces-` 说明归退/替换已经在用；删除干跑一上线就有真实样本。
4. 无 marker 的笔记不是"10 条"，是 **153 条**；迁移是一次 378 条的战役，不是一次小修。
5. **38 条旧子节笔记还在库里**（旧工具写的点号 marker）。旧工具会读它们并折回父节；新方案不写也不读点号，这 38 条进 `unknown`，迁移时合并成顶层节或退休。

## 3. 状态模型

| tag | 含义 | 写 | 读 |
|---|---|---|---|
| `/section-N` | 这条笔记声称解释顶层第 N 节 | create · claim | plan · create · claim · replaces |
| `/imported` | 这条 `/section-N` 来自导入/粘贴，仍可原地刷新 | claim · rewrite | rewrite · plan |
| `/digest` | 这条笔记是某条记录的论文级 digest | digest | plan · digest · adoption |
| `/retired` | 不再使用：不计覆盖、可删 | retire | 所有读侧 |
| `/replaces-KEY` | 本笔记取代已退休的 KEY | create | plan · delete |

规则：

- 大小写不敏感比较；写回小写。
- 一条笔记多个 `/section-` tag → `ambiguous`，不计覆盖，要求先修正。
- **点号标签不存在**：不写 `/section-N.M`，也不读旧点号；旧点号笔记进 `unknown`（38 条，迁移时处理）。
- **不再写、不再读任何隐形 marker**（section 与 digest 都不再写）。
- `/imported` 不是身份，是生命周期类：它让 claim 后的粘贴笔记仍可原地刷新；agent 自己 create 的笔记不带它。

## 4. 章节笔记的生命周期

### 4.1 create

`--section N --file ...`：

- 写 `/section-N`；如有 `--replaces OLD`，再加 `/replaces-OLD`。
- **拒绝只有一种**：§N 已被活笔记 claim。没有父/子归并，因为不写也不读点号。
- 正文仍是 HTML；不再写 marker。

### 4.2 claim

`--claim --note KEY --section N`：

- 只打 tag，正文一字不动。
- **被 claim 的笔记如果是无 tag 的导入笔记，同时写 `/imported`**；它标记"这条笔记来自导入"，让 claim 后仍可原地刷新。
- 拒绝：§N 已被别的活笔记 claim；笔记已 `/retired`（先 `--retire --undo`）；一条笔记多个 section tag（先修正）。
- 笔记已有 `/section-M` 且 M≠N：打印 `§M -> §N`，按 re-claim 处理；同样要做覆盖检查。已有 `/imported` 则保留。
- 这是粘贴笔记进入覆盖的正路：读一次、claim 一次，下一轮不用再猜。

### 4.3 tidy — 删除

- `--tidy`、`normalizeMath` 及其机械修复规则**全部删除**；`--item KEY --tidy` 一并删除。
- 理由：写笔记只由 agent 提供正文，工具不自动改内容；坏公式只能由 agent 看文字层/页图后重写。
- 坏公式的两条路：无 tag 的导入笔记 → `--rewrite`；`/section-N`（非 `/imported`）的记录 → `--retire` + 新写。
- 这也去掉 `--tidy` 的两个历史难题（应用包裹体的换行、逐字节回读）。

### 4.4 rewrite

`--rewrite --note KEY --file PATH [--section N]`：

- **对无 tag 的导入笔记，或 `/section-N` + `/imported` 的导入笔记**开放。
- 干跑打印：旧/新可见文本摘要、字符数、tags、备份路径、写请求。
- `--write` 前先把旧正文写到 `<cwd>/.section-notes/<recordKey>/rewritten-<key>-<timestamp>.html`；备份失败就中止。
- 带 `--section N` 时：
  - 无 tag：检查 §N 未被别的活笔记 claim；成功后加 `/section-N` + `/imported`（保留原有 tags）。
  - 已有 `/section-N` + `/imported`：允许刷新；`--section M` 与 N 不同时按 re-claim 处理，覆盖检查后更新 tag。
  - 已有 `/section-N` 但没有 `/imported`：拒绝（记录 → `--retire` + 新写）。
- 拒绝：笔记已 `/retired`；`--section` 已被别的活笔记 claim；带 `/section-N` 但没有 `/imported`。
- **claim 之后**：带 `/imported` 仍可原地刷新；不带的是记录，走 `--retire` + 新写。

### 4.5 retire

`--retire --note KEY --reason "..."`：

- **任何笔记**都可退休，不再要求 claim。
- 正文不动；加 `/retired`；`--reason` 仍是必填。
- `--undo` 去掉标记；笔记重新计入覆盖（如果它有 claim）。
- 退休的 digest 也走这条；digest 工具必须跳过它（§5）。

### 4.6 replaces

- 旧笔记必须已 `/retired`。
- 旧笔记有 `/section-M` 时，新的顶层节必须是 M；旧笔记无 claim 时不比较（它本来就不覆盖任何节）。
- 新笔记带 `/replaces-OLD`；plan 的 `retired` 行显示 successor。

### 4.7 delete

`--delete --note KEY`：

- **只对带 `/retired` 的笔记**开放；否则 `REFUSED`。
- 本轮只干跑：打印 claim/tag、父条目、字符数、首段、successor、无 successor 警告、digest 警告、`DELETE /api/users/0/items/<key>`、三条不可逆事实。
- `--write` 本轮显式拒绝（exit 2，"write path not implemented"）。
- 删除后 successor 的 `/replaces-KEY` 会悬空；干跑必须把这条说出来。

### 4.8 生命周期由 tag 决定

| 笔记 | 原地改正文？ | 更新方式 |
|---|---|---|
| `/section-N`（记录，无 `/imported`） | 否 | `--retire` + 新写，`/replaces-OLD` |
| `/section-N` + `/imported`（导入后 claim） | 是 | `--rewrite`，备份 + 版本守卫 |
| `/digest`（派生视图） | 是 | PATCH 同一条，备份 + 版本守卫 |
| 无 tag（导入/草稿） | 是 | `--rewrite`，备份 + 版本守卫 |

这张表是"工具不再解析散文"的回报：类型是显式的，规则按类型分，不用猜。

## 5. digest：章节笔记的投影

### 5.1 语义

- 一条论文一条 `/digest`，记录"整篇的方法是什么"。
- **它从 `/section-N` 笔记合成，不重新读 PDF**；每一句都要能追到某条节笔记，不引入笔记里没有的事实。
- 它只覆盖有笔记的节；必须写明覆盖了哪些节，以及"结果/结论不在本 digest 内"。

### 5.2 生命周期

- **create**：当 record 没有活 `/digest` 时创建，写 `/digest`。
- **refresh（原地）**：笔记变化后，PATCH **同一条** `/digest` 的正文；版本守卫；旧正文先备份到 `<cwd>/.section-notes/<recordKey>/digest-<timestamp>.html`；读回可见文本。**不 retire、不新写、不换 key、不留墓碑。**
- **no-op**：新文本与活 digest 的可见文本相同 → `ALREADY RECORDED`，不写。
- **retire**：只有"这条 digest 整体作废"才走 `--retire`；之后可再 create 一条新的（可选 `/replaces-OLD`），但这不是日常更新路径。
- 工具改造落在 `zotero-note.mjs`：
  - `findDigestNote` 改为找 `/digest` tag 且不是 `/retired`；
  - 去掉 append 语义（它把"回执日志"和"投影"混在一起了）；
  - 文本不同时走 refresh：干跑打印旧/新可见文本摘要、备份路径、`PATCH /items/<key>`；`--write` 才写；
  - 版本为 0 时干跑要提示"版本守卫空转"（§39.3）。

### 5.3 回执

digest 不再是回执。回执由三样承担：

| 职责 | 承载 |
|---|---|
| "这篇读过了、读到什么等级" | `research/literature/refs/` 一行 + 条目的 `/done` tag |
| "这一节说了什么" | `/section-N` 笔记 |
| "整篇的方法是什么" | `/digest` |

`literature-recon` §7 从"读完写 digest"改成"读完写回执"；digest 由 `section-notes` 的最后一步写。

### 5.4 边界

- **没有章节笔记的论文没有 digest**：survey、只读摘要、无方法节的论文，只有索引一行 + `/done`。
- digest 不是整篇总结；它不覆盖引言、结果、结论。要覆盖全篇就得给非方法节写笔记，那会破坏"掐头去尾"的约定，不做。

## 6. 流程

```text
读一篇参考文献
  → 章节笔记（/section-N）
       ├─ 无 tag 的粘贴笔记：读 → --claim / --rewrite / --retire
       └─ 缺失的方法节：--section N
  → digest（/digest，从章节笔记合成）
  → 裁定（adoption-ruling，按需，不进主流程）
```

- `literature-recon`：检索 / 分级 / 读；写索引一行 + `/done` tag。
- `section-notes`：章节笔记 + claim/rewrite/retire + 最后的 digest。
- `adoption-ruling`：只有要写代码/借公式时才触发。

## 7. CLI 表面

```text
--item KEY [--json]                              plan：covered / retired / digest / unknown
--section N --text|--file ... [--write]          create
--claim --note KEY --section N [--write]         给已有笔记打 claim（无 tag 时加 /imported）
--retire --note KEY --reason "..." [--undo]      任何笔记；正文不动
--rewrite --note KEY --file PATH [--section N] [--write]   无 tag 或 /imported
--delete --note KEY                              本轮只干跑
```

没有 `--tidy`；坏公式由 agent 重写正文，工具不做机械修复。

digest 走 `zotero-note.mjs`：

```text
--item KEY --text "<html>" [--write]   create；已有活 digest 时原地 refresh（文本相同则 no-op）
```

整体作废一条 digest 走 `zotero-section-note.mjs --retire --note <key> --reason "..."`；它不是日常更新路径。

## 8. plan 输出

```text
covered     : §2 · §3
retired     : §2 (KEY -> superseded by NEW) · (none: KEY)
digest      : KEY (§2–§5)
unknown     : KEY · KEY        <- 无 claim 的笔记，读它们
```

- 每条笔记仍打印首段；`unknown` 是待读清单。
- `digest` 单独列，不混进 `unknown`，避免 agent 把 digest 当节笔记读。
- `read here` / `judge these` 两个词退役。

## 9. 契约与文本

| 文件 | 改动 |
|---|---|
| `protocol.md` §6 | 身份=claim tag；claim/rewrite/retire/delete 的边界；digest 是投影；**记录不可原地改散文，派生视图与 `/imported` 导入可以**；不提供自动修复 |
| `protocol.md` §8 | `INV-NOTE-1` 改成"一节一条活 **claim**"；新增 digest 投影的不变量 |
| `protocol.md` §8 | `INV-EVID-4` 改成"章节笔记是阅读的转写，digest 是它们的投影；无笔记的论文回执在索引行与 `/done`" |
| `protocol.md` §9 | 删除仍不做；本轮只到干跑 |
| `skills/literature-recon` | §7 改成"写回执"，不再写 digest |
| `skills/section-notes` | 删除 §3.4（机械修复）；增加 claim/rewrite/retire 的粘贴笔记路径；§6/§7 增加 digest 合成；frontmatter 同步 |
| `skills/adoption-ruling` | digest 是投影，节笔记仍是 primary input |
| `project-template/research/literature/refs/README.md` | 索引行是回执；digest 写成后更新一行 |
| `project-template/research/adoption/README.md` | "digest says it was read" 改成"digest 是节笔记的投影" |
| `tools/toolchain-page.mjs` / `docs/04_toolchain.md` | 更新 claim 与引用字符串，重新生成 |
| `README.md` / `docs/02_coverage.md` / `surface.md` | 笔记管线与流程同步 |

契约分两次升版：

- **Revision 19**：tag 身份、claim/rewrite/retire、delete 干跑。
- **Revision 20**：digest 投影、流程、`INV-EVID-4`。

## 10. 分阶段实施

| 阶段 | 内容 | 测试 |
|---|---|---|
| 1 | tag 身份：`/section-N`、create、plan、covering、删 marker/正则 | tag 解析、一种拒绝、plan 形状、无正文解析 |
| 2 | 生命周期：`--claim` + `/imported`、删除 `--tidy`、retire 不限、`--replaces` 看 tag、digest 工具 `/digest` + 跳过 retired | claim/imported、retire/replaces、retired digest 跳过 |
| 3 | `--rewrite`：无 tag 或 `/imported`、干跑 diff、自动备份、版本守卫 | 纯函数 + 第一条 CLI 级测试（`ZOTERO_LOCAL_API` stub） |
| 4 | `--delete` 干跑：`/retired` 守卫、不可逆提示 | 干跑输出、无写请求、`gate.write('DELETE')` 意图断言 |
| 5 | digest 投影：`zotero-note.mjs` create/refresh-in-place、`section-notes` 最后一步、`literature-recon` §7 | create/refresh/no-op、备份与版本守卫、不产生墓碑、引用节笔记 |
| 6 | 文本/契约：Revision 19/20、两份 skill、README、coverage、toolchain | `doc-selftest`、`toolchain-page --check`、全套离线自测 |
| 7 | 迁移：225 条 marker（187 顶层脚本 + 38 点号人工合并）；153 条无 marker 候选 + 抽查；34 条 retired 处置 | 只读清单 + 干跑；真实库写单独授权 |

每个阶段一个逻辑提交；不混。

## 11. 迁移

| 群体 | 数量 | 方案 |
|---|---|---|
| 有 section marker（顶层） | 187 | 一次性脚本从 marker 补 `/section-N`；runtime 不再读 marker；脚本跑完即删 |
| 有 section marker（点号子节） | 38 | **不自动转 tag**；agent 读这些笔记，合并成顶层节（`--rewrite --section N`）或退休；分布在 9 条记录 |
| 无 marker 的节笔记 | 153 | 首段都写"文章第N节"；**先用旧判据生成候选清单（只写工作区，不写库）**，agent 抽查后批量 `--claim`，未命中的逐条读；其中点号首段要按子节处理 |
| `/retired` | 34 | 已是墓碑；删除干跑的真实样本；不自动删 |
| `/replaces-` | 15 | 保留；后继笔记按 marker/首段补 `/section-N` |
| digest | 0 | 无需迁移 |

`225 = 187 顶层 + 38 点号`；38 条点号不自动转 tag，因为顶层 tag 会丢失"这是子节"的信息，必须先合并内容。

迁移脚本可以用旧判据，因为它的一次性产物是 tag；**runtime 里不再保留正文解析**。这是"一次性迁移"与"长期判据"的区别，不矛盾。

## 12. 风险与边界

1. **重复守卫削弱**：删掉正则后，工具无法机械拒绝"无 tag 但首段写了第N节"的重复。缓解：plan 列全 `unknown`；skill 要求写 §N 前读完 `unknown`，谁解释了 §N 就先 claim/retire；claim 让阅读结论持久化。
2. **digest 只覆盖方法节**：这不是整篇总结；要写明边界，避免后来者把它当全文摘要。
3. **digest 原地刷新覆盖旧版**：旧版只在工作区备份，不在库里；这是"派生视图可刷新"的代价。记录类不走这条路。
4. **索引成为无笔记论文的唯一回执**：`refs/README.md` 现在说"索引绝不能是 digest 的唯一副本"；这条要改，因为 digest 不再是回执。
5. **迁移是 378 条的战役**：不许一次性盲写；先清单、再抽查、再授权批量。
6. **tag 可见、可手改**：这是比隐形 marker 好的失败方式——错了看得见；plan 要把 tag 与首段并排打印。
7. **旧版工具读不了新笔记**：单用户预设，可接受；迁移后旧版不再使用。
8. **记录与派生视图的边界靠 tag 判定**：标错一个 tag，就可能把记录当派生视图原地改掉。plan 必须把 tag 与首段并排打印；`--rewrite` 与 digest refresh 都要先确认 tag。
9. **38 条旧子节不读点号后父节显示未覆盖**：迁移必须先合并/退休，再写父节；否则会写出重复的顶层笔记。
10. **删除 `--tidy` 后坏公式只能由 agent 重写**：没有机械修复；agent 要读文字层/页图，写不对就是写不对。
11. **`/imported` 可手改**：它决定 claim 后能否原地刷新；plan 要打印 tags，手改错了能看出来。

## 13. 实现默认值（本轮已无待裁定项）

1. `/imported` 由 `--claim`（无 tag 笔记）和 `--rewrite --section N`（无 tag 笔记）写入；不自动移除。
2. `--tidy` 完全删除；坏公式由 agent 重写。
3. 点号不写不读；38 条旧子节在迁移时人工合并/退休。
4. digest 由 `zotero-note.mjs` 写，默认自动 create-or-refresh；文本相同 no-op。
5. 契约两次升版：Revision 19 = 身份，Revision 20 = digest。
6. 迁移分批：225（187 顶层脚本 + 38 点号人工）、153（候选清单 + 抽查）、34 retired（删除干跑）。
7. 其余按本草案执行。

## 14. 已裁定（2026-10-19）

| # | 项 | 裁定 |
|---|---|---|
| 1 | 身份 | `/section-N` tag；不再写/读隐形 marker |
| 2 | 覆盖 | 只算带 claim 的活笔记；无 tag 的进 `unknown`，由 agent 读 |
| 3 | 粘贴笔记 | claim 前可 `--rewrite`；claim 后带 `/imported` 仍可原地刷新；不带的是记录，走 `--retire` + 新写 |
| 4 | 改写范围 | 无 tag 或 `/section-N` + `/imported` |
| 5 | 退休 | 任何笔记都可 `/retired`；digest 工具跳过 retired |
| 6 | 删除 | 只对 `/retired`；本轮只干跑，`--write` 显式拒绝 |
| 7 | digest | 章节笔记的投影；一条论文一条，原地刷新，不产生墓碑 |
| 8 | 裁定 | `adoption-ruling` 按需，不进主流程 |
| 9 | `--tidy` | 完全删除；写笔记只由 agent 提供正文 |
| 10 | 子节 | 不写也不读点号；38 条旧子节迁移时合并/退休 |
| 11 | 迁移 | 225（187 脚本 + 38 人工）· 153 候选+抽查 · 34 retired 干跑 |
| 12 | 契约 | Revision 19（身份）+ Revision 20（digest） |
