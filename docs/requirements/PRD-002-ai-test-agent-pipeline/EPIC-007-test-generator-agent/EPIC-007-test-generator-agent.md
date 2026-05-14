# EPIC-007 — Test Generator Agent

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-002 — AI Test Agent Pipeline](../PRD-002-ai-test-agent-pipeline.md)

## Problem statement

Translating test plans into executable test code is tedious and framework-specific. Teams use different frameworks (Playwright, WebdriverIO, Cypress, Selenium in 4 languages, Robot Framework, etc.) and each has different conventions. AI agents need to record browser interactions, then generate idiomatic test code for the user's chosen framework — including seed data and test specifications.

Key files: `selenium-mcp-server/src/tools/agents/generator/`, `selenium-mcp-server/src/tools/recording/`, `selenium-mcp-server/src/context.ts` (recordingEnabled, actionHistory, generatorFramework), `docs/FRAMEWORK_STANDARDS.md`.

## Goal

An AI agent can record browser interactions and generate idiomatic test code for any of 14 supported frameworks — including seed data and test specifications — with human review before saving.

## Scope (v1)

**In scope**
- Setup generation session with framework selection and recording start
- Action recording system (start, stop, status check, clear)
- Read recorded action log for test generation
- Generate test code for chosen framework from recorded actions
- Generate seed/fixture data files
- Save and read test specifications

**Out of scope**
- Test execution (EPIC-008 Healer handles running tests)
- Framework auto-detection
- Multi-file test suite generation in one call

## Users

- **AI Agents** — record interactions and generate test code.
- **QA Engineers** — choose framework, review generated tests, approve file saves.
- **Developers** — integrate generated tests into CI/CD.

## User stories

### Must-have
- [US-001 — Setup generation session](./US-001-setup-generation-session.md)
- [US-002 — Read recorded action log](./US-002-read-action-log.md)
- [US-003 — Generate test code](./US-003-generate-test-code.md)
- [US-004 — Generate seed data](./US-004-generate-seed-data.md)
- [US-005 — Save test specification](./US-005-save-test-spec.md)
- [US-006 — Read existing test spec](./US-006-read-test-spec.md)
- [US-007 — Start action recording](./US-007-start-recording.md)
- [US-008 — Stop action recording](./US-008-stop-recording.md)
- [US-009 — Check recording status](./US-009-recording-status.md)
- [US-010 — Clear recorded actions](./US-010-clear-recording.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Recording system | US-007, US-008, US-009, US-010 |
| MH-2 | Generation session | US-001, US-002 |
| MH-3 | Code generation | US-003, US-004, US-005, US-006 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. Framework choice is set per generation session via `generator_setup_page`.
2. Recording captures tool name, parameters, and element refs for each action.
3. 14 frameworks supported per `docs/FRAMEWORK_STANDARDS.md` conventions.
4. Human review gate: agent asks for file save location approval before writing.

## Open questions

- None.

## Success metrics

- Generated test code is syntactically valid for each of the 14 supported frameworks
- Recorded actions accurately translate to test steps
- Seed data files match test requirements

---

**Relation with other epics:**
- [EPIC-006 — Test Planner Agent](../EPIC-006-test-planner-agent/EPIC-006-test-planner-agent.md) — provides approved test plan.
- [EPIC-008 — Test Healer Agent](../EPIC-008-test-healer-agent/EPIC-008-test-healer-agent.md) — runs and fixes generated tests.
