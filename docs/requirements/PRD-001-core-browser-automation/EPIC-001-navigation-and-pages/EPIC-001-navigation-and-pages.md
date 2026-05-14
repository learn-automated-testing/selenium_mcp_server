# EPIC-001 — Navigation & Page Analysis

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-001 — Core MCP Browser Automation](../PRD-001-core-browser-automation.md)

## Problem statement

AI agents need to navigate the web — open URLs, go back/forward, refresh pages — and understand what is on the current page. Without structured page snapshots, an LLM has no way to know which elements exist, what they are called, or how to reference them for interaction. The `navigate_to` tool is the primary entry point that creates a browser session and returns the first snapshot.

Key files: `selenium-mcp-server/src/tools/navigation/`, `selenium-mcp-server/src/tools/page/`, `selenium-mcp-server/src/utils/element-discovery.ts`, `selenium-mcp-server/src/context.ts`.

## Goal

An AI agent can navigate to any URL, traverse browser history, refresh pages, capture structured page snapshots with element refs, and take full-page screenshots — providing the foundation for all subsequent browser interaction.

## Scope (v1)

**In scope**
- Navigate to URL (with automatic browser creation)
- Browser history traversal (back, forward)
- Page refresh
- Structured page snapshot (element discovery with refs, text, attributes, bounding boxes)
- Full-page PNG screenshot via BiDi WebSocket

**Out of scope** (become their own epics / left for later)
- PDF generation (EPIC-004 Browser Utilities)
- JavaScript execution for custom page analysis (EPIC-004)

## Users

- **AI Agents** — navigate to URLs and capture page state to inform next actions.
- **QA Engineers** — use screenshots and snapshots for visual verification.

## User stories

### Must-have
- [US-001 — Navigate to URL](./US-001-navigate-to-url.md)
- [US-002 — Browser history navigation](./US-002-browser-history.md)
- [US-003 — Refresh page](./US-003-refresh-page.md)
- [US-004 — Capture page snapshot](./US-004-capture-page-snapshot.md)
- [US-005 — Take screenshot](./US-005-take-screenshot.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Core navigation | US-001, US-002, US-003 |
| MH-2 | Page analysis | US-004, US-005 |

## Testing scope

Tests: out of scope — no test framework configured yet. Testing to be added under separate initiative.

## Decisions (recorded 2026-05-13)

1. `navigate_to` auto-creates browser session on first call — no separate "start browser" tool needed.
2. Element refs are generated per-snapshot and used by all interaction tools (EPIC-002).
3. Screenshots use BiDi WebSocket for full-page capture when available, fallback to Selenium screenshot.

## Open questions

- None.

## Success metrics

- AI agent can navigate to any URL and receive a structured page snapshot
- Page snapshots include element refs usable by interaction tools
- Screenshots saved as PNG files to configured output directory

---

**Relation with other epics:**
- [EPIC-002 — Element & Input Interaction](../EPIC-002-element-interaction/EPIC-002-element-interaction.md) — depends on element refs from page snapshots.
- [EPIC-004 — Browser Utilities](../EPIC-004-browser-utilities/EPIC-004-browser-utilities.md) — extends page analysis with JS execution and PDF generation.
