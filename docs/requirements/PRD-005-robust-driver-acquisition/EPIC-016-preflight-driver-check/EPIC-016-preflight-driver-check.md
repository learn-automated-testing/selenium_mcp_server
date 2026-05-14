# EPIC-016 — Pre-flight Driver Check

> **Status:** done (2026-05-14)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-005 — Robust Driver Acquisition](../PRD-005-robust-driver-acquisition.md)

## Problem statement

The MCP server currently discovers driver-acquisition failures only when an AI agent invokes the first browser tool. At that point the opaque Selenium error propagates up, and the agent has no way to recover. Detecting the problem at server start-up would let the operator fix it before any agent connects.

Key files: `selenium-mcp-server/src/context.ts` (driver build), `selenium-mcp-server/src/server.ts` (server bootstrap).

## Goal

The MCP server validates that Selenium Manager can resolve a Chrome driver before registering tools. If the check fails, the operator receives a structured error with the detected cause and recommended fix. Advanced users can skip or tune the check via environment variables.

## Scope (v1)

**In scope**
- Invoke Selenium Manager binary at start-up with `--browser chrome --output json`
- Resolve binary path dynamically per platform (macOS / Linux / Windows)
- Block or degrade tool registration on failure with structured error
- Auto-recover by clearing `~/.cache/selenium/` and retrying once
- Skip pre-flight via `SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1`
- Configurable timeout via `SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS`

**Out of scope**
- Runtime error wrapping (covered by EPIC-017)
- Diagnostic command generation (covered by EPIC-017)
- Non-Chrome browsers

## Users

- **Developers / Operators** — see start-up errors and act on them before agents connect.
- **CI/CD pipelines** — skip pre-flight when drivers are pre-cached.

## User stories

### Must-have
- [US-001 — Run Selenium Manager pre-flight check](./US-001-run-selenium-manager-preflight.md)
- [US-002 — Handle pre-flight failure](./US-002-handle-preflight-failure.md)

### Should-have
- [US-003 — Auto-recover by clearing cache and retrying](./US-003-auto-recover-cache-clear.md)
- [US-004 — Skip pre-flight via env var](./US-004-skip-preflight-env-var.md)

### Could-have / later
- [US-005 — Configure pre-flight timeout](./US-005-configure-preflight-timeout.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Core pre-flight | US-001, US-002 |
| MH-2 | Resilience & config | US-003, US-004, US-005 |

## Testing scope

Unit tests with mocked `child_process.execSync` covering success, failure per cause category, timeout, and skip scenarios. Target > 80 % coverage of `src/preflight.ts`.

## Decisions (recorded 2026-05-14)

1. Pre-flight invokes the bundled Selenium Manager binary rather than spawning a full browser — faster and avoids side-effects.
2. 30-second default timeout balances first-run downloads with fast failure on blocked networks.
3. Stay alive and return errors per-call rather than hard-exit — MCP clients may reconnect.

## Open questions

1. Should the server hard-exit or stay alive returning errors per-call when pre-flight fails? Recommendation: stay alive, return errors, log loudly.

## Success metrics

- Happy-path start-up adds < 2 s (NFR-1)
- Blocked network detected as `NETWORK_UNREACHABLE` at start-up
- `SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1` bypasses check entirely

---

**Relation with other epics:**
- [EPIC-017 — Driver Error Diagnostics](../EPIC-017-driver-error-diagnostics/EPIC-017-driver-error-diagnostics.md) — shares cause-category classification; EPIC-017 applies it at runtime.
