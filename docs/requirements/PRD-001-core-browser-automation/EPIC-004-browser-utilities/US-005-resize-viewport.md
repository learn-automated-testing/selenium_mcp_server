---
id: US-005
epic: EPIC-004-browser-utilities
priority: must-have
status: done
testing: []
---

# US-005 — Resize Viewport

As an **AI agent**, I want to **resize the browser viewport**, so that **I can test responsive layouts at different screen sizes**.

## Context

Sets the browser window size to specified width and height.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/resize-window.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Resizing sets the browser window to the specified `width` and `height` in pixels via `driver.manage().window().setRect()`.
- [ ] AC 2 — There are no preset sizes — only explicit `width` and `height` parameters are accepted.
- [ ] AC 3 — No snapshot is returned after resize. The tool's category is `browser` which has `includeSnapshot: false` by default.
