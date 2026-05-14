---
id: US-003
epic: EPIC-017-driver-error-diagnostics
priority: should-have
status: done
testing: [unit]
---

# US-003 — Include Platform-specific Diagnostic Command

As a **developer / operator**, I want **error messages to include a copy-pasteable diagnostic command for my platform**, so that **I can run Selenium Manager in debug mode to investigate the failure**.

## Context

Selenium Manager has a `--debug` flag that produces detailed output about what it tried and where it failed. The path to the binary differs per platform. Including the correct command saves the user from looking it up.

**Existing implementation:** none.
**Builds on:** [US-002 — Format actionable error messages](./US-002-format-actionable-errors.md).

## Acceptance criteria

- [ ] AC 1 — The error message includes a diagnostic command tailored to the current platform:
  - macOS: `./node_modules/selenium-webdriver/bin/macos/selenium-manager --browser chrome --debug`
  - Linux: `./node_modules/selenium-webdriver/bin/linux/selenium-manager --browser chrome --debug`
  - Windows: `.\node_modules\selenium-webdriver\bin\windows\selenium-manager.exe --browser chrome --debug`
- [ ] AC 2 — The command uses a relative path from the project root.
- [ ] AC 3 — The command is introduced with "To diagnose, run from the project directory:" so the user knows the context.
- [ ] AC 4 — The command works when copied and pasted from the terminal output.

## Testing

- **Unit (vitest)**: Mock `process.platform` to `darwin`, `linux`, and `win32`; verify the generated diagnostic command contains the correct platform-specific path and flags.

## Notes / implementation hints

- Add a `getDiagnosticCommand(): string` helper to `src/driver-errors.ts`.
- Covers FR-4.1, FR-4.2.

## Open questions

- None.
