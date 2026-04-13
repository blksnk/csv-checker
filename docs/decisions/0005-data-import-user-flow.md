---
date: 2026-04-11
---

# Data import user flow

## Context and Problem Statement

After the user picks a CSV file, how should we proceed? Import immediately, ask for a lightweight confirm/cancel, or show a structured preview before committing?

## Decision Drivers

- Avoid accidental overwrites of in-progress work
- Make column-level changes (add / keep / remove) understandable before load
- Keep the path from file drop to “data in the app” deliberate, not silent

## Considered Options

* Dropzone only: import as soon as a file is accepted
* Confirmation modal after drop (confirm / cancel, little or no structural detail)
* Pre-import preview of the dropped file, including a comparison with the app’s current column set

## Decision Outcome

Chosen option: "Pre-import preview with comparison to current state (columns)", because users should see what they are about to load and how it differs from the draft before committing the import. That reduces surprise and supports informed cancel vs proceed.

### Consequences

* Good, because import is explicit (cancel vs upload) and grounded in real column structure
* Good, because users see new / retained / removed columns before data and rules change
* Bad, because parsing and rendering preview adds complexity and work before any import compared to immediate load
