---
id: US-003
epic: EPIC-004-browser-utilities
priority: must-have
status: done
testing: []
---

# US-003 — Retrieve Console Logs

As an **AI agent**, I want to **retrieve browser console log messages**, so that **I can debug JavaScript errors, warnings, and application log output**.

## Context

Returns console messages from the browser. Uses BiDi event collector when available (levels: `info`, `warn`, `error`), falls back to classic Selenium log API (levels: `INFO`, `WARNING`, `SEVERE`). Also supports clearing the console.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/console-logs.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Returns console messages with their level. Level names differ between BiDi mode (`info`, `warn`, `error`) and classic mode (`INFO`, `WARNING`, `SEVERE`).
- [ ] AC 2 — Optional `level` filter (`ALL`, `INFO`, `WARNING`, `SEVERE`) returns only messages of the specified level.
- [ ] AC 3 — There is no `maxMessages` parameter — all matching messages are returned.
- [ ] AC 4 — `action: 'clear'` clears the BiDi event collector and executes `console.clear()` in the browser.
