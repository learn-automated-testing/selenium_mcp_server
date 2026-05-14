---
id: US-003
epic: EPIC-012-parallel-exploration
priority: must-have
status: done
testing: []
---

# US-003 — Merge Exploration Results

As an **AI agent**, I want to **merge results from multiple parallel explorations into a unified view**, so that **I have a complete picture of the application from all explored sessions**.

## Context

Combines ExplorationResult arrays from parallel explorations into a single merged result with deduplicated pages and workflows.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/exploration-merge.ts`
**Builds on:** [US-001 — Parallel explore URLs](./US-001-parallel-explore.md)

## Acceptance criteria

- [ ] AC 1 — Merges multiple ExplorationResult arrays into one.
- [ ] AC 2 — Pages and workflows are deduplicated.
- [ ] AC 3 — Timing metadata is aggregated.
