---
id: US-001
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-001 — Setup Generation Session

As an **AI agent**, I want to **initialize a test generation session with a chosen framework**, so that **I can begin recording interactions and generating test code for the correct framework**.

## Context

Entry point for the generator workflow. Sets the target framework (e.g., playwright-ts, webdriverio-ts, cypress) on the Context, navigates to the page, and starts action recording.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/generator/generator-setup-page.ts`
**Builds on:** `selenium-mcp-server/src/context.ts` (generatorFramework), `docs/FRAMEWORK_STANDARDS.md`

## Acceptance criteria

- [ ] AC 1 — Framework is set on the Context for subsequent generation calls.
- [ ] AC 2 — Navigates to the target URL and captures a snapshot.
- [ ] AC 3 — Action recording is started automatically.
- [ ] AC 4 — Supports all 14 frameworks documented in FRAMEWORK_STANDARDS.md.
