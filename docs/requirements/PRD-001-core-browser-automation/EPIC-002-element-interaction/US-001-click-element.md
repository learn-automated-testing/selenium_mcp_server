---
id: US-001
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-001 — Click Element

As an **AI agent**, I want to **click an element by its ref**, so that **I can interact with buttons, links, and other clickable elements on the page**.

## Context

The most fundamental interaction tool. Uses element refs from page snapshots (EPIC-001 US-004) to locate and click elements. Supports optional snapshot capture after click to see the result.

**Existing implementation:** `selenium-mcp-server/src/tools/elements/click-element.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Clicking a valid element ref performs a click action on that element.
- [ ] AC 2 — An invalid ref returns an error result.
- [ ] AC 3 — Tool optionally captures a new page snapshot after click.
- [ ] AC 4 — Click action is recorded when recording is enabled (for test generation).
