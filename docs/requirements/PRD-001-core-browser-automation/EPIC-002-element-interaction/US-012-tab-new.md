---
id: US-012
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-012 — Create New Tab

As an **AI agent**, I want to **open a new browser tab**, so that **I can work on multiple pages simultaneously without losing my current page state**.

## Context

Opens a new empty tab or navigates to a specified URL in the new tab.

**Existing implementation:** `selenium-mcp-server/src/tools/tabs/tab-new.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Opening a new tab creates a new browser window/tab.
- [ ] AC 2 — Optionally accepts a URL to navigate to in the new tab.
- [ ] AC 3 — The new tab becomes the active tab.
