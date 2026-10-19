# 04 — 修订草案（Revision 26）：研究区收缩到唯一确定的一层

**状态：草案，未执行。** 起草 2026-10-19 · 裁定者：junhan

**依据**：2026-10-19 对两个真实课题工作区的只读核对
（`doc/地震后区域电网功能恢复与安全再投运机制`、`doc/局部电气设备减隔震对区域电网地震级联风险的跨尺度影响机制`）；
对 `research/literature` 的全仓清点（产品面 29 处 / 13 个文件，不含 `.tmp`、`.mnemon`、`node_modules`）；
本次会话的逐项裁定（§11）。

**范围**：只改"研究区长什么样、纪律往哪里写"。**不新增纪律**；`collection-sweep` 另立 Revision 27（§10）。

---

## 0. 结论先行

1. 模板收缩为三项：`references/`（`README.md` + `ledger.md`）、`00_scoping.md`、`.section-notes/`。
2. 删除 `research/` 下的 7 个目录与 `owner_actions.md`，删除 `.agents/`，删除 `AGENTS.md.template`。
3. 去掉 `research/` 这层包装：层直接落在课题根。
4. 用一条**层根规则**替代"课题声明"这层间接：**有 `research/` 就用它，否则用课题根**；两种同时存在则停下问。
5. 其余层不预建，由**第一次往那里写的纪律**创建，并在报告里写出用了哪个路径。

一句话：**只把能确定的写进脚手架，其余交给"第一次用它的人"按需创建。**

---

## 1. 证据

### 1.1 两个真实课题的层

| 课题 | 层 |
|---|---|
| A《地震后区域电网功能恢复与安全再投运机制》 | `audit/` · `design/` · `notes/` · `prospects/` · `references/` · `specs/` |
| B《局部电气设备减隔震…跨尺度影响机制》 | `audit/` · `design/` · `prospects/` · `records/` · `references/` · `specs/` |

- **只有 `references/` 在两边各有一份可比的层定义，且两份 `README.md` 的规则一致**——
  非规范、只做指向、照抄既有的 A/B/C、**不新增判定**、不改写被指向的笔记；采纳结论留在 `prospects/`／`design/`。
  （两个课题的目录名另有重叠：`audit/` `design/` `prospects/` `specs/`；但 A 没有课题根 `README.md`，
  这几层在 A 侧没有一份可比的层定义，不能据此断言"同义"。）
- A 的 `references/reading_ledger.md` 直接引 `reading-triage` §3.1／§3.2（判定单位＝论文×问题，词表照抄）；
  B 的 `references/` **没有**读态文件 ⇒ 纪律不能假设"台账一定在 references/"。
- 预设模板的层（`adoption/` `rulings/` `journal/` `experiments/` `pitfalls/` `archive/`）在两个课题里**一个都没有**。
  它们是纪律的落点，不是课题的形状。

### 1.2 为什么这些层"不成立"

同一类对象在两个课题里名字不同（A 的 `notes/` vs B 的 `records/`；A 的 `prospects/` 与 B 的 `prospects/` 语义也不同），
说明它们是**某个课题长出来的形状**。把其中任何一套写进模板，都是替下一个课题预设答案。

### 1.3 为什么模板能一直"绿着不真"

`tools/scaffold-selftest.mjs` 只比三处名单是否**互相一致**（protocol §7 / README / `AGENTS.md.template` §3），
不比这三处是否描述真实用法。本题的材料里，三处一直一致，而两个真实课题一处都没用上。

### 1.4 基线（2026-10-19 实测，未改动前）

```text
node tools/scaffold-selftest.mjs   PASS 6/6  （7 个 research 目录，三方名单一致）
node tools/doc-selftest.mjs        PASS      （DOC-1…DOC-11）
node tools/skills-selftest.mjs     PASS      （11 份纪律注册、令牌替换正常）
```

---

## 2. 目标布局

```text
<study>/
  AGENTS.md            课题自己写：不变式、权威顺序、记号、环境（模板不提供）
  00_scoping.md        问题 / 边界 / 非目标 / 可判定性
  references/          唯一的确定层；非规范：只指向、照抄等级、不新增判定
    README.md          本层装什么、台账九列、等级口径
    ledger.md          台账骨架（一行 = 一个课题问题 × 一篇）
  .section-notes/      逐节笔记草稿（工作文件，无权威）
```

删除清单（模板内）：

```text
AGENTS.md.template
.agents/skills/domain-discipline/SKILL.md
research/adoption/  research/archive/  research/experiments/  research/journal/
research/literature/  research/pitfalls/  research/rulings/  research/owner_actions.md
```

**`AGENTS.md` 仍留在布局里，但不由模板创建**：它的内容（不变式、记号）只能由属主写。
模板只删"预填的 TODO 骨架"，不删"这个文件应该存在"这件事。

---

## 3. 一条路径规则

> **层根** = `<study>/research/`（若该目录存在），否则 `<study>/`。
> **层路径** = `<层根>/<层名>/`。
> 脚手架只建 `references/` 与 `00_scoping.md`；其余层由第一次写它的纪律创建，并把路径写进报告。
> **两种层根同时存在 ⇒ 停下问**，不挑一套继续。

它同时解决三件事：

| 情形 | 结果 |
|---|---|
| 两个真实课题（无 `research/`） | 落到 `doc/<课题>/references/` 等，与现状同形 |
| 按旧模板建的课题（有 `research/`） | 层根规则指回 `research/…`，**零迁移** |
| 新旧混用 | 两种层根并存 ⇒ 停止并询问 |

这条规则是**结构可判的**（agent `ls` 一下即可），不需要先读某份文档；因此它不是"声明"那层间接。

---

## 4. 逐项改动

### 4.1 模板（`project-template/`）

| 动作 | 对象 |
|---|---|
| 新增 | `references/README.md`（层规则：装什么/不装什么、九列、等级口径、非规范声明） |
| 新增 | `references/ledger.md`（空表头 + 两套词表的位置说明，不复制定义） |
| 上移 | `research/00_scoping.md` → `00_scoping.md` |
| 保留 | `.section-notes/README.md`（`section-notes` §7 点名这个路径） |
| 保留 | `README.md`（课题入口；改写：路径、层地图、"先写 AGENTS.md"） |
| 删除 | §2 的删除清单全部 |

### 4.2 契约与说明

| 文件 | 现状 | 改成 |
|---|---|---|
| `protocol.md` | §7 布局块（7 个层 + AGENTS）；头部 Revision 25 | 新布局块；加"按需创建"一句；立 **Revision 26** |
| `README.md` | 235 行布局块；258 行"权威表在课题 `AGENTS.md` §3" | 同步布局；删/改 258 行那句；"Start a study" 补"先写 AGENTS.md" |
| `AGENTS.md.template` | 17 处 `research/` 路径 | **整份删除**（§2） |
| `docs/coverage.md` | 84、87 行走查用 `research/literature/<topic>.md` | 改为层根相对路径 |
| `docs/decisions.md` | — | 新增一节：Revision 26 的理由、层根规则、AGENTS 不在模板里 |

### 4.3 纪律（10 份，26 处 `research/`）

| 文件 | 处数 | 改法 |
|---|---:|---|
| `skills/adoption-ruling/SKILL.md` | 7 | 层根相对路径 |
| `skills/literature-recon/SKILL.md` | 5 | 同上；§6 原有"follow the project's location"扩成层根规则 |
| `skills/progress-sync/SKILL.md` | 3 | 同上 |
| `skills/metadata-query/SKILL.md` | 3 | 同上 |
| `skills/reading-triage/SKILL.md` | 2 | 同上 |
| `skills/experiment-protocol/SKILL.md` | 2 | 同上 |
| `skills/redteam-ruling/SKILL.md` | 1 | 同上 |
| `skills/section-notes/SKILL.md` | 1 | 同上（`owner_actions.md` 改为按需创建） |
| `skills/research-scoping/SKILL.md` | 1 | 同上（`00_scoping.md` 落在层根） |
| `skills/subagent-contract/SKILL.md` | 1 | 同上 |

另：4 处对课题 `AGENTS.md` 的引用（`adoption-ruling` 62/226、`experiment-protocol` 24、`metadata-query` 29、`research-scoping` 101）
加"若课题有 `AGENTS.md`"；没有就不引用，不编造不变式。

### 4.4 工具

| 文件 | 改动 |
|---|---|
| `tools/scaffold-selftest.mjs` | 解析器改为根级列表（不再找 `research/` 起点）；S1/S2 从三份名单降为两份（§7 + README）+ 盘上；S5 反转为"模板里不许有 `AGENTS.md*`"；S3 仍只比目录 |
| `tools/new-project.ps1` | 删 `AGENTS.md.template → AGENTS.md` 的改名段；"Next:" 改为"先写 AGENTS.md，再填 00_scoping.md" |

---

## 5. 护栏改动细节

| 检查 | 现在 | 之后 |
|---|---|---|
| S0 | 三份名单都能解析出内容 | 两份名单都能解析（§7、README） |
| S1 | 每个 `research/<name>/` 在三份里都有 | 每个根级 `<name>/` 在两份里都有 |
| S2 | 盘上每个 `research/<name>/` 在三份里都有 | 盘上每个根级目录在两份里都有 |
| S3 | 名单里每个路径在模板里是目录 | 不变（文件因带扩展名被跳过） |
| S4 | 模板 README 点名的纪律存在于 `skills/` | 不变 |
| S5 | `AGENTS.md.template` 是模板里唯一的 `AGENTS.md*` | 模板里**不许有**任何 `AGENTS.md*` |
| S6 | 只有一处声明布局 | 不变 |

负控制（`--negative-controls`）保留：新增一条"多出一个没被名单提到的根级目录 ⇒ S2 必须红"。

---

## 6. 兼容与迁移

- **不迁移任何现有课题**：不删、不搬、不改写。
- 旧课题有 `research/` ⇒ 层根规则把纪律指回原处，行为不变。
- 旧课题里的 `research/literature/refs/`（Revision 22 已废除）仍按旧规矩：**报告、不删**。
- 课题里两种层根并存 ⇒ 停下问。

---

## 7. `AGENTS.md` 删除的连带

| 连带 | 处理 |
|---|---|
| `scaffold-selftest` 的 S5 与第三份布局名单 | S5 反转；名单降为两份 |
| `new-project.ps1` 的改名段 | 删除 |
| 4 份纪律对课题 `AGENTS.md` 的引用 | 加"若课题有" |
| `README.md:258`"权威表在课题 `AGENTS.md` §3" | 删除该句；权威表不再是脚手架的一部分 |

不接受的代价（已裁定接受，记录在案）：新课题在属主写出 `AGENTS.md` 之前，**没有不变式可读**。
缓解：`project-template/README.md` 第一句与 `new-project.ps1` 的 "Next:" 都要求先写它；纪律不编造不变式。

---

## 8. 执行顺序与验收

三刀，每刀跑完都绿。

### 第 1 刀 — 契约与模板（原子，必须一起落）

`project-template/` 全部改动 + `protocol.md` §7 + Revision 26 + `README.md` 布局块 + `docs/decisions.md` 新节
+ `tools/scaffold-selftest.mjs` + `tools/new-project.ps1`。

**为什么不能拆**：模板一动，S3 立刻要求三处名单同步；只改模板不改契约 ⇒ 护栏红。

验收：

```powershell
node tools\scaffold-selftest.mjs      # 6/6，S5 为"模板里没有 AGENTS.md*"
node tools\doc-selftest.mjs           # DOC-8（路径都存在）· DOC-11（头部 Revision = 变更记录最高）
node tools\new-project.ps1 -Target .tmp\scaffold-check -DryRun
```

### 第 2 刀 — 纪律路径

10 份 skill 的 26 处 + 4 处"若有 `AGENTS.md`"。

验收：

```powershell
node tools\skills-selftest.mjs        # 11 份注册、令牌替换、无相对路径
```

### 第 3 刀 — 走查与叙述

`docs/coverage.md` 三处、`README.md` "Start a study"、`project-template/README.md` 的叙述。

验收：

```powershell
node tools\doc-selftest.mjs
```

### 发布前（不在本草案范围）

`node tools\preset-selftest.mjs` 与 `preset-release` 的全套检查。

---

## 9. 风险

| 风险 | 缓解 |
|---|---|
| 新课题没有 `AGENTS.md`，纪律读到空 | 两处"先写它"的提示；4 处引用加"若有"；不编造不变式 |
| 旧课题两种层根并存 | 规则显式要求停下问 |
| 护栏解析器改松（漏报漂移） | 保留负控制；新增"多一个未列目录 ⇒ S2 红" |
| 删层导致某份纪律无处落笔 | 每条写路径的纪律都改为"创建并报告路径"；这是 §3 规则的直接推论 |

---

## 10. 不做 / 留给 Revision 27

**不做**：

- 不新增纪律（`collection-sweep` 不在本草案）。
- 不预建 `adoption/` `rulings/` `journal/` `experiments/` `pitfalls/` `archive/` `owner_actions.md`。
- 不改 `references/` 的层规则（那是课题自己的裁量）。
- 不迁移、不删除任何现有课题的文件。
- 不改写 `docs/decisions.md` 旧条目、`docs/plans/*`、`docs/releases.md`、`docs/archive/*`。

**Revision 27**：见 [`revision-27.md`](revision-27.md)——分类扫描与渐进式读取的入口（`collection-sweep`
纪律 ＋ `--collection --screen` 工具模式）。它依赖本草案先落地：产物写进层根下的 `references/`。
本文件不复述它的判据与流程，避免同一份清单写在两处。

---

## 11. 裁定记录（junhan，2026-10-19）

| # | 项 | 裁定 |
|---|---|---|
| 1 | 课题工作区结构 | `doc/` 是研究文档根，课题之间必须隔离 |
| 2 | 路径规则 | 角色＋声明 → 落实为 §3 的层根规则 |
| 3 | 仓库跟不跟 | 跟：改模板 |
| 4 | 模板瘦到哪一档 | `references/` + `00_scoping.md`（+ `.section-notes/`） |
| 5 | `AGENTS.md` | **整份不进模板** |
| 6 | `research/` 包装 | 去掉 |
| 7 | 扫描筛掉的文献 | 每条写一行（`depth: abstract` · `verdict: stop`）——Rev 27 的约束 |
| 8 | "采用"的含义 | 论据级；借鉴是后一条链，不因"进语料"而成立 |
