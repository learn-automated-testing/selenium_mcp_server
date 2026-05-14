---
id: US-005
epic: EPIC-003-verification-and-waits
priority: must-have
status: done
testing: []
---

# US-005 — Wait for Condition

As an **AI agent**, I want to **wait for a dynamic condition to be met**, so that **I can handle AJAX-loaded content, animations, and SPA transitions before proceeding**.

## Context

Waits for one of five condition types using CSS selectors or text values. Uses Selenium's built-in `until` conditions. There is no text-wait, no timeout/sleep, and no JavaScript expression condition.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/wait-for.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Supports three element conditions using CSS selectors: `element_present` (element exists in DOM), `element_visible` (element exists and is displayed), and `element_clickable` (element exists and is enabled).
- [ ] AC 2 — Supports two text-based conditions: `url_contains` (waits for URL to include the value) and `title_contains` (waits for page title to include the value). There is **no** text-on-page wait condition.
- [ ] AC 3 — Configurable `timeout` parameter (default: 10000ms) per invocation — returns an error result on timeout exceeded.
