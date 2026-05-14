---
id: US-011
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-011 — List Tabs

As an **AI agent**, I want to **list all open browser tabs**, so that **I can see which tabs are open and select the one I need**.

## Context

Returns a list of all open tabs/windows with their handles and titles.

**Existing implementation:** `selenium-mcp-server/src/tools/tabs/tab-list.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Returns a list of all open tabs with handle identifiers.
- [ ] AC 2 — Each tab entry includes the window handle and current URL/title when available.
- [ ] AC 3 — The currently active tab is indicated.
