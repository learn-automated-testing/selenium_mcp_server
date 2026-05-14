---
id: US-003
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-003 — Select Dropdown Option

As an **AI agent**, I want to **select an option in a dropdown/select element**, so that **I can fill out forms with dropdown fields**.

## Context

Handles HTML `<select>` elements. Supports selection by visible text, value attribute, or index.

**Existing implementation:** `selenium-mcp-server/src/tools/elements/select-option.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Selection by visible text selects the matching option.
- [ ] AC 2 — Selection by value attribute selects the matching option.
- [ ] AC 3 — Selection by index selects the option at that position.
- [ ] AC 4 — Selecting on a non-select element returns an error result.
