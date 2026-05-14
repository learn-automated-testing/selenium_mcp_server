---
id: US-004
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-004 — Generate Seed Data

As an **AI agent**, I want to **generate seed/fixture data files**, so that **tests have the test data they need to run reliably**.

## Context

Creates test data files (fixtures, seed data) that complement the generated test code.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/generator/generator-write-seed.ts`
**Builds on:** [US-003 — Generate test code](./US-003-generate-test-code.md)

## Acceptance criteria

- [ ] AC 1 — Seed data is generated based on the forms and inputs discovered during recording.
- [ ] AC 2 — Data format matches the framework's fixture conventions.
- [ ] AC 3 — File is saved to the specified path with sandbox validation.
