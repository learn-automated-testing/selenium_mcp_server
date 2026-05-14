---
id: US-009
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-009 — Check Recording Status

As an **AI agent**, I want to **check if recording is currently active**, so that **I know whether my actions are being captured**.

## Context

Returns the current recording state and the number of actions recorded so far.

**Existing implementation:** `selenium-mcp-server/src/tools/recording/recording-status.ts`
**Builds on:** [US-007 — Start action recording](./US-007-start-recording.md)

## Acceptance criteria

- [ ] AC 1 — Returns whether recording is active or inactive.
- [ ] AC 2 — Returns the count of recorded actions.
