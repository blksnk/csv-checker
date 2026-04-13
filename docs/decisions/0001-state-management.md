---
date: 2026-04-09
---

# CSV data state management solution

## Context and Problem Statement

How to store a large-volume dataset for dynamic editing and validation while incurring the least performance costs ?

## Decision Drivers

- Fine-grained reactivity
- Performance while handling a large data volume
- Support for local persistence & periodic sync
- Ease of use in a React environment
- Support for Typescript generics

## Considered Options

1. React State - `useState` + `createContext`
3. LegendApp State library - `@legendapp/state`

## Decision Outcome

Chosen option: "LegendApp State", because its proxy-based approach and relatively simple API handles large datasets in a performant manner.

## Pros and Cons of the Options

### React State

- Good, because it is a basic React pattern.
- Good, because its behavior is well understood by React developers
- Good, because it is well integrated by react developers
- Bad, because it offers no simple way to limit re-renders
- Bad, because react contexts have poor support for Typescript generics
- Bad, because react state immutability good practices do not scale well when storing a large object in state

### LegendApp State

- Good, because of its performant proxy-based approach 
- Good, because of its built-in support for local persistence & sync patterns
- Good, because of its excellent React integration built to limit re-renders as much as possible
- Good, because its reactivity is decoupled from React, allowing for usages outside react components & contexts (e.g. web workers)
- Bad, because its API may be unfamiliar to React developers
