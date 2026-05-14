---
id: US-004
epic: EPIC-012-parallel-exploration
priority: should-have
status: done
testing: []
---

# US-004 — Diff Exploration Results

As an **AI agent**, I want to **compare two exploration results**, so that **I can identify what changed between two runs (e.g., before and after a deployment)**.

## Context

Compares two ExplorationResult sets and identifies additions, removals, and changes in pages/workflows.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/exploration-diff.ts`
**Builds on:** [US-001 — Parallel explore URLs](./US-001-parallel-explore.md)

## Acceptance criteria

- [ ] AC 1 — Identifies pages/workflows added in the second exploration.
- [ ] AC 2 — Identifies pages/workflows removed from the first exploration.
- [ ] AC 3 — Identifies pages/workflows that changed between explorations.
