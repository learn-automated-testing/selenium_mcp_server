---
id: US-006
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-006 — Read Existing Test Spec

As an **AI agent**, I want to **read an existing test specification**, so that **I can modify or extend previously generated tests**.

## Context

Reads a test spec file from disk for review or modification.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/generator/generator-read-spec.ts`
**Builds on:** [US-005 — Save test specification](./US-005-save-test-spec.md)

## Acceptance criteria

- [ ] AC 1 — Reads the test specification file from the specified path.
- [ ] AC 2 — Returns the file content for review.
- [ ] AC 3 — Returns an error if the file does not exist.
