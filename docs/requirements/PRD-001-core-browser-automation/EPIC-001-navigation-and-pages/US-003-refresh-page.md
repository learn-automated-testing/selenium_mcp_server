---
id: US-003
epic: EPIC-001-navigation-and-pages
priority: must-have
status: done
testing: []
---

# US-003 — Refresh Page

As an **AI agent**, I want to **refresh the current page**, so that **I can reload content that may have changed or recover from a partial page load**.

## Context

Simple page refresh. Useful when dynamic content needs reloading or when the page is in an unexpected state.

**Existing implementation:** `selenium-mcp-server/src/tools/navigation/refresh-page.ts`
**Builds on:** [US-001 — Navigate to URL](./US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Refreshing reloads the current page.
- [ ] AC 2 — An updated page snapshot is returned after refresh.
- [ ] AC 3 — Refreshing without a browser session returns an error result.
