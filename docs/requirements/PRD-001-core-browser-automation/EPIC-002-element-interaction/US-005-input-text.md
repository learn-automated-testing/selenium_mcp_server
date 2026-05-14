---
id: US-005
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-005 — Input Text

As an **AI agent**, I want to **type text into an input field**, so that **I can fill out forms, search boxes, and text areas**.

## Context

Types text into input/textarea elements. Can optionally clear existing text before typing.

**Existing implementation:** `selenium-mcp-server/src/tools/input/input-text.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Typing into a valid input ref enters the specified text.
- [ ] AC 2 — Optional `clear` parameter (default: `true`) clears existing text before typing.
- [ ] AC 3 — Typing into a non-input element does not produce a tool-level validation error — the Selenium `sendKeys` call will throw a WebDriver error if the element does not accept input.
- [ ] AC 4 — Action is recorded when recording is enabled.
