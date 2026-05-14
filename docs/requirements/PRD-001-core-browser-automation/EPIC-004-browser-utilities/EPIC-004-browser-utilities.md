# EPIC-004 — Browser Utilities

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-001 — Core MCP Browser Automation](../PRD-001-core-browser-automation.md)

## Problem statement

Beyond navigation and element interaction, AI agents need lower-level browser capabilities: executing JavaScript for custom logic, handling browser dialogs (alert/confirm/prompt), monitoring console logs and network requests for debugging, resizing the viewport for responsive testing, and generating PDFs. These utilities round out the automation toolkit.

Key files: `selenium-mcp-server/src/tools/browser/`.

## Goal

An AI agent can execute JavaScript, handle dialogs, monitor browser internals (console, network), resize the viewport, and generate PDFs — providing full browser control beyond element interaction.

## Scope (v1)

**In scope**
- Execute arbitrary JavaScript and return results
- Handle browser dialogs (accept, dismiss, type text)
- Retrieve console log messages with level filtering
- Monitor network requests (summary of XHR/fetch calls)
- Resize browser viewport
- Generate PDF from current page

**Out of scope**
- Network request interception/modification
- Cookie/localStorage management tools
- Browser DevTools protocol direct access

## Users

- **AI Agents** — execute JS for custom logic, handle unexpected dialogs, debug via console/network.
- **Developers** — use JS execution and network monitoring for debugging.

## User stories

### Must-have
- [US-001 — Execute JavaScript](./US-001-execute-javascript.md)
- [US-002 — Handle browser dialogs](./US-002-handle-dialog.md)
- [US-003 — Retrieve console logs](./US-003-console-logs.md)
- [US-004 — Monitor network requests](./US-004-network-monitor.md)
- [US-005 — Resize viewport](./US-005-resize-viewport.md)

### Should-have
- [US-006 — Generate PDF](./US-006-generate-pdf.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Core utilities | US-001, US-002, US-003, US-004, US-005 |
| MH-2 | PDF generation | US-006 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. `execute_javascript` returns serialized results — objects are JSON-stringified.
2. Console logs support level filtering (error, warn, info, log).
3. Network monitor returns a summary, not full request/response bodies.
4. PDF supports A4, Letter, and custom page sizes.

## Open questions

- None.

## Success metrics

- AI agent can execute JS and use results for decision-making
- Dialog handling prevents automation from getting stuck on alerts
- Console/network monitoring aids debugging of web application issues

---

**Relation with other epics:**
- [EPIC-001 — Navigation & Page Analysis](../EPIC-001-navigation-and-pages/EPIC-001-navigation-and-pages.md) — JS execution extends page analysis.
- [EPIC-003 — Verification & Waits](../EPIC-003-verification-and-waits/EPIC-003-verification-and-waits.md) — console/network data aids verification.
