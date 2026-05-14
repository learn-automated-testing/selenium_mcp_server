---
id: US-001
epic: EPIC-010-grid-management
priority: must-have
status: done
testing: []
---

# US-001 — Check Grid Status

As an **AI agent**, I want to **check the Selenium Grid status**, so that **I know if the Grid is healthy, how many nodes are available, and how many slots are free before starting parallel work**.

## Context

Queries the Grid's `/status` API endpoint and returns structured health information.

**Existing implementation:** `selenium-mcp-server/src/grid/grid-client.ts`, `selenium-mcp-server/src/tools/grid/grid-status.ts`
**Builds on:** Grid must be running (US-002)

## Acceptance criteria

- [ ] AC 1 — Returns Grid ready state (true/false).
- [ ] AC 2 — Returns node count with per-node details (id, URI, status, browsers).
- [ ] AC 3 — Returns total, used, and available slot counts.
- [ ] AC 4 — Returns a clear error message if Grid is not reachable.
