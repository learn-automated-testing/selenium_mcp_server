# EPIC-002 — Element & Input Interaction

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-001 — Core MCP Browser Automation](../PRD-001-core-browser-automation.md)

## Problem statement

Once an AI agent has a page snapshot with element refs (EPIC-001), it needs to interact with those elements — clicking buttons, hovering over menus, selecting dropdown options, dragging elements, typing into fields, pressing keyboard shortcuts, uploading files, and performing precise mouse operations. It also needs to manage multiple browser tabs. These are the core interaction primitives that make browser automation useful.

Key files: `selenium-mcp-server/src/tools/elements/`, `selenium-mcp-server/src/tools/input/`, `selenium-mcp-server/src/tools/mouse/`, `selenium-mcp-server/src/tools/tabs/`.

## Goal

An AI agent can interact with any element on a page — clicking, typing, selecting, dragging, and managing tabs — using ref-based addressing from page snapshots or coordinate-based mouse control.

## Scope (v1)

**In scope**
- Click, hover, select, drag & drop elements by ref
- Text input, keyboard key presses, file upload
- Mouse move/click/drag by coordinates
- Tab list, create, select, close

**Out of scope**
- Touch / gesture events (mobile)
- Accessibility tree navigation
- iframe-specific interaction tools

## Users

- **AI Agents** — interact with page elements to complete workflows (fill forms, click buttons, navigate menus).
- **QA Engineers** — automate user interaction sequences for testing.

## User stories

### Must-have
- [US-001 — Click element](./US-001-click-element.md)
- [US-002 — Hover element](./US-002-hover-element.md)
- [US-003 — Select dropdown option](./US-003-select-option.md)
- [US-004 — Drag and drop](./US-004-drag-drop.md)
- [US-005 — Input text](./US-005-input-text.md)
- [US-006 — Press keyboard keys](./US-006-key-press.md)
- [US-007 — Upload file](./US-007-file-upload.md)
- [US-008 — Mouse move](./US-008-mouse-move.md)
- [US-009 — Mouse click at coordinates](./US-009-mouse-click.md)
- [US-010 — Mouse drag](./US-010-mouse-drag.md)
- [US-011 — List tabs](./US-011-tab-list.md)
- [US-012 — Create new tab](./US-012-tab-new.md)
- [US-013 — Switch to tab](./US-013-tab-select.md)
- [US-014 — Close tab](./US-014-tab-close.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Element interaction | US-001, US-002, US-003, US-004 |
| MH-2 | Text & keyboard input | US-005, US-006, US-007 |
| MH-3 | Mouse control | US-008, US-009, US-010 |
| MH-4 | Tab management | US-011, US-012, US-013, US-014 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. All element interactions use ref-based addressing from page snapshots (EPIC-001).
2. Mouse tools use pixel coordinates for cases where ref-based addressing is insufficient (canvas, custom widgets).
3. Tab tools operate on WebDriver window handles.

## Open questions

- None.

## Success metrics

- AI agent can complete multi-step form submissions (navigate → fill → submit → verify)
- All 14 interaction tools functional and returning appropriate results

---

**Relation with other epics:**
- [EPIC-001 — Navigation & Page Analysis](../EPIC-001-navigation-and-pages/EPIC-001-navigation-and-pages.md) — provides element refs consumed by this epic.
- [EPIC-003 — Verification & Waits](../EPIC-003-verification-and-waits/EPIC-003-verification-and-waits.md) — verifies outcomes of interactions.
