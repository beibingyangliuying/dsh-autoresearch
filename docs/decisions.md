# 决策记录 —— 为什么是现在这样，以及否掉了什么

> 只记**长期仍然成立**的决策与理由。会立刻过时的验证数字不在这里（跑自测即得）；
> 原始时间线在 [`archive/plan-v0.md`](archive/plan-v0.md)。

## 怎么读这份文件

**节号就是时间序**（§1 最早），所以引用一律写"§NN"——改名、搬家之后它仍然成立。
每条裁定的形状是"背景 → 实测 → 结论 → 落在何处"；找不到某条裁定就按标题里的症状或主题检索。

**发布记录已移出本文件**：每个版本发了什么、从哪个 tag、复核结论，在 [`releases.md`](releases.md)。
下表记的是**原节号**，所以"§34"这类旧引用照旧落得到。

| 版本 | 原节 |
| --- | --- |
| 0.2.0 | §34 |
| 0.2.1 | §36 |
| 0.3.0 | §46 |
| 0.3.1 | §48 |
| 0.4.0 | §51.5 |
| 0.5.0 | §53 |
| 0.6.0 | §57 |
| 0.7.0 | §59 |
| 0.8.0 | §61 |
| 0.9.0 | §64 |

## 1. 分层：预设管"怎么研究"，工作区管"研究什么"

**决策**：预设里**不出现任何议题专属内容**；课题的护栏、权威层级、记号写在工作区的 `AGENTS.md`。

**理由**：真正让研究严谨的是领域约束，但领域约束不能进通用预设，否则换课题就得改预设。

**否掉的替代方案**：把示例课题的护栏（只读基线、no physics drift、`DESIGN PENDING` 是停止牌）
直接写进 persona。那样预设就不再通用，而且这些规则换个领域就是错的。

## 2. 纪律放在 skill，不放在 persona

**决策**：persona 只放**常驻的最小纪律集 + 路由**；每条纪律的细节、判据、就地排除条件放在按需加载的
skill 里。

**理由**：persona 每轮都付成本，skill 只在触发时付。而"就地排除条件"这类内容很长，不该常驻。

**代价（已接受，需持续盯）**：路由表必须常驻，所以它会随 skill 数线性增长。如果再加到十条以上，
就要把每条纪律的细节彻底下沉，persona 只留一句话 + 指针。

## 3. 从"零 JS"到"预设里必须有 JS"

**决策**：预设里最终包含一个约 90 行的插件。

**理由**：工具隔离只能由**运行在预设作用域内**的插件调用注册表 API 来完成，声明式配置做不到。

**否掉的替代方案**：一直保持零 JS。做不到——那就只能接受工具泄漏。

## 4. 隔离用"保留制"白名单，不用"拉黑制"

**决策**：只列**要保留**的全局工具；不在名单里的全部不可见。

**理由**：拉黑制会随着新插件的出现而失效（新插件不在黑名单里 → 自动可见）。保留制对**未来的**插件
天然生效——这一点已用"虚构的未来工具名"做过单元验证。

**一个必须记住的依赖**：记忆类工具**必须**留在白名单里，因为沉淀纪律的结论层与拒绝方向层全靠它们。
屏蔽它会让那份写好的纪律**静默失效**（skill 还在，工具没了）。

## 5. 学术 MCP 行必须嵌在预设里，不能挂在 profile 级

**决策**：把两个 MCP server 行从 profile 级 bundle 搬进预设，并卸载那个 bundle。

**理由**：profile 级挂载会**双向泄漏**——研究会话看到别的插件的工具，别的会话看到研究工具。
嵌进预设后它们是**作用域内注册**，既不受白名单影响，也不会外泄。

**否掉的替代方案**：挂在 profile 级 + 靠白名单挡住。挡得住"漏进来"，挡不住"漏出去"。

## 6. 踩过的坑放文件，不放 mnemon

**决策**：坑进工作区文件（追加式、按症状索引、带适用环境与日期、作废即删）；只有"每轮都要遵守"的
少数几条才进运行时记忆。

**理由**：沿用 项目所有者 自己的判据——*"修完就过时，没啥价值"*。坑数量多、每条短、靠症状检索、环境一变
就作废；而 mnemon 是受管存储（不能直接编辑），运行时记忆还有 10KB 硬上限。

**否掉的替代方案**：坑进 mnemon Documents。条目一多就淹没，且无法按症状 grep。

## 7. 子代理的结论默认不是事实

**决策**：子代理结论**带署名且标为未验证**，直到父代理**自己读了产物**；报告写文件，消息只给指针。

**理由**：子代理是"声称了但没验证"最容易变成父代理口吻的地方。另外工具结果超过 **8192 字符**时，
压缩后只剩头 4096 + 尾 1024（裁剪时点已更正，见 §63），长报告**中间会丢**——所以必须落文件。

**否掉的替代方案**：让子代理直接回长报告。中间会静默丢失，且父代理会把子代理的话当成自己的结论。

## 8. 实验必须有卡，且"跑完了 ≠ 跑得有效"

**决策**：每次运行产出一张卡（假设/命令/配置与种子/产物/事实/解读/有效性/裁决）；没有产物路径的结果
**不可报告**；配置或种子缺失就降级为探索性；假设写在看到结果之后就不算检验。

**理由**：这是整条流程里最贵、最容易自欺的一步，而原先**一条规则都没有**。

## 9. 语言：契约与纪律用英文，回顾文档用中文

**决策**：persona、skill 正文、`protocol.md`、`surface.md`、`README.md` 用英文；`docs/` 下的回顾与决策
用中文。

**理由**：目标物本身是英文（persona/skill），项目所有者 的研究文档也是英文；而 `docs/` 的读者是 项目所有者
本人，中文更省力。每个子树内部语言统一。

**否掉的替代方案**：全中文（与目标物不一致，术语要双语对照）；契约双语（两份文档都要维护）。

## 10. 文档拆分：契约 / 索引 / 回顾 / 决策 / 归档

**决策**：沿用 项目所有者 自己的契约文档范式（normative `protocol.md` + non-normative `surface.md`），
并让判据决定归属——**"这句话在实现整体改名之后还成立吗？"**

**理由**：原先那份开发日志同时承担了五种寿命不同的内容（契约、索引、验证证据、决策、时间线），
任何一份文件被这样用都会变成大杂烩。验证证据**不单独落盘**（会立刻过时），只留可重跑的命令。

**一处由范式逼出来的改名**：某个纪律原本叫 `delegation`——它既是公共符号，又是常用英文词，会在
"契约不得出现符号名"的子串校验里与正文误撞。已改名为 `subagent-contract`。

## 11. 被否决 / 暂缓的方案（记下来，避免以后重新讨论一遍）

| 方案 | 处置 | 理由 |
|---|---|---|
| 常驻自组织多代理 + 共识投票 | 否决 | 属于另一个量级的工程（单个插件 64KB 起），且与"工作台"定位不符 |
| 方向发散循环（生成 N 个互异方向 + 显式淘汰判据） | **已解除一半**（§86） | 生成那一端解除了，但只许从已裁定产物派生、且每条候选必须带杀死条件；"凭空发散"仍然不做。两把锁与解除理由见 §86 |
| 加回 ralph 循环工具 | 不加 | 续跑已由目标工具提供（跨轮自动续跑 + 轮数上限） |
| 注册语义检索的 API key | 不注册 | 该源在无 key 时限流；改用两个无需 key 的元数据源 |
| 保留表格/看板、配置管理、代码审查三类工具 | 屏蔽 | 研究场景用不上，且它们是全局工具，会稀释预设的工具面 |
| 给工作区上 git | 不上 | 项目所有者 的选择；进度由文件 + mnemon 承担 |
| 让 Zotero 集成支持写回 | **已实现**（闸门由 Zotero 原生强制） | 工具 `tools/zotero-write.mjs`；**每次写入都由 Zotero 弹出授权对话框**，项目所有者 点 Allow 才生效；key 单次有效且**不落盘**，agent 只能提议。2026-10-12 首次真实写入成功（以一篇真实预印本条目验收，条目数 1582→1583） |

## 12. 写入 Zotero：闸门由 Zotero 原生强制

**决策**：写入走 **Zotero 10 的本地 API**（`POST /api/users/0/items`），不注册任何长期密钥。

**为什么这个闸门是“真”的**：授权流程是 `POST /api/local/authorize` → **Zotero 自己弹窗**问 Allow / Always Allow / Deny，返回的 key **单次有效**（除非点 Always Allow）。所以“每次写入都要用户确认”不是靠我的代码自觉，而是**由 Zotero 强制**；脚本也不保存 key。

**否掉的替代方案**：

- **Web API + 账号 key**：功能等价，但要把长期密钥写进配置，且写入经云。
- **MCP 写入**：`zotero-mcp` 只暴露 3 个只读工具，做不到。
- **`/connector/saveItems`**：端点存在（400 ≠ 404，已用不存在的路径做过对照），但官方文档未写载荷格式，源码在我这里取不到（`raw.githubusercontent.com` 与 jsDelivr 均不通）——**不猜格式**。

**首次写入踩到并修掉的两个坑**（已记入 README 的已知约束）：

1. **等人类的请求不能用 `fetch`**：授权会挂起等你点击，而 fetch 的默认响应头超时把它变成一句无信息的 `fetch failed`。改用 `node:http` 且不设超时。
2. **数组 POST 的返回是“已保存对象”而不是 key**：单个对象返回 `success: {"0": key}`，数组 POST 返回 `successful: {"0": {...}}`。按字符串取会得到 `[object Object]`，回读 URL 随即崩掉。

**防重复**：写入前按标题 / DOI / archiveID 查库，命中则**拒绝创建**（`--force` 才覆盖）。已用真实条目验证（正确识别出库中已有的一篇论文）。

## 13. 文献检索顺序：本地库优先，但“搜不到 ≠ 不存在”

**决策**：文献纪律的第一步写死检索顺序——**本地库 → 预印本索引 → 元数据 REST**，并要求说明每个来源出自哪一步。

**理由**：本地库是**唯一**存着付费论文全文的地方（实测读到过 79,900 字符的 ScienceDirect 正文），而且它已经被筛过一遍。

**必须同时写进规则的两条反作用**（否则“优先”会变成“漏掉”）：

- 本地库**不新**：命中它不能推出“没有更新的工作”。
- 本地检索是**关键词匹配**：搜不到**不等于**不存在——要区分“没搜”和“搜了没有”（纪律第 5 条）。

**同时记录一个工具陷阱**：`download_paper` **不下 PDF**——它抓的是 HTML 正文（实测 38,255 字符、12000 截断、带续读游标），不落任何文件。真 PDF 用 `curl.exe -sL "https://arxiv.org/pdf/<id>"` 并**验证**（content-type / 大小 / `%PDF` 魔数）。

## 14. 参考文献的“不重复读”：Zotero 真源 + 工作区索引

**决策**：读完一篇后必须留下 digest——**真源写在 Zotero 条目上**（子条目 note，跟着库走、你的插件看得见），**工作区 `research/literature/refs/` 只存一行索引**（key · 年 · 等级 · 标签 · 一句话），索引是**派生数据**，丢了可从库里重建。

**为什么两层**：库是跨工作区、跨机器都存活的那一份；而工作区文件是 agent 能**免费 grep** 的那一份（无需 API 往返）。索引可重建 ⇒ 不会漂移成第二个真源。

**同时定下阅读阶梯**（写进文献纪律）：元数据/摘要 → 大纲 → 定向段落 → **全文落盘（最后手段）**。为找一件事而读全文 = 白花上下文；arXiv 那三个工具（outline / section / search）恰好构成这条阶梯。

**token 经济**（选择“分散进现有纪律”，不新开 skill、不加常驻成本）：文献（声明阅读预算）· 实验（预算也是阅读预算，别为查一个数把整个产物倒进上下文）· 交接（给子代理阅读预算 + 强制报告落文件）。

**新增第 8 个纪律 `synthesis-plan`**：拥有“综合成可执行稿”这一步——它是从“N 个方向都探过”到“就按这个干”的唯一一步，而此前**没有任何 skill 拥有它**。可执行稿必须含：选定路径、**赢得判据**、被否决项及理由、**验收标准（含失败条件）**、第一步、风险与回退、预算。

**新增 3 条不变式**：`INV-EVID-4`（读过的不再重读）、`INV-CTX-1`（全文最后才加载）、`INV-DEC-1`（承诺前必须有可执行稿且含证伪条件）。

## 15. 预设“消失”的真因：相对行名 + 注册表试挂载（2026-10-12）

**现象**：Autoresearch 从**新建会话的预设入口**消失；设置页一度也看不到（那是客户端缓存，刷新后才出现，且带红色“加载失败”徽章）。

**根因**（由徽章原文确证）：`autoresearch-isolation(./isolation.js): never started`。

同一个相对行名在**两条路径**上解析基准不同：宿主组合时相对 patch 文件解析（所以能跑），注册表**试挂载**时用 `record.context.baseUrl` → `MODULE_NOT_FOUND` → 插件永不启动。注册表把审计失败写成 `record.broken`，而客户端**新建会话的 chip 直接过滤掉 broken 项** ⇒ 静默消失。

**修法**：行名改为可解析的**包子路径** `@local/dsh-autoresearch-preset/isolation.js`（bundle 本就链在 profile 的 node_modules 里，两条路径都能解析）。隔离能力一字未改。

**护栏**：`preset-selftest` 新增一项——预设块内**不得出现相对行名**，否则 FAIL。

**两条可复用的诊断知识**：宿主组合成功 ≠ 预设可被选中（前者 Loader 层，后者注册表层）；设置页读客户端缓存，“看不到”不等于“不存在”，徽章悬停才是权威原因（宿主日志只写终端）。

**代价与教训**：这个缺陷从隔离落地那天就存在，而当时只验证了“**配置写对了**”，把“**能被选中**”一直挂在“待验收”里。**验证必须打到用户真正触达的那一层。**

**附带修复**：profile 补丁里 `llm-deepseek` 的包名漂移（base 现为 `@deepseek-ai/dsh-llm-deepseek-api-key`）已对齐，该行不再被跳过，自定义模型清单恢复生效（改动前已备份到 `.tmp/`）。

## 16. 工具隔离的真正语义：deny 而非 allow（契约 Revision 2，2026-10-12）

**现象**：试用时 agent 报告"没有 shell / ls 之类工具"——预设自己的工具被一并屏蔽了。

**根因**（由 `@deepseek-ai/dsh-tools` 的 `view()` 实现 + 本次试用写出的真实 `isolation-report.json` 双重确证）：

- `restrict()` **过滤的是"该作用域继承来的东西"**——全局层以及链上**每一个祖先层**——而**不过滤它自己那一层注册的**。
- 对 **agent** 来说，**预设自己声明的行是"祖先层贡献"**，不是 agent 自己那一层。
- 所以 `allow` 只列全局工具时，**预设自己的 pwsh / read / write / glob / grep / skill / subagent 等一并被屏蔽**。报告里 `allow` 只有 19 项，且 `read_image`（我们自己的 `tool-fs` 提供的）被丢弃——同一 bug 的第二个证据。
- 我原先写在 `isolation.js` 注释与 `protocol.md` §5 的"scope-local 永远可见"，**抄自工具描述**，而实现注释明确说那种读法是错的。

**修法**：过滤器改为 **`deny = 全局视图 − KEEP`**。`admits()` 只拒绝被点名的名字，所以预设自己的工具不受影响；deny 列表**每次激活重算**，对将来新装的插件同样有效（与 allow 对全局工具的效果等价）。

**契约修订**：`protocol.md` **Revision 1 → 2**，§5 改写并显式标注修订原因。

**护栏**：`isolation-selftest` 的第一条断言改为 **"filter carries NO allow list"**——这个缺陷的回归守卫。

**教训**：同一个错误犯了两次——**用文档/描述代替实现来验证机制**。第一次是相对行名（读工具描述就以为 scope-local 免疫），第二次是这里。**机制类断言必须读实现，或验结果。**

## 17. 时序缺口修复：隔离改为两次施加（契约 Revision 3，2026-10-12）

**现象**：config-manager 的 5 个工具（`config_backup` / `config_list_snapshots` / `config_restore` / `config_sync_pull` / `config_sync_push`）漏进研究会话。

**根因**（与组合顺序**无关**）：插件工具注册的时机由 **`inject` 依赖链**决定，不是由组合顺序决定。config-manager 声明 `inject = ['settings', 'credentials']`，要等设置存储与凭据库就绪才激活 ⇒ 它的工具在本插件激活**之后**才注册 ⇒ 那一刻算出的 deny 列表里没有它们。对照：univer（`['skills']`）、code-review（含 `tools`）都更早，已被 deny。

**修法**：隔离过滤器改为**两次施加**，且**限制相交**：

1. 本行**激活时**——覆盖"激活之前已注册"的全局工具；
2. **每次 `agent/created`**——此刻全局视图已完整。

第二遍即使落到本行作用域也足够：deny 列表会被重算，而**祖先层上的限制覆盖其下所有 agent**。处理器整体包 try/catch——**隔离绝不能让 agent 创建失败**。

**契约修订**：`protocol.md` **Revision 2 → 3**，§5 改为"两次施加"的描述。

**护栏**：`isolation-selftest` 新增 4 项——注册了 `agent/created` 处理器；第二遍 deny 覆盖 config-manager；第二遍仍保留 mnemon/modsearch；**失败的处理器不抛出**。

**验证状态**：⚠️ **待做**——需重启内核（模块在启动时加载）+ 开一条会话（处理器在 agent 创建时跑）。判据：`isolation-report.json` 里出现 `agentDenied` 且**包含 config-manager 的 5 个工具**。

**教训**：这是"用文档/描述代替实现"之外的**第二种**错误——**用"顺序直觉"代替依赖分析**。我最初以为"组合里靠后的行注册得晚"，实际决定时机的是 `inject`。

**验证结果（2026-10-12 收口）**：⚠️ **第二遍未生效**。用户实测一条真 Autoresearch 会话：**shell / 文件工具在** ✓（`allow`→`deny` 的修复**已被用户层面确认** ✓）、**config-manager 的工具仍在** ✗ ⇒ 第二遍没有起作用。**推断**：预设作用域内的 `ctx.on('agent/created', …)` 收不到该事件（**未确认**，也不再排查）。

**处置**：代码保留为 best-effort（无害），**契约收窄**为"保证激活时的覆盖"，第二遍**不属于保证范围**（`protocol.md` §5 已同步）。**明确决定：不再为此投入排查**——它不影响任何功能。

## 18. 配置化（A2）与技能随包（A3）：两项都找到了比原计划更对的机制（2026-10-12）

**A2 配置化 —— 桥用 `ctx.systemPrompt.section()`，既不是事件也不是消息注入**

- 可调值在**设置页里填** ✓（`settings` 服务把 Config schema 投影成表单、`autoGenerate` 默认 true ⇒ **零前端工作** ✓）
- ⚠️ 原计划的"挂 `system-prompt/assemble`"**不可行**：它与 `agent/created` 同属 scoped 事件家族，而**预设作用域收不到 `agent/created`**（它在 agent 建好、作用域链接上**之前**派发）——这正是隔离第二遍无效的机理 ✓
- 查 `systemPrompt` 服务后找到**正规扩展点** `section({name, order, text})` ✓ ⇒ 新行 `autoresearch-contact`（`contact-bridge.js`）：**空配置什么都不注册** ✓，填了才注册一行提示 ✓
- skill 侧只改一处措辞（"用系统提示里宣告的地址"✓），仓库里再无个人邮箱 ✓

**A3 技能随包 —— 用 `ctx.skills.register()`，比 `bundledSkillDir` 更对**

- `skills` 服务自述：注册**落在调用作用域的层**，而**由预设常驻组合挂载的插件落在该预设的层** ✓ ⇒ 我们的技能**只对这个预设的 agent 可见** ✓（拷进 `~/.dsh/skills/` 会污染 profile 里**所有**会话 ✗）
- 因此把 `skills/` **移进包内**（`git mv` 需**逐个目录**做：整目录一次会 Permission denied ✗）——插件用 `import.meta.url` 定位 ✓，无需任何路径配置 ✓，也绕开了 `bundledSkillDir` 走 `path.resolve` 的陷阱 ✓
- 新行 `autoresearch-skills` + 新自测 `tools/skills-selftest.mjs` ✓

**新发现的 Windows 陷阱（两个自测同时踩到）**：OneDrive 同步的目录带 **`ReparsePoint`** 属性，`Dirent.isDirectory()` 对它们返回 **false** ✗，尽管里面有文件 ✓ ⇒ 技能读取与文档权威清单都**静默变空** ✗。修法：**不要依赖 `isDirectory()`**，直接探测 `SKILL.md`（或 try 读取）✓。

**教训**：两项功能都是"**先查服务的自述，再选机制**"的产物 ✓（对比上一轮"凭印象指认机制"✗）；而两次静默变空都是**自测**发现的 ✓ —— 自测在本项目已是第 5、6 次兜住错误 ✓。

## 19. 预设再次"消失"的真因：`exports` 把包封死了（契约 Revision 4，2026-10-12）

**现象**：设置页卡片红徽章"加载失败"，理由是三行全部 `never started`——与第 15 节（相对行名）**同一个后果、相反的成因**。

**根因**：`package.json` 的 `exports` 只列了 `.` 与 `./client`（B1 加客户端半时引入 ✗）。Node 的 `exports` 是**封包**语义 ⇒ 三个行名（`<pkg>/isolation.js`、`/contact-bridge.js`、`/skills.js`）全部 `ERR_PACKAGE_PATH_NOT_EXPORTED` ✗ ⇒ 行连导入都没开始（`entry.fiber === undefined` ⇒ 注册表报 `never started`）⇒ `mountPreset` 抛错 ⇒ `record.broken` ⇒ 新建入口静默过滤 ✗。

**为什么三条护栏都没响**（这是本节最值钱的部分）：

| 我以为在守什么 | 实际守的是什么 |
|---|---|
| A4 加的"行名可解析"护栏 | 用的是 `existsSync(bundleDir/subpath)` ✗ —— **查了磁盘、没查解析器**。文件就在那儿，而 Node 拒绝解析它 ⇒ 报 OK ✓✗ |
| `preset-selftest` 的检查 [2]~[5] | 默认读 `.tmp/composed-web.txt`，那份**写于 14:17**（8 小时前，在改名与重打包之前 ✗）⇒ 一直在验**旧现实**，既报**假 FAIL**（缺 contact/skills 行）也报**假 PASS** ✗ |
| 六项自测全 PASS 的结论 | 因此对整段下午都**部分无效** ✗ |

**为什么我把力气用错了地方**：连续三轮把它误判成另外两个原因（`inject: ['settings']` 硬依赖 ✗ / `inject` 导出被吃 ✗）——都是**先猜机制、后取证**。而真证据一条命令就能拿到：`createRequire(profileDir).resolve('<pkg>/isolation.js')` ✓。

**注册表代码给出确定性结论**（不再靠推测）：`activate(record)` 只在启动时挂载一次，失败即 `record.broken`；`diagnostic(record)` 在 `generation === undefined` 时**直接返回 `record.broken`**（注释原文 *"A mount failure is final."*）⇒ **失败是终局的，必须重启内核**，刷新页面无效 ✓。

**修法**：① `exports` 补全三个行子路径（+ `./package.json`）✓；② 护栏改为**从 profile 基线走 Node 解析器**（这才是试挂载真正用的那一步）✓；③ 新增**快照新鲜度护栏**：快照必须比 `cordis.patch.yml` 与 `package.json` 新，否则直接 FAIL 并打印重生成命令 ✓。

**两条新护栏都做了负向对照**（在**真实的坏状态**上先响一次，而不是自造夹具）：解析护栏在修 `exports` **之前** FAIL 并点名三个子路径 ✓；新鲜度护栏在改完 `package.json` 后 FAIL 并点名 `package.json` ✓。

**验证**：从 profile 基线逐行 `resolve + import`，三行全部 `apply=yes`、inject 正确 ✓（`client` 在 Node 里 `window is not defined` 是预期的——它是浏览器代码）。契约新增 `INV-ROW-1`，Revision 3 → **4** ✓。

**教训（两条，同一类错误的两个新变种）**：
1. **"文件存在"不等于"模块可解析"** —— 断言必须打在实际的机制上，而不是它邻近的一个易查事实；
2. **验证所依据的快照本身也需要被验证** —— 我反复强调"看结果不看文本"，但这次的"结果"是**八小时前的结果**。陈旧输入给出的是**看起来同样确定的错误结论** ✗。

## 20. 设置页没有输入框的真因：字段必须标 `volatile()`（2026-10-12）

**现象**：预设恢复可用后，设置 → Autoresearch 页面仍没有输入框（只有我加的结构诊断）。

**根因**：DSH 设置层有一道我**从未读到**的过滤 —— `volatileForm(schema)`：**只有 `meta.volatile === true` 的字段算 "live"** ✗，一个都没有时它返回 `undefined` ⇒ `describe()` 里 `if (form === void 0) return []` ⇒ **整条条目静默消失** ✗。而我把 `mailto` 写成了 `schema.string().default('').description(...)` —— **少了 `.volatile()`** ✗。写入侧是同一把锁：`write()` 直接抛 `Plugin entry "..." has no volatile fields` ✗。

**我先后猜错了三个方向，全部被证据推翻**：① "bundle 插入的行层级上不可见" ✗ —— `pwsh-sandbox`/`session-log-deepseek` 同样来自 bundle patch（`dsh-base/cordis.patch.yml`）却能出现在设置页 ✓；② "`entries()` 范围/唯一性把它滤掉了" ✗ —— 探针显示它在 `configEditor.entries()` 里 ✓；③ "fiber 没激活" ✗ —— `fiberState=2`、`runtime.Config` 带 `toJSON` ✓。

**决定性的一步是"问运行中的组合"，不是继续读代码或猜** ✓：写一个探针行，用 `--patch` 临时挂上，`--port 0` 起**第二个宿主**（不抢端口、不干扰你那个），让它在真实启动里打印 `loader.entries()` / `configEditor.entries()` / `settings.describe()`。一次就把范围缩到唯一一处：前三道条件全过，`describe()` 里**就是没有它** ✗。⇒ 只能是我没读完的那个函数。

**修法**：`.volatile()`（保留 `description()`）✓；新护栏断言"Config 至少有一个 volatile 字段"+"contact 字段带说明"✓，并做了**负向对照**（去掉 `.volatile()` ⇒ 两项 FAIL ✓，恢复后**哈希一致** ✓）。

**端到端验证（我自己做完，不需要你操作）**：
- `settings.describe()` 出现 `autoresearch-bundle(auto=true)`、`value={"mailto":""}` ✓
- **写入路径实测**：profile patch 里生成 `- id: autoresearch-bundle / config: {mailto: ""}` ✓ ⇒ 测完**已还原**（哈希与备份一致 ✓）
- 远程 `update()` 写完后重新 `describe` 并 `return namespaceView(descriptor)` ✓ ⇒ 页面用 `response.value`/`.revision` 是对的

**教训（比上一节更深一层）**：**"服务返回空"不等于"没有这个条目"** —— `describe()` 是**过滤后的投影**，它同时受三层条件限制（`entries()` 范围、fiber 状态、volatile 表单），而这三层里**只有一层是我读代码时看懂的** ✗。⇒ **"读实现"也有深浅：读到自己以为懂了就停，与凭印象猜是同一个错** ✓。正确的做法是**在那个对的上下文里直接问它**（探针能起第二个宿主、`--port 0` 不抢端口，这条技术以后可复用 ✓）。

## 21. 付费全文：取不到的是"取得"，不是"检索"（契约 Revision 5，2026-10-13）

**决策**：**不建爬虫**。付费全文的获取改成三级阶梯并写进纪律——**库内全文检索 → 免费 OA 回退 → 向所有者提 PDF 请求单**。库写入的闸门不变（Zotero 原生逐次授权）。

**先验前提（本轮实测，不是推断）**——三条，其中两条推翻了"搜不到付费文献"这个说法：

1. **付费文献的元数据一直可检索** ✓：`api.openalex.org/works/doi:10.1038/nature14539`（Nature 付费）返回完整记录。被墙的从来不是"检索"，而是"**取得不在库里的全文**"。
2. **链接附件同样进全文索引，也同样能被全文检索** ✓：`/api/users/0/items/<attachmentKey>/fulltext` = 62,188 字符 / 11 页；全文模式的一条查询命中该附件。所有者的库已是 `linked_file` 为主（path 为 `attachments:` 相对形式 ⇒ 基目录已配，实测解析到该基目录）⇒ **省空间的链接附件方案不牺牲 agent 的读取能力** ✓。
3. **库搜索默认只搜标题 / 作者 / 年份** ✗：必须显式 `qmode='everything'` 才搜摘要、笔记与附件全文。实测同一个词 `inoperative`：默认模式 **0** 命中，全文模式 **4** 命中（含那篇付费论文的 PDF）。而**纪律里一个字都没写它** ✗ ⇒ 库内的付费全文此前等于不存在——**能力早就装好了，只是没被写下来**。

**为什么不做爬虫**（三堵墙，且代价归属不在 agent）：

- 机构订阅绑在 **IP 段 / SSO 会话**上，agent 进程两者都没有；`read_page` 又走**云端 Firecrawl**（无法、也不应携带机构凭证）✗。
- 出版商 ToS 禁止系统性下载，且有反爬；触发后的代价落在**你的账号与机构 IP** 上。
- 本机 profile **没有任何浏览器工具**（`isolation-report.json` 的 kept 只有 `read_page` / `x_search`）✗ ⇒ 上爬虫等于新增一条工具通道，而不是"用现成能力"。
- 唯一合法的自动化是机构 TDM API（Elsevier / Wiley / Springer），需**所有者注册**，本轮不做。

**为什么"人取机读"够用**：所有者已在用 Zotero Connector 一键入库 ⇒ 取件这一步本来就有人的环节，缺的只是把"我需要它"变成**一张有约束的请求**。请求单六字段：`identifier` / `what it settles` / `level needed` / `already tried` / `budget` / `state`（`requested → received → read`）。两条约束防止它退化成购物清单：**免费阶梯没走完并报告之前不许问**；**收到文件不等于允许入库，也不等于读过**。

**闸门范围（本轮裁定）**：**维持现状**——只有"写入参考库"需要逐次授权（`INV-EVID-3` + §9 非目标，本来就是硬不变式）；引用**已在库、已读**的文献，或向证据表追加行，不需要逐次点头。OA 发现只是线索，自动取回的副本要入库同样走逐次授权。

**落在何处**：`skills/literature-recon/SKILL.md` §2（检索阶梯 4 级）+ §7（全文检索纪律、PDF 请求单**子小节**——不新增顶层章节，因为 §4 规定了纪律的 fixed sections）；`skills/metadata-query/SKILL.md` §3（OA 回退小节）；`protocol.md` §6 升 **Revision 5**（所有者库是全文通道，不是标题索引）。

**顺带否掉**：不给 `tools/zotero-write.mjs` 加 `--attach <pdf>`。本地 API 确实支持三阶段文件上传（[官方文档](https://www.zotero.org/support/dev/web_api/v3/local_api) ✓），但入库路径已由 Connector + 链接附件覆盖，这条自动化没有用户。

## 22. 存储型附件 → 链接附件：增量走 API，存量走 in-app（2026-10-13）

**决策**：不做插件、不做爬虫式批量。按**增量 / 存量**分工：**增量**（每轮新入库的 PDF）由 agent 通过本地 API 逐次授权完成（`tools/zotero-link-attachments.mjs`，默认 dry-run）；**存量**（整库搬迁，主要是 200 个 HTML 快照）由**所有者本人在应用内**粘贴 `tools/zotero-link-snippet.js` 执行。两侧共享两个设置字段：`autoLinkAttachments`（开关）+ `attachmentStorePath`（目标目录）。

**为何必须分两半**（契约决定，不是偏好）：`protocol.md` §9 写死 *never as a background, bulk, or assumed-standing action*，而 API 每次写入要一次授权弹窗 ⇒ 400 次写入的批量迁移在契约上违规、在体验上不可行。in-app snippet 的执行者是**所有者本人**、在应用内、无 API 授权 ⇒ 契约完全不涉。

**先验前提（本轮实测，四条）**：

1. **本地 API 能直接建 `linked_file` 附件** ✓：探针 1 实测 `linkMode` 正确、父条目挂上、`/file/view/url` 200；给**绝对路径**时 Zotero 会**自动规范化**为 `attachments:` 相对形式 ⇒ 链接路径天然跨机器可迁移。
2. **API 建的附件不会自动进全文索引** ✗：索引排空器只在“启动时发现有活”才注册（`fulltext.js` L1852：`if (!stalled && … getAttachmentExtractionQueueCount() > 0) registerQueueDrainObserver()`），本会话早已排空并停止 ⇒ 探针 2 观察 **360 秒**仍是 404。我先前据源码推断“会自动补上”，**被实测否定**。
3. **写一条笔记就能唤醒它** ✓：`item.js` 保存笔记时调 `flagNoteStale`，其末句就是 `registerQueueDrainObserver()`（`fulltext.js` L2341）；探针 3 实测 **15 秒**内入库 17,794 字符、17/17 页。工具与 snippet 因此都在收尾时保存/更新一条固定标记的笔记。
4. **空间账**：storage 518 MB 中 **438 MB 是 200 个单文件 HTML 快照**；PDF 早已搬完（396 个里 392 是 linked_file、0 个 imported_file）；回收站还压着 **53 MB**（清空即释放）；链接附件的 `.zotero-ft-cache` 另占 ~23 MB——**这部分不可省**，它就是全文检索的成本。快照 200 个中 **165 个同条目另有 PDF、35 个只有快照**（删掉即失去独占的可检索全文）⇒ 因此选“**搬走**”而不是“删除”。

**坑（本轮踩到并修掉的）**：

- **布尔字段写成字符串会被 schema 直接拒绝**（实测 `expected boolean but got true`）⇒ 设置页 draft 必须保持真类型，不能一律 `String()`。
- **`OS` 不是 Run JavaScript 上下文的全局**（item.js 里能用是模块级导入）⇒ snippet 不能依赖 `OS.Path.join`，改用显式分隔符。
- **样本选择会制造假因果**：探针挑“最小 PDF”，我一度误判为“该文件抽不出文字”；真因是排空器休眠。
- dry-run 抓到一个真 bug：候选对象漏带 `contentType`，目标扩展名会变成 `.html`（把 PDF 存成 html）。

**顺带否掉**：Zotero 插件路线（ZotMoov / Attanger：能自动转，但需验证 Zotero 10.0.6 兼容性，且把“我的库怎么组织”交给第三方代码）；Sci-Hub 类；通用爬虫（见 §21）。

**落在何处**：[`index.js`](../index.js)（两个 volatile 字段）· [`client.js`](../client.js)（FIELDS + checkbox 渲染 + 类型化 draft）· [`contact-bridge.js`](../contact-bridge.js)（同一 section 增一条策略行）· [`tools/zotero-link-attachments.mjs`](../tools/zotero-link-attachments.mjs) + 其自检 · [`tools/zotero-link-snippet.js`](../tools/zotero-link-snippet.js) · [`README.md`](../README.md) · [`docs/overview.md`](overview.md)。**`protocol.md` 不动**——这正是分工方案的目的。

## 23. 自带 CLI 脚本必须是绝对路径：agent 并不在这个仓库里（2026-10-14）

**现象（junhan 提出的问题，已核实到具体行）**：纪律 skill 与系统提示都用**相对**路径点名脚本（`skills/literature-recon/SKILL.md` 三处 `tools/zotero-write.mjs`；`contact-bridge.js` 的 mailto 行与附件策略行各一处），但脚本只存在于**本预设仓库**；脚手架 `tools/new-project.ps1` 只复制 `project-template/`（其中没有 `tools/`），而预设当时只告知 agent `{{cwd}}`（**已过时，2026-10-18 见 §47**：内核 0.2.1 起 `cwd` 不再是提示词变量，工作目录改由必需运行时上下文给出）。⇒ 在 `D:\studies\某课题` 里 `node tools/zotero-write.mjs` 直接解析不到，agent 唯一能做的是**满盘找这个 checkout**。这就是"agent 要来到我们这个仓库来找"的字面成因。

**决策**：路径在运行时由 `import.meta.url` 推出（新模块 `preset-paths.js`），分两处呈现——(1) `contact-bridge.js` 的 section **常驻一行**绝对目录；(2) skill 正文改用 `{{presetTools}}` 占位符，由 `skills.js` 在**注册时**替换（读盘内容保持原样 ⇒ `skills/` 仍是唯一真源）。

**先验前提（实测）**：`cliToolsDir` = `<本仓库>/tools`（经 profile 的 Junction 加载时，`import.meta.url` 解析到真实路径）；正斜杠是刻意的，粘进 shell 命令无需转义。替换只放在 `apply()`、**不放在 `readSkills()`**——我第一版就放在 `readSkills()` 里，`skills-selftest` 立刻以 "a shipped body names a helper through the token" FAIL 抓到：那样读盘内容也已被替换，**"占位符存在"与"替换已发生"就无法同时断言**。

**为何不采用"把 tools/ 复制进脚手架"**：会出现两份真相并各自漂移；而预设本就是链接安装，绝对路径天然可用、零配置。

**成本**：该行 ~185 字符/请求（≈52 token）。

**落在何处**：[`preset-paths.js`](../preset-paths.js)（新）· [`skills.js`](../skills.js) · [`contact-bridge.js`](../contact-bridge.js) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · 两条护栏进 [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs) 与 [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs)（裸 `tools/*.mjs` 即 FAIL；token 未被替换即 FAIL；token 指向的 helper 必须真的存在）· `protocol.md` 新增 `INV-HELPER-1`（Revision 7）。

## 24. 参考库通道换源：zotero-mcp-server 0.14.1，41 工具、默认只读、写入门禁（2026-10-14）

**决策**：`mcp-zotero` 从 3 工具只读的 kujenga `zotero-mcp` 0.3.1 **替换**（不并存）为 54yyyu 的 `zotero-mcp-server==0.14.1`，`ZOTERO_MCP_TOOLSETS=none`；写入能力**开启**，但门禁由常驻纪律写死。

**先验前提（本轮实测，全部不是推断）**：

1. **本地 API 能建 / 删分类** ✓：`POST /api/users/0/collections` → **200**（新建 key、version 697），`DELETE …/collections/<collectionKey>` → **204**，分类总数 **43 → 44 → 43**，无残留。官方文档原文：Zotero 10+ 的本地 API 支持 `POST/PUT/PATCH/DELETE` **用于 items、collections、saved searches**，另有 tag 删除、full-text 写入、文件上传；授权弹窗有 Allow / **Always Allow** / Deny，前者 key 单次有效，后者**可复用且不分作用域**，弹窗限 5 次/分钟。
2. **新旧服务器读的是同一个库** ✓：新版列出 **43 个分类 key**，与本地 API 的 `Total-Results: 43` 逐一对上（5 个根分类，两侧逐一对应）；`My Library — 622 items`（本地 API 顶层条目 `Total-Results: 612`）；两个领域查询词（`qmode=everything`）都返回真结果。**一条假警报已排除**：带 `limit=4` 时它只回 1 个根，看着像"读到了别的库"，实为 `limit` 语义怪异。
3. **工具面成本（按 `tools/list` 全文实测）**：旧 = **3 工具 / 3,849 字符**（≈1.07k token）；新默认 = **41 / 67,743**（≈18.8k）；`none` = **35 / 59,758**（≈16.6k）。⇒ 换源净增 **≈+15.5k token/请求**（而预设 persona 常驻仅 ~1.2k）。上游 README 自称 "38 工具 / 13.4k" —— 与实测不符，**这条是上游文档错了，不是我们测错**。
4. **默认不可写** ✓：`zotero_write_capabilities` 返回 `Mode: none`（本地只读可用、无 key、无 web 凭据）。
5. **`none` 砍掉的 6 个全是只读工具** ✓（pdf outline / page layout、语义库 status / update、list / switch libraries），**12 个写工具全部保留** ⇒ "裁 toolset"与"允许写"不冲突。
6. **语义检索不可用** ✓：`[semantic]` 扩展未装，`zotero_get_search_database_status` 直接回 "install it with …"，而 `zotero_semantic_search` 仍在工具表里 ⇒ skill 必须写明"服务器自己建议的那个工具在这里无效"，否则 agent 会去调用一个只会报错的工具。
7. **全文体积**：同一篇（一个真实条目）新版 **54,443 字符**（≈13k token；默认按 `fulltext_display_max_pages=10` 截页），旧版 79,900 ⇒ **仍远超** `tool-result-pruner` 阈值 8,192 ⇒ 老的"落文件 + 按 offset 读"绕法**必须保留**（我最初以为截页就解决了，实测否定；裁剪时点已更正，见 §63）。
8. **坑**：`zotero_get_collections(limit=4)` 只回 1 个根，语义未深究 ⇒ **别用 `limit` 列举分类**。

**为何 pin 版本**：`uvx --from zotero-mcp-server zotero-mcp` 每次启动都重新解析"最新版"；上游 README 至今写 38 工具 / 13.4k，而 0.14.1 实测 41 / 18.8k ⇒ 不 pin 等于让**工具面随上游漂移**，且无网启动解析失败时该行 `failOnStartupError: true` 会把**整个预设**标记为坏、新会话入口静默过滤掉它。

**写入门禁为何写进 prompt 而不是靠隔离**：这些写工具由**预设自己声明的行**注册 ⇒ scope-local；`restrict({deny})` 只过滤**继承来的**全局工具，且**拒绝 scope-local 名字**（契约 §5）⇒ **隔离在原理上管不住它们**。因此门禁只能由契约与常驻纪律承担：`INV-EVID-3` 与 §9 要求**逐次授权**，而 "Always Allow" 会把可复用、不分作用域的 key 落到 `~/.config/zotero-mcp/config.json` ⇒ 与"逐次授权"直接冲突，故在 prompt 里写死禁止，并要求"先说要写什么再请求授权"。成本：该行 ~200 字符/请求（≈55 token）。

**落在何处**：[`cordis.patch.yml`](../cordis.patch.yml)（`mcp-zotero` 行 + 行内实测注释）· [`contact-bridge.js`](../contact-bridge.js)（写入门禁行）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（工具改名 + 体积实测 + 语义检索无效）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（pin 与 toolset 两条护栏，静默回退即 FAIL）· [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs) · [`README.md`](../README.md) · `protocol.md` §5 / §6（Revision 7）。**另**：本轮把两个一次性探针从 `.tmp/` 转正为 [`tools/mcp-call.mjs`](../tools/mcp-call.mjs)（跑单个工具并**保完整输出**——`mcp-probe.mjs` 会把结果截到 1500 字符，正是它让"只 1 个分类"的假象得以出现）与 [`tools/mcp-toolsize.mjs`](../tools/mcp-toolsize.mjs)（按 `tools/list` 全文量常驻成本）⇒ 上游一升级就能一键复核是否漂移。

**顺带否掉**：并存两个 MCP 行（常驻 ≈19.9k token，收益只是"旧行为逐字可复现"）；`ZOTERO_LOCAL_WRITE=false` 硬只读（那等于回到"我们自己写 collections 子命令"，而本轮选择是直接用上游写工具 + 门禁纪律）；把 `tools/` 复制进脚手架（见 §23）。

**顺带清理（已执行，2026-10-14）**：profile 里有**两条同类的死 Junction** —— `@local/dsh-autoresearch-preset` → 已于 2026-10-12 上移掉的 `autoresearch-preset/`，以及 `@local/dsh-autoresearch-mcp` → 已卸载的 `mcp-academic/`。两条都实测为 `LinkType=Junction`、**目标不存在**、通过链接可见 **0** 条目、且 profile 自身文件**零引用**（`@local/` 下已无其它条目）⇒ 用 `cmd /c rmdir` 逐个删除（**只删链接，不触及目标**），清空后的 `@local/` 目录一并移除；健全的 `@beibingyangliuying/dsh-autoresearch-preset` → 本仓库经复核仍为 Junction 且目标存在 ✓。该清理在 profile 侧，不在本仓库。**教训**：`docs/overview.md` 曾把隔离写成"保留制"、这两条死链也曾长期存在——都是"旧布局的痕迹留在文档与 profile 里"，靠一次通读核不出来，只能靠"每次动作都复核目标是否存在"逐个发现。

## 25. 预设源改动只有宿主重启才生效——"开新会话验证"是个陷阱（2026-10-14）

**怎么发现的**：按验证清单开了一条 autoresearch 新会话做验收，它的工具表里参考库只有 **3** 个工具、而且是**旧名**（`zotero_item_metadata` / `zotero_item_fulltext`，无 `get_`），系统提示里也没有本轮新增的 helper 目录行与写入门禁行——但这三件事在磁盘上都已改好。该会话没有停在"没生效"，而是取证到了根因（进程命令行 + 包版本 + 描述字符串逐字比对）。

**证据一（实测时间线）**：宿主 `dsh web`（pid 2612）起于 **20:53:40**；它拉起的 MCP 子进程 `uvx zotero-mcp`（**未 pin**）与 `uvx arxiv-mcp-server` 分别起于 **20:54:13 / 20:54:18**；本轮改动落盘于 **22:12:33 / 22:18:48 / 22:23:24**；改动之后**没有**任何按新 pin 规格启动的 zotero MCP 进程 ⇒ 会话里那 3 个旧工具来自宿主启动时拉起的那一个进程。

**证据二（实现，不靠推断）**：`dsh-agent-preset-registry` 的 `register(definition)` 把**解析后的行表**存进内存 Map（`lib/index.js:476`、`500-509`），`mount()` 挂载的是 `record.config.plugins`（同文件 `534`、`693`）⇒ 新会话挂的是**宿主启动时那份定义**，而不是重读 patch；该文件自己的注释也写明 *"In-memory Loader tree; only the profile configuration editor persists definitions."*。插件代码另有宿主进程的 **ESM 模块缓存**，同一进程内 `import` 不会重读磁盘。

**结论（已写进 README）**：改 `cordis.patch.yml` 或任何一个宿主侧插件 `.js` 之后，**必须重启宿主**；刷新页面、开新会话都不够。`--dump-config` 与全套 selftest 描述的是**下次启动将要挂载的东西**——所以它们可以在"运行中的会话仍是旧面"时全部 PASS，两者不矛盾。

**附带结清两个历史开放项**（PLAN.md 冻结不改，结论记在这里）：

- PLAN.md 13.8 的"仍待确认：`mcp__arxiv__*` / `mcp__zotero__*` 是否出现在预设会话工具表" ⇒ **确认出现** ✓：该会话实测 `mcp__arxiv__*` **19** 个、`mcp__zotero__*` **3** 个（旧服务器）。
- PLAN.md 13.9 的"运行中的 DSH 是否会在不重启的情况下重新组合预设声明" ⇒ **不会**。当时的判定方法是"看 `isolation-report.json` 是否重新出现"；本轮用更直接的证据（子进程命令行 + 注册表实现）给出了答案。

**方法论教训**：验收必须在**正确的进程**里做。"开了新会话"不等于"改了的东西在跑"——先比较宿主启动时间与改动时间，否则测的是旧配置。这与 §15 / §19 那两次"预设消失"是同一类错误的另一面：那两次是"改了源但没生效"，本次是"**以为新会话就等于生效**"。

## 26. 诊断工具的陷阱：`session` 记录里的 `agentPreset` 是"创建时默认值"（2026-10-15）

**怎么发现的**：第二轮验收会话的输出完全正确（我逐条复核过），但用 `tools/dump-session.mjs` 单会话 dump 它的转写做交叉核对时，工具打出的第 1 行是 `"agentPreset":"standard"` —— 而这条会话手里明明有 35 个 `mcp__zotero__*` 工具、系统提示里也有预设那两句原文。矛盾不在会话，**在工具**。

**事实（逐条有原始输出）**：

- `session` 记录（第 1 行）里 `agentPreset: "standard"`；
- 紧随其后的独立记录 `{"type":"agent-preset/selected","seq":3,"data":{"agentPreset":"autoresearch"}}`（创建后约 2 秒）——**这才是实际跑的预设**；
- 该会话 `request/header` 的工具表：共 **101** 个工具，其中 `mcp__zotero__*` **35** 个、`mcp__arxiv__*` **19** 个，且这 35 个名字与 `ZOTERO_MCP_TOOLSETS=none` 档实测 payload 的 35 个名字**集合完全相等**（零差异）。

**为何算真缺陷**：`--scan` 的 docstring 与 README 都把它当"这条会话真的跑了哪个预设"的入口，而它当时**只解析第 1 行**（`parseHeader` = `text.split('\n', 1)[0]`）⇒ 会把一条跑了本预设的会话报成 `standard`。这与 §15 / §25 是同一族错误：**读到一个看似权威的字段就当成结论**。

**修复（已做）**：`--scan` 与单会话 dump 都改用 `parsePresetFacts()`——读**最后一条** `agent-preset/selected` 作为实际预设 `effective`，同时保留"创建时值"，两者不一致时把列打成形如 `autoresearch (created standard)`；单会话 dump 另打一行 `preset : ran=… created=… selection-records=…`。为控制成本，只解析含 `agent-preset/selected` 字样的行（转写可达数万条记录）。**修复后回测**：两条验证会话都正确显示 `autoresearch (created standard)`。

**方法论教训**：**诊断工具的输出本身也要验收**。当"工具说 X"与"我手里有 Y 的直接证据"冲突时，先怀疑工具读的是**哪一条记录**。

## 27. 预印本通道同样 pin 版本（2026-10-15）

**决策**：`mcp-arxiv` 从裸 `uvx arxiv-mcp-server` 改为 `uvx --from 'arxiv-mcp-server==0.8.2' arxiv-mcp-server`，与 §24 的参考库行一致；`preset-selftest` 的 pin 护栏从"只查 zotero 行"改为**逐行**检查两条 MCP 行。

**先验前提（实测）**：正在运行的进程用的是缓存环境 `c0ArwNvW2cUEIUAH`，其中 `arxiv_mcp_server-0.8.2.dist-info` ⇒ 实际版本 **0.8.2**；另做一次全新 `uvx --from arxiv-mcp-server` 解析，结果同为 **0.8.2**（即上游当前最新版就是这个），且工具数 **19**，与当初选定该通道时记录的数字一致 ⇒ **今天没有漂移**，pin 是为了让明天的漂移不会静默发生。该行常驻成本实测 **17,828 字符 ≈ 5.0k token**（`tools/mcp-toolsize.mjs`）——它与参考库行的 ~16.6k 合起来，是本预设最大的两项常驻开销，改任何一条都必须先看这个数字。

**理由（与 §24 同源）**：不 pin 的 `uvx` 规格**每次启动重新解析**，工具面会在没人改配置的情况下变化；而本预设的纪律文本按名字引用过具体工具，文档里的成本与工具数也都按实测写死。

**代价与边界**：pin 之后不再自动获得上游新能力与新工具；升级必须是一次显式动作（改 pin 值 → 跑 `tools/mcp-toolsize.mjs` 复核工具面 → 同步纪律文本 → 重启宿主，见 §25）。两条 MCP 行共用同一条护栏，静默退回未 pin 会 FAIL。

**落在何处**：[`cordis.patch.yml`](../cordis.patch.yml)（`mcp-arxiv` 行 + 行内注释）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（逐行 pin 护栏）· [`README.md`](../README.md)（探针命令改用 pinned 规格）。

## 28. MCP 行无法按工具名过滤——"裁工具面"只有两个杠杆（2026-10-15）

**起因**：参考库行里 `zotero_semantic_search` 常驻但不可用（`[semantic]` 扩展未装，调用只回"请安装"）。于是问：**能不能只把这一个工具摘掉？**

**结论（读 DSH 自身源码，不是文档推断）**：**不能。**

- `@deepseek-ai/dsh-mcp-client` 的 stdio 行 Config 是**封闭字段清单**（`lib/index.js:780-790`）：`transport` / `serverName` / `command` / `args` / `env` / `cwd` / `toolCallTimeoutMs` / `failOnStartupError` / `maxInstructionBytes` / `reconnect` —— **没有** include / exclude / toolFilter 之类的字段。
- 其 `syncTools()`（同文件 `127-141`）把服务器列出的**每一个**工具都注册进注册表，只在重名时抛错 ⇒ **客户端侧不存在过滤点**。
- 预设侧同样不行：这些工具由**预设自己声明的行**注册 ⇒ scope-local，而 `restrict({deny})` 只过滤**继承来的**全局工具、且**拒绝 scope-local 名字**（契约 §5、本文件 §16）。

**因此"裁工具面"只有两个杠杆**：

1. **服务器自己的 toolset 组**（如 `ZOTERO_MCP_TOOLSETS=none`：41→35 工具、18.8k→16.6k 字符）；
2. **不挂这一行**（代价是整个通道）。

**裁定（2026-10-15）**：`zotero_semantic_search` **保持常驻**。理由：它误导 agent 的具体路径是全文返回头里那句 *"Consider using zotero_semantic_search to find specific content…"*，而全文读取发生在文献工作中——此时 `literature-recon` 按纪律**必须已加载**，且该 skill 已写明"服务器自己建议的那个工具在这里无效" ⇒ **误导路径恰好被覆盖**；而摘掉它要么装重依赖（chromadb + sentence-transformers + 嵌入模型），要么自建过滤代理 MCP（新增常驻进程与长期维护），为省 ~2.7k 字符（≈750 token，占该行 4.5%）性价比不成立。

**通用教训**：想在 MCP 工具面上省钱，**先看服务器有没有分组开关**（它决定能省多少），不要指望 DSH 侧按名字裁——那条路不存在。改任何一条 MCP 行之前，先用 `tools/mcp-toolsize.mjs` 量出常驻成本（见 §24 / §27 的数字）。

## 29. 预印本通道改走自带 CLI helper，MCP 行不挂（2026-10-15）

**决策**：`mcp-arxiv` 行**整个删掉**（不是 disable），该通道改由 [`tools/arxiv.mjs`](../tools/arxiv.mjs) 承担，纪律文本直接点名这个 helper。常驻成本从 **17,828 字符（≈4,952 token）/请求降到 0**。两条 MCP 行合计的 21,551 token/请求里，本轮兑现其中的 4,952；参考库行的 16,599 留待 Zotero 一轮。

**先验前提（本轮实测，全部不是推断）**：

1. **DSH 侧确实没有过滤点**（§28 复核）：`dsh-mcp-client` 里 grep `toolFilter|includeTools|excludeTools|enabledTools` → **0 命中**。所以"只留两个工具"在 MCP 路线上做不到，只能整行不挂。
2. **上游 schema 贵得不成比例**：arXiv 19 工具 17,828 字符；参考库 35 工具 59,758 字符（平均 1,707 字符/工具）。按纪律文本圈出"真的会用"的 8 个参考库工具，**照抄上游 schema 仍要 17,272 字符（≈4.8k）**⇒ "瘦 MCP"若不重写描述，省不动。只有 CLI（常驻 0）是数量级的答案。
3. **承重能力不在 MCP 里**：arXiv 官方 Atom API 直接可用（`cat:cs.CL AND abs:"retrieval augmented"` → **3,779** 命中，摘要与作者齐全）；Zotero 本地 API 自己就支持全文模式（`qmode=everything` **178** vs `titleCreatorYear` **2**）。
4. **编码等价**：`URLSearchParams` 把 `:` 编成 `%3A`，返回 `total` 与字面冒号那次**同为 3779** ⇒ 不需要手搓 query string。
5. **错误响应的形状（关键）**：无效查询回 **HTTP 400**、`max_results=40000` 回 **HTTP 500**（手册 3.1.1.2 写的是 400——上游文档第二次错），两种 body 都是 Atom feed、`totalResults=1`、**恰好一个哨兵 `<entry>`**（`<id>https://arxiv.org/api/errors</id>`，甚至带 `<author>arXiv api core</author>`）。⇒ 判错只能按**响应形状**，且任何"读第一个 `<entry>`"的解析都会**把故障打印成一篇论文**。
6. **空结果 ≠ 失败**：`id_list=9999.99999` 回 HTTP 200 / `totalResults` 0 / **零个 entry**，必须与故障分开报。
7. **静默改写**：`abs:"unclosed quote` **不报错**，被改写成 `abs:unclosed OR all:quote` 并照常返回结果（改写只在 feed 标题里可见）⇒ 回显 canonical query 是唯一能发现它的入口。
8. **限流是成文的**：ToU 写明"每三秒一次请求、单连接"；helper 每次运行恰好发一个请求，多个 id 走一次 `id_list`。

**代价与边界（不许被"省了 4.9k"盖住）**：

- **失去预印本全文读取**：LaTeX 源（`get_paper_latex*`）与分段精读族（`get_paper_outline` / `read_paper_section` / `search_paper_text`）随行消失——从未被纪律使用，但那是唯一能"按章节精读而不烧上下文"的现成能力。⇒ **`protocol.md` §6 的 "preprint index — search and full text of preprints" 现在不成立**，契约轮（Revision 8）要改成 search + records。本轮**不动契约**，所以这处不一致是**已知且已登记**的，不是漏掉。
- **失去 MCP 结果自带的 `content_warning`**（外部内容标记为不可信数据的机器标注）⇒ 改由常驻纪律 + skill 文本承担。
- **顺带去掉一个失败模式**：`failOnStartupError: true` 下 uvx 解析失败会把**整个预设**标坏、新会话入口静默过滤掉它；CLI 路线没有这个模式。

**顺带修掉一个此前就存在的假陈述**：阅读阶梯里 "structure / outline" 那一级**两个通道都没有仪器**——arXiv 的 outline 族随本轮消失，而参考库的 pdf outline 工具早在 §24 就被 `ZOTERO_MCP_TOOLSETS=none` 砍掉（实测 35 个工具名里没有 outline）。阶梯因此改成三级（metadata / targeted passage / full text）并写明为何缺这一级。**教训**：成文纪律点名的一级能力，也要回头核对它今天还有没有仪器。

**落在何处**：[`tools/arxiv.mjs`](../tools/arxiv.mjs)（新）· [`tools/arxiv-selftest.mjs`](../tools/arxiv-selftest.mjs)（新，fixture 是逐字实测响应）· [`cordis.patch.yml`](../cordis.patch.yml)（删行，原地留"不要再加回来"的说明）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（**两条反向护栏**：不得再挂为 MCP 行、组合里不得再出现该 server 规格）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`README.md`](../README.md) · [`package.json`](../package.json)（描述里的 "academic MCP pair" 不再成立）· [`surface.md`](../surface.md)（`arxiv` 不再是权威符号——权威集＝skill 名 + MCP `serverName`——改为"该通道不贡献符号"并说明原因）。

**踩到的坑（可复用教训）**：

1. **顶层 await + 动态 import 自身自测 ＝ ESM 循环等待**：`--selftest` 让 `main()`（挂在顶层 `await` 上）去 import 一个**反过来静态 import 本文件**的模块 ⇒ 自测体根本不执行，Node 只打一句 *unsettled top-level await* 并以 **13** 退出，把真实结果吞掉。仓库其它工具用顶层 await 没事，因为它们从不 import 自己的自测。修法：入口改 `main().catch(...)`；自测被 import 时不 `process.exit`，导出 `failedChecks` 由调用方定退出码。
2. **不要打印没发出去的参数**：scope 行曾写 `sort …/descending`，而没传 `--sort` 时 `sortOrder` 根本没发。改成只描述真正发出去的参数（`describeSort`），并加断言钉住。
3. **云同步会动 mtime**：本工作区在一个云同步目录下，编辑工具"读取后才允许改"的观察窗会莫名其妙失效（同一轮刚读过就报文件已变）⇒ 重读后**立刻**改，不要隔几步。

## 30. 参考库通道的范围裁定与写入门禁（2026-10-15，待实现）

**决策**：参考库换成自带 helper 时做**五项**——检索（全文模式 + 分类/标签）、阅读（元数据 + children 找附件 + **我们自己切片**的全文）、笔记回写、新增/改名分类与归入分类、编辑条目字段与标签；**不做删除类**（条目/分类）。**全部写操作默认 dry-run**（与 `zotero-write.mjs` 一致），真写须显式 `--write`；编辑条目必须**读 version + `If-Unmodified-Since-Version`，冲突即整条拒绝**，不得静默覆盖。

**先验前提（本轮实测）**：

1. **全文端点没有分页**：`/items/<key>/fulltext` 回 `{content, indexedPages, totalPages}`，实测一篇 17 页论文正文 **76,908 字符**一次给完（旧服务器 79,900、MCP 的 `zotero_get_item_fulltext` 54,443）⇒ 切片权必须在我们手里，否则一定被 pruner 掐头去尾丢中段。
2. **全文检索可用**：同一查询 `qmode=everything` **178** 命中 vs `qmode=titleCreatorYear` **2** 命中。
3. **`note` 是可创建的 itemType** ✓（`/api/itemTypes` 含 `note`）⇒ 笔记回写可行。**这一项不是可选项**：`literature-recon` §7 要求"读完把 digest 写成条目上的笔记"，而今天唯一能做这件事的仪器是 MCP 的 `zotero_manage_note`——摘掉参考库行却不补这个 helper，会让一条成文纪律没有仪器。
4. **版本前置条件两边都有**：本地 API 接受 `If-Unmodified-Since-Version`（**本仓库 `zotero-link-attachments.mjs:263/282` 已在用并实测通过**），而 MCP 那边也用了同一个头（`zotero_mcp/_helpers.py:390`）。⇒ **不能说 helper "更安全地写入"**；helper 的真实优势只有**默认 dry-run** 与**写后回读**两条。
5. **形状**：分类 `{key,name,parentCollection,relations,version}`；条目读回带 `version` 字段与 `Last-Modified-Version` 响应头（实测 567 / 699）。

**代价与边界**：删除类**故意不做**——误删在真实库里不可逆，所有者在应用里点两下比给 agent 一个删除按钮便宜。**待实现**：helper 集合（检索 / 阅读 / 笔记 / 分类 / 编辑）、纪律文本改写、删掉 `mcp-zotero` 行（届时 `preset-selftest` 的 pin 与 toolset 两条护栏要一并退役）、契约 Revision 8。

## 31. 参考库通道改走自带 helper，两个 MCP 行全部退场（2026-10-15）

**决策**：`mcp-zotero` 行**整个删掉**（不是 disable）。参考库改由 **7 个 helper** 承担：读取（`zotero-read.mjs`）、新增条目（`zotero-write.mjs`，已有）、笔记回写（`zotero-note.mjs`）、字段与标签（`zotero-edit.mjs`）、分类（`zotero-collection.mjs`）、附件链接（`zotero-link-attachments.mjs`，已有），外加共享的 `zotero-local-api.mjs`。常驻 **59,758 字符（≈16,599 tok）→ 0**；连同 §29 的预印本行，**21,551 tok/请求全部归零**。契约同日发 **Revision 8**。

**先验前提（本轮实测，逐条都不是推断）**：

1. **全文端点只认附件 key**：`/items/<父条目key>/fulltext` → **HTTP 404**（MCP 那个工具是自己在内部解析附件的）⇒ 读全文是两步，且**必须报告读了哪一个附件**——"读的是哪份文件"本身是证据。
2. **全文检索回的是混合行**：同一 `qmode=everything` 查询 6 行 = 3 个 attachment（标题恰好是论文名）+ 2 个**标题为空**的 note + 1 个真条目 ⇒ 必须按父条目折叠，否则重复行与空标题。**且 API 没有任何"命中在哪"的字段**——skill 原先那句 `Matched in: attachment full text <key>` 是 **MCP 自己加的标注**，不是库说的话。
3. **`?itemKey=a,b` 不是普通多取**：问 2 个 key，回 **6 行**（记录 + 它们的子条目）⇒ 响应必须按请求的 key 过滤，否则会把别人的子条目认成自己的。
4. **全文没有分页**：一篇 17 页论文的正文 **76,908 字符**一次给完（MCP 版 54,443、旧版 79,900）⇒ 切片权必须在我们手里，否则必然被 pruner 掐头去尾丢中段。
5. **写入门禁的粒度**：`authorize` 弹窗 → **单次** key + 一次性 `Zotero-Write-Token`，弹窗限 **5 次/分钟** ⇒ 每个 helper **一次调用最多一次写**。
6. **分类的版本号几乎恒为 0**（实测：库里只有 §24 经 API 建的那个是 46，其余全 0；而条目是 567）⇒ **分类改名既无法用版本前置条件、也无法用复读比对来防并发**。`--rename` 因此**明说它没有陈旧保护**，而不是让输出暗示有一层不存在的保护；代价有界：该 patch 只发一个名字，不可能覆盖别的字段。
7. **412 的语义不是靠写库试探出来的**：`zotero_mcp/_helpers.py:541` 写着 *"The item changed in Zotero since it was read (412)"*，而 `:539` 提醒**本地模式重载 401/412/428** ⇒ 所以设计成：**我们自己复读比版本**判定陈旧，412 只在版本**真的**变过时才报冲突。用"写一次试试"去验证写保护，正是会毁掉被保护对象的那个实验。
8. **建分类的请求体取自同一份能工作的实现**：`[{"name": ..., "parentCollection": <key|false>}]`——**列表**形式，且**根分类必须显式 `false`**（不是省略、不是 null）。这种细节靠猜必错。
9. **`note` 是可创建的 itemType**（`/api/itemTypes` 含 `note`），子笔记形状 `{itemType:'note', parentItem:<key>, note:<html>}`。
10. **形状陷阱**：`collections` 单值时是**裸字符串**、根分类的 `parentCollection` 是 **`false`**（不是缺省）；`tags` 是 `[{tag}]`；`date` 是**自由文本**（`09/2019`，用 `slice(0,4)` 会得到 `09/2`）。

**设计要点（三条都是"让未知变得无关"）**：

- **`tags` 与 `collections` 一律发送整表**（先读现值 → 算目标全集 → 发全集）。补丁语义是**替换还是合并，本仓库没有实测**，而发整表在两种语义下都正确。
- **陈旧判定用我们自己的复读比对**，版本前置条件只作第二道防线；这样"412 到底叫什么"不影响正确性。
- **写后回读**并逐字段比对（标签按归一化后比），再报告成功——与 `zotero-write.mjs` 的既有约定一致。

**代价与边界**：按 §30 的裁定，**丢掉** annotations 全套、`read_pdf_pages`、`export_bibliography`（CSL 格式化）、`get_recent`、BetterBibTeX key 查、`set_item_parent`、`advanced_search`；**删除类不做**。阅读阶梯的 "targeted passage" 一级改由 `--grep` 承担，并**已写进纪律文本**——§29 刚修过一次"点名一级却没有仪器"，不能在这里再犯。

**契约（Revision 8）**：§6 两处纠正（预印本通道不提供全文；通道经**自带 helper** 到达而非经**行**），§5 的例子从"这样的行注册的写工具"收窄为"这样的行提供的写能力"。

**护栏**：`preset-selftest` 的 `required row: mcp-zotero`、pin 断言、toolset 断言**三条退役**，换成**对两个通道的反向护栏**（`mcp-arxiv`/`mcp-zotero` 都不得再作为 MCP 行、组合里都不得再出现对应 server 规格）。`surface.md` 的 `zotero` 符号同样退场（权威符号集现在只有 8 个纪律），Notes 里两条通道说明合并成一条通则。

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs) · [`zotero-read.mjs`](../tools/zotero-read.mjs) · [`zotero-note.mjs`](../tools/zotero-note.mjs) · [`zotero-edit.mjs`](../tools/zotero-edit.mjs) · [`zotero-collection.mjs`](../tools/zotero-collection.mjs)（+ 各自 selftest）· 回改 [`zotero-write.mjs`](../tools/zotero-write.mjs) 与 [`zotero-link-attachments.mjs`](../tools/zotero-link-attachments.mjs) · [`cordis.patch.yml`](../cordis.patch.yml)（删行）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（检索／全文／阶梯／digest 四处点名 helper）· [`README.md`](../README.md) · [`surface.md`](../surface.md) · [`package.json`](../package.json) · `protocol.md`（Revision 8）。

**教训（三条，都是可复用的）**：

1. **不要用"写一次库"去验证"写保护"**。412 的语义是从一个能工作的实现源码里读到的；拿真实库去试，一旦前置条件不被执行就会**改掉正要保护的那条记录**。
2. **两处缺陷是在"运行前重读自己刚写的代码"时抓到的**：`zotero-edit` 新建了一个 write gate 却从未 `open()`（每次 `--write` 都会失败）；`zotero-read` 用 `export { … } from` 转发归一化函数——**这种方式不会把符号绑进本地作用域**，而它正在调用它们，运行时必然是 `undefined`。写代码的最后一分钟重读一遍，比任何自测都便宜。
3. **`Select-Object -First N` 会掐断管道**，PowerShell 会把被终止的进程的退出码报成 **0**。本轮我因此一度把"用法错误应退 2"读成 0，差点当成 bug 报出去。**给退出码取证时不要截断管道。**

## 32. 首次真实写入抓到：写成功回 204，而工具把它报成"被拒绝"（2026-10-15）

**怎么发现的**：首次真写验收用的是"打标签再撤标签的往返"，目标一条真实条目（key 略）。第一步 `--write` 打印 `The library refused the write (HTTP 204)` 并**退 1**——**但那条写入其实成功了**：只读复核显示标签已在条目上、version 从 **567 变成 703**。

**缺陷**：`applyPatch` 只把 **200** 当成功，而 Zotero 的 `PATCH` 成功时回 **204 No Content**（成功即无 body ⇒ "写后回读"才是唯一证据，这一点本仓库早就知道，`zotero-write.mjs` 的"绝不从 POST 响应就报告 added"就是这个道理）。对写工具来说这是**最坏的一类错**：它关于"你的库到底改了没有"说了假话。而这条知识其实**已经在仓库里**——`zotero-link-attachments.mjs` 的删除路径写着 `deletion.status !== 204`——只是它当时写在**工具特有函数**里，新 helper 没有继承。

**修复**：共享层新增 `isWriteAccepted(status)`（**任何 2xx** 都算接受）并由 `applyPatch` 使用；成功路径不再假定有 body。第二次真写（撤标签）随即打印 `OK - <itemKey> now reads back with every requested value (version 704)`，退 0。

**验收证据（两条真实写入、两次 Allow 弹窗，均为人工授权）**：写入前 `tags: none` / version 567 → 加标签后 `tags: /autoresearch-write-check` / version 703 → 撤标签后 `tags` 为空 / version 704。**库的内容与动手前完全一致**；只有版本计数器递增，那是库自己的记账，不是内容变化。

**保留的边界（不是同一条缺陷）**：`zotero-write.mjs`、`zotero-note.mjs` 的新建路径、`zotero-collection.mjs` 的建分类仍要求 **200**，因为它们都要**解析响应体**取新建对象的 key，204 意味着没有 key 可报。实测这类调用返回 200。

**教训**：① 写工具的成功判据是"**任何 2xx + 回读**"，不是某一个状态码；② 这类**状态码知识必须住在共享层**——它曾经住在工具特有逻辑里，于是新路径没有继承，而 §31 抽公共模块正是为了让这种知识只存在一份；③ **"先做一次真实写入验收"这个决定本身抓到了缺陷**：四个 helper 的 dry-run 全绿、14 项自测全绿，只有真写才暴露了它。

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（`isWriteAccepted`）· [`tools/zotero-local-api-selftest.mjs`](../tools/zotero-local-api-selftest.mjs)（新：2xx 判据 + "未 open 不许写"的门禁契约，后者在发请求前就抛，因此可离线测）· [`README.md`](../README.md) 与 [`docs/overview.md`](overview.md) 的自测清单。

## 33. 隔离的第二次 pass 从未运行；改听 `tools/change` 后晚注册的 config-manager 被逐个挡下（2026-10-15）

**起因**：验证 MCP 转换时**顺手照出**的——一条重启后的 autoresearch 会话手里有 5 个 `config_*` 工具（`config_backup` / `config_list_snapshots` / **`config_restore`** / `config_sync_pull` / `config_sync_push`），而 `isolation.js` 的 keep-list 里**没有**它们。其中 `config_restore` 会用快照**覆盖整个 DSH 配置**，属破坏性能力。

**诊断（两端都有证据）**：

1. **快照太早**：`config-manager` 的 `model-tools.js` 必须经 `ctx.get('tools')` 拿到 tools 服务才注册那 5 个工具（其注释明写"绝不能用 `ctx.tools` 属性访问"）。而激活时的报告只 deny 了 **15** 个（`dsh_code_review` + `univer_*`），**全文不含 `config_`**。
2. **设计的补刀从不运行**：`agent/created` 那个监听器**一次都没被调用过**。证据是它自己写的报告——跨会话**缺** `agentKept`/`agentDenied`/`agentError` 三者任一（源码里只要被调用过，至少写其中一个）。§17 在 2026-10-12 观察到同一现象，当时只记为"未证实生效"。
3. **`restrict()` 与 deny 计算都是无辜的**：激活那 15 个名字在会话工具表里**确实消失**（新会话无 `univer_*`、无 `dsh_code_review`），只有晚注册的 5 个漏进来 ⇒ 坏的是**触发时机**，不是权限也不是 API 能力。
4. **`agent/created` 为何收不到——未查清，且刻意不追**：`dsh-scope` 的规则是"被标记的监听器，其 tag 是 dispatch key 本身或它的**祖先**时才被准入"⇒ 规则本身不是障碍。剩余候选（该 row 的 fiber 不是 agent 的祖先 / row 挂载晚于 agent 创建 / 事件在另一条 context 上派发）本轮不追：**修法不依赖它**，而报告现在会记录真实发生过的轮次，日后可凭证据回答而不是靠猜。

**修复**：改听 **`tools/change`**——注册表在"工具注册/注销或 scoped 限制变化"时发出的事件。其文档明写它**故意不做 scope 过滤**（*"a scoped listener subscribing here sees every change"*），且语义正是"全局变化关系到每个 agent 的**下一次组装**"，恰是所需的窗口。

- **防重入是重点**：`restrict()` 本身也算"限制变化"⇒ 会再触发 `tools/change` 并落回同一个 handler。做法是**在调用 `restrict()` 之前**就把"已施加集合的签名"落定，嵌套那一轮算出同一集合即直接返回。
- 报告**只在真正施加时**记录 `denied`（免得被自己触发的空轮覆盖成空表）；`rounds` 限长 10；**只在集合变化时才重写报告**（`tools/change` 在 agent 注册工具时也会响，不能每次写盘）。

**验收（宿主重启后；14 项离线自测 + 2 项现场只读全 PASS）**：

- **报告**（宿主 **13:49:32** 启动 → 报告 **13:49:36**）出现 **5 轮 `at a tool-set change`**，`denied` 逐个增长 **15→16→17→18→19→20**，`kept` 全程恒为 **19** ⇒ **config-manager 的 5 个工具是逐个注册、逐个被挡下的**，且没有误伤；`rounds` 与 `denied` 里 `config_*` 五个齐全。
- **新会话**（13:52:05，`ran=autoresearch`）工具表 **44** 个（修复前 **49**），差集**恰好是那 5 个 `config_*`、新增 0 个**；转写全文 `config_restore` 命中 **0**；`mcp__` 仍为 **0**。

**顺带解掉一个此前未实测的语义**：`denied` 是**累积增长**而非每轮重置 ⇒ 注册表汇报的是**未被限制的全局集**（`restrict()` 为叠加语义，重复施加整表无害）。这个不确定性我在提交里把**两种可能都钉进了自测**（视图增长 / 视图因自身限制而缩小），现在知道真实的是前者。

**落在何处**：[`isolation.js`](../isolation.js)（COVERAGE 注释 + `apply()`）· [`tools/isolation-selftest.mjs`](../tools/isolation-selftest.mjs)（驱动新事件；断言旧事件**未**注册；在 `restrict()` 内部**模拟重入**；钉住两种注册表视图形态；**断言报告内容**——因为验收取证的正是那个文件）。**另**：`isolation-report.json` 是 **gitignored 生成物**，而自测结尾**会删它**（其注释写明理由：假注册表产出的报告是误导性证据）⇒ **验收必须先读报告、再跑自测**，否则证据被自己删掉。

**教训（三条）**：

1. **"best-effort 补刀"在契约里躺了三天，实际从未运行过一次。** 而同一份文件里的另一条路径（`contact-bridge.js` 用 `ctx.systemPrompt.section()` 这个**服务 API**）一直正常——所以"预设 row 能用"**不能**用来证明"预设 row 收得到 scoped 事件"。**能用的是服务 API，不代表能用的是事件监听。**
2. **测试可以替一个从不运行的机制当替身。** `isolation-selftest` 原先驱动的是**模拟的** `agent/created` 处理器，绿了很久，而真实投递从未发生 ⇒ **"测试驱动的是什么事件"本身就是需要被验证的假设**（§26 是同一族的另一面：诊断工具的输出也要被验收）。
3. **新自测特意断言"旧事件未被注册"。** 只写替代品、不写被替代的错误，等于邀请下一个人把它加回来——而它当年就是这样静静躺着的。

## 35. Zotero 弹窗为什么"始终允许"也没用：留住授予是客户端的责任（契约 Revision 10，2026-10-15）

**现象（junhan 提出）**：操作参考库的工具每次都要弹授权框；点了 **Always Allow** 之后照弹不误。

**根因（两侧各一半，都取证到了）**：

1. **Zotero 侧不记忆"这个应用已被信任"。** 上游 `server_localAPI.js` 的 `AuthorizeLocal._initInternal` 过完限流后**无条件**走 `_promptForAuthorization(appName)`（`:851`）；全文件里 `appName` 只出现在校验（`:837`）、弹窗（`:851`）、落档（`:860`）三处，**没有**"已授权过就跳过"的查询路径。⇒ `Always Allow` 改变的是**发哪种 key**（`remember: true` 的持久 key，见 `:1676` 与 `:171`），**不是**要不要弹窗。
2. **本预设把持久 key 丢掉了。** [`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs) 的闸门把 key 放在闭包变量里（当时的注释明写 *nothing is ever stored, so the next run asks again*），而每个 helper 都是一次**新的 `node` 进程** ⇒ 进程一退 key 就丢 ⇒ 下次再问 ⇒ Zotero 只能再弹。

**实测（所有者 profile 的 `localAPIKeys.json`）**：28 条、`remember=true` **27** 条；`DSH autoresearch collection tool` 一个 appName 就有 **26** 条且全为 `remember` ⇒ **26 次弹窗 = 26 次「始终允许」，其中 25 次发生在首次 Always Allow 之后**。所以"多点几次始终允许"不是收敛，而是**每点一次多攒一把永久、无作用域的写凭据**。

**决策**：

1. **持久 key 按 `Zotero-Server-ID` 保存并复用**（`%LOCALAPPDATA%\dsh-autoresearch\zotero-local-api-key.json`，`ZOTERO_LOCAL_KEY_STORE` 可覆盖）。分区是必须的：key 对别的实例毫无意义，换个数据目录应当重新弹窗，而不是报一串看不懂的 401。
2. **`Allow` 仍然只覆盖一次写入、且绝不落盘**——所有者三个按钮的语义全部保留，工具不替他扩大授权。
3. **撤销靠"发现"而不是"假定"**：被撤销或已消费的 key 由 Zotero 以 **401** 回绝（`:676-679`），闸门丢弃它并**重新问一次**，而不是抱着旧凭据失败到底。一次 `write()` 最多弹 **2** 次（第三次只可能意味着这个库在发它自己会拒的 key）。
4. **五个 helper 统一 `appName`** 为 `DSH autoresearch preset`：授权是按**库**保存的一把，per-tool 名字只会让 Zotero 的清单显示"第一个恰好弹窗的工具"，比真相说得更少。
5. **只靠 Zotero 的 Clear Write Authorizations 撤销**，不在工具里另做 `--forget`：后者不吊销 Zotero 侧那把，会留孤儿凭据。清理必须走那个按钮——Zotero 的 `_localAPIKeysCache` 在内存里，手删文件会被下一次 `_saveLocalAPIKeys()` 写回。

**为何常驻行仍然写死"禁止索要 Always Allow"**：授权模型变了，但 **agent 索要常驻授权**仍然是把"所有者随时可收回的授权"变成"agent 争取到的权限"，§9 的 *no unattended write-back* 正是这个意思。常驻行因此改成**陈述新模型 + 要求先说明要写什么**，选择权留在所有者的对话框里。

**否掉的替代方案**：

- **读 Zotero 的 `localAPIKeys.json` 自取 key**：等于绕过闸门去偷凭据，无显式授权，还依赖别人的内部文件格式。
- **会话级内存凭据**（不加常驻进程做不到）：独立 `node` 子进程拿不到父进程手里的 key，跨进程共享只有"落盘"或"加常驻 broker"两条路，后者与 §6「通道＝一个程序，不用就不花钱」冲突。
- **把存量迁移也收进 API 侧**：常驻授权后批量在技术上可行了，但 §9 保留了"整库迁移不由本预设执行"——那是**另一个** revision 的事。

**一并修掉的旧理由**：[`README.md`](../README.md) 原把"增量走 API／存量走 in-app"归因于"每次写入一个弹窗 + §9 禁止 bulk"；前者已不成立，归因改为只剩契约那条，**分工本身不变**。同族的陈旧表述还有 [`cordis.patch.yml`](../cordis.patch.yml)（"one per write"）、[`index.js`](../index.js)（"per-write authorization dialog"、"every write still needs your approval"）与 [`tools/zotero-link-snippet.js`](../tools/zotero-link-snippet.js)。

**本条取代的旧前提**：§11 与 §12（“key 单次有效且不落盘”、“脚本也不保存 key”）、§21（“库写入的闸门不变：Zotero 原生逐次授权”）、§22（以“每次写入一个弹窗”为分工理由）、§24（以“逐次授权”为禁止 Always Allow 的理由）——它们的**结论**多数仍然成立，但**前提**已由本条取代。

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（凭据库 + 401 自愈 + 供自测注入的 `transport` 缝）· [`tools/zotero-local-api-selftest.mjs`](../tools/zotero-local-api-selftest.mjs)（[3]–[10] 八组，**离线**计数弹窗）· 五个 helper（统一 `APP_NAME`、输出改述）· [`protocol.md`](../protocol.md)（Revision 10：§5／§6／INV-EVID-3／§9）· [`contact-bridge.js`](../contact-bridge.js)（`writeGateLine()` 与其 JSDoc、`attachmentLine()`）· [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`README.md`](../README.md) · [`docs/overview.md`](overview.md)。

## 37. 逐节笔记成为第九条纪律：先验是"库里已有的手写笔记全都没有标记"，而现有写笔记的工具在语义上做不了它（2026-10-16）

**起因**：junhan 提出"读过一篇参考文献后应生成逐节文档"——只写方法论关键章节，**掐头去尾**，风格与他用网页版 DeepSeek"解释文章的第 xx 节"得到的笔记类似。他并问：这事该由 agent 自己做，还是交给 subagent。

**先验前提（本轮实测，不是推断）**：

1. **语料实测**：他指认的范文 `D566Q7D3 Fast calculation of a voltage stability index` 已挂两条子笔记（§2 奇异值分解、§3 算法）；集合 `05-1 潮流灵敏度与安全分析`（`8WP7NI3F`）5 篇共 **14** 条；新分类树 343 篇里按代理判据约 **20** 篇已做（下界——"第三节题为"这类写法会被漏计）；全库全文检索 `文章第` 命中 **42 行**，说明这个模式早就在用，远不止 05 树。
2. **形态实测**（全部来自他现有笔记）：开场句有三种写法（`文章第X节标题是`／`第三节题为`／`第二节标题是`）；小标题镜像论文自己的小节号；公式引用原文编号；结尾必有 `小结`/`总结`；单条 1.8k–5.0k 字符；**无 marker、无笔记标题**；创建顺序＝节序。
3. **选节口径实测**：`D566Q7D3` 的节序是 Abstract / INTRODUCTION / SINGULAR VALUE DECOMPOSITION / ALGORITHM / NUMERICAL RESULTS / CONCLUSIONS，他做的恰好是中段两节 ⇒ "掐头去尾"＝去掉前置的背景/综述节与后置的算例/结论节，只留推导与方法。
4. **现有工具做不了**：`zotero-note.mjs` 的语义是"**唯一**带 marker 的 digest 笔记 + 追加"，而语料里的笔记**全都没有 marker** ⇒ 它既做不出"每节一条"，重跑时也没有判断"这一节是否已覆盖"的依据（只能重复创建）。
5. **必须有"无全文"这一路**：`297FISBF` 的 children 为空（无任何附件）⇒ 该项任务必须能报"缺可读文本"，而不是从摘要编出内容。

**决策**：

1. **新增第九条按需纪律 `section-notes`**，不并进 `literature-recon`：触发条件不同（本纪律不评证据等级），且后者已 258 行。契约升 **Revision 11**（§4 清单 + §6 补一条"写进条目的笔记始终属于所有者"）。
2. **产物＝条目上的子笔记，每节一条**；公式用 **`$` / `$$`**（junhan 2026-10-16 裁定），并保留原文公式号；节笔记**不等于** digest（`INV-EVID-4` 的阅读记录仍是 `literature-recon` 那条 marker 笔记），两条纪律不抢同一个产物。
3. **新写入口 `tools/zotero-section-note.mjs`**：创建（**幂等**——marker 与开场句都算已覆盖，命中即**拒绝**并给出 exit 1）+ `--tidy` 机械整理 + 无参 `--item` 出覆盖计划。
4. **整理只做可判定的机械修复**（junhan 2026-10-16 明确选择）：`<em>…</em>`→`_…_`（markdown 下划线被渲染成斜体所致）、`[…]`→`$$…$$`、`(…)`→`($…$)`（**括号留在定界符外**，因为 `(S^{\max})^2` 与 `$S^{\max}$^2` 不是同一个式子）。只在该文本节点括号配对、且跨度含 LaTeX 标记时转换；未闭合节点**整节点不动**并列入"left alone"。**绝不重写散文**——会猜的修复就是重写。
5. **执行者分规模**：单篇 inline；**≥3 篇**才一篇一子代理，且子代理**只起草到工作区文件**，入库与回读一律留在父代理（库改动是受门控、可审计的动作，放一处才查得清"没重复、没覆盖"）。**（"≥3 篇"这一阈值已由 §66 取代：判据改为本轮读进去的源文本片数；"库写只在一双手里"这条不变。）**

**试点实测（05-2 未做的两篇，全部真写入）**：

- `ASAQH5A3 The continuation power flow` → 3 条：`QE78EVJR`(§2, 2053) · `TS36N2CG`(§3, 2922) · `MYSL4ABF`(§4, 1711)；选节为"潮流方程重构／预测–校正求解／由切向量的灵敏度信息"，跳过引言、算例与结论。
- `VZC2PQLB Voltage stability evaluation using modal analysis` → 2 条：`AQZTGMGQ`(§2, 4548) · `HM4A8AJC`(§3, 2622)；选节为"模态分析方法／设备建模"，跳过引言、应用算例、结论与讨论。
- **反向控制**：写完后对 `ASAQH5A3` 再写一次 §2 → `REFUSED: §2 is already covered by note QE78EVJR (read from its marker)`，**exit 1**，条目笔记数仍为 3（未新增）。
- `297FISBF` → 计划即报 `NO PDF/EPUB/HTML ATTACHMENT`，未写任何东西。
- **一个实测约束**：本库把笔记正文**逐字存储**，不替我们补 `<div data-schema-version="9">` 外壳（他手写的旧笔记有那层外壳，是编辑器加上的）。工具因此不猜那层外壳。
- **一处实测的读数困难**：`ASAQH5A3` 是扫描件 OCR，节标题被识别成 `P SOLUTIOCN`、`-P IZATION AND THE CORRECTOR`，编号不可读 ⇒ 本纪律要求"把据以切分的标题行原文写进报告"，两条相应笔记末尾也注明了"该式按同节符号定义复原，逐字核对请回 PDF"。

**否掉的替代方案**：并进 `literature-recon`（零契约变更，但把两件事塞进一份契约，且该文件已 258 行）· 只加常驻纪律（与 §2"纪律放 skill、persona 只留指针"相反，判据表也无处安放）· 复用 `zotero-note.mjs` 的 marker 语义（重跑即重复）· 直接覆盖旧笔记做"风格整理"（那是重写而不是整理）· 沿用现有裸 `[ ]` 公式（实测那是复制损坏，不是风格）。

**本轮未做／未测（明确登记）**：`--tidy` 的**写入**路径本轮未执行（junhan 选择"先只做新笔记"，整理另行开轮）——其干跑路径已在真实笔记 `HUBAWKBF` 上验证（3574→3672 字符，19 处 `[]` + 36 处 `()` 转换，0 处 left alone）；05-2 的 `297FISBF` 缺附件无法做；批量 fan-out（≥3 篇）未跑；`ASAQH5A3` 的节号是**数顶层标题得来**的（原文编号不可读），若日后拿到带编号的版本需复核。

**落在何处**：[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（九节骨架 + 选节表 + 模板 + 就地排除条件）· [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs) 与其 [自测](../tools/zotero-section-note-selftest.mjs) · [`tools/zotero-read.mjs`](../tools/zotero-read.mjs)（`--item` 读笔记正文，此前只能读到元数据——纪律点名了一把打不开的尺子）· [`cordis.patch.yml`](../cordis.patch.yml)（路由第 9 条）· `protocol.md`（Revision 11：§4／§6）· [`surface.md`](../surface.md) · [`README.md`](../README.md) · [`docs/overview.md`](overview.md) · [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs)（8→9）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（路由 8→9）。

### 37-补. 审阅一轮之后的收尾：行间公式改块状，以及"库会改写你的笔记"的三个后果（2026-10-16）

**起因**：junhan 审阅通过这 5 条笔记的内容，只提一点——行间公式应写成 `$$` 单独成行的块状，而不是挤在一行。

**这一轮实测到的三件事**（都改变了工具行为，不是润色）：

1. **笔记标题在这个库写不进去**：对同一条笔记、同一把版本守卫，`{"tags":[…]}` → **204** 且读回生效（version 2160→2171），而 `{"title":"section 2 probe"}`（纯 ASCII，排除中文与 `§` 的干扰）→ **HTTP 500**，读回 `title=null`。⇒ 原计划"给笔记加标题、子笔记列表可辨"**前提不成立，退回不加**；节号只能靠正文首句与不可见 marker。
2. **应用会剥掉不可见 marker**：junhan 在 Zotero 里打开审阅过的那条（`AQZTGMGQ`）已被应用规范化——多了 `<div data-schema-version="9">` 外壳、**marker 注释消失**；它仍被正确识别为 `§2 (opening)` ⇒ 当初"幂等判据必须能读开场句"的决定被真实数据验证：marker 只是提示，开场句才是键。
3. **块状换行只在"裸笔记"上存得住**：API 直写的 4 条换行完整保留（`TS36N2CG` 的存储文本里可见 `<p>$$`⏎`t_k = \pm 1`⏎`$$</p>`，再次干跑即 `nothing to do`）；而被应用接管的那条，写入块状后**库把它折回一行**。⇒ 工具新增 `isApplicationWrapped`：对这类笔记**不尝试换行**并明说原因，避免"每次都想改、每次都改不动"——正是 [`releases.md`](releases.md) §36 记下的"永远通不过的检查只会一直说同一句话"。

**同时修掉的仪器缺陷**：`--tidy` 的回读校验原本要求**逐字节**一致，而库会重写它碰过的笔记正文，于是对 `AQZTGMGQ` 报出 `READ-BACK MISMATCH`——**写成功了却说写失败**，是写工具最不该说的话。改成两条可判定的条件：**重跑修复已无改动**（收敛）＋**可见文字一致**（不丢内容）。

**落在何处**：[`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)（`isApplicationWrapped`／`normalizeMath({lineBreaks})`／`visibleText`／`repairConverged`／`--title` 的尝试与回退）· 其 [自测](../tools/zotero-section-note-selftest.mjs)（新增 [4b] 段，含块状规则与"已收敛"的正反例）· [`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（§3.2 公式形态与标题、§3.4 表格与"库拥有两件事"、验收清单）。**未做**：按 junhan 2026-10-16 的选择，"顺带整理旧笔记"那一轮**暂不执行**（`--tidy` 的写入路径本轮因修块状公式而首次跑通）。

## 38. 一处继承来的"实测"不能被复核时：改名的可逆实测，以及 version 到底有没有（2026-10-16）

**起因**：工作树里躺着一处不是本轮的未提交改动——`tools/zotero-collection.mjs` 的注释声称"PATCH 改集合名**已实测**可用（2026-10-15，`LZ6P7MSJ`，读回 version 1075）"，而 [`README.md`](../README.md) 同一件事写的是"**未**实测可用"。两者矛盾，junhan 裁定"核对后单独提交"。

**核对的第一层结论是否定的**：这条"实测"**已经无法从库状态复核**——被改名的集合 `LZ6P7MSJ` 在后续清理中被删（全库集合数 **97 → 75**），库里只剩它**改名前**叫"宏观定义"的旧抓取（`.tmp/call-zotero_get_collections.txt`）；而那一轮自己的会话消息（`.tmp/cmsg-8/11/13`）把 `--rename` 写成 **UNMEASURED**，改动本身**没有留下任何原始输出**。⇒ 一条无法再复现的"实测"，在文档里与猜测等价：它既不能支持也不能反驳任何结论。**重做一次比修文字便宜。**

**裁定（junhan 2026-10-16）**：做一次**可逆实测**。

**实测**（同一次运行内完成，两次写入均带回读）：

| 步骤 | 结果 |
|---|---|
| 读当前状态 | `XBUY9SCY` = 「00 基础理论与综述」，version **1125** |
| 改名 | → 「00 基础理论与综述 (probe)」，读回 version **2178** |
| 独立复核 | 用**另一条代码路径**（直接读 `/collections?limit=200` 列表）确认新名字与 version 2178 |
| 改回 | → 「00 基础理论与综述」，读回 version **2179** |
| 独立复核 | 同一路径确认名字已复原、version 2179，且集合总数仍为 **75** ⇒ 净变化为零 |

⇒ **结论**：`PATCH /collections/<key>` 在这个库上确实被接受，且两次都用文件名之外的信息（version 移动 + 第二条读取路径）复核过，不是只看工具自己打印的 "OK"。

**顺带修掉的第二处陈旧**：工具与 README 原写"集合**没有**可用 version、所以**没有**陈旧守卫"。实测这个集合的 version 真实存在并随写移动（1125 → 2178 → 2179）⇒ 口径改为"**不可靠而非不存在**：2026-10-15 实测几乎每个集合都报 0，守卫在那些集合上咬不住；本次这个是真的"，工具的输出也据此改写，并把 `--rename` 那行的"measured 2026-10-15"换成可复现的本次实测。

**落在何处**：[`tools/zotero-collection.mjs`](../tools/zotero-collection.mjs)（头部两条实测口径 + 运行时 NOTE）· [`README.md`](../README.md)（reference-library 那段的"renaming … was not measured"与"no usable version"两处）。**未做**：不删除、不新建任何集合；`--rename` 的"拒绝时停止、绝不新建替代集合"行为不变。

## 39. 逐节笔记批量跑到一半叫停：收口现场，以及两条只读实测（API 删除不可逆 · 老笔记 version 为 0）（2026-10-16）

**起因**：junhan 在批量进行中决定"暂时先全都停掉，就此收口"。本轮到此为止，下面记的是**收口时的现场**与两条会长期有用、且改变了工具/流程的实测。

### 39.1 收口现场（2026-10-16）

- **已入库 24 条逐节笔记**：试点 4 条（`AYN7JEVG` §3；`W7LWWYG3` §1/2/3）＋ 第 1 组 20 条（`ZAIJAK4L` §3/7/8、`7ZGICNQY` §2/3/3.1/3.2、`MSZUIYSN` §2/3/4/5、`W4Y7IR27` §2/3/4/5、`VFB8PW8H` §2/3/4、`JYIMEUK3` §2、`U66W8TTK` §2）。全程 **0 拒绝**，每条都走"干跑→幂等检查→写入→回读"。
- **第 2 组只起草到工作区、未入库**（子代理被中途叫停，草稿留在 `.tmp/section-notes/`）：`T8UIA62A`(2)、`3QDZ7BAE`(2.1/2.2)、`PUM9RHQ4`(5)。**父代理一次库写入都没发**，所以那条线没有留下任何库内痕迹。
- **未动**：34 篇队列里余下 24 篇；另有 1 篇 `DWBQDZKL` 的附件是 AIP 付费墙落地页（18,644 字符只有题录+摘要+参考文献），无正文可切分；3 篇无附件（`297FISBF`、`485SFPPB`、`BSYL8IRR`）。
- **未做**："顺带整理旧笔记"那一轮（junhan 选择暂不执行）。

### 39.2 实测一：本地 API 的删除是**永久**的，不进回收站 ⇒ 删除仍然不建工具

| 路径 | 实测 | 可逆性 |
|---|---|---|
| 应用内删除 | 回收站里现存 **47 条 note**，都是所有者从应用删的 | **进回收站，可恢复** |
| `DELETE /api/users/0/items/<noteKey>` | `204` → 该笔记 `404`；回收站 `Total-Results` **114 → 114 不变**、键不在回收站；父条目的子笔记列表随之减一 | **永久，不可恢复** |

另两条细节：① 不带 `If-Unmodified-Since-Version` 时 DELETE 直接 **428**（这道前提是强制的）；② 两次删除用的版本前提分别是 `0` 与 `281`，都被接受。

⇒ **结论**：仓库"删除类故意不做"的立场由此从"我们没做"升级为"做了就是不可逆的"。删除改由所有者在应用里执行（进回收站、可恢复），本轮交付的是一份**只读待删清单**：`.tmp/notes-to-delete.md`（A 类"一段话总结" **27** 条 ＋ B 类旧"解释文章的这一节" **14** 条 ＝ **41** 条；C 类问答式解说 7 条不在范围内，列出供裁定）。清单只覆盖队列的 34 个条目，全库其它条目未扫。

### 39.3 实测二：老笔记的 `version` 可能是 0，版本前提在那类记录上是空转

`V69CWEVD` 读出 `version=0`、`ZTD5IM2D` 读出 `281`，两者都能被 `If-Unmodified-Since-Version` 接受。这与 §38 记的"集合 version 不可靠而非不存在"同源：**version 为 0 的记录上，陈旧守卫挡不住并发修改**。工具对此的策略不变——照发前提，但不声称它一定咬得住。

### 39.4 本轮同时定下的一条纪律细化

一节的方法内容超过 5000 字符预算时，按**论文自己的子节号**分条（`3.1`、`3.2` 各一条），键就用该子节号。首例是 `7ZGICNQY` 第 3 节：单节方法内容 10.4k 字符，硬并成一条会超预算、砍掉两条会丢方法。工具已支持小数点节号（`c9f8958`），纪律正文同步写明。

**落在何处**：[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（分条规则）· [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs) 与其 [自测](../tools/zotero-section-note-selftest.mjs)（小数点节号）· 只读清单 `.tmp/notes-to-delete.md`（工作区临时产物，不在版本控制内）。**补记（同日收口后）**：junhan 裁定把"不做删除"写进契约 §9 非目标，契约升 **Revision 12**（依据即 39.2 的实测），README 同步。**未做**：删除工具、全库清理清单、第 2 组入库、批量其余 24 篇。

## 40. digest 笔记没有内容级去重：一条"该有的已经有了还会再加"的链条（契约 Revision 13，2026-10-17）

**起因**：junhan 问"读完 Zotero PDF 要留笔记"那条规则，是不是没加防重复措施——"该有的已经有了，但它好像还会添加"。**先纠正一处前提**：这条规则（`literature-recon` §7 的 digest）来自 2026-10-12 的初版，**不是最近加的**；最近加的是逐节笔记（Revision 11），而**逐节笔记恰恰是去重最完整的一条**（marker 读不到还会退回读笔记开场句，命中即 exit 1 拒绝，§37 记过它的反向控制）。junhan 的直觉指对的，是 digest 这条更常被重跑的链。

### 40.1 诊断：去重只做到了笔记级，没做到内容级

| 层 | digest（`zotero-note.mjs`） | 逐节笔记 |
|---|---|---|
| 会不会堆出第二条笔记 | 不会（marker `<!-- autoresearch-digest -->`，一篇一条，无标记的笔记不碰） | 不会 |
| 会不会重复同一段文字 | **会** | 不会 |

`composeNote()` 原样拼接，没有"这段文本已经在笔记里"的判断；而**读回校验拦不住它**——它只验证 addition 在笔记里出现，重复的段落当然"出现"。⇒ 同一条命令跑两次：两段一样的文字，**两次都报 OK**。

**还查出两处相邻缺口**（都不属"内容级"，一并记录，不混为一谈）：

1. **笔记级有一处会被应用吃掉**：应用编辑过的笔记会**丢掉不可见标记注释**（Revision 11 已实测，见逐节笔记工具头部），而 `findDigestNote` 只认标记 ⇒ 所有者在 Zotero 里打开并保存过那条 digest 笔记后，下一次写入会**新建第二条** digest 笔记。
2. **`research/literature/refs/` 那一行没有任何仪器**：纪律只说"再追加一行"，没写"这行已存在怎么办"，唯一防线是读侧的"读之前先查 index"。但它被契约定位成**派生数据**（§7、`refs/README.md`），可重建，严重性低于笔记。

### 40.2 判据与三项裁定（junhan 2026-10-17 逐项定）

1. **判重口径 = 归一化可见文本的子串包含**。不用字节比较：库会重写笔记（加 `<div data-schema-version>`），字节比较会漏判；不用逐段哈希标记：只保护今后写入的段落，且纪律里没有"digest 序号"这个概念。**残留边界（诚实记录）**：它看的是包含关系，看不出"重述"——新 digest 若先复述旧 digest 再补充，会被当成新句子追加。因此纪律仍要求"新的阅读必须说出新东西"。
2. **命中行为 = 幂等无操作，exit 0，打印 `ALREADY RECORDED`**。依据是工具自己头写的退出码契约（`0 applied, or nothing to do | 1 refused …`）与 `zotero-edit` 的 "No change: … Nothing to write." 同构：要达成的状态已成立，不是冲突。**不加 `--force`**：判重是启发式，留一条逃生门就等于把"绕开唯一护栏"变成默认动作。
3. **"标记被应用吃掉 ⇒ 新建第二条"本轮只在纪律里处置**：§4.2 新增一条排除条件（条目已有笔记但没有标记时，先读一条确认它是不是被应用重写过的 digest，报告并停下）。改工具要做到真正的笔记级幂等，得先用**标签**做笔记身份，而"标签在应用编辑后是否留存"需要一次真库实测 ⇒ 另开一轮。

### 40.3 落点与验证

- [`tools/zotero-note.mjs`](../tools/zotero-note.mjs)：`composeNote()` 从两态变三态（`create`／`append`／`duplicate`，重复时正文原文不动），`main()` 在**打开写入门禁之前**走 `ALREADY RECORDED` 分支（干跑与 `--write` 同一答案）。头部新增一节说明为什么按可见文本比、为什么搜整条笔记（旧 digest 没有边界可依）、以及"重述"这个看不到的边界。
- [`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)：`visibleText` 上移到共享层。它原本只住在逐节笔记工具里；现在两个笔记工具都要拿"库存的"和"发出的"比，两份定义会漂移——这正是共享层当初存在的理由（该搬家单独一个重构提交，**无行为变化**，全绿）。同一文件新增**读的地址缝** `ZOTERO_LOCAL_API`（`host:port`，缺省仍是 `127.0.0.1:23119`）：写闸门有 `transport` 缝、**读没有**，于是"在开门禁之前就决定不写"这条命令行路径只可能拿真库去试。缝的取值非法时**抛错而不是回退**——测试以为在打 stub、实际打到了真库，正是这条缝唯一不能有的失效方式。
- 自测：[`tools/zotero-note-selftest.mjs`](../tools/zotero-note-selftest.mjs) 新增 `[3]`（同一段 → 无操作且正文不动 · 空白差异 · 应用重写过的笔记仍匹配 · 两条 digest 中较旧的一条仍被认出 · **重述会被追加**（把边界钉成决定而不是意外）· 空 addition 不算重复 · 无我方笔记时仍是 create）、`[4]`（该分支在 `createWriteGate` **之前**）与 `[5]`——**命令行对 stub 库**：子进程起真 CLI、父进程当 stub，带 `--write` 重跑同一段 → `exit 0` ＋ 打印 `ALREADY RECORDED` ＋ **只发生两次 GET、没有任何写请求**；换一段新文字 → 计划 append 到本方笔记；条目只有所有者的笔记 → 计划 create 而不是追加到别人的笔记。子进程必须**异步** spawn：同进程既当服务器又同步等子进程＝死锁（第一版就是这么挂住的），并给 20s 护栏。
- [`tools/zotero-local-api-selftest.mjs`](../tools/zotero-local-api-selftest.mjs)：`[11]` 钉住地址缝（缺省值 · 覆盖生效 · 非法值抛错 · 环境复原）。
- **反向控制（两次）**：把判重那一行从工具里抽掉 → `zotero-note-selftest` **FAIL (5)**（`[3]`）；把整个 `ALREADY RECORDED` 分支抽掉 → **FAIL (3)**（`[5]`：exit 变成 1，且门禁被打开、多出第三次请求）；两次装回都即 PASS。
- 文本：[`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（§7 那条 bullet 写明"重跑不添加，并且会这么说" · §4.2 新增排除条件一行）· [`protocol.md`](../protocol.md)（**Revision 13**：头部、§6 笔记条款、`INV-EVID-4`）· [`README.md`](../README.md) · [`docs/overview.md`](overview.md)（自测清单那两行）。

**未做**：`refs/` 索引行的去重（另开一轮）· 用标签做 digest 笔记身份（需真库实测"标签是否留存"，另开一轮）· 库里既有 digest 笔记的整理。

## 41. 逐节笔记的覆盖由"阅读"裁定：判据放宽到哪里、覆盖按顶层节计（契约 Revision 14，2026-10-17）

**起因**：junhan 两条追问——① "判定条件是不是太死板？我想象你先提示 agent 看已有笔记、读第一段判断它在讲什么，这样就有数了"；② "覆盖的范围应该就是第 2 节这种顶层的，而先前自动生成的笔记好像会去管子节 2.1"。两条都在**真库上量过**之后才落地，因为它们的正确答案不能靠推理。

### 41.1 实测一：旧判据在队列上漏掉 8 条（其中 5 条是方法节）

队列 34 条记录、29 条子笔记，旧判据（marker ＋ **开头**必须匹配 `^文?章?第N节`）认出的只有 5 条，判成"不声称任何一节"24 条。其中：

| 形态 | 条数 | 旧判据 |
|---|---|---|
| `1. 一段话总结 …`（整篇总结） | 16 | 正确地没认 |
| `解释文章的这一节…：II. … 第二节 …`（**每一条都在开头点名了节**） | 8 | **全漏** |

8 条里至少 5 条点名的是方法/推导节（`2R26ES5N` §1、`5U6JWFMM` §2/§3、`72SNRIM8` §3、`E6VTMNYR` §2）⇒ 在那些记录上，旧判据会再写一条重复笔记。**这 8 条全部是 app-wrapped**——即经应用创建/编辑过，与 junhan 习惯在网页版粘贴笔记同源。

⇒ 这条实测同时否掉了"把正则改宽"的路：16 条整篇总结与"2 仿真结果及分析"这种真节笔记**同形**（都是"数字＋标题"），任何一条"数字后跟文字就算"的规则都会把前者判成 §1 已覆盖。

### 41.2 裁定之一：宽探测只提示，窄判据才拒绝，裁定权交给阅读

三条（junhan 2026-10-17）：

1. **机械拒绝只收无歧义形态**：`第N节`（可粘在"文章"这类标签后）、`Section N`、`§N`、**罗马数字**标题（`II.`／`III.`，≥2 字符，以免 `I.` 被当列表项）、`Appendix A.x`；且**只读第一个段落**，并要求节号**起一个分句**（段首、`：。；！？、，`、空格或文档标签之后）——"这一节的内容与第2节相关"是交叉引用，不是声明。
2. **体检把证据摊开**：`--item <recordKey>` 现在逐条打印笔记的**第一段**与工具读到的节号（连同命中的规则与原文），结尾两行 `read here`（读得出的节）与 `judge these`（读不出的笔记 key）。**判断由阅读做出**，纪律要求先报告覆盖表再写。
3. **冲突停下报告**：工具的读法与阅读的结论不一致时，两边都报，停下等 junhan 裁定——"不要绕开拒绝"。工具**只拒绝它读到的**，绝不推翻阅读。

中途我自己犯过一次并被护栏抓住：先把 `第N节` 放宽到"第一段任意位置"，旧负例（"与第2节相关"）立刻变红 ⇒ 才补上"起一个分句"的边界。

### 41.3 实测二：全库只剩 10 条我们写的逐节笔记，其中 7 条**标记已被应用吃掉**

| 口径 | 条数 |
|---|---|
| 带 marker | 3 |
| **无 marker，但开场是本工具的模板句式**（`文章第N节标题是 …`） | **7** |
| 合计 | 10（分布在 `7X8RAWAH` §2–§7、`7YHEV68K` §2、`W7LWWYG3` §1–§3） |

⇒ §40 记的"应用会把不可见标记吃掉"**已经在真库上发生 7 次**，不是将来风险。旧判据里"锚定开头"的正则**恰好**还能认出这 7 条（`文章第N节` 就在开头），所以真正的漏网是 §41.1 那 8 条；但这条实测把"身份不能只看 marker"从推理变成了事实。同一实测发现：**带小数点键的逐节笔记全库 0 条**，而 §39.4 那批（`7ZGICNQY` §2/3/3.1/3.2 等 24 条）**现在不在库里**——`7ZGICNQY` 子笔记 0 条、回收站从 §39.2 的 114 涨到 **197**；按 §39.2 的实测（API 删除永久且不进回收站），这些笔记是在应用/网页版里被人删掉的（可恢复）。

### 41.4 裁定之二：覆盖按**顶层节**计，拆分只是写法

你问的"这个约束做好了没"——**没做好**：`runCreate` 当时是**字符串相等**比较，`§3` 与 `§3.1` 互不相干，先写 §3 再写 §3.1（或反过来）都不会被拒 ⇒ 同一节可被覆盖两次。工具里根本没有父子概念。

junhan 选的落法（**父子归并**）：`parentSectionToken('3.1') === '3'`；拒绝三种——该节本身被点名 · 请求的是**子节**而父节已被整节覆盖 · 请求的是**顶层节**而它已被**分条**覆盖；**兄弟子节不算覆盖**（写了 3.2 仍然可以写 3.1，缺的那部分正是下一步该写的）。plan 里报成 `§3 (in parts: §3.1 · §3.2)`，纪律与契约同步写明"选节在顶层做，超预算才拆，拆了就不写父"。

### 41.5 落点与验证

- [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)：`firstBlockText`／`romanToNumber`／`readSectionFromParagraph`（窄形态＋分句边界）／`parentSectionToken`／`coveringNote`（三种拒绝，纯函数）／`runPlan`（第一段＋`read here`／`judge these`）／`runCreate`（拒绝打印命中的规则、原文与理由）。被我中途加又删掉的：`sectionHints` 那套"提示"——junhan 的简化（读第一段即可）让它变多余。
- 自测：[`tools/zotero-section-note-selftest.mjs`](../tools/zotero-section-note-selftest.mjs) 新增 `[2b]`（owner 库里真实使用的形态，含罗马数字与附录；以及**不得**被当成声明的"1. 一段话总结"与"N＋标题"）、`[2c]`（分句边界正反例）、`[2d]`（顶层计：整节盖子节 · 分条盖整节 · **兄弟不算覆盖** · 缺的那条仍可写）。
- **反向控制**：让父子归并失效（提前 `return undefined`，等于退回字符串相等）⇒ `[2d]` 立刻变红；装回即 PASS。
- **真库只读实证**：`--item 7X8RAWAH`——六条笔记的 marker **全被应用吃掉**，工具仍从第一段读出 §2–§7、`judge these: none`；干跑 `--section 3` 得到 `REFUSED: §3 is already covered - note JPNPC6VL claims §3 / read it as: §3 (第N节: "文章第3节")`，**exit 1 且未发任何写请求**。
- 文本：[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（§2 读体检并先报覆盖表 · §3.3 顶层是单位 · §4.2 三行新排除条件 · §6 新增 `## Coverage` · §7 判据归阅读 · §8 清单）· [`protocol.md`](../protocol.md)（**Revision 14**：头部、§4 sections 行、§6 笔记条款）· [`README.md`](../README.md) · [`docs/overview.md`](overview.md)（补上此前漏列的逐节笔记自测行）。

**未做**：逐节笔记的 **CLI 级 stub 端到端测试**（digest 那条链有，这条还没有；逻辑已由纯函数自测覆盖）· `--tidy` 的判据随本次放宽而变宽（它复用同一个 claim 阅读：只碰"识别为逐节笔记"的笔记，识别范围现在包含"第一段点名了节"的手写笔记）· 回收站里那批笔记由 junhan 自行处置。

## 42. 取消"超预算按子节分条"：一条顶层节一条笔记，预算降为质量信号（2026-10-17）

**起因**：junhan 在回顾本轮原则时提出——"覆盖的范围就是第 2 节这种顶层的；超预算就分子章节，我感觉没必要，毕竟章节都是要读完的，而且都是参考文献，一个顶层章节就那么长"。**这是他推翻自己 2026-10-16 的 §39.4**（那次定的是"超过 5000 字符预算按论文自己的子节号分条"），所以先把两项前提摆清再落地。

### 42.1 先验的两条前提

1. **拆分只是"写法"，从来不是覆盖语义**——而 §41 刚把覆盖单位定成顶层节之后，子节键的代价显形了：它写下来还要被**折回父节**才谈得上覆盖，等于凭空多一层记账。唯一实测案例（`7ZGICNQY` §3 的 10.4k 字符方法正文拆成 §3.1/§3.2）**没有覆盖任何长笔记覆盖不到的东西**。
2. **取消不需要迁移**：实测**全库 0 条子节键**（那批 `7ZGICNQY` §3.1/§3.2 在回收站里，见 §41.3）。但**工具里的父子归并必须留着**：那批笔记随时可能被恢复，恢复后"§3 已被分条覆盖"必须仍被认出，否则会出现 §3 与 §3.1/§3.2 并存的重复。

### 42.2 裁定

- **一条顶层节一条笔记，长度随该节的方法内容**，不再拆。
- **预算从"硬区间"降为"质量信号"**：1,500–5,000 字符仍是常见范围，明显偏长通常是案例内容漏进方法节、明显偏短通常是没读——**在报告里说明是哪种，但不得为了落进区间而拆节**。这条保留了原先那个有价值的提前报警（它抓住过案例内容漏入），只去掉它的强制力。
- **契约不再升版**：Revision 14 说的"分条即已覆盖、兄弟子节不算覆盖"对**历史/恢复**的笔记仍然成立，变的只是"我们不再制造这种笔记"——那是纪律正文的职责，不是契约保证。

### 42.3 落点

- [`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)：§3.2 预算改写为"长度是信号不是上限" · §3.3 改写成"一节一条，无论多长；子节键**存在则认、绝不创建**" · §4.2 两行（子节键=legacy 形态；偏长只砍案例内容、绝不拆）· §8 清单两行 · §9 Don't 新增"不要拆长节" · front-matter description 同步。
- [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)：**行为不变**（`parentSectionToken`／`coveringNote` 原样保留），只改三处注释的理由——原先它们用"超预算会拆"来解释父子逻辑，那条规则已经不存在了，现在写的是真实理由：库里可能已有这类笔记（含从回收站恢复的），而"这是哪一节"问的是**论文**，不是我们选择怎么写。
- 自测与工具行为零变化（`zotero-section-note-selftest` `[2d]` 全绿），全套离线自测 0 失败。

## 43. 补上"整体图景"：一份以**部分**为单位的覆盖地图，它的名册由仪器校（2026-10-17）

**起因**：junhan 提出——功能加了很多，但"各个部分大致覆盖什么样的、整体的一个图景"没有文档；他此前只能临时让 agent 总结一遍"读 Zotero 参考文献的步骤"，才大致知道是咋样。他的判断是"是不是该有些这方面的文档"。

### 43.1 先验的三条（都是这一轮摸出来的，决定了它该长什么样）

1. **缺口不是"忘了写"，是这份文档的读者从未被定义过。** 现有四份各答一个问题：README 的 "What you get"（段落级、英文、面向安装的人）· [`protocol.md`](../protocol.md) §4（规范上一行一条纪律，而且 DOC-1 **禁止它出现任何符号名**）· [`surface.md`](../surface.md)（概念 ↔ 名字的索引，不问覆盖）· [`docs/overview.md`](overview.md)（**一行一个"步骤"**，不是一行一个"部分"）。"谁负责"有了、"保证什么"有了、"为什么"有了，**"每个部分覆盖什么 / 拒绝什么 / 触发条件 / 产物落在哪"没有**。
2. **每部分的细节此前只有一种成文形式：九份 `skills/*/SKILL.md`**（英文、面向模型的激活、合计约 1,100 行）。所以所有者要理解整体，除了问 agent 没有第二条路——这正是这次发生的事。抽查证实：读 PDF 那一侧的事实（附件按 `PDF → EPUB → HTML` 挑、**本预设不做 OCR**、读阶梯、单次结果超 8,192 字符在压缩后只剩头尾（裁剪时点已更正，见 §63）、覆盖靠读笔记第一段裁定）在中文读者文档里几乎一处也没有。
3. **但"再手写一份名单"会撞上仓库自己立的规矩**：[`overview.md`](overview.md) 头部写着"本文不重复符号清单——两处列同一批名字必然漂移"，DOC-6 甚至禁止 README 正文重复符号，而 [`releases.md`](releases.md) §36 那一轮刚抓到两处陈旧计数（`package.json` 写 "eight" 实际 9 条纪律；README 写 "Eight helper programs" 可它自己枚举 7 个）。⇒ **病因不是名单多，是没有一份名单有仪器校。**

**派生能力的边界（一条关键实测）**：九份 SKILL.md 第 8 行都是同一句式 "This skill does exactly one thing: …"，但**否定句写法不统一**——七份是 `It does not…`，`metadata-query` 与 `section-notes` 是 `It is not…`。所以可派生的**只有名册**，中文描述只能人写。护栏的边界因此被定死为：**名册与路径机器校，描述由阅读负责**——与"窄机械护栏 + 阅读裁定"那条规则设计偏好同构。

### 43.2 裁定（junhan 三项逐项定，均取推荐项）

1. **新增 [`docs/coverage.md`](coverage.md)**：中文「覆盖与边界地图」＋ 一篇"指定一篇文献之后发生什么"的流程叙事。覆盖层级＝**纪律 + 两条外部通道 + 工具入口**。
2. **新鲜度护栏扩展进 [`tools/doc-selftest.mjs`](../tools/doc-selftest.mjs)**，不另起文件（另起必然把 `documentedPathExists`／名册派生那套复制一份，正是仓库反对的漂移源）。
3. **与 `00_overview` 那句话的冲突**：**保留原话**，改在地图头部声明它是"被机械校验的第二份名单"。两份名单各答一个问题——`surface.md` 由 DOC-5 校"概念↔名字"，地图由 DOC-9 校"部分↔skills/"，**都漂不了**；"必然漂移"说的是无人校的名单。

### 43.3 落点与验证

- 新增 [`docs/coverage.md`](coverage.md)：常驻纪律一行（**不复述 §3 的条款**，只指过去，因为那正是会漂的那种复述）· 按需纪律表（覆盖什么／明确不做／何时加载／权威文本）· 两条通道与写侧工具入口（**一律不写计数**——上一轮的两处陈旧计数就是前车之鉴）· 流程叙事七步（先查 refs 索引 → 体检 → 建节表 → 判覆盖 → 只写没覆盖的方法节 → 干跑/授权/`--write`/回读 → digest 与读状态标签）· 最后一节写明它**不管**什么。
- [`tools/doc-selftest.mjs`](../tools/doc-selftest.mjs)：`disciplineNames()` 从 `authoritativeSymbols()` 里析出（**无行为变化**的纯重构，DOC-5 语义不变）· **DOC-9** 名册一一对应（漏一条／多一条都失败）· **DOC-10** 地图必须自称非规范并指向契约 · **DOC-8** 把地图纳入路径检查 · 新增三条反向控制。
- 同步：README（Layout 的 `docs/` 行 · Develop it 里 `doc-selftest` 的注释）· [`docs/overview.md`](overview.md)（"看哪里"表新增一行）· [`preset-release`](../.agents/skills/preset-release/SKILL.md) 第 2 步的读者文件清单，并写明**地图只有名册与路径被机器校**。

**验证**：`doc-selftest --negative-controls` —— 10 条检查 PASS，9 条反向控制**全部咬住**。但在把它做绿之前，护栏抓到了我自己两个错，都记在这里：

1. **地图里的 `../protocol.md` 被判成 stale**。查实的不是地图写错，而是 DOC-8 的缺口：它用 `documentedPathExists` 从**仓库根**解析，却把 `..` 当普通目录名，于是判不了任何父级相对路径——而地图是**第一个被纳入该检查的 `docs/` 文件**，此前 `docs/` 从未进过 DOC-8 的范围。修法：`..` 开头的 token 直接跳过，并写明理由（它是**链接标签**，不是关于仓库布局的断言）。
2. **我给新反例写的"改名"只改了大小写**（`zotero-READ.mjs`），反例因此**什么也没校**——Windows 的 `existsSync` 大小写不敏感。已改成实质改名，并把这条仪器局限写进注释（大小写改名只在 Linux 上看得见）。

### 43.4 未做与边界

- 护栏只校**名册与路径**，不校中文描述是否仍然准确——那份职责在发布前的"重扫相反主张"里，已写进 `preset-release` 第 2 步。
- 地图**不覆盖**脚手架、工具隔离、诊断与发布（README 已经管了），只留指针：同一件事写成两份，就是 [`releases.md`](releases.md) §36 那两处陈旧计数的来路。
- 未在本轮处理的旧账不变：§42 之后的"逐节笔记 CLI 级 stub 端到端测试"仍缺。

## 44. 借鉴裁定成为第十条纪律：读者是没读过论文的实现者，而"数值锚点"是链上唯一能失败的检查（契约 Revision 15，2026-10-17）

**起因**：junhan 提的新功能——"我在和 agent 读一篇参考文献，读完之后，应该能裁定这份参考文献能够借鉴哪些部分，然后形成一份文档，日后实现代码的时候也有公式参照"。他同时问"这个功能还有什么可以完善的地方"，并要求先把方案说清再动手。

### 44.1 先验：缺口在哪，以及为什么现成四份产物都替代不了它

链条原本是：检索并定级 → 逐节解释 → 挑战 → 方向级综合 → 跑 → 沉淀。**"解释完了"与"写进代码"之间没有人**，而且这不是遗漏：`section-notes` 的契约明写"只解释、不评价、用论文自己的记号"，它**故意**让出了这一步。

| 现有产物 | 管什么 | 为什么替代不了 |
|---|---|---|
| 逐节笔记 | 论文侧逐节解释，用论文的记号，不评价 | 不映射到我们、不指定模块、没有任何数值检验 |
| 文献重建笔记 | 主题级、非规范、按证据分级 | 管"它说了什么"，不管"我们拿不拿" |
| 综合 | 方向级选择（走哪条路） | 不是公式级裁定，也不对应单篇论文 |
| 实验卡 | 已经跑过/待跑的一次运行 | 到那一步公式早该定下来 |

### 44.2 五条设计裁定（junhan 逐项确认，均取推荐项）

1. **载体＝新增第 10 条按需纪律**。否掉并进逐节笔记（会破坏那份契约"只解释不评价"的核心），否掉并进综合（那是方向级，不是公式级）。
2. **粒度＝每篇参考一份**（按 itemKey 落盘、可幂等重跑）**＋ 一张薄的"模块 → 项"索引**；两个视图，一个真源。
3. **数值锚点＝强制**；没有锚点只能停在 `candidate`。
4. **裁定流程＝候选表先出、逐项确认、3–5 项一批**——常驻规则 6 的具体化，不是新规矩。
5. **落点＝新建 `research/adoption/`**。否掉 `literature/adoption/`：会让该目录同时装"论文说的"和"我们要用的"，权威层级糊掉。

**代价（记录在案）**：常驻路由 +1 行，persona 从 **4,571** 字符涨到 **4,726**（约 **+43 token/请求**）。§2 记过"加到十条以上就要把每条纪律的细节彻底下沉"——**现在是第 10 条，这条线已到边**：再往下加第 11 条之前，应先做那次下沉（persona 只留一句话 + 指针），而不是继续加行。

### 44.3 我在方案里补的、他未逐条指定的几点（标注为我的判断）

1. **`reference-only` 这个 verdict**：只读、只对照、不进代码的东西不该被硬塞进 `adopt`，也不该压进 `reject` 而丢掉理由。词表因此收成封闭五项。
2. **可借鉴项共七类，公式只是第一类**：公式/推导步 · 假设 · 数据集与测试系统 · 带出处的超参 · 评测协议与指标定义 · 复杂度/规模结论 · 论文自陈的局限。配套一条反向信号：**全是 `adopt` 的文档等于没裁定**。
3. **反向审计**：同一份文档两头用——写代码前问"要借什么"，出问题时问"这篇到底支不支持我们这么写、它当时假设了什么"。零成本复用，不加任何新东西。
4. **双栏转写 + `ambiguous` 停手**：原文式照抄、我们的归一化式分栏，永不合并；副本歧义（扫描件、定界符丢失、缺公式号且上下文不能定位）记 `ambiguous` 阻塞，**不重建**——与 `--tidy` 拒绝猜公式同源。
5. **不重读**（`INV-ADOPT-2`）：某条式子没被任何节笔记覆盖时只有两条路——先补那一节笔记，或记 gap 留 `candidate`；**不许在这里重推原文公式**，否则一条式子会有两个转写作者，日后没人能说清代码照的是哪版。

### 44.4 为什么"数值锚点"是这条纪律的承重墙

**抄对一个公式与实现错一个公式，在散文里同形**——两者都会写出同样的 LaTeX、同样的符号说明、同样的"此式用于无功灵敏度"。链上前面的每个环节（分级、解释、挑战、承诺）都只能验证"我们读到的"；只有"输入 → 输出"能验证"代码实现的与我们裁定的**是同一个东西**"。三条随之而来：

- 没有可算实例的项停在 `candidate`（`INV-ADOPT-1`）——不能"原则上可采用"；
- **由单位或定义推出来的数不算锚点**（常驻规则 10：构造不是测量）；
- 锚点必须带出处，`论文自报（附定位）` 与 `reader-computed` 分开标（沿用逐节笔记 §5 对常数的规矩）。

### 44.5 落点与验证

- 新增 [`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md)：沿用九节骨架（触发 · 读 ruler · 判据（单位/词表/六字段/锚点/双栏/拒用/生命周期/形状）· do-don't 含 12 条就地排除条件 · 措辞 · 报告形状 · 仪器 · 清单 · don't）。
- [`cordis.patch.yml`](../cordis.patch.yml)：路由第 10 行（接在逐节笔记之后——它**吃**节笔记）＋ 头部注释与 preset description 的循环叙事。
- [`surface.md`](../surface.md) ＋ [`docs/coverage.md`](coverage.md) 各 +1 行（DOC-5／DOC-9 的机械要求，漏了自测会红）。
- 新增 [`project-template/research/adoption/README.md`](../project-template/research/adoption/README.md)（含一条填好的示例项）＋ [`project-template/README.md`](../project-template/README.md) 的 Layout 两行。
- [`protocol.md`](../protocol.md) **Revision 15**：§4 一行 · §7 布局与权威层级（**既不支撑结论、又约束代码**，两边各占一半）· §8 新增 `INV-ADOPT-1..4` · §9 拒绝"读过了就算可采用"。
- [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs) 与 [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs) 的计数 9→10。**注意**：`preset-selftest` 读的是**组合后的树**，必须先 `dsh --profile web --dump-config > .tmp\composed-web.txt` 重生成，否则它核对的是上一轮的现实（这次正是先红了 4 项才发现的）。
- **语言分工**：纪律正文英文（与另九份同语言，`skills-selftest` 只读 front matter，语言不影响功能）；中文读者层在 `coverage.md` 与新的一节里。
- **验证**：`skills-selftest` PASS（`registered=10`）· `preset-selftest` PASS（`ten skill-routing bullets`，含新名）· `doc-selftest` PASS（含 10 条反向控制）· `isolation` / `client` / `contact-bridge` 自测 PASS · `new-project.ps1 -DryRun` 显示会创建 `research\adoption\README.md`。
- **零新增工具**：读侧复用 `zotero-section-note.mjs --item <recordKey>`（计划态，不写库）与 `zotero-read.mjs --item <noteKey>`；不新造 helper，也就不新增工具自测。

### 44.6 未做与边界

- **这条纪律还没在任何真实文献上跑过一遍。** 本轮落地的是纪律文本、契约与脚手架；端到端（拿一篇真论文 → 产出第一份 ledger → 由 junhan 逐项裁定 → 真写一次代码并用锚点断言）留给下一轮。在此之前，它的判据只是**写下来的**，不是**试过的**——这正是它下一步最该被验的地方。
- `INDEX.md` 与代码侧的联动（代码注释或测试引用 `A-<key>-NN`）没有仪器校，这轮只把格式与时机写进纪律。
- 没有"论文被撤／更正"的自动探测：重开条件由人写、由人触发。

## 45. 脚手架向一个成熟课题的文档架构借了六件机制、拒了它的六层骨架（契约 Revision 16，2026-10-17）

### 45.1 起因

junhan 要求把本预设推荐的文档组织，与一个**已经成熟的课题**逐项对照：
`doc/<课题B>/`——六层（`specs` / `records` / `design` /
`prospects` / `audit` / `references`）、根 README 一份 21 条规则的总表、195 份 `.md`、已经历过三代结构重组。
问题是"哪种方式更好，以及保持通用性的前提下有什么可改"。

### 45.2 先验（核对过的事实，不是推测）

- **两边不是同一种东西**：这边是**通用默认**（11 个文件、8 个目录、0 份文档），那边是**成熟实例**。所以下面
  的取舍都按"借机制、不借骨架"来做，而不是整体换布局。
- **脚手架的布局声明有三份，而没有任何自测读过 `project-template/`。** 实测：`tools/` 里除 `new-project.ps1`
  之外，无一处引用它。这与 §43 自己立的规矩相抵——"病因不是名单多，是没有一份名单有仪器校"。
- **那边的可维护性代价有它自己的实测数字**：活动区 125 份里 **84 份**脚本判不出属于哪一层（Q2）、索引与
  计数漂移 **≥ 9 处**（Q3）、2 份文档没有落点依据（Q1）。⇒ 它换来的是承载复杂度的能力，代价是层界与索引
  靠散文维持；这也正是"不搬它的六层"的证据，而不是审美。
- **同一个"列出目录"的动作，那边有三种写法**（契约用缩进树、README 用带文件名的树、权威表用 glob）。
  护栏必须做归一化——这一点在护栏第一版上直接表现为 **2 处假阳性**（见 §45.5）。
- **P3 的初稿措辞与本仓库既有裁定冲突**：§11 记"给工作区上 git | **不上**"、`archive/plan-v0.md:354` 记
  "**有意不做**：不含 git 初始化"、`AGENTS.md.template` 与契约 §9 都声明不对版本控制表态。⇒ 初稿那句
  "必须挺过 fresh clone"是**替课题假定版本控制**，已改写为不含 VCS 语义的可得性说法（"对这份记录的读者
  可得"，跑在外面的留一份副本在身边，取不到的就在记录上写成缺陷）。
- **P1 不需要契约升版**：契约 §7 的权威段**本来就是按问题类型写的**（"域约束 > scoping > 非规范笔记"这条
  唯一真实的排序，其余是"是记录、不支撑主张"）。是**模板**把它拍平成 8 行排序。⇒ P1 消除的是模板与自家
  契约的分歧，不是新增契约文本。
- **P2/P3/P4 必须升版**：契约 §1 把 Card 定义成含 `prediction`、§4 写 "run — a hypothesis becomes a card"。
  预测一旦独立成文件，**契约与脚手架就自相矛盾**——这比"布局块变了"更硬。
- **常驻成本为零。** 路由那一行写的是**触发条件**（"代码即将跑以检验假设，或一次运行的结果正在被报告"），
  不是产物形状，所以这次拆分**不加任何常驻 token**，§2 记的"十条线已到边"不必动。

### 45.3 决策（逐项由 junhan 确认；P6 未取）

| # | 决策 | 落点 |
|---|---|---|
| **P1** | 模板 §3 由 1–8 线性排序改为**按问题类型分配**，并补上 `adoption/` 那一行 | `project-template/AGENTS.md.template` |
| **P2** | 预注册独立成 `research/experiments/protocols/<id>.md`；协议、卡、产物脚本**共用一个 id**；卡引用协议而不重抄预测；跑在规则之前的运行**登记缺口**、不回填 | 脚手架 + 纪律正文 + 契约 §1/§4/§7 |
| **P3** | 卡引用的产物必须**对这份记录的读者可得**；跑在外面的在 `research/experiments/evidence/` 留副本 | 脚手架 + 纪律就地排除条件 + 契约 `INV-EVID-5` |
| **P4** | 退休＝**移动 + 一份 README 说明**（从哪来、为什么、谁接替）；正文不更正、活指针照改、dated 记录不改 | `project-template/research/archive/` |
| **P5** | 反复出现的坑**升格为带编号的规则**，带生效日期与**首例**，只约束今后、不追溯改写旧记录 | `pitfalls/README.md` + `AGENTS.md.template` §2.1 |
| **P6** | **本轮不取**：mnemon Documents 与"课题自带规范层"的边界。那边自己的文档地图实测同一批阴性证据出现在 **5 处**（含两份 mnemon），所以重复是真的；但它需要单独一轮，**记为 open item，不是否决** | — |
| **P7** | 新增 `tools/scaffold-selftest.mjs`：把契约 §7、本仓 README、课题继承的权威表**三份名单**互相校 | `tools/` + README + `overview.md` |
| **P8** | 新课题的根 README 取**课题口吻**（不再自称模板、不再教人建课题），且**不携带目录图**——因为名单只有一份，就是 `AGENTS.md` §3 | `project-template/README.md` + 本仓 README 承接脚手架自述 |

### 45.4 落点与验证（六个提交，每个都能跑绿）

| 提交 | 内容 | 验证 |
|---|---|---|
| `5fd8659` | 脚手架六改（P1–P5、P8） | `doc-selftest --negative-controls` PASS · `skills-selftest` PASS |
| `61b501c` | 契约 **Revision 16**（§1 · §4 · §7 · §8 `INV-EVID-5`） | `doc-selftest --negative-controls` PASS；§7 的树**故意只用裸目录名**，因为 DOC-8 会断言"带扩展名的反引号路径必须存在"——从契约里点名课题文件，就等于让契约替每个课题断言其内容 |
| `2153fa8` | 护栏 P7 + 三处落点 | `scaffold-selftest --negative-controls` **6/6 + 5 条反向控制全部咬住**；`release-check-selftest` 的"每个自测都在 README 里有名字"PASS |
| `b544733` | 纪律正文（P2/P3 的技能侧） | `skills-selftest` PASS · `doc-selftest` PASS |
| 本轮 | 决策 §45 + 覆盖地图 §二"运行"那一行 | `doc-selftest --negative-controls` PASS |
| 本轮 | 两处陈旧计数（见 §45.6） | `preset-selftest`（读组合树，须重新 dump） |

**护栏的判决（这是这一轮唯一一条不是"写下来的"证据）：**

```text
对今天这棵树：  4/6   FAIL S1/S2  research/adoption/: not named in AGENTS.md.template §3
对提议后的树：  6/6
```

也就是说：`research/adoption/` 在 `d07e09d` 里进了契约 §7、进了布局 README，**唯独没进课题继承的那张权威
表**——脚手架的布局声明在**一个提交周期之内**就自相矛盾了。这条缺陷不是推演的，是护栏第一次跑就抓到的。

### 45.5 过程中被护栏与约束抓到的四件事

1. **护栏第一版报了 3 处失败，其中 2 处是它自己的假阳性**：布局 README 写的是 `pitfalls/README.md` 与
   `rulings/ruling_<target>_<date>.md`，被读成了目录名；嵌套的 `experiments/protocols/` 又被拍平成了
   `literature/` 的兄弟。修法是**把判据改窄**（要求 token 是路径形、按缩进建路径），不是放松检查。
   并补一条 **S0：某份名单解析为空即失败**——三份空集合互相"一致"，正是"不会失败的检查"的另一种形态。
   ⇒ 这条与 junhan 2026-10-17 的偏好一致：机械部分只做窄到可信的护栏，宽判据会乱咬，咬了就会被关掉。
2. **反向控制是必需的，不是装饰**：五条控制各改一份输入，每条必须打破它对应那一项；哪条没咬住，整轮报红。
   仓库的发布纪律早就写了这条（"一条不会失败的检查不算检查"），这次是第一次把它用在脚手架上。
3. **我自己的 PowerShell 正则改写把 `sim-build.mjs` 弄坏了**（`join(draft, 'proposed'), ...` 括号错位）。
   教训仍然成立：**别对代码做正则手术**，重写整个文件比修它便宜，也不会留下一个看着像对的中间态。
4. **OneDrive 云同步让"已读过"的文件 mtime 变化**，版本守卫两次拒绝编辑（`skills/experiment-protocol/SKILL.md`、
   `docs/coverage.md`）。README 的"已知约束"里本来就写着这一条——这次是它第一次咬到自己仓库的编辑。

### 45.6 未做与边界

- **没有任何真实课题跑过这套新脚手架。** 判定它好坏的证据目前只有"三份名单一致"与"读起来更清楚"，与
  §44.6 同样诚实：判据是写下来的，不是试过的。最便宜的端到端试验是：开一个临时课题 → 写一份协议 →
  跑一次 → 镜像一个产物 → 退休一份文档，然后看这四条规则**花的力气是否大于省下的**。
- **P6 仍开着**（mnemon Documents 与课题自带规范层的边界），理由与证据见 §45.3 那一行。
- **顺手发现的两处陈旧计数已单独修掉**（`.agents/skills/preset-release/SKILL.md` 说"eight routing names"
  实为 10；`project-template/.agents/skills/domain-discipline/SKILL.md` 说"four skills"实为 10）——它们是
  [`releases.md`](releases.md) §36"不写散文计数"那条规矩的同族缺陷，不属于本轮关注点，所以单独一个提交，便于单独回滚。

### 45.7 取代关系（发布自检时补记）

- **本节取代 §8 记的卡字段表**（2026-10-13 那次把预测列在卡里）。§8 是当时的决策记录，原样保留；今天
  卡片与协议的权威定义在契约 §1、§4 与纪律 §3.1，而字段本身分成两份文件。
- [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4 的发布自检清单
  **漏了两个自测**（`zotero-section-note-selftest.mjs` 是 §41 那轮加的、`scaffold-selftest.mjs` 是本轮加的）。
  README 的那份清单有仪器校（`release-check-selftest` 的 [4] 段），这份没有 ⇒ 这是同一类漂移的第二个实例，
  处置记在本轮的发布条目里。

## 47. 内核 0.2.1 移除了 `cwd` 提示词变量，预设的 persona 后缀随之删除（2026-10-18）

### 47.1 起因与现象

junhan 升级 DSH 内核（`0.2.0-rc.2` → `0.2.1-rc.2`）后运行本预设，**每一轮**都以同一句话失败，而预设本身
仍在新建会话名单上，设置页也不报 broken：

> 本轮运行失败 unknown prompt variable "{{cwd}}" in section "deployment:persona-suffix";
> registered variables: provider, model

### 47.2 先验（核对过的事实，不是推断）

- **旧内核注册三个变量**：下载 `@deepseek-ai/dsh-agent-loop@0.2.0-rc.2` 实测，`lib/index.js:1564-1566`
  依次注册 `provider`、`model`、`cwd`。
- **新内核只剩两个**：已装的 `0.2.1-rc.2` 同文件 `1591-1592` 只有 `provider`、`model`，`cwd` 那行不存在。
- **严格插值 ⇒ 每轮在请求之前就死**：`@deepseek-ai/dsh-system-prompt` 的 `interpolate()` 对未注册名字直接
  `throw`（`lib/index.js:172-174`），而装配发生在请求之前。**这一层必须说清**：注册表试挂载只挂行、不装配
  提示词，所以设置页没有红徽章、名单也不会过滤它——它与 §15/§19 那类"预设被标 broken 后静默隐藏"是**两种
  不同的故障**，只有真实会话的第一次装配能暴露。
- **cwd 没丢，改道成了运行时上下文**：新增包 `@deepseek-ai/dsh-working-directory`（npm 首发版本即
  `0.2.1-alpha.2`）注册**必需**上下文 `working-directory:current`，文本为
  `Current working directory: "<path>".`（`lib/index.js:41-47,121-123`），由 `dsh-base` 全局挂载
  （`cordis.patch.yml:166-167`）；每次装配刷新，`cd` 之后还以用户消息追加"目录已改变"。作用域装配会先并入
  **全局层**（`dsh-scope` 的 `merge()` 从 `global` 起算，`lib/index.js:177-179`）⇒ 预设自己**不需要**挂这
  一行也能拿到，而且比旧变量更准：旧变量读的是 `session.header.cwd`（初始目录，`cd` 之后不更新）。注意
  **上下文与工具是两件事**：本预设的隔离行把 agent 可见的 `working_directory` 工具屏蔽掉了
  （`isolation-report.json` 的 denied 里就有它），但每轮的上下文来自服务侧的注册，屏蔽工具动不了它。
- **上游同版做了同样的清理**：官方 `standard.patch.yml` 在 `0.2.0-rc.2` 里正是
  `suffix: Your working directory is {{cwd}}.` + `{{model}}` 前缀，在 `0.2.1-rc.2` 里 suffix 整行已删。
  **本预设当初就是照抄官方 standard 的写法**——这正是"内核升级要重扫"的判据，而不是我们独有的缺陷。

### 47.3 决策与落点

**决策（junhan 逐项确认，取推荐项）**：**删掉 suffix 那一行**，不做变量自补——工作目录已由必需运行时上下文
每轮给出，自补只是把一条被内核废弃的契约请回预设。

**否掉的替代方案**：

- **在预设内自补 `ctx.systemPrompt.variable('cwd', …)`**（可行：`workingDirectory` 是全局服务，子作用域可
  注入；变量 provider 同步求值、`get()` 无 I/O；作用域变量遮蔽而非冲突于未来的全局同名变量）。否掉的理由是
  它只为我们自己的一行文本服务，却多维护一条内核契约——**但 `vibe-math-*` 那类拿 cwd 拼绝对路径的预设仍需
  走这条路或改写措辞（见 47.5）**。
- **保留句子、去掉变量**：与运行时上下文重复陈述，零收益。

**落点**：[`cordis.patch.yml`](../cordis.patch.yml)（suffix 删除；头部注释与 persona 行就地写明理由，使下
一个读到这一行的人不会把它加回来）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（新增两条
检查）· 本文件 §23 的现象段就地标注更正（**不改写历史决策**，沿用 [`releases.md`](releases.md) §46.3 的规矩）。

### 47.4 护栏与验证

`preset-selftest` 的第 [4] 段原来**守着这个 bug**：它断言 `{{cwd}}` 占位符必须存在。现在改为三条：

1. **点名旧错误**：`{{cwd}}` 不得出现在预设块里——"命名替代品而不命名错误，就是在请错误回来"。
2. **守住整类错误**：组合后预设块里出现的每个 `{{name}}`，与**内核注册表**逐一比对。注册表不是硬编码名单，
   而是从 profile 解析到的 `@deepseek-ai/dsh-agent-loop` 里读出的 `systemPrompt.variable(...)` 字符串实参
   （并合并本包自己的行，使预设日后自注册变量不会被误报）；**读不到内核时响亮 FAIL**，不静默通过。
3. **变异驱动**（§3 的规矩）：把 `{{cwd}}` 与一个从未注册的名字分别注进 dump，新检查必须各自 FAIL，然后
   还原。

### 47.5 未做与边界

- **没有回改 `docs/archive/plan-v0.md`**：那是归档时间线，`{{cwd}}` 在那里是当时的记录。
- `$DSH_HOME/.agent-presets/vibe-math-v1..v4` **不在**内核读取范围内（**已更正，2026-10-18 见 §49**）：它们位于内核**已不再读取**的旧预设目录，因此**不会运行、也不会"整轮失败"**——真正的问题是它们已经**不是可用预设**了。若将来要恢复它们，必须按 DSH 自带的 `editing-cordis-compositions` skill 的"Migrate a legacy preset"路径改成声明行，**到那一步**才需要处理正文里的 `{{cwd}}`（每文件 2 处，其中三处拿它拼 `<cwd>/VibeMath/Projects/<project>/` 绝对路径）。
- 本轮**不是发布**：没有 bump 版本、没有 tag——只做修复、护栏与记录。

## 49. 更正：旧预设目录里的 `{{cwd}}` 不会"整轮失败"，因为没人读那个目录（2026-10-18）

### 49.1 怎么发现的

0.3.1 发出后收尾复核状态时，顺手验了 `editing-cordis-compositions`（DSH 自带 skill）里的一句断言："*Nothing reads that directory any more*"——指 `$DSH_HOME/.agent-presets/<id>/` 那套声明行之前的旧预设目录。若它为真，§47.5 与 [`releases.md`](releases.md) §48.7 的推论（"这四个个人预设会以完全相同的方式整轮失败"）就不成立。

### 49.2 实测（两条，都只用现成仪器）

- **组合树**：`dsh --profile web --dump-config` 里只有 **5** 条预设声明行 —— `preset-standard`、`preset-ptc`、`preset-minimal`、`preset-cordis`、`preset-autoresearch`；`vibe` 字样出现 **0** 次。新会话名单由声明行产生 ⇒ 那四条**不可选**。
- **谁还在读那个目录**：已装插件里只有 `dsh-config-manager` 的 `adapters/agent-presets.js`（自述"数据源 = `~/.dsh/.agent-presets/`"，用途是配置分区导出/导入）；其余四处命中（`dsh-better-sidebar`、`dsh-opencode-palette`、`dsh-pet`、`dshmarket`）全是**注释**——设置页的 section id、sidebar 对 preset 解析的镜像、market 对 PresetTree 的引用。⇒ **没有任何东西把那个目录注册成可运行的预设。**

结论：四条 vibe-math **不会运行**，因此不存在"每轮失败"；它们只是磁盘上的历史文件。

### 49.3 更正了什么，以及那条错误是怎么产生的

§47.5 与 [`releases.md`](releases.md) §48.7 已就地标注更正并指到本节。错误的形状值得留档：我从"**文件里有 `{{cwd}}`**"直接推到"**会以完全相同的方式整轮失败**"，中间那一步"它到底会不会被加载"**从未量过**——而量它的成本只有一条 `--dump-config`。这是 §5 那条"三种 nothing"的**镜像**：那时防的是把"没搜到"当成"不存在"，这次犯的是把"文件存在"当成"会生效"。**存在性与生效性是两件事**，前者不能当后者的证据。

### 49.4 边界

- 本轮不动那四条。要恢复它们，迁移路径在 `editing-cordis-compositions`（写成 bundle 声明行 → 挂载 → 校验行 → 删旧目录），**届时**正文里的 `{{cwd}}` 必须处理：每文件 2 处，其中三处把它拼进 `<cwd>/VibeMath/Projects/<project>/` 绝对路径。
- 本节只更正声明，不改任何代码；`release-check --tag v0.3.1` 在此之后仍应 PASS（工具对"main 越过 tag"只打 NOTE，自己写明 *"Not a failure: main is allowed to move on after a release."*）。

## 50. 复核三条文献会话的收尾现场：删除边界的更正、回收站端点的假absence、两条读法前提的实测（2026-10-18）

### 50.1 背景

三条课题会话（课题A、课题B、课题C——标题略，见 §75）的现状梳理交出 **39 条待属主处理**，根因不是"不能删"，而是**"不能取代"**（写＝新增、改正文＝禁止、`--tidy`＝4 类机械修复，中间那个动作没有通道）。本轮把会话结论逐条对预设本体复核，并对真库做**只读**普查。**全程零写入**；九个探针在 `.tmp/`（gitignored），本记录写下后删除其中五个。

### 50.2 实测（全部 `GET`，可复现）

| # | 命令 | 结果 |
| --- | --- | --- |
| E1 | `GET /api/users/0/items?itemType=note&limit=100&start=N`（翻页取全） | live 笔记 **360**：应用包裹体 146 · 裸体 214 · **带 tag 0** · 带 `<!-- autoresearch-section` 208 |
| E2 | `GET /api/users/0/items/trash?limit=100&start=N` | 回收站 **473** ＝ **315 note** · 147 attachment · 10 journalArticle · 1 conferencePaper；其中应用包裹体 285、**带 tag 1**（`QE78EVJR`，`tags=[/section-note]`，裸体） |
| E3 | `GET /api/users/0/items/trash?itemType=note` | **200 + `Total-Results: 0`**（`?itemType=book` 同为 0），而回收站实有 315 条 note；对照 `GET /items?itemType=note` 正常答 360 ⇒ **该端点静默忽略 `itemType`** |
| E4 | `GET /api/users/0/items?itemType=note&limit=1` | `data` 键＝`dateAdded/dateModified/itemType/key/note/parentItem/relations/tags/version` ⇒ **无 `deleted`**；`includeTrashed=1`／`trashed=1` 被静默忽略（360→360，首条 key 相同） |
| E5 | 官方文档两页 | Web API *Deleting an Item* 只写 `204 The item was deleted`，**未说**永久还是进回收站；Local API 页只说支持 DELETE，且"does not attempt to replicate every implementation detail" |
| E6 | `GET /api/users/0/items/<attachmentKey>/file` | **302 → `file:///<library>/<title>.pdf`** ⇒ agent 能拿到附件在磁盘上的真实路径 |
| E7 | 环境与先例 | 预设唯一依赖 `schemastery`；全仓 **0 个 `.py`/`pyproject.toml`/`uv.lock`**；`tools/release-check.mjs:69-70` 把 `command:`／`uvx` 判为问题；[`releases.md`](releases.md) §34 记录旧发布版的 Python/`uvx` 依赖正是被修掉的缺陷 |
| E8 | `.tmp/engine-probe/smoke.mjs`（真论文 `CPZ52NQV`，1.27 MB／8 页） | `@hyzyla/pdfium` 3.0.0：init 24 ms · load 4 ms · `getText()` 5,255 字符/7 ms · `render({scale:1.5,render:'bitmap'})` 892×1189／77 ms／裸 RGBA 4.24 MB · **自写 PNG 编码（`node:zlib`）24 ms → 324 KB/页**。包内唯一二进制 `pdfium.wasm` 5.05 MB、声明依赖为空。（`getOriginalSize()` 字段名是 `originalWidth/Height`） |
| E9 | `.tmp/engine-probe/outline-census.mjs`（20 篇真论文，`pdfjs-dist` 的 `getOutline()`） | **自带大纲 11 篇（55%）**· 空/缺失 9 篇 · 读不出 0 篇。条目即论文自己的节标题，**并带论文自己的编号形式**（`I Introduction`／`II Measure of Stress`／`Appendix: Passive and Active Loading`）。而 **pdfium 给不了它**：该 WASM 只导出了渲染与文本那一小撮函数，`FPDFBookmark_*`、`FPDF_GetMetaText` 都不在其中 |

### 50.3 结论（2026-10-18 裁定，junhan）

1. **删除仍不开工具**，但理由更正：**这个 API 没有"放进回收站"这个动作**（E3/E4 —— 无 `deleted` 字段、`includeTrashed` 被忽略），而"DELETE 即永久"是**实测边界而非文档承诺**（E5）。回收站只由应用产生（E2：315 条 note 皆属主在应用内删的、可恢复）。
2. **归退（retire）作为删除的替代品**：旧笔记打 `/retired`，覆盖只算**活**笔记，可逆（`--undo`），**永不删除**；库中已有的 `/section-note` **只读兼容**，不造第三种写法。协议里"a rewrite is the owner's decision"**原句不动**。
3. **tag 能否活过应用改写仍未证**（E1/E2：675 条笔记里唯一带 tag 的一条，未被应用改过）⇒ 实现时一并做回归测试（写入带 tag → 属主在应用里改一次 → 断言 tag 仍在），并配**父条目标记**为退路、两种读法不一致就停下问。
4. **读的梯级**写成：①库索引 → ②文件文字层 → ③自带目录 → ④页图+视觉。**②不补字体编码的洞**（`⩾`→`P`、`1⁄4` 代 ¼ 这类症状实为 PDF 字体编码/文字层抽取的产物，**不是预设的仪器坏**——会话把它记成 `math_symbols` 失效是归错账）。
5. **引擎路线**：Node 生态内纯 JS/WASM 优先；**Node 都不可行时才引入 Python 运行时**（用 pypdfium2，**不用 PyMuPDF**，后者 AGPL）。`mupdf`（AGPL）任何路线下都出局——预设是 MIT。
6. **验收顺序**：先实测能用，再写进契约（E8/E9 已完成这一步）。
7. 协议版本：头部 `15 → 16` 补欠账，本轮改动立 **Revision 17**；清单默认落 `<study>/research/owner_actions.md`；`PUT /fulltext` 写回库索引**本次不做**、仅登记。

### 50.4 教训（三条）

1. **假absence 不只在文献检索里，也在自己的工具链里**：`GET /items/trash?itemType=note` 答 `200 + 0`，而那里有 315 条 note。**"按类型查"看起来很干净**，正是 §5 三种 nothing 要防的形状——这次是端点静默忽略参数，而读它的人以为自己在问一个受过滤的问题。
2. **会话结论必须对预设本体复核**：本轮有三条归错账——`math_symbols` **不在预设里**（全 git 历史 0 命中）、弹窗早已由 Revision 10 修好、`{{presetTools}}` 的路径机制本来就是对的（硬编码发生在**会话自写的工作区契约**里）。不复核就照着改，会改错地方。
3. **一个"文档欠账"需要一个机械护栏**：`protocol.md:3` 头部写 **Revision 15**，而本节上方 §45 早已记 **Revision 16**——**没有任何一条自测看这件事**。⇒ **已加 `DOC-11`**（头部 Revision ＝ 变更记录里出现的最高 Revision，含负向控制；提交 `6ec4d1d`），头部随之升到 16、本轮再升 17。

### 50.5 复现命令

五个库侧探针（本轮后删除，命令即上表 E1–E4；均只读）：

```js
// E1/E2：翻页取全，按 itemType 分类计数；判据是 `<div data-schema-version=` 为应用包裹体、`data.tags` 非空为带 tag
// E3：对比 GET /items/trash?itemType=<t> 与 GET /items?itemType=<t> 的 Total-Results
// E4：打印一个 item 的 Object.keys(data)，并对比带/不带 includeTrashed=1 的 Total-Results
```

E8/E9 留在 `.tmp/engine-probe/`（`smoke.mjs`、`outline-census.mjs`），待依赖路线定稿后一并处置。

## 51. Revision 17 落地：归退取代删除、清单有形状、读的梯级（2026-10-18）

### 51.1 本轮做了什么

方案在 [`docs/plans/revision-17.md`](plans/revision-17.md)（§10 裁定表、§11 进度表）。十一个提交，按依赖分层：

| 提交 | 内容 |
| --- | --- |
| `6ec4d1d` | **M5 护栏**：`doc-selftest` 加 `DOC-11`（头部 Revision ＝ 变更记录最高值，带负向控制），揪出并修好头部 15 vs 16 的欠账 |
| `1754e83` | **契约 Revision 17**：§6 归退与读的梯级 · §7 清单产物进脚手架 · §8 `INV-NOTE-1` 与 `INV-CTX-1` 补明梯级 · §9 删除理由更正 · README 同步 |
| `423b37a` | **P1 归退**：`--retire/--undo` · `--replaces` · `--plan` 墓碑行 · 21 条新断言 |
| `9f08fb1` | 纪律文本：`section-notes` 的归退（§2 · §3.3 · §3.4 · §4.2 · §6 · §7 · §8 · §9 · 路由描述） |
| `a32a4c4` | 方案与本记录 §50 |
| `806fbed` | **P2 清单**：`--plan --json`（14 条新断言）· `research/owner_actions.md` · skill `## Owner actions` |
| `65491ef` | **M4 写侧窄守卫**：点号序号**读得到、写不了**（8 条新断言） |
| `8697611` | **M1/M2/M3/M7**：`.section-notes/README.md` 约定 · 占位符换填值实例 · 工作区不写解析后路径 |
| `ae75e6d` | **P3 读的梯级**：`tools/zotero-pdf.mjs`（`--extract`/`--outline`/`--render`）+ 两个引擎依赖 + 保真度标签 + 新自测（43 条断言） |
| `1d78c9b` | 纪律文本：梯级（§2.4 · §7） |
| `ff46dbd` | 发布前清理：README 依赖声明更正 + 两处 fixture 去掉属主库痕迹 |

### 51.2 最关键的实测：tag 活过应用改写（本轮唯一的未测前提，已验）

**方法**（真笔记、真实动作、可逆）：对 `F5MFILYW`（`PUM9RHQ4` 的第 4 节笔记）执行**真实的归退**（`--retire --write`，version 2771→2772）→ 属主在应用里改一个字符并保存 → 读回 →（测完）`--retire --undo --write` 恢复。

**结果**：

| 观测 | 结果 |
| --- | --- |
| 应用是否重写正文 | **是**：`3713 → 3748` 字符，正文被套 `<div data-schema-version="9">`，计划里该笔记由 `API` 变 **`app`** |
| 隐形 marker | **被吃掉**：声明改由**首段**读出（`第N节: "文章第4节"`）——§40 记的机制在真库上再复现一次 |
| **`/retired` tag** | **存活** ✅ 归退标记的快路成立 |
| 撤销 | tag 移除、`read here : §4 · §3 · §2`、`retired : none`，**§4 重新算覆盖** |

**结论**：① 归退的标记机制成立；② "标记被吃时靠首段读回"这条**退路当场被验证**（它正是这么读出 §4 的）；③ **父条目标记这条退路本轮不需要实现**，仅作为"将来某版本若丢掉 tag"的备案保留；④ 唯一残留：那条笔记的 marker 已永久丢失（应用造成），其覆盖此后由首段承载——工具与纪律本就把第一段当作一等证据。

### 51.3 发布自检抓到的四件事（全是机械闸门抓的，不是靠记性）

1. 新自测没进**发布流程**的套件块 → `release-check-selftest` 红（清单一致性）；
2. `package.json` 变更使 dump 陈旧 → `preset-selftest` 拒绝（时效性，设计如此）；
3. README 仍写 **"One dependency"** 与 "no second toolchain" → 发布流程 §2 的**反向声明重扫**抓到（我加了两个依赖，前半句随之变假）；
4. §6 机器痕迹扫描抓到两处：新自测的 fixture 用了**本机库路径**，而 `zotero-read-selftest.mjs` 里**上一轮遗留了 14 个属主真实条目 key** —— 两者都换成 Zotero 文档自带的示例 key（`ABCD2345` 一族），钉的形状不变。

### 51.4 未做 / 未测（登记）

- **M6**（生成式能力单页 + 不漂移断言）：junhan 定为**发布后单独一轮**。
- **`PUT /fulltext` 写回库索引**：仅登记，本轮不做（§50.3 第 7 条）。
- **父条目标记退路**：未实现，理由见 §51.2（实证表明当前不需要）。
- **OCR**：仍不做；`--fulltext` 与 `--extract` 现在各自打印 `rung`/`source` 行，把"哪一级答的、它可信到什么程度"写在结果里。

### 51.5 发布 0.4.0

已移入 [`releases.md`](releases.md)（原 §51.5）：发布是事件，决策是立场，两者不放在同一份文件里。

## 52. 工具链单页：生成物，且每条声明挂一条可校验的出处（2026-10-18）

**背景**：三条文献会话各自花时间撞出这些 helper 的边界，其中一条把话说得很直白——"这套工具的接口边界只在源码注释里，不在任何 usage 里，撞上才知道"。M6 的答案是一页纸，但它先得解决一个更基本的问题：**怎么让一页纸不漂移。**

**做法**（`tools/toolchain-page.mjs` · `tools/toolchain-selftest.mjs` · [`docs/toolchain.md`](toolchain.md)）：

- 页面**生成**，形状的唯一决定处是生成器里的 `renderPage()`；
- **每条声明挂一条出处**：`{ file, must[] }`＝"这个文件里必须还能找到这几个字面量"。20 条声明、40 余条出处，覆盖 11 条通道事实与 9 个 helper；
- 自测做两件事：① 任一出处不成立即红，并带负向控制（被删掉的句子 · 不存在的文件 · 多出处里坏一条）；② **磁盘上的页面必须等于生成器的输出**，且"缺失"与"陈旧"分开报（手改生成物会被判为漂移，而不是改进）；
- 页面**自己写明不能证明什么**：出处只证明"它站的那块地还在"，不证明"这句话是对那段源码的公平概括"。概括是人写的，机械的只是地基——分工是刻意的。

**首次运行即抓到一条**：我引用 `(2) the file's own text layer`，而源文件里那个撇号是 JS 转义的（`file\'s`），逐字节比对因此不成立。这正是这套机制该有的手感：**它不认"意思对"，只认"字还在"**。

**同一轮抓到一个真缺口**：`tools/release-check.mjs` 的 `REQUIRED_HELPERS`——"缺了它，发布件里通道就不工作"的那张名册——写于梯级之前，**不含 `tools/zotero-pdf.mjs`**。而 Revision 17 的纪律已经把该 helper 写进交给 agent 的命令 ⇒ 一个不含它的发布件里，**有文档的一级梯级不可达**。这是名册式检查看不见自己名册之外的东西（`6f80323` 补上；随后用 `release-check --tag v0.4.0` **反向验证**：已发布的包里确实有它）。

**已知边界（登记）**：`docs/toolchain.md` 里的链接路径**不在** `doc-selftest DOC-8` 的扫描范围内（那份检查只读 `protocol.md` / `surface.md` / `README.md` / `docs/coverage.md`）；该页的 helper 名册由 `toolchain-selftest` 自己对着仓库校验（重命名会红）。

---

## 54. 工具粒度的判据，与 keep-list 从"名字名单"改成"命名空间"（2026-10-19）

**起因**：junhan 问"这套预设提供的工具，粒度足够细了吗"，并确认四个强化方向（A 量前提 · B 改 keep-list 粒度 · C 给 metadata 通道落一个 helper · D 评估读侧模式改子命令）都做。本轮做的是 **A 与 B**（C/D 各占后续一节）。

### 54.1 先验（全部是本次实测，不是推断）

1. **现役工具面的成本**：取 2026-10-19 08:34 一个顶层 autoresearch 会话的 `request/header`，
   `node tools/dump-session.mjs <dir> .tmp/as-session.jsonl` + `node tools/list-tools.mjs` 数出
   **44 个工具 / 38,282 字符 ≈ 10.6k token，每请求常驻**（估算尺 3.6 字符/token，与 §29/§31 同一把）。
   组成：宿主行 24 个 · 保留的 profile 全局 20 个（mnemon 17 + `read_page`/`x_search` + `read_image`）。
   **预设自带的领域工具在这 44 里占 0 个名字**——九个 helper 走 `pwsh`，工具面 0 字符。
   对照：§29/§31 删掉的两条 MCP 行是 77,586 字符 ≈ 21.5k token/请求 ⇒ 现在整个面是当年的一半。
2. **mnemon 是最大的单项**：17 个工具 15,112 字符 ≈ **4.2k token/请求（占 44 个工具 token 的 39%）**，
   是 persona（4,726 字符 ≈ 1.3k）的 **3.7 倍**。
3. **实际调用**（现已转正为 [`tools/session-tool-usage.mjs`](../tools/session-tool-usage.mjs)；57 个 autoresearch 会话）：
   mnemon 共 **88 次 = 1.4%**（当轮）／**89 次**（转正后复测），来自 **17 个里的 6 个**——`runtime_memory` 49→50 ·
   `document_search` 15 · `document_create` 11 · `document_manage` 7 · `recall` 4 · `remember` 2；
   **其余 11 个一次也没被调用**。**语料会动**：同一批 57 个会话在约 40 分钟内从 6,081 次调用涨到 **6,161** 次
   （有一个会话还在追加），所以稳定的是"6/17"与那个比例，不是总数——重跑时按工具打印的数字读，不要拿总数对差。
4. **常驻散文与工具集是解耦的**（`.tmp/mnemon-resident-names.mjs`，同一批 57 个会话）：
   它们的**系统提示里出现的 mnemon 工具名 = 0 个，57/57**。那段协议块由 profile 级的
   `dsh-mnemon-strategy-default-three-tier` 按 **mnemon View 的 offers** 拼出来，`mnemon_recall` /
   `mnemon_runtime_memory` 是字符串常量，**它从不查 DSH 的工具注册表**。
   ⇒ **隔离挡得住工具，挡不住散文**：`ctx.tools.restrict()` 只能对注册表里的名字生效。

### 54.2 裁定：不缩名单，改成命名空间级保留

原先的写法是 17 个名字的硬名单，它**同时比依赖窄、比需要宽**：

- **比依赖窄**：那组名字属于装上的 mnemon provider，不属于本预设。provider 升级新增一个 `mnemon_*`
  时，它是"全局视图里不在 KEEP 的工具"，会被 `deny = 全局视图 − KEEP` **默认屏蔽**——
  而 `progress-sync` 的三层沉淀整个架在它上面，却没有东西会报告这件事。这与 §33 抓到的是同一类缺口：
  **名单式检查看不见自己名册之外的东西**。
- **比需要宽**：它保留了 11 个在 57 个会话里从未被调用的名字。
- **缩名单是不可选的**：第 4 条实测说明"今天没被点名"是 **View 状态**，不是结构保证；哪天 View 重新提供
  route，点名就回来，而被 deny 的工具就成了一条**悬空指令**（让 agent 去调一个它看不见的工具）。
  用一句"实测过没点名"去换这个风险，是把状态当成了契约。

所以保留的**方向**（拉黑制）与护栏都不动，只把名单里那一段换成**意图**：

```js
const KEEP_NAMESPACES = ['mnemon_']        // 记忆层是"一层"，不是它的工具快照
const isKept = (n) => KEEP.includes(n) || KEEP_NAMESPACES.some((p) => n.startsWith(p))
```

**加宽必须是响亮的**：命名空间解析出的确切名字进 `isolation-report.json` 的 `keptByNamespace`，
并且在**该集合发生变化**时打一行（`kept by namespace mnemon_ - …`）。这是这道宽判据唯一的代价，
也是它必须自己说出来的那件事——工具面被加宽时不留下痕迹，才是真危险。

### 54.3 落点与验证

- [`isolation.js`](../isolation.js)：`KEEP_NAMESPACES` + `isKept()` + `splitGlobalView()` 返回
  `keptByNamespace` + 报告与那行提示；`kept` 每轮反映**当前**视图，`denied` 仍只由"真的施加过过滤的那一轮"写入
  （收缩视图不许抹掉证据，这条语义原来就有，这里只是没被顺手破坏）。
- [`tools/isolation-selftest.mjs`](../tools/isolation-selftest.mjs)：**4 条新断言**——
  ① 只在**包含**前缀（`xmnemon_recall`）而不以前缀开头的名字**仍被拒**；
  ② **provider 事后新增**的工具被**保留**而不是屏蔽（命名空间替代名单的全部理由）；
  ③ 报告把命名空间**解析成确切名字**；
  ④ 晚到的命名空间工具**被记录**，加宽不是静默的。
- 验证：`node tools/isolation-selftest.mjs` **PASS**（含上述新断言）。
- **生效时点**（§25）：预设源改动只有宿主重启才生效，所以这四条断言是**离线**证明，
  它对真实会话的验证要等下一次重启后的新会话（`isolation-report.json` 的 `keptByNamespace` 是那时读的凭据）。

### 54.4 未做与边界（登记）

- **省下那 4.2k token 不在预设这一侧**：能裁 mnemon 工具面的地方是 profile 的 `dsh-mnemon` 配置
  （`writeEnabled` / `memoryView` 等），那是所有者自己的设置。**预设不得依赖 profile 配置**，
  所以"mnemon 占 39%"这条登记在这里，作为下一轮如果要动的**前提**，而不是本轮的动作。
- **命名空间保留是宽容方向的判据**，与"窄到可信、命中就响亮拒绝"的护栏偏好方向相反；
  它之所以可接受，是因为它只放宽**一个具名前缀**，且解析结果每轮入报告。若将来出现第二个前缀，
  该按同一标准逐项裁定，不要合成一张前缀表。
- **A 的探针已转正**为 [`tools/session-tool-usage.mjs`](../tools/session-tool-usage.mjs) 与
  [`tools/session-prompt-names.mjs`](../tools/session-prompt-names.mjs)（共用 `dump-session.mjs` 的
  `readSession`）。它们不是通道 helper、不进 `REQUIRED_HELPERS`，但**能被重跑**——所以上面的数字是测量而不是断言
  （[`releases.md`](releases.md) §53 同一条规矩：重跑不了的数字会退化）。

---

## 55. 第三条通道也有程序了：书目元数据的 helper（契约 Revision 18，2026-10-19）

**起因**：B 之后做 C——给 metadata 通道落一个 helper，把 `mailto` 注入、禁循环、429 退避、字段收敛从散文变成程序属性。

### 55.1 先验（本次实测，全部可复现）

1. **契约与实现本来就差着一半**：`protocol.md` §6 写的是**三类通道**（预印本 / 本地参考库 / 书目 REST），
   并明文说"通道由**本预设自带、纪律点名的 helper 程序**抵达"。前两类有程序，第三类此前只有散文——
   纪律教模型**手拼 URL 再交给 `web_fetch`**。所以 C 不是新加通道，是补齐契约早已声明的那一半。
2. **原始响应装不进去**：一个 OpenAlex 作品记录实测 **24,580 字符**，三行 search **65,619 字符**，
   而裁剪器只在压缩时留 8,192（头 4,096 + 尾 1,024；时点已更正，见 §63）⇒ 必须先把字段收敛。实测收敛后 `--json` 是 **4,867 字符**。
3. **答回来的 DOI 可能不是问的那个**：OpenAlex 对 `doi:10.48550/arXiv.1706.03762` 答回的作品，
   它自己的 `doi` 是 `10.65215/2q58a426`（标题与年份都是这篇）。只报标题与数字会把这次替换藏起来。
4. **两个源不可互换，差别在注册而不在质量**：同一个 arXiv DOI 在 OpenAlex 是 200、在 Crossref 是 404
   （"Resource not found."）—— arXiv 注册在 DataCite。
5. **同一个作品的引用数在两个源上不同**：43,412（OpenAlex `cited_by_count`）对 46,513（Crossref
   `is-referenced-by-count`），分钟级相邻实测。
6. **四种"没有"必须分开**：Unpaywall 对不认识的 DOI 答 **HTML 的 404**；OpenAlex 对未知 DOI 也答 HTML 404；
   限流是 429；body 不是 JSON 是另一回事。
7. **`mailto` 不是 OpenAlex 的配额杠杆**：它自己的 `meta.notice` 写着共享日预算（$0.10/IP）并明说
   "The mailto parameter doesn't raise this limit"；另一次同请求带/不带 `mailto` 的答复逐字节相同。
   另外 OpenAlex 的"标题式搜索"其实是**全文搜索**：`attention is all you need` 的 `total` 是 3,230,801，
   它自己的读法是 `get works where full text has (...)`。

### 55.2 做法：规则搬进程序，**来源与日期搬到数字旁边**

`tools/metadata.mjs`（五模式：`--doi` / `--search` / `--refs` / `--cited-by` / `--oa`；一次调用一个请求）：

- **地址**：`--mailto`（或 `AUTORESEARCH_MAILTO`）有就注入、没有就**整个省略**（不是留空参数）；
  `--oa` 没有地址直接拒绝——Unpaywall 用 `email=` 收地址，猜不得。
- **禁循环**：一次调用一个请求、一种模式；`--cited-by` 只收 OpenAlex id（`cites:` 是 id 过滤器，给 DOI 就拒绝并说明先 `--doi`）。
- **分类**：`classifyResponse` 把 429 / 404 / body 不是 JSON / 其它失败分开，`channelFinding` 各说各话。
- **收敛**：每个模式先收敛到固定字段集；`--json` 打印的是**收敛后的记录**，不是原始响应。
- **摘要**：`reconstructAbstract` 只在能从倒排索引**完整重建**时给出文本；位置有洞就报 absent。
- **引用数**：每行都带**来源与检索日期**（这条同时升格为契约规则，见 55.3）。

**实现里被自己的测试抓到的一个真 bug**：`Array.prototype.filter` **跳过稀疏数组的空洞**，所以第一版
"位置有洞就拒绝重建"的护栏是空转的——`join(' ')` 会把洞打成空格，输出一份**读起来像完整摘要的部分摘要**。
这正是"不许报一个你没有重建的摘要"要防的东西，而它差一点就藏在护栏里。改成显式走下标后，那条断言才真的成立。

### 55.3 契约：Revision 18

- 第三通道现在也有程序 ⇒ §6"通道由本预设自带的 helper 抵达"对**三条**都成立（原来只对两条）。
- §6 新增一条规则：**引用数必须带来源与检索日期**（依据 55.1 第 5 条）。
- §6 原文自称"Three rules"，而它实际列了七条 ⇒ 改为"These rules"。三条都由 Revision 18 记录，**契约里不写符号名**。

### 55.4 落点

[`tools/metadata.mjs`](../tools/metadata.mjs) ·
[`tools/metadata-selftest.mjs`](../tools/metadata-selftest.mjs)（fixture 是 2026-10-19 真捕获的响应，
含 Unpaywall 那段逐字节的 404 HTML）· [`protocol.md`](../protocol.md)（Revision 18 + §6）·
[`surface.md`](../surface.md)（第三条通道行）· [`README.md`](../README.md)（通道数、联系地址那条声明、
新 helper 段落、自测清单、一条坑）· [`docs/coverage.md`](coverage.md) ·
[`skills/metadata-query/SKILL.md`](../skills/metadata-query/SKILL.md)（instrument 从 `web_fetch` 改成 helper）·
[`contact-bridge.js`](../contact-bridge.js)（常驻行不再教模型手拼 `&mailto=`）·
[`tools/release-check.mjs`](../tools/release-check.mjs)（`REQUIRED_HELPERS` 补上它）·
[`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs)（三通道分组 + 三条新事实）· 重生成的
[`docs/toolchain.md`](toolchain.md)（20 → **24 条声明**）。

**顺手修掉一个会静默吞东西的地方**：`docs/04` 的通道分组原先写成"`zotero-*` 一类、其余一类"，
新 helper 会被归进"预印本通道"。现在分组由 `CHANNELS` 显式声明，且**匹配数不等于 1 就抛错**——
一个没被任何通道认领的 helper 不会从页面上悄悄消失。

### 55.5 验证

`node tools/metadata-selftest.mjs` **PASS**（69 项，含负向控制）；`node tools/metadata.mjs --selftest` 同结果。
真实网络端到端：`--doi` / `--oa` / `--search` / `--refs` 四种输出如上，退出码 **0（答了）/ 1（请求或响应失败）/ 2（用法）**
各自实测；`--doi 10.9999/does-not-exist` 走 404 分支并 exit 1；`--cited-by 10.1/x` 走拒绝分支并 exit 2。
`toolchain-page --write/--check` 报 *current and every citation holds (24 claims)*，`toolchain-selftest` PASS。

### 55.6 未做与边界（登记）

- **Unpaywall 的 422**：纪律里那句"占位域名被 422 拒绝"是**继承来的声明**，本轮**没有复核**。
  helper 的拒绝条件是"没有地址"（与 422 无关），所以那句改成不带数字的表述，而不是照抄一个我没测的数。
- **不翻页、不建引用图**：`--refs` / `--cited-by` 各取一页并把总数与"还有多少条held back"报出来；
  翻页是下一次调用。这与"禁循环"是同一条规矩的两面。
- **Crossref 侧的引用列表**只按它返回的 `reference` 数组读，不做解析或补全。
- **`--oa` 的地址来源**仍是系统提示里宣布的那个（`contact-bridge` 注入），helper 不读 profile 配置——
  预设不得依赖所有者自己的设置（§54.4 同一条边界）。

---

## 56. 读侧模式该不该改成子命令：实测为零误用，裁定不做，并留下触发条件（2026-10-19）

**问题**（D）：`zotero-read.mjs` 的六种模式、`zotero-pdf.mjs` 的三级梯级都用 flag 表达（`--search` / `--item` / …），
非法组合只能在**运行时**被拒绝。改成子命令（`read item <key>`）能让非法状态**不可表示**——这是"函数式"那一侧
的正确方向，但要不要付这笔钱，得先看它今天有没有在流血。

**先验（本次实测，[`tools/session-helper-modes.mjs`](../tools/session-helper-modes.mjs)，57 个 autoresearch 会话）**：

- **283 段**命令行调用了 `zotero-read.mjs`；其中**双模式 0 次**（`--item` + `--fulltext` 这类组合一次都没有）。
  `zotero-pdf.mjs` 在这 57 个会话里**一次都没被调用**。
- 用法分布：`--fulltext` 84 · `--item` 58 · `--collections` 35 · `--collection` 23 · `--search` 13 · `--tags` 1；
  另有 **69 段"无模式 flag"**——它们多数只是**提到**该程序（`foreach` 的文件清单、`Select-String` 的管道、
  读源码的 `Get-Content`），所以真实调用数 ≤ 283，探针的这一层是上界不是精确值。
- 两条拒绝信息（`pass one of … not both`、`one rung per invocation`）在**真实执行输出**里 **0 次**命中。
- **爆炸半径**：这些模式 flag 在仓库里被提到 **167 处**——程序自身 72 · 生成器与生成页 34 · 纪律 24 ·
  决策记录 13 · 覆盖地图 9 · 自检 15。

**裁定：不做**（"都做做"里的 D 项按实测收口为"不做并登记"）。

零真实误用 ⇒ "让非法状态不可表示"在这里**没有可观测的收益**；代价是 167 处文本（含生成物与纪律正文），
而改名不改变任何语义——爆炸半径最大的那一处（逐节笔记的 `--plan/--write/--retire`）也一字不动。
**这个结论只在"读侧"成立**：写侧的 `zotero-section-note.mjs` 仍是"一个程序多层效果"，理由见 §54 之后那条
（共享不变式），与这里说的不是同一件事。

**触发条件**（写不出来就不该登记，所以写成可判定的）：

1. 真实执行里**第一次**命中那两条拒绝信息（探针 = `tools/session-helper-modes.mjs --preset autoresearch`），或
2. 出现一次把 `zotero-pdf` 的 `--pages` 用错归属的真实调用，或
3. `zotero-pdf.mjs` 开始被实际使用（当前 57 个会话 **0 次**），且其梯级误用率可测。

**探针自己错了两次，记下来**：① 第一版按"每次工具调用"统计，而一次 `pwsh` 调用常串起多条 `node …` 命令
⇒ 报出 132 次"双模式"，其实是 132 条脚本；② 第二版改按命令行分段，却用**子串**匹配，而 `--collections`
**包含** `--collection` ⇒ 报出 35 次"双模式"，其实是同一个 flag；③ 拒绝信息的统计还从**读源码**的工具结果里
命中——那是源码文本，不是执行输出。三条收口成同一句话：**统计单位、匹配边界与证据来源，必须与你声称的那句话一致**。

**顺带一条旁证，回给 C**：`metadata.mjs` 沿用整套的 `--flag` 语汇，而不是另起一套子命令——
一个套件里并存两种命令行语法，才是真正会让模型出错的那种不一致（这也是 D 不做的一个正面理由）。

**未做**：不改程序、不改纪律、不改生成器。是否把"不做 + 触发条件"登记进 `docs/backlog.md`
（那是 junhan 自己的台账格式）留给他定。

---

## 58. 笔记身份改为 tag，digest 改为章节笔记的投影（Revision 19/20，2026-10-19）

**起因**：junhan 连续追问五件事——隐形 marker 为什么会被应用吃掉、首段正则该不该删、网页版粘贴的笔记能不能原地改写、`--tidy` 该不该保留、digest 到底该从哪来；并指出库里"好像还会走子节生成"。这一轮把五个问题合成一次身份模型的重写。

### 58.1 实测（只读，2026-10-19）

| 口径 | 数值 |
|---|---|
| live 笔记 | 378 |
| 带 section marker | 225（其中 **38 条是点号子节**） |
| 无 marker | **153（40.5%）** |
| 带 digest marker | **0**（回收站也是 0） |
| 带 `/retired` | 34 |
| 带 `/replaces-` | 15 条 |
| 带任意 tag | 49 |
| 回收站 | 481 项 / 323 note |

点号子节分布：`EEBHNSV9` 10 · `78LSP7TE` 5 · `D6JR2EQT` 5 · `4394NKWC` 4 · `JLWH377B` 4 · `9QQJJVVK` 3 · `JSZEALS3` 3 · `QVD59DT6` 2 · `CYY7DAH7` 2。

四个结论：

1. **40.5% 的节笔记已经丢了 marker**；378 条 live 笔记全部是节笔记——tag 身份不是优化，是修复。
2. **38 条旧子节笔记还在库里**，和 §41.3 记的"全库 0 条"不一致；以这次普查为准。当前工具不再新建点号，但仍会读并折回父节；新方案不再读。
3. **digest 从未落过一条**：live 0、回收站 0；153 条无 marker 笔记的首段也没有 digest 形态。改它的语义没有迁移成本。
4. 34 条 `/retired` + 15 条 `/replaces-` 说明归退/替换已经在用；删除干跑一上线就有真实样本。

### 58.2 裁定（junhan，2026-10-19）

1. **身份 = `/section-N` tag**；不再写、不再读任何隐形 marker。应用改正文会吃掉注释，tag 是 item 元数据，实测活过一次改写。
2. **不解析正文**：带 `/section-N` 才是覆盖；没有 tag 的笔记进 `unknown`，由 agent 读。覆盖的裁定权回到阅读。
3. **粘贴笔记**：claim 前可 `--rewrite` 原地改写；claim 后带 `/imported` 仍可原地刷新；`/section-N` 不带 `/imported` 是记录，走 `--retire` + 新写。
4. **`--tidy` 完全删除**：写笔记只由 agent 提供正文，工具不自动修公式。
5. **`--retire` 任何笔记**；`--delete` 只对 `/retired` 开放，本轮只干跑。
6. **digest 是章节笔记的投影**：一条论文一条 `/digest`，从 `/section-N` 合成；原地刷新（备份 + 版本守卫），不产生墓碑；回执 = `refs/` 一行 + `/done` tag。
6. **digest 是章节笔记的投影**：一条论文一条 `/digest`，从 `/section-N` 合成；原地刷新（备份 + 版本守卫），不产生墓碑；回执 = `refs/` 一行 + `/done` tag。**（回执部分已由 §62 取代：读态改为每个课题自己的台账行，`refs/` 已废除。）**
8. **`adoption-ruling` 按需**，不进主流程。

### 58.3 落地

- [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)：`/section-N`、`/imported`、`/digest`、`/retired`、`/replaces-`；`--claim`、`--rewrite`、`--retire`、`--delete` 干跑；删除 marker、首段正则、`--tidy` 与 `normalizeMath`；plan 输出改为 `covered`/`retired`/`digest`/`unknown`/`ambiguous`。
- [`tools/zotero-note.mjs`](../tools/zotero-note.mjs)：digest 身份改为 `/digest`，`findDigestNote` 跳过 `/retired`；追加改为原地刷新（备份 + 版本守卫）；无 marker、无 append。
- [`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)：身份、claim/rewrite/retire、digest 合成、报告与清单重写；删除 §3.4 机械修复。
- [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)：读完写回执（`refs/` 一行 + `/done`），digest 交给 `section-notes`。
- [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)：读完写回执（`refs/` 一行 + `/done`），digest 交给 `section-notes`。**（已由 §62 取代）**
- [`protocol.md`](../protocol.md)：Revision 20；§4、§6、§8、§9；`INV-NOTE-1` 改为"一条活 claim"，新增 `INV-NOTE-2`（digest 投影），`INV-EVID-4` 改为"章节笔记是转写，digest 是投影"。
- 自测：`zotero-section-note-selftest` 增加**第一条 CLI 级 stub 测试**（plan/claim/rewrite/delete 干跑，全部只发 GET）；`zotero-note-selftest` 改为 create/refresh/no-op + stub CLI；全套 20 项离线自测通过。

### 58.4 未做 / 边界

- **旧笔记迁移（Phase 7）**：2026-10-19 已完成 **187 条顶层 marker 补 `/section-N`**（0 失败，只写 tag、不碰正文）；剩余 **38 条点号**（有内容的子节解释，先合并成顶层节再退休，不能无差别打 `/retired`）、**153 条无 marker**（读后 claim/rewrite/retire）、**34 条 retired**（删除干跑）。后续批次各自授权，不盲写。
- **`--delete --write` 未实现**：本轮只到干跑；API 删除永久、不进回收站，实写要另一轮授权。
- **digest 原地刷新的旧版只在工作区备份**，不在库里；这是"派生视图可刷新"的代价。
- **其他库的旧 digest 笔记**可能仍带 marker；需要先补 `/digest` tag，本库为 0。
- 计划与分阶段见 [`docs/plans/note-pipeline.md`](plans/note-pipeline.md)。

---

## 60. 删除实写、digest 旧版留库、取消失败备份（2026-10-19，Revision 21）

**缘起**：0.7.0 发布后 junhan 指出"不在 0.7.0 里"的三条中，第 1 条（`--delete --write` 未实现）与第 3 条（digest 旧版只在工作区）是功能缺口；第 2 条（153 条无 marker / 38 条点号 / 34 条 retired 的整理）他明确不做，只改预设功能。三个决定逐条确认：

| # | 决定 | 裁定 |
|---|---|---|
| 1 | 删除 | 实现 `--delete --write`：只删 `/retired`；**不要求 `--reason`**（理由已在退休动作里）；先打印计划，写时带 `If-Unmodified-Since-Version`，2xx 后读回 404 才算成功；批量不做 |
| 2 | digest 旧版 | 从工作区备份改成**库里留一条 `/digest` + `/retired` 快照**（同一 record 下），再 PATCH 活 digest；快照不参与覆盖，可用 `--delete` 清掉；工作区不再写 `digest-*` |
| 3 | 逐节 `--rewrite` | junhan 问"不备份行不行，直接重写呗？"——**行**。节笔记是对论文的转写，论文才是来源；干跑打印旧首段、版本守卫保留；工作区不再写 `rewritten-*` |

**实现**（`tools/zotero-section-note.mjs`、`tools/zotero-note.mjs`）：

- `runDelete`：重读确认仍是 `/retired` 且版本未动；`gate.write('DELETE', …, undefined, {'If-Unmodified-Since-Version': v})`；非 2xx 报库的原文；读回必须 404，否则 `READ-BACK MISMATCH`。删除后若笔记有 claim，明说该节重新可写；successor 的 `/replaces-KEY` 会悬空，计划里已警告。
- `zotero-note.mjs`：`findRetiredSnapshot(children, body)` 复用上次失败留下的同文快照，避免叠 tombstone；refresh 先 POST 快照并回读 `/digest` + `/retired`，再 `patchItem`；快照建立后 PATCH 失败时明说活 digest 未动、旧正文在快照里。`--rewrite` 与 digest refresh 不再写 `.section-notes/` 下的备份文件（该目录仍用于草稿与 `--render` 页面图）。
- **顺手修掉一个潜伏 bug**：`zotero-note.mjs` 的 `tagList` 只读包装后的 `item.data.tags`，而 `readItem` 返回的是已解包的 data，所以 create 路径的回读校验一直在读空 tags；现在两种形状都认。

**测试**：两条 CLI stub 扩成能处理 `POST /api/local/authorize`、`POST /items`、`PATCH`、`DELETE`（含 428 前提检查），并使用临时 `ZOTERO_LOCAL_KEY_STORE`，不碰本机 grant 文件。新增断言：DELETE 后读回 404、快照先于 PATCH、快照带两个 tag、快照正文是旧版、`--delete --reason` 是 usage error、`--rewrite` 输出不再出现 backup。全套离线自测与 `toolchain-page --check` 见交付时的运行记录。

**边界 / 未做**：

- Phase 7 的 38 / 153 / 34 仍暂停；删除工具只是让 34 条 retired 的处置有了出口，不自动执行。
- 不做批量删除、不做"删除后自动清理 successor 指针"；`--replaces-KEY` 悬空只报告。
- digest 快照会随刷新累积；这是"库里留历史"的代价，清理用 `--delete`，由人决定。
- 工作区备份取消后，改错的正文没有本地副本；节笔记的来源是论文，digest 的旧版在库里。

---

## 62. 读态落进每个课题自己的台账，`refs/` 废除（Revision 22，2026-10-19）

**缘起**：junhan 在 2026-10-19 的对话里连问四件事——(1) 读一份参考文献为什么要默认按各章节生成笔记，"读到第二节发现跟课题关系不大"却没地方停；(2) 怎么让 agent 判断这篇是否**值得读完**；(3) digest 与"裁决笔记"是否功能重复；(4) 各课题的参考文档有没有统一规格。追到根上发现是同一条：**"读到哪、为什么停"没有任何地方记账**，于是每一轮都要么重读、要么把同一个判断再做一遍。

**已核实的前提**（都在源码里读过，不是回忆）：

| 事实 | 出处 |
|---|---|
| 大纲只给 `{depth, title, ordinal}`，**没有页码、没有 dest、没有字符偏移** ⇒ "大纲 → 位置"的映射不存在 | `tools/zotero-pdf.mjs` `outlineRows()` |
| 切片打印 `next: --offset N`，且每片开头就是那一节的标题 ⇒ "读到第几节"由读到的文字自己给出 | `tools/zotero-read.mjs` `sliceText()` |
| `--grep` 的命中项带字符 `index`，可直接当 `--offset` 用 | `tools/zotero-read.mjs` `findPassages()` |
| `zotero-section-note.mjs --item <recordKey>` **一次**打印每条笔记的 tags + 首段（`firstBlockText` 取第一个 `<p>/<h>/<li>` 块） | `tools/zotero-section-note.mjs` |
| OCR 件上的标题可能被认错（`P SOLUTIOCN`、`-P IZATION AND THE CORRECTOR`） | [§37](decisions.md) |

**裁定**（逐条经 junhan 确认）：

| # | 项 | 裁定 |
|---|---|---|
| 1 | 一篇文献服务多个课题 | 可能；判定按（课题 × 文献）存 |
| 2 | 台账落点 | **课题自己的文件**里，不是项目根共享文件 |
| 3 | `refs/` | **废除**；跨课题查重靠 `grep -n "<itemKey>" research/literature/*.md` |
| 4 | 读法 | **从前往后顺序读**为默认；跳读只在"大纲存在 + `--grep` 命中 + 打印命中的标题行原文"三条同时成立时允许 |
| 5 | 词汇 | `depth` 载水位（`—`/`abstract`/`§N`/`full`）；`verdict` 三值 `park`/`enough`/`stop` + 空 = 正在读 |
| 6 | 权限 | 继续 / 停由 agent 直接落台账，不提问；只有滑向研究方向决策时才问 owner |
| 7 | `grade`/`depth` 的写者 | 搜索轮**先填它实际读到的**，读轮可就地改正；`verdict`/判定依据/复看条件/日期只归读轮 |
| 8 | `/done` | 降为人工标记，**任何判断都不读它** |

**否掉的方案**（记下来，防止再提）：

- **"读之前先宣布这篇要深读"**：读是渐进的，停下才是判断；预声明深读等于把"读完"变成承诺。
- **入口节优先 / 跳读为默认**（本轮 v1 草案的原建议）：依赖于上面那条"大纲 → 位置"的映射，而它不存在；在 OCR 件上 `--grep` 标题还可能静默落空。已撤回。
- **只按章节数决定写不写笔记**：起因正是"强制逐节生成"本身。
- **把判定塞进 `refs/` 加一列**：study 级共享索引答不出"对哪个课题读到哪"，加列只是把模糊留在原地。
- **让读轮独占 `grade`/`depth`**：A/B/C 会在同一个文件里出现两个家，或让搜索轮已经读过的全文在台账里看不出来从而被重读。

**实现**：

- **S1（`1431fa3`）**：`research/literature/README.md` 的 `## Evidence table` 换成九列 `## Reference ledger`（`itemKey · year · found via · grade · depth · verdict · basis · re-open if · date`）+ `## Reading log`；`A` 的定义从"读了全文"改成"读了这句话靠的那几段"，`depth` 才是"读到哪"。`literature-recon` 只追加候选行、不再决定"是否值得读"；`section-notes` 接受**中途停下**的阅读（没走到的节报 `not reached`，不报"不需要笔记"）；`adoption-ruling` 改读台账行，`§4.2` 那条"digest 是 B 级就停"改成 depth/grade 判定——它对"读到 §3、digest 合理地短"的论文会合法地误判。
- **S2（`21ce6bc`）**：删除 `project-template/research/literature/refs/`；`protocol.md` 升 Revision 22，`INV-EVID-4` 的判据从"查索引"改成"查本课题台账行，再看记录上的笔记"，新增 `INV-EVID-6`；`README.md` / `AGENTS.md.template` / `docs/coverage.md` / `adoption/README.md` 的三处布局与回执句同步；`tools/zotero-note.mjs` 头部注释里的"回执在 `refs/`"改掉。
- **S3（本次）**：新 discipline [`skills/reading-triage/SKILL.md`](../skills/reading-triage/SKILL.md)，契约升 **Revision 23**，§4 加 `triage` 一条；persona 路由加一条并改写 `literature-recon` / `section-notes` 两条触发语（前者不再"决定是否值得读"，后者改为"读轮刚读完一个方法节"也可触发）；`skills-selftest` 10→11、`preset-selftest` 路由数组与计数 11、`surface.md` / `docs/coverage.md` / `README.md` 各加/改一行。

**未做**：

- **`refs/` 只在模板里废除**。已经按旧布局建好的研究工作区里那份 `refs/` 不会自动迁移：它现在是一份**无人读取的旧文件**，删不删由 owner 决定，工具不会碰。
- 判定"复用记录上已有的 `/section-N` 笔记"这条路径的**成本对比是估算**（一次 `--item` 调用 vs 首次读 40k 字符正文的 5–8 次切片），没有在同一条记录上实测过。**（已被 §63 取代：junhan 裁定不需要这个精确数字，不实测。）**
- 结果裁剪器配置写 8,192/4,096/1,024，而本轮实测一次 14,999 字符的工具结果**完整到达、未被裁剪**——两者不一致，**未查清**。切片沿用工具默认的 12,000（草稿里一度取 7,000 做"两边都安全"的对冲，实施时改掉：为一个没查清的配置引入第二个切片数，只会让仓库里同时存在两个数字）。**若裁剪器真的生效，12,000 的片会掉中间**，两条修法（阈值抬到 16,000，或默认降到 7,000）都还没裁定。当前防线是纪律硬要求"报告里写明实际读到多少字符"。**（已被 §63 取代：两处机制时点不同，已查清。）**
- 台账的**列级归属只有一句文本约定**，没有工具校验（`preset-release` 的"一条不能被违反的边界"在这一格上是 prose）：报告里要求说明"这一行谁写的"，这是唯一的防线。**（已被 §63 取代：裁定先不加机器校验。）**

---

## 63. 复审后的五条裁定：压缩与切片、`enough` 的复看条件、0.9.0（Revision 24，2026-10-19）

**缘起**：S1–S4 落地后 junhan 复审，列出五件待裁项，要求逐项确认。逐项确认之前先做的一件事，是**把上一轮自己写下的"未查清"查清**——它不只决定切片大小，还被复述在六份 skill 正文、两份读者文档和一条由 `toolchain-page --check` 机器校验的断言里。

**查清的那一处**（是更正，不是新发现）：

| 事实 | 出处 |
|---|---|
| 裁剪器**不在结果到达时**生效：`pruneSession()` 只被 `compaction-basic` 在**自动压缩**时调用（`context-overflow` 分支，以及"压力过阈值"分支），把超阈值的结果重写成前 `headChars` + 标记 + 后 `tailChars` | `dsh-compaction-tool-result-pruner/lib/index.js`、`dsh-compaction-basic/lib/index.js` |
| 单条命令的输出另有一道更早的：超过 `maxOutputChars`（默认 **16,000**）截到前 16,000，带 `<response clipped>` 说明，全文落 spill 文件 | `dsh-tool-pwsh-persistent/lib/index.js` |
| 于是那次 14,999 字符"完整到达"两个原因同时成立：低于 16,000，且当时没有压缩 | 本会话实测 |

**裁定**（均取推荐项）：

| # | 项 | 裁定 |
|---|---|---|
| 1 | 切片与压缩 | 保持 12,000，**不改组合阈值**；错误表述全部更正，并加硬要求：被压缩过的片按 `--offset` 重取，**不得凭记忆引用** |
| 2 | `enough` 的复看条件 | `park`、`stop` 与**没读到全文的 `enough`** 必填；`depth: full` 的 `enough` 可空——在那里填只会填出空话 |
| 3 | 版本 | 发 **0.9.0**：单独版本提交 ＋ 注解 tag ＋ 从远端复核 |
| 4 | 旧工作区的 `refs/` | 纪律**报告但不删**；不做迁移，不动用户数据 |
| 5 | 列级归属的校验 | **先不加**机器校验 |

**否掉的方案**（记下来，防止再提）：

- **把 `thresholdChars` 抬到 16,000**：那是改组合运行行为，且只对 ≤16,000 的片有效；压缩时保留更多文本会让压缩更早触发。
- **把纪律默认切片降到 7,000**：低于 8,192 便永不触发裁剪，但一篇 40k 字符的论文从 4 片变 6 片，且仓库里从此有两个切片数字。
- **`enough` 与 `park`/`stop` 一样全部必填复看条件**：会催生"如有需要再读"这类填充语；一个填满空话的格子比空着的更糟。
- **为"这一列谁写的"加 `tools/ledger-check.mjs`**：能加的窄校验只管格式与闭集，管不了归属——而风险说的正是归属。

**实现**：

- `cb60923` — 更正机制表述：六份 skill 正文（`reading-triage`、`section-notes`、`literature-recon`、`adoption-ruling`、`subagent-contract`、`experiment-protocol`）、`docs/coverage.md`、`docs/toolchain.md`（由 `toolchain-page.mjs --write` 重新生成，24 条断言仍全部有据）、`docs/plans/reading-triage.md` 的风险 7 与 §4.1；`arxiv.mjs` / `metadata.mjs` / `zotero-read.mjs` 的注释与 `zotero-read-selftest` 的一条断言说明。`reading-triage` 新增两条硬要求：报告**读到的 offset 区间**（取代"实际读到多少字符"）、**不得从被裁的片里引用**标题或句子。
- `69893d2` — 契约升 **Revision 24**：`re-open if` 的必填范围收窄到"停得早于全文"，并补给旧工作区残留 `refs/` 的处理（报告不删）；§4 `triage` 一条写明必填范围，§7 加一段；`literature-recon` 加"报告但不删"的护栏；台账 README 的列说明、`reading-triage` 的裁决表与检查单同步。

**未做（已裁定不做）**：复用的成本对比仍只是估算（一次 `--item` 调用 vs 首次读 40k 字符正文的 5–8 次切片），没有在同一条记录上实测过。junhan 2026-10-19 裁定：**不需要这个精确数字，不实测**。理由是它不改变任何一条纪律的行为——纪律要求的是"先调 `--item` 看记录上已有什么"，全仓没有任何一处写"这样更省"的量化断言，所以缺的只是一个优化判断的输入，不是一条待兑现的承诺。日后若真有人要回答"扩面复用到底省多少"，实测入口仍在这里：同一条记录上，一次 `--item` 对比首次通读的切片数。

---

## 65. 名册要两层：名单写在代码里，需求侧从纪律正文推出（2026-10-19）

**缘起**：junhan 问"转存 PDF 那个功能的现状"。查现状时顺手核了 `release-check.mjs` 的
`REQUIRED_HELPERS`——那张"缺了它，发布件里通道就不工作"的名册（`--tag` 模式逐条抓取它列的路径）——
发现它**列着 `zotero-link-snippet.js`**（一条 agent 永远不会跑的 in-app 片段），却**不列**
`zotero-link-attachments.mjs`，也不列任何写侧 helper。

**先验前提（实测，不是推断）**：

| 事实 | 是怎么知道的 |
|---|---|
| 纪律正文点名了 8 个 helper，其中 5 个不在名册里 | `{{presetTools}}/<name>` 计数：`zotero-read`(14) · `metadata`(10) · `zotero-section-note`(7) · `zotero-pdf`(5) · `zotero-write`(3) · `arxiv`(2) · `zotero-edit`(1) · `zotero-note`(1)；名册当时只有 6 条，含 `metadata.mjs` 在内 5 条缺席 |
| **发布件不缺件**——这是检查的视野问题，不是坏件 | 逐条 `git cat-file -e v0.9.0:<path>`：13 条全部在 |
| 同类的上次修补只修了"那一轮看见的那一个" | `6f80323` 补 `zotero-pdf.mjs`，其提交信息自己写着"名册式检查看不见自己名册之外"，然后留着一整类没动 |

**裁定**：名册**扩到 13 条**（补 `metadata.mjs` ＋ 六个写侧/转存 helper），并**加一层需求侧推导**：
`namedHelperProblems(texts, roster)` 从纪律正文的 `{{presetTools}}` 令牌取出"agent 被指使去跑什么"，
名册不含即 FAIL。护栏刻意窄：只认那一个令牌（纪律寻址 helper 的唯一合法方式），裸路径的散文归文档问题，
不对"像路径的字符串"做正则——判据一宽，就会在 fixture 与示例上开火。

**否掉的方案**：

- **只补条目、不加推导**：那正是 `6f80323` 的修法，下一次新增 helper 会再漏一遍。
- **让护栏扫 README／注释里的路径**：会把"文档提到过"和"命令交给 agent"混成一类，且必然命中 fixture。
- **让护栏扫 `contact-bridge.js` 的提示行**：那条命令行没有令牌，为它放宽判据等于把窄护栏变宽；它的问题
  是另一类，见本节末。

**实现**：`6f08057` —— [`tools/release-check.mjs`](../tools/release-check.mjs)（名册 6→13 · 新函数 ·
`--local` 增一行报告）与 [`tools/release-check-selftest.mjs`](../tools/release-check-selftest.mjs)
（新第 5 节：四条反向控制 ＋ 名册路径存在性）。验证：自测 PASS · `--local` PASS（干净树）· 对已发布件
反向验证 **13/13 OK**。**通道说明**：`--tag` 的 HTTP 路径在本机不通（`fetch failed`，即 §11 记录的
`raw.githubusercontent.com` 不可达），故改用 tag 对象核同一命题——这仍是"对着发布件"而不是对着工作树。

**同轮修掉的第二处（表面规则）**：`contact-bridge.js` 的转存提示行原本写
`node tools/zotero-link-attachments.mjs --target <directory>`——**相对路径 ＋ 占位符**。同段 section 的
helper 行本就要求绝对路径（"a relative `tools/...` path does not resolve in a study workspace"），
`.agents/skills/preset-release` 的表面规则表也把"skill 或提示行里的相对 `tools/...` 路径"列为会悄悄坏的一类。
改为 `node "<cliToolsDir>/zotero-link-attachments.mjs" --target "<configured directory>"`（`1f33fe1`）：
两个值本来都在手边——前者来自本模块自身的 URL，后者来自设置行——把补全留给 agent，就是交给他一条在他
通常所在的工作区里跑不通的命令。

**顺带核到、但未改**：[`README.md`](../README.md) 的 Configure it 一节给属主的两条示例命令也是仓库相对
路径（`node tools\zotero-link-attachments.mjs --target D:\Zotero`）。它的读者是站在检出目录里的人，
与"agent 在课题工作区"不同，故本轮不动；若日后发现有人在课题工作区照抄，按同一理由一并改。

---

## 66. 跨篇轮次不按篇数分派，按本轮读进去的源文本分：8 片预算 + 摘要筛选（2026-10-19）

**起因**：junhan 问"渐进式读取之后，'三篇起就派子代理'这条是不是显得严苛了"。核下去发现它不只是一条
过时的数字：三处文本写着同一件事（[`section-notes`](../skills/section-notes/SKILL.md) §8 ·
[`adoption-ruling`](../skills/adoption-ruling/SKILL.md) §7 · [`coverage.md`](coverage.md) §9），
原始裁定在 §37（2026-10-16），**早于**梯级的 Revision 17（10-18）与 `reading-triage` 的 Revision 23
（10-19）。范式换了，判据没换。

**先验（本轮实读源码与结果输出，不是回忆）**：

| 事实 | 出处 |
|---|---|
| `--fulltext` 在切片**之前**打印 `text: N characters` 与 `rung:` 行 ⇒ 一次调用同时给出全文长度、索引这一级答不答得出、以及论文自己的摘要 | `tools/zotero-read.mjs` · `text   : … characters` |
| `depth: abstract` 是一等档位，但判决表里**没有合法的 verdict**（`park` 要 `—`、`stop` 要 `§N`），而模板自己的示例行写着 `B \| abstract \| park` 与 `B \| abstract \| stop`，`reading-triage` §4.2 又要求"只有摘要时 → `park`" | 四处互相矛盾 |
| 分派只省"读"这一项：父代理每条笔记仍要干跑 + 授权 + `--write` + 回读，这一半一分不省 | `section-notes` §8 |
| 真实的多篇轮次一次都没跑过 | §37「批量 fan-out（≥3 篇）未跑」 |

**裁定（junhan 逐项确认，均取推荐项）**：

1. **预算 = 8 片（≈96,000 字符）源文本／轮**，筛选的片计入。定这个数的硬理由：它高于实测最大单篇
   （88,000 字符）⇒「单篇永远 inline」这条行为自动保留；它又正好是 8 × 工具一次返回的 12,000。
2. **`park` 与 `stop` 允许 `depth: abstract`**；`enough` 仍要求 `§N` 起——摘要能判一篇出局，不能判
   "这个问题够了"。
3. **规则以 `reading-triage` §3.8 为唯一真源**，`section-notes` §8 与 `adoption-ruling` §7 改成指针。
   三份拷贝只会继续漂（今天三处措辞就已经不同）。

**否掉的方案**：把 3 改成 5（同类机械代理量，只换数字）· 保留篇数但加"单篇例外"（两套判据并存）·
新增批量读工具（一批 5 篇 ≈15k 字符、5 次单调用，批量省不了什么，而"no new tool, and none is needed"
是这个仓更贵的先例）· 给 `--item` 加 abstract 行（那是元数据字段，可能被手工改过，与"读了论文自己的
摘要"不是同一证据等级）· 让 `literature-recon` 写筛选判决（那会把它重新变回"决定是否值得读"，正是
Revision 22 划走的职责；判决归读轮）。

**落点**：[`reading-triage`](../skills/reading-triage/SKILL.md)（新 §3.8 · §3.2 判决表 · §4.1 · §4.2 ·
§5 · §6 · §7 · §8 清单 · §9）· [`section-notes`](../skills/section-notes/SKILL.md) §8 ·
[`adoption-ruling`](../skills/adoption-ruling/SKILL.md) §7 · [`coverage.md`](coverage.md) §9 ·
[台账 README](../project-template/research/literature/README.md)（判决表 + 谁写筛选判决）。
**`protocol.md` 不升版**：判决表的枚举与这条分派规则都不在契约里，契约只要求"台账记 `depth` 与
`verdict`"；`INV-EVID-6` 不变。

**未测／边界**：8 片是**推导值**（单篇上界 88k 与 12k 切片的整数倍），不是实测出来的最优档；这条规则
至今没在真实的多篇轮次上跑过，它的第一次执行同时就是它的第一次验收。筛选 5 篇 ≈15k 字符是估算
（每篇约 3k 输出），未在真实队列上计时。

---

## 64. 废除 digest、保留两套裁定、A/B/C 定义收敛（Revision 25，2026-10-19）

**缘起**：junhan 盘这套预设时提出三件事——(1) digest 生成规范还在，但已经有逐节笔记，"感觉鸡肋"；
(2) "裁决笔记"也像鸡肋，因为他自己按 `doc/<课题>/references` 安排哪些文献值得参考；(3) A/B/C 评级
标准是从哪来的，值得保留。

**先验（本轮实读，不是回忆）**：

| 事实 | 出处 |
|---|---|
| digest 在真库 **0 条**，回收站也是 0 | [`plans/note-pipeline.md` §2](plans/note-pipeline.md) · 本文 §58 |
| digest 的定义禁止它引入节笔记没有的事实 ⇒ 信息量 ≤ 节笔记 | `skills/section-notes/SKILL.md` §4（删除前） |
| 没有纪律把它当主输入：`reading-triage` 禁止凭它判 `enough`，`adoption-ruling` 以节笔记为 primary input | 两份纪律 §3.4 / §2 |
| 写一次 digest = 两次库写入（retired 快照 + PATCH），刷新会累积墓碑 | `protocol.md` §6（删除前）· `plans/note-pipeline.md` §12.3 |
| 两套裁定早已是"按需、不进主流程"，不加载时零成本 | `plans/note-pipeline.md` §14 裁定 8 · `cordis.patch.yml` 路由 |
| A/B/C 是本预设自定，不是外部量表；Rev 22 把 `A` 从"读了全文"改成"读了这句话靠的那几段" | `skills/literature-recon/SKILL.md` §3.1 · 本文 §62 S1 |

**裁定（junhan 逐项确认）**：

| # | 项 | 裁定 |
|---|---|---|
| 1 | digest | **彻底删除**（不是降级为可选）：不再有任何纪律步骤、不变量或工具写它 |
| 2 | 两套裁定 | **都保留**，补"按需、不是读文献的步骤"的触发边界 |
| 3 | A/B/C | **保留定义，收敛到单一权威源**：`literature-recon` §3.1 是定义，其余四处改成引用 |
| 4 | `doc/<课题>/references` | 他的工作区里 Markdown 笔记与索引都有；那是 study 自己的布局，预设不改模板 |

**否掉的方案**：

- **digest 降级为可选**：仍留一条"什么时候该写"的判断与一次两写的路径，而它的信息量上限就是节笔记；
  0 条使用说明它不会被写。
- **A/B/C 加工具枚举校验**：与 §63 裁定 5（列级归属先不加机器校验）相抵，且工具不是 `grade` 的写者。
- **删掉两套裁定**：它们不占运行时成本，且是"结论要对抗""代码要有数值锚点"的唯一闸门。
- **把 `doc/<课题>/references` 写进模板**：那是 study 的布局；契约已有"已有层级优先"（§2）。

**实现**：

- 契约升 **Revision 25**：删 §6 的 digest 条款、§8 的 `INV-NOTE-2`、`INV-EVID-4` 里的"projection"；
  §4 的 `sections` 行与 §6 的标签清单同步；`/digest` 只作 legacy 识别（旧笔记不算覆盖、不可 claim、
  不再写）。
- `skills/section-notes`：删原 §4（digest 一节），后续编号顺延；frontmatter、报告、清单、Don't 同步；
  §2 的 plan 输出加 `legacy` 行。
- `skills/literature-recon`：删 §7 的 digest 步骤与 §4.2 的"补 `/digest` tag"规则；§3.1 声明
  "这张表就是定义，其他文档只引用"。
- `skills/reading-triage` / `skills/adoption-ruling`：`grade` 定义改成指向 `literature-recon` §3.1；
  plan 输出 `digest` → `legacy`；删 digest 相关句子。
- `skills/redteam-ruling` / `skills/adoption-ruling`：各加一段 "On demand, never a step in reading"；
  `docs/coverage.md` 加同一条。
- `tools/zotero-note.mjs` 与其自测**删除**；`release-check` 与 `zotero-local-api-selftest` 的名册同步；
  `zotero-section-note.mjs` 保留 `/digest` 的**只读 legacy 识别**（只防止旧整篇总结被当成节笔记/
  覆盖，不写、不刷新）。
- `docs/toolchain.md` 由生成器重写；`README.md` / `docs/overview.md` / `docs/coverage.md` /
  `surface.md` / 台账 README 同步；`docs/plans/note-pipeline.md` §5 标为历史。

**未做／边界**：

- **没 bump 版本、没打 tag**：这是契约修订；版本提交与发布按 `preset-release` §7 单独走。
- 别的库可能仍有 `/digest` 笔记：工具只认、不算覆盖、不迁移、不删除；本库 0 条。
- 删掉写入路径后，旧 digest 只能手工改；纪律已禁止再写，所以这不是日常路径。


---

## 67. 脚手架只留唯一确定的一层：`references/`，其余交给"第一次写它的人"（Revision 26，2026-10-19）

**起因**：junhan 说模板和他真实课题的形状"压根不一样"，准备把自己仓库里的研究区规划整个删了重来；
他最关心的两点是**参考文献的渐进式读取**与**布局**。所以这一刀不是"把模板做全"，是"把模板里没人用过的
部分剪掉"。

**先验（本轮只读核对，不是回忆）**：

| 事实 | 出处 |
|---|---|
| 模板预建 7 个层（`adoption/` `rulings/` `journal/` `experiments/` `pitfalls/` `archive/` `owner_actions.md`），两个真实课题**一个都没用** | `doc/<课题A>/` 与 `doc/<课题B>/` 的目录列表 |
| 只有 `references/` 在两边各有一份**可比的层定义**，且两份 `README.md` 规则一致：非规范、只指向、照抄等级、不新增判定、不改写被指向的笔记 | 两份 `references/README.md` |
| 目录名另有重叠（`audit/` `design/` `prospects/` `specs/`），但 A 没有课题根 `README.md`，那几层在 A 侧没有可比的层定义 | 同上 |
| `AGENTS.md.template` 的 17 处 `research/` 路径与两个真实课题**零重合** | 模板全文 vs 两个课题的目录 |
| 护栏一直"绿着不真"：`scaffold-selftest` 只比三份名单**互相一致**，不比它们是否描述真实用法 | 三处名单长期一致，而两个课题一处都没用上 |
| 台账两套词表（`depth`／`verdict`）在模板 `literature/README.md` 里有第二份拷贝 | 与 Revision 25 定下的"定义只在纪律里"相抵 |

**裁定（junhan 逐项确认）**：

1. 模板只留 **`references/`（`README.md` + `ledger.md`）、`00_scoping.md`、`.section-notes/`**。
2. **`AGENTS.md` 整份不进模板**：不变式、权威顺序、记号只能由属主写；预填的骨架会被当成权威表读。
3. **去掉 `research/` 这层包装**：层直接落在课题根。
4. **层根规则**（替代"课题声明"这层间接）：`<study>/research/` 存在就用它，否则用 `<study>/`；
   两种同时存在 ⇒ **停下问**。它由文件系统可判，不需要先读某份文档。
5. 其余层**不预建**，由第一次往那里写的纪律创建，并在报告里写出用了哪个路径。

**否掉的方案**：14 个文件全量重写成 `doc/<课题>/…`（把一个课题的形状换成另一个课题的形状，是同一类错误）
· 保留 `AGENTS.md.template` 只改内容（预填的不变式会被读成权威）· 用"课题声明文件"做路径间接（多一层要
先读的文档，而目录结构本身可判）· 把两套词表留在模板里（第二份拷贝就是第二个要维持的真相）。

**实现**：

- 契约升 **Revision 26**：§7 换成新布局块 + "层根"两段；权威顺序一段补"没有约束文件时，需要不变式的
  那一轮说它缺并停下"。
- `project-template/`：新增 `references/{README.md,ledger.md}`；`00_scoping.md` 上移到根；
  删除 `AGENTS.md.template`、`.agents/`、`research/` 全部；`README.md` 改写成"先写 `AGENTS.md`"的入口。
- `tools/scaffold-selftest.mjs`：解析器从 `research/` 起点改为 `<study>/` 根；名单降为两份（§7 + README）；
  **S5 反转**为"模板里不许有 `AGENTS.md*`"；**S3 加强**为"名单点名的文件也必须在盘上存在"（原来带扩展名的
  一律跳过）；S2 覆盖根级文件（`README.md` 显式豁免）。
- `tools/new-project.ps1`：删改名段；"Next:" 改为"先写 `AGENTS.md`"。
- `tools/doc-selftest.mjs`：**DOC-1 收紧**为"作为词提及"，不再是子串命中——`.section-notes/` 是路径，
  把它当成纪律名提及会让契约无法描述自己的布局。负控制仍用"注入一个符号"验证它还能红。
- 10 份纪律的 26 处 `research/` 路径改为层根相对路径；4 处对课题 `AGENTS.md` 的引用改为"若有"。

**落点**：[`protocol.md`](../protocol.md) §7 · [`README.md`](../README.md) 布局块 ·
`project-template/` · [`scaffold-selftest`](../tools/scaffold-selftest.mjs) ·
[`new-project.ps1`](../tools/new-project.ps1) · [`doc-selftest`](../tools/doc-selftest.mjs) ·
[`coverage.md`](coverage.md) · [`revision-26.md`](plans/revision-26.md)。

**未做／边界**：

- **旧课题零迁移**：不删、不搬、不改写；有 `research/` 的课题由层根规则指回原处。
- 新课题在属主写出 `AGENTS.md` 之前**没有不变式可读**，这是已知且已接受的代价；两处提示 + 纪律不编造。
- 没有拿一个真实新课题跑过 `new-project.ps1` 的完整流程（只做了 `-DryRun`）；
  "层根规则"只在文件结构上推理过，还没被一次真实纪律执行踩过。

---

## 68. 新增第十二条纪律：把"一个分类"变成"一个具名课题的候选队列"（Revision 27，2026-10-19）

**起因**：junhan 最关心的两件事之一，是**参考文献的渐进式读取**。核下去发现读取这一段有三条纪律
（分级、逐节推进、节末写笔记），**缺的是入口**：没有任何东西把"这个分类里的文献"变成"这一轮该读哪几篇、
按什么顺序、哪些已经在摘要这一级被排除了"。结果是分类被按库里的排列顺序读，或者手工筛一遍而什么都不留。

**先验（本轮实测，不是回忆）**：

| 事实 | 出处 |
|---|---|
| 本地 API **支持 `start` 分页**（`start=5` 与 `start=12` 返回不同的行） | 2026-10-19 直接请求 `/api/users/0/collections/<key>/items` |
| **父分类不含子分类条目**：问一个子分类里共 46 条的父分类，items 端点答 `total 0` | 同上 |
| 分类树里的件数与 items 端点的 `total` **不是同一个数**（同一个分类 13 vs 33），后者把 notes/attachments 也算了 | 同上 |
| 11 份纪律里 `collection`／`分类` **零命中** | 全仓 grep |
| 两个真实课题的 `references/` 都已有入口文件（A 的 `zotero_anchor_map.md`、B 的 `zotero_anchor_set.md`，B 记 14 叶），A 的 `reading_ledger.md` 已按 `reading-triage` 的词表写读态 | 两个课题的 `references/` |

**裁定（junhan 逐项确认）**：

1. **新增纪律**，不塞进 `literature-recon`：语义清晰优先，且检索轮不该开始写读态判决。
2. **单位是（分类 × 课题）**；一行台账仍是（论文 × 课题）。同一分类被第二个课题扫是新的一轮。
3. **词表照抄 `reading-triage`**，不加新词：出局＝`stop`、排队＝空 `verdict`、读不了＝`park`；
   `enough` 永不写在摘要上。
4. **筛掉的也要一行**：`depth: abstract` · `verdict: stop` · `basis` 指到摘要哪句。
5. **不建 `corpus/` 目录、不建"一分类一文件"**：可持久形态就是台账行 + 锚定集补行。
6. **章节笔记仍只在方法节末由 `section-notes` 写**，本纪律只把论文送到那一步之前。

**否掉的方案**：把入口塞进 `literature-recon`（一场检索和一个分类扫描的产物不同，混在一份纪律里会让
"这一轮写了哪些行"说不清）· 新建 `corpus/` 目录装分类快照（第三份真值）· 给扫描另造词表（两套词表就是
两套要维持的真相）· 用 `--fulltext` 逐条取摘要（34 篇 ≈10 万字符，比整轮预算还大）· 让 `--collection`
自动翻页（**已改**：`--screen` 翻页，普通列举改为在截断时**响亮报出** `truncated`）。

**落点**：[`skills/collection-sweep/SKILL.md`](../skills/collection-sweep/SKILL.md) ·
[`protocol.md`](../protocol.md) §4 + Revision 27 · [`cordis.patch.yml`](../cordis.patch.yml) 路由一条（11→12）·
[`surface.md`](../surface.md) · [`coverage.md`](coverage.md) ·
[`zotero-read.mjs`](../tools/zotero-read.mjs) `--collection --screen` ·
[`revision-27.md`](plans/revision-27.md)。

**未测／边界**：

- 新纪律的第一次真实执行就是它的第一次验收；本轮只做了一次**只读试扫**（一个 13 条的分类），
  没有写过任何一行台账、没有碰库。
- `--screen` 的 `INCOMPLETE` 分支只有上限 2000 行这一段代码，没有被一个真的超大分类触发过。
- `--screen` 不解码 HTML 实体（`&amp;` 原样打印）：摘要里出现实体时，读者看到的是实体。

---

## 69. 台账是课题自己的文件，模板里的 `ledger.md` 只是空壳（Revision 28，2026-10-19）

**起因**：发布前核对两次改动（Rev 25 删 digest / Rev 26 收脚手架 / Rev 27 加初筛）时发现一处接缝：
Rev 26 的模板给了 `references/ledger.md`，而四条纪律与覆盖地图都说台账是 `references/<topic>.md`；
契约 §7 那句 "empty until a reading fills it" 又把 `ledger.md` 说成会被填的那份。一个刚脚手架出来的课题，
第一轮会新建 `<topic>.md`，`ledger.md` 永远空着——而**没有任何纪律点名 `ledger.md`**。

**先验**：`ledger.md` 只出现在 `README.md`、`protocol.md` §7、`project-template/README.md` 三处；
`<topic>.md` 出现在 `literature-recon` §6、`coverage.md` §1、`reading-triage` 与 `adoption-ruling`
的台账落点共四处。冲突时契约赢，所以照字面执行反而会让四条纪律"错"。

**裁定（junhan 选 1）**：`ledger.md` **只作骨架**；第一轮把它复制成 `<topic>.md`，此后只写 `<topic>.md`。

**实现**：

- 契约升 **Revision 28**：头段说明这份文件是谁的，§7 布局块那一行改为"the first reading copies it to
  `references/<topic>.md`"。
- `README.md` 布局块、`project-template/README.md` 的入口第 3 条、`project-template/references/README.md`
  两处（开头与台账段尾）同步；`coverage.md` §1 补一句"空壳，不往里写行"。

**未做／边界**：

- 不改文件名、不迁移旧课题：已有 `references/<topic>.md` 的课题不受影响；旧课题若在用别的文件名，
  "已有层级优先"照旧。
- 没有新增护栏：`ledger.md` 是否被误填，只能靠纪律与阅读，机器校不了这一句。

## 70. 章节笔记的默认路径翻成 claim：外部贴入的笔记只打 tag，生成只在属主点名时跑（2026-10-20）

**起因**：junhan 决定章节笔记全部由他从网页版 DS 生成、贴进 Zotero，本地 agent 只做三件事——读、
claim、报缺口。按 PDF 生成的能力保留，但不再提示（"软删除"）。

**先验**：`--claim` 早在 Revision 17/19 就是规范条文（"a pasted note is claimed or rewritten in
place"），所以这次**没有新增语义**，只翻了默认路径。旧形状的两个代价：一是 `section-notes` 的
360 行正文里绝大部分是**写入标准**，只做一次只读清点也要整份加载，且正文会把 agent 拉去写；二是错
claim 的代价不对称——已 claim 的节被工具永久拒绝重复创建（`REFUSED: §N is already covered`），而
`INV-ADOPT-2` 会让后续借鉴引用那条笔记、不再回读原文。所以"缺一条"比"错一条"便宜。

**裁定**：

1. 一个技能、两段：**Part I = claim + 报缺口（默认）**，**Part II = 生成（仅属主点名某一节时）**；
   §0 的硬闸放在任何写入性内容之前。
2. 生成从 persona 的路由触发里拿掉，只在技能描述里写明"仅显式要求"；目录里仍看得到它。
3. `## Owner actions` 与 `owner_actions.md` 一并删除（Revision 26 只把它改成"按需创建"，文件还在）。
   缺口从 tag 就能重算，落盘只会过时。
4. ~~`protocol.md` **不动**：claim 是现行条文，翻默认路径不属于规范变更。~~ **发布前的反向重扫推翻了这一条**：契约 §4 的第一句陈述的是**触发**（读轮刚读完就生一条），默认翻过来后它对默认路径已经错了。见 §71。

**实现**：`skills/section-notes/SKILL.md`（描述、§0、§1、§2.1 的 claim 判据、§6.1/§6.2、§8.1/§8.2、
§9 三条 Part I 禁则）· `cordis.patch.yml` 的路由 bullet · `docs/coverage.md` 该行 · `README.md`
的参考库段落。

**未做／边界**：

- 不改 `--claim` 的语义：仍是 tag-only、一次一条、干跑先、要属主授权；也不新增技能，所以
  `skills-selftest` 的 12 份与 `preset-selftest` 的 12 条 routing bullet 都不用动。
- claim 轮**不写台账 `depth`**：claim 说明"这一节有解释挂着"，不等于"这次会话读过这篇论文"。
- 子节键（旧工具写的 `/section-N.M`）在 claim 轮只报告，不合并；合并与退休留在 Part II 或属主手里。
- 不改写历史文档（`docs/plans/*`、`docs/releases.md`、本文件旧条目）。
- 发布前的反向重扫又命中两处散文（`docs/coverage.md` 的读轮步骤与 §6 的门、`docs/overview.md` 的产物列），
  随 §71 一并改。

## 71. 发布前的反向重扫推翻了 §70 的"不动协议"：Revision 29 改的是触发句（2026-10-20）

**怎么发现的**：§70 裁定"`protocol.md` 不动"，理由写的是"claim 早在 Revision 17 就是条文，翻默认路径不属于
规范变更"。这一轮发布前按 `preset-release` §2 做反向重扫——先把改动写成一句话（*启动一条节笔记的不再是读轮读完
一个方法节，而是属主点名那一节*），再逐份读者可见的文件搜这句话的旧形状——`protocol.md` 命中两处：修订史里
"Revision 23 … what starts a section note is the end of a method section in a reading round"，以及 §4
`sections` 条目的第一句"a method section a reading round has just finished becomes one `/section-N` note"。

**为什么 §70 的理由站不住**：§70 说的"claim 早就是条文"没错，错在把"默认路径"只当成路由与技能文本的排布。
契约 §4 那一句陈述的是**触发**——读轮刚读完就生一条笔记。默认翻过来之后，这句话对默认路径已经错了；而契约与
实现冲突时契约赢，所以只能改契约，不能用"claim 已经在里面"绕开。`preset-release` §2 的原话是"退役的说法不许
作为降级版本活下来"。

**裁定（Revision 29）**：

1. §4 `sections` 改成：一条 `/section-N` 笔记**只在属主点名那一节时写**；外部贴入的笔记 claim 到它自己标题
   写明的节（只打 tag、不动正文）；只做 claim 的轮次**报出仍缺笔记的节，不代写**。
2. 头部立 Revision 29，把两条理由写进契约本身：claim 只说明"这一节有解释挂着"，不等于这次会话读过（故 claim
   轮不写 `depth`）；错 claim 是永久的（已 claim 的节被拒重复创建，`INV-ADOPT-2` 让后续引用那条笔记、不回读
   原文），缺一条可以下轮补。
3. 修订史里 Revision 23 那一句改成"…and Revision 29 moves it once more, to the owner naming that
   section"——历史句留在原处，但不再单独成立。

**同一轮修掉的散文命中**（不改契约）：`docs/coverage.md` 的读轮步骤仍写"每读完一个方法节…写一条"，且 §6
"写哪些节"没有门；`docs/overview.md` 的产物列写"每个顶层方法节一条"，读起来像本轮会逐节生成。

**未做／边界**：`--claim` 的语义没动（tag-only、一次一条、干跑先、要授权）；技能结构没动（§70 的 Part I /
Part II 仍是实现）；`docs/plans/*` 与本文件旧条目不改。

**落在何处**：[`protocol.md`](../protocol.md)（头部、修订史、§4 `sections`）· [`docs/coverage.md`](coverage.md)
（读轮步骤、§6 的门）· [`docs/overview.md`](overview.md) · 本文件。

## 72. Revision 30：补回 0.11.0 漏扫的四份纪律，删掉 owner-action 层的最后影子（2026-10-20）

**起因**：junhan 盘问两件他记得的事是否打架——(1) 章节笔记由他从网页版 DS 生成、agent 不自生成；
(2) 各课题自己维护台账，读文献时发现想深读但笔记不够就自己补。排查结论：台账那条（§62／§69）没变，
两条原则本身不冲突；但"读轮自己补笔记"的旧默认确实还活着，而且其中一条会把 §70 反着执行。

**先验**：§70／§71 已把契约（§4 `sections`、头部、路由 bullet）与 `section-notes`、`README.md`、
`docs/coverage.md` 的读轮步骤、`docs/overview.md` 的产物列同步到"属主点名才生成"。未同步的是四份纪律的
技能正文：[`reading-triage`](../skills/reading-triage/SKILL.md) §3.5(4) 仍写"方法节读完且继续 → write its
`/section-N` note"，§7 重述同一触发；[`collection-sweep`](../skills/collection-sweep/SKILL.md) §3.5 仍把
"读完节末写一条"当事实，§4.2 的停止条件甚至规定"属主现在要写笔记 → **Refuse**"——正好把 §70 反着执行；
[`adoption-ruling`](../skills/adoption-ruling/SKILL.md) §4.2 让借鉴轮直接"Read the sections … that is
`section-notes`' work"。[`docs/coverage.md`](coverage.md) 的读轮步骤被 §71 改了一半，第一句仍写"这一节要有
一条"。另有 owner-action 层的四处影子：契约 §7 两处、模板 `references/README.md` 一处、工具提示一处——该层
自 Revision 26 起已无纪律写入，§70 第 3 条也删掉了 `## Owner actions` 与 `owner_actions.md`。

**为什么自测没抓**：`doc-selftest` 校名册、路径与分工，不校触发语义；0.11.0 发布前的反向重扫只扫了
`protocol.md`、`coverage.md`、`overview.md`（[`releases.md`](releases.md) §72），四份纪律正文不在扫描范围。

**裁定**（junhan 选"硬矛盾 + 半矛盾 + owner-action 残留"，语义保留 Part II）：

1. 触发口径不动：笔记正文**只在属主点名某一节时**由 `section-notes` 生成；读轮、初筛轮、借鉴轮只报缺口，
   不代写，也不拒绝属主的正当点名。
2. 改 `reading-triage` §3.5(4)（读轮不产笔记、只报复用与缺口）、§3.7（笔记只存在于属主点名的节）、
   §7（同一句）。
3. 改 `collection-sweep` §3.5（笔记由属主点名 + `section-notes` 才存在，读完一节不产生）与 §4.2
   （"现在写笔记"不再是拒绝，而是"本轮不写、指向 `section-notes`"）；§1 的一句同步。
4. 改 `adoption-ruling` §4.2（有笔记读笔记、没笔记报缺口）与 `literature-recon` 的同一句中缀。
5. `docs/coverage.md` 读轮步骤改成"只报这一节有没有笔记，不代写"。
6. 契约升 **Revision 30**：§7 删掉 owner-action layer；模板 `references/README.md` 与
   `tools/zotero-section-note.mjs` 的 retire 提示同步。没有语义变更，是让契约与实现追上 §70／§71 的裁定。
7. `docs/overview.md` 与 `cordis.patch.yml` 的路由 bullet 已正确，不动。

**未做／边界**：`docs/plans/*`、`docs/releases.md`、本文件旧条目不改；协议头部的 Revision 27 段仍写"a note
is written at a method section's end"——那是修订史里的历史句，不单独成立；触发语义仍是散文，能机械校的只有
名册、路径与分工，这条边界不变。

**落在何处**：[`protocol.md`](../protocol.md)（头部、§7）· [`skills/reading-triage/SKILL.md`](../skills/reading-triage/SKILL.md)
· [`skills/collection-sweep/SKILL.md`](../skills/collection-sweep/SKILL.md) ·
[`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md) ·
[`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) ·
[`docs/coverage.md`](coverage.md) · [`project-template/references/README.md`](../project-template/references/README.md)
· [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)。

## 73. Revision 31：把第 17 版自己写下却漏掉的那一级补回契约，并让 §7 的两句话追上脚手架（2026-10-20）

**起因**：junhan 在 §72 之后问"能不能系统排查一遍还有哪里不一致、或与先前拍定的原则不符"。排查按判定表做：
先立一张"契约拍定的语义 × 12 份纪律 × 6 份读者文档 × 组合与模板 × 工具自述"的对照，再逐条对撞，最后用
反向重扫（把结论写成一句话，去搜它的旧形状）。共命中 14 处：硬矛盾 6、半矛盾 4、措辞 4。机器侧先跑过
`doc-selftest` 11/11、`toolchain-page --check` 23 条、`scaffold-selftest` 6/6，全绿——所以这 14 处**全在仪器
射程之外**，这正是它们能活下来的原因。

**先验**（每条都落到行）：①读的阶梯——契约只列三级（§6 的 bullet、`INV-CTX-1`、Rev 17 段落），而
[`zotero-pdf.mjs`](../tools/zotero-pdf.mjs) 按四级编号并打印 `rung (2)(3)(4)`、覆盖图照四级写还标"Rev 17 ·
`INV-CTX-1`"、[`backlog.md`](backlog.md) 把 `--outline` 叫"梯级 ③"，而
[`literature-recon`](../skills/literature-recon/SKILL.md) 明写"结构/大纲这一级 **deliberately absent: nothing in
the toolchain offers one**"——三方打架，且那句是假事实。②[`metadata-query`](../skills/metadata-query/SKILL.md) §6
让往台账文件追加四列"证据表"，与九列台账、模板"no new judgement"、覆盖图"不给证据等级"、它自己 §9"不给等级"
四处冲突（Revision 22 把文献纪律的证据表改成台账时漏了这一份）。③[`cordis.patch.yml`](../cordis.patch.yml) 头注
`ten research-discipline skills`，路由块 12 条、`preset-selftest` 断言 12。④契约 §7"Only the literature layer and
the scoping document are created up front"与 README"and nothing else"，而同一节的树、模板与 `scaffold-selftest`
都把 `.section-notes/` 算进布局——散文说两样，机器名单三样。⑤[`collection-sweep`](../skills/collection-sweep/SKILL.md)
§3.5 已改成"点名才生成"，§6.5 仍写"which sections `section-notes` is expected to write"。⑥
[`adoption-ruling`](../skills/adoption-ruling/SKILL.md) 入口要求 `grade A`，§4.2 又让"从原文读"、§2 还写"先跑
`section-notes`"——后者在 Rev 29 之后已不成立；而这次阅读没有任何人写回台账（`INV-EVID-6` 要那一行）。⑦
README 的技能目录实测"20 条 / 8 条本预设"未标日期，现在船上是 12 条。⑧四份纪律引用的 `AGENTS.md §2/§3/§4/§6`
来自 Rev 26 整份删掉的模板，编号悬空，且 §4 在两处指的不是同一件事。⑨§7"退役文档进 archive"没有任何纪律执行，
而 `progress-sync` 的 "archive flow" 指的是 mnemon 的归档。⑩-⑭措辞类：README 的 `--tag v0.2.0` 示例、
`D:\Zotero` 盘符示例、覆盖图两个同名的"阶梯"、§8 表里跳号的 `INV-NOTE-2`、`section-notes` §3.1 仍是"读轮读到哪"
的旧框架。

**为什么自测没抓**：仪器校的是名册、路径、分工与"名字是否还存在"；条数、级数、散文里的行为句都不在其中。三次
陈旧计数（§36／§64／§70）都是发版前通读抓住的，这一轮第四次仍是这样——组合注释从来没进过通读范围。

**裁定**（junhan 选"硬矛盾 + 半矛盾 + 措辞全修"；阶梯选"四级，契约补'论文自带目录'"）：

1. 契约升 **Revision 31**：§6 的 bullet 与 `INV-CTX-1` 补第 3 级"论文自己的目录"，并写明它答结构、不答内容、
   很多论文没有；Rev 31 段落明说 **Rev 17 的段落只列了三级、漏掉同一次修订交付的那一级**——旧句因此不被单独
   读成本条。
2. §7 改成"预先创建的是文献层、scoping 文档与草稿目录（`.section-notes/`）"，并把"one pre-created layer"改成
   "two pre-created directories"。
3. archive 归**属主**：§7 明说移动退役文档是 owner 的动作，轮次发现活指针只报不动（与"移除属主工作区的文件不是
   轮次的动作"同一条理由）；`progress-sync` 里那句"use the archive flow"改成 mnemon 自己的归档，并说明课题
   `archive/` 是另一个地方。
4. §8 表下补一行：`INV-NOTE-2` 随 digest 在 Rev 25 退役，编号不复用——缺口是记录，不是漏行。
5. `metadata-query`：**已在库**的作品才追加台账行（`itemKey` · `year` · `found via`=来源+检索日期，`grade` 与
   `depth` 留空）；**不在库**的作品没有 `itemKey`，只进本轮报告并交 `literature-recon` 决定要不要成行。删掉四列
   证据表与"at most B"那句——等级说的是"读了什么"，元数据什么都没读。
6. `adoption-ruling`：**不读原文、也不触发生成**。grade 不到 A 时报告"这一项依赖哪几节、其中哪几节没有笔记"，
   交回读轮或请属主点名；§2 的"先跑 `section-notes`"改为"请属主点名或开一次读轮"。
7. `literature-recon`：删"nothing in the toolchain offers one"，改成"结构级是 `INV-CTX-1` 的第 3 级，由
   `--outline` 提供，答结构不答内容"，并把"加载多少的花费梯度"与"文本从哪一级来的读取阶梯"分成两个名字。
8. `collection-sweep` §6.5 改成"从论文自己的目录列出它有哪些顶层节——关于论文的结构事实，不是'会有笔记'的承诺"。
9. 四份纪律里 `AGENTS.md` 的 §2/§3/§4/§6 编号去掉，改成"无论那个文件把这几项放在哪"——脚手架不规定章节顺序，
   引用编号就是引用一份没人写过的文件。
10. `section-notes` §3.1 改成本轮只解释被点名的那一节；没被点名的节没有笔记，报告里写"未到达"而不是"不需要"。
11. `cordis.patch.yml` 头注 `ten → twelve`；`zotero-pdf.mjs` 头注 `the two rungs → the three rungs`。
12. 读者页：覆盖图的阶梯归因改 Rev 31、两个"阶梯"分开命名；README 的"and nothing else"改三样、目录实测加口径
    （"when it shipped eight disciplines"）、`--tag v0.2.0 → vX.Y.Z`、盘符示例换成占位符。

**未做／边界**：`docs/plans/*`、`docs/releases.md` 与本文件旧条目不改；**目录实测没有重测**——重测要开两个新会话，
且那条结论是"目录会混"，比例本身不是结论，所以只补口径不造新数字；非库作品的元数据"要不要另存一份"按裁定只进
报告，不引入第三份名单；`docs/` 里 0.9.0 起就随包发出的属主课题真名仍未处理（[`releases.md`](releases.md) §70
已登记）；触发语义、级数这类"散文对散文"的东西依旧没有机械护栏，这条边界不变。**补记（同日，见 §75）**：
`docs/` 里的课题真名已换成代号，理由记在 §75；**计数**这一类现在有机械护栏（`preset-selftest` 的 `[2]`），
但**级数**与**行为句**仍无护栏——上面那句"这条边界不变"应读作"**计数以外**不变"。

**落在何处**：[`protocol.md`](../protocol.md)（头部、§6、§7、§8 `INV-CTX-1` 与表下注释）· 本文件 ·
[`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) ·
[`skills/metadata-query/SKILL.md`](../skills/metadata-query/SKILL.md) ·
[`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md) ·
[`skills/collection-sweep/SKILL.md`](../skills/collection-sweep/SKILL.md) ·
[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md) ·
[`skills/experiment-protocol/SKILL.md`](../skills/experiment-protocol/SKILL.md) ·
[`skills/progress-sync/SKILL.md`](../skills/progress-sync/SKILL.md) ·
[`tools/zotero-pdf.mjs`](../tools/zotero-pdf.mjs) · [`cordis.patch.yml`](../cordis.patch.yml) ·
[`docs/coverage.md`](coverage.md) · [`README.md`](../README.md)。

## 75. 结清 §73 剩下的三笔：一处编号誊写、一条计数护栏、六处课题真名（2026-10-20）

**起因**：0.12.0 发布后 junhan 问"是不是还有待办，讨论一下"。清点下来不是两笔而是三类：**欠的账**（
[`backlog.md`](backlog.md) 的 9 行登记 + 3 行分批余量，各有触发条件，不该现在做）、**我该做但等他点头的**
（计数无仪器、`docs/` 里的课题真名）、以及**§73 自己漏的一处**。三样他全选了。

**先验**（每条都落到行）：

① [`backlog.md`](backlog.md) 第 1 行把"写回库索引"标成**「梯级 ⑤」**——全仓唯一一处 `⑤`。Rev 31 之后读的梯级是
四级；`plans/revision-17.md` §4.1 表里的 `⑤` 是 OCR，且那一格写着"④ 已覆盖同一需求，**不引入**"；更根本的是
写回是**写**，不是"读的一级"。那一行的"依据"列本来就写着「`plans/revision-17.md` §10 裁定 5」，所以它是
一次**誊写**（裁定 5 → 梯级 ⑤），不是一次裁定。§73 扫 backlog 时拿 `--outline` 当锚点去找 ③，对上了就收工，
没把"梯级 + 数字"当成一个待穷举的模式——同型的边角可能还有。

② **计数第四次复发之后仍无仪器**（§36／§64／§70／§73）。[`preset-selftest`](../tools/preset-selftest.mjs)
断言的是"我知道的那十二个名字各有 bullet"，从不断言**散文宣称的数**——所以 0.12.0 之前组合头注写 `ten`、
README 写 `eleven`，套件照样全绿。

③ `package.json` 没有 `files` 白名单，仓库没有 `.npmignore`，`.gitignore` 只挡 `.tmp/`、`.mnemon/`、
`node_modules/` 与 `isolation-report.json` ⇒ **`docs/` 整个随 npm 包与 GitHub 一起公开**。三条课题标题落在
6 处（本文件 3 处、`plans/revision-17.md` 1 处、`plans/revision-26.md` 2 处），0.9.0 起就发出去了，§70 登记过、
两版未处理。

④ backlog 另有两条**前提**被 Rev 31 动了，属记账漂移而非触发成立：#8 的触发条件以"`zotero-pdf.mjs` 57 个会话
0 次"为基线，而 Rev 31 把 `--outline` 写成读梯级第三级；#6 的"20 篇里 11 篇有目录"现在是契约级事实。

**裁定**：

1. backlog 第 1 行去掉"梯级 ⑤"，改成"不在读的梯级里"——写是写，不是读的一级。
2. backlog #8 把旧基线**标为作废**，并写"判这条之前先在新口径下重测"：现在不重算，因为没有新数据，而旧数字
   一旦被当现状读，会推出错误结论。
3. backlog #6 补一句：Rev 31 已把"论文自带目录"写成第三级并明说很多论文没有它，那 9 篇因此是**已裁定的边界**，
   不是遗漏。
4. `preset-selftest` 新增 `[2]`，锚点取 `skills/<name>/SKILL.md` 的**目录数**（它不需要 dump，所以排在 dump
   检查之前，缺失或过期的 dump 不再能连带跳过一个计数检查）：盘上数 = 路由名册数、两边互为子集；再让三处散文
   （组合头注、`package.json` 的 description、README）各自与它比。散文那句被改写而匹配不上时 **FAIL 并提示去教
   这条检查新说法**，不静默通过——停止查看的护栏正是它要防的那种缺陷。十二个名字只留一份（`ROUTED_NAMES`），
   `[2]` 与 `[5]` 共用，因为第二份名单就是漂移的来源。
5. 护栏的射程写进代码注释与本节：它只覆盖**计数**。**级数**（§73 的病：梯级三级还是四级）与**行为句**（§7 的
   病："creates X and nothing else"）仍只能靠发版前通读——**绿灯不是免读证**。
6. 6 处课题标题换成 `课题A/B/C` 与 `doc/<课题A>/` 占位符。**本节不誊写原标题**：誊写等于换个地方再泄漏一次，
   原文只在属主的私有台账。不做 `files` 白名单把 `docs/` 排除——论证文档是新用户理解这套东西的一半，堵标题比
   堵文档便宜。
7. **破例**：本文件与 `docs/plans/*` 一直是"历史不改，新条目说明为什么变"。这次改的是**第三方的可识别信息**，
   不是我们自己的推理，所以按"改写 + 本条目记录"处理，而不是"追加一句声明"。`plans/revision-26.md` 头部写着
   "不再维护"，这次是一次性更正、不是恢复维护；留指针的方式按文件定：本文件三处与 `revision-17.md` 一处写明
   `标题略，见 §75`，`revision-26.md` 两处用 A/B 与占位路径，读者不需要指针也知道那是代号。

**验证**：护栏做了反例——把 README 的 `Twelve` 改成 `Ten`，`[2]` 立刻 FAIL 并同时报出"盘上 12"与"散文 ten"，
改回即绿（§36／§64／§70 那三次若有它，会在提交前就红）。三处正则另用一次性脚本核对过各自捕获到 `twelve`／
`twelve`／`Twelve`。全套 19 项离线自测 + `toolchain-page --check`（23 条）+ `release-check --local` 在提交后
重跑通过。

**未做／边界**：新口径下重测 `zotero-pdf.mjs` 的使用率不在本轮（要新会话数据）；护栏不加第三处锚点，也不比
README 里那条**过去时**的实测（"when it shipped eight disciplines"）——那是历史记录，不该被当下数判错；
**已发出的 0.12.0 里仍带着旧标题**，清理要到下一次发布才真正生效；[`releases.md`](releases.md) 只在新版发布时记。
**补记（同日收口）**：0.12.1 已带上这些改写（属主推送，`releases.md` §76）；**0.9.0–0.12.0 的 tag 里仍有原标题，
属主裁定不改写历史**——改写要重算全部 tag 与所有引用过其哈希的记录，收益只是清掉**已经公开过**的标题，代价是
整条历史失去可核对的锚点。所以"不再随包发出"这个保证只覆盖**当前版本及以后**。

**落在何处**：[`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（`ROUTED_NAMES`、`NUMBER_WORDS`、
`[2]` 块、`[3]`–`[6]` 重编号）· [`docs/backlog.md`](backlog.md)（第 1 行、#6、#8）· 本文件（三处标题）·
[`plans/revision-17.md`](plans/revision-17.md) · [`plans/revision-26.md`](plans/revision-26.md)。

## 76. 建条目时可以同时指定分类：一次写入，`UNFILED` 自成一个结论（2026-10-20）

**起因**：junhan 贴来本地 agent 的一段收尾，里面写"**未归入任何集合**（写入工具没有 `--collection` 参数）⇒ 两条落在库根，`02-3` 仍是 6 部作品，锚定表 §3 不用改"。他问的不是那两条怎么办，而是**"添加条目的时候同时能指定分类是不是比较方便"**——工具该怎么长。

**先验**（三条都落到行）：

① 那段话**半真，且结论是推断过头**。真的一半：`fillTemplate()` 只填 `/itemTypeFields` 给的 schema 字段，`collections` 不在其中，body 里确实没有它。过头的另一半：**归档早就存在**，只是另一次写入——`zotero-collection.mjs --assign <itemKey> --collection <key> --write`，读 `version`、`PATCH` + `If-Unmodified-Since-Version`、回读比对。agent 把"一个工具只做一件事"读成了"做不到"，于是把"两条在库根"报成了既定事实。这个误读的成本是用户以为锚定表已经定了。

② **一次 create 直接带 `collections` 在 Zotero 上是条目形状的一部分**（web API v3），本地 API 镜像它；但**本仓库没有实测过**"建的时候带上、读回来还在"。按本仓库的规矩，这类未测行为只能写成"尝试 + 回读 + 没成就说没成"，不能写成"支持"。

③ `zotero-edit.mjs` 的 `REFUSED_FIELDS` 早就把 `collections` 排除在"改字段"之外，所以归档的唯一入口是 `zotero-collection.mjs`。加 `--collection` 不是新开一条写路径，而是让**建**这条路用上同一个字段。

**裁定**（四项由 junhan 逐项确认，全部取给定选项）：

1. **只给 `zotero-write.mjs` 加 `--collection <key>`，放进同一个 create body** ⇒ 一次写入、一次授权。不改成"建完自动再 assign"的串联：那是同一次调用里的第二个变更，而"一次调用一件事"是这一侧的共同规矩。
2. **只收 8 位 key**（`^[A-Z0-9]{8}$`，小写自动转大写），**不收分类名**。同名分类挂在不同父级下是合法约定（重复检查本身就按 sibling 比），猜名字就是把论文放进错文件夹的那条路。
3. key 的**形状**在第一次请求之前拒绝；key **存不存在**在写入前按库里 75 个分类（分页读）核对——否则打字错误要等属主点完 Allow 才被库拒绝，读起来像工具坏了。
4. 回读里没有这次归档 ⇒ **`UNFILED` + exit 1**（§77 的同一类缺口修完后改为 **exit 3**：条目已在库，退出码必须说它可能已写）：条目**已在库**，工具只打印 `--assign` 那一条命令，**不补写第二次、不重试 create**。

**验证**：

- 新增离线自测 [`tools/zotero-write-selftest.mjs`](../tools/zotero-write-selftest.mjs)（31 条断言，写库为零）。含反例：分类名被拒；根分类读回 `false` 不等于一个名叫 `false` 的分类；源码里**不许出现 `patchItem`/`patchCollection`**——这条正面断言了"工具没有第二条写路径"。
- 真库干跑（Zotero 10.0.6，kept 授权在档）：给一个真实分类键，工具打印 `filing : <key> "<分类名>" — carried by this create, not a second write`，payload 里出现 `"collections"`；`--collection AB` 与 `--collection GONE0000` 都在任何写入之前 exit 1。**键与分类名不誊写**——它们说明不了这次测量，只透露属主库的内容（同 §75 那条红线：`docs/` 随 npm 包一起公开）。
- `node --check` · `toolchain-page --write/--check`（23 条出处）· `toolchain-selftest` · `zotero-write-selftest` 全绿。

**未做／边界**：

- **"create 带 collections 到底收不收"仍未实测**。第一次真写就是那次测量，回读是唯一证据；库若忽略它，用户看到的是 `UNFILED` + 一条 `--assign`，而不是一句"失败"。
- 重复命中（条目已在库）时**不**顺手归档那一条：那是一调用里的第二种变更。要归档已有条目就明说 `--assign`，要第二份就 `--force`。
- `--attach <pdf>` 仍是 §329 的拒绝项，没重开。
- **顺带修了一条既有缺陷**：任何在 `fetch` / 本地请求之后立刻 `throw` 的路径，收尾的 `process.exit(1)` 在 Windows 上会撞 libuv 的 `uv_async` 断言，退出码变成 `0xC0000409` 并多打一行 `Assertion failed`（改前实测：`--doi 10.9999/not-a-real-doi` 必然复现；`--collection GONE0000` 也复现）。这是**既有**问题、不是 `--collection` 引入的，但新的拒绝路径正好落在这一类里，所以一并改掉：错误路径改成 `process.exitCode = 1` 后自然退出，实测 exit 1、约 0.9 s、无断言行；`--selftest` 的收尾同理。**未做的事**：没有动共享传输（`localRequest` 仍用默认 agent 的 keep-alive），慢的原因是等待套接字收尾而不是挂住。

**落在何处**：[`tools/zotero-write.mjs`](../tools/zotero-write.mjs)（`parseCollectionKeys` · `collectionKeyProblems` · `withCollections` · `unfiledCollections` · `unknownCollections` · `allCollections` · 回读的 `filing` 一栏与 `UNFILED` 段 · 入口守卫）· [`tools/zotero-write-selftest.mjs`](../tools/zotero-write-selftest.mjs)（新）· [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md)（重生成）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`README.md`](../README.md)（自测清单、用法示例、"tools say rather than hide" 那段）· [`docs/coverage.md`](coverage.md) · 本文件。版本号不动，随下一次发布带出。

## 77. 笔记的作者成为一个 tag：`/agent-note` 与 `/reviewed`（2026-10-21）

**起因**：两个文献裁定会话（03 类 17 部、04 类逐篇）收尾时都做了同一件事——代理补写的节笔记先在**课题自己的索引**里定了一条约定："代理写的笔记一律加 `agent-note`；不得单独支撑 `adopt`；台账里凡以它为依据的判决必须写明。" 属主问的是：这条约定为什么不在预设里？

**先验（三条都落到行）**：

① **`grep agent-note` 在整个预设里 0 命中**：`section-notes` 只说"写笔记是代理的活"，工具只写 `/section-N`，`adoption-ruling` 的六字段里没有"这份笔记谁写的、业主复核过没有"。⇒ 同一条裁定换一个课题、换一轮上下文就不存在；而一份未复核的代理正文可以**静默**支撑 `adopt`。

② 那次"预设工具在这套库上两条路都写不进去"的诊断，**在 HEAD 上不可复现**：不带 `--title` 时 path 是常量 `/api/users/0/items`，产生不了 `Request path contains unescaped characters`；带 `--title` 时工具本来就有回退（改发无 title 的载荷，2026-10-16 起）。⇒ "仪器坏了"本身是一个要证据的主张；而那次绕行留下了一个孤儿笔记和一份没标签的笔记。

③ 那次"工具少报了笔记数（7 vs 10）"**不成立**：7 份是业主的（§2–§8），另外 3 份是代理刚写的重复，10 = 7 + 3。真正的问题是它把 `covered: none` 读成了"没有笔记"，而 plan 逐份打印了那 7 条的首段。

**裁定**（四项 + 标签一项，由 junhan 逐项确认）：

1. **写入失败分三种答案**：`0` 写入并回读 · `1` 拒绝且确定没写 · `3` 已发送或已写但未确认（打印 key，**不许重发**）；失败后自动对账（重列 children，比对正文与 tag）。
2. **代理写的正文自动带 `/agent-note`**；业主确认后 `--review` 加 `/reviewed`。未复核的草稿可原地改、只够撑 `candidate`；复核过的按记录处理。`--claim` 不给 agent 笔记加 `/imported`。
3. **`adoption-ruling` 的每一项若以节笔记为依据，必须写明 note key 与出处**；未复核的 `/agent-note` 不支撑 `adopt`/`adopt-modified`/`verified`。`verified` 要两样：复核过的笔记＋跑过的测试。
4. **"某节没有笔记"必须先读该记录上所有 `unknown` 笔记**；create 在还有无 tag 笔记时拒绝，除非 `--acknowledge-unknown "<读了什么>"`。
5. **去掉 `--title`**：写路径要求 Zotero 10，而 note 没有 title 字段（title patch 回 500）；回退的第二次 POST 本身就是重复风险。

**实现**：`tools/zotero-section-note.mjs`（`AGENT_TAG` · `REVIEWED_TAG` · `isAgentNote` · `isReviewed` · `provenanceOf` · `authorityOf` · `reviewTags` · `runReview` · `createdDespiteFailure` · `reportUnconfirmed` · `writeAttempted` · exit 3 · `--acknowledge-unknown`）· [`tools/zotero-section-note-selftest.mjs`](../tools/zotero-section-note-selftest.mjs)（第 [3] 组作者/复核/草稿、第 [6] 组 plan 的作者与 authority、第 [9] 组桩库的 POST/PATCH、unknown 闸、退出码 3）· [`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md) · [`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md) · [`protocol.md`](../protocol.md)（**Revision 32**：§4 两行、§6、`INV-NOTE-4`、`INV-ADOPT-5`、`INV-EVID-3` 补一句）· [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md)（重生成）· [`README.md`](../README.md) · [`docs/coverage.md`](coverage.md)。

**验证**：`zotero-section-note-selftest` 全绿（新增断言覆盖：作者与复核互不冒充、claim 不给 agent 笔记加 `/imported`、复核后不可原地改、unknown 闸、`--acknowledge-unknown` 放行、退出码 3 与"不要重发"）· 全套离线自测 · `release-check --local` 除"工作树干净"一项外全绿（该项是打 tag 的前置，开发期本就为脏）。**未做**：不对真库做写入实测（`--review` 只改 tag，走的是既有 `patchItem` 版本守卫与回读）；版本号与 tag 不动，随下一次发布带出。

**同一类缺口的其余四处（2026-10-21，属主当场选"现在就改"）**

上面第 1 项裁定当时只落到了节笔记这一个工具。junhan 追问"这套预设还有没有类似的问题"之后，按同一条规则扫了其余写路径，四处都还在用两种答案回答：

| 工具 | 改前的回答 | 与契约冲突在哪 |
|---|---|---|
| `zotero-edit.mjs` | 读回不一致 → `exit 1`，而正文先打印了 "the write was accepted" | 提案被接受却报"拒绝"，调用方重发的正是这次改动 |
| `zotero-collection.mjs` | 建分类没拿回 key、改名/归档读回不一致 → `exit 1` | 分类可能已建/已改名；再建一次就是同名分类 |
| `zotero-write.mjs` | 读回 title/DOI/creators 不一致 → `throw` → `exit 1`；`UNFILED` → `exit 1` | 条目**已经在库里**，却被报成失败 |
| `zotero-link-attachments.mjs` | 链接建了但读不回 → 记 `FAILED`；整轮即便有失败也退 **0** | 两个方向都错：可能写着却说失败，失败又说成功 |

改法（同一套词、同一个码，共用实现在 `zotero-local-api.mjs`）：

1. **`mayHaveLanded(status)`**：`0`（没有回答）与 `5xx` 都可能已经写了，`4xx` 是拒绝。`applyPatch` 新增 `beforeWrite` 钩子，让调用方在请求发出前打标记——顶层 `catch` 才有资格说"已发送"。
2. **`reportUnconfirmed({key, what, found})`**：打印 `WRITTEN BUT UNCONFIRMED`（找到 key）或 `SENT BUT UNCONFIRMED`（没找到），并返回 **3**。四个工具的失败分支都改用它，措辞因此与技能里教的词一致。
3. **失败后对账**：`edit` 重读条目逐字段比；`collection` 的 create 重列分类树按 name+parent 找、`assign` 重读 filings；`write` 用既有的 `findExisting` 按 DOI/archiveID/标题搜；`link-attachments` 重列 parent 的 children 按 path 找。
4. **`refused` 标记**：`gate.write()` 与 `authorize()` 里**任何请求发出之前**的失败（403 对话框被拒、429、401 重试到底）都带 `error.refused = true`，顶层 `catch` 据此仍判 `exit 1`——否则"属主关掉了对话框"会被说成"可能已经写了"，同样不诚实。
5. **批量工具的退出码**：`link-attachments` 一轮里只要有 `unconfirmed`/`partial` 就以 3 结束；`UNFILED` 从 1 改为 **3**。
6. **文档**：`protocol.md` §6 与 Revision 32 段明说这条规则覆盖每一条写路径（不只笔记）；`README.md`、`docs/coverage.md` 与重生成的 `docs/toolchain.md` 同步。

**验证**：`zotero-local-api-selftest` 新增第 [1b] 组（0/5xx 可落盘、4xx 是拒绝、两种措辞、返回 3）与 [9] 的 `refused` 断言；`toolchain-page --check` 引文仍全部成立；四个文件 `node --check` 通过。**未做**：这四个工具的 CLI 失败分支没有端到端桩库测试（只测了共用助手）；真库仍只做只读比对（`--plan` 在一份带裸 `agent-note` 的记录上正确输出 `AGENT`/草稿与 provenance 汇总）。

## 78. 命令行的退出码有了端到端测试：两支工具走桩库，一处 `exit 0` 记而未决（2026-10-21）

§77 的"未做"里有一条：四个工具的 CLI 失败分支没有端到端测试，只测了共用助手。junhan 这一轮从四个待办里选了"只补最容易出错的两支"——`zotero-collection` 与 `zotero-link-attachments`，因为这两处的失败代价是**重复创建**：同名分类在两列里不可分辨，重复链接在库里长得一模一样。

**怎么测的**：`ZOTERO_LOCAL_API`（读的地址缝）和 `ZOTERO_LOCAL_KEY_STORE`（授予文件的位置）此前就有了，节笔记的自测已经在用这套组合。于是两支自测各自起一个桩库在临时端口上、授予文件放进临时目录、`spawn` 真进程，断言的是**退出码与库里的最终状态**，不是工具打印的文字——打印可以好看，码不能错。

**`zotero-collection-selftest` 第 [3] 组（13 项）**：

- 建成 → `0`；同名已在同一父下 → `1`，且**一个请求都没发**（闸门都没开）。
- `200` 却没回 key、而树里已出现 → **3**，打印 `WRITTEN BUT UNCONFIRMED` + key + "nothing else was created"，且**只发了一次 create**。
- `500` 而树里什么都没有 → **3**（`SENT BUT UNCONFIRMED`），并明说"树里没有，但请求已发出，不要建第二次"。
- `4xx` → `1`；对话框被拒 → **`1` 而不是 3**，且 create 一个都没发出（`refused` 标记被端到端验证了一次）。
- 改名：接受 → `0`；`412` 且版本真的动了 → `1` `CONFLICT`；`500` 但回读已是新名 → `3` "the rename landed"；**`2xx` 但名字没变** → `3` "不要建替代分类"（这是最坏的一种：通道全程报告成功）。
- 归档：接受 → `0`；`500` 但回读正是要求的清单 → `3` "the write landed"；`412` → `1`。
- 用法错 → `2`。

**`zotero-link-selftest` 第 [3] 组（8 项）**，真的临时文件 + 桩库：dry run 只发 `GET`、不动盘；一次成功转换 → `0`，字节复制、旧附件从库里消失、新附件是 `linked_file`、删除只发一次；create 回 `500` 但链接已出现在 children 里 → **3**，`UNCONFIRMED`、找到 `NEWLINK01`、只发了一次 create、旧附件保留；链接建了但读回不是发出去的东西 → `3` 且不删旧附件；链接建了但读回直接失败 → `3`；链接好了而删除被拒 → `3` `PARTIAL`；`4xx` 的 create → `1`；对话框被拒 → 一个写请求都没发、退 `1`。

**同一处收口（2026-10-21，junhan 当场说"改干净点"）**：上面两条是先记下、再裁定的——改退出码不属于"只补测试"的范围，所以自测先写成 `recorded, not asserted`。属主裁定一起改之后，第三处也在补测试的过程中看清了：

| 位置 | 改前 | 改后 |
|---|---|---|
| 整轮的退出码 | 有候选失败仍退 `0` | `error > 0 → 1`；有 `unconfirmed`/`partial` 时仍是 `3`（3 优先："可能已经写了"比"没写"是更强的陈述） |
| `verifyLink` 抛错 | 记成 `error`（而那时**链接已经建好**） | 记成 `unconfirmed`，打印 "was created but could not be read back … read `<key>`"，退 3；不再调 `findLink`——create 既然回了 key，链接的存在不需要再找 |
| `createLinked` 的 4xx | 一律 `error.sent = true`，于是"库拒绝了"也被说成"可能已经写了" | 只有 `2xx` 或 `5xx`/没有回答才置 `sent`（`isWriteAccepted \|\| mayHaveLanded`）；4xx 是拒绝 → 走 `error` → 退 1 |

自测相应加到 8 个场景（读回失败 → 3、`refused` create → 1、对话框被拒 → 1）。工具头部也第一次写下自己的退出码——这一支此前一条都没写过。

**验证**：两支自测各自全绿（`PASS`）；`toolchain-page --check` 引文仍全部成立。**未做**：`zotero-edit` 与 `zotero-write` 的 CLI 没有同样补（本轮只选了两支；它们失败后的对账是"重读单条"，是四处里最简单的）；真库仍未写入。

## 79. `edit` 与 `write` 也补上端到端测试：测试当场上顶回一条我差点改错的结论（2026-10-21）

起因：junhan 这一轮选了两件事——把 `zotero-edit` / `zotero-write` 的 CLI 端到端测试补齐，然后发布 0.14.0。

**做法**：与 §78 同一套路（桩库 + 真进程 + `ZOTERO_LOCAL_API` / `ZOTERO_LOCAL_KEY_STORE`）。`write` 多一层麻烦：元数据从 arXiv / Crossref 走网络，而产品代码在那里没有缝。解法是**只在该子进程内**用 `NODE_OPTIONS=--require <stub.cjs>` 预载，把 `globalThis.fetch` 换成桩、其余请求转给真 `fetch`。这是**注入传输**而不是改产品代码：工具不知道自己在被测试，`--arxiv` 仍然走它自己的解析器与解析逻辑。（Windows 上 `NODE_OPTIONS` 里的路径要用 `/`，否则反斜杠会被吃掉——踩过一次。）

**结果**：`edit` 12 个场景（干跑 / 无变化 / 成功 / tag 整表 / 500 已落盘 / 500 未落盘 / 412 竞态 / 2xx 但没生效 / 4xx / 对话框被拒 / 拒绝字段 → 2 / 白名单外 → 2）；`write` 13 个场景（干跑 / 建成 / 带归档建成 / `UNFILED` → 3 / 500 但搜到 → 3 / 4xx → 1 / 回读不符 → 3 / 重复 / `--force` / 键形状错 → **一个请求都不发** / 库里没这个分类 → 1 / 对话框被拒 → 1 / 没有来源 → 1）。

**测试立刻顶回了我自己的一个错误结论**。写 `write` 的重复场景时，我先判定它是 bug 并改成了 `exit 1`，理由两条：工具头部写着 "1 refused, nothing written"，而 `zotero-collection --create` 的同名拒绝也是 1。改完按发布纪律做**反向声明回扫**，翻到 §40.2 第 2 条——属主 2026-10-17 已经定过：命中 = 幂等无操作、**exit 0**、打印 `ALREADY RECORDED`，依据正是"要达成的状态已成立"加上 `zotero-edit` 的 "No change"。⇒ 错的是 `REFUSING` 那个**词**（词说拒绝、码说无事可做），不是码。于是**改词不改码**：打印 `ALREADY IN THE LIBRARY: the record is <key>. Nothing was written.`，头部 0 行补成"或条目已在库里"，`toolchain-page` 的引文与生成物同步，`literature-recon` 那句 "refuses to create a duplicate" 改成"点名已有记录并 exit 0，要第二份才 `--force`"。

这一条值得单独记下来：**测试的用处不只是防止以后的错误，还在于它逼出一个"我以为是 bug"的判断，而回扫把它顶回了属主已经做出的裁定**。若当时直接提交，仓库里就会同时存在 §40 的"命中是 0"和 `zotero-write` 的"命中是 1"，且两者的理由都写得很像。

**落点**：[`tools/zotero-write.mjs`](../tools/zotero-write.mjs)（措辞与头部 0 行）· [`tools/zotero-write-selftest.mjs`](../tools/zotero-write-selftest.mjs)（第 [7] 组）· [`tools/zotero-edit-selftest.mjs`](../tools/zotero-edit-selftest.mjs)（第 [3] 组）· [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md)（重生成）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`README.md`](../README.md) · [`docs/overview.md`](overview.md)。

**验证**：两支自测全绿；`toolchain-page --check` 23 条引文成立；全套离线自测（21 项）与 `release-check --local` 全绿。**未做**：真库仍未写入；`--selftest` 那两条走活网的分支不在自测范围内（它们要真 arXiv 与真 Crossref）。

## 81. 发布复核的第三种答案：`1` 是"发布件错了"，`3` 是"这一项根本没读到"（2026-10-21）

起因：0.14.0 的远端复核里，同一段代码给出了两个假结论。①`release-check --tag` 的最后一步 shell 出
`git ls-remote`，因而继承 git 的代理配置；代理没起来时，三项实质检查**已经全部 PASS**，它却抛
`ERROR: Command failed` 并退 1——把"分支头没法核对"报成"这一版有问题"。②网络层的 `fetch` 失败被打印成
`FAIL the tag is readable`，读起来像发布件缺文件，而实际上是没连上。

**裁定**（属主当场选"现在就修，随下一次发布带出"）：**发布复核有三个答案，不是两个**。

- `0` 全都查了，都成立；
- `1` 查了，某一条不成立——发布件错了；
- `3` 某一条**没能查**（网络不通、git 代理没起来），打印原因，那一项什么也没证明。

`3` 不是"轻一点的 1"：它说的是"没人看过"，`1` 说的是"看过了，是坏的"。两者混用正是上面两个假结论的成因。
失败仍然压过未验证（真错 + 没查到 → `1`），因为那时确实知道有东西是错的。

**落点**：[`tools/release-check.mjs`](../tools/release-check.mjs)——新增导出纯函数 `summary({failed, unverified})`；
`report(tally, …)` 与 `unverified(tally, …)` 分开计数；`checkTag` 把"文件 404"（对发布件的断言，仍算 FAIL）与
"fetch 抛错"（没人读到，UNVERIFIED）分开；某个 helper 抓取失败只中止那一项而不是崩掉整轮；`git ls-remote`
包在 try 里，失败时给出 `git could not ask the remote: <首行原因>`；`g()` 把 stderr 收进管道，git 的 `fatal:`
不再喷在解释之前。[`tools/release-check-selftest.mjs`](../tools/release-check-selftest.mjs) 第 [7] 组四条驱动
`summary`：三个码各自的措辞，以及"失败压过未验证"。[`README.md`](../README.md) 与
[`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §7 第 5 步把三种码写进发布流程，
并明说"`3` 就去修传输，不要当成发布件的缺陷"。

**验证**：网络部分可用时 `--tag v0.14.0` → 三项 `OK`、git 那项 `UNVERIFIED`、退 **`3`**；网络全断时 →
`UNVERIFIED the published package could be read / fetch failed`、退 `3`（旧版是 `FAIL the tag is readable`、退 `1`）；
`release-check-selftest` 全绿。**未做**：已发布的 0.14.0 里仍是旧行为——修复随下一次发布带出（属主的选择）。

## 82. 库没应答不再是一句裸错误：`zotero-ensure` 与 `INV-EVID-7`（2026-10-22）

**起因（junhan 提的问题）**：他有时忘记先启动 Zotero 就开了预设，这时 agent 可能**绕过**库去读（翻数据目录、按文件名挑存储的 PDF、拿网上副本顶替），问预设能不能自己把 Zotero 拉起来。

**先说实测到的现状**：预设里七个参考库 helper 全部只经 `tools/zotero-local-api.mjs` 发 HTTP 到
`127.0.0.1:23119`，`tools/` 里**没有一处** spawn Zotero；库没开时 agent 拿到的是
`ERROR: connect ECONNREFUSED 127.0.0.1:23119`、exit 1——一句既不说下一步、又读起来像"仪器坏了"的话。
**这就是诱使它绕道的动因**：没有任何一句告诉它"库不应答时该停下"，读侧连一条管通道的规矩都没有（写侧有 `INV-EVID-3`）。
另一件必须承认的事：agent **技术上早就能**自己拉起它（预设带 `tool-bash`/`tool-pwsh`），缺的不是能力而是仪器与规则。

**决策**：三样东西，分三层。①**仪器** `tools/zotero-ensure.mjs`：探测 → 没人应答且进程不在才启动 → 轮询到上限 → 四态
（`already answering` / `started` / `not answering` 附 `fix` / `cannot start` 附 `checked` 清单）。**只有显式跑它才启动**，
任何读写 helper 都不隐式启动；不写偏好、不 kill、不重启。②**出路**放在共享传输层：`ECONNREFUSED` / `ENOTFOUND` /
`EHOSTUNREACH` / `ENETUNREACH` 翻成一句含绝对路径命令的话，六个 helper 自动继承；`code` 保留、原错挂 `cause`，
`ECONNRESET` 与探测超时**不翻**（插入点可能在请求中间，此时说"从未起来"是假话）。③**契约**：`protocol.md` 升
**Revision 33**，§6 加一条"不应答是停，不是替代"，§8 新增 `INV-EVID-7`；两份纪律（`literature-recon` 全文、
`reading-triage` 第 0 步指向它）各一句。**常驻提示 0 新增字符**——那句话只在失败时出现。

**为什么拒绝"自动拉起"（B 之外的两个选项）**：`ZOTERO_LOCAL_API` 一旦被设置就**拒绝启动**。那条缝的语义是"对面是桩库或
另一个实例"，而"测试以为在打桩、实际惊动了真应用"正是 `zotero-local-api.mjs` 里写明唯一不能有的失效方式。所以启动权限由
**显式命令**授予，而不是由一次读顺带触发。

**实测（本机，非推断）**：Zotero 10.0.6，`C:\Program Files\Zotero\zotero.exe`（注册表 `InstallLocation` 一致），
**PATH 里没有 `zotero.exe`** ⇒ 定位必须走 注册表 → 标准路径 → PATH 三级，靠命令名找会在这台机器上找不到；
`/api/` 活端口 **7 ms** 回 `Zotero-Server-ID`，死端口 **4 ms** 即拒 ⇒ 探测零成本；
prefs 里 `extensions.zotero.httpServer.localAPI.enabled = true` ⇒ 起来就有端口。**未实测**：冷启动到端口可用的耗时——
不能为了测它去杀属主正在用的 Zotero，所以设计不依赖这个数（`--wait` 上限 + 如实报）。

**退出码只用两种**：0 = 库答话（已经答的，或本次启动后答的，以及 `--dry-run` 的计划）；1 = 它不答且这件事没有属主就改不了。
**没有 3**：3 在本仓库的语义是"可能已落盘，读回来再重发"，而启动一个进程不存在"可能"，一个"也许一会儿就好"的码只会请出这个命令
本来要消灭的重试循环。

**落在何处**：[`tools/zotero-ensure.mjs`](../tools/zotero-ensure.mjs) 与其 [自测](../tools/zotero-ensure-selftest.mjs) ·
[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（`libraryUnreachable` + `localRequest` 的 `timeoutMs` 探测）与其
[自测](../tools/zotero-local-api-selftest.mjs) 第 [12] 组 · [`protocol.md`](../protocol.md)（Revision 33：§6、`INV-EVID-7`）·
[`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`skills/reading-triage/SKILL.md`](../skills/reading-triage/SKILL.md) ·
[`tools/release-check.mjs`](../tools/release-check.mjs)（名册）· [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) →
[`docs/toolchain.md`](toolchain.md)（重生成，24 条出处全部成立）· [`docs/coverage.md`](coverage.md) · [`docs/overview.md`](overview.md) ·
[`README.md`](../README.md) · [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4 的套件清单。

**反向控制（两次）**：删掉 `nextAction` 里的 seam 分支 → `zotero-ensure-selftest` **FAIL (3)**（[5] 一条、[7] 两条）；
把传输层的错误翻译改回 `reject` → `zotero-local-api-selftest` **FAIL (1)**（[12] 的接线断言）。两次都即装即 PASS。
**注意那条断言为什么改成读措辞**：裸消息 `connect ECONNREFUSED 127.0.0.1:<port>` 同样带 code 与端口，
所以只断言这两样时**翻译关掉也照样通过**——这是第一版反向控制没抓住它的原因。

**验证**：`zotero-ensure-selftest` 39 条断言全绿（[1]–[8]）、`zotero-local-api-selftest` 86 条全绿（新增第 [12] 组 13 条）、9 个 zotero 离线自测全绿、`node --check` 通过、`toolchain-page --check` 24 条出处成立、
`doc-selftest` / `skills-selftest` / `toolchain-selftest` / `contact-bridge-selftest` / `client-selftest` 全绿、
`release-check --local` 除"工作树干净"（打 tag 的前置，开发期本就为脏）外全绿。**未做**：不对真实"应用没跑"的机器做端到端实测
（本机 Zotero 一直开着，杀它去测等于毁掉属主正在用的东西）；`zotero-ensure` 的 live 启动分支因此只由 `nextAction` 的纯判定覆盖，
这一点写在自测文件头里。
## 83. 失败只说它知道的事：一个共享渲染器、`INV-FAIL-1`，与两处 exit 码的误分类（2026-10-22）

**起因（junhan）**：上一轮把"库没应答"那句裸错误改掉之后，他提出第二问——**其他工具的报错信息是不是也该这么明确**，并要求"尽可能地让报错信息明确"，同时先做一次普查再动手。普查结论放在选项里：形状统一（十个 helper 尾部是同一个 catch，`class UsageError` 各写十遍），但**清晰度在抛出处就定了**。

**决定做法的三条先验（都实测过，不是推断）**：①同一个 `404` 在库路径上意味着"键不在这个库"，在元数据源上意味着"这个源没有它"，**收口处看不到区别** ⇒ 按状态码在 catch 里分类会给出错建议，做法必须是"抛出处说、收口处只排版"。②准备写进 `try` 行的命令必须真能跑：`zotero-read.mjs --search`（usage 第 231 行）与 `metadata.mjs --source openalex|crossref` 都已核对存在。③selftest 里 29 处 `ERROR:` 绝大多数是桩服务器的 JSON 载荷，不是对打印行的断言 ⇒ 改文案的测试成本低。另外 `preset-paths.js` 只被一个 helper 引用，**不能**当共享层（先例是 `tools/zotero-local-api.mjs`：tools/ 里的共享模块）。

**决策**：新模块 `tools/refusal.mjs` 提供 `UsageError`（exit 2）、`Refusal`（携带 `what` + 至多一个 `fix` + 一条**能照抄**的 `command` + `checked` 清单）、纯函数 `refusalLines()`、以及**返回退出码**的 `reportFailure()`（不自己退出：三个工具要用 3 回答"已发出、随后断线"，那是调用方的记忆）。标签对齐第 8 列，与 `library : ` / `state   : ` / `fix     : ` 同列；**普通 `Error` 仍只打一行**，不倒退。十个 helper 的尾部塌成一行调用，十份本地 `UsageError` 删掉（含不在名册上的 `journal-rank.mjs`——留一个第二类就是漂移的起点）。新增 `release-check` 护栏 `refusalVoiceProblems`：名册里每个 `.mjs` 必须 import 该模块、必须调用 `reportFailure(`、不许自定义 `UsageError`；两个共享模块豁免（它们不是程序）。

**配上下一步的五类，与两处只是"答错了码"的**：①记录键 404 → 说"库里没有这个键"，**不给命令**（查询词在读者手里，占位符会被照抄然后失败）；②元数据源 404 → 点名另一个源并给出可粘贴的命令，但**只在那个命令真能跑时**（`--cited-by` 只有 OpenAlex、`--oa` 只有 Unpaywall、`--refs` 若给的是裸 OpenAlex id 则 Crossref 解析不了）；③无附件 → 从 `UsageError`(2) 改成 `Refusal`(1)；④arXiv 400/500 带哨兵 entry → 说"拒绝的是查询/页太大"，429/503 → 说"限流，等一分钟"；⑤`zotero-write` 没给源 → 从 `Error`(1) 改成 `UsageError`(2)。**传输层只多挂一个 `error.status`**，任何地方都不解析消息。

**为什么不给占位符 `try`**：这是判据第三条的诚实应用，也是稿子里被改掉的一处——初稿给"无附件"配的 `try` 是 `zotero-read --fulltext <key>`，而那条命令在无附件的记录上会以同样的方式失败（库索引文本也按附件键）。一条会被照抄、然后失败第二次的命令，比没有更坏。

**途中撞到并修掉的**：块从一行变成三行之后，`process.exit()` 在 stderr 还是管道时把块截断，Windows 打出
`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76`、退出码 `0xC0000409`——正是 `journal-rank.mjs` 早就记录过的 libuv 现象。所以失败路径一律改成 `process.exitCode`，实测七个工具失败即退（metadata 633 ms、read 2.2 s，无挂起）。

**反向控制**：把 `refusalLines` 里推 `fix` 那一行改成 `if (false)` → `refusal-selftest` **FAIL (5)**（并顺手把断言改成 `lines[1]?.startsWith`，让反向控制报 FAIL 而不是抛栈）；恢复即 PASS。

**实测对照**：改前 `ERROR: /api/users/0/items/NOTAKEY1 answered 404: Not found`（泄通道路径、三种起因压成一句）；
改后三行——`ERROR   : the library has no record under the key NOTAKEY1 (404)` + `fix     : …`。元数据 404 从倒出 300 字符 HTML 变成三行且 `try` 可直接粘贴。**未实测**：`zotero-pdf` 的无附件分支没有在真有这种记录上跑过（本机库没有已知的无附件记录），该分支由读代码与 `node --check` 覆盖。

**落在何处**：[`tools/refusal.mjs`](../tools/refusal.mjs) 与 [自测](../tools/refusal-selftest.mjs) · 十个 helper 的尾部与 [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4 套件清单 ·
[`protocol.md`](../protocol.md)（Revision 34：§6 一条、`INV-FAIL-1`）· [`tools/release-check.mjs`](../tools/release-check.mjs)（`refusalVoiceProblems` + 名册加 `refusal.mjs`）·
[`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md)（重生成，25 条出处全部成立）· [`README.md`](../README.md)。

---

## 84. 16,000 那句话引错了包：挂的是 `dsh-tool-pwsh`，不是持久化那一支（2026-10-22）

**起因**：2026-10-22 对这整套预设的一次整体检查。四份纪律、覆盖地图、生成物 `toolchain.md` 与 §63 那张表都说"单条命令的输出在 16,000 字符处被截断、截到前 16,000"。

**反证**：一条 **30,000 字符**的命令输出完整到达（本轮实测：`pwsh` 一条命令打印 30,000 个字符，返回的就是 30,000）。16,000 的闸门若真存在，这条当场就被截了。

**事实**（读源码核对的，不是推断）：

| 事实 | 出处 |
|---|---|
| 本预设挂的是 `@deepseek-ai/dsh-tool-pwsh`（`cordis.patch.yml`） | 组合文件 |
| 它的本地执行层默认 `maxOutputBytes: 64e3`，**stdout / stderr 各算一份** | `dsh-pwsh-local/lib/index.js` |
| 底层是 "bounded **tail-keep** collection with spill"：保留**尾部**、丢开头，提示语 `[output truncated; full output: …]` | `dsh-subprocess-local/lib/index.js`、`dsh-tool-pwsh/lib/index.js` |
| `maxOutputChars: 16e3` ＋ `<response clipped>` 属于 `dsh-tool-pwsh-persistent`——本预设**没有挂**它 | `dsh-tool-pwsh-persistent/lib/index.js` |

**根因**：§63 把上一轮的"未查清"查清时，第二行引的正是 persistent 那一支。那条更正本身没有被任何能失败的检查验过——这是本轮唯一一个"证据引错、结论照抄进六份正文"的例子，也说明"查清"这个动作同样需要证据。

**裁定**：数字只留一处口径，并且写明**它属于谁、测在哪**——`dsh-tool-pwsh`（本预设挂的那支）在 **DSH 0.2.1-rc.2** 上保留每流**最后 64,000 字节**，超过就丢**开头**。纪律里补上原先没有的那半句警告：丢的是开头，所以一次拉一篇 88k 的全文，丢的第一个东西是**摘要**。**不加机器护栏**：宿主默认值不在离线套件能验的范围，去解析 `node_modules` 里的字符串又属于脆判据（与 2026-10-17 那条"反对宽判据"的立场一致）；改为在 `preset-release` 里写明"升 DSH 必重测这一行"，并留下本轮探针（打印 30,000 字符看是否完整到达）。

**影响**：结论"12,000 的片完整到达"不变（12k ≪ 64k）；变的是对"一次拉整篇"的失效描述——从"截尾"变成"丢头"，而后者恰好是纪律从没警告过的那一半。

**落在何处**：[`skills/reading-triage`](../skills/reading-triage/SKILL.md)（两处）· [`literature-recon`](../skills/literature-recon/SKILL.md) · [`section-notes`](../skills/section-notes/SKILL.md) · [`subagent-contract`](../skills/subagent-contract/SKILL.md) · [`docs/coverage.md`](coverage.md) §四.4 · [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md)（重生成）· [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §3。

---

## 85. `ambiguous` 从"先修 tags"变成一条有仪器的窄动作：`--unclaim`（Revision 35，2026-10-22）

**起因**：同一次检查。一条笔记带两枚 `/section-N` 时不算覆盖，claim / rewrite / `--replaces` 三条路**全拒**，而全仓**没有**删 tag 的入口；纪律却写着"先修 tags"。当时唯一的出路是把这条笔记 `--retire`（把一个 tag 错误升级成墓碑），或者请属主在应用里手改。拒绝是真的，但它点的那一步没有仪器——`INV-FAIL-1` 要的恰好不是这种拒绝。

**裁定（junhan 逐项确认，2026-10-22）**：新增 `--unclaim --note <key> --section <ordinal>`，**只对带多于一枚 section tag 的笔记**，**一次一枚**；单枚 tag 的笔记一律拒绝，并打印 protocol §6 那一条——一枚 tag 是 claim，读数与它不一致归属主裁定，工具不给绕道。写进契约：**Revision 35**（能力变更 ⇒ minor ⇒ 0.16.0）。

**设计**：干跑默认、`--write` 才写、版本前置（412 ⇒ 拒绝，什么都不写）、回读断言被摘的那枚不再出现（不成立 ⇒ **exit 3**，绝不报"没写"）、正文一字不动、不加 `--reason`（理由进报告；`--retire` 要 reason 是因为"退役"本身是一个语义判断，摘 tag 不是）。工具的边界就是"只能降低模糊度"：它**不能**表达"这枚 claim 错了"。

**测试与反向控制**：`zotero-section-note-selftest` 新增 10 条——干跑计划、拒绝单 tag 并点名 §6、缺 tag 是 usage 2、墓碑 2、写后回读只剩一枚、只剩一枚后第二次拒绝、解掉后同记录 create 放行、PATCH 被接受却不生效 ⇒ exit 3 并点名仍在的那枚。两次反向控制都真红：把 ambiguity 判断改成 `if (false)` ⇒ 3 条 FAIL；把回读判断改成 `if (false)` ⇒ 3 条 FAIL；恢复即 PASS。

**与契约的关系**：这不是"agent 可以改属主的 claim"。§6 原有的"读数与 tag 不一致就停下"一个字没放宽；新增的只是"一个模糊状态可以被一次显式、只减不增的摘除解掉"。`INV-NOTE-1` 补了一句：ambiguous 不算覆盖。

**落在何处**：[`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)（模式、usage、计划行、三处拒绝语）· [自测](../tools/zotero-section-note-selftest.mjs) · [`skills/section-notes`](../skills/section-notes/SKILL.md)（description、§0、§2、§2.1、§4.2、§7、§8.1、§9）· [`docs/coverage.md`](coverage.md)（名册、五项计划行、§四.3）· [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) → [`docs/toolchain.md`](toolchain.md) · [`protocol.md`](../protocol.md)（Revision 35：§4、§6、`INV-NOTE-1`）· [`README.md`](../README.md)。

---

## 86. 新增第十三条纪律：从"已裁定为不能用"里榨下一条便宜的问题（Revision 36，2026-10-22）

**起因**：junhan 问——预设现在有"裁决参考文献"的功能，那顺着往下，怎么根据这些已有信息探索对本课题有帮助的启发式想法？他判断这个功能值得做。

**先核前提，两条都成立。** ① 裁决信息实际有三层：`reading-triage` 把（课题 × 文献）的 `depth`/`verdict` 写进该课题台账；`adoption-ruling` 把一篇 A 级论文逐项裁定成台账（`adopt` / `adopt-modified` / `reference-only` / `reject`，各带定位、成立条件、目标模块与数值锚点）；`section-notes` 提供带来源的 `/section-N` 解释。② 缺口是仓库自己登记过的：`protocol.md` §9 把"方向发散循环"列为 deliberately deferred，`docs/decisions.md` §11 记的是"等真实课题暴露需求再做"，`synthesis-plan` 第一句写"不探索，探索在它之前结束"。

**一处实测**：改动前的 12 份纪律正文里 grep `adoption/`，只有 `adoption-ruling` 自己读写。也就是说，`adoption-ruling` §3.6 要求拒用项带理由（*"the reason is what saves the next round"*），而那批理由**没有任何纪律消费**——已经付过阅读成本、已经裁定为不可直接用的信息，是死的。这是本轮真正的发现：缺的不是"想法"，是"没人读被拒的那一半"。一句"这个超参是在别人的数据上调出来的，不是默认值"，正是一个便宜问题的种子：**在我们数据上它还是不是最优？**

**裁定（junhan 逐项确认，2026-10-22）**：① 一个纪律两半，照 `section-notes` §0 的先例；② Part II 两种入口（冲突 / 属主点名发散），但**每条候选必须带种子**；③ 名字 `direction-probe`，中文标签"探路"；④ 招 ID `M-<topic>-NN`，方向 ID `D-<topic>-NN`，两份台账不同形；⑤ 一轮 Part I 上限 10 条，超过只做零成本筛。

**三处硬约束。** ① **六类种子是闭词表**（拒用项及理由 / 未验前提 / 到期的 `park` 复看条件 / 两份来源矛盾 / 缺口 / 裁定项的适用边界），指不到具体行的念头标 `[exploratory]`、不打分、不进 Part II——这是常驻规则 3 在这一步的具体化，也是这一步与"头脑风暴"之间唯一的那堵墙。② **每条招必须有一条杀死条件**：一次可执行的观察 + 判死的阈值；写不出就不成立。③ **方向不是"还能往哪走"，是"冲突的解法"**：新增成分有且仅有一个且必须指回种子；缺的那个报 `needs-a-move` 并退回 Part I 或文献轮——**不许在组装时补上**，否则这条路线已经替自己回答了它本该检验的问题。

**为什么不做成两个纪律**（本轮推敲最久的一处）。① `section-notes` 已有"一份纪律两半"的先例（§0 决定哪一半跑，报告与清单各分两套），不必发明结构；② 依赖是单向的——方向级的候选由招级台账供给，拆开会把同一条锚定规则写两遍，而"方向"那一遍最先漂；③ 常驻路由是每轮都付的成本，`decisions.md` §2 早就警告过它线性增长；④ "两条路线冲突"这个情形已经挂在 `redteam-ruling` 与 `synthesis-plan` 两条 bullet 上，再加一条会让路由变成三选一，而路由是硬规则。三者现在的分工写进路由那一行：**探**（这条能不能被杀）· **疑**（打）· **选**（承诺）。

**代价**：新增一条常驻路由 bullet = **384 字符**（按本仓 3.6 字符/token 约 **107 token/请求**）；合成后 persona 5,812 字符（约 1,614 token/请求）。按需纪律本身不触发时零成本——这是把它写成纪律、而不是写进 persona 的全部理由。

**否掉的替代方案**：① 让 agent 凭空生成 N 个方向再淘汰——淘汰判据对不存在的东西打不了分，等于把最不可证伪的一步塞进链条（这正是原 §9 那条 non-goal 的理由）；② 并进 `synthesis-plan`——它会从"不探索"变成"探索 + 选择"，且发散与承诺落在同一双手上；③ 并进 `adoption-ruling`——它是逐项裁定、只读单篇，看不到两份来源的矛盾，也不该由裁定者自己派生新问题（会把自己的裁定当成种子）；④ 新增一个 helper 程序——这一步的输入全是工作区已有文件，输出是一份文档，没有新通道，也没有需要授权的写。

**落在何处**：[`skills/direction-probe/SKILL.md`](../skills/direction-probe/SKILL.md) · [`skills/synthesis-plan/SKILL.md`](../skills/synthesis-plan/SKILL.md)（§1 触发、§2 ruler 第五项、§4.2 两行） · [`protocol.md`](../protocol.md)（Revision 36：§4、§7 的层枚举、`INV-IDEA-1`、`INV-IDEA-2`、§9 改写） · [`surface.md`](../surface.md) · [`docs/coverage.md`](coverage.md) · [`docs/overview.md`](overview.md) · [`cordis.patch.yml`](../cordis.patch.yml) · [`package.json`](../package.json) · [`README.md`](../README.md) · [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs) · [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs) · [`docs/plans/direction-probe.md`](plans/direction-probe.md)。

**一处账目**：这一条原先只活在 §11 那张暂缓表里，`docs/backlog.md` 没有登记过它；本轮把暂缓表那一行改成"已解除一半"并指到这里，不另开 backlog 行。

## 87. 记录可以原地修：把"修复"和"修订"分开（Revision 37，2026-10-23）

**起因**：junhan 提出这套预设有一个 append 而非 inplace 的倾向——"修错字、修断公式"这类动作完全没必要走"退休 + 新写"——要求逐项裁定哪些地方可以放松。核查后确认：这条倾向不是一条明文原则，而是常驻规则 4（不许另起并行结构）与规则 7（不许覆盖，要记 revision + reason）夹出来的形状；台账其实早就是"原地推进 + 日志留历史"，只有库内笔记是"不可变 + 接替"。

**判据**：这条记录是不是某个判断的**唯一载体**？论文的转写、run 的产物路径、台账读态的真值在别处，可以原地改；属主裁定、`verdict` 的变更史、契约条款的真值只在它自己身上，仍要留旧版或留一行 `old → new`。

**裁定（逐项，2026-10-23，junhan）**：
1. 库内节笔记：**修复原地、修订接替**。主张不变 → `--repair`；主张变了 → `--retire` + `--replaces`。
2. `/reviewed`：修复不失效；动了符号、数字或等式才退回草稿。
3. 台账行：`itemKey` / `year` / `found via` 的转写错误可原地修，仍写一条 reading log。
4. adoption 台账：转写/锚点可修，裁定变了仍加日期行。
5. run card：`Protocol` / `Command` / `Artifacts` 可修，`Observed` / `Validity` / `Verdict` 不可。
6. 规范文档：零语义修正（错字、格式、死链）不升 Revision。
7. 补闸：**属主自己的笔记只开机械修复**——`/reviewed` 只存在于 agent 正文，属主笔记没有可撤销的接受标记。
8. 痕迹：每次修复加 `/repaired`（幂等、无日期、不影响 coverage 与 `authorityOf`/`provenanceOf`）。
9. 提交：契约 → 工具 + 自测 → 纪律/文档。

**为什么不是所有记录都能修**：`--tidy` 仍然不存在，它错在工具替人猜公式的意思；`--repair` 是人给正文、声明类别、plan 打印旧块，两者不是同一件事。属主笔记不开 substantive：agent 改完它会继续以 `record` 身份支撑 adoption，而读的人看不出来。

**落点**：[`protocol.md`](../protocol.md)（Revision 37：§3 规则 7、§4 sections 行、§6 标签与记录条款、§8 `INV-NOTE-4` / `INV-EVID-5` / `INV-EVID-6` / `INV-ADOPT-3`）· [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs)（`--repair`、`REPAIRED_TAG`、`repairTags`、`changeClass`）与其自测第 [3b] / [10] 组 · [`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md) · [`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md) · [`skills/experiment-protocol/SKILL.md`](../skills/experiment-protocol/SKILL.md) · [`skills/reading-triage/SKILL.md`](../skills/reading-triage/SKILL.md) · [`project-template/references/README.md`](../project-template/references/README.md) · [`README.md`](../README.md) · [`docs/coverage.md`](coverage.md) · [`docs/toolchain.md`](toolchain.md)（重生成）。

**已知边界**：数学式**外面**的符号替换（`alpha` → `α`）机械判定看不见，必须由 agent 声明 `--substantive`；这道闸是下限，不是上限。

**未做**：没有在真库上执行一次修复（新路径由 stub 覆盖，真库写仍要下一次逐条授权）；`INV-EVID-6` 的"按课题重复"没动——那是重复，不是改写，要动得单独一轮。

## 88. 文档只放当前态：按块分型、空节不写、超预算先合（Revision 38，2026-10-23）

**起因**：junhan 觉得这套预设写出的文档"太臃肿"，判断主因是日志式追加。核查后确认：上一轮（§87）只把"修复 vs 修订"这一处改成了原地；让文档变长的是另外七条机制——固定节模板要求空节留痕、过程证据（`Ruler` / `Read-back` / `Not judged`）写进产物、报告与产物不分流、一条判断在 journal / Documents / memory 三处复写、Documents 按轮建、逐对象清单进正文、以及没有任何长度预算。实测：Documents **80 篇 / 521 KB**，单篇中位 **78 行**（p90 101）。

**判据**：这条记录是某个判断的唯一载体吗？是 → 展开；不是 → 指针。文档回答"现在成立什么"，不回答"这一轮先看了什么"。这条判据就是 §87 那条，只是从库内笔记推广到层与层之间。

**裁定（junhan 逐项确认，2026-10-23）**：

1. 类型标注改为**按块**：事实默认不标，推断带链条，探索项说清什么能定它（B1）。
2. 采用预算：journal 60 / Document 120 / 产物 40–100 行（B2）。
3. `research-scoping` 的 non-goals 由"至少 3"改为 **1–3**（B3）。
4. 本仓库 `decisions.md` / `releases.md` 的既有条目**下一轮再压**（B4）。

**为什么不是对话里提醒"精简一下"**：不可判（多长算长、删哪段）、不可测，且触发在写完以后。闸放在写入路径上，三档：写前（同题更新、空节不写）、越线（超预算先合后写）、结算（同主题 Documents ≥ 2 篇或 journal > 12 个则合并）。三档覆盖一次写入、一篇文档、一个研究三种尺度。

**落点**：[`protocol.md`](../protocol.md)（Revision 38：§3 规则 1/5/12、§4 产物形状、§8 `INV-DISC-2` / `INV-DOC-2`）· [`cordis.patch.yml`](../cordis.patch.yml)（persona 规则 1/5/12、头部注释）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（11 → 12）· 12 条纪律的 §6（`metadata-query` 无固定节，未动）· [`skills/progress-sync`](../skills/progress-sync/SKILL.md) §6.4 · [`project-template`](../project-template/00_scoping.md)（`00_scoping` / `references/README`）· [`docs/coverage.md`](coverage.md)（重扫；README 无陈旧声明）· [`docs/plans/compaction.md`](plans/compaction.md)。

**已知边界**：模板的"空节 / 预算"**没有**机器护栏——文本质量不是机械可判的，不为它造脆判据；现有 80 篇 Documents 不批量重写，由下一次 `progress-sync` 按同主题合并并写回执。

**未做**：仓库 docs 的条目压缩（B4，下一轮）；真实课题上的第一轮实测（判据：一轮之后 journal ≤ 60 行、同主题不再出现第二篇）。