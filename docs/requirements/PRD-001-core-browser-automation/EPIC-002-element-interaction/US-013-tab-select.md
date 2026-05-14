---
id: US-013
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-013 — Switch to Tab

As an **AI agent**, I want to **switch to a specific browser tab by index**, so that **I can navigate between multiple open tabs**.

## Context

Switches the active browser context to the specified tab using a 0-based `tabId` index (not a window handle string).

**Existing implementation:** `selenium-mcp-server/src/tools/tabs/tab-select.ts`
**Builds on:** [US-011 — List tabs](./US-011-tab-list.md)

## Acceptance criteria

- [ ] AC 1 — Switching to a valid `tabId` (0-based index) makes that tab active.
- [ ] AC 2 — A page snapshot of the newly active tab is returned.
- [ ] AC 3 — An out-of-range `tabId` returns an error result listing the valid range.
