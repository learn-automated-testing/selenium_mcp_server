---
id: US-003
epic: EPIC-009-regression-analyzer
priority: must-have
status: done
testing: []
---

# US-003 — Scan Product

As an **AI agent**, I want to **scan a web application to discover features and pages**, so that **I have a comprehensive inventory for risk analysis**.

## Context

Explores the product at its configured URL, discovering features, pages, forms, and workflows. Results are stored on the AnalysisSession.

**Existing implementation:** `selenium-mcp-server/src/tools/analyzer/analyzer-scan-product.ts`
**Builds on:** [US-001 — Setup analysis session](./US-001-setup-analysis-session.md)

## Acceptance criteria

- [ ] AC 1 — Discovers pages by following navigation links.
- [ ] AC 2 — Identifies features and functional areas.
- [ ] AC 3 — Results stored as discoveredFeatures and discoveredPages on AnalysisSession.
- [ ] AC 4 — Screenshots captured for key pages.
