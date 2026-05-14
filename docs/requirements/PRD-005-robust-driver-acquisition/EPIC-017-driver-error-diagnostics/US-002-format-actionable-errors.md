---
id: US-002
epic: EPIC-017-driver-error-diagnostics
priority: must-have
status: draft
testing: [unit]
---

# US-002 — Format Actionable Error Messages

As a **developer / operator**, I want **driver-acquisition errors to include a structured, actionable message**, so that **I can quickly understand the cause and follow the recommended fix without external research**.

## Context

Raw Selenium errors are opaque and often misleading. Each cause category needs a specific remediation message with: a one-line summary, bulleted list of likely causes, the recommended fix, and the original error preserved at the bottom.

**Existing implementation:** none.
**Builds on:** [US-001 — Wrap driver build with error classification](./US-001-wrap-driver-build-errors.md).

## Acceptance criteria

- [ ] AC 1 — The formatted error message includes: a one-line summary of the failure, the detected cause category, a bulleted list of likely causes, and the recommended fix.
- [ ] AC 2 — The original error message is preserved verbatim at the bottom under an "Original error:" section.
- [ ] AC 3 — Each cause category maps to a specific remediation message:
  - `NETWORK_UNREACHABLE`: lists required hosts (`googlechromelabs.github.io`, `storage.googleapis.com`), suggests VPN/firewall/DNS checks
  - `VERSION_MISMATCH`: recommends upgrading `selenium-webdriver` and clearing cache
  - `CACHE_PERMISSION`: recommends fixing permissions on `~/.cache/selenium/`
  - `DOWNLOAD_FAILED`: lists required hosts, suggests retrying or manual download
  - `UNKNOWN`: suggests running diagnostic command and checking Selenium Manager docs
- [ ] AC 4 — Error messages fit within 80-character terminal width without horizontal scrolling.
- [ ] AC 5 — Error is logged at `error` level.

## Testing

- **Unit (vitest)**: For each cause category, verify `buildDriverErrorMessage()` output contains the expected sections (summary, cause, remediation, original error). Verify no line exceeds 80 characters.

## Notes / implementation hints

- `src/driver-errors.ts` exports `buildDriverErrorMessage(category: ErrorCategory, originalErr: Error): string`.
- See Appendix A in the requirements document for the recommended message format.
- Covers FR-2.2, FR-2.3, FR-3.2.

## Open questions

- None.
