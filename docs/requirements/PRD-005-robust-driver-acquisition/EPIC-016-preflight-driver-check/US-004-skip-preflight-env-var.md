---
id: US-004
epic: EPIC-016-preflight-driver-check
priority: should-have
status: done
testing: [unit]
---

# US-004 — Skip Pre-flight via Env Var

As a **CI/CD pipeline operator**, I want to **disable the pre-flight check via an environment variable**, so that **server start-up is not delayed when drivers are already pre-cached or managed externally**.

## Context

In CI environments, drivers are often pre-installed or cached in Docker images. The pre-flight check adds unnecessary latency and may fail spuriously in restricted network environments. Advanced users need a way to bypass it.

**Existing implementation:** none.
**Builds on:** [US-001 — Run Selenium Manager pre-flight check](./US-001-run-selenium-manager-preflight.md).

## Acceptance criteria

- [ ] AC 1 — When `SELENIUM_AI_AGENT_SKIP_PREFLIGHT=1` is set, the pre-flight check is skipped entirely.
- [ ] AC 2 — A `debug`-level log entry records that pre-flight was skipped due to the env var.
- [ ] AC 3 — Tool registration proceeds normally regardless of whether Selenium Manager would succeed.
- [ ] AC 4 — Any value other than `1` (or unset) does not skip the check.

## Testing

- **Unit (vitest)**: Set `process.env.SELENIUM_AI_AGENT_SKIP_PREFLIGHT = '1'`; verify `preflightCheck()` returns `{ ok: true }` without invoking `child_process.execSync`.

## Notes / implementation hints

- Check env var at the top of `preflightCheck()` and return early.
- Covers FR-5.1.

## Open questions

- None.
