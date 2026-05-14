---
id: US-005
epic: EPIC-017-driver-error-diagnostics
priority: should-have
status: draft
testing: [unit]
---

# US-005 — Wrap Grid Session Builder Errors

As a **developer / operator**, I want **Selenium Grid session builder errors to be wrapped with the same diagnostics**, so that **remote Grid failures also produce actionable error messages instead of raw exceptions**.

## Context

The server supports connecting to a remote Selenium Grid (via `src/grid/`). When the Grid session builder fails — for example, the Grid is unreachable, the node doesn't have the requested browser, or there's an authentication issue — the errors are equally opaque. The same wrapping and classification logic should apply.

**Existing implementation:** `selenium-mcp-server/src/grid/` — Grid connection and session management.
**Builds on:** [US-001 — Wrap driver build with error classification](./US-001-wrap-driver-build-errors.md).

## Acceptance criteria

- [ ] AC 1 — The Grid session builder call is wrapped with the same try/catch error interception as the local driver builder.
- [ ] AC 2 — Grid-specific errors (connection refused, timeout, node not found) are classified using the same cause categories where applicable (e.g. `NETWORK_UNREACHABLE` for connection failures).
- [ ] AC 3 — The formatted error message mentions "Selenium Grid" in the summary to distinguish it from local driver failures.
- [ ] AC 4 — The diagnostic command section is adapted for Grid context (suggests checking Grid URL, node status, and network connectivity).
- [ ] AC 5 — The original Grid error is preserved verbatim.

## Testing

- **Unit (vitest)**: Throw mock Grid errors (connection refused, timeout); verify they are classified and formatted correctly with Grid-specific context.

## Notes / implementation hints

- Reuse `wrapDriverError()` from `src/driver-errors.ts` but extend it to accept an optional `context: 'local' | 'grid'` parameter.
- Covers FR-2.1 for the Grid path.

## Open questions

- Which Grid error patterns should map to which categories? Needs investigation of common Selenium Grid error messages.
