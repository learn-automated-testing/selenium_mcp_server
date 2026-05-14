---
id: US-002
epic: EPIC-010-grid-management
priority: must-have
status: done
testing: []
---

# US-002 — Start Grid Cluster

As an **AI agent**, I want to **start the Selenium Grid cluster**, so that **I can create parallel browser sessions**.

## Context

Launches the Selenium Grid via Docker Compose using the compose files in `selenium-grid/`.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/grid-start.ts`
**Builds on:** `selenium-grid/` (Docker Compose files)

## Acceptance criteria

- [ ] AC 1 — Starts the Grid via `docker compose up -d` with optional `--scale` arguments for Chrome and Firefox nodes.
- [ ] AC 2 — Does **not** wait for the Grid to become ready — returns immediately after `docker compose up -d` exits.
- [ ] AC 3 — Returns the compose output (stdout/stderr, first 3000 chars each), not a Grid URL or structured status.
- [ ] AC 4 — Returns an error if Docker is not available or compose fails (non-zero exit code).
