# 81 篇 Documents 的合并清单（草案，未执行）

> **状态**：草案 2026-10-23 · 待 junhan 审 · **一篇都没有动**。
> 判据：同主题只留一篇、只写当前态；原文不删除，归档后由幸存篇的一行索引指回。
> 起因：Revision 38 把"同主题一篇、写当前态"写进了契约，存量 81 篇还没迁。

## 0. 先止血：最新的一篇不是 `progress-sync` 写的

`.mnemon/documents/active/dsh-autoresearch-revision-38-29bb2cbe.md` 创建于 **2026-10-23T09:15:24Z**
（本地 17:15），`session_ids` 是本会话，`source_paths` 恰好是本轮改过的 11 个文件，正文写着"三个逻辑
提交在 main，领先 origin/main 15 个提交"。本轮**没有**任何一次 `progress-sync` 调用。

Profile 侧的配置指向一个候选来源：`mnemon.idleReview.enabled: true`、`provider: spawn`、
`maxPerSession: 20`、`minIntervalMs: 300000`、`maxContextChars: 24000`。`conversationInteraction.saveAction`
只是一个按钮，不会自动写。

**推断（高置信，未做对照实测）**：会话闲时 review 把每一轮总结写成**新** Document，而不是更新同主题。
若属实，合并完会再长回来——所以先裁止血方式，再动存量：

| 选项 | 代价 | 适用 |
|---|---|---|
| (a) 关掉 web profile 的 `idleReview` | 影响该 profile 的所有会话；少掉自动沉淀 | 确认它就是来源、且你不需要自动沉淀 |
| (b) 保留，把它的产物当 session log，按月合并 | 每月一次同样的合并；条目仍按轮 | 你要自动沉淀，但接受定期合并 |
| (c) 先实测一次再决定 | 一轮开着、一轮关着，看是否新增 | **推荐**：先确认 §0 的推断 |

## 1. 七个主题

幸存篇取该组**最新的一篇**（改标题、重写正文），其余归档；不新建文档，净减 74 篇。

| 组 | 主题 | 篇数 | 幸存篇（现 → 新标题） |
|---|---|---|---|
| S1 | 发布与版本史 | 17 | `0.16.0 发布…` → **`dsh-autoresearch 发布史`** |
| S2 | 笔记管线（section-notes / digest） | 18 | `笔记"修复"与"修订"分家…` → **`笔记管线：claim / rewrite / repair / retire`** |
| S3 | Zotero 与外部通道 | 14 | `Revision 33：库不应答时停下…` → **`Zotero 与外部通道：读、写、附件、启动器`** |
| S4 | 阅读与文献纪律 | 5 | `Revision 26/27 落地…` → **`阅读与文献纪律：triage / collection / literature`** |
| S5 | 预设与 DSH 机制 | 18 | `改预设会影响谁…` → **`预设与 DSH 机制：行、隔离、配置、生效时机`** |
| S6 | 文档布局与自检 | 7 | `Revision 38…` → **`文档布局与自检：docs / coverage / scaffold`** |
| S7 | 方向与借鉴裁定 | 2 | `direction-probe（Revision 36）…` → **`方向与借鉴裁定：direction-probe / adoption-ruling`** |

## 2. 逐篇清单

### S1 · 发布与版本史（17）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-12 | 68 | Autoresearch 预设：发布就绪现状（2026-10-12 第三次收口） | `c54f082c-605d-4748-96a7-e114738d6e31` |
| 并入 | 2026-10-12 | 81 | 发布就绪清理与配置化路线（C1 已提交，Config→skill 桥待定） | `a224d6a6-c499-43c9-9ab3-5c7f1cb17313` |
| 并入 | 2026-10-12 | 125 | A2–A5 可执行方案（发布前剩余工作：配置化 / 技能随包 / 包名护栏 / 使用者 README） | `f8c0c15c-e8f7-456e-9e5e-e61dc5982e1d` |
| 并入 | 2026-10-15 | 59 | dsh-autoresearch 去个人化（痕迹 vs 证据）判据与 v0.2.0 发布验收 | `18032a9f-e136-41de-b146-1fc50c5adf37` |
| 并入 | 2026-10-15 | 69 | 发布验证与自检流程：0.2.0 发布、可执行的 release-check 与 preset-release skill | `9db81238-5c92-4a80-b3a0-baebd6b73c40` |
| 并入 | 2026-10-17 | 61 | dsh-autoresearch v0.3.0 发布自检：清单漂移被机器抓到、领域示例去个人化与 tag 对象复核 | `864631c6-a42b-4204-8f15-b089de841b26` |
| 并入 | 2026-10-18 | 99 | dsh-autoresearch v0.3.1 发布自检：两条 zotero 修复、engines.dsh 内核窗口、活会话双面验证与推送受阻诊断 | `96ef19a4-4060-4a33-ba12-1b740fd0cf41` |
| 并入 | 2026-10-18 | 87 | dsh-autoresearch v0.4.0 发布与 M6 工具链单页：tag 存活真库实测、归退快路与不漂移断言 | `4fdf3cdb-4dfb-41ca-a9c7-9d47e3f1ed7e` |
| 并入 | 2026-10-19 | 83 | dsh-autoresearch v0.5.0 发布：release-check --tag 继承 git 代理的失败模式与留证据式 .tmp 清理 | `a5a9f64e-31d1-4563-aa93-86f95b8ed7b9` |
| 并入 | 2026-10-19 | 81 | dsh-autoresearch Revision 21 与 0.8.0：/retired 删除实写、digest 旧版留库、取消工作区备份 | `b40c73a5-1dc1-4a37-9a5c-69423b0ec3b5` |
| 并入 | 2026-10-19 | 86 | dsh-autoresearch 0.10.0 发布：六处散文旧说法、Revision 28 台账归属，以及 raw.githubusercontent 不可达时的 tag 等价复核 | `c69658cd-1afb-4da6-9695-2f931b89a57b` |
| 并入 | 2026-10-20 | 73 | dsh-autoresearch 0.12.0 发布与契约 Revision 31：第四级阅读阶梯、纪律文本回扫与第四次陈旧计数 | `49081b59-b242-4081-a292-6cbeef2be4a2` |
| 并入 | 2026-10-20 | 59 | dsh-autoresearch 0.12.1：散文计数的机械护栏、decisions/releases 共用 §NN 导致的重打 tag，以及六处课题真名清除 | `8fefff85-443a-4e3c-aad0-846dd0061994` |
| 并入 | 2026-10-20 | 77 | dsh-autoresearch 0.13.0 发布：create 时归档、护栏抓到\"套件漏登记\"与机器痕迹第二次犯 | `bb76bd8e-608a-451e-af04-f353fa2909dc` |
| 并入 | 2026-10-21 | 80 | dsh-autoresearch 0.14.0 发布与 release-check 的第三种答案（exit 3 = 没查成，不是查坏了） | `1b77aaf4-504f-4a88-a732-2656db43b093` |
| 并入 | 2026-10-22 | 104 | dsh-autoresearch v0.15.0 发布后体检：16,000 截断的真身是 64k 尾截（T1）、ambiguous tag 无出口（T3）、五处纪律自相矛盾（2026-10-22） | `04143863-3734-430f-b3e2-5a4357130829` |
| **幸存** | 2026-10-22 | 76 | dsh-autoresearch 0.16.0 发布：0.15.0 体检的 T1/T2/T3 结账、Revision 35 的 `--unclaim` 窄动作，与 `--tag` 的 IPv6 传输根因 | `26114866-9acd-4db0-a939-6922b0f6fc7b` |

### S2 · 笔记管线（section-notes / digest）（18）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-12 | 108 | dsh-autoresearch 能力补全第三轮：synthesis-plan（综合纪律）、阅读阶梯与文献 digest 索引、+3 条不变式（PLAN §13.x，2026-10-11） | `b90233b8-2a13-4f6b-aab4-38d95f2caaf7` |
| 并入 | 2026-10-16 | 67 | section-notes 第九条纪律落地与提交拆分（#37）：工具幂等口径、OCR 节号限制、git stash/worktree 验证的两处环境坑 | `88f592c0-f3b1-4dc4-9458-9ccd141b8f2b` |
| 并入 | 2026-10-16 | 71 | section-notes 批量生产：2 篇试点的验收判据、子代理起草／父代理入库分工与 05-3+05-4 剩余盘子 | `404ec6da-d7fa-4c0e-9cec-9a5b5f838c73` |
| 并入 | 2026-10-16 | 71 | section-notes 批量第 1 组完成＋Zotero 删除能力空白：应用删进回收站 / API DELETE 永久、老笔记 version 恒 0、超预算节按子节号分条 | `f40c8aa6-8d8d-4a63-987f-ac87e126465a` |
| 并入 | 2026-10-16 | 59 | dsh-autoresearch：逐节笔记纪律（第九条 section-notes）与收口现场——契约 Revision 11/12，附「删除不可逆」实测 | `6bac18f7-cfa3-44bf-9f3a-36354b1a6571` |
| 并入 | 2026-10-17 | 84 | dsh-autoresearch：digest 笔记幂等（契约 Revision 13）——ALREADY RECORDED、可见文本判重、读地址缝与进程内 stub 自测 | `11c7be04-601a-4e2f-8877-58b269810380` |
| 并入 | 2026-10-17 | 86 | section-notes 覆盖判据分层（Revision 14）：覆盖按顶层节计、第一段读法、marker 被应用吃掉 7/10 的实测与反例边界 | `975d141d-cdfc-4ef2-b8d2-5771da41b67a` |
| 并入 | 2026-10-17 | 76 | section-notes §42 / 432724d：取消超预算拆分——一条顶层节一条笔记，1,500–5,000 字符降为质量信号 | `ac3e1f67-257c-461c-9010-2320db30fff6` |
| 并入 | 2026-10-18 | 116 | dsh-autoresearch：Revision 17 路线草案——删除边界、PDF 读法阶梯与大纲覆盖表（待裁定） | `2a141044-1b23-4a3a-9aef-287b63022429` |
| 并入 | 2026-10-18 | 76 | section-notes 归退路径（Revision 17 / P1）：错笔记退休而非删除、tag 标记与 /replaces 反向指针 | `2b1061ad-b7d9-4fdc-a028-357a042130aa` |
| 并入 | 2026-10-19 | 57 | section-notes 删除能力只做干跑：`--delete --note` 计划设计的裁定与实现约束（2026-10-19） | `7ca343ef-f54d-4ec5-9502-a4d77fe8952c` |
| 并入 | 2026-10-19 | 107 | 笔记管线改版草案（Revision 19/20）：tag 身份、claim/rewrite/retire 生命周期、digest 作为章节笔记的投影（2026-10-19） | `83d3cfbf-6a8c-419a-bc6c-37e7b9ce9f7f` |
| 并入 | 2026-10-19 | 79 | 笔记管线 Revision 20 实施完成与首批迁移（2026-10-19）：tag 身份、digest 投影、187 条已打标 | `df5534b2-848e-47b9-a83f-1107354a4629` |
| 并入 | 2026-10-19 | 68 | dsh-autoresearch：废除整篇 digest（契约 Revision 25）——裁定依据、落地范围与遗留防护 | `a4a30e50-d781-4667-956e-633e7a595577` |
| 并入 | 2026-10-20 | 84 | section-notes 默认路径翻转（2026-10-20）：章节笔记由属主外部生成，纪律只做 claim 与缺口报告 | `33a2cdf6-91c2-4a49-a4ba-15c292242cf6` |
| 并入 | 2026-10-20 | 64 | dsh-autoresearch Revision 30：section-note 触发对齐、owner-action 层移除与自测盲区复盘 | `d7e0c7f7-3a9c-4f99-8a55-7df1cf4e3741` |
| 并入 | 2026-10-21 | 86 | dsh-autoresearch Revision 32：笔记作者成为 tag（/agent-note ＋ /reviewed）、写入三态退出码与\"未确认 ≠ 没写\" | `a0ffc220-9cbc-4015-a7b0-cf8b12b772ce` |
| **幸存** | 2026-10-23 | 91 | 笔记“修复”与“修订”分家（Revision 37）：`--repair` 的机械闸、`/repaired` 标记与四处纪律的并轨 | `59516b9c-e6e4-4070-85f2-9f717c6f4281` |

### S3 · Zotero 与外部通道（14）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-11 | 87 | dsh-autoresearch C4 落地：学术 MCP bundle（arXiv / Zotero）与 metadata-query skill | `ee4e860f-567a-4bb6-aa99-a466f2830e49` |
| 并入 | 2026-10-11 | 63 | dsh-autoresearch：Zotero 全文通道的上下文陷阱与已验证的 curl 落盘配方（2026-10-11） | `ff3040e0-daea-44a6-b296-201decb90066` |
| 并入 | 2026-10-12 | 95 | dsh-autoresearch：文献检索能力边界实测（本地库优先顺序与 Zotero 写回闸门） | `816d9679-9a5e-44d0-a781-c21fc53a3ee3` |
| 并入 | 2026-10-12 | 68 | dsh-autoresearch：Zotero 10 本地 API 写入通道实测（428 语义、本地 key 授权、schema 驱动建条目与 dry-run 脚本） | `f9dca9a2-80c4-445a-9438-7ddb06e09d9f` |
| 并入 | 2026-10-12 | 72 | dsh-autoresearch：Zotero 写入通道验证完成（首次真实写入通过、防重复闸门、两个运行时陷阱、INV-EVID-3） | `3e9fa13c-c612-43cb-aed7-3e390ca56232` |
| 并入 | 2026-10-13 | 79 | dsh-autoresearch：存储型附件 → 链接附件（增量走本地 API、存量走 in-app snippet，2026-10-13） | `eac1f8fe-3d18-46e2-b32c-eb684bb3d338` |
| 并入 | 2026-10-15 | 63 | dsh-autoresearch：arXiv 通道 CLI helper（tools/arxiv.mjs）落地 + 实测错误形状与 ESM TLA 循环坑 | `8a040e62-6e40-4d80-a711-6266220e2cc9` |
| 并入 | 2026-10-15 | 96 | dsh-autoresearch：两个 MCP 行全部退役——arXiv 与 Zotero 通道改由自带 CLI helper 承担（契约 Revision 8，21,551 tok/请求 → 0） | `5cc74611-5bf3-4971-a4f2-ef6fec244cb8` |
| 并入 | 2026-10-15 | 70 | dsh-autoresearch：首次真实写入暴露的 204 缺陷——「成功即无 body」与共享层状态码判据（2026-10-15） | `3f45e034-dd42-4c81-8475-22ef55a38ced` |
| 并入 | 2026-10-15 | 112 | dsh-autoresearch：Zotero 本地 API 凭据落盘复用（Revision 10 已落地：一次授权、按库可撤销、401 自愈） | `f6814fe1-db45-4017-a452-5a561cd3bf26` |
| 并入 | 2026-10-16 | 69 | dsh-autoresearch：集合改名从「未验证」变为可逆实测——PATCH /collections 可用，但过期守卫取决于该库的 version（2026-10-16） | `74e405f4-8db2-4c65-8d16-4f60774debe1` |
| 并入 | 2026-10-20 | 68 | zotero-write --collection：归档进 create 的同一次写入、UNFILED 判据与 Windows 退出码修复（dsh-autoresearch） | `c2c4dd41-2bd9-4de0-9da5-37254a789de1` |
| 并入 | 2026-10-21 | 80 | dsh-autoresearch：期刊分区查询工具 tools/journal-rank.mjs（EasyScholar 转述通道 + ZoteroStyle 不落库的实测证据） | `f13a54fa-bbc6-4a02-9ce3-930a3e30a94f` |
| **幸存** | 2026-10-22 | 71 | dsh-autoresearch Revision 33：库不应答时停下——zotero-ensure 启动器、传输层出路与 INV-EVID-7 | `c66d1927-62c5-4e19-91ce-efb51cbb5e55` |

### S4 · 阅读与文献纪律（5）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-19 | 86 | 阅读筛读纪律（reading-triage）设计草案：列级台账归属、四值裁决与新增 discipline 代价 | `a18264bc-68e8-4b52-9e24-abc0f6e0deb4` |
| 并入 | 2026-10-19 | 75 | 阅读筛读纪律 v2：顺序渐进读取、课题隔离台账与 depth/verdict 分离 | `b5453e82-1193-41e2-86e5-0720e7c5962c` |
| 并入 | 2026-10-19 | 61 | reading-triage v2 四阶段落地交接：提交、偏离计划的理由与两项待决 | `043cf880-7ba8-41e8-8c3d-e4e4c96d125d` |
| 并入 | 2026-10-19 | 102 | dsh-autoresearch：从「分类」到「课题语料」的缺口——collection-sweep 纪律与 `--collection --screen` 的设计裁定（Revision 26 候选，2026-10-19） | `b7f1efa3-39df-4115-a4d8-d686c6e3612c` |
| **幸存** | 2026-10-19 | 91 | dsh-autoresearch Revision 26/27 落地：references-only 脚手架、collection-sweep 纪律与分类筛读实测 | `11ac0ff1-1776-45ef-8f43-bf922f95c840` |

### S5 · 预设与 DSH 机制（18）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-11 | 73 | dsh-autoresearch 预设：设计裁定与已验证的 bundle / skill 落地机制 | `3a3c8ace-e60f-4bfc-8812-c00ab70175d2` |
| 并入 | 2026-10-11 | 63 | dsh-autoresearch 全英文改造与 bundle Junction 机制修正（PLAN §13.5） | `778bf0f5-48c8-40a9-9bcc-63e1ebc4a92e` |
| 并入 | 2026-10-11 | 85 | 工具隔离：机制修正与缺陷修复（restrict 过滤继承层，故必须用 deny 而非 allow） | `521c31c3-7857-4bbc-93c6-50c4acdf6841` |
| 并入 | 2026-10-12 | 73 | dsh-autoresearch 能力补全第二轮：experiment-protocol / delegation 两个 skill、pitfalls 归宿与 persona 常驻成本权衡（PLAN §13.10，2026-10-11） | `ef8d45ed-8db1-49a8-a064-a177d56c85df` |
| 并入 | 2026-10-12 | 83 | DSH 预设从 GUI 消失：根因已确证并修复（相对行名 → broken → 新建会话名单过滤） | `7475b7d7-2a8e-438a-a6f4-03961c881351` |
| 并入 | 2026-10-12 | 67 | Autoresearch 预设：预设选择时序根因、隔离第二遍实测未生效的诚实收口与诊断方法论（2026-10-12） | `2a4d5dff-1679-4a6b-ba66-2aa7c07f8968` |
| 并入 | 2026-10-12 | 67 | dsh-autoresearch A2/A″：可编辑 Config 的放置位置与\"预设内行读配置\"机制（已实测） | `21f3a8bf-e996-44fb-83db-832ffbc4808c` |
| 并入 | 2026-10-12 | 100 | Preset 第三次消失的真因：exports 封包与两条失效护栏（契约 Rev 4，2026-10-12） | `011612b2-eef3-4c1b-8cd5-16c50d93b999` |
| 并入 | 2026-10-12 | 88 | 设置页不渲染表单的真因：DSH 设置层只投影 volatile 字段（已端到端实测） | `1512b233-3c93-4522-97e3-76eb7a67e7c8` |
| 并入 | 2026-10-13 | 70 | dsh-autoresearch：Revision 6 的两条常驻纪律（构造性数字 / 回锚）与「预设无法屏蔽 skill 目录」的实测边界（2026 收口） | `d38ca34e-009c-4fa2-99c6-5b019fc04202` |
| 并入 | 2026-10-14 | 65 | dsh-autoresearch：运行中会话加载陈旧预设（zotero-mcp 0.3.1 vs pin 0.14.1）——诊断证据与「重启 dsh web 才生效」结论 | `460e37d0-9a56-4820-ab58-6ce3775ff2b9` |
| 并入 | 2026-10-14 | 80 | dsh-autoresearch：预设源改动的生效时机修正——必须重启宿主进程（2026-10-14 取证） | `4ff8032f-3392-4a9e-9a62-d300f172135e` |
| 并入 | 2026-10-15 | 90 | dsh-autoresearch：会话 preset 判定的\"创建时默认值\"陷阱（--scan 只读首行）+ arxiv MCP pin 到 0.8.2 与预设常驻成本清账（2026-10-15） | `d2ce9eea-86f5-4136-a4df-538a2702d364` |
| 并入 | 2026-10-15 | 64 | dsh-autoresearch：DSH MCP 行不能按工具名过滤（§28 定案）+ 两条 MCP 行 pin 的重启复验（2026-10-15） | `944ffe33-176c-4526-888e-683565188682` |
| 并入 | 2026-10-15 | 103 | dsh-autoresearch：隔离第二遍的根因与修复——挂 `tools/change`，并用运行证据验收（protocol Revision 9，2026-10-15） | `14c9a3cf-2aa4-4d24-b5fa-682b18d46406` |
| 并入 | 2026-10-22 | 81 | dsh-autoresearch：helper 报错\"下一步\"普查——判据三条、实测清单与两条不合格出口 | `240cc0c2-952d-41cd-9656-8df284887d52` |
| 并入 | 2026-10-22 | 94 | dsh-autoresearch Revision 34：一种失败的声音——共享渲染器 tools/refusal.mjs 与 INV-FAIL-1 | `d6a11d72-9683-4a8f-a044-88c4099a75d7` |
| **幸存** | 2026-10-22 | 79 | dsh-autoresearch：改预设会影响谁——四层读取时机与影响边界（实测/推断分离） | `35ebc66c-c32c-42b0-abf0-4e72f768b22c` |

### S6 · 文档布局与自检（7）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-12 | 74 | dsh-autoresearch 文档集重构与判据驱动的 doc-selftest（含 delegation→subagent-contract 改名，2026-10-12） | `6e506751-72d4-4fd4-8bd3-90711d5b8ca2` |
| 并入 | 2026-10-17 | 62 | dsh-autoresearch：docs/02_coverage.md 覆盖地图与 DOC-8/9/10 护栏（名册派生、描述人写，以及两条仪器缺陷的实证） | `d6804357-3083-4e43-992e-172d9d66aa63` |
| 并入 | 2026-10-17 | 90 | dsh-autoresearch 脚手架布局三名单漂移：scaffold-selftest 护栏 + Revision 16 待决草稿（.tmp/scaffold-revision） | `27ce7f4e-36a0-4f76-974b-bb1bbb402611` |
| 并入 | 2026-10-17 | 86 | dsh-autoresearch：脚手架六改与契约 Revision 16 落地（协议/卡/证据三分 · INV-EVID-5 · scaffold-selftest 上线） | `5aaf5759-3c95-45f2-aecd-7c4f6f330aab` |
| 并入 | 2026-10-19 | 76 | dsh-autoresearch 文档布局：按寿命分家、节号即引用主键（2026-10-19 重构） | `329d9570-e2f9-4b3d-b3bd-12523a37186e` |
| 并入 | 2026-10-19 | 118 | Revision 26/27 规划：references-only 课题脚手架与渐进式文献读取（待执行） | `65684322-1f0c-4622-be03-ede731983f24` |
| **幸存** | 2026-10-23 | 79 | dsh-autoresearch Revision 38：记录只陈述当前态——三档压缩时机、报告形状与预算 | `29bb2cbe-014b-4149-981c-443896f551c3` |

### S7 · 方向与借鉴裁定（2）

| 动作 | 日期 | 行 | 标题 | id |
|---|---|---|---|---|
| 并入 | 2026-10-17 | 88 | adoption-ruling（第十条按需纪律）：借鉴裁定文档的设计判据与四提交落地前提（2026-10-16 已核准） | `68d5b90e-68fd-4237-a774-bbbc3822048b` |
| **幸存** | 2026-10-22 | 77 | dsh-autoresearch：第十三条纪律 direction-probe（协议 Revision 36）——六类闭词表种子、可执行杀死条件、方向=冲突的解法 | `93939194-42f2-40d8-b300-4ed3e5811ec3` |

**合计 81 篇。**

## 3. 合并后每篇的形状

```text
# <主题>                       （标题不带日期、版本号或 Revision）
## 当前状态                    这一主题现在成立什么
## 仍在生效的裁定与理由        按主题归并，不按轮次
## 已否决 / 走过的坑            每条一句话 + 指向归档 id
## 未决                        还开着的问题，标明谁裁
## 归档索引                    id · 原标题，一行一条
```

新正文 ≤120 行（表格与索引不计）。归档篇不再出现在 recall 里，索引行是唯一的入口；要读细节时按 id
引用冷归档。

## 4. 执行步骤（审完才做）

1. **S1 试点**（17 篇，重复度最高）：读 17 篇 → 写幸存篇 → 归档 16 篇 → 给你看一版，确认形状再推。
2. 其余两组一批：S2+S7，然后 S3+S4，然后 S5+S6。
3. 每次合并写一行回执在幸存篇末尾：`merged <date>: ← <n> docs（ids 见归档索引）`。
4. 全部完成后，用新的标题再跑一次 `search`，确认同主题只剩一篇。

## 5. 风险

- **内容损失**：只搬"结论 / 理由 / 未决"。原文进冷归档，索引行留 id；不删除。
- **归档不可逆感**：mnemon 的归档会写一条冷引用，可按 id 取回；本清单保留每篇的原 id 与标题。
- **自动 review 回填**（§0）：不先裁止血方式，这次合并会被下一轮覆盖。
- **标题重名**：七个新标题都不含轮次标记，`search` 时可作为新的稳定入口。

## 6. 现在不做的

- 不动任何一篇 Document。
- 不改 profile 的 `idleReview`（那影响所有会话，要你点头）。
- 不在本轮顺手改写研究内容；只做归并。
