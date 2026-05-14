---
id: US-001
epic: EPIC-016-preflight-driver-check
priority: must-have
status: done
testing: [unit]
---

# US-001 — Run Selenium Manager Pre-flight Check

As a **developer / operator**, I want the **MCP server to invoke Selenium Manager at start-up**, so that **driver-acquisition problems are detected before any AI agent connects**.

## Context

The server currently builds the WebDriver on the first tool call, which means failures surface late and produce opaque errors. A pre-flight check invokes the bundled Selenium Manager binary directly to verify it can resolve a Chrome driver.

**Existing implementation:** `selenium-mcp-server/src/context.ts` (driver build in Context class).
**Builds on:** server bootstrap in `selenium-mcp-server/src/server.ts`.

## Acceptance criteria

- [ ] AC 1 — On server start-up, before MCP tool registration, the server invokes the bundled Selenium Manager binary with `--browser chrome --output json`.
- [ ] AC 2 — The Selenium Manager binary path is resolved dynamically based on `process.platform`: `bin/macos/selenium-manager` (darwin), `bin/linux/selenium-manager` (linux), `bin/windows/selenium-manager.exe` (win32).
- [ ] AC 3 — The pre-flight check runs only once per server start-up.
- [ ] AC 4 — If the check succeeds, the server proceeds with normal tool registration. No extra user-visible output is emitted.
- [ ] AC 5 — The check completes within the configured timeout (default 30 s).

## Testing

- **Unit (vitest)**: Mock `child_process.execSync` to return valid JSON output; verify `preflightCheck()` resolves successfully. Mock platform values to verify correct binary path resolution.

## Notes / implementation hints

- New file: `src/preflight.ts` exporting `preflightCheck(): Promise<PreflightResult>`.
- Selenium Manager is bundled inside `node_modules/selenium-webdriver/bin/<platform>/`.
- Use `child_process.execSync` with `{ timeout, encoding: 'utf-8' }`.
- Covers FR-1.1, FR-1.2, FR-1.3, FR-1.5.

## Open questions

- None.
