---
id: US-002
epic: EPIC-016-preflight-driver-check
priority: must-have
status: done
testing: [unit]
---

# US-002 — Handle Pre-flight Failure

As a **developer / operator**, I want the **server to emit a structured error when the pre-flight check fails**, so that **I understand what went wrong and how to fix it before agents start calling tools**.

## Context

When Selenium Manager fails (network block, version mismatch, permissions), the server must not silently proceed. It should block or degrade tool registration and surface a structured error with the detected cause, original stderr, and a recommended fix.

**Existing implementation:** none — errors currently propagate as raw Selenium exceptions at first tool call.
**Builds on:** [US-001 — Run Selenium Manager pre-flight check](./US-001-run-selenium-manager-preflight.md).

## Acceptance criteria

- [ ] AC 1 — If the pre-flight check fails, registered MCP tools immediately return the pre-flight error instead of attempting browser operations.
- [ ] AC 2 — The error contains: detected cause category (e.g. `NETWORK_UNREACHABLE`), the original stderr output, and a recommended fix.
- [ ] AC 3 — The error is logged at `error` level.
- [ ] AC 4 — The server remains alive as a persistent MCP server and returns the error on each tool call (does not hard-exit).
- [ ] AC 5 — If running in CLI mode, the server exits with non-zero status.

## Testing

- **Unit (vitest)**: Mock `child_process.execSync` to throw with known stderr patterns; verify `preflightCheck()` returns the correct `PreflightResult` with `ok: false`, correct `category`, and `recommendation`.

## Notes / implementation hints

- The `PreflightResult` interface: `{ ok: boolean; category?: ErrorCategory; stderr?: string; recommendation?: string }`.
- Cause classification logic is shared with EPIC-017 (FR-3.1); consider placing it in a shared module (`src/driver-errors.ts`).
- Covers FR-1.4.

## Open questions

- Exact behavior for CLI vs persistent mode needs finalization — recommendation is to stay alive and return errors.
