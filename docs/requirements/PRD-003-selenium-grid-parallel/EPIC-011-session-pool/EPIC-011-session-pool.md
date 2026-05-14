# EPIC-011 — Session Pool Management

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-003 — Selenium Grid Parallel Automation](../PRD-003-selenium-grid-parallel.md)

## Problem statement

Parallel automation requires managing multiple concurrent browser sessions on the Grid. AI agents need to create sessions, switch between them, list active sessions, and destroy them when done. Each session must have its own driver, page snapshot, and state — fully isolated from other sessions. The session pool provides this multi-session management layer.

Key files: `selenium-mcp-server/src/grid/session-pool.ts`, `selenium-mcp-server/src/grid/grid-session.ts`, `selenium-mcp-server/src/grid/session-context.ts`, `selenium-mcp-server/src/context.ts` (activeGridSession, activeSessionId).

## Goal

An AI agent can create, select, list, and destroy browser sessions on the Selenium Grid — enabling concurrent multi-session automation with full isolation between sessions.

## Scope (v1)

**In scope**
- Create new browser sessions on Grid
- Switch active session (context switching)
- List all active sessions with metadata
- Destroy individual sessions
- Destroy all sessions (bulk cleanup)

**Out of scope**
- Session persistence across Grid restarts
- Session sharing between MCP clients
- Automatic session timeout/cleanup

## Users

- **AI Agents** — manage multiple concurrent browser sessions for parallel tasks.
- **QA Engineers** — run tests in parallel across multiple browsers.

## User stories

### Must-have
- [US-001 — Create Grid session](./US-001-create-grid-session.md)
- [US-002 — Select active session](./US-002-select-active-session.md)
- [US-003 — List Grid sessions](./US-003-list-grid-sessions.md)
- [US-004 — Destroy single session](./US-004-destroy-single-session.md)
- [US-005 — Destroy all sessions](./US-005-destroy-all-sessions.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Session lifecycle | US-001, US-004, US-005 |
| MH-2 | Session switching | US-002, US-003 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. Sessions stored in a Map keyed by session ID in SessionPool.
2. Each GridSession wraps a WebDriver + independent snapshot state.
3. BiDi WebSocket URLs auto-rewritten for Grid hub routing.
4. Context tracks `activeGridSession` and `activeSessionId` for tool routing.

## Open questions

- None.

## Success metrics

- Multiple sessions can run concurrently without interference
- Context switching between sessions is seamless (tools operate on active session)
- All sessions cleaned up on destroy-all

---

**Relation with other epics:**
- [EPIC-010 — Grid Infrastructure](../EPIC-010-grid-management/EPIC-010-grid-management.md) — Grid must be running for sessions.
- [EPIC-012 — Parallel Exploration](../EPIC-012-parallel-exploration/EPIC-012-parallel-exploration.md) — uses session pool for parallel execution.
