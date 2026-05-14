---
id: US-004
epic: EPIC-003-verification-and-waits
priority: must-have
status: done
testing: []
---

# US-004 — Verify List Visible

As an **AI agent**, I want to **verify that a list of elements is visible**, so that **I can confirm tables, lists, or repeated UI components are rendering correctly**.

## Context

Verifies multiple elements at once — useful for checking that a table has rows, a list has items, or a set of cards is displayed.

**Existing implementation:** `selenium-mcp-server/src/tools/verification/verify-list.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Accepts an `items: string[]` parameter containing text strings to verify (not element refs). Each item is searched using XPath `contains(text(), ...)`.
- [ ] AC 2 — All items must be visible for the verification to pass — there is no minimum count parameter. If any item is missing, the tool returns an error result.
- [ ] AC 3 — Returns a per-item checklist showing which items were found (✓) and which were missing (✗).
