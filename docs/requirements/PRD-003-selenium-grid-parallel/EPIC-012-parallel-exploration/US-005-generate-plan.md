---
id: US-005
epic: EPIC-012-parallel-exploration
priority: should-have
status: done
testing: []
---

# US-005 — Generate Plan from Exploration

As an **AI agent**, I want to **generate a test plan from exploration data**, so that **parallel exploration results feed directly into the test planning workflow**.

## Context

Takes exploration results (pages, forms, workflows) and generates a structured test plan — bridging parallel exploration (PRD-003) with test planning (PRD-002 EPIC-006).

**Existing implementation:** `selenium-mcp-server/src/tools/grid/planner-generate-plan.ts`
**Builds on:** [US-001 — Parallel explore URLs](./US-001-parallel-explore.md), [EPIC-006 — Test Planner](../../PRD-002-ai-test-agent-pipeline/EPIC-006-test-planner-agent/EPIC-006-test-planner-agent.md)

## Acceptance criteria

- [ ] AC 1 — Generates a test plan from exploration results.
- [ ] AC 2 — Plan covers all discovered pages and workflows.
- [ ] AC 3 — Plan is formatted as markdown, compatible with the planner agent output.
