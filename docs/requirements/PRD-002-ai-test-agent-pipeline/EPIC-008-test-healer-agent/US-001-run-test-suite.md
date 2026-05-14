---
id: US-001
epic: EPIC-008-test-healer-agent
priority: must-have
status: done
testing: []
---

# US-001 — Run Test Suite

As an **AI agent**, I want to **run a test suite and capture its output**, so that **I can identify which tests pass and which fail**.

## Context

Executes a test command (e.g., `npx playwright test`, `npx wdio run`), captures stdout, stderr, and exit code. The agent analyzes the output to identify failures.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/healer/healer-run-tests.ts`
**Builds on:** Generated test files from EPIC-007

## Acceptance criteria

- [ ] AC 1 — Executes the specified test command.
- [ ] AC 2 — Captures stdout, stderr, and exit code.
- [ ] AC 3 — Returns structured output that the agent can analyze for failures.
- [ ] AC 4 — Supports configurable timeout for long-running suites.
