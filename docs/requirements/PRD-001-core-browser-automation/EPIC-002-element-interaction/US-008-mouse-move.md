---
id: US-008
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-008 — Mouse Move

As an **AI agent**, I want to **move the mouse to specific coordinates**, so that **I can interact with canvas elements, custom widgets, and coordinate-based UI**.

## Context

Coordinate-based mouse movement for when ref-based addressing is insufficient (canvas, SVG, custom widgets).

**Existing implementation:** `selenium-mcp-server/src/tools/mouse/mouse-move.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Mouse moves to the specified x, y coordinates.
- [ ] AC 2 — The tool does not validate viewport bounds — coordinates outside the viewport are passed to the Selenium Actions API, which handles out-of-bounds behavior per browser implementation.
