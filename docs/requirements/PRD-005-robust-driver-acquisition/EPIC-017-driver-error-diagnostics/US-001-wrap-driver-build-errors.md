---
id: US-001
epic: EPIC-017-driver-error-diagnostics
priority: must-have
status: done
testing: [unit]
---

# US-001 — Wrap Driver Build with Error Classification

As a **developer / operator**, I want **every `new Builder().forBrowser('chrome').build()` call to be wrapped with error interception**, so that **driver-acquisition failures are classified by cause instead of surfacing as raw Selenium exceptions**.

## Context

The `Context` class in `selenium-mcp-server/src/context.ts` builds the WebDriver. When Selenium Manager fails, the error propagates unmodified. This story wraps that call with a try/catch that classifies the error into one of five categories by matching stderr patterns.

**Existing implementation:** `selenium-mcp-server/src/context.ts` — `Context.ensureBrowser()` or equivalent builder call.
**Builds on:** none (entry point for EPIC-017).

## Acceptance criteria

- [ ] AC 1 — The `new Builder().forBrowser('chrome').build()` call is wrapped in a try/catch.
- [ ] AC 2 — When the error message contains `"Unable to obtain browser driver"`, the wrapper classifies the error using stderr pattern matching.
- [ ] AC 3 — Errors are classified into one of: `NETWORK_UNREACHABLE`, `VERSION_MISMATCH`, `CACHE_PERMISSION`, `DOWNLOAD_FAILED`, `UNKNOWN`.
- [ ] AC 4 — Classification uses case-insensitive matching against the patterns defined in FR-3.1:
  - `NETWORK_UNREACHABLE`: `No route to host`, `tcp connect error`, `network is unreachable`, `dns error`, `ENOTFOUND`, `ECONNREFUSED`
  - `VERSION_MISMATCH`: `only supports Chrome version`, `chrome version` + `binary path`
  - `CACHE_PERMISSION`: `Permission denied` + `.cache/selenium`, `EACCES`
  - `DOWNLOAD_FAILED`: `error sending request for url`, `download failed`, `unable to download`
  - `UNKNOWN`: fallback
- [ ] AC 5 — The original error is preserved and accessible in the wrapped error.

## Testing

- **Unit (vitest)**: Throw mock errors with known stderr patterns; verify `classifyDriverError()` returns the correct category for each. Test the fallback to `UNKNOWN` for unrecognised patterns.

## Notes / implementation hints

- New file: `src/driver-errors.ts` exporting `classifyDriverError(stderr: string): ErrorCategory` and `wrapDriverError(originalErr: Error): Error`.
- Covers FR-2.1, FR-3.1.

## Open questions

- None.
