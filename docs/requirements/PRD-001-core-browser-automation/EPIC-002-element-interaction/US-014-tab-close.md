---
id: US-014
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-014 — Close Tab

As an **AI agent**, I want to **close a specific browser tab**, so that **I can clean up tabs I no longer need**.

## Context

Closes a tab by 0-based `tabId` index. If the closed tab was active, switches to another open tab.

**Existing implementation:** `selenium-mcp-server/src/tools/tabs/tab-close.ts`
**Builds on:** [US-011 — List tabs](./US-011-tab-list.md)

## Acceptance criteria

- [ ] AC 1 — Closing a valid `tabId` (0-based index) removes that tab.
- [ ] AC 2 — If the closed tab was the active tab, the browser switches to another open tab.
- [ ] AC 3 — There is no special handling for closing the last tab — if no remaining handles exist, subsequent driver operations will fail.
