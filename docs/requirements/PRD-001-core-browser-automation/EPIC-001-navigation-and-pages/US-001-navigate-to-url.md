---
id: US-001
epic: EPIC-001-navigation-and-pages
priority: must-have
status: done
testing: []
---

# US-001 — Navigate to URL

As an **AI agent**, I want to **navigate to a URL**, so that **I can access any web page and receive a structured snapshot of its contents for further interaction**.

## Context

This is the primary entry point for all browser automation. The `navigate_to` tool creates a browser session on first invocation (lazy initialization), navigates to the specified URL, and returns a page snapshot with element refs. All subsequent interaction tools depend on this tool establishing the browser and initial page state.

**Existing implementation:** `selenium-mcp-server/src/tools/navigation/navigate-to.ts`
**Builds on:** `selenium-mcp-server/src/context.ts` (Context.ensureBrowser)

## Acceptance criteria

- [ ] AC 1 — Navigating to a valid URL opens the page in a browser. The page snapshot is appended by the server pipeline (not by the tool itself) when the tool signals `captureSnapshot: true`.
- [ ] AC 2 — If no browser session exists, one is created automatically (lazy initialization via `Context.ensureBrowser()`).
- [ ] AC 3 — The returned snapshot includes element refs, tag names, text content, and attributes (handled by the server's element-discovery pipeline).
- [ ] AC 4 — Errors (invalid URLs, driver failures) propagate as server-level error results; the tool itself does not catch navigation errors.
- [ ] AC 5 — The server-wide `expectation` parameter (passed on any tool call) controls whether the response includes a snapshot, console logs, and/or network summary. This is not tool-specific — it is resolved by `BaseTool.resolveExpectation()` with per-category defaults.

## Notes / implementation hints

- Uses `Context.ensureBrowser()` for lazy browser creation with Chrome options from `src/utils/chrome-options.ts`.
- Element discovery handled by `src/utils/element-discovery.ts`.
- This tool has `annotations: { readOnlyHint: false }` — it modifies browser state.
