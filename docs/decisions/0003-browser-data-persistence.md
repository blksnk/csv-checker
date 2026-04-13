---
date: 2026-04-10
---

# Browser data persistence scope

## Context and Problem Statement

What should we persist in the browser for this CSV validation workflow? Full application state, nothing, or a minimal slice of domain data?

## Decision Drivers

- Let users resume work without re-uploading or re-entering data
- Avoid storing unnecessary or sensitive UI-only state
- Keep storage size and sync complexity reasonable

## Considered Options

* Everything (whole client state)
* Nothing (no persistence)
* Only the bare minimum (CSV rows and schema columns)

## Decision Outcome

Chosen option: "Only the bare minimum (CSV rows & schema columns)", because persistence is a core feature: users can iterate on validation over multiple sessions instead of finishing in one sitting. We persist only what is needed to restore the dataset and column definitions, not ephemeral UI or redundant state.

### Consequences

* Good, because users keep their work across reloads without persisting unnecessary data
* Good, because storage stays focused on the problem domain
* Bad, because anything not in that slice (e.g. validation state) must be re-derived or lost unless handled elsewhere
