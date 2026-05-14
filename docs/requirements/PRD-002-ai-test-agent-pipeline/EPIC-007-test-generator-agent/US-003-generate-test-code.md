---
id: US-003
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-003 — Generate Test Code

As an **AI agent**, I want to **generate test code from recorded actions for the chosen framework**, so that **the recorded interactions become executable, maintainable test files**.

## Context

The core generation tool. Takes recorded actions and the selected framework, generates idiomatic test code following the conventions in `docs/FRAMEWORK_STANDARDS.md`.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/generator/generator-write-test.ts`
**Builds on:** [US-002 — Read recorded action log](./US-002-read-action-log.md), `docs/FRAMEWORK_STANDARDS.md`

## Acceptance criteria

- [ ] AC 1 — Generated test code follows the conventions of the selected framework.
- [ ] AC 2 — All recorded actions are translated into test steps.
- [ ] AC 3 — Element locators use stable selectors (data-testid, aria-label preferred).
- [ ] AC 4 — Generated code includes proper imports, setup, and teardown.
- [ ] AC 5 — The tool writes the test file to disk (not just returns code). It also performs non-blocking selector validation against the live page, creates/updates a `.test-manifest.json`, and clears the recording history after saving.
