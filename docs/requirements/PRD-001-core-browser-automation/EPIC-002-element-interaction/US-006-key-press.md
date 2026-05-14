---
id: US-006
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-006 — Press Keyboard Keys

As an **AI agent**, I want to **press keyboard keys**, so that **I can trigger keyboard shortcuts, submit forms with Enter, or navigate with Tab**.

## Context

Sends key presses (Enter, Tab, Escape, Ctrl+A, etc.) to the browser or a specific element.

**Existing implementation:** `selenium-mcp-server/src/tools/input/key-press.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Pressing a named key (Enter, Tab, Escape) sends that key event.
- [ ] AC 2 — Modifier combinations (Ctrl+A, Shift+Tab) are supported.
- [ ] AC 3 — Keys can be sent to a specific element ref or to the active element.
