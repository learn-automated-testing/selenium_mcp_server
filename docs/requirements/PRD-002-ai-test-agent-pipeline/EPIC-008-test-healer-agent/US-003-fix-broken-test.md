---
id: US-003
epic: EPIC-008-test-healer-agent
priority: must-have
status: done
testing: []
---

# US-003 — Fix Broken Test

As an **AI agent**, I want to **apply a fix to a broken test file**, so that **the test can pass again without manual intervention**.

## Context

Writes the fix directly to the test file. The human reviews the diff before committing.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/healer/healer-fix-test.ts`
**Builds on:** [US-002 — Debug failing test](./US-002-debug-failing-test.md)

## Acceptance criteria

- [ ] AC 1 — Replaces the **entire test file** content with the provided `fixedCode`. This is a full file replacement, not a surgical line-level fix.
- [ ] AC 2 — Creates a `.bak` backup of the original file before overwriting.
- [ ] AC 3 — Optionally validates selectors in the fixed code against the live page when `verify: true` is passed (non-blocking — file is written regardless of validation result).
