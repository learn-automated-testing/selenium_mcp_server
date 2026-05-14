# EPIC-008 — Test Healer Agent

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-002 — AI Test Agent Pipeline](../PRD-002-ai-test-agent-pipeline.md)

## Problem statement

Browser tests are fragile — UI changes break selectors, page restructuring invalidates assertions, and dynamic content causes flaky failures. Manually debugging and fixing broken tests is time-consuming. AI agents need tools to run test suites, identify failures, inspect the current page state to find updated selectors, and apply fixes — creating a self-healing test maintenance loop.

Key files: `selenium-mcp-server/src/tools/agents/healer/`, `agents/selenium-test-healer.agent.md`.

## Goal

An AI agent can run test suites, identify failures, debug root causes (stale selectors, changed assertions), inspect the live page for updated locators, and apply fixes — maintaining test reliability with minimal human intervention.

## Scope (v1)

**In scope**
- Run test suites and capture output with exit codes
- Debug failing tests (analyze output, identify root cause)
- Apply fixes to test files
- Inspect live page to find current selectors
- Generate CSS/XPath locators for elements

**Out of scope**
- Automatic test retries in CI/CD
- Test performance profiling
- Multi-repo test healing

## Users

- **AI Agents** — execute heal cycle (run → debug → fix → re-run).
- **QA Engineers** — review suggested fixes before applying.
- **Developers** — benefit from auto-healed tests in CI pipelines.

## User stories

### Must-have
- [US-001 — Run test suite](./US-001-run-test-suite.md)
- [US-002 — Debug failing test](./US-002-debug-failing-test.md)
- [US-003 — Fix broken test](./US-003-fix-broken-test.md)
- [US-004 — Inspect page for selectors](./US-004-inspect-page.md)
- [US-005 — Generate element locator](./US-005-generate-locator.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Run & debug | US-001, US-002 |
| MH-2 | Fix & verify | US-003, US-004, US-005 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. `healer_run_tests` captures stdout, stderr, and exit code — agent analyzes output to identify failures.
2. `healer_fix_test` writes directly to test files — human review via diff before commit.
3. `browser_generate_locator` produces both CSS selector and XPath for resilience.

## Open questions

- None.

## Success metrics

- Healer can identify and fix common failures (stale selectors, changed text)
- Fix-and-rerun cycle completes without human intervention for simple failures
- Generated locators are stable across minor UI changes

---

**Relation with other epics:**
- [EPIC-007 — Test Generator Agent](../EPIC-007-test-generator-agent/EPIC-007-test-generator-agent.md) — heals tests produced by generator.
