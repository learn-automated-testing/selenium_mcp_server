---
id: US-002
epic: EPIC-003-verification-and-waits
priority: must-have
status: done
testing: []
---

# US-002 — Verify Text Visible

As an **AI agent**, I want to **verify that specific text is visible on the page**, so that **I can confirm success messages, error messages, or content presence**.

## Context

Searches the page for specified text content. Useful for confirming form submissions, error messages, or navigation results.

**Existing implementation:** `selenium-mcp-server/src/tools/verification/verify-text.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Verifying text that exists on the page returns a success result with the number of visible occurrences.
- [ ] AC 2 — Verifying text that does not exist returns an error result.
- [ ] AC 3 — Text matching uses XPath `contains(text(), ...)` — this is a **substring** match, not an exact match.
- [ ] AC 4 — Optional `timeout` parameter (default: 10000ms) controls how long to wait for the text to appear.
- [ ] AC 5 — Matching is case-sensitive (XPath `contains` is case-sensitive by default).
