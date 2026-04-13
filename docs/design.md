# Design document: Spreadsheet Error Checker

This document satisfies the case-study deliverable for **architecture**, **one architecture decision**, **UX approach**, and **trade-offs**. Additional decisions are recorded in [`docs/decisions/`](decisions/).

---

## Architecture overview

The app is a **single-page Vite + React** prototype with **no backend**: CSV parsing, editing, validation, and persistence all run in the browser.

### User flow

Four routes mirror the user journey:

1. **Home**
2. **Upload** (`/upload`)
3. **Schema / rules** (`/rules`)
4. **Editor** (`/editor`).

### State management

State is split into focused **LegendApp State** observables (`csv`, `schema`, `validation`, `editor`) so large row arrays can update without blanket re-renders.

#### Persistence

**IndexedDB** is used to persist data locally. Only **CSV rows** and **column schema** get saved: enough for users to resume work after refresh, without persiting ephemeral UI.

### CSV Parsing & Rendering

#### Parsing

CSV files are parsed using the **`PapaParse`** library.

To keep performance snappy, we only parse the whole file once the user commits to uploading the file. File previews & schema columns are based on the first 10 rows of data.

#### Rendering

In order to keep performance acceptable even when manipulating very large CSV files, the spreadsheet grid is rendered using a virtualized HMTL table (that uses the **`React Virtuoso`** library under the hood).

### Data validation

**Validation** runs off the main thread and is offloaded to a small **web worker pool** that runs per-column extractors and cell- and column-scoped validators.

Cell errors then get aggregated and shown to the user in a side panel.

#### Error cap

Returned errors are capped, so as to avoid paying huge serialization costs and possible OOM-related crashed when validating huge files.

While this implementation detail was originally intended as a way to ensure consistent performance & reliability, it also contributes to better UX:

- We limit the amount of errors the user sees at once, which reduces apparent complexity.
- In the case errors have been capped, we invite the user to review and possibly edit their validation rules in case something was misconfigured.

**Key structural choices:** separation of **import** (explicit preview and column diff vs current draft), **schema** (types and constraints per column), and **editing** (virtualized cells, error panel, undo). See ADRs in `docs/decisions/` for state, grid, persistence, rules, and import flow.

---

## Architecture decision record (highlighted)

**Decision:** Ground **validation rules in the user’s CSV columns** (types + constraints like required, unique, and conditional requirements referencing other columns): not a fixed-only schema, and not a free-form rule DSL.

**Alternatives considered:**

| Option | Summary |
| --- | --- |
| **Fixed rules only** | Simpler to build; weak fit for messy real-world files and user confidence. |
| **Free-form / abstract rules** | Powerful; hard for non-technical users to map to what they see in the sheet. |
| **Column-based rules** (chosen) | Rules stay tied to visible columns and row context. |

**Why this approach:** The case study centers on users who must **understand** what is wrong and **act** without being spreadsheet experts. Anchoring rules to **their** columns makes errors explainable (“this column should be an email”, “required if column X is filled”) and keeps mental load low compared to an unconstrained expression language.

**Trade-off:** Cross-sheet or global constraints are not first-class; extending the model would be a follow-up. Full detail: [`docs/decisions/0004-validation-rules-strategy.md`](decisions/0004-validation-rules-strategy.md).

---

## UX decisions

### Complexity

The workflow is broken into **three explicit steps** (upload → configure rules → edit) so users are not dropped straight into a dense grid.

- **Import** uses a **preview** and **column comparison** with any existing draft so “replace everything” is a conscious choice, not an accident.
- **Configure rules** allows users to define and adjust validation rules and schema constraints for each column, making data checks explicit before editing begins.
- **Edit** provides a virtualized spreadsheet grid for efficient editing, error review, and correction, with support for inline fixes, undo/redo, and guidance tools that keep iteration fast and focused.

While each step depends on those that come before it, users can freely jump between each of them at any time in order to review and apply changes.

### Validation

Rules run **asynchronously** so the UI stays responsive on large datasets. Errors are **cell-addressed** and surfaced in a dedicated **error panel** that offers a human-readable explanation of each error and quick navigation to the offending cell, reducing hunt-and-scroll. In the case where a cell contains multiple errors (e.g. Wrong type and required), both errors are visually grouped under the same cell header.

### User guidance

Whenever possible, technical terms and concepts (typing, constraints, errors) are written and explained in plain, non-technical language. Tooltips also help improving user understanding, while providing reassurance before comitting to an action.

Contextual callouts and explanations help guide users through the flow.

---

## Trade-offs

**Simplified or scoped on purpose**

- **Virtuoso** gives performance and “scroll to row” control but **cell UI is custom-built**, not a full spreadsheet product.
- **Prototype scope:** polish is secondary to clarity of flow and structure (per brief).
- **Privacy / ops:** everything is local-only; no collaboration, server-side validation, or sharing.

**With more time**

- Richer cell feedback (e.g. icons or row highlights synced to the error list, error tooltips on affected cells).
- Export / download UX and validation summary before export.
- Stronger handling of edge cases in CSV encoding and very wide files.
  - Handling of error states during file import / CSV parsing
  - Empty states in Rules configuration & Spreadsheet edition steps
- Better, more user-centric wording & consistent tone.
- Deeper ADRs for worker orchestration and error caps if the validation model grows.
- Unit / E2E tests
- Responsive design

---

*Related:* [`README.md`](../README.md) | [`docs/decisions/`](decisions/)
