# PRD-005 — Robust Driver Acquisition

> **Status:** draft (2026-05-14)
> **Owner:** dev-team
> **Reviewers:** —
> **Source material:** `selenium-mcp-server/src/context.ts`, `selenium-mcp-server/src/tools/base.ts`

## Problem statement

Browser sessions fail at start-up when Selenium Manager cannot acquire the matching `chromedriver`. The user-facing error is misleading (`"Unable to obtain browser driver"`) and provides no actionable guidance — blocking the entire MCP server from functioning. Root causes range from network blocks on `googlechromelabs.github.io`, Chrome/chromedriver version mismatches, to cache-directory permission issues. Users have no way to diagnose the failure without manually running Selenium Manager with `--debug`.

## Goal

An AI agent operator sees a clear, actionable error message when driver acquisition fails — with the root cause correctly identified, a diagnostic command included, and failures detected at server start-up rather than at first tool invocation.

## Users

- **AI Agents (LLMs)** — need browser sessions to succeed or receive clear error responses explaining why they cannot.
- **Developers / Operators** — need to diagnose and resolve driver-acquisition failures quickly using the guidance in error messages.

## Capabilities (high level)

- Pre-flight driver check — validate chromedriver availability at server start-up before registering MCP tools
- Runtime error classification — wrap driver-build errors with cause-category detection (network, version mismatch, permissions, download failure)
- Actionable error messages — replace opaque Selenium errors with structured messages containing cause, likely fixes, and diagnostic commands
- Diagnostic command generation — include platform-specific copy-pasteable Selenium Manager debug commands
- Configurability — allow skipping pre-flight and tuning timeout via environment variables

## Non-functional requirements

- **Performance:** Pre-flight check adds no more than 2 seconds to server start-up on the happy path (cached driver)
- **Terminal output:** Error messages fit in a standard 80-character terminal width without horizontal scrolling
- **Code standards:** All new code in TypeScript following existing project lint/format conventions
- **Dependencies:** No new runtime dependencies; use Node.js built-ins (`child_process`, `fs`, `path`)
- **Logging:** Errors logged at `error` level for failures, `debug` level for happy path

## Out of scope

- Replacing Selenium Manager wholesale
- Supporting browsers other than Chrome (Firefox, Edge, Safari)
- Network-level fixes (VPN/firewall configuration) — those are user-environment issues
- Localised (non-English) error message parsing from Selenium Manager

## Open questions

- Should the server hard-exit or stay alive returning errors per-call when pre-flight fails? Recommendation: stay alive, return errors, log loudly — depends on how MCP clients handle each.

## Success metrics

- Server start with working network produces no extra output and adds < 2 s to start-up
- Blocking `googlechromelabs.github.io` emits a `NETWORK_UNREACHABLE` error mentioning both required hosts
- Outdated `selenium-webdriver` produces a `VERSION_MISMATCH` error recommending upgrade + cache clear
- Unwritable `~/.cache/selenium` produces a `CACHE_PERMISSION` error
- `SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1` bypasses pre-flight entirely
- Every error message includes the platform-correct diagnostic command
- Unit tests cover all error categories with > 80 % coverage of new modules

---

## Epics

- [EPIC-016 — Pre-flight Driver Check](./EPIC-016-preflight-driver-check/EPIC-016-preflight-driver-check.md)
- [EPIC-017 — Driver Error Diagnostics](./EPIC-017-driver-error-diagnostics/EPIC-017-driver-error-diagnostics.md)
