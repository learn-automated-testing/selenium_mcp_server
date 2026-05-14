---
id: US-009
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-009 — Mouse Click on Element

As an **AI agent**, I want to **click on an element using a specific mouse button**, so that **I can perform left-click, right-click (context menu), or other mouse interactions on elements identified by ref**.

## Context

Ref-based mouse click using Selenium Actions API. Moves to the element first, then performs the click with the specified button. This is distinct from US-001 (Click Element) which uses `element.click()` — this tool uses the lower-level Actions API for button control.

**Existing implementation:** `selenium-mcp-server/src/tools/mouse/mouse-click.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Clicking on an element `ref` performs a mouse click via the Actions API (move to element, then click).
- [ ] AC 2 — Supports `left` (default), `right` (context click), and `middle` button options. Note: `middle` is executed as a regular left click (no separate middle-click behavior).
