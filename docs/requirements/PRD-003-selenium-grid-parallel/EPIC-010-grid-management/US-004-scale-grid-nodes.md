---
id: US-004
epic: EPIC-010-grid-management
priority: must-have
status: done
testing: []
---

# US-004 — Scale Grid Nodes

As an **AI agent**, I want to **scale Grid nodes up or down**, so that **I can adjust capacity based on how many parallel sessions I need**.

## Context

Adjusts the Docker Compose service replica count for Chrome/Firefox nodes.

**Existing implementation:** `selenium-mcp-server/src/tools/grid/grid-scale.ts`
**Builds on:** [US-002 — Start Grid cluster](./US-002-start-grid-cluster.md)

## Acceptance criteria

- [ ] AC 1 — Scales Chrome nodes to the specified count (default: 4, range: 0-20).
- [ ] AC 2 — Scales Firefox nodes to the specified count (default: 1, range: 0-20).
- [ ] AC 3 — Returns compose output (stdout/stderr) with a configuration summary, not a structured Grid status.
- [ ] AC 4 — Scaling does not disrupt existing active sessions (Docker Compose handles this).
