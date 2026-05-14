---
id: US-001
epic: EPIC-003-verification-and-waits
priority: must-have
status: done
testing: []
---

# US-001 — Verify Element Visible

As an **AI agent**, I want to **verify that a specific element is visible on the page**, so that **I can confirm that expected UI elements are present after an interaction**.

## Context

Checks element visibility by ref. Returns pass/fail result — never throws.

**Existing implementation:** `selenium-mcp-server/src/tools/verification/verify-element.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Verifying a visible element ref returns a success result.
- [ ] AC 2 — Verifying a non-visible or non-existent ref returns an error result (via `this.error()`), not a structured pass/fail object.
- [ ] AC 3 — Result includes a message about the element's visibility state.
- [ ] AC 4 — Optional `timeout` parameter (default: 10000ms) controls how long to wait for the element to become visible before returning an error.
