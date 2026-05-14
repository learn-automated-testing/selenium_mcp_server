---
id: US-003
epic: EPIC-006-test-planner-agent
priority: must-have
status: done
testing: []
---

# US-003 — Save Test Plan

As an **AI agent**, I want to **save the generated test plan to a markdown file**, so that **a human reviewer can read, approve, or request changes before test generation begins**.

## Context

The final step of the planner workflow. Saves the structured test plan (pages, scenarios, test cases) as a markdown file. This is the human review gate — the agent stops here and presents the plan.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/planner/planner-save-plan.ts`
**Builds on:** [US-002 — Explore page in detail](./US-002-explore-page.md)

## Acceptance criteria

- [ ] AC 1 — Test plan is saved as a markdown file to the specified path.
- [ ] AC 2 — Plan includes discovered pages, forms, and test scenarios.
- [ ] AC 3 — File path is validated through sandbox utility.
- [ ] AC 4 — Tool result confirms the save location for human review.
