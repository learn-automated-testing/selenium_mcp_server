---
id: US-003
epic: EPIC-010-grid-management
priority: must-have
status: done
testing: []
---

# US-003 — Stop Grid Cluster

As an **AI agent**, I want to **stop the Selenium Grid cluster**, so that **resources are freed when parallel automation is complete**.

## Context

Shuts down the Grid via Docker Compose.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/grid-stop.ts`
**Builds on:** [US-002 — Start Grid cluster](./US-002-start-grid-cluster.md)

## Acceptance criteria

- [ ] AC 1 — Stops all Grid containers via `docker compose down`.
- [ ] AC 2 — Returns the compose output (stdout/stderr) as confirmation.
- [ ] AC 3 — There is no explicit session cleanup — containers are stopped directly, which terminates any active sessions.
