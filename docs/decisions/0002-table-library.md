---
date: 2026-06-10
---

# Choosing a data grid library

## Context and Problem Statement

So as not to write a virtual data grid / table component from scratch, we want to use a pre-existing library. Which one ?

## Decision Drivers

* React compatible 
* Support large volumes of data (virtualization)
* Supports various data types, both for display & edition
* Allows for easy navigation
* Extensibility
* Nice to have: filtering, sorting

## Considered Options

* React Virtuoso - `react-virtuso`
* AG Grid - `ag-grid-react`
* HandsonTable - `handsontable`

## Decision Outcome

Chosen option: "React Virtuoso", because it is the only library that did not error out when handling csv data of more than 100 000 rows.

### Consequences

* Good, because it is lightweight and performant
* Good, because its API allows the user to quickly jump to a specific row
* Good, because it is extensible
* Bad, because it requires us to implement the edition flow ourselves (no built in cell content UI)
