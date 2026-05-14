---
id: US-001
epic: EPIC-004-browser-utilities
priority: must-have
status: done
testing: []
---

# US-001 — Execute JavaScript

As an **AI agent**, I want to **execute JavaScript in the browser context**, so that **I can perform custom logic, extract data, or manipulate the DOM when standard tools are insufficient**.

## Context

Runs arbitrary JavaScript in the browser and returns the serialized result. Objects are JSON-stringified. This is a power tool for edge cases not covered by dedicated tools.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/execute-javascript.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — JavaScript is executed in the browser context via `driver.executeScript()` and the return value is serialized.
- [ ] AC 2 — Objects/arrays are JSON-stringified (`JSON.stringify` with 2-space indent) in the result. Primitives are converted via `String()`.
- [ ] AC 3 — JavaScript errors propagate as server-level errors; the tool does not wrap `executeScript` in a try/catch.
- [ ] AC 4 — Only synchronous JavaScript is supported (`executeScript`, not `executeAsyncScript`). The script must use `return` to produce a value.
