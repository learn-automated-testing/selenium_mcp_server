---
id: US-006
epic: EPIC-009-regression-analyzer
priority: should-have
status: done
testing: []
---

# US-006 — Generate Documentation

As an **AI agent**, I want to **generate process documentation from the analysis**, so that **stakeholders have a comprehensive report of the risk assessment and coverage recommendations**.

## Context

Generates human-readable documentation from the analysis session — suitable for review by QA leads, product owners, and compliance officers.

**Existing implementation:** `selenium-mcp-server/src/tools/analyzer/analyzer-generate-documentation.ts`
**Builds on:** [US-004 — Build risk profile](./US-004-build-risk-profile.md)

## Acceptance criteria

- [ ] AC 1 — Documentation includes product overview, feature inventory, and risk assessment.
- [ ] AC 2 — Coverage gaps and recommendations are clearly highlighted.
- [ ] AC 3 — Output is saved to the specified file path.
