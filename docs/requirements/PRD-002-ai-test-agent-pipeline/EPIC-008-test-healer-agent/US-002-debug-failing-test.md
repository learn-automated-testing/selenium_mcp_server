---
id: US-002
epic: EPIC-008-test-healer-agent
priority: must-have
status: done
testing: []
---

# US-002 — Debug Failing Test

As an **AI agent**, I want to **debug a failing test to identify the root cause**, so that **I can determine whether the failure is a stale selector, changed assertion, or application bug**.

## Context

Runs the test suite with a higher output limit (15KB stdout, 8KB stderr) to capture more verbose output for debugging. The tool itself does **not** analyze or categorize failures — that is done by the AI agent consuming the output.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/healer/healer-debug-test.ts`
**Builds on:** [US-001 — Run test suite](./US-001-run-test-suite.md)

## Acceptance criteria

- [ ] AC 1 — Runs the specified test with higher output capture limits (15KB stdout, 8KB stderr) compared to the regular test runner.
- [ ] AC 2 — Supports manifest mode (discovers `.test-manifest.json` for run command) and explicit mode (LLM provides command + args directly).
- [ ] AC 3 — Returns raw test output (stdout, stderr, exit code, pass/fail) — failure analysis and fix suggestions are performed by the AI agent, not by this tool.
