---
id: US-002
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-002 — Hover Element

As an **AI agent**, I want to **hover over an element by its ref**, so that **I can trigger hover menus, tooltips, and other hover-dependent UI**.

## Context

Hover actions are needed for dropdown menus, tooltips, and any UI that reveals content on mouse-over.

**Existing implementation:** `selenium-mcp-server/src/tools/elements/hover-element.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Hovering over a valid element ref moves the mouse cursor to that element.
- [ ] AC 2 — Hover-triggered UI changes (menus, tooltips) are visible in subsequent snapshots.
- [ ] AC 3 — An invalid ref returns an error result.
