---
id: US-003
epic: EPIC-016-preflight-driver-check
priority: should-have
status: draft
testing: [unit]
---

# US-003 — Auto-recover by Clearing Cache and Retrying

As a **developer / operator**, I want the **server to automatically clear the Selenium cache and retry the pre-flight check on failure**, so that **stale or corrupted cache entries are resolved without manual intervention**.

## Context

A common failure scenario is a corrupted or stale `~/.cache/selenium/` directory — for example after a Chrome update that leaves behind an incompatible cached driver. Clearing the cache and retrying often resolves the issue without user action.

**Existing implementation:** none.
**Builds on:** [US-001 — Run Selenium Manager pre-flight check](./US-001-run-selenium-manager-preflight.md), [US-002 — Handle pre-flight failure](./US-002-handle-preflight-failure.md).

## Acceptance criteria

- [ ] AC 1 — When the initial pre-flight check fails, the server deletes the contents of `~/.cache/selenium/` (or the platform-equivalent cache directory).
- [ ] AC 2 — After clearing the cache, the pre-flight check is retried exactly once.
- [ ] AC 3 — If the retry succeeds, the server proceeds normally. A `debug`-level log entry records the auto-recovery.
- [ ] AC 4 — If the retry also fails, the original failure handling from US-002 applies (structured error, tools degraded).
- [ ] AC 5 — If the cache directory does not exist or is not writable, the retry proceeds without error (cache clear is best-effort).

## Testing

- **Unit (vitest)**: Mock filesystem and `child_process.execSync`; verify cache directory is removed on first failure, retry is attempted, and correct result is returned for both retry-success and retry-failure paths.

## Notes / implementation hints

- Cache path varies: `~/.cache/selenium/` on Linux/macOS, `%LOCALAPPDATA%\selenium\` on Windows.
- Use `fs.rm(cacheDir, { recursive: true, force: true })` for deletion.
- This is an implicit requirement derived from the observed failure scenarios (Scenario B).

## Open questions

- None.
