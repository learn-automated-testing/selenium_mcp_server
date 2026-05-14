# PRD-002 — AI Test Agent Pipeline

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source material:** `docs/AGENT_WORKFLOW.md`, `docs/FRAMEWORK_STANDARDS.md`, `docs/EXAMPLE_CHATS.md`, `agents/`

## Problem statement

Writing and maintaining browser tests is labor-intensive. Test plans are often ad-hoc, test code is fragile (stale selectors break on UI changes), and teams lack systematic coverage analysis tied to product requirements. AI agents need structured workflows to plan tests, generate maintainable test code across multiple frameworks, and autonomously heal broken tests — with human review gates at each phase to ensure quality.

## Goal

An AI agent can systematically plan, generate, and maintain browser tests through a structured 3-phase pipeline (plan → generate → heal) with human review gates — reducing test creation time and improving test reliability across 14 supported frameworks.

## Users

- **AI Agents (LLMs)** — execute the testing pipeline through MCP tool calls following agent prompts.
- **QA Engineers** — review test plans, approve generated tests, configure target frameworks, analyze regression risk.
- **Developers** — use generated tests in CI/CD pipelines, benefit from auto-healed tests.

## Capabilities (high level)

- Test Planner Agent — explore web applications, discover testable surfaces (pages, forms, workflows), generate structured markdown test plans
- Test Generator Agent — record browser interactions, generate test code for 14 frameworks (Playwright, WebdriverIO, Cypress, Selenium Java/Python/C#/Ruby, Robot Framework, etc.), save specs
- Action Recording System — start/stop/clear browser action sequences that feed into test generation
- Test Healer Agent — run test suites, debug failures, fix broken selectors and assertions, re-validate
- Regression Analyzer — import context (PRDs, user stories, compliance docs), scan products, build risk profiles, generate coverage documentation

## Non-functional requirements

- **Performance:** Test plan generation < 30 s for typical web app; test code generation < 10 s per test
- **Security:** File operations sandboxed; generated test code written to user-specified output directory
- **Framework support:** 14 frameworks documented in `docs/FRAMEWORK_STANDARDS.md`
- **Human review:** Mandatory review gates between phases — agents stop and present results before proceeding

## Out of scope

- Test execution infrastructure (CI/CD integration is user responsibility)
- Visual regression testing
- Performance / load testing
- Mobile-specific test generation

## Open questions

- None — all capabilities are implemented.

## Success metrics

- 3-phase pipeline functional end-to-end (plan → generate → heal)
- 14 test frameworks supported with documented code conventions
- Human review gates enforced at each phase transition
- Regression analyzer produces actionable risk profiles from imported context

---

## Epics

- [EPIC-006 — Test Planner Agent](./EPIC-006-test-planner-agent/EPIC-006-test-planner-agent.md)
- [EPIC-007 — Test Generator Agent](./EPIC-007-test-generator-agent/EPIC-007-test-generator-agent.md)
- [EPIC-008 — Test Healer Agent](./EPIC-008-test-healer-agent/EPIC-008-test-healer-agent.md)
- [EPIC-009 — Regression Analyzer](./EPIC-009-regression-analyzer/EPIC-009-regression-analyzer.md)
