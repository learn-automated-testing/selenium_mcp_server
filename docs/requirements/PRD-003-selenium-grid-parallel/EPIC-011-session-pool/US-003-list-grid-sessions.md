---
id: US-003
epic: EPIC-011-session-pool
priority: must-have
status: done
testing: []
---

# US-003 — List Grid Sessions

As an **AI agent**, I want to **list all active Grid sessions**, so that **I can see what sessions are running and choose which one to work with**.

## Context

Returns all sessions from the SessionPool with metadata (ID, browser, URL, tags).

**Existing implementation:** `selenium-mcp-server/src/tools/grid/session-list.ts`, `selenium-mcp-server/src/grid/session-pool.ts` (listSessions)
**Builds on:** [US-001 — Create Grid session](./US-001-create-grid-session.md)

## Acceptance criteria

- [ ] AC 1 — Returns a list of all active sessions with their IDs.
- [ ] AC 2 — Each session entry includes browser type and current URL.
- [ ] AC 3 — Supports optional tag-based filtering.
- [ ] AC 4 — The currently active session is indicated.
