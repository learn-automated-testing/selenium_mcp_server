# EPIC-017 — Driver Error Diagnostics

> **Status:** draft (2026-05-14)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-005 — Robust Driver Acquisition](../PRD-005-robust-driver-acquisition.md)

## Problem statement

When `new Builder().forBrowser('chrome').build()` fails at runtime, the raw Selenium error propagates to the AI agent as an opaque, misleading message. For example, a DNS block on `googlechromelabs.github.io` surfaces as an error mentioning `storage.googleapis.com`, sending the user on a false trail. There is no cause classification, no remediation guidance, and no diagnostic command to help the user self-serve.

Key files: `selenium-mcp-server/src/context.ts` (Context.ensureBrowser), `selenium-mcp-server/src/tools/base.ts` (BaseTool).

## Goal

Every driver-acquisition error at runtime is intercepted, classified by cause (network, version mismatch, permissions, download failure), and replaced with an actionable message that includes the likely cause, recommended fix, platform-specific diagnostic command, and the original error for support reference.

## Scope (v1)

**In scope**
- Wrap `new Builder().forBrowser('chrome').build()` calls with error interception
- Classify errors by matching stderr patterns to cause categories
- Generate structured, actionable error messages per category
- Include platform-specific diagnostic commands (macOS / Linux / Windows)
- Wrap Selenium Grid session builder errors

**Out of scope**
- Pre-flight check at start-up (covered by EPIC-016)
- Automatic recovery / retries at runtime
- Non-Chrome browsers

## Users

- **AI Agents (LLMs)** — receive structured error responses they can relay to the user or reason about.
- **Developers / Operators** — get actionable error messages with diagnostic commands when tools fail.

## User stories

### Must-have
- [US-001 — Wrap driver build with error classification](./US-001-wrap-driver-build-errors.md)
- [US-002 — Format actionable error messages](./US-002-format-actionable-errors.md)
- [US-004 — Handle version-mismatch errors](./US-004-version-mismatch-errors.md)

### Should-have
- [US-003 — Include platform-specific diagnostic command](./US-003-platform-diagnostic-command.md)
- [US-005 — Wrap Grid session builder errors](./US-005-wrap-grid-session-errors.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Core error wrapping | US-001, US-002, US-004 |
| MH-2 | Diagnostics & Grid | US-003, US-005 |

## Testing scope

Unit tests with mocked errors covering all five cause categories (`NETWORK_UNREACHABLE`, `VERSION_MISMATCH`, `CACHE_PERMISSION`, `DOWNLOAD_FAILED`, `UNKNOWN`). Verify message format, diagnostic command correctness per platform, and original error preservation. Target > 80 % coverage of `src/driver-errors.ts`.

## Decisions (recorded 2026-05-14)

1. Error classification uses English-only pattern matching against Selenium Manager stderr — localised systems are a known limitation for v1.
2. The original error is preserved verbatim at the bottom of the structured message for support/debugging.
3. Diagnostic commands use relative paths from the project root.

## Open questions

1. Should pattern matching be case-insensitive or exact? Recommendation: case-insensitive (FR-3.1 specifies this).

## Success metrics

- All five cause categories correctly detected from known stderr samples
- Error messages include platform-correct diagnostic commands
- Version-mismatch errors recommend both upgrade and cache clear
- Unit tests achieve > 80 % coverage of `src/driver-errors.ts`

---

**Relation with other epics:**
- [EPIC-016 — Pre-flight Driver Check](../EPIC-016-preflight-driver-check/EPIC-016-preflight-driver-check.md) — shares cause-category classification; EPIC-016 applies it at start-up.
