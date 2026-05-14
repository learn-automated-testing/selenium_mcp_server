---
id: US-005
epic: EPIC-009-regression-analyzer
priority: must-have
status: done
testing: []
---

# US-005 — Save Risk Profile

As an **AI agent**, I want to **save the risk profile to a file**, so that **it can be reviewed, shared, and used for test planning**.

## Context

Saves the generated RiskProfile to JSON or YAML format.

**Existing implementation:** `selenium-mcp-server/src/tools/analyzer/analyzer-save-profile.ts`
**Builds on:** [US-004 — Build risk profile](./US-004-build-risk-profile.md)

## Acceptance criteria

- [ ] AC 1 — Risk profile saved as JSON or YAML file.
- [ ] AC 2 — File path validated through sandbox utility.
- [ ] AC 3 — Output includes the base64 resource in the tool result.
