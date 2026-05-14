# EPIC-003 — Verification & Waits

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-001 — Core MCP Browser Automation](../PRD-001-core-browser-automation.md)

## Problem statement

After interacting with a page, AI agents need to verify that the expected outcome occurred — an element appeared, text is visible, a value was set, or a list of items is present. They also need to wait for dynamic content (AJAX, animations, SPAs) before proceeding. Without verification and wait tools, agents cannot confirm success or handle asynchronous page behavior.

Key files: `selenium-mcp-server/src/tools/verification/`, `selenium-mcp-server/src/tools/browser/wait-for.ts`.

## Goal

An AI agent can verify page state (element visibility, text presence, input values, element lists) and wait for dynamic conditions before proceeding — enabling reliable automation of modern async web applications.

## Scope (v1)

**In scope**
- Verify element visibility by ref
- Verify text presence on page
- Verify input/element values
- Verify lists of elements
- Wait for conditions: element present, text visible, timeout, JavaScript expression

**Out of scope**
- Visual regression comparison
- Accessibility audits
- Performance assertions

## Users

- **AI Agents** — verify interaction outcomes and wait for async content.
- **QA Engineers** — define verification steps in automated test flows.

## User stories

### Must-have
- [US-001 — Verify element visible](./US-001-verify-element-visible.md)
- [US-002 — Verify text visible](./US-002-verify-text-visible.md)
- [US-003 — Verify value](./US-003-verify-value.md)
- [US-004 — Verify list visible](./US-004-verify-list-visible.md)
- [US-005 — Wait for condition](./US-005-wait-for-condition.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Verification tools | US-001, US-002, US-003, US-004 |
| MH-2 | Wait tool | US-005 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. Verification tools return pass/fail result (not throw) — consistent with Result type pattern.
2. Wait tool supports multiple condition types: element, text, timeout, and arbitrary JavaScript expressions.
3. Default wait timeout is configurable per invocation.

## Open questions

- None.

## Success metrics

- AI agent can verify outcomes after every interaction step
- Wait tool handles SPA navigation and AJAX-loaded content reliably

---

**Relation with other epics:**
- [EPIC-002 — Element & Input Interaction](../EPIC-002-element-interaction/EPIC-002-element-interaction.md) — verification follows interaction.
- [EPIC-001 — Navigation & Page Analysis](../EPIC-001-navigation-and-pages/EPIC-001-navigation-and-pages.md) — verification uses element refs from snapshots.
