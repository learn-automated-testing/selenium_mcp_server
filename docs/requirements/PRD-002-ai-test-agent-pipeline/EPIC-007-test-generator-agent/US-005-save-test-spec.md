---
id: US-005
epic: EPIC-007-test-generator-agent
priority: must-have
status: done
testing: []
---

# US-005 — Save Test Specification

As an **AI agent**, I want to **save the test specification to a file**, so that **the generated test is persisted and can be run or modified later**.

## Context

Saves the generated test code or specification to the filesystem. Human review gate — agent asks for file location approval.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/generator/generator-save-spec.ts`
**Builds on:** [US-003 — Generate test code](./US-003-generate-test-code.md)

## Acceptance criteria

- [ ] AC 1 — Test specification is saved as a markdown file. The title is converted to a kebab-case slug for the filename.
- [ ] AC 2 — File path is validated through sandbox utility (`validateOutputPath`).
- [ ] AC 3 — There is no overwrite protection — if a file with the same slug exists, it is directly replaced.
