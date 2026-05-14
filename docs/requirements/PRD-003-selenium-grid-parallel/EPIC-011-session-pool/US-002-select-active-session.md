---
id: US-002
epic: EPIC-011-session-pool
priority: must-have
status: done
testing: []
---

# US-002 — Select Active Session

As an **AI agent**, I want to **switch the active session to a specific Grid session**, so that **subsequent tool calls operate on that session's browser**.

## Context

Changes the Context's activeGridSession and activeSessionId so all standard tools (navigate, click, etc.) route to the selected session.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/session-select.ts`, `selenium-mcp-server/src/context.ts` (selectSession)
**Builds on:** [US-001 — Create Grid session](./US-001-create-grid-session.md)

## Acceptance criteria

- [ ] AC 1 — Selecting a valid session ID sets it as the active session on Context.
- [ ] AC 2 — Subsequent tool calls use the selected session's driver and snapshot.
- [ ] AC 3 — Selecting an invalid session ID returns an error result.
