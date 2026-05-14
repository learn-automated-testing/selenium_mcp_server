---
id: US-003
epic: EPIC-003-verification-and-waits
priority: must-have
status: done
testing: []
---

# US-003 — Verify Value

As an **AI agent**, I want to **verify the value of an input or element**, so that **I can confirm that form fields contain the expected data**.

## Context

Checks the value attribute of input elements or the text content of other elements against an expected value.

**Existing implementation:** `selenium-mcp-server/src/tools/verification/verify-value.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Verifying an input element's value against the expected value returns success or error.
- [ ] AC 2 — Only exact match (`===`) is supported — there is no contains mode. The tool first checks `element.getAttribute('value')` and falls back to `element.getText()` if value is empty.
- [ ] AC 3 — Works on any element that has a `value` attribute or text content.
