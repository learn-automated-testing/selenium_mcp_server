---
id: US-004
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-004 — Drag and Drop

As an **AI agent**, I want to **drag an element and drop it on a target**, so that **I can interact with drag-and-drop interfaces (sortable lists, kanban boards, file uploads)**.

## Context

Drag and drop using Selenium Actions API. Takes source and target element refs.

**Existing implementation:** `selenium-mcp-server/src/tools/elements/drag-drop.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Dragging a source element ref to a target element ref performs the drag-drop action.
- [ ] AC 2 — Invalid source or target ref returns an error result.
- [ ] AC 3 — Tool captures a snapshot after drop to confirm the result.
