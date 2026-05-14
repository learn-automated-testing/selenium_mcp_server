# EPIC-006 — Test Planner Agent

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-002 — AI Test Agent Pipeline](../PRD-002-ai-test-agent-pipeline.md)

## Problem statement

Creating comprehensive test plans manually is time-consuming and error-prone. QA engineers often miss testable surfaces — hidden forms, navigation paths, edge cases. AI agents need tools to systematically explore a web application, discover all pages, forms, and workflows, and produce a structured test plan that a human can review before test generation begins.

Key files: `selenium-mcp-server/src/tools/agents/planner/`, `agents/selenium-test-planner.agent.md`.

## Goal

An AI agent can explore a web application, discover all testable surfaces (pages, forms, navigation paths, workflows), and generate a structured markdown test plan — ready for human review before handing off to the generator agent.

## Scope (v1)

**In scope**
- Initialize planning session with target URL and navigation link discovery
- Deep-explore individual pages (forms, interactive elements, workflows)
- Save structured markdown test plan to file

**Out of scope**
- Automatic test plan approval (human review is mandatory)
- Test code generation (EPIC-007)
- Cross-application comparison

## Users

- **AI Agents** — systematically explore apps and produce test plans.
- **QA Engineers** — review and approve generated test plans.

## User stories

### Must-have
- [US-001 — Setup planning session](./US-001-setup-planning-session.md)
- [US-002 — Explore page in detail](./US-002-explore-page.md)
- [US-003 — Save test plan](./US-003-save-test-plan.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Planning pipeline | US-001, US-002, US-003 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. Planner discovers navigation links via JavaScript extraction, not crawling.
2. Test plans are markdown files — human-readable and diffable.
3. Mandatory human review gate: planner stops and presents plan before generation can begin.

## Open questions

- None.

## Success metrics

- Planner discovers all major pages and forms in a typical web application
- Generated test plan covers positive, negative, and edge-case scenarios
- Human reviewer can approve or request changes before proceeding

---

**Relation with other epics:**
- [EPIC-007 — Test Generator Agent](../EPIC-007-test-generator-agent/EPIC-007-test-generator-agent.md) — consumes approved test plans.
- [EPIC-012 — Parallel Exploration](../../PRD-003-selenium-grid-parallel/EPIC-012-parallel-exploration/EPIC-012-parallel-exploration.md) — parallel exploration can feed into planning.
