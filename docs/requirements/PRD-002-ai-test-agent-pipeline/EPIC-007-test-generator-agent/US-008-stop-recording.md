---
id: US-008
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-008 — Stop Action Recording

As an **AI agent**, I want to **stop recording browser actions**, so that **I can finalize the recorded sequence for test generation**.

## Context

Disables recording on the Context. The recorded action history is preserved for reading via `generator_read_log`.

**Existing implementation:** `selenium-mcp-server/src/tools/recording/stop-recording.ts`
**Builds on:** [US-007 — Start action recording](./US-007-start-recording.md)

## Acceptance criteria

- [ ] AC 1 — Recording is disabled on the Context.
- [ ] AC 2 — Recorded action history is preserved (not cleared).
- [ ] AC 3 — Stopping when not recording is a no-op.
