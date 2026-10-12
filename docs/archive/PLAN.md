> **Historical record — frozen.** This is the chronological development log of the preset, kept for
> archaeology: it records what was tried, what was measured at the time, and which mistakes were made
> and corrected. It is **not** an entry point and is no longer maintained.
> Current documents: [../00_overview.md](../00_overview.md) (what it is),
> [../01_decisions.md](../01_decisions.md) (why), [../../protocol.md](../../protocol.md) (contract),
> [../../surface.md](../../surface.md) (names).
# DSH Autoresearch 预设 —— 设计与实施方案（v0，待审）

> **状态**：草案。本文件只描述方案，**尚未落地**任何预设、skill 或配置改动。
> **审阅方式**：§12 列出待裁定项；裁定后按 §9 的顺序分步落地，每步可单独回滚。

---

## 0. 一句话定位

一个**领域无关**的「研究工作台」预设 + 一组研究纪律 skill：

- **预设**管「**怎么研究**」——证据分级、主张标注、质疑流程、进度沉淀规范；
- **工作区**管「**研究什么**」——课题内容、领域护栏、目录约定。

两者解耦：预设不绑定任何路径，换课题只换工作区。

---

## 1. 目标 / 非目标

### 目标

1. 围绕**任意**科研问题，支持四件事：文献检索与重建 → 方向探索 → 结构化质疑 → 进度沉淀。
2. 预设**可复用**：课题换了，预设不动。
3. **零 JS**：全部用声明式 plugin 行 + skill 文本表达，可审、可 diff、可回滚。
4. 与 DSH 既有能力对齐：`subagent` / `workflow` / `skill` / `goal` / `mnemon` / `modsearch`。

### 非目标（本阶段明确不做）

1. 不做常驻自组织多代理 + 共识投票（第三方 `dsh-vibe-math` 那一档，单个插件 64KB 起，调试成本高）。
2. 不做自动跑实验、自动改代码、自动提交。
3. **不引入任何议题专属内容**。示例课题 `eq_cascade_case39` 仅作为「一个严谨研究长什么样」的**证据**，其领域护栏不进预设。

---

## 2. 设计原则

| 编号 | 原则 | 说明 |
|---|---|---|
| P1 | **分层解耦** | 预设 = 领域无关纪律；工作区 = 课题 + 领域护栏。 |
| P2 | **纪律要可判定** | 进 persona 的必须是能用「是否违反」检查的规则（如「探索性提案必须标 `[exploratory]`」），不是「要严谨」「要批判」这类态度词。 |
| P3 | **先文档后代码** | skill 文本先审，再写 bundle；每步可单独回滚。 |
| P4 | **服从项目既有约定** | 若课题工作区已有目录约定与文档权威层级，预设**服从**并复用，不覆盖、不重命名。 |
| P5 | **三分法** | 任何输出必须可区分：**事实**（有证据/可复现）／**推论**（有推理链但未验证）／**探索性提案**（未验证且未定）。 |

---

## 3. 交付物清单

| # | 交付物 | 位置 | 形态 |
|---|---|---|---|
| D1 | 预设 bundle | `dsh-autoresearch/autoresearch-preset/` | 2 个文件，零 JS |
| D2 | 研究纪律 skill ×4 | `~/.dsh/skills/<name>/SKILL.md` | 用户级，所有工作区可用 |
| D3 | 项目脚手架模板 | `dsh-autoresearch/project-template/` | 复制到新课题工作区，**可选** |
| D4 | 外部集成 | profile 级配置 | MCP 通道、Zotero（独立改动，C4/C5） |

---

## 4. 预设 bundle（D1）

### 4.1 目录

```
autoresearch-preset/
  package.json
  cordis.patch.yml
```

### 4.2 package.json

```json
{
  "name": "@local/dsh-autoresearch-preset",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "dsh": { "bundle": { "patch": "./cordis.patch.yml" } }
}
```

### 4.3 声明行

Loader 行 id `preset-autoresearch`，`name: '@deepseek-ai/dsh-agent-preset'`，`config.id: autoresearch`、`config.name: Autoresearch`、`config.order: 20`。

### 4.4 plugin 行（相对官方 `standard` 的增删改）

**已核实的 schema 前提**：`@deepseek-ai/dsh-persona` 的 Config 是
`{ prefix: string（必填）, suffix?: string, complete?: boolean, includeRuntimeContext?: boolean }`
——**没有 `text` 字段**（依据：该包 `lib/types/index.d.ts`）。第三方 `vibe-math v4` 里用的 `config.text:` 不是可照抄的写法；本方案照官方 `standard.patch.yml`。

| 行 id | 包 | 动作 | 理由 |
|---|---|---|---|
| `persona` | `@deepseek-ai/dsh-persona` | **改** | `prefix` 换成研究纪律（见 §5 的规则来源），保留 `{{model}}`/`{{cwd}}` 插值 |
| `agent-instructions` | `@deepseek-ai/dsh-agent-instructions` | 保留 | 读工作区 `AGENTS.md` → 项目级领域护栏的入口 |
| `tool-bash` / `tool-pwsh` | 各自包 | 保留 | 平台互斥（`!!js process.platform`） |
| `tool-fs` / `tool-fs-search` | 各自包 | 保留 | 读写与检索 |
| `tool-jobs` | `@deepseek-ai/dsh-tool-jobs` | 保留 | 长任务后台化 |
| `skill-filesystem` | `@deepseek-ai/dsh-skill-filesystem` | **保留（关键）** | 没有它，`~/.dsh/skills/` 与工作区 skill 都不加载 |
| `tool-skill` | `@deepseek-ai/dsh-tool-skill` | 保留 | 让 agent 主动加载 skill |
| `command-goal` / `tool-goal` | 各自包 | 保留 | 长课题跨轮推进 |
| `planning` group | `cordis:group` | 保留 | 计划先行，改文件前先出方案 |
| `compaction` group | `cordis:group` | 保留 | 含 `compaction-basic` / `command-compact` / `tool-result-pruner` |
| `delegation` group | `cordis:group` | 保留 | `tool-subagent-control` / `tool-subagent`(spawn) / `tool-subagent-fork` / `workflow-ptc` / `tool-workflow` |
| `tool-ask-user` | `@deepseek-ai/dsh-tool-ask-user` | 保留 | 你的「决策点逐项确认」依赖它 |
| `tool-todo` | `@deepseek-ai/dsh-tool-todo` | 保留 | 进度可见 |
| `tool-web` | `@deepseek-ai/dsh-tool-web` | 保留 | 搜索能力由 profile 层的 modsearch 提供 |
| `tool-plugin-manager` | `@deepseek-ai/dsh-plugin-manager/tools` | `disabled` | 同 standard |

---

## 5. Skills（D2）—— 研究纪律真正的载体

### 5.1 行文范式（沿用你 `tangle-audit` 的既有风格）

每个 skill 固定章节：

`什么时候用` → `第一步：把声明的边界读出来当尺子` → 主体判据 → `该做 vs 不该做`（含**就地排除条件**）→ `措辞纪律` → `仪器纪律` → `报告形态` → `验收清单` → `不做`

理由：你仓库里的 `.agents/skills/tangle-audit/SKILL.md`（30KB）已证明「判据 + 就地排除条件 + 措辞纪律 + 验收清单」这种结构远比散文有效，且它自带 `instruments/` 可执行脚本，说明 skill 承载研究纪律这条路你已跑通一次。

### 5.2 四个 skill

| skill | 触发 | 输入 | 产物 | 硬规则 |
|---|---|---|---|---|
| `research-scoping` | 新课题 / 议题模糊 | 用户描述 | `00_scoping.md`：科学问题、边界、非目标、可判定性 | 必须写出**非目标**；必须给出「什么算回答了这个问题」 |
| `literature-recon` | 需要文献支撑 | 主题 / 关键词 | `literature/*.md` 重建笔记 + 引文表 | 每条主张挂来源；**没读到的不得写成已知**；明确标注非规范 |
| `redteam-ruling` | 主张成形 / 需要质疑 | 一个待检验主张 | `rulings/*.md` 裁定请求（诊断 + 证据 + 待裁定项 + 候选裁定） | 不得输出无证据的「建议进一步研究」；必须给反例或可检验的证伪路径 |
| `progress-sync` | 一轮工作结束 | 本轮产出 | mnemon Documents + 薄日志 + 决策记录 | 区分事实/推论/探索性；**被否决的方向必须记原因** |

每个 skill 的完整契约在 C2 逐份写出、逐份给你审，本文件不展开。

---

## 6. 进度与记忆模型

| 载体 | 存什么 | 不存什么 | 约束（已核实） |
|---|---|---|---|
| mnemon **Documents** | 课题档案、方向评估结论、**被否决方向及原因**、裁定结论 | 逐轮流水、原始数据 | 受管冷存储，只能走受管工具写，**不能用 `edit` 直改**；官方定位是「可复用项目知识」 |
| mnemon **runtime memory** | 跨会话必记的少量事实（记号约定、当前主线、用户裁定） | 长文本 | 硬上限 **MEMORY 10KB / USER 4KB** |
| 工作区 **Markdown 日志** | 逐轮工作日志、文献笔记、裁定请求原文 | 结论（结论进 Documents） | 普通文件，按你的选择**不启用 git** |

---

## 7. 质疑机制（轻度）

```
主张成形
  → redteam-ruling 启动独立红队子代理（spawn，独立上下文）
  → 红队只拿到「主张 + 结论」，不拿作者的推理链
  → 红队产出 rulings/*.md 裁定请求
  → 主代理或你裁定 → 裁定结论写入 mnemon Documents
```

硬规则（写进 skill，不靠模型自觉）：

1. 红队**必须**给出至少一条：反例 / 与主张矛盾的已有证据 / 可检验的证伪路径。三条都给不出 → 报告「无法质疑」，**不得**用「建议进一步研究」凑数。
2. 红队不得修改主张原文，只能提交裁定请求。
3. 裁定请求必须区分「已证伪」「证据不足」「超出当前范围」三种结论。

---

## 8. 外部能力与前提

| 能力 | 现状（已核实） | 前提 / 验证方式 | 失败回退 |
|---|---|---|---|
| modsearch 检索 | ✅ 已挂载 active | 无 | — |
| 学术 MCP | ⚠️ **通道关闭**：包已装（`@deepseek-ai/dsh-mcp-client`、`dsh-mcp-manager`），但线上 profile 无任何 MCP 行（按包名查 Config 返回 0 条）；`dsh-mcp-manager` 在市场 `disabled` 列表；`mcp-manager.json` 唯一 server 亦 disabled | 先开通道，再配 server；用一次真实检索验证 | 只用 modsearch |
| Zotero | ⚠️ 已装（`C:\Users\项目所有者\Zotero\zotero.sqlite`），但**未运行**，端口 `23119` 关闭 | 你让 Zotero 常驻 + 打开「允许本地应用通信」；先只读验证 API 可达 | 离线只读 sqlite / 导出 BibTeX |

---

## 9. 落地顺序（分逻辑提交）

| 步 | 内容 | 验收 | 回滚 |
|---|---|---|---|
| **C1** | 本方案审定（你） | 你确认 §12 | — |
| **C2** | 写 4 个 skill 文本（先文本，暂不写 `instruments/`） | 你逐份审 | 删目录 |
| **C3** | 写 bundle 两件套 + `plugin_manager install_bundle` + **新会话**验证 | 花名册出现 Autoresearch，可选中，工具齐全 | 卸载 bundle |
| **C4** | 恢复 MCP 通道 + 学术 server | 一次成功的 arXiv 检索 | 关回通道 |
| **C5** | Zotero 集成 | 能读到条目 | 移除 server |

**注意**：已存在的会话保持其启动时的 plugin 版本，**必须开新会话验证** C3 之后的行为。

---

## 10. 前提核实清单

### 已核实

| # | 前提 | 依据 |
|---|---|---|
| 1 | 旧 `~/.dsh/.agent-presets/<id>/` 机制**已死** | 该目录在 `dsh-agent-preset-registry` 包中无任何引用；线上 `Config.listConfigs` 只有 4 个内置预设 |
| 2 | 用户级 skill 落点 = `~/.dsh/skills/<name>/SKILL.md` | 目录内有 `contract-docs`、`generate-commit-message`，且它们确实出现在本会话 skill 目录中 |
| 3 | `persona` 用 `prefix`（必填）/`suffix` | 该包 `lib/types/index.d.ts`；官方 standard 亦如此 |
| 4 | 官方 `standard` 预设的完整行清单可作模板 | 读了 `dsh-web-app/presets/standard.patch.yml` |

### 未核实

| # | 前提 | 风险 |
|---|---|---|
| 1 | 项目级 skill 落点 = `<workspace>/.agents/skills/` | 强证据：你的 `net_utils` 里正有 `.agents/skills/tangle-audit`；但**未经隔离实测** |
| 2 | 学术 MCP server 选型与网络可达性（本机 `region: china`） | arXiv API 通常可达；Semantic Scholar 可能需 key |
| 3 | Zotero 7 本地 API 是否需额外设置 | 未验证 |
| 4 | 非默认预设的隔间**不继承** host 级管理类工具 | 现象已确认（§13.3.1），但机制**只是推断**：未在官方文档中找到明文规则 |

> 已解决：原 #2「预设挂 `tool-web` 能否拿到 profile 层 modsearch」→ **能**（§13.3.1）；原 #5「新预设的实际表现」→ 已由新会话实测确认（§13.3）。
> 更早撤销：原 #5「安装 bundle 需要授权」→ 实测不阻塞（§13.2）。

---

## 11. 风险

1. **通用化让纪律变软**：为追求通用而删掉具体判据，预设会退化成「你是一个研究员」的空壳。
   *缓解*：P2 可判定性 + skill 里的**就地排除条件**。
2. **抄写 standard 的漂移**：我们复制了 standard 的行清单，DSH 升级后官方新增的行不会自动进来。
   *缓解*：bundle 内只保留研究必需行，其余靠 profile 层兜底。
3. **权限**：安装 bundle 会在 Host 进程执行插件代码，需要 Full access 或审批。
4. **外部集成（MCP / Zotero）的不确定性**：不阻塞 C1–C3，可后置。

---

## 12. 已裁定（C1 完成）

| # | 决策点 | 裁定 |
|---|---|---|
| 1 | 预设 id / 显示名 | `autoresearch` / `Autoresearch`，`order: 20` |
| 2 | skill 落点 | **两者都要**：用户级 `~/.dsh/skills/` 放 4 个通用纪律 skill；另给项目级模板，供按课题启用领域纪律 |
| 3 | 红队裁定请求 | **落盘**到 `<workspace>/research/rulings/*.md` |
| 4 | `present` / `tool-ralph` | **两行都去掉**（先瘦后补） |
| 5 | 日志目录 | 预设**建议** `<workspace>/research/`：`00_scoping.md` / `literature/` / `rulings/` / `journal/`；若项目已有约定，按 P4 以项目为准 |
| 6 | 语言（后续追加） | **全英文**：persona + preset 描述 + 4 个 skill 的正文与 `description`（见 §13.5） |

### 12.1 下一步（C2）

按 §9 的 C2：先写**一份** skill 作为行文范式样板（`research-scoping`），经确认骨架后，再按同一骨架写其余 3 个。

样板暂存 `dsh-autoresearch/skills/`，**审定后才安装**到 `~/.dsh/skills/`——避免未审文本立刻进入所有会话的 skill 目录。

---

## 13. 落地进度（C3 已完成，待新会话验收）

### 13.1 已落地的产物

| 产物 | 位置 | 状态 |
|---|---|---|
| 预设 bundle | [`autoresearch-preset/`](autoresearch-preset/) | 已安装；`include:preset-autoresearch` → `active` |
| 4 个纪律 skill | `~/.dsh/skills/` | 已安装，**当轮即生效** |
| 可再安装的源 | [`skills/`](skills/) | 保留为 skill 源（改这里 → 重新拷贝才生效） |

### 13.2 C3 实测结果（新增已核实）

| 前提 | 结果 |
|---|---|
| 安装 bundle 会不会被审批拦住 | **没有**。`install_bundle` 返回 `application: applied`；本会话 danger-full-access 文件策略已满足要求。原 §10 未核实 #5 撤销。 |
| 用户级 skill 是否要重启 DSH 才生效 | **不要**。写入 `~/.dsh/skills/` 后，本会话 skill 目录当轮即出现 4 个新 skill。 |
| 预设声明行是否被 Loader 接受 | **接受**。花名册预设数 4 → 5；`Config` 查 `include:preset-autoresearch` 返回 `status: schema`、`limitations: []`。 |

### 13.3 新会话验收结果（你已实测）

| 检查项 | 结果 | 证据 |
|---|---|---|
| 花名册出现 `Autoresearch` | ✅ | 会话记录 `agent-preset/selected` → `{"agentPreset":"autoresearch"}` |
| 研究纪律注入生效 | ✅ | `system/message` 含「You are a research agent…」+ 全 8 条纪律 |
| 4 个 skill 加载 | ✅ | 同会话 skill 目录含全部 4 条 |
| 工具加载 | ✅ | `request/header` 含 tools 数组，**66 个工具**（standard 为 70） |

> **读会话时的坑**：会话文件头部的 `agentPreset` 字段是**创建时**写入的（你的测试会话写着 `standard`），真实选择要看 `agent-preset/selected` 事件记录。不要被头部字段误导。（会话存盘是 **zstd 多帧**追加，单次 `zstdDecompressSync` 只能解出第一条记录；工具见 [`tools/`](tools/)）

#### 13.3.1 工具数差值（66 vs 70）逐项解释

| 工具 | standard | 本预设 | 原因 |
|---|---|---|---|
| `present` | ✅ | ❌ | **设计如此**：§12#4 裁定去掉该行 |
| `plugin_manager` | ✅ | ❌ | 本预设未声明该行；非默认预设的隔间**似乎不继承** host 级管理工具（机制待核实，§10 #4） |
| `cordis_inspect_list` / `cordis_inspect_query` | ✅ | ❌ | 同上，属 host 级 Harness 自省工具 |

三者都是**建预设用的工具**，不属于研究能力 → 建议**不补**。

附带确认：`web_search` / `web_fetch` 两边都有，即 profile 层 modsearch 的服务**能**被预设隔间继承（原 §10 未核实 #2 撤销）。

另外：skill 是**用户级全局**的，选 `standard` 预设也能看到这 4 个 skill ⇒ 判断预设是否真的生效，要看 `agent-preset/selected` 与 `request/header` 的 tools 数组，不要看 skill 目录。

### 13.4 剩余步骤

| 步 | 内容 | 状态 |
|---|---|---|
| D3 | 项目脚手架模板（`project-template/`） | **完成**（§13.7） |
| C4 | 学术 MCP（arXiv / Zotero） | **完成**（§13.8） |
| C5 | Zotero 集成 | **完成**（随 C4，§13.8） |

### 13.5 全英文改造（2026-10-11）

| 项 | 变更 | 生效方式 |
|---|---|---|
| persona | 中文 → 英文（8 条纪律 + skill 路由，语义与中文版一一对应） | 改 `autoresearch-preset/cordis.patch.yml`；**无需重装**（见下） |
| preset 描述 | 中文 → 英文 | 同上 |
| 4 个 skill 正文 + `description` | 中文 → 英文 | 覆盖 `~/.dsh/skills/<name>/SKILL.md`；**当轮即生效**（本会话 skill 目录已刷新为英文） |

**关键发现：bundle 是 Junction，改源文件即生效。**
`profiles/web/node_modules/@local/dsh-autoresearch-preset` 的 `LinkType` 是 **Junction**，指向 `D:\OneDrive\Desktop\dsh-autoresearch\autoresearch-preset`。因此直接改 patch 后，加载器读到的就是新内容——已在加载器可见路径上 grep 到 `## Research discipline (always in force)` 确认。

**不要重复 `install_bundle`。** 第二次安装返回 `application: failed` / `ambiguous-install`：pnpm 日志显示它要把 `link:D:/…` 换成 `D:\…`「from a different source」。重试有把 Junction 变成**拷贝**的风险，那会破坏「改源文件即生效」的链路。当前功能正常（预设行仍 active），无需修复；但若将来要 `remove_bundle`，可能需要在 `profiles/web/package.json` 里手动清掉该依赖行。

**语言选择的代价（已接受）**：persona 常驻成本下降，但 skill 正文也变英文，以后审阅与维护这些纪律文本要用英文读。

### 13.6 自测通道（取代人工手点）

**问题**：靠人在 GUI 里手点新会话验收——不可重复、看不到系统提示原文、每次都要教他看哪里。

**做法**：`dsh --dump-config` 会把 **composed profile 树**打出来，那正是新会话将要挂载的东西。于是验收可以完全离线且可重复：

```powershell
cd D:\OneDrive\Desktop\dsh-autoresearch
dsh --profile web --dump-config > .tmp\composed-web.txt
node tools\preset-selftest.mjs .tmp\composed-web.txt   # 退出码 1 = 有检查失败
```

脚本 [`tools/preset-selftest.mjs`](tools/preset-selftest.mjs) 共 19 项检查：

1. profile 里那个包**还是 Junction**（若被换成拷贝，「改源文件即生效」会静默失效——这正是 `ambiguous-install` 的风险）
2. composed 树里有 `preset-autoresearch`、31 行插件行、必需行齐全、被裁掉的两行确实不在
3. 源 persona 的 6 个段落**逐段存活**（dump 用 `>-` 折叠重排，故忽略空白比对）
4. 8 条纪律 + 4 条 skill 路由 + `{{model}}`/`{{cwd}}` 占位符
5. persona 常驻成本（当前 2437 字符 ≈ 677 token/请求）

**它证明不了什么**：无法证明 prompt registry 在**运行时会话**里真的渲染出 persona。这层由「composed 树内容完整 + 中文版曾在真实会话中被观测到（§13.3）」共同覆盖；残余风险只剩 `{{…}}` 严格插值，而这两个变量与 `standard` 用的是同一对，且已在树中原样出现。

**顺带修掉两个假 FAIL**：`→ \`name\`` 会被 dump 折行拆开（改为忽略空白比对）；`{{cwd}}` 在 suffix 而非 prefix 块内（改为查整个预设块）。自测脚本自身也曾漏掉一条断言（修上述两处时误删 `eight numbered discipline rules`），已补回并复跑至 PASS。

**已知环境坑**：OneDrive 同步会持续改文件 mtime，导致编辑工具的版本守卫反复报 `E_STALE_RANGE`（本次会话撞了多次）。项目所有者 已于 2026-10-11 关闭该工作区的同步；若此错误重现，先确认同步是否又被打开。

### 13.7 D3 项目脚手架（2026-10-11 完成）

| 产物 | 作用 |
|---|---|
| [`project-template/README.md`](project-template/README.md) | 怎么用、改什么、**不该改什么**（核心：`AGENTS.md` 只放领域约束，绝不重复预设的通用纪律） |
| [`project-template/AGENTS.md.template`](project-template/AGENTS.md.template) | 项目护栏骨架：研究是什么 / 领域不变式 / 文档权威层级 / 记号 / 非目标 / 环境 |
| `project-template/research/00_scoping.md` | 对应 `research-scoping` 的七节骨架 |
| `project-template/research/{literature,rulings,journal}/README.md` | 命名与引用约定 + 必需小节 + 示例 |
| `project-template/.agents/skills/domain-discipline/SKILL.md` | 项目级领域纪律 skill 骨架（与预设 4 个 skill 同一套九节骨架） |
| [`tools/new-project.ps1`](tools/new-project.ps1) | 一键脚手架：只创建、**永不覆盖**、`-DryRun` 可预览 |

**实测（已跑）**：`-DryRun` 预览 7 个文件 → 真跑创建 7 个（含隐藏目录 `.agents/`）→ 第二次运行 7 个全部 skip（幂等）。测试产物已清理。

**实测暴露的一个真缺陷（已修）**：模板里若直接放 `AGENTS.md`，DSH 会把它当**活的项目指令**注入（系统提示当场出现 “Additional instructions from: project-template\AGENTS.md”）——于是占位规则与 EXAMPLE 里的领域不变式会污染所有在模板下工作的会话。修法：模板内改名为 `AGENTS.md.template`（inert），由脚手架在目标处改回 `AGENTS.md`；修完 harness 明确回报 `Instructions removed: project-template\AGENTS.md`。工作区现在只剩这一个 `AGENTS.md*` 文件，且它是 inert 的。

**有意不做**：不含 git 初始化（你选择不上 git）；不含 MCP/Zotero 配置（属 C4/C5）。

### 13.8 C4 学术 MCP（2026-10-11 完成，待新会话确认工具可见性）

**接入方式**（官方 `references/mcp-bundle.md`）：configuration-only bundle，零 JS，只 insert `@deepseek-ai/dsh-mcp-client` 行。产物：[`mcp-academic/`](mcp-academic/)。

| 行 | serverName | transport | 命令 | 前提 |
|---|---|---|---|---|
| `mcp-arxiv` | `arxiv` | stdio | `uvx arxiv-mcp-server` | 无 key；PyPI 已实测可达 |
| `mcp-zotero` | `zotero` | stdio | `uvx zotero-mcp` + `ZOTERO_LOCAL=true` | **Zotero 需常驻并开启本地 API**；本地 API 不需要 key |

**选型依据（实测，不是猜）**：`uvx arxiv-mcp-server` 装 46 包并作为 stdio 服务启动；`uvx zotero-mcp --help` 打印 `usage: zotero-mcp [-h] [--transport {stdio,sse}]`。Zotero 淘汰了 npm 的 `zotero-mcp`（它要求额外装一个 Zotero 插件提供 HTTP server）。可达性实测：arXiv / OpenAlex / Crossref / PyPI / npm 全部 200；**Semantic Scholar 429（无 key 被限流）→ 不用它**，改用 OpenAlex + Crossref。

**元数据不装 MCP**：OpenAlex/Crossref 是普通 REST，用已有的 `web_fetch` 就够 → 少两个第三方进程。做法写进新 skill `metadata-query`（第 5 个用户级 skill），并已加入 persona 的路由列表。

**验证结果（端到端，2026-10-11）**：

| 层级 | 证据 |
|---|---|
| 配置 | composed 树含两行（L1875 / L1884）；`Config` 两行 `status: schema`；`list_plugins` 两行 `fiberPhase: active`（配合 `failOnStartupError: true` ⇒ 两个 stdio 服务均启动并握手成功） |
| 协议 | [`tools/mcp-probe.mjs`](tools/mcp-probe.mjs)（不依赖 DSH 会话）：`arxiv-mcp-server v0.8.2` 暴露 **19** 个工具；`zotero-mcp` 暴露 **3** 个 |
| 真实调用 | `mcp__zotero__zotero_search_items("seismic")` → **141** 命中（库共 **1582** 条）；`mcp__arxiv__search_papers(...)` → 真实结果，并附 `content_warning` 把外部内容标为不可信数据 |
| 全文通道 | `zotero_item_fulltext(85ZCTB6Z)` → **79,900 字符**真实正文。stderr 追踪到调用链 `items/<key>` → `items/<key>/children` → `items/<attachment>/fulltext`。该文是 **ScienceDirect 付费论文**（DOI 10.1016/j.engstruct.2026.123345）⇒ **付费全文确实被读到**，这正是接 Zotero 的理由 |

**副产品**：MCP 行挂载后工具**当场注册进运行中的会话**，无需重启 DSH。

**新发现的约束（未处理，待裁定）**：`zotero_item_fulltext` **无分页**，单篇可达 ~80k 字符（≈20–25k token）。预设的 `tool-result-pruner`（thresholdChars 8192 / head 4096 / tail 1024）会截成头+尾、**丢掉中间**。可选缓解：让 agent 用 `curl` 把本地 API 的 fulltext 落成文件，再用 `read` 按 offset 分段读。

**已知降级项**：arxiv `citation_graph` 依赖 Semantic Scholar → 无 key 会 429（项目所有者 选择不注册）；`semantic_search` / `reindex` 需要 pro extras。

**仍待确认（需一次新会话）**：`mcp__arxiv__*` / `mcp__zotero__*` 是否出现在 **autoresearch 预设会话**的工具表里。按规律应当可见，但仍是**推断**。

**环境坑**：查 Zotero 本地 API 必须用 `curl.exe`，`Invoke-WebRequest` 会失败（Zotero 返回 `HTTP/1.0`）。一开始我误判为系统代理，实测 `HTTP_PROXY` 等均未设置、WinHTTP 直连 ⇒ **代理无影响**。

### 13.9 工具隔离（2026-10-11 完成，待新会话确认）

**需求（项目所有者）**：预设只保留「standard 的常用工具 + 我们自己的」，其余插件工具既不要漏进来，也不要漏出去。

**机制（官方 API，非发明）**：`ctx.tools.restrict({allow})` —— “Restrict **global** tools for the calling agent scope… **scope-local registrations remain visible**”。官方实践文档：*“Hiding tools from one agent is `ctx.tools.restrict()` on that agent's context.”*

由此得到一条**结构性规则**：预设自己声明的行 → **scope-local** → 永远可见；profile 级插件的工具 → **global** → 可被白名单挡掉。

**据此做了三件事**：

1. **MCP 行从 profile 级搬进预设**（`mcp-academic/` 已卸载）→ 同时解决「漏进来」与「漏出去」。结构证据：composed 树里 `preset-autoresearch` 缩进 0，而 `mcp-arxiv` / `mcp-zotero` / `autoresearch-isolation` 缩进 **6**（嵌在预设内）。
2. **新增预设里第一个 JS**：[`autoresearch-preset/isolation.js`](autoresearch-preset/isolation.js)。**动态白名单**：先用 `ctx.tools.schemas()` 取全局视图，再与期望名单求交——因为 `restrict()` 会拒绝「未知名字」与「scope-local 名字」，求交使其**失败安全**（不会因某个名字改名或缺失而把预设搞挂）。
3. **保留 / 屏蔽清单**（项目所有者 裁定）：保留 mnemon（17）、modsearch（`read_page`/`x_search`）、better-edit（`str_replace_editor`/`undo_last_edit`）、`read_image`；屏蔽 univer、config-manager、code-review。

**为何必须保留 mnemon**：`progress-sync` 的三层沉淀（Documents / runtime memory / 工作区日志）**全靠 mnemon 工具**；屏蔽它会让该 skill 静默失效。

**验证**：

- [`tools/isolation-selftest.mjs`](tools/isolation-selftest.mjs)（不依赖 DSH）：**12/12 PASS**，实测日志 `kept 7 global tool(s); masked 5`（含一个虚构的 `some_future_plugin_tool` ⇒ 白名单语义对**未来新增**的插件同样生效）。
- composed 树层级检查：三行均在预设内（见上）。
- `Config` 查 `@deepseek-ai/dsh-mcp-client` → **0 条**（profile 级已清空）。
- 预设自测新增：三行列入必需行 + **leak guard**（若有人把它们搬回 profile 级，自测立刻 FAIL）。

**插件副作用（有意）**：`apply()` 会把结果写到 `autoresearch-preset/isolation-report.json`（数据文件，不会被自动加载）——这是**无需浏览器即可验证隔离是否真的执行**的手段。单元测试产生的假报告已删除。

**一个未确认点**：运行中的 DSH 是否会在**不重启**的情况下重新组合预设声明。判定方法很干脆：**新会话选 Autoresearch 后，看 `isolation-report.json` 是否重新出现**——出现即新行已挂载；没出现就需要重启 DSH。

### 13.10 能力补全（2026-10-11，第二轮）

项目所有者 回顾“通用科研工具还应具备什么”后，逐步核对出三个空缺并补齐：

| 空缺 | 补齐物 |
|---|---|
| **实验纪律**（“写代码验证”这一步原本一条规则都没有） | 新 skill [`experiment-protocol`](skills/experiment-protocol/SKILL.md)：实验卡（假设/命令/配置与种子/产物/观察到的事实/解读/有效性/裁决）、**“跑完了 ≠ 跑得有效”**、控制组同条件、负结果是结果、只读基线不可变 |
| **子代理汇报契约**（子代理是“声称了但没验证”最容易溜进记录的地方） | 新 skill [`delegation`](skills/delegation/SKILL.md) + persona **第 9 条纪律**：子代理结论一律带署名且 `[unverified]`，直到主 agent 自己读产物；**报告写文件、消息只给指针**（因为 `tool-result-pruner` 在 8192 字符处静默截断中间） |
| **坑的归宿** | 项目模板新增 [`research/pitfalls/`](project-template/research/pitfalls/README.md)（追加式、**按症状索引**、带适用环境与日期、作废即删）+ `progress-sync` 新增 §3.3 指明去向 |

**为何坑不进 mnemon**（沿用 项目所有者 自己的判据“修完就过时”）：坑数量多、每条短、靠症状检索、环境一变就作废；而 mnemon 是受管存储，runtime memory 又有 10KB 硬上限。⇒ **文件为主**，只有“每轮都要遵守”的少数几条才进 runtime memory。

**同步落地**：项目模板的权威层级加入 `experiments/`（第 6）与 `pitfalls/`（第 7）；README 的 Layout 同步。

**现状**：7 个用户级 skill；persona **9 条纪律 + 7 条路由**，常驻 **3058 字符 ≈ 849 token/请求**（原 711）。预设自测 19 项 PASS（规则 8→9、路由 5→7），隔离自测 12/12 PASS。

**本轮我犯并修掉的一个错**：更新自测期望时锚点用错了一行（把检查行写在了 `)` 之上），造成 `filter(` 未闭合 + 一条自相矛盾的断言。diff 当场暴露；已修，并补了 `node --check` 到自测流程。**教训：改代码的锚点必须来自紧邻的上一次读，不能凭记忆推断行内容。**

**有意不做**：方向发散循环（项目所有者 裁定暂缓）；`tool-ralph` 仍不加回（续跑由 `goal` 提供——`create_goal` 明确支持跨轮自动续跑，还有 `max_goal_rounds`）。

