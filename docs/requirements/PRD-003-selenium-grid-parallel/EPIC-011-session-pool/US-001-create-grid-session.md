---
id: US-001
epic: EPIC-011-session-pool
priority: must-have
status: done
testing: []
---

# US-001 — Create Grid Session

As an **AI agent**, I want to **create a new browser session on the Grid**, so that **I can run automation in a parallel browser instance**.

## Context

Creates a WebDriver session against the Grid hub, wraps it in a GridSession, and adds it to the SessionPool.

**Existing implementation:** `selenium-mcp-server/src/grid/session-pool.ts` (createSession), `selenium-mcp-server/src/tools/grid/session-create.ts`
**Builds on:** [EPIC-010 — Grid Infrastructure](../EPIC-010-grid-management/EPIC-010-grid-management.md)

## Acceptance criteria

- [ ] AC 1 — Creates a new WebDriver session on the Grid.
- [ ] AC 2 — Session is wrapped in a GridSession with independent snapshot state.
- [ ] AC 3 — Session is added to the SessionPool map.
- [ ] AC 4 — Returns the session ID for subsequent use.
- [ ] AC 5 — BiDi WebSocket URL is rewritten for Grid hub routing.
