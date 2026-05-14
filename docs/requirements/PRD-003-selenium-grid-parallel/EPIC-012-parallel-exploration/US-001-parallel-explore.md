---
id: US-001
epic: EPIC-012-parallel-exploration
priority: must-have
status: done
testing: []
---

# US-001 — Parallel Explore URLs

As an **AI agent**, I want to **explore multiple URLs simultaneously across Grid sessions**, so that **I can map a large web application in a fraction of the sequential time**.

## Context

The ExplorationCoordinator creates one Grid session per target URL, navigates each session to its target, extracts forms and links via JavaScript injection, and returns structured results.

**Existing implementation:** `selenium-mcp-server/src/grid/exploration-coordinator.ts`, `selenium-mcp-server/src/tools/grid/parallel-explore.ts`
**Builds on:** [EPIC-011 — Session Pool](../EPIC-011-session-pool/EPIC-011-session-pool.md)

## Acceptance criteria

- [ ] AC 1 — Creates one Grid session per target URL.
- [ ] AC 2 — All sessions explore their target URLs concurrently.
- [ ] AC 3 — Returns ExplorationResult per target (pages, workflows, forms, links).
- [ ] AC 4 — Includes timing metadata (duration per target).
- [ ] AC 5 — Failed explorations return error status without blocking others.
