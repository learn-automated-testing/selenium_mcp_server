---
id: US-002
epic: EPIC-001-navigation-and-pages
priority: must-have
status: done
testing: []
---

# US-002 — Browser History Navigation

As an **AI agent**, I want to **navigate back and forward in browser history**, so that **I can return to previously visited pages without re-entering URLs**.

## Context

Standard browser back/forward navigation. Essential for multi-page workflows where the agent needs to return to a previous page (e.g., after viewing a detail page, go back to the list).

**Existing implementation:** `selenium-mcp-server/src/tools/navigation/go-back.ts`, `selenium-mcp-server/src/tools/navigation/go-forward.ts`
**Builds on:** [US-001 — Navigate to URL](./US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — `go_back` navigates to the previous page in browser history.
- [ ] AC 2 — `go_forward` navigates to the next page in browser history.
- [ ] AC 3 — Both tools return an updated page snapshot after navigation.
- [ ] AC 4 — Calling `go_back` with no history does not produce an error — the browser stays on the current page (Selenium does not throw on empty history).
