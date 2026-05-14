---
id: US-004
epic: EPIC-011-session-pool
priority: must-have
status: done
testing: []
---

# US-004 — Destroy Single Session

As an **AI agent**, I want to **destroy a specific Grid session**, so that **I can free up Grid capacity when a session is no longer needed**.

## Context

Quits the WebDriver, removes the GridSession from the SessionPool, and frees the Grid slot.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/session-destroy.ts`, `selenium-mcp-server/src/grid/session-pool.ts` (destroySession)
**Builds on:** [US-001 — Create Grid session](./US-001-create-grid-session.md)

## Acceptance criteria

- [ ] AC 1 — Destroys the specified session and quits its WebDriver.
- [ ] AC 2 — Removes the session from the SessionPool.
- [ ] AC 3 — If the destroyed session was active, active session is cleared.
- [ ] AC 4 — Destroying a non-existent session returns an error result.
