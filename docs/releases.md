# 发布记录 —— 每个版本发了什么、从哪个 tag、复核结论

> **非规范。** 这是 [`decisions.md`](decisions.md) 里被移出来的一半：发布是**事件**，决策是**立场**，
> 两者的读者与寿命不同。决策与裁定仍进 `decisions.md`；新版本只进本文件。
>
> **§NN 是原节号**，旧引用（"§34"）照旧成立。正文里提到别的 §NN 时，指的是 `decisions.md` 的节。
>
> **两个文件共用一条序列**（这里跳过 `decisions.md` 已用的号：§71、§73、§75 都在那边）。**唯一一处同号不同节是
> §72**——`decisions.md` 的 §72 是 Revision 30，这里的 §72 是 0.11.0 发布记录；引用 §72 时请带文件名。

| 版本 | 日期 | 原节 |
| --- | --- | --- |
| 0.2.0 | 2026-10-15 | §34 |
| 0.2.1 | 2026-10-15 | §36 |
| 0.3.0 | 2026-10-17 | §46 |
| 0.3.1 | 2026-10-18 | §48 |
| 0.4.0 | 2026-10-18 | §51.5 |
| 0.5.0 | 2026-10-19 | §53 |
| 0.6.0 | 2026-10-19 | §57 |
| 0.7.0 | 2026-10-19 | §59 |
| 0.8.0 | 2026-10-19 | §61 |
| 0.9.0 | 2026-10-19 | §64 |
| 0.10.0 | 2026-10-19 | §70 |
| 0.11.0 | 2026-10-20 | §72 |
| 0.12.0 | 2026-10-20 | §74 |
| 0.12.1 | 2026-10-20 | §76 |
| 0.13.0 | 2026-10-20 | §77 |
| 0.14.0 | 2026-10-21 | §80 |
| 0.15.0 | 2026-10-22 | §84 |

---

## §34 · 发布 0.2.0：本地全绿是关于工作树的断言，不是关于发布件的断言（2026-10-15）

**背景**：[`README.md`](../README.md) 里那条 `dsh plugin --profile web add github:beibingyangliuying/dsh-autoresearch` 是给别人用的唯一安装入口，而 GitHub 上的 `main` 停在 `a800b9b`（2026-10-13），本地 HEAD 已领先 **47 个提交**。⇒ 那 47 个提交里的工作（两个通道改自带 helper、`preset-paths.js`、§32 与 §33 的修复）**对外都不存在**；照 README 安装的人拿到的仍是挂两个 `uvx` MCP 行、需要 Python 环境的旧版。**14 项本地自测全绿也看不见这件事**——它们读的都是工作树。

**发布动作**：6 个提交（两处 P0 文档回扫修正、`contact-bridge.js` 的陈旧理由句、两轮去个人化、版本号独立提交）→ `package.json` 0.1.0→0.2.0 → annotated tag `v0.2.0` → 先推分支再推 tag。远端 head 与 tag 均已核对为同一提交。

**从远端复核**（新增 [`tools/release-check.mjs --tag`](../tools/release-check.mjs)）：读 tag 上的 `package.json`（版本 0.2.0）、组合（`id: mcp-*` **0** 条、`command:` **0** 条、`uvx` **0** 次）、以及 5 个必需 helper 的状态（全 200）。**这是唯一能看见"别人到底装到什么"的检查**，因此它有一个 `--tag` 模式而不是只读本地。

**代价与边界**：`--local` 把"工作树干净"当失败项——那是**打 tag 的前置条件**，不是开发每一步的条件；开发中途跑它会有这一条红，这是刻意的（一个永远绿的检查等于没有检查）。

**教训（三条）**：

1. **"本地全绿"是关于工作树的断言，不是关于发布件的断言。** 发布流程必须包含一次**从远端读**的检查，否则"我不知道远端落后多少"与"远端是对的"无法区分。
2. **一个版本的"完成"包含它可被安装。** tag 与分支 head 不是一回事：发布后 main 继续前进是正常的，但"修复已经做了"与"该 release 含有此修复"是两句不同的话。
3. **去个人化是发布动作的一部分。** 公开仓库里的测试 fixture、模板示例与设置页占位符都会泄露所有者的机器与领域；而 `docs/` 里**构成证据的量化值**（字符数、命中数、写入前后的 version）要留下——删了就把测量变成断言。

**落在何处**：[`tools/release-check.mjs`](../tools/release-check.mjs)（新：`--local` / `--tag`）· [`tools/release-check-selftest.mjs`](../tools/release-check-selftest.mjs)（新：纯函数 + 反向对照，离线）· [`README.md`](../README.md)（Develop 的工具清单、Layout）· [`.agents/skills/preset-release/`](../.agents/skills/preset-release/SKILL.md)（新：本仓库自己的维护 skill——自检 → 发布 → 远端复核，**不进** `skills/`）· [`protocol.md`](../protocol.md)（Revision 3 条目补一句"被 Revision 9 取代"）

---

## §36 · 发布 0.2.1，以及在发布复核里抓到的 checker 缺陷：一个通不过真路径的修法（2026-10-15）

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

---

## §46 · 发布 0.3.0：自检抓到的是两份名单与四个示例，不是代码（2026-10-17）

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
| [`overview.md:22`](overview.md) 仍写"实验卡：**假设**/命令/…" | **已修**：改成预注册＋实验卡两件，且卡引用协议 |
| [`decisions.md`](decisions.md) §8 记的卡字段表（2026-10-13） | **不改写**（它是当时的决策记录），在 §45.7 写明被取代——"退役的主张不得以降级形态存活" |
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

---

## §48 · 发布 0.3.1：两条实现向契约对齐的修复，和一条只能声明"没测过"的内核窗口（2026-10-18）

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

- 重扫口径＝本轮改动的三条声明（"标签交换不算变化"、"点号标记读不回来"、"本预设支持的 DSH 版本"）。结果：**相反说法只存在于实现里**（48.2 的两条），散文侧无一处陈述它们；[`docs/coverage.md:60`](coverage.md) 的"改条目的字段与标签"与 [`docs/overview.md:79`](overview.md) 的"无变化即不写"，在本次修复之后**才**完全成立，故不改写。
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

- `$DSH_HOME/.agent-presets/vibe-math-v1..v4` **不在**内核读取范围内（§49 的更正）：旧目录不被加载，所以它们不会失败，只是不可用；本轮未动。
- 窗口声明不覆盖 client 半，也不覆盖行名解析（后者由 `INV-ROW-1` 与 `preset-selftest` 守）。
- **仍无一条真实课题走完这套脚手架**（沿用 §45.6/§46.6）。

---

## §51.5 · 发布 0.4.0（2026-10-18）

- **版本号**：`0.3.1 → 0.4.0`，**单独一个提交**（`chore(release): 0.4.0`），使 tag 指向的那棵树恰好是这一版；契约 Revision 与包版本依旧互不绑定。
- **打 tag 前置条件全绿**：17 个离线自测 · `preset-selftest`（对着**重新生成**的组合 dump——`package.json` 变了，旧 dump 会被它按设计拒绝）· `release-check --local`（含"工作树干净"这条，那是打 tag 的前置条件而非开发条件）。
- **注释 tag** `v0.4.0` → `57a3f3e`；**先推分支、再推 tag**。
- **从远端复核**（`node tools/release-check.mjs --tag v0.4.0`）：**PASS** —— 发布件声明 0.4.0 · 组合不挂 MCP server、不启外部命令 · 两个通道需要的 helper 全部在发布包里（含本轮新增的 `tools/zotero-pdf.mjs`）· `main` 与 tag 指向同一提交。
- **未做**：M6（生成式能力单页 + 不漂移断言）——junhan 定为**发布后单独一轮**，见 §51.4。

---

## §53 · 发布 0.5.0：能力单页成为可安装的东西（2026-10-19）

**为什么是 0.5.0 而不是 0.4.1**：这一版交给用户的是**新产物**（`docs/toolchain.md` 与它的生成器、自测）和**新的检查**（`REQUIRED_HELPERS` 补上 `zotero-pdf.mjs`），不是修一个坏掉的 0.4.0。这一点事先实测过，没有靠感觉：`git ls-tree v0.4.0 -- tools` 里 `zotero-pdf.mjs` **在**——名册缺的是"检查看不见自己名册之外"，不是"发布件缺件"。

**流程**（`preset-release` §4 / §7）：

- 版本号 `0.4.0 → 0.5.0`，**单独一个提交**（`5ea7690`，只改 `package.json` 一行），使 tag 指向的树恰好是这一版；**契约 Revision 仍是 17**，与包版本互不绑定。
- 提交前在最终树上重跑：**18 项离线自测 + `preset-selftest` 全绿**；`toolchain-page.mjs --check` 报 *current and every citation holds (20 claims)*；`release-check --local` **PASS**（含干净树这条 tag 前置条件，并报出 7 个提交尚未推到远端）。
- **注释 tag** `v0.5.0` → `5ea7690`（tag 对象 `712519a`）；**先推分支、再推 tag**。这次推上去的是 **7 个提交**：0.4.0 发布后写的 5 个（含 M6 那四个）此前**一直只在本地**，`--local` 的那行计数是唯一提前说出来的地方。
- **从远端复核** `node tools/release-check.mjs --tag v0.5.0`：**PASS** —— 发布件声明 0.5.0 · 组合不挂 MCP、不启外部命令 · 通道需要的 helper 全部在发布包里 · `v0.5.0` 与 `main` 同点 `5ea7690`。

**关于这个检查本身的一条性质**：`--tag` 的最后一项走 `git ls-remote`，因此**继承调用者的 git 配置**。这一次本机配置的代理不可达，该项报的是 **ERROR**（其余三项已 OK）；把代理在单次调用里覆盖掉后即为 PASS。这不是发布件的性质，但它决定了失败时该怎么读：**先分辨"远端没有"与"本机连不上"**，否则会把一次网络故障当成一次发布缺陷。

**同一轮的仓库卫生**：`.tmp/` 从 **112.8 MB / 978 个文件**降到 **0.81 MB / 88 个文件**。删的是大件（`node_modules` 83.5 MB · 会话 `.jsonl` 约 25 MB · 库正文副本 · 渲染图 · composed dump · 日志与提交信息草稿）；留的是证据与未采纳草案（§4.3.1 的探针配方与输出 · 四份普查报告 · 那 39 条的待办清单 `notes-to-delete.md` · `scaffold-revision/` 提案 · 三条会话的笔记产物 · 候选技能 `adoption-ruling.SKILL.md`）。§4.3.1 因此补上了重跑命令——**删掉 `node_modules` 只在配方与输出都留着时才安全**，否则那一节的数字就从测量退化成断言。

**登记项独立成一节**：`docs/backlog.md`（原 `plans/revision-17.md` §12）把"已登记"与"不做"分开，三项各带自己的触发条件（写回库索引 · 父条目退路 · Python 运行时）。其中一条是我给自己定的规矩：**触发条件写不出来的，就不是 backlog，而是一条尚未做出的裁定，该送回 §10**。

**明确搁置、记在这里免得下次重新考古**：三条文献会话工作区里的 **39 条**（清单 `.tmp/notes-to-delete.md`，不进库）——junhan 裁定**先不动**；它们的收法已经是现成的（讲错的 `--retire` → 那一节变可写 → `--replaces` 写新稿），不需要新的工具。

---

## §57 · 发布 0.6.0：第三通道拿到程序，记录改挂仪器（2026-10-19）

**范围**：A–D 四项（§54 / §55 / §56）+ 三个探针转正 + 契约 Revision 18。

**流程**（`preset-release` §7）：

- 版本 `0.5.0 → 0.6.0`，**单独一个提交**（`622f981`，只改 `package.json` 版本一行），使 tag 指向的树恰好是这一版；
  **契约 Revision 仍是 18**，与包版本互不绑定。
- 提交前在最终树上重跑 Phase 1：**20 项离线自测 + `preset-selftest` 全绿**；`toolchain-page --check` 报
  *current and every citation holds (24 claims)*；`release-check --local` **PASS**（含干净树这条 tag 前置条件，
  当时报出 10 个提交未推）。
- **注解 tag** `v0.6.0` → `622f981`（tag 对象 `20c656d`）；**先推分支、再推 tag**。
- **从远端复核** `node tools/release-check.mjs --tag v0.6.0`：**PASS** —— 发布件声明 0.6.0 · 组合不挂 MCP、
  不启外部命令 · **三条通道需要的 helper（含本轮新增的 `tools/metadata.mjs`）全在发布包里** ·
  `v0.6.0` 与 `main` 同点 `622f981`。

**§2 的反方向重扫在发布前又命中一次**：`package.json` 的 description（会进发布件元数据）、README 的
"Two channels need setup" 小标题（其实只有参考库需要设置）、组合里的注释、以及反向护栏的注释，四处都还在写
"两条通道"。这是同一轮里第二次证明那条规矩：**改行为的人改的是他刚编辑的那个文件，陈旧句子在别处。**

**网络边界（登记）**：本机 git 配置的代理 `http://127.0.0.1:12450` 当时不可达 ⇒ 推送与 `ls-remote` 都报
connection refused；**在单次调用里覆盖**（`git -c http.proxy= -c https.proxy=`；给 node 生成的 git 用
`GIT_CONFIG_COUNT/KEY/VALUE` 环境变量）后即为成功。而 `raw.githubusercontent.com` / `api.github.com` /
`github.com` 三者实测均 **HTTP 200**，所以第一次 `--tag` 复核报的 `fetch failed` 是**瞬时**的，重跑即 PASS。
照 §53 的读法：**先分辨"远端没有"与"本机连不上"，再读这条失败。**

**未做**：没有新的规范变更，Revision 保持 18；没有动 mnemon 的 profile 配置（§54.4 那条边界仍然成立）。

**发布后的本地状态（登记，免得下次读 `main` 时困惑）**：本节之后还有一个 `docs:` 注释修正提交
（`43f48ec`：把 `preset-selftest` 那道反向护栏的注释从"三条通道"改回它真正守的范围）**没有推上去**——
当时本机代理已关闭、直连 `github.com` 也不通（两条路都实测不通），按 junhan 的"不要纠结"停手。
它与发布无关：`v0.6.0`、`622f981` 及其之前的提交都已推送并已从远端核验；下次能联网时 `git push origin main` 即可收尾。

---

## §59 · 发布 0.7.0：笔记身份换成 tag，digest 成为章节笔记的投影（2026-10-19）

**范围**：§58 的 Phase 1–6，加上 187 条顶层 marker 的 tag 迁移。

**流程**（`preset-release` §7）：

- 版本 `0.6.0 → 0.7.0`，**单独一个提交**（`e888219`，只改 `package.json` 一行），使 tag 指向的树恰好是这一版；**契约 Revision 仍是 20**，与包版本互不绑定。
- 发布前在最终树上重跑 Phase 1：**20 项离线自测 + `preset-selftest` 全绿**；`release-check --local` **PASS**（干净树、声明 0.7.0）。
- **注解 tag** `v0.7.0` → `e888219`；**先推分支**（`c69f46f..e888219`），**再推 tag**。
- **从远端复核** `node tools/release-check.mjs --tag v0.7.0`：**PASS** —— 发布件声明 0.7.0 · 组合不挂 MCP、不启外部命令 · **三条通道需要的 helper 全在发布包里** · `v0.7.0` 与 `main` 同点 `e888219`。
- **§2 的反方向重扫命中并修掉**：`project-template/research/owner_actions.md` 的示例仍写"mechanical repair declined 4 spans"；[`docs/plans/note-pipeline.md`](plans/note-pipeline.md) 仍写 `in parts`、"当前工具仍读点号"、"三种拒绝"；E6 与 archive 仍有本机路径。
- **机器痕迹**：E6 的 `file:///D:/OneDrive/...` 改为 `file:///<library>/...`；`docs/archive/plan-v0.md` 的 checkout 路径改为 `<checkout>`；`docs/05` 的 9 个库 key 改为计数，只保留"9 条记录，最多 10 条"。

**未做 / 边界**：

- Phase 7 的 **38 条点号 / 153 条无 marker / 34 条 retired** 仍未迁移（junhan 选择暂停；187 条已迁）。
- `--delete --write` 未实现（§60 补上）；发布不改变工作区的迁移状态。
- digest 原地刷新的旧版只在工作区备份；其他库带 marker 的旧 digest 仍需先补 `/digest` tag。

---

## §61 · 发布 0.8.0：删除实写与 digest 库内历史（2026-10-19）

**范围**：§60 的三项（删除实写、digest 旧版留库、取消 `--rewrite` 工作区备份），契约升 **Revision 21**。

**流程**（`preset-release` §7）：

- 版本 `0.7.0 → 0.8.0`，**单独一个提交**（`47c4956`，只改 `package.json` 一行）；契约 Revision 21 与包版本互不绑定。
- 发布前在最终树上重跑：**20 项离线自测 + `preset-selftest`（fresh dump）全绿**；`toolchain-page --check` 24 条引用成立；`release-check --local` **PASS**（干净树、声明 0.8.0）。
- **注解 tag** `v0.8.0` → `47c4956`；**先推分支**（`08565ad..47c4956`），**再推 tag**。
- **从远端复核** `node tools/release-check.mjs --tag v0.8.0`：**PASS** —— 发布件声明 0.8.0 · 组合不挂 MCP、不启外部命令 · 三条通道需要的 helper 全在发布包里 · tag 与 `main` 同点 `47c4956`。

**§2 的反方向重扫命中并修掉**：[`protocol.md`](../protocol.md) Revision 12 的"不做删除"改成"当时不做"，并加 Revision 21 的边界；[`docs/plans/revision-17.md`](plans/revision-17.md) §6.5 补"Revision 21 改了后半句"；[`project-template/research/owner_actions.md`](../project-template/research/owner_actions.md) 的"预设不做删除"改成"有界删除，整批仍在应用里"；[`README.md`](../README.md)、[`docs/coverage.md`](coverage.md)、[`docs/plans/note-pipeline.md`](plans/note-pipeline.md)、[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md) 的"删除干跑 / 备份 / 不产生墓碑"逐条改成当前行为；[`docs/toolchain.md`](toolchain.md) 由工具源重新生成。

**未做 / 边界**：

- Phase 7 的 **38 条点号 / 153 条无 marker / 34 条 retired** 仍暂停；0.8.0 只是给 34 条 retired 的处置开了出口，没有自动执行任何一条。
- 没有在真库上执行一次删除或 digest 刷新：新路径由 stub 覆盖（DELETE + 404、快照先于 PATCH），真库写仍要下一次逐条授权。
- 工作区不再保留 `rewritten-*` / `digest-*` 备份；`.section-notes/` 仍用于草稿与 `--render` 页面图。

---

## §64 · 0.9.0 发布（2026-10-19）

**版本**：`0.9.0`，提交 `938f607`，注解 tag `v0.9.0` 与 `main` 同指。

**相对 0.8.0 的八条提交**：S1 `1431fa3` · S2 `21ce6bc` · S3 `d104312` · S4 `5a441bd`（§62）＋ 机制更正 `cb60923` ＋ Revision 24 `69893d2` ＋ 记录 `96fe167` ＋ 版本提交本身。

**发布前的门**（都在最终树上跑过）：

- 20 项离线自测全绿，`preset-selftest` 用的 dump 是版本提交后重新生成的（72,732 字节，persona 5,060 字符）。
- `release-check --local` 在干净树上 PASS：声明版本 0.9.0、组合不挂载 MCP、每个行名经 `exports` 解析、20 个自测都在 README 里有名。
- `release-check --tag v0.9.0` 从**远端** PASS：发布物声明 0.9.0、组合不挂载 MCP 也不启动进程、每个通道要的 helper 都在包内、`v0.9.0` 与 `main` 同指 `938f607`。这是唯一能看见"47 条本地绿灯但没人装得上"那类缺陷的检查。

**顺手改掉一处陈旧计数**：`package.json` 的 description 由 "ten on-demand research disciplines" 改成 "eleven"。0.8.0 发布时确实是十条，`reading-triage` 是它之后加的，计数没跟上——与 §36 抓到的那类陈旧计数同型，靠发布前通读一遍抓住。

**一次环境故障，不记为缺陷**：本机 git 全局代理当时不可用，`push` 与检查内部的 `git ls-remote` 都报 `Failed to connect ... port 443`；改用一次性覆盖（`git -c http.proxy= …` 与 `GIT_CONFIG_*` 环境变量）后推送与复核都成功。仓库与发布物未改动。

---

## §70 · 0.10.0 发布：入口、裁剪，与一次"绿着不真"的回扫（2026-10-19）

**版本**：`0.10.0`，注解 tag `v0.10.0` 指向版本提交。契约到 **Revision 28**；版本号与契约号互不绑定。

**相对 0.9.0 的 25 个提交，两组改动**：

1. **阅读链**（Rev 25→27）：废掉整篇 digest（3 条）→ 脚手架收缩到 `references/` 一层（3 条）→ 新增
   `collection-sweep` 与 `--collection --screen`（2 条）→ 决策 §64／§67／§68 与两份草案归档（1 条）。
2. **发布前回扫**：6 处旧说法（`1c68f00`）＋ 台账归属的契约更正（`e4459dd`，Revision 28）＋ 本文件。

**发布前的门**（都在最终树上跑过）：19 项离线自测全绿；`preset-selftest` 用的 dump 在改动后重新生成；
`release-check --local` 在干净树上 PASS。

**远端复核换了做法，因为这台机器连不上 `raw.githubusercontent.com`**：`release-check --tag v0.10.0`
报 `fetch failed`（与 §64 记的代理故障同类，属环境，不记为缺陷）。改用等价的两步：先 `git clone --depth 1
--branch v0.10.0` 取回 tag 树并比对树哈希——`e66716e4…`，与本地 `v0.10.0^{tree}` 完全相同；再在那个克隆里
跑 `release-check --local`：声明版本 0.10.0、组合不挂 MCP、行名经 `exports` 解析、19 个自测都在 README 有名、
helper 全在。读到的是"新用户装到的那棵树"，而不是本机工作树。

**这次检查抓到的三类**（都是测试看不见的散文）：

- **计数又旧了一次**：README 与 `package.json` 都还写 "eleven"，实际十二。与 §36、§64 同型——第三次；
  两次都是发布前通读抓住的，说明这条没有任何仪器。
- **行为变了、句子没变**：README 的脚手架简介仍列着七个层；模板 `.section-notes/README.md` 还说改写前的
  正文以 `/digest` 备份；两处中文索引仍说脚手架"继承权威表"。
- **发布清单里留着一个已删的测试**：`preset-release` 的套件列着 `zotero-note-selftest.mjs`，照跑会 ENOENT。

**一处真接缝（不是笔误）**：Rev 26 的模板给 `references/ledger.md`，Rev 22/27 的四条纪律却写
`references/<topic>.md`，契约 §7 的原句把两者说成同一份。判为"空壳→复制"，升 Revision 28，见
decisions §69。**这是两次改动里唯一需要改契约的地方。**

**边界**：`--screen` 的 `INCOMPLETE` 分支与 HTML 实体仍未解（§68）；初筛纪律的"写行"路径仍未被真实跑过；
`docs/` 里仍有属主课题真名，0.9.0 起就随包发出，本轮未处理。

---

## §72 · 0.11.0 发布：默认路径翻成 claim，契约升 Revision 29（2026-10-20）

**版本**：`0.11.0`，提交 `34653c8`，注解 tag `v0.11.0` 指向该版本提交（`main` 与 tag 同指）。

**相对 0.10.0 的四个提交**：`17e5dac`（技能 + 路由 + 四份读者页，§70）· `d942707`（契约 Revision 29，§71）·
`7c95ae3`（决策 §71）· `34653c8`（版本提交本身）。

**这一版换的是什么**：章节笔记的默认路径由"读轮读完一节就生一条"翻成"属主在别处生成、贴进参考库，本轮
claim 到笔记自己标题写明的顶层节（只打 tag，正文一字不动），并把仍缺笔记的节报成表，什么都不写"；按 PDF
生成的能力保留，只在属主点名某一节时跑。理由与边界见 §70，契约侧见 §71。

**发布前的门**（都在最终树上跑过）：19 项离线自测全绿；`preset-selftest` 用的 dump 在版本提交后重新生成
（73,149 字节，persona 5,420 字符 ≈1,506 token）；`release-check --local` 在干净树上 PASS（声明 0.11.0、
组合不挂 MCP、行名经 `exports` 解析、19 个自测都在 README 有名、helper 全在、4 个提交待推送）。

**发布前的反向重扫抓到了什么**：把改动写成一句话再去搜它的旧形状，`protocol.md` 命中两处——§4 `sections`
的第一句，与修订史里 Revision 23 那一句——两处都在说"读轮读完一个方法节就生一条笔记"。§70 当时判"协议
不动"，这条判定被推翻，升 Revision 29（§71）。**这是本轮唯一需要改契约的地方，而且它不在我这轮改过的文件
里**——是 §2 那条"搜相反的说法"抓到的。同轮还修了两处散文命中：`docs/coverage.md` 的读轮步骤与 §6 的门、
`docs/overview.md` 的产物列。

**远端复核换了做法，因为这台机器仍连不上 `raw.githubusercontent.com`**：`release-check --tag v0.11.0` 报
`the tag is readable: fetch failed`。改用等价两步：`git clone --depth 1 --branch v0.11.0` 取回 tag 树，树哈希
`1b6ae8a512351d6491d69172f9779e49e5117bf9` 与本地 `v0.11.0^{tree}` 完全相同；再在该克隆里跑
`release-check --local`——PASS（声明 0.11.0、不挂 MCP、行名解析、19 个自测有名、helper 全在；克隆是单分支
浅克隆，`origin/main` 未知，检查把这一点说明出来而不是当成通过）。

**一次环境故障，不记为缺陷**：本机 git 全局代理 `http://127.0.0.1:12450` 当时不可用，`push` 与 `ls-remote`
都报 `Failed to connect ... port 443`；用一次性覆盖（`git -c http.proxy= -c https.proxy=` 与 `GIT_CONFIG_*`
环境变量）后，推送与远端 ref 核对都成功（`refs/heads/main` 与 `refs/tags/v0.11.0^{}` 同为 `34653c8`）。

**改完要重启宿主**：预设的技能与 persona 在宿主启动时注册，开新会话或刷新页面都不够（§25）。

---

## §74 · 0.12.0 发布：契约升 Revision 31，纪律与读者页的一次反方向重扫（2026-10-20）

**版本**：`0.12.0`，提交 `99f5af7`，注解 tag `v0.12.0` 指向该提交（`main` 与 tag 同指）。

**相对 0.11.0 的七条提交，两组改动**：①§72 那次"点名才生成"的收尾——四份纪律 + 契约 Revision 30（2 条）；
②[`decisions.md`](decisions.md) §73 那次系统排查——契约 Revision 31、六份纪律、组合头注、三份读者页（5 条）。
两次都不是新材料，而是让已拍定的东西在文本里只剩一种说法。

**发布前的门**（都在最终树上跑过）：19 项离线自测全绿（`preset-selftest` 用的 dump 在版本提交后重新生成，
73,149 字节，persona 5,420 字符 ≈1,506 token）；`release-check --local` 在干净树上 PASS（声明 0.12.0、
组合不挂 MCP、每个行名经 `exports` 解析、19 个自测都在 README 有名、helper 全在）。

**远端复核换了做法，因为这台机器仍连不上 `raw.githubusercontent.com`**：`git clone --depth 1 --branch
v0.12.0` 取回 tag 树，树哈希 `0349279c9bd069b58c35f39c5785dae02691e7ee` 与本地 `v0.12.0^{tree}` 完全相同；再在
那个克隆里跑 `release-check --local`——PASS（19 个自测有名、helper 全在；单分支浅克隆不认识 `origin/main`，
检查把这一点说明出来而不是当成通过）。

**一次环境故障，不记为缺陷**：本机 git 全局代理 `http://127.0.0.1:12450` 当时不可用，`push` 报
`Failed to connect ... port 443`；用一次性覆盖（`git -c http.proxy= -c https.proxy=` 与 `GIT_CONFIG_*`）后，
推送与远端 ref 核对都成功（`refs/heads/main` 与 `refs/tags/v0.12.0^{}` 同为 `99f5af7`）。

**这次发布没改的事**：`--claim` 的语义、契约里"触发"的散文表述、`docs/` 里随包发出的属主课题真名（§70 已登记）、
以及"陈旧计数没有仪器"这条边界——本轮仍是发版前通读抓住的（README 的目录实测已补口径，但没有重测）。

**改完要重启宿主**：预设的技能与 persona 在宿主启动时注册，开新会话或刷新页面都不够（§25）。

---

## §76 · 0.12.1 发布：给计数装上仪器，把随包发出的课题真名换掉（2026-10-20）

**版本**：`0.12.1`，提交 `48690e0`，注解 tag `v0.12.1` 指向该提交（`main` 与 tag 同指）。

**为什么单独发一版**：0.12.0 发出去以后 junhan 问"是不是还有待办，讨论一下"，清点时才发现 `docs/` 里三条课题
真名从 0.9.0 起就随包发出（§70 登记过，两版未动）。改名只有落在**新版本**里才真正到达安装者，所以不攒到下次
功能发布；这一版同时带上那条计数护栏。

**相对 0.12.0 的四条提交**：`d6a841f`（backlog 三处散修）· `3b79abf`（`preset-selftest` 的 `[2]` 与 README 的
develop 注释）· `f1cf249`（六处真名 + `decisions.md` §75）· `48690e0`（版本）。**契约不动**：仍是 Revision 31
——这四笔没有一条改变语义。

**两件事**：

1. **计数有了仪器**。`preset-selftest` 新增 `[2]`，锚点取 `skills/<name>/SKILL.md` 的目录数（**不需要 dump**，
   所以排在 dump 检查之前——缺 dump 或 dump 过期，不再能连带跳过一个计数检查），把组合头注、`package.json` 的
   description、README 三处散文与它对齐；散文那句被改写而匹配不上时 **FAIL 并提示去教检查新说法**，不静默通过。
   12 个名字只留一份（`ROUTED_NAMES`），`[2]` 与 bullet 检查共用，因为第二份名单就是漂移的来源。**射程写在
   代码注释里**：级数（Revision 31 那类病）与行为句仍只能靠发版前通读。
2. **六处真名换成代号**：`decisions.md` 三处、`plans/revision-17.md` 一处、`plans/revision-26.md` 两处，改为
   `课题A/B/C` 与 `doc/<课题A>/` 占位符。`decisions.md` §75 记录理由且**不誊写原标题**（誊写等于换个地方再泄漏
   一次）。改的是**第三方的可识别信息**，不是我们自己的推理，所以按"改写 + 条目记录"处理，而不是该文件一贯的
   "追加一句声明"。

**验证**：dump 重新生成后**字节完全一致**（73,149 字节、同哈希 `B69E78EA…`，只有 mtime 更新），persona 5,420
字符 ≈1,506 token；`preset-selftest` 六段全过；18 项离线自测、`toolchain-page --check`（23 条）与
`release-check --local`（声明 0.12.1、19 项自测有名、干净树）全绿。护栏做了反例：README 的 `Twelve` 改成 `Ten`
立刻 FAIL 并同时报出"盘上 12／散文 ten"，改回即绿——§36／§64／§70 那三次若有它，会在提交前就红。

**推送与远端复核**：本机当时无外网（`127.0.0.1:12450` 无人监听、直连 443 超时），所以 `main` 与 `v0.12.1` 由属主
在 2026-10-20 推送。代理起来后复核在三处对上：

- `ls-remote`：`refs/heads/main` = `4ac47a7`，tag 对象 `5487311`，`refs/tags/v0.12.1^{}` = `48690e0`——正是 tag 所指的
  版本提交。
- `git clone --depth 1 --branch v0.12.1` 取回的树哈希 `99aac9b10255737ec9d2b8cb5ab2e686280bc592`，与本地
  `v0.12.1^{tree}` **完全相同**。
- 在该克隆里跑 `release-check --local`：**PASS**（声明 0.12.1、19 项自测有名、helper 全在、干净树）。再 grep 三种
  旧标题的片段：**零命中**——所以这一版的整改确实落在安装者拿到的树上，而不只是在工作树里。

**记录本身比 tag 晚一条**：本节写入后 `main` 会比 `v0.12.1` 多一个提交（发布记录），tag 不动——与 §72／§74 同一
做法，所以 `release-check --tag` 那一类检查看到的仍是版本提交，不会把记录算进去。

**0.9.0–0.12.0 的 tag 里仍有原标题——属主裁定不改写历史（2026-10-20）**。改写要重写全部 tag 以及所有引用过其
哈希的记录，收益只是清掉**已经公开过**的旧标题，代价是整条历史失去可核对的锚点；判为不值。所以「不再随包发出」
这个保证只覆盖**当前版本及以后**，旧 tag 保持原样，任何人 clone 旧 tag 仍会看到它们。

**改完要重启宿主**：技能与 persona 在宿主启动时注册，开新会话或刷新页面都不够（`decisions.md` §25，本节 §74
也记过同一条）。

**落在何处**：[`tools/preset-selftest.mjs`](../tools/preset-selftest.mjs) · [`docs/backlog.md`](backlog.md) ·
[`decisions.md`](decisions.md) §75 · [`plans/revision-17.md`](plans/revision-17.md) ·
[`plans/revision-26.md`](plans/revision-26.md) · [`package.json`](../package.json)。

---

## §77 · 0.13.0 发布：建条目时就能归档，一次写入（2026-10-20）

**版本**：`0.13.0`，提交 `07e3f4e`，注解 tag `v0.13.0`（tag 对象 `84d77ef` 剥到的正是该提交）。**本次未能推送**：
`git push origin main` 与 `git push origin v0.13.0` 都返回 128（`Could not connect to server` via `127.0.0.1`），
与 0.12.1 那次同一处故障，`main` 与 tag 由属主推。

**为什么是 minor 而不是补丁**：`--collection` 是**使用者可见的新写入方式**（一次授权覆盖"建"与"归档"两件事），
按 0.10／0.11／0.12 的口径算新能力；**契约 Revision 不动**——§6 那句"Adding, editing, filing or removing a record
is a write, so it needs `INV-EVID-3`'s authorization and its read-back"本来就覆盖它，没有规范句移动。

**相对 0.12.1 的三条提交**：`2431f1d`（工具＋离线自测＋重生成的 toolchain 页）· `c3c696c`（读者页与纪律、
`decisions.md` §76、preset-release 的套件清单、机器痕迹下线）· `07e3f4e`（版本）。

**起因是一次误读**：junhan 贴来的本地 agent 收尾写着"写入工具没有 `--collection` ⇒ 两条落在库根，锚定表不用改"。
前半句真（`fillTemplate` 只填 schema 字段），后半句推断过头——`zotero-collection.mjs --assign` 一直能把已存在的
条目归档，只是第二次写入。他问的是工具该怎么长，答案是：归档进 create body。

**这一版做什么**：`--collection <key>` 把 `collections` 放进同一个 create；key 在写入前按库里的分类树校验（分页读），
**形状在第一次请求之前**就拒绝；**不收分类名**（同名分类可挂不同父级，猜名字就是放错文件夹）。回读新增 `filing`
一栏；没成则报 `UNFILED`——条目**已存在**，只给一条 `--assign` 命令，**不补写第二次**，自测里以"源码不得出现
`patchItem`"正面断言这一点。

**仍未实测的一条**：create 携带 `collections` 库是否收下，本仓库没有人观测过；**第一次真写就是那次测量**，回读是
唯一证据。工具头注与 `decisions.md` §76 都这么写，不写成"支持"。

**§2 重扫抓到的两处**（都不是我自己复盘看出来的第二处）：`docs/overview.md` 的自测清单、`.agents/skills/
preset-release/SKILL.md` 的 Phase-1 套件清单各少一条——后一条是 `release-check-selftest` 报的
（`FAIL the release procedure names every self-test → zotero-write-selftest`），护栏在工作。另外初稿把**真库分类键
与分类名**写进了 `decisions.md` §76、把一个真分类名当测试夹具，全部换成占位（§6：`docs/` 随 npm 包与 GitHub 公开）。

**顺带修的既有缺陷**：错误路径的 `process.exit(1)` 在 Windows 上会把退出码换成 `0xC0000409` 并多打一行 libuv 断言
（Crossref 404 路径改前必现，`--collection` 的新拒绝路径也会落进去）⇒ 改 `process.exitCode` 后自然退出；实测 exit 1、
约 0.9 s、无断言行。

**验证**（都在最终树上跑过）：dump 重生成 73,149 字节，persona 5,420 字符 ≈1,506 token（与 0.12.1 相同）；
`preset-selftest` 六段全过；**19 项离线自测**（含新增 `zotero-write-selftest` 31 条断言）、`toolchain-page --check`
（23 条）与 `release-check --local`（声明 0.13.0、**20 项自测有名**、干净树）全绿。对真库（Zotero 10.0.6，kept 授权
在档）：`zotero-write.mjs --selftest` PASS；干跑 `--collection <key>` 打印 `filing` 行且 payload 出现 `collections`；
坏键与不存在的键都在任何写入之前 exit 1。**没有做过一次真实写入**——所以本版不含"归档成功"的实测，只有它的前置。

**推送与远端复核：未完成**。属主推完后按 §7 复核三处：`ls-remote` 的 `refs/tags/v0.13.0^{}` 应等于 `07e3f4e`；
`git clone --depth 1 --branch v0.13.0` 的树哈希应与本地 `v0.13.0^{tree}` 相同；在该克隆里 `release-check --local`
应 PASS。

**记录本身比 tag 晚一条**：本节写入后 `main` 比 `v0.13.0` 多这一个提交，tag 不动（§72／§74／§76 同一做法）。

**补记（2026-10-21）**：上面那句"本次未能推送"**已经过期**。`v0.13.0` 随 0.14.0 一起推上去了，
远端 `refs/tags/v0.13.0^{}` = `07e3f4e`，与本地一致（见 §80）。留着原文是因为它是当时的事实，
但读者要按这一句来判当前状态。

**改完要重启宿主**：纪律文本（`skills/literature-recon/SKILL.md`）只在宿主启动时注册，开新会话或刷新页面都不够
（`decisions.md` §25）；**工具本体不受影响**，它按绝对路径直接跑文件。

**落在何处**：[`tools/zotero-write.mjs`](../tools/zotero-write.mjs) ·
[`tools/zotero-write-selftest.mjs`](../tools/zotero-write-selftest.mjs) · [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) →
[`docs/toolchain.md`](toolchain.md) · [`skills/literature-recon/SKILL.md`](../skills/literature-recon/SKILL.md) ·
[`README.md`](../README.md) · [`docs/coverage.md`](coverage.md) · [`docs/overview.md`](overview.md) ·
[`decisions.md`](decisions.md) §76 · [`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) ·
[`package.json`](../package.json)。

## §80 · 0.14.0 发布：写操作的三种答案统一到每一条路径，以及第一次把"命令行的回答"当被测对象（2026-10-21）

**版本**：`0.14.0`，提交 `2e8b4ea`，注解 tag `v0.14.0`（tag 对象 `e1529a3`，剥到的正是该提交；树 `b143a00`）。
**推送成功（第二次尝试）**：第一次 `git push origin main` 与 `git ls-remote` 都返回 128——git 配的代理
`127.0.0.1:12450` 没在运行，绕过代理直连又被 `Connection was reset`。几分钟后重试，**`git -c http.proxy= push
origin main` 成功**（`4ebefd9..255a474`），随后同一条命令把 `v0.13.0` 与 `v0.14.0` 一起推上（两个 `[new tag]`）。
远端剥皮与本地一致：`v0.13.0^{}` = `07e3f4e`、`v0.14.0^{}` = `2e8b4ea`。**`v0.13.0` 此前一直没推上去**
（§77 那次失败没有补做），所以这一次推两个——顺带让 README 里 `#v0.13.0` 那个 pin 变成真能解析的引用。

**为什么是 minor**：`journal-rank.mjs` 是使用者可见的新能力；而三条写路径的三种答案与 `/agent-note`／`/reviewed`
是**实现追上契约**，不是新增规范 —— `protocol.md` §6 与 Revision 32 早就写了"一次写入报三种答案之一"。
**契约 Revision 不动**（32）。

**相对 0.13.0 的七个提交**：`2610827`（§77 的发布记录）· `86ddcdf`（期刊分区 helper 与自测）·
`9857985`（三种答案 + 笔记的作者标签）· `117d533`（`collection`／`link-attachments` 的 CLI 桩库测试）·
`5762f5a`（失败的候选不再让整轮退 0；读回抛错不再记成"失败"；4xx 不再算"可能已写"）·
`fd90b1e`（`edit`／`write` 的 CLI 桩库测试；重复命中的措辞改正）· `2e8b4ea`（版本）。

**验证在 tag 的树上，不在工作树上**：本地克隆 → `checkout v0.14.0` → 树哈希 `b143a00` 与本地 `v0.14.0^{tree}`
一致 → 在该克隆里 `release-check --local` **PASS**（声明 0.14.0、21 项自测有名、干净树）。最终树上整套离线自测
**21/21 PASS**，`toolchain-page --check` 23 条引文成立。**仍然没有做过一次真实写入**——本版不含任何写成功路径的真库实测，
只有它的前置（桩库与只读比对）。

**远端复核（两条路，都走到 PASS）**：`node tools/release-check.mjs --tag v0.14.0` 读出三件事——发布件声明
**0.14.0** ✓、组合**不挂任何 MCP 也不启动任何进程** ✓、三个通道要用的 helper **都在发布包里** ✓——最后一步比对
`v0.14.0 -> 2e8b4ea` 与当时的 `main`。之后几分钟内 node 的 `fetch` 到 `raw.githubusercontent.com` 开始失败
（`the tag is readable: fetch failed`），**同一条检查复跑不再通过**——这是网络，不是发布件；`git ls-remote`
仍能读到 `refs/tags/v0.14.0^{}` = `2e8b4ea`。于是换一条更硬的运输补证：**直接从 GitHub 克隆那个 tag**
（`git clone --depth 1 --branch v0.14.0 https://github.com/…`，走 libcurl），得到树哈希 `b143a00`——与本地
`v0.14.0^{tree}` 相同，`package.json` 声明 0.14.0，在该克隆里 `release-check --local` **PASS**。这条克隆路径正是
"一个新用户装到的是什么"，比读单个文件更接近安装本身。

**抓到的工具缺陷（当日已修，见 `decisions.md` §81）**：`release-check --tag` 的最后一步 shell 出 `git ls-remote`，
因而继承 git 的代理配置；代理不可用时它在三项真检查**全部 PASS 之后**抛 `ERROR: Command failed: git ls-remote …`
并 exit 1——把"分支头无法核对"报成"这一版有问题"。本轮先用一次性的 `GIT_CONFIG_COUNT/KEY_0/VALUE_0` 环境覆盖
绕过（只对那条命令生效，没有动属主的 git 配置），随后按属主裁定改成三种答案：`0` 全查且成立 · `1` 查了且不成立 ·
**`3` 某项没能查**（打印原因，那一项什么也没证明）。这一版发布件里仍是旧行为，修复随下一次发布带出。

**一处要重启宿主**：`skills/literature-recon/SKILL.md` 改了一句（重复命中不再用 "refuses" 描述），
纪律只在宿主启动时注册，开新会话或刷新页面都不够（§25）；工具本体不受影响，它按绝对路径跑文件。

**一处未记**：`86ddcdf` 的期刊分区 helper 在 `decisions.md` 里没有对应的裁定节——它自己的文件头有完整实测
（为什么只有 EasyScholar 这条路、ISSN 与近似刊名各自怎么失败）。记在这里，免得下一位读者以为漏读了。

**记录本身比 tag 晚一条**：本节写入后 `main` 比 `v0.14.0` 多这一个提交，tag 不动（§72／§74／§76／§77 同一做法）。

**落在何处**：[`tools/zotero-local-api.mjs`](../tools/zotero-local-api.mjs)（`mayHaveLanded` · `reportUnconfirmed` ·
`refused` 标记）· [`tools/zotero-edit.mjs`](../tools/zotero-edit.mjs) · [`tools/zotero-write.mjs`](../tools/zotero-write.mjs) ·
[`tools/zotero-collection.mjs`](../tools/zotero-collection.mjs) · [`tools/zotero-link-attachments.mjs`](../tools/zotero-link-attachments.mjs) ·
[`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs) · 六个自测 ·
[`tools/journal-rank.mjs`](../tools/journal-rank.mjs) · [`protocol.md`](../protocol.md)（Revision 32）·
[`decisions.md`](decisions.md) §77–§79 · [`docs/coverage.md`](coverage.md) · [`docs/toolchain.md`](toolchain.md) ·
[`skills/section-notes/SKILL.md`](../skills/section-notes/SKILL.md) · [`skills/adoption-ruling/SKILL.md`](../skills/adoption-ruling/SKILL.md) ·
[`package.json`](../package.json)。

## §84 · 0.15.0 发布：两个契约 Revision 一起出包，以及欠了一轮的三笔账（2026-10-22）

**版本**：`0.15.0`，提交 `1506250`，注解 tag `v0.15.0`（tag 对象 `35cd40c`，剥到的正是该提交；树 `fb4a986`）。
**推送一次成功**：`git -c http.proxy= -c https.proxy= push origin main`（`bba394f..1506250`）随后同法推 tag
（`* [new tag] v0.15.0`）。远端剥离与本地一致：`refs/tags/v0.15.0^{}` = `1506250`，`refs/heads/main` 也是 `1506250`
——**tag 与分支头同指一个提交**，这一点 `--tag` 的最后一项自己核对过。

**这一版主要在还账，不是在做新东西**。§81、§82、§83 三笔裁定都各自写了"随下一次发布带出"，而 0.14.0 的发布件里
**`zotero-ensure.mjs` 根本不存在**、库不应答仍是一句裸 `ECONNREFUSED`、失败块仍是 `ERROR: …` 一行、`release-check --tag`
仍把"没查到"报成"发布件坏了"。三笔账同时到期，所以合成一版：**这是本仓库第一次一个版本带出两条契约 Revision**（33 与 34）。

**为什么是 minor**：两条 Revision 都新增了不变式（`INV-EVID-7`、`INV-FAIL-1`）并改了读者可见行为（多了一个 helper、
失败多行、两个 exit 码换了归属）。前例是 0.11.0／0.12.0／0.13.0／0.14.0 都随 Revision 升 minor；**0.14.0 那次例外是因为它
没动契约**（Rev 32 早就写在纸上，那次只是实现追上）。

**相对 0.14.0 的十四个提交**，按它在还哪笔账分：`255a474`／`e4164f0`／`94bd6d0`（0.14.0 的记录、一条自我更正、以及把远端复核
从"读文件"改成"克隆 tag"）· `468be5c`（§81：第三种答案）· `2a7ea8b`／`4900772`／`7119afe`／`03e31d3`（§82：启动器、传输层那句话、
名册与覆盖地图、Rev 33）· `5e3e040`／`ea44b85`／`2fb3909`／`bba394f`（§83：一个渲染器、十个尾部、五类建议、Rev 34）·
`2c265f1`（backlog 补登剩下三类）· `1506250`（版本）。

**验证在最终树上，不在顺手那次上**：改完 `package.json` 之后**重新生成** `composed-web.txt` 再跑（`preset-selftest` 会拒绝比
`package.json` 旧的 dump，这是它刻意的守卫），结果 22 个 helper 自测 + `preset-selftest` **23/23 PASS**；`toolchain-page --check`
**25 条引文全部成立**；`release-check --local` **PASS**，且"工作树干净"这一项这次是真的绿（tag 的前置条件，开发期本就为脏）。
`release-check --local` 同时报出 `2 commit(s) not on origin/main`——那是版本提交与 backlog 提交，推完即消失。

**远端复核**：`node tools/release-check.mjs --tag v0.15.0` → 四项 `OK`（发布件声明 0.15.0 · 组合不挂 MCP 也不启动进程 ·
三个通道的 helper 都在包里 · tag 与分支头同一提交），**exit `0`**。这次代理是通的，`--tag` 一次过；0.14.0 那次同一命令因
代理死掉报 `3` 并换来一次误指控，正是 §81 要修的那种情形，所以这一次的 `0` 读作"四项都真查了且成立"，而不是"没报错"。

**仍然未做（继承下来，不是这一版新增）**：`zotero-pdf` 的"记录在、附件文件不在"分支**从未在真实记录上跑过**——本机库没有
这样的记录，该路径只有读代码与 `node --check` 覆盖；arXiv／Crossref 的 429／503 **没有真触发过**，只由纯判定函数配用例覆盖；
Zotero 冷启动到端口可用的耗时**没有测**（不为测它去杀属主正开着的应用），所以 `--wait` 只按上限与如实报账设计。
三条都写进了 [`backlog.md`](backlog.md) 第 10 行与 §82／§83 的末段。

**两个 23 不是巧合，但也不是同一个数**：`release-check --local` 说"23 项自测有名"，数的是 `tools/*-selftest.mjs` 的**文件**
个数，README 逐个点名；这一轮实际跑的也是 23 次（含需要 dump 参数的 `preset-selftest`）。目录里数一遍与套件里跑一遍给的是
同一个数，这份一致性是刻意维持的——`release-check` 另有一项就专门查"README 里没有已消失的自测"。

**记录本身比 tag 晚一条**：本节写入后 `main` 比 `v0.15.0` 多这一个提交，tag 不动（§72／§74／§76／§77／§80 同一做法）。

**落在何处**：[`package.json`](../package.json)（版本）· [`tools/zotero-ensure.mjs`](../tools/zotero-ensure.mjs) ·
[`tools/refusal.mjs`](../tools/refusal.mjs) · 十个 helper 的尾部 · [`protocol.md`](../protocol.md)（Revision 33、34）·
[`docs/decisions.md`](decisions.md) §81–§83 · [`docs/backlog.md`](backlog.md) 第 10 行 ·
[`README.md`](../README.md) · [`docs/coverage.md`](coverage.md) · [`docs/toolchain.md`](toolchain.md) ·
[`.agents/skills/preset-release/SKILL.md`](../.agents/skills/preset-release/SKILL.md) §4。

## §86 · 0.16.0 发布：一次检查换来的四项更正，与一条有仪器的窄动作（2026-10-22）

**版本**：`0.16.0`，提交 `e2d6631`，注解 tag `v0.16.0`（剥到的正是该提交；发布时远端 `v0.16.0^{}` 与
`refs/heads/main` 同指 `e2d6631`）。四个提交按关注点分开：`6cea77b`（usage 里的绝对路径）·
`626970c`（`--unclaim` ＋ Revision 35）· `40685e2`（六处说法与各自正文对齐）· `e2d6631`（版本）。
**记录本身比 tag 晚一条**：本节写入后 main 比 `v0.16.0` 多这一个提交，tag 不动（§72／§74／§80 同一做法）。

**为什么是 minor**：Revision 35 新增一条能力（`--unclaim`）与一条拒绝（单 tag 不许摘），读者可见行为变了；
前例是 0.11.0–0.14.0 随 Revision 升 minor。

**这一版不是新功能，是把上一轮检查出来的账结掉**。四项：

1. **16,000 那句话引错了包**（`docs/decisions.md` §84）。反证是一次 30,000 字符的命令输出**完整到达**；
   本预设挂的是 `dsh-tool-pwsh`（每流 `maxOutputBytes` 默认 64,000、**保留尾部**），16,000 与
   `<response clipped>` 属于**没有挂**的 `dsh-tool-pwsh-persistent`。五处纪律／覆盖地图／生成物统一改成
   "所挂那支、版本锚、超过就丢**开头**"。
2. **`ambiguous` 终于有仪器**（§85，Revision 35）。此前 claim／rewrite／`--replaces` 三条路全拒，而纪律写
   "先修 tags"——拒绝存在，它点的那一步不存在。现在 `--unclaim --note <key> --section <ordinal>` 只对带
   多枚 section tag 的笔记生效，一次一枚，干跑／版本守卫／回读／正文不动；单枚 tag 一律拒绝并打印 §6。
3. **usage 错误自带绝对路径**：usage 块是仓库相对写法，study 工作区里照抄必失败；一行加在共享渲染器里。
4. **四处文本矛盾**（section-notes 的 description、reading-triage 的裁决表、metadata-query 的 §0、
   coverage 的四动作清单）改到与各自正文一致；S2 给裁决表补了 `full` 一行，没有动 §63 已经裁过的复读条件口径。

**验证在最终树上**：改完 `package.json` 后**重新生成** `composed-web.txt` 再跑，**23/23 PASS**（含
`doc-selftest --negative-controls`、`toolchain-page --check` 25 条引文全部成立）；`release-check --local` **PASS**，
"工作树干净"这项是真绿。新护栏做了**两次反向控制**并各自真红：关掉 ambiguity 判断 ⇒ 3 条 FAIL；关掉回读判断 ⇒
3 条 FAIL；恢复即 PASS。

**远端复核**：`release-check --tag v0.16.0` 四项 `OK`、**exit 0**。第一次跑是 `exit 3`（两项 `UNVERIFIED`，
`fetch failed`）——不是发布件坏了，是这台机器的传输问题：git 里存着一个**已经没人监听**的
`http.proxy=127.0.0.1:12450`，而 `fetch` 在 IPv6 优先下解析 `raw.githubusercontent.com` 会失败。两处都只是
**这条命令的环境**，仓库配置一个字没改：`GIT_CONFIG_COUNT/KEY_0/VALUE_0` 把代理置空，`NODE_OPTIONS=
--dns-result-order=ipv4first`，之后一次跑即 `PASS`（复核时第 2 次尝试 `exit 0`，四项 `OK`；第 1 次仍是 `3`——
这条链路会间歇性抖，`3` 就该重跑，而不是读成发布件坏了）。这条也解释了 0.14.0 那次"代理死掉换来一次误指控"：
`exit 3` 的语义是对的，坏的是传输。

**仍然未做**：`zotero-pdf` 的"记录在、文件不在"分支**从未在真实记录上跑过**（本机库没有这种记录）；
arXiv／Crossref 的 429／503 没有真触发过；Zotero 冷启动耗时没有测——三条仍在 `backlog.md` 第 10 行。
`--unclaim` 也一样：它只在桩库上跑过，**没有在属主真库上执行过一次写**（本轮没有库可写，也不该写）。

**落在何处**：[`package.json`](../package.json) · [`tools/zotero-section-note.mjs`](../tools/zotero-section-note.mjs) 与
[自测](../tools/zotero-section-note-selftest.mjs) · [`tools/refusal.mjs`](../tools/refusal.mjs) 与
[自测](../tools/refusal-selftest.mjs) · [`protocol.md`](../protocol.md)（Revision 35）· [`docs/decisions.md`](decisions.md)
§84、§85 · 四份纪律 · [`docs/coverage.md`](coverage.md) · [`tools/toolchain-page.mjs`](../tools/toolchain-page.mjs) →
[`docs/toolchain.md`](toolchain.md) · [`README.md`](../README.md) · [`backlog.md`](backlog.md)（未动，三项仍未结）。
