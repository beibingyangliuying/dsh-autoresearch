# docs —— 每份文档回答哪个问题

> **规范只有一份**：[`../protocol.md`](../protocol.md)。这里的一切都是它的投影、它的历史，或它的账本；
> 冲突时 `protocol.md` 赢。概念与名字的索引在 [`../surface.md`](../surface.md)。
> 语言分界：`docs/` 用中文；`protocol.md` / `README.md` / `surface.md` / `skills/` 用英文
> （理由见 [`decisions.md`](decisions.md) §9）。

## 一张表

| 文件 | 回答的问题 | 寿命 | 被什么钉住 |
| --- | --- | --- | --- |
| [`overview.md`](overview.md) | 这套东西**是什么**（一页纸） | 只写结构、不写数字，所以耐久 | — |
| [`coverage.md`](coverage.md) | 每个部分**覆盖什么、明确拒绝什么** | 随纪律增减更新 | `doc-selftest` 的 DOC-8 / DOC-9 / DOC-10 |
| [`toolchain.md`](toolchain.md) | 手上这件工具**现在**能做什么、拒绝什么 | **生成物**：改 `tools/toolchain-page.mjs`，不手改 | `toolchain-page --check` · `toolchain-selftest` |
| [`decisions.md`](decisions.md) | **为什么**是现在这样、否掉了什么 | 追加；节号是引用主键，不重排；**新条目 ≤40 行**，测量进 `releases.md` | `toolchain-page` 的两条引用 |
| [`releases.md`](releases.md) | 每个**版本**发了什么、从哪个 tag、复核结论 | 追加 | — |
| [`backlog.md`](backlog.md) | **还剩什么**、什么条件到了才做 | 活账，结清即删 | — |
| [`plans/`](plans/) | 一轮**怎么决定的、执行到哪** | 完成后只读（状态行写明剩什么） | — |
| [`archive/plan-v0.md`](archive/plan-v0.md) | 当时的**原始时间线** | **冻结**，不再维护 | — |

## 新文档放哪（按寿命判，不按题材）

1. **"这句话在实现整体改名之后还成立吗？"** 成立 → 契约或索引（`protocol.md` / `surface.md`）；
   只在当前实现下成立 → 下面五类之一。
2. **立场与理由** → `decisions.md`；**事件**（发了什么版本、从哪个 tag、复核结论） → `releases.md`。
   这两类混在一起，就是发布条目淹掉裁定、裁定又打断版本史的那种文档。
3. **还没决定要做的**（有触发条件） → `backlog.md`；**已裁定要做的**（有执行顺序与阶段） → `plans/`。
   两者不是一回事：前者等条件，后者等排期。
4. **当时的过程**（含犯的错与改正） → `archive/`；写进去就不再维护。
5. **同一批名字只在机器能校的地方写第二遍**；写不出校验的名单，宁可不写（`overview.md` 那句
   "两处列同一批名字必然漂移"说的就是它）。

## 怎么验证

```powershell
npm test                                          # 全部离线自测（从磁盘发现；含下面这些，附带负向控制的那几条也含在内）
node tools\release-check.mjs --local              # 工作树干净、每个自测都在 README 里、组合不挂 MCP 行
```

一条自测的名字与它守的那条性质，写在 `../README.md` 的 "Develop it" 一节（`release-check` 会核对：`tools/` 下有的自测，
README 必须点名）。这里只回答"怎么一次跑完"，不再抄第二份名单。`doc-selftest` 与 `scaffold-selftest` 另外接受
`--negative-controls`：把每条检查各变异一次，证明它真的会红——新加一条护栏时跑这个，别信一次全绿的普通运行。

`archive/plan-v0.md` 里的链接**按当时的布局**写，不保证可解析——它记录的是历史，改它等于改写历史。
