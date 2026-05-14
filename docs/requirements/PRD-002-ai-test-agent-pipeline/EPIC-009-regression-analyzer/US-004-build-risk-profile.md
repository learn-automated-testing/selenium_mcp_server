---
id: US-004
epic: EPIC-009-regression-analyzer
priority: must-have
status: done
testing: []
---

# US-004 — Build Risk Profile

As an **AI agent**, I want to **build a risk profile for the scanned product**, so that **testing effort can be prioritized based on feature risk levels**.

## Context

Combines imported context (PRDs, compliance) with discovered features to generate a per-feature risk assessment. Each feature gets a risk score based on factors like business criticality, complexity, change frequency, and compliance requirements.

**Existing implementation:** `selenium-mcp-server/src/tools/analyzer/analyzer-build-risk-profile.ts`
**Builds on:** [US-002 — Import analysis context](./US-002-import-context.md), [US-003 — Scan product](./US-003-scan-product.md)

## Acceptance criteria

- [ ] AC 1 — Generates a RiskProfile with per-feature risk scores and levels.
- [ ] AC 2 — Risk factors include business criticality, complexity, and compliance requirements.
- [ ] AC 3 — Produces coverage recommendations based on risk levels.
- [ ] AC 4 — Identifies coverage gaps where high-risk features lack tests.
