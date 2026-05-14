---
id: US-007
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-007 — Start Action Recording

As an **AI agent**, I want to **start recording browser actions**, so that **my interactions are captured for test code generation**.

## Context

Enables recording on the Context. All subsequent tool calls (click, input, navigate, etc.) are logged with their parameters and element refs.

**Existing implementation:** `selenium-mcp-server/src/tools/recording/start-recording.ts`
**Builds on:** `selenium-mcp-server/src/context.ts` (recordingEnabled, actionHistory)

## Acceptance criteria

- [ ] AC 1 — Recording is enabled on the Context.
- [ ] AC 2 — Subsequent tool calls are logged in actionHistory.
- [ ] AC 3 — Starting recording when already recording is a no-op.
