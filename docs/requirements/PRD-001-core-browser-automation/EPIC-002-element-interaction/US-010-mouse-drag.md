---
id: US-010
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-010 — Mouse Drag Between Elements

As an **AI agent**, I want to **drag from one element to another**, so that **I can interact with drag-and-drop UIs, sortable lists, and reorderable components**.

## Context

Element-ref-based drag operation using Selenium's `actions.dragAndDrop(source, target)`. Both source and target are identified by element refs from the page snapshot — this is **not** a coordinate-based drag.

**Existing implementation:** `selenium-mcp-server/src/tools/mouse/mouse-drag.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Dragging uses `fromRef` and `toRef` parameters (element references), not x/y coordinates. The Selenium Actions API `dragAndDrop(source, target)` is used.
- [ ] AC 2 — The drag holds the mouse button on the source element, moves to the target element, and releases.
