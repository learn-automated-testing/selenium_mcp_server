---
id: US-004
epic: EPIC-008-test-healer-agent
priority: must-have
status: done
testing: []
---

# US-004 — Inspect Page for Locator Validation

As an **AI agent**, I want to **validate existing locators against the current page**, so that **I can identify which selectors are stale and get suggestions for replacements**.

## Context

Validates a list of provided locators against the live page. This tool does **not** search for new elements — it checks whether existing locators still match and suggests alternatives for missing ones.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/healer/healer-inspect-page.ts`
**Builds on:** [US-004 — Capture page snapshot](../../PRD-001-core-browser-automation/EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Accepts a `locators` array where each item has `name`, `strategy` (id, css, xpath, text), and `value`. Validates each locator against the current page.
- [ ] AC 2 — Reports each locator as "found" (with match count) or "missing" (with suggested alternative if available).
- [ ] AC 3 — Suggestions for missing locators are derived from the page snapshot — they are opportunistic and not guaranteed.
