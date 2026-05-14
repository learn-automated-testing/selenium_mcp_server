---
id: US-002
epic: EPIC-005-session-management
priority: must-have
status: done
testing: []
---

# US-002 — Reset Session

As an **AI agent**, I want to **reset the browser to a clean state**, so that **I can start fresh between test scenarios without residual cookies, storage, or state**.

## Context

Closes the current browser and creates a new one — equivalent to close + navigate_to. Clears all state including cookies, localStorage, and session storage.

**Existing implementation:** `selenium-mcp-server/src/tools/session/reset-session.ts`
**Builds on:** [US-001 — Close browser](./US-001-close-browser.md)

## Acceptance criteria

- [ ] AC 1 — Reset closes the current browser and creates a fresh session.
- [ ] AC 2 — All cookies, localStorage, and session storage are cleared.
- [ ] AC 3 — The new session starts with no history.
