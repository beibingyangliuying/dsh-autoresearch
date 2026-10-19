# `research/adoption/` — what this study borrows, on what terms

Produced by the `adoption-ruling` skill. One file per reference **actually read**: `<itemKey>.md`, keyed
by the reference-library item key — the same key the question's ledger row joins on. The reader is a future
implementer who will never open the paper.

## Why it exists

A section note explains the method **in the paper's own terms, without evaluating**; the `/digest` is
their paper-level projection; and the question's ledger row says how far the paper was read and why the
reading stopped. None of them says what *we* take, under what condition it survives our data, into
which module it goes, or how anyone would notice that the code implements a different formula. This
directory answers that, one item at a time — and until it does, the only thing standing between a
paper's equation and its implementation is memory.

## Conventions

- **File name**: `<itemKey>.md`, the library key of the reference. One reference is one file; a second
  reading **appends** items and never rewrites a ruled one.
- **Item id**: `A-<itemKey>-NN`. Stable for life. Never renumber; a dropped candidate leaves its number
  unused and the file says so.
- **The verdict vocabulary is closed**: `adopt` · `adopt-modified` · `reference-only` · `reject`, with
  `candidate` before a verdict and `implemented` / `verified` after one.
- **Every `adopt` or `adopt-modified` item carries a numeric anchor** — inputs → output, with its
  provenance. No anchor, no adoption: the item stays a candidate, however confident the reading is.
- **This document is not evidence about the world.** It may not ground an experiment or a conclusion.
  It **does** bind the code: code that disagrees with a ruled item is a defect.
- Language is the study's. Paths, symbols and identifiers stay original.

## Required sections

1. `## 这份文献对我们是什么` — one paragraph: method source / baseline / comparison / background only.
2. `## 索引表` — ID · one line · verdict · target · anchor present? It must agree with the items below.
3. One `###` per item, carrying six fields — the paper's locator, the paper's verbatim form, our
   normalized form with a symbol map, "holds when" plus how it is checked here, the intended target, and
   the numeric anchor — and then what would refute it and the fallback.
4. `## 裁定` — dated lines: date · item · verdict · who ruled · on what grounds.
5. `## 拒用及理由` — what is not borrowable, and why (this is the part that saves the next round).
6. `## 未决 / Gaps` — including "this equation is covered by no section note".
7. `## 重开条件` — what would reopen each item: retraction, a precondition failing on our data, code
   drifting from the item.

## `INDEX.md` — the module view

One line per module, so code can find its formula without knowing which paper it came from:

```
<module path> | <item id> | <one line: what it supplies> | <the reference doc path>
```

Derived data: if it is lost, rebuild it from the per-reference files. Add a line when an item reaches
`implemented`, not before — the index describes code that exists.

## Rules

- Read the reference's file before adding an item; append, never reword a ruled item.
- **A verdict is the owner's.** The agent proposes candidates; `## 裁定` records who ruled and on what
  grounds, item by item.
- An item that exists in another reference's file too is **linked**, never copied. Two copies of one
  formula diverge.
- Nothing here is written from memory of the paper: a formula is transcribed from a slice actually read,
  and the slice offset is recorded.
- A formula whose copy is ambiguous is `ambiguous` and blocked, **not reconstructed**.
- This directory writes nothing into the reference library. The `/digest` note belongs on the record;
  the reading record is the question's ledger row in `../literature/<topic>.md`; section notes belong on
  the record.

## What is not in this directory

- **Not the digest** — that is the record's `/digest` note, a projection of its section notes. The
  reading record is the question's ledger row under `../literature/<topic>.md`.
- **Not a literature note** — that is `../literature/<topic>.md`, and it is about the field.
- **Not an experiment card** — that is `../experiments/<id>.md`, and it records a run that happened.

<!-- EXAMPLE:BEGIN — one filled item, holding no domain. Delete this block. -->
### A-ABCD1234-01 一阶敏感性系数

- 原文定位：§3.2 · 公式 (12) · 切片 24000–36000
- 原文式（照抄）：
  $$\Delta y = J\,\Delta x$$
- 我们的归一化式：`J` → `jacobian.sensitivity`，无量纲化（nu），数值不变
- 成立条件：工作点附近线性化，且 `|Δx| < 0.05 nu`；在这里怎么验：`tests/test_linearize.py` 的线性区间扫点（`checked`）
- 意图目标：`src/core/linearize.py::sensitivity`
- 数值锚点：输入 … → `0.317`（论文表 2）；读者实算 … → `0.3169`（`reader-computed`，`tests/test_linearize.py::test_anchor_01`）
- 反驳条件：`|Δx| > 0.05 nu` 时该近似给出反向符号
- 退路：该区间内回落到完整求解
- 状态：candidate
<!-- EXAMPLE:END -->
