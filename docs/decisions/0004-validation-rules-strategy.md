---
date: 2026-04-11
---

# User-defined validation rules

## Context and Problem Statement

Should users be able to define their own validation rules? If yes, in what form—fixed system rules only, an unconstrained format, or something tied to their data?

## Decision Drivers

- Reassurance and control for people editing data (including non-technical users)
- Rules should be understandable in the context of the dataset
- Balance flexibility with clarity and implementability

## Considered Options

* No: fixed schema / built-in rules only
* Yes: with a free-form rule format
* Yes: using the CSV data’s columns as a base

## Decision Outcome

Chosen option: "Yes, using the CSV data’s columns as a base", because custom rules give users confidence while editing. Grounding rules in their actual columns makes behavior easier to reason about than an abstract or fully free-form language.

### Consequences

* Good, because validation maps directly to what users see in their sheet
* Good, because it supports non-technical users better than a generic rule DSL with no anchor
* Good, because the user’s draft stays aligned with the core structure of the input file, so repeated import and download flows stay straightforward
* Bad, because column-centric rules may be awkward for cross-column or global constraints unless we extend the model later
