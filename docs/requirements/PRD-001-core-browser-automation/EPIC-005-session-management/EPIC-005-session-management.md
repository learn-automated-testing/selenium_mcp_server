# EPIC-005 — Session Management

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-001 — Core MCP Browser Automation](../PRD-001-core-browser-automation.md)

## Problem statement

AI agents need lifecycle control over the browser session: closing the browser when done, resetting to a clean state between test scenarios, and enabling stealth mode to bypass anti-bot detection on protected sites. Without session management, agents cannot clean up resources or handle sites with bot detection.

Key files: `selenium-mcp-server/src/tools/session/`, `selenium-mcp-server/src/context.ts`.

## Goal

An AI agent can close the browser, reset to a clean session, and enable stealth mode — providing full lifecycle control and anti-detection capabilities.

## Scope (v1)

**In scope**
- Close browser and clean up all resources (driver, Grid sessions, tracer)
- Reset browser session (restart with clean state)
- Enable stealth mode (anti-detection scripts)

**Out of scope**
- Browser profile management
- Proxy configuration tools
- Cookie/cache manipulation tools

## Users

- **AI Agents** — manage browser lifecycle, clean up between tasks.
- **QA Engineers** — reset sessions between test scenarios.

## User stories

### Must-have
- [US-001 — Close browser](./US-001-close-browser.md)
- [US-002 — Reset session](./US-002-reset-session.md)

### Should-have
- [US-003 — Enable stealth mode](./US-003-stealth-mode.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Lifecycle | US-001, US-002 |
| MH-2 | Anti-detection | US-003 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. `close_browser` cleans up all resources: driver, Grid sessions, event collector, tracer.
2. `reset_session` creates a fresh browser — equivalent to close + navigate.
3. Stealth mode injects scripts to mask WebDriver fingerprints (navigator.webdriver, etc.).

## Open questions

- None.

## Success metrics

- Browser resources fully cleaned up on close (no orphan processes)
- Session reset provides clean state for next automation sequence
- Stealth mode bypasses common bot detection (Cloudflare, DataDome)

---

**Relation with other epics:**
- [EPIC-001 — Navigation & Page Analysis](../EPIC-001-navigation-and-pages/EPIC-001-navigation-and-pages.md) — session lifecycle bookends navigation.
