# EPIC-009 — Regression Analyzer

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-002 — AI Test Agent Pipeline](../PRD-002-ai-test-agent-pipeline.md)

## Problem statement

Teams lack systematic analysis connecting product requirements to test coverage. Without risk-based testing, effort is spread evenly rather than focused on high-risk areas. AI agents need tools to import product context (PRDs, user stories, compliance requirements), scan the application, build risk profiles per feature, and generate documentation that identifies coverage gaps and prioritizes testing effort.

Key files: `selenium-mcp-server/src/tools/analyzer/`, `selenium-mcp-server/src/context.ts` (AnalysisSession, RiskProfile), `agents/selenium-regression-analyzer.agent.md`.

## Goal

An AI agent can import product context, scan an application, build feature-level risk profiles, and generate coverage documentation — enabling risk-based test prioritization tied to business requirements.

## Scope (v1)

**In scope**
- Setup analysis session with product metadata and risk appetite
- Import context documents (PRDs, user stories, compliance docs)
- Scan product to discover features and pages
- Build risk profile with per-feature risk scores and factors
- Save risk profile to JSON/YAML
- Generate process documentation

**Out of scope**
- Automatic test generation from risk profiles (separate workflow)
- Compliance certification
- Historical trend analysis

## Users

- **AI Agents** — perform systematic risk analysis of web applications.
- **QA Engineers** — use risk profiles to prioritize test effort.
- **Product Owners** — review coverage gaps against requirements.

## User stories

### Must-have
- [US-001 — Setup analysis session](./US-001-setup-analysis-session.md)
- [US-002 — Import analysis context](./US-002-import-context.md)
- [US-003 — Scan product](./US-003-scan-product.md)
- [US-004 — Build risk profile](./US-004-build-risk-profile.md)
- [US-005 — Save risk profile](./US-005-save-risk-profile.md)

### Should-have
- [US-006 — Generate documentation](./US-006-generate-documentation.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Setup & import | US-001, US-002 |
| MH-2 | Scan & analyze | US-003, US-004 |
| MH-3 | Output | US-005, US-006 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. Analysis session state stored on Context class — survives across tool calls within a conversation.
2. Risk profile includes business context, feature-level risk scores, coverage recommendations, and gap analysis.
3. Output supports both JSON and YAML formats.

## Open questions

- None.

## Success metrics

- Risk profiles accurately identify high-risk features based on imported context
- Coverage gaps are actionable — linked to specific features and requirements
- Documentation is suitable for stakeholder review

---

**Relation with other epics:**
- [EPIC-006 — Test Planner Agent](../EPIC-006-test-planner-agent/EPIC-006-test-planner-agent.md) — risk profiles inform test planning priorities.
