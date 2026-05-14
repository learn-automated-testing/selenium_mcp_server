---
id: US-001
epic: EPIC-005-session-management
priority: must-have
status: done
testing: []
---

# US-001 — Close Browser

As an **AI agent**, I want to **close the browser and clean up all resources**, so that **no orphan processes remain after my automation is complete**.

## Context

Closes the browser driver, destroys Grid sessions, stops event collection, and cleans up the tracer. This is the cleanup tool called at the end of automation.

**Existing implementation:** `selenium-mcp-server/src/tools/session/close-browser.ts`, `selenium-mcp-server/src/context.ts` (Context.close)
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Browser driver is quit and all processes cleaned up.
- [ ] AC 2 — Grid sessions are destroyed if any exist.
- [ ] AC 3 — Event collector and tracer are stopped.
- [ ] AC 4 — Calling close on an already-closed session is a no-op (no error).
