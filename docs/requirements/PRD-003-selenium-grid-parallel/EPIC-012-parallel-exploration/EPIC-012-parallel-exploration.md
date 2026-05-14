# EPIC-012 — Parallel Exploration & Execution

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-003 — Selenium Grid Parallel Automation](../PRD-003-selenium-grid-parallel.md)

## Problem statement

Exploring a large web application sequentially is slow. AI agents need to explore multiple URLs simultaneously across Grid sessions, then merge results for a complete picture. They also need to compare exploration runs (before/after a deploy) and generate test plans from exploration data. The ExplorationCoordinator orchestrates this parallel work.

Key files: `selenium-mcp-server/src/grid/exploration-coordinator.ts`, `selenium-mcp-server/src/tools/grid/`.

## Goal

An AI agent can explore multiple URLs in parallel across Grid sessions, execute tasks concurrently, merge and diff exploration results, and generate test plans from exploration data — dramatically reducing exploration time for large applications.

## Scope (v1)

**In scope**
- Parallel exploration of multiple URLs across Grid sessions
- Parallel execution of tool sequences across sessions
- Merge exploration results into unified view
- Diff two exploration results (before/after comparison)
- Generate test plan from exploration data

**Out of scope**
- Automatic URL discovery / crawling (URLs must be specified)
- Cross-session communication during execution
- Real-time progress streaming

## Users

- **AI Agents** — efficiently explore large web applications in parallel.
- **QA Engineers** — compare exploration results across deployments.

## User stories

### Must-have
- [US-001 — Parallel explore URLs](./US-001-parallel-explore.md)
- [US-002 — Parallel execute tasks](./US-002-parallel-execute.md)
- [US-003 — Merge exploration results](./US-003-merge-results.md)

### Should-have
- [US-004 — Diff exploration results](./US-004-diff-results.md)
- [US-005 — Generate plan from exploration](./US-005-generate-plan.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Parallel execution | US-001, US-002 |
| MH-2 | Result analysis | US-003, US-004, US-005 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. ExplorationCoordinator creates one Grid session per target URL.
2. Forms and links extracted via JavaScript injection (EXTRACT_FORMS_SCRIPT, EXTRACT_LINKS_SCRIPT).
3. Exploration results include pages, workflows, and timing metadata.
4. Merge combines results into a single unified view; diff identifies additions/removals.

## Open questions

- None.

## Success metrics

- Parallel exploration of N URLs completes in roughly 1/N the time of sequential
- Merged results contain all pages and workflows from all sessions
- Diff accurately identifies changes between exploration runs

---

**Relation with other epics:**
- [EPIC-011 — Session Pool](../EPIC-011-session-pool/EPIC-011-session-pool.md) — uses session pool for parallel sessions.
- [EPIC-006 — Test Planner Agent](../../PRD-002-ai-test-agent-pipeline/EPIC-006-test-planner-agent/EPIC-006-test-planner-agent.md) — exploration results feed into test planning.
