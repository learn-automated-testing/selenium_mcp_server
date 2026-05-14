---
id: US-001
epic: EPIC-009-regression-analyzer
priority: must-have
status: done
testing: []
---

# US-001 — Setup Analysis Session

As an **AI agent**, I want to **initialize a regression analysis session**, so that **I can begin systematic risk analysis of a web application**.

## Context

Creates an AnalysisSession on the Context with product metadata (name, URL, slug), risk appetite, and compliance requirements.

**Existing implementation:** `selenium-mcp-server/src/tools/analyzer/analyzer-setup.ts`
**Builds on:** `selenium-mcp-server/src/context.ts` (AnalysisSession)

## Acceptance criteria

- [ ] AC 1 — Creates an AnalysisSession on the Context with product name, URL, and slug.
- [ ] AC 2 — Accepts risk appetite level (low, medium, high).
- [ ] AC 3 — Accepts optional compliance requirements list.
- [ ] AC 4 — Session persists across subsequent analyzer tool calls.
