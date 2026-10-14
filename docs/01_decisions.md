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
| 让 Zotero 集成支持写回 | **已实现**（闸门由 Zotero 原生强制） | 工具 `tools/zotero-write.mjs`；**每次写入都由 Zotero 弹出授权对话框**，项目所有者 点 Allow 才生效；key 单次有效且**不落盘**，agent 只能提议。2026-10-12 首次真实写入成功（`Attention Is All You Need` → key `3WJ27F2C`，条目数 1582→1583） |

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

**防重复**：写入前按标题 / DOI / archiveID 查库，命中则**拒绝创建**（`--force` 才覆盖）。已用真实条目验证（正确识别出 `3WJ27F2C`）。

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
2. **链接附件同样进全文索引，也同样能被全文检索** ✓：`/items/HG4TFJF4/fulltext` = 62,188 字符 / 11 页；`zotero_search_items("contingencies", qmode='everything')` 命中该 key。所有者的库已是 `linked_file` 为主（392/618 个附件，path 为 `attachments:` 相对形式 ⇒ 基目录已配，实测解析到 `D:\OneDrive\Zotero\`）⇒ **省空间的链接附件方案不牺牲 agent 的读取能力** ✓。
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

**现象（junhan 提出的问题，已核实到具体行）**：纪律 skill 与系统提示都用**相对**路径点名脚本（`skills/literature-recon/SKILL.md` 三处 `tools/zotero-write.mjs`；`contact-bridge.js` 的 mailto 行与附件策略行各一处），但脚本只存在于**本预设仓库**；脚手架 `tools/new-project.ps1` 只复制 `project-template/`（其中没有 `tools/`），而预设只告知 agent `{{cwd}}`。⇒ 在 `D:\studies\某课题` 里 `node tools/zotero-write.mjs` 直接解析不到，agent 唯一能做的是**满盘找这个 checkout**。这就是"agent 要来到我们这个仓库来找"的字面成因。

**决策**：路径在运行时由 `import.meta.url` 推出（新模块 `preset-paths.js`），分两处呈现——(1) `contact-bridge.js` 的 section **常驻一行**绝对目录；(2) skill 正文改用 `{{presetTools}}` 占位符，由 `skills.js` 在**注册时**替换（读盘内容保持原样 ⇒ `skills/` 仍是唯一真源）。

**先验前提（实测）**：`cliToolsDir` = `D:/OneDrive/Desktop/dsh-autoresearch/tools`（经 profile 的 Junction 加载时，`import.meta.url` 解析到真实路径）；正斜杠是刻意的，粘进 shell 命令无需转义。替换只放在 `apply()`、**不放在 `readSkills()`**——我第一版就放在 `readSkills()` 里，`skills-selftest` 立刻以 "a shipped body names a helper through the token" FAIL 抓到：那样读盘内容也已被替换，**"占位符存在"与"替换已发生"就无法同时断言**。

**为何不采用"把 tools/ 复制进脚手架"**：会出现两份真相并各自漂移；而预设本就是链接安装，绝对路径天然可用、零配置。

**成本**：该行 ~185 字符/请求（≈52 token）。

**落在何处**：[`preset-paths.js`](../preset-paths.js)（新）· [`skills.js`](../skills.js) · [`contact-bridge.js`](../contact-bridge.js) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) · 两条护栏进 [`tools/skills-selftest.mjs`](../tools/skills-selftest.mjs) 与 [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs)（裸 `tools/*.mjs` 即 FAIL；token 未被替换即 FAIL；token 指向的 helper 必须真的存在）· `protocol.md` 新增 `INV-HELPER-1`（Revision 7）。

## 24. 参考库通道换源：zotero-mcp-server 0.14.1，41 工具、默认只读、写入门禁（2026-10-14）

**决策**：`mcp-zotero` 从 3 工具只读的 kujenga `zotero-mcp` 0.3.1 **替换**（不并存）为 54yyyu 的 `zotero-mcp-server==0.14.1`，`ZOTERO_MCP_TOOLSETS=none`；写入能力**开启**，但门禁由常驻纪律写死。

**先验前提（本轮实测，全部不是推断）**：

1. **本地 API 能建 / 删分类** ✓：`POST /api/users/0/collections` → **200**（key `LEPNK6GR`、version 697），`DELETE …/collections/LEPNK6GR` → **204**，分类总数 **43 → 44 → 43**，无残留。官方文档原文：Zotero 10+ 的本地 API 支持 `POST/PUT/PATCH/DELETE` **用于 items、collections、saved searches**，另有 tag 删除、full-text 写入、文件上传；授权弹窗有 Allow / **Always Allow** / Deny，前者 key 单次有效，后者**可复用且不分作用域**，弹窗限 5 次/分钟。
2. **新旧服务器读的是同一个库** ✓：新版列出 **43 个分类 key**，与本地 API 的 `Total-Results: 43` 逐一对上（5 个根：其他 / 韧性 / 傻逼东西 / 电气设备抗震性能 / 磕盐过程论文参考）；`My Library — 622 items`（本地 API 顶层条目 `Total-Results: 612`）；`seismic`、`contingencies`（`qmode=everything`）都返回真结果。**一条假警报已排除**：带 `limit=4` 时它只回 1 个根，看着像"读到了别的库"，实为 `limit` 语义怪异。
3. **工具面成本（按 `tools/list` 全文实测）**：旧 = **3 工具 / 3,849 字符**（≈1.07k token）；新默认 = **41 / 67,743**（≈18.8k）；`none` = **35 / 59,758**（≈16.6k）。⇒ 换源净增 **≈+15.5k token/请求**（而预设 persona 常驻仅 ~1.2k）。上游 README 自称 "38 工具 / 13.4k" —— 与实测不符，**这条是上游文档错了，不是我们测错**。
4. **默认不可写** ✓：`zotero_write_capabilities` 返回 `Mode: none`（本地只读可用、无 key、无 web 凭据）。
5. **`none` 砍掉的 6 个全是只读工具** ✓（pdf outline / page layout、语义库 status / update、list / switch libraries），**12 个写工具全部保留** ⇒ "裁 toolset"与"允许写"不冲突。
6. **语义检索不可用** ✓：`[semantic]` 扩展未装，`zotero_get_search_database_status` 直接回 "install it with …"，而 `zotero_semantic_search` 仍在工具表里 ⇒ skill 必须写明"服务器自己建议的那个工具在这里无效"，否则 agent 会去调用一个只会报错的工具。
7. **全文体积**：同一篇（key `85ZCTB6Z`）新版 **54,443 字符**（≈13k token；默认按 `fulltext_display_max_pages=10` 截页），旧版 79,900 ⇒ **仍远超** `tool-result-pruner` 阈值 8,192 ⇒ 老的"落文件 + 按 offset 读"绕法**必须保留**（我最初以为截页就解决了，实测否定）。
8. **坑**：`zotero_get_collections(limit=4)` 只回 1 个根，语义未深究 ⇒ **别用 `limit` 列举分类**。

**为何 pin 版本**：`uvx --from zotero-mcp-server zotero-mcp` 每次启动都重新解析"最新版"；上游 README 至今写 38 工具 / 13.4k，而 0.14.1 实测 41 / 18.8k ⇒ 不 pin 等于让**工具面随上游漂移**，且无网启动解析失败时该行 `failOnStartupError: true` 会把**整个预设**标记为坏、新会话入口静默过滤掉它。

**写入门禁为何写进 prompt 而不是靠隔离**：这些写工具由**预设自己声明的行**注册 ⇒ scope-local；`restrict({deny})` 只过滤**继承来的**全局工具，且**拒绝 scope-local 名字**（契约 §5）⇒ **隔离在原理上管不住它们**。因此门禁只能由契约与常驻纪律承担：`INV-EVID-3` 与 §9 要求**逐次授权**，而 "Always Allow" 会把可复用、不分作用域的 key 落到 `~/.config/zotero-mcp/config.json` ⇒ 与"逐次授权"直接冲突，故在 prompt 里写死禁止，并要求"先说要写什么再请求授权"。成本：该行 ~200 字符/请求（≈55 token）。

**落在何处**：[`cordis.patch.yml`](../cordis.patch.yml)（`mcp-zotero` 行 + 行内实测注释）· [`contact-bridge.js`](../contact-bridge.js)（写入门禁行）· [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md)（工具改名 + 体积实测 + 语义检索无效）· [`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs)（pin 与 toolset 两条护栏，静默回退即 FAIL）· [`tools/contact-bridge-selftest.mjs`](../tools/contact-bridge-selftest.mjs) · [`README.md`](../README.md) · `protocol.md` §5 / §6（Revision 7）。

**顺带否掉**：并存两个 MCP 行（常驻 ≈19.9k token，收益只是"旧行为逐字可复现"）；`ZOTERO_LOCAL_WRITE=false` 硬只读（那等于回到"我们自己写 collections 子命令"，而本轮选择是直接用上游写工具 + 门禁纪律）；把 `tools/` 复制进脚手架（见 §23）。

**顺带发现（未处理，待裁定）**：profile 里有一条**死 Junction** —— `~\.dsh\profiles\web\node_modules\@local\dsh-autoresearch-preset` → `D:\OneDrive\Desktop\dsh-autoresearch\autoresearch-preset`（该子目录 2026-10-12 已上移，目标不存在）。今天**无害**（没有任何行引用 `@local/...`），建议清掉；该清理动作在 profile 侧，不在本仓库。

