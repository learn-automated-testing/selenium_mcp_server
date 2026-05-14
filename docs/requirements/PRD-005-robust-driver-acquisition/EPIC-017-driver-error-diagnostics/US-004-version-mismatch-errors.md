---
id: US-004
epic: EPIC-017-driver-error-diagnostics
priority: must-have
status: draft
testing: [unit]
---

# US-004 — Handle Version-mismatch Errors

As a **developer / operator**, I want **version-mismatch errors to be detected and provide specific upgrade guidance**, so that **I know exactly which package to update and which cache to clear when Chrome and chromedriver are out of sync**.

## Context

When the user's installed Chrome is newer than the chromedriver that `selenium-webdriver` can resolve, the error reads: `"This version of ChromeDriver only supports Chrome version 146 / Current browser version is 148.0.7778.98"`. This is a distinct failure mode that requires a specific fix: upgrade `selenium-webdriver` and clear the Selenium cache.

**Existing implementation:** none — the raw Selenium error propagates unmodified.
**Builds on:** [US-001 — Wrap driver build with error classification](./US-001-wrap-driver-build-errors.md).

## Acceptance criteria

- [ ] AC 1 — When the error message contains `"This version of ChromeDriver only supports Chrome version"`, it is classified as `VERSION_MISMATCH`.
- [ ] AC 2 — The formatted error recommends: (a) upgrading `selenium-webdriver` to the latest version (`npm update selenium-webdriver`), (b) clearing the Selenium cache (`rm -rf ~/.cache/selenium/` or platform equivalent).
- [ ] AC 3 — The error message includes both the supported ChromeDriver version and the current Chrome version extracted from the original error.
- [ ] AC 4 — The error message includes the bypass hint: setting `CHROMEDRIVER_PATH` to a manually downloaded compatible driver.

## Testing

- **Unit (vitest)**: Throw a mock error with the version-mismatch pattern including specific version numbers; verify the formatted message includes the upgrade command, cache-clear command, and extracted version numbers.

## Notes / implementation hints

- Version extraction can use a regex: `/only supports Chrome version (\d+).*?Current browser version is ([\d.]+)/`.
- Covers FR-2.3.

## Open questions

- None.
