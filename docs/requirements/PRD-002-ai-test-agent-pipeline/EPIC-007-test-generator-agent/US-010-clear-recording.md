---
id: US-010
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-010 — Clear Recorded Actions

As an **AI agent**, I want to **clear all recorded actions**, so that **I can start a fresh recording without residual actions from a previous session**.

## Context

Clears the action history on the Context. Recording state (enabled/disabled) is not affected.

**Existing implementation:** `selenium-mcp-server/src/tools/recording/clear-recording.ts`
**Builds on:** [US-007 — Start action recording](./US-007-start-recording.md)

## Acceptance criteria

- [ ] AC 1 — All recorded actions are cleared from actionHistory.
- [ ] AC 2 — Recording enabled/disabled state is not changed.
- [ ] AC 3 — Clearing an empty history is a no-op.
