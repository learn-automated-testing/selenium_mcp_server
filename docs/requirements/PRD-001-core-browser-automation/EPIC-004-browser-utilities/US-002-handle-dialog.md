---
id: US-002
epic: EPIC-004-browser-utilities
priority: must-have
status: done
testing: []
---

# US-002 — Handle Browser Dialogs

As an **AI agent**, I want to **handle browser dialogs (alert, confirm, prompt)**, so that **dialogs don't block my automation flow**.

## Context

Handles JavaScript alert(), confirm(), and prompt() dialogs by accepting, dismissing, or typing text.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/dialog-handle.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — `accept` action accepts the dialog. If optional `text` parameter is provided, it is entered into a prompt dialog before accepting.
- [ ] AC 2 — `dismiss` action dismisses the dialog (clicks Cancel on confirm/prompt).
- [ ] AC 3 — `get_text` action returns the dialog text content without dismissing. There is no separate "type" action — text entry is a parameter on the `accept` action.
- [ ] AC 4 — Returns an error result when no dialog is present (Selenium throws `NoSuchAlertError`).
