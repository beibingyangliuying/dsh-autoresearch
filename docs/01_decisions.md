# 决策记录 —— 为什么是现在这样，以及否掉了什么

> 只记**长期仍然成立**的决策与理由。会立刻过时的验证数字不在这里（跑自测即得）；
> 原始时间线在 [`archive/PLAN.md`](archive/PLAN.md)。

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

**理由**：子代理是"声称了但没验证"最容易变成父代理口吻的地方。另外工具结果在 **8192 字符**处会被
静默截断（头 4096 + 尾 1024），长报告**中间会丢**——所以必须落文件。

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
| 方向发散循环（生成 N 个互异方向 + 显式淘汰判据） | **暂缓** | 收敛纪律已能给候选，但没有淘汰循环；等真实课题暴露需求再做 |
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

**落在何处**：[`index.js`](../index.js)（两个 volatile 字段）· [`client.js`](../client.js)（FIELDS + checkbox 渲染 + 类型化 draft）· [`contact-bridge.js`](../contact-bridge.js)（同一 section 增一条策略行）· [`tools/zotero-link-attachments.mjs`](../tools/zotero-link-attachments.mjs) + 其自检 · [`tools/zotero-link-snippet.js`](../tools/zotero-link-snippet.js) · [`README.md`](../README.md) · [`docs/00_overview.md`](00_overview.md)。**`protocol.md` 不动**——这正是分工方案的目的。

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
7. **全文体积**：同一篇（一个真实条目）新版 **54,443 字符**（≈13k token；默认按 `fulltext_display_max_pages=10` 截页），旧版 79,900 ⇒ **仍远超** `tool-result-pruner` 阈值 8,192 ⇒ 老的"落文件 + 按 offset 读"绕法**必须保留**（我最初以为截页就解决了，实测否定）。
8. **坑**：`zotero_get_collections(limit=4)` 只回 1 个根，语义未深究 ⇒ **别用 `limit` 列举分类**。

**为何 pin 版本**：`uvx --from zotero-mcp-server zotero-mcp` 每次启动都重新解析"最新版"；上游 README 至今写 38 工具 / 13.4k，而 0.14.1 实测 41 / 18.8k ⇒ 不 pin 等于让**工具面随上游漂移**，且无网启动解析失败时该行 `failOnStartupError: true` 会把**整个预设**标记为坏、新会话入口静默过滤掉它。

**写入门禁为何写进 prompt 而不是靠隔离**：这些写工具由**预设自己声明的行**注册 ⇒ scope-local；`restrict({deny})` 只过滤**继承来的**全局工具，且**拒绝 scope-local 名字**（契约 §5）⇒ **隔离在原理上管不住它们**。因此门禁只能由契约与常驻纪律承担：`INV-EVID-3` 与 §9 要求**逐次授权**，而 "Always Allow" 会把可复用、不分作用域的 key 落到 `~/.config/zotero-mcp/config.json` ⇒ 与"逐次授权"直接冲突，故在 prompt 里写死禁止，并要求"先说要写什么再请求授权"。成本：该行 ~200 字符/请求（≈55 token）。

**落在何处**：[`cordis.patch.yml`](../cordis.patch.yml)（`mcp-zotero` 行 + 行内实测注释）· [`contact-bridge.js`](../contact-bridge.js)（写入门禁行）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（工具改名 + 体积实测 + 语义检索无效）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（pin 与 toolset 两条护栏，静默回退即 FAIL）· [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs) · [`README.md`](../README.md) · `protocol.md` §5 / §6（Revision 7）。**另**：本轮把两个一次性探针从 `.tmp/` 转正为 [`tools/mcp-call.mjs`](../tools/mcp-call.mjs)（跑单个工具并**保完整输出**——`mcp-probe.mjs` 会把结果截到 1500 字符，正是它让"只 1 个分类"的假象得以出现）与 [`tools/mcp-toolsize.mjs`](../tools/mcp-toolsize.mjs)（按 `tools/list` 全文量常驻成本）⇒ 上游一升级就能一键复核是否漂移。

**顺带否掉**：并存两个 MCP 行（常驻 ≈19.9k token，收益只是"旧行为逐字可复现"）；`ZOTERO_LOCAL_WRITE=false` 硬只读（那等于回到"我们自己写 collections 子命令"，而本轮选择是直接用上游写工具 + 门禁纪律）；把 `tools/` 复制进脚手架（见 §23）。

**顺带清理（已执行，2026-10-14）**：profile 里有**两条同类的死 Junction** —— `@local/dsh-autoresearch-preset` → 已于 2026-10-12 上移掉的 `autoresearch-preset/`，以及 `@local/dsh-autoresearch-mcp` → 已卸载的 `mcp-academic/`。两条都实测为 `LinkType=Junction`、**目标不存在**、通过链接可见 **0** 条目、且 profile 自身文件**零引用**（`@local/` 下已无其它条目）⇒ 用 `cmd /c rmdir` 逐个删除（**只删链接，不触及目标**），清空后的 `@local/` 目录一并移除；健全的 `@beibingyangliuying/dsh-autoresearch-preset` → 本仓库经复核仍为 Junction 且目标存在 ✓。该清理在 profile 侧，不在本仓库。**教训**：`docs/00_overview.md` 曾把隔离写成"保留制"、这两条死链也曾长期存在——都是"旧布局的痕迹留在文档与 profile 里"，靠一次通读核不出来，只能靠"每次动作都复核目标是否存在"逐个发现。

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

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（`isWriteAccepted`）· [`tools/zotero-local-api-selftest.mjs`](../tools/zotero-local-api-selftest.mjs)（新：2xx 判据 + "未 open 不许写"的门禁契约，后者在发请求前就抛，因此可离线测）· [`README.md`](../README.md) 与 [`docs/00_overview.md`](00_overview.md) 的自测清单。

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

## 34. 发布 0.2.0：本地全绿是关于工作树的断言，不是关于发布件的断言（2026-10-15）

**背景**：[`README.md`](../README.md) 里那条 `dsh plugin --profile web add github:beibingyangliuying/dsh-autoresearch` 是给别人用的唯一安装入口，而 GitHub 上的 `main` 停在 `a800b9b`（2026-10-13），本地 HEAD 已领先 **47 个提交**。⇒ 那 47 个提交里的工作（两个通道改自带 helper、`preset-paths.js`、§32 与 §33 的修复）**对外都不存在**；照 README 安装的人拿到的仍是挂两个 `uvx` MCP 行、需要 Python 环境的旧版。**14 项本地自测全绿也看不见这件事**——它们读的都是工作树。

**发布动作**：6 个提交（两处 P0 文档回扫修正、`contact-bridge.js` 的陈旧理由句、两轮去个人化、版本号独立提交）→ `package.json` 0.1.0→0.2.0 → annotated tag `v0.2.0` → 先推分支再推 tag。远端 head 与 tag 均已核对为同一提交。

**从远端复核**（新增 [`tools/release-check.mjs --tag`](../tools/release-check.mjs)）：读 tag 上的 `package.json`（版本 0.2.0）、组合（`id: mcp-*` **0** 条、`command:` **0** 条、`uvx` **0** 次）、以及 5 个必需 helper 的状态（全 200）。**这是唯一能看见"别人到底装到什么"的检查**，因此它有一个 `--tag` 模式而不是只读本地。

**代价与边界**：`--local` 把"工作树干净"当失败项——那是**打 tag 的前置条件**，不是开发每一步的条件；开发中途跑它会有这一条红，这是刻意的（一个永远绿的检查等于没有检查）。

**教训（三条）**：

1. **"本地全绿"是关于工作树的断言，不是关于发布件的断言。** 发布流程必须包含一次**从远端读**的检查，否则"我不知道远端落后多少"与"远端是对的"无法区分。
2. **一个版本的"完成"包含它可被安装。** tag 与分支 head 不是一回事：发布后 main 继续前进是正常的，但"修复已经做了"与"该 release 含有此修复"是两句不同的话。
3. **去个人化是发布动作的一部分。** 公开仓库里的测试 fixture、模板示例与设置页占位符都会泄露所有者的机器与领域；而 `docs/` 里**构成证据的量化值**（字符数、命中数、写入前后的 version）要留下——删了就把测量变成断言。

**落在何处**：[`tools/release-check.mjs`](../tools/release-check.mjs)（新：`--local` / `--tag`）· [`tools/release-check-selftest.mjs`](../tools/release-check-selftest.mjs)（新：纯函数 + 反向对照，离线）· [`README.md`](../README.md)（Develop 的工具清单、Layout）· [`.agents/skills/preset-release/`](../.agents/skills/preset-release/SKILL.md)（新：本仓库自己的维护 skill——自检 → 发布 → 远端复核，**不进** `skills/`）· [`protocol.md`](../protocol.md)（Revision 3 条目补一句"被 Revision 9 取代"）

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

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（凭据库 + 401 自愈 + 供自测注入的 `transport` 缝）· [`tools/zotero-local-api-selftest.mjs`](../tools/zotero-local-api-selftest.mjs)（[3]–[10] 八组，**离线**计数弹窗）· 五个 helper（统一 `APP_NAME`、输出改述）· [`protocol.md`](../protocol.md)（Revision 10：§5／§6／INV-EVID-3／§9）· [`contact-bridge.js`](../contact-bridge.js)（`writeGateLine()` 与其 JSDoc、`attachmentLine()`）· [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · [`README.md`](../README.md) · [`docs/00_overview.md`](00_overview.md)。

## 36. 发布 0.2.1，以及在发布复核里抓到的 checker 缺陷：一个通不过真路径的修法（2026-10-15）

**发布内容**：契约 Revision 10 与随之的写闸门改动（见 §35）。版本 0.2.0 → **0.2.1**（独立提交 `776a4b7`），annotated tag **`v0.2.1`**（tag 对象 `18a2627`，其 `^{}` = `776a4b7`）。推送顺序照 §34：先推分支、再推 tag。

**发布前按要求做的反向声明回扫抓到一处我自己写错的引用**：§35 把"脚本也不保存 key"记成 §11（实为 §12），并把 §21 列入"以逐写弹窗为前提"的条目（§21 的前提是闸门的**范围**，不是**粒度**）⇒ 单列提交 `2fee875` 修掉。一条指错地方的更正比没有更正更坏：下一位读者顺着它去找，发现旧话还立着，只会得出"更正本身错了"的结论。

**从远端复核**（`release-check.mjs --tag v0.2.1`）：发布件声明 0.2.1 ✓、组合不挂任何 MCP 也不启动任何东西 ✓、两个通道所需 helper 全在发布包内 ✓。

**本轮真正的教训：一个通过了自己自测的修法，在真实路径上什么也没修。**

那次 `--tag` 打的是 `v0.2.1 -> 18a2627…`（**tag 对象**）对 `main -> 776a4b7…`，并据此打印 *"the branch head has moved past this tag"* —— 而 `refs/tags/v0.2.1^{}` 与 `refs/heads/main` 是**同一个 commit**。成因：`ls-remote` 对 annotated tag 回**两行**（tag 对象 + peeled commit），而代码 `.find()` 了第一行 ⇒ 拿**对象类型都不同**的两个 SHA 相比，annotated tag **永远**不可能相等 ⇒ **每逢 annotated 发布必然误报**。0.2.0 那次它"碰巧"说对了（main 后来确实前进），缺陷因此藏住；§34 记录的"手工核对"正是当年绕开它的方式。

修的时候差点犯第二个错：只把"优先取 peeled 行"改好，离线自测**全绿**，而真实远端**照旧误报**——因为 `git ls-remote <remote> refs/tags/v0.2.1`（**精确 ref**）**根本不输出** peeled 行。⇒ 我那份夹具**比现实宽容**，把残废的修法放行了。补上第二半（查询显式加 `refs/tags/<t>^{}`）之后，两个方向都在真实远端验过：`v0.2.1`（tag 就是 main 头）不再报，`v0.2.0`（main 真的前进了）照报。

**教训（两条）**：

1. **比值之前先比对象类型。** 一个"绝不相等"的比较不会失败，它只会**一直说同一句话**——这种检查比没有检查更坏，因为它把谎话说成了证据。
2. **夹具要比现实更苛刻，不能更宽容。** 只按"我希望命令给我什么"造夹具，就会漏掉"命令实际给什么"；这次的分界恰好在**查询本身**。⇒ 修检查时，先跑一次真命令，把它的实际输出抄下来当夹具。

**落在何处**：[`tools/release-check.mjs`](../tools/release-check.mjs)（`tagRefQuery`／`taggedCommit`／`branchHead` 三个纯函数，修法为 `38e4529`）· [`tools/release-check-selftest.mjs`](../tools/release-check-selftest.mjs)（新增 [5] 八条，含"精确 ref 无 peeled 行"与"查询必须显式要 peeled"两条反向控制）· annotated tag `v0.2.1`。

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
5. **执行者分规模**：单篇 inline；**≥3 篇**才一篇一子代理，且子代理**只起草到工作区文件**，入库与回读一律留在父代理（库改动是受门控、可审计的动作，放一处才查得清"没重复、没覆盖"）。

**试点实测（05-2 未做的两篇，全部真写入）**：

- `ASAQH5A3 The continuation power flow` → 3 条：`QE78EVJR`(§2, 2053) · `TS36N2CG`(§3, 2922) · `MYSL4ABF`(§4, 1711)；选节为"潮流方程重构／预测–校正求解／由切向量的灵敏度信息"，跳过引言、算例与结论。
- `VZC2PQLB Voltage stability evaluation using modal analysis` → 2 条：`AQZTGMGQ`(§2, 4548) · `HM4A8AJC`(§3, 2622)；选节为"模态分析方法／设备建模"，跳过引言、应用算例、结论与讨论。
- **反向控制**：写完后对 `ASAQH5A3` 再写一次 §2 → `REFUSED: §2 is already covered by note QE78EVJR (read from its marker)`，**exit 1**，条目笔记数仍为 3（未新增）。
- `297FISBF` → 计划即报 `NO PDF/EPUB/HTML ATTACHMENT`，未写任何东西。
- **一个实测约束**：本库把笔记正文**逐字存储**，不替我们补 `<div data-schema-version="9">` 外壳（他手写的旧笔记有那层外壳，是编辑器加上的）。工具因此不猜那层外壳。
- **一处实测的读数困难**：`ASAQH5A3` 是扫描件 OCR，节标题被识别成 `P SOLUTIOCN`、`-P IZATION AND THE CORRECTOR`，编号不可读 ⇒ 本纪律要求"把据以切分的标题行原文写进报告"，两条相应笔记末尾也注明了"该式按同节符号定义复原，逐字核对请回 PDF"。

**否掉的替代方案**：并进 `literature-recon`（零契约变更，但把两件事塞进一份契约，且该文件已 258 行）· 只加常驻纪律（与 §2"纪律放 skill、persona 只留指针"相反，判据表也无处安放）· 复用 `zotero-note.mjs` 的 marker 语义（重跑即重复）· 直接覆盖旧笔记做"风格整理"（那是重写而不是整理）· 沿用现有裸 `[ ]` 公式（实测那是复制损坏，不是风格）。

**本轮未做／未测（明确登记）**：`--tidy` 的**写入**路径本轮未执行（junhan 选择"先只做新笔记"，整理另行开轮）——其干跑路径已在真实笔记 `HUBAWKBF` 上验证（3574→3672 字符，19 处 `[]` + 36 处 `()` 转换，0 处 left alone）；05-2 的 `297FISBF` 缺附件无法做；批量 fan-out（≥3 篇）未跑；`ASAQH5A3` 的节号是**数顶层标题得来**的（原文编号不可读），若日后拿到带编号的版本需复核。

**落在何处**：[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（九节骨架 + 选节表 + 模板 + 就地排除条件）· [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs) 与其 [自测](../tools/zotero-section-note-selftest.mjs) · [`tools/zotero-read.mjs`](../tools/zotero-read.mjs)（`--item` 读笔记正文，此前只能读到元数据——纪律点名了一把打不开的尺子）· [`cordis.patch.yml`](../cordis.patch.yml)（路由第 9 条）· `protocol.md`（Revision 11：§4／§6）· [`surface.md`](../surface.md) · [`README.md`](../README.md) · [`docs/00_overview.md`](00_overview.md) · [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs)（8→9）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（路由 8→9）。


### 37-补. 审阅一轮之后的收尾：行间公式改块状，以及"库会改写你的笔记"的三个后果（2026-10-16）

**起因**：junhan 审阅通过这 5 条笔记的内容，只提一点——行间公式应写成 `$$` 单独成行的块状，而不是挤在一行。

**这一轮实测到的三件事**（都改变了工具行为，不是润色）：

1. **笔记标题在这个库写不进去**：对同一条笔记、同一把版本守卫，`{"tags":[…]}` → **204** 且读回生效（version 2160→2171），而 `{"title":"section 2 probe"}`（纯 ASCII，排除中文与 `§` 的干扰）→ **HTTP 500**，读回 `title=null`。⇒ 原计划"给笔记加标题、子笔记列表可辨"**前提不成立，退回不加**；节号只能靠正文首句与不可见 marker。
2. **应用会剥掉不可见 marker**：junhan 在 Zotero 里打开审阅过的那条（`AQZTGMGQ`）已被应用规范化——多了 `<div data-schema-version="9">` 外壳、**marker 注释消失**；它仍被正确识别为 `§2 (opening)` ⇒ 当初"幂等判据必须能读开场句"的决定被真实数据验证：marker 只是提示，开场句才是键。
3. **块状换行只在"裸笔记"上存得住**：API 直写的 4 条换行完整保留（`TS36N2CG` 的存储文本里可见 `<p>$$`⏎`t_k = \pm 1`⏎`$$</p>`，再次干跑即 `nothing to do`）；而被应用接管的那条，写入块状后**库把它折回一行**。⇒ 工具新增 `isApplicationWrapped`：对这类笔记**不尝试换行**并明说原因，避免"每次都想改、每次都改不动"——正是 §36 记下的"永远通不过的检查只会一直说同一句话"。

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
- 文本：[`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（§7 那条 bullet 写明"重跑不添加，并且会这么说" · §4.2 新增排除条件一行）· [`protocol.md`](../protocol.md)（**Revision 13**：头部、§6 笔记条款、`INV-EVID-4`）· [`README.md`](../README.md) · [`docs/00_overview.md`](00_overview.md)（自测清单那两行）。

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
- 文本：[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md)（§2 读体检并先报覆盖表 · §3.3 顶层是单位 · §4.2 三行新排除条件 · §6 新增 `## Coverage` · §7 判据归阅读 · §8 清单）· [`protocol.md`](../protocol.md)（**Revision 14**：头部、§4 sections 行、§6 笔记条款）· [`README.md`](../README.md) · [`docs/00_overview.md`](00_overview.md)（补上此前漏列的逐节笔记自测行）。

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

1. **缺口不是"忘了写"，是这份文档的读者从未被定义过。** 现有四份各答一个问题：README 的 "What you get"（段落级、英文、面向安装的人）· [`protocol.md`](../protocol.md) §4（规范上一行一条纪律，而且 DOC-1 **禁止它出现任何符号名**）· [`surface.md`](../surface.md)（概念 ↔ 名字的索引，不问覆盖）· [`docs/00_overview.md`](00_overview.md)（**一行一个"步骤"**，不是一行一个"部分"）。"谁负责"有了、"保证什么"有了、"为什么"有了，**"每个部分覆盖什么 / 拒绝什么 / 触发条件 / 产物落在哪"没有**。
2. **每部分的细节此前只有一种成文形式：九份 `skills/*/SKILL.md`**（英文、面向模型的激活、合计约 1,100 行）。所以所有者要理解整体，除了问 agent 没有第二条路——这正是这次发生的事。抽查证实：读 PDF 那一侧的事实（附件按 `PDF → EPUB → HTML` 挑、**本预设不做 OCR**、读阶梯、单次结果超 8,192 字符被裁剪器掐中间、覆盖靠读笔记第一段裁定）在中文读者文档里几乎一处也没有。
3. **但"再手写一份名单"会撞上仓库自己立的规矩**：[`00_overview.md`](00_overview.md) 头部写着"本文不重复符号清单——两处列同一批名字必然漂移"，DOC-6 甚至禁止 README 正文重复符号，而 §36 那一轮刚抓到两处陈旧计数（`package.json` 写 "eight" 实际 9 条纪律；README 写 "Eight helper programs" 可它自己枚举 7 个）。⇒ **病因不是名单多，是没有一份名单有仪器校。**

**派生能力的边界（一条关键实测）**：九份 SKILL.md 第 8 行都是同一句式 "This skill does exactly one thing: …"，但**否定句写法不统一**——七份是 `It does not…`，`metadata-query` 与 `section-notes` 是 `It is not…`。所以可派生的**只有名册**，中文描述只能人写。护栏的边界因此被定死为：**名册与路径机器校，描述由阅读负责**——与"窄机械护栏 + 阅读裁定"那条规则设计偏好同构。

### 43.2 裁定（junhan 三项逐项定，均取推荐项）

1. **新增 [`docs/02_coverage.md`](02_coverage.md)**：中文「覆盖与边界地图」＋ 一篇"指定一篇文献之后发生什么"的流程叙事。覆盖层级＝**纪律 + 两条外部通道 + 工具入口**。
2. **新鲜度护栏扩展进 [`tools/doc-selftest.mjs`](../tools/doc-selftest.mjs)**，不另起文件（另起必然把 `documentedPathExists`／名册派生那套复制一份，正是仓库反对的漂移源）。
3. **与 `00_overview` 那句话的冲突**：**保留原话**，改在地图头部声明它是"被机械校验的第二份名单"。两份名单各答一个问题——`surface.md` 由 DOC-5 校"概念↔名字"，地图由 DOC-9 校"部分↔skills/"，**都漂不了**；"必然漂移"说的是无人校的名单。

### 43.3 落点与验证

- 新增 [`docs/02_coverage.md`](02_coverage.md)：常驻纪律一行（**不复述 §3 的条款**，只指过去，因为那正是会漂的那种复述）· 按需纪律表（覆盖什么／明确不做／何时加载／权威文本）· 两条通道与写侧工具入口（**一律不写计数**——上一轮的两处陈旧计数就是前车之鉴）· 流程叙事七步（先查 refs 索引 → 体检 → 建节表 → 判覆盖 → 只写没覆盖的方法节 → 干跑/授权/`--write`/回读 → digest 与读状态标签）· 最后一节写明它**不管**什么。
- [`tools/doc-selftest.mjs`](../tools/doc-selftest.mjs)：`disciplineNames()` 从 `authoritativeSymbols()` 里析出（**无行为变化**的纯重构，DOC-5 语义不变）· **DOC-9** 名册一一对应（漏一条／多一条都失败）· **DOC-10** 地图必须自称非规范并指向契约 · **DOC-8** 把地图纳入路径检查 · 新增三条反向控制。
- 同步：README（Layout 的 `docs/` 行 · Develop it 里 `doc-selftest` 的注释）· [`docs/00_overview.md`](00_overview.md)（"看哪里"表新增一行）· [`preset-release`](../.agents/skills/preset-release/SKILL.md) 第 2 步的读者文件清单，并写明**地图只有名册与路径被机器校**。

**验证**：`doc-selftest --negative-controls` —— 10 条检查 PASS，9 条反向控制**全部咬住**。但在把它做绿之前，护栏抓到了我自己两个错，都记在这里：

1. **地图里的 `../protocol.md` 被判成 stale**。查实的不是地图写错，而是 DOC-8 的缺口：它用 `documentedPathExists` 从**仓库根**解析，却把 `..` 当普通目录名，于是判不了任何父级相对路径——而地图是**第一个被纳入该检查的 `docs/` 文件**，此前 `docs/` 从未进过 DOC-8 的范围。修法：`..` 开头的 token 直接跳过，并写明理由（它是**链接标签**，不是关于仓库布局的断言）。
2. **我给新反例写的"改名"只改了大小写**（`zotero-READ.mjs`），反例因此**什么也没校**——Windows 的 `existsSync` 大小写不敏感。已改成实质改名，并把这条仪器局限写进注释（大小写改名只在 Linux 上看得见）。

### 43.4 未做与边界

- 护栏只校**名册与路径**，不校中文描述是否仍然准确——那份职责在发布前的"重扫相反主张"里，已写进 `preset-release` 第 2 步。
- 地图**不覆盖**脚手架、工具隔离、诊断与发布（README 已经管了），只留指针：同一件事写成两份，就是 §36 那两处陈旧计数的来路。
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
- [`surface.md`](../surface.md) ＋ [`docs/02_coverage.md`](02_coverage.md) 各 +1 行（DOC-5／DOC-9 的机械要求，漏了自测会红）。
- 新增 [`project-template/research/adoption/README.md`](../project-template/research/adoption/README.md)（含一条填好的示例项）＋ [`project-template/README.md`](../project-template/README.md) 的 Layout 两行。
- [`protocol.md`](../protocol.md) **Revision 15**：§4 一行 · §7 布局与权威层级（**既不支撑结论、又约束代码**，两边各占一半）· §8 新增 `INV-ADOPT-1..4` · §9 拒绝"读过了就算可采用"。
- [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs) 与 [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs) 的计数 9→10。**注意**：`preset-selftest` 读的是**组合后的树**，必须先 `dsh --profile web --dump-config > .tmp\composed-web.txt` 重生成，否则它核对的是上一轮的现实（这次正是先红了 4 项才发现的）。
- **语言分工**：纪律正文英文（与另九份同语言，`skills-selftest` 只读 front matter，语言不影响功能）；中文读者层在 `02_coverage.md` 与新的一节里。
- **验证**：`skills-selftest` PASS（`registered=10`）· `preset-selftest` PASS（`ten skill-routing bullets`，含新名）· `doc-selftest` PASS（含 10 条反向控制）· `isolation` / `client` / `contact-bridge` 自测 PASS · `new-project.ps1 -DryRun` 显示会创建 `research\adoption\README.md`。
- **零新增工具**：读侧复用 `zotero-section-note.mjs --item <recordKey>`（计划态，不写库）与 `zotero-read.mjs --item <noteKey>`；不新造 helper，也就不新增工具自测。

### 44.6 未做与边界

- **这条纪律还没在任何真实文献上跑过一遍。** 本轮落地的是纪律文本、契约与脚手架；端到端（拿一篇真论文 → 产出第一份 ledger → 由 junhan 逐项裁定 → 真写一次代码并用锚点断言）留给下一轮。在此之前，它的判据只是**写下来的**，不是**试过的**——这正是它下一步最该被验的地方。
- `INDEX.md` 与代码侧的联动（代码注释或测试引用 `A-<key>-NN`）没有仪器校，这轮只把格式与时机写进纪律。
- 没有"论文被撤／更正"的自动探测：重开条件由人写、由人触发。

## 45. 脚手架向一个成熟课题的文档架构借了六件机制、拒了它的六层骨架（契约 Revision 16，2026-10-17）

### 45.1 起因

junhan 要求把本预设推荐的文档组织，与一个**已经成熟的课题**逐项对照：
`doc/局部电气设备减隔震对区域电网地震级联风险的跨尺度影响机制/`——六层（`specs` / `records` / `design` /
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
- **P3 的初稿措辞与本仓库既有裁定冲突**：§11 记"给工作区上 git | **不上**"、`archive/PLAN.md:354` 记
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
| **P7** | 新增 `tools/scaffold-selftest.mjs`：把契约 §7、本仓 README、课题继承的权威表**三份名单**互相校 | `tools/` + README + `00_overview.md` |
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
   `docs/02_coverage.md`）。README 的"已知约束"里本来就写着这一条——这次是它第一次咬到自己仓库的编辑。

### 45.6 未做与边界

- **没有任何真实课题跑过这套新脚手架。** 判定它好坏的证据目前只有"三份名单一致"与"读起来更清楚"，与
  §44.6 同样诚实：判据是写下来的，不是试过的。最便宜的端到端试验是：开一个临时课题 → 写一份协议 →
  跑一次 → 镜像一个产物 → 退休一份文档，然后看这四条规则**花的力气是否大于省下的**。
- **P6 仍开着**（mnemon Documents 与课题自带规范层的边界），理由与证据见 §45.3 那一行。
- **顺手发现的两处陈旧计数已单独修掉**（`.agents/skills/preset-release/SKILL.md` 说"eight routing names"
  实为 10；`project-template/.agents/skills/domain-discipline/SKILL.md` 说"four skills"实为 10）——它们是
  §36"不写散文计数"那条规矩的同族缺陷，不属于本轮关注点，所以单独一个提交，便于单独回滚。

### 45.7 取代关系（发布自检时补记）

- **本节取代 §8 记的卡字段表**（2026-10-13 那次把预测列在卡里）。§8 是当时的决策记录，原样保留；今天
  卡片与协议的权威定义在契约 §1、§4 与纪律 §3.1，而字段本身分成两份文件。
- [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4 的发布自检清单
  **漏了两个自测**（`zotero-section-note-selftest.mjs` 是 §41 那轮加的、`scaffold-selftest.mjs` 是本轮加的）。
  README 的那份清单有仪器校（`release-check-selftest` 的 [4] 段），这份没有 ⇒ 这是同一类漂移的第二个实例，
  处置记在本轮的发布条目里。

## 46. 发布 0.3.0：自检抓到的是两份名单与四个示例，不是代码（2026-10-17）

### 46.1 起因与范围

junhan 要求发布新版本，并按 [`preset-release`](../.agents/skills/preset-release/SKILL.md) 先自检。
`v0.2.1` 之后共 **33 个提交**（含上一轮的第十条纪律与契约 Revision 15），其中 **14 个此前从未推送**。

### 46.2 自检结论（Phase 1）

- 16 个离线自测 + `preset-selftest` + `release-check --local` **全部 PASS**（含新的 `scaffold-selftest`
  与它的 5 条反向控制）。
- **persona 4726 字符 ≈ 1313 token，与 Revision 15 那轮完全相同** ⇒ §45.2 说的"本轮零常驻成本"由仪器
  确认，不再是推断。
- §2 的"反方向声明"重扫抓到三处（46.3），§6 的痕迹扫描抓到两处（46.4）。**两份名单与四个示例**是本轮
  被修的东西；这一版没有改任何代码行为。

### 46.3 §2 重扫：三处"别处还在说旧话"

| 命中 | 处置 |
|---|---|
| [`00_overview.md:22`](00_overview.md) 仍写"实验卡：**假设**/命令/…" | **已修**：改成预注册＋实验卡两件，且卡引用协议 |
| [`01_decisions.md`](01_decisions.md) §8 记的卡字段表（2026-10-13） | **不改写**（它是当时的决策记录），在 §45.7 写明被取代——"退役的主张不得以降级形态存活" |
| [`preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4 的发布清单 | **漏两个自测**：`zotero-section-note-selftest.mjs`（§41 加的）与 `scaffold-selftest.mjs`（§45 加的）⇒ **加仪器** |

处理第三处的方式值得记下来：那份清单是散文，没有任何东西校它，所以它已经漂了两次；而 **README 里同一
批名字的清单有机器的校**（`release-check-selftest` 的 [4] 段），一直是准的。⇒ 现在同一个 `documentedSelftests`
同时读这两份名单，并且**先用真实缺陷驱动过**：在补齐之前，新检查报的正是
`scaffold-selftest, zotero-section-note-selftest` 两个名字。**没有新造工具**——[4] 段本来就有这个函数，
发布清单只是它的第二个调用方。

### 46.4 §6 痕迹扫描：两处发现，三处判定为"不是痕迹"

**发现一：脚手架的四个 EXAMPLE 用**属主的研究领域**自证。**
`AGENTS.md.template` 的 invariants（"cross-scale risk study"、fragility model、event-tree descendants、
`DESIGN PENDING`）、`research/literature/README.md` 的两行示例（cascading load loss、motif）、
`research/adoption/README.md` 的示例项（无功灵敏度、`jacobian.reactive`、标幺、回落到完整潮流求解）、
`research/domain-discipline` 的 `fragility-review`。
**全部改成不含领域**：invariants 保留每一条 never 规则与它的理由、只是不再点名任何模型；文献两行改成
"阈值以下平坦、阈值以上陡升"这类无领域表述；adoption 示例改成通用的一阶敏感性（`Δy = JΔx`）。
其中 **adoption 那份从未发布过**——它落在上一轮未推送的提交 `d07e09d` 里，所以这次改的是"还没出门的"。

**发现二：`zotero-section-note` 的夹具里有电压／连锁故障的字样。**
判断是：**被解析的是形态**（罗马数字＋全大写标题＋旁边的中文节标），措辞从来不是证据 ⇒ 同法替换，并把
`zotero-section-note.mjs` 的注释改成"**形态**在属主库上实测；这里的措辞是替身"。

**判定为不是痕迹、因此保留的三处：**

- pitfalls 示例里的 **OneDrive**：它是**产品名**而不是本机路径，且该文件的设计就是"按你会搜的词检索"，
  指名才有用。
- README 的 **`%USERPROFILE%`**：那是文档化的命令语法，不是这台机器的路径。
- `skills.js` 与 `doc-selftest.mjs` 里的 **reparse point 注释**：它们解释的是"为什么目录扫描不问
  `Dirent.isDirectory()`"——那是**证据**，删掉就把一次真实踩坑变成一句无来由的禁令。

### 46.5 版本、tag 与远端核验

- **0.3.0**（minor）：两条纪律、契约 Revision 15 与 16、脚手架布局变更、新增一个自测。契约的 Revision
  号与包版本号**独立**，不耦合（沿用 §44 的记法）。
- 版本号**单独一个提交**，排在所有修补之后，使 tag 指向的树恰好是这一版。
- **本地全绿是关于工作树的断言，不是关于发布件的断言**（§34 的教训：0.2.0 发布时 47 个提交的绿色本地
  工作谁都装不上）。所以 tag 之后必须跑 `node tools/release-check.mjs --tag v0.3.0`——它从远端读发布的
  `package.json`、组合与 helper。

### 46.6 未做与边界

- **仍然没有任何真实课题走完这套新脚手架**（沿用 §45.6）：本版能证明的是"两份名单一致""示例不含领域"
  "全套自测绿"，**不能**证明这些规则在真实研究里好用。
- **P6 仍开着**（mnemon Documents 与课题自带规范层的边界）。
- 领域示例的修改只动了**示例块**（`EXAMPLE:BEGIN … END`，课题本来就要删掉它们），没有动任何规则的措辞。

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
检查）· 本文件 §23 的现象段就地标注更正（**不改写历史决策**，沿用 §46.3 的规矩）。

### 47.4 护栏与验证

`preset-selftest` 的第 [4] 段原来**守着这个 bug**：它断言 `{{cwd}}` 占位符必须存在。现在改为三条：

1. **点名旧错误**：`{{cwd}}` 不得出现在预设块里——"命名替代品而不命名错误，就是在请错误回来"。
2. **守住整类错误**：组合后预设块里出现的每个 `{{name}}`，与**内核注册表**逐一比对。注册表不是硬编码名单，
   而是从 profile 解析到的 `@deepseek-ai/dsh-agent-loop` 里读出的 `systemPrompt.variable(...)` 字符串实参
   （并合并本包自己的行，使预设日后自注册变量不会被误报）；**读不到内核时响亮 FAIL**，不静默通过。
3. **变异驱动**（§3 的规矩）：把 `{{cwd}}` 与一个从未注册的名字分别注进 dump，新检查必须各自 FAIL，然后
   还原。

### 47.5 未做与边界

- **没有回改 `docs/archive/PLAN.md`**：那是归档时间线，`{{cwd}}` 在那里是当时的记录。
- **`$DSH_HOME/.agent-presets/vibe-math-v1..v4` 同样在用 `{{cwd}}`**（v1:13/41、v2:14/37、v3:17/28、
  v4:20/54，其中三处拿它拼 `<cwd>/VibeMath/Projects/<project>/` 路径），会以完全相同的方式整轮失败。本轮
  junhan 决定**只修本预设**，这四个个人预设留待另行安排。
- 本轮**不是发布**：没有 bump 版本、没有 tag——只做修复、护栏与记录。

## 48. 发布 0.3.1：两条实现向契约对齐的修复，和一条只能声明"没测过"的内核窗口（2026-10-18）

### 48.1 起因与范围

§47 的 `{{cwd}}` 迁移修完后，junhan 提出两件事：工作树里还躺着 **4 个 zotero 工具改动**（来源不明，需先定性）待提交，以及"没什么问题就该发版"。⇒ 本轮 = 两条 zotero 修复（各自带自测、各自一个提交）· 一条**内核实测窗口声明**（`engines.dsh`）· README 与新版本号。**协议不动**：两条修复都是**实现向已有契约对齐**，故 `protocol.md` 不 bump Revision（沿用 [`preset-release`](../.agents/skills/preset-release/SKILL.md) §2 的规矩：契约不动，改实现）。

### 48.2 两条 zotero 修复（实测值，不是推断）

1. **标签交换曾被静默跳过**。`changedFields` 对每个字段用 `String(value)` 比较，而本轮实测 `String([{tag:'/done'}]) === String([{tag:'/unread'}]) === "[object Object]"` ⇒ 换标签被判成"无变化"，`zotero-edit.mjs` 打印 *"No change: every value asked for is already what the record says. Nothing to write."*，**写入从未发生**，于是 §6 依赖的写后回读也没有执行——工具报告了一个记录并不支持的结论。修法：数组按 `normalizeTags` 的内容比（干跑、补丁、回读本来就用同一归一化），标量仍走文本比。自测两向：一换一是变化，同标签不是变化。
   **一处值得记的反差**：§31 早把"**写后回读**并逐字段比对（**标签按归一化后比**）"写进决策，而**写前**那道"这算不算变化"的闸门没照同一条走——同一条规则只落实在链条的后半段。这不是记录过期，是**实现只对了一半**。
2. **点号序号读不回来**。`readSectionMarker` 只认 `(\d+)`，而它上方十二行的 `normalizeSectionToken` 明写点号序号按原样识别并给了理由（旧笔记、回收站里的历史数据）。本轮实测：`sectionMarker('3.1')` 产出 `<!-- autoresearch-section: 3.1 -->`，**旧正则读出 `''`**，修后读出 `'3.1'`。覆盖单元不动：`parentSectionToken` 仍把它归到顶层 `3`，正是 §6 计的那个单位。⇒ 今天在库里看不到差别（§41 实测"带小数点键的逐节笔记全库 0 条"），它修的是**回退路径的自相矛盾**。

### 48.3 内核窗口：机制、依据，以及它表达不了什么

**决策（junhan 逐项确认，取 A）**：`package.json` 增 `engines.dsh: ">=0.2.0-rc.2 <0.3.0-0"`。

**机制（实测 `dsh-app-boot`）**：`evaluatePluginCompatibility`（`lib/index.js:311`）由**自己的 `engines.dsh` 一票判定，此时 `peerDependencies` 被完全忽略**；匹配走 `semver.satisfies(…, { includePrerelease: true })`（L276-277）。不满足时 `loadProfileDirectory`（L1020-1040）把**整个 bundle** 放进 `skippedBundles` ⇒ 启动时 `reportSkippedBundles`（L537，由 CLI 的 profile-boot 调用）在 stderr 打一行 `skipping profile bundle …`、schema 诊断里多一条 error（L3462-3465）、预设**不进新建会话名单**；另留"精确 `name@version` ↔ 精确 runtime"的豁免通道。这正是我们要的失败方向：**响亮地缺席**，而不是像本轮这样"留在名单上、每轮都失败"。

**区间实测**（用内核自己的 semver 跑）：`0.2.0-rc.2` IN · `0.2.1-alpha.2` IN · `0.2.1-rc.2` IN · `0.2.5` IN · `0.2.0-rc.1` out · `0.3.0-0` out。声明后重新组合，dump 里**没有** `skipping profile bundle` 行 ⇒ 不会自锁。

**下限为什么是 `0.2.0-rc.2`，而不是本轮验证过的 `0.2.1-rc.2`**：(1) npm 的 `latest` 就是 `0.2.0-rc.2`，下限写 0.2.1 会让按默认渠道装 DSH 的人**装不上**；(2) 本预设此前就活跑在 `0.2.0-rc.2` 上（§47.1 的升级起点）；(3) 实测对比——我们声明的 **28 个行包名逐一**出现在该版本官方 `standard.patch.yml` 的行名里，零缺失。

**这条声明表达不了什么（写清，免得下一个人把它当护栏）**：`0.2.0-rc.2 → 0.2.1-rc.2` 同在区间之内，而"`cwd` 退出提示词变量注册表"不写在任何元数据里 ⇒ 版本区间只是"没测过的版本别跑"的**粗门**，能抓住这一类的仍是 §47.4 的注册表检查。两条不是替代关系。

**否掉的替代方案**：只设下限 `>=0.2.0-rc.2`（0.3 线也默许跑，撞坑仍表现为每轮失败）· 逐包 `peerDependencies`（DSH 只做版本比对、不做解析，但 pnpm 对 `link:` 包的 peer 行为本轮**未实测**，且约 20 条要跟着行清单维护）· 不声明只文档（全新安装撞上未测版本时没有任何前置拦截）。

### 48.4 自检结论（Phase 1）

- **17 个离线自测 17/17 PASS**（本轮在 zotero 提交后重跑）；`preset-selftest` 的两条新检查输出 `{{model}} / kernel registers: provider, model`。
- **反向控制**（§3 的规矩，三条分支都驱过）：注入 `{{cwd}}` → 两条 FAIL；注入从未注册的 `{{workspace}}` → 注册表那条 FAIL；让 profile 解析不到内核 → `could not read the kernel registry` **FAIL**，不静默通过。
- `release-check --local`：composition 不挂 MCP / 行名经 `exports` 可解析 / 两份自测名单一致，全 OK；"工作树干净"在打标前必然 FAIL（tag 前置条件，不是开发前置条件）。

### 48.5 §2 反方向重扫与 §6 痕迹扫描

- 重扫口径＝本轮改动的三条声明（"标签交换不算变化"、"点号标记读不回来"、"本预设支持的 DSH 版本"）。结果：**相反说法只存在于实现里**（48.2 的两条），散文侧无一处陈述它们；[`docs/02_coverage.md:60`](02_coverage.md) 的"改条目的字段与标签"与 [`docs/00_overview.md:79`](00_overview.md) 的"无变化即不写"，在本次修复之后**才**完全成立，故不改写。
- `protocol.md` 不动：§3 的十一条纪律与路由未变，而 §6 的写入门禁与写后回读，正是被这两条修复**兑现**的东西。
- §6 痕迹：本轮新增行（`engines.dsh`、README 一段、本节）不含本机路径、盘符或属主库标识。

### 48.6 版本与 tag：验证先于打标

- **0.3.1**（patch）：四个改动全是修复、无契约 Revision；0.3.0 已含上一轮两条纪律与 Revision 15/16。版本号**单独一个提交**，排在所有修复之后，使 tag 指向的树恰好是这一版。
- **顺序是刻意的**：`{{cwd}}` 那条修复起初只被"内核源码 + 变异驱动"证明过，而 `preset-release` §3 写着"绿色本地套件对发布件什么都没说"、§7.5 要求从远端核验发布件。⇒ 先重启宿主、在活会话里跑通（下一条），再 bump → `release-check --local` 全绿（含干净树）→ annotated tag → push 分支与 tag → `node tools/release-check.mjs --tag v0.3.1`。**远端写入需 junhan 明确同意。**
- **活会话验证（2026-10-18，已完成；用 `tools/dump-session.mjs` 复核转写，不靠"看着像正常"）**：
  - **重启后**在本工作区新开一条 autoresearch 会话：`ran=autoresearch created=standard selection-records=1`（§26 的读法——看那条独立事件，不看 session 记录里创建时的默认值）；persona 首行渲染为 `You are a research agent powered by the deepseek-v4.1-flash model.`；`unknown prompt variable` 出现 **0** 次、`deployment:persona-suffix` **0** 次（空段落不再进提示词）、`Your working directory is` **0** 次，而 `Current working directory` 出现 **2** 次；`turn/end` 的 reason 是 `{kind: "completed"}`；该会话的回复**自己说出了工作目录** ⇒ §47.2 断言的替代路径在真实会话里到位，而且做到位的是它，不是"没报错"。
  - **对照组＝重启前那条失败会话**（另一个工作区）：同一句话出现 **2** 次、`turn/end` **两次都是 error**。⇒ 诊断时"截图里那两行应该是同一次失败被记了两次"的推断，据此更正为事实：那是**两轮**各自失败。修复前后各一条转写，是本轮唯一同时具备"症状"与"消除"两侧读数的那件仪器。
- tag 之后的实测结果按 §46 的惯例记在**下一轮**，不回头改本节。

### 48.7 未做与边界

- `$DSH_HOME/.agent-presets/vibe-math-v1..v4` 仍在用 `{{cwd}}`（§47.5），本轮未动。
- 窗口声明不覆盖 client 半，也不覆盖行名解析（后者由 `INV-ROW-1` 与 `preset-selftest` 守）。
- **仍无一条真实课题走完这套脚手架**（沿用 §45.6/§46.6）。

