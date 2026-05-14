---
id: US-005
epic: EPIC-011-session-pool
priority: must-have
status: done
testing: []
---

# US-005 — Destroy All Sessions

As an **AI agent**, I want to **destroy all Grid sessions at once**, so that **I can clean up all parallel sessions when my work is complete**.

## Context

Bulk cleanup — quits all WebDrivers and clears the SessionPool.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/session-destroy-all.ts`
**Builds on:** [US-001 — Create Grid session](./US-001-create-grid-session.md)

## Acceptance criteria

- [ ] AC 1 — All sessions are destroyed and their WebDrivers quit.
- [ ] AC 2 — SessionPool is emptied.
- [ ] AC 3 — Active session is cleared.
- [ ] AC 4 — Returns the count of destroyed sessions.
