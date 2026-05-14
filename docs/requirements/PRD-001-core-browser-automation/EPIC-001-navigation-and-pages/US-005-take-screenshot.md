---
id: US-005
epic: EPIC-001-navigation-and-pages
priority: must-have
status: done
testing: []
---

# US-005 — Take Screenshot

As an **AI agent**, I want to **take a screenshot of the current page, viewport, full page, or a specific element**, so that **I can visually inspect the page or save evidence of the current state**.

## Context

Screenshots provide a visual representation of the page. Default capture is **viewport only** (not full-page). Full-page capture requires `origin: 'document'` and uses BiDi WebSocket when available, with fallback to standard Selenium screenshot. Screenshots are saved to the configured output directory when in file-mode or when a `filename` is provided; otherwise they are returned inline as base64-encoded images.

**Existing implementation:** `selenium-mcp-server/src/tools/page/take-screenshot.ts`
**Builds on:** [US-001 — Navigate to URL](./US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Default screenshot captures the **viewport** (visible area) as a PNG image. Full-page capture requires `origin: 'document'`.
- [ ] AC 2 — Screenshot is saved to the output directory only when a `filename` is provided or the server is in file output mode. Otherwise the image is returned inline as base64.
- [ ] AC 3 — Tool result includes the base64-encoded image for inline viewing (in stdout mode without filename).
- [ ] AC 4 — BiDi WebSocket is used for full-page (`origin: 'document'`) and element (`ref`) screenshots when available.
- [ ] AC 5 — Fallback to standard Selenium viewport screenshot when BiDi is unavailable.
- [ ] AC 6 — Element screenshot via `ref` parameter captures a specific element's bounding box using BiDi.
- [ ] AC 7 — JPEG format is supported via `format: 'jpeg'` with an optional `quality` parameter (0-100).
- [ ] AC 8 — The `origin` parameter controls capture scope: `'viewport'` (default) for visible area, `'document'` for full page.
