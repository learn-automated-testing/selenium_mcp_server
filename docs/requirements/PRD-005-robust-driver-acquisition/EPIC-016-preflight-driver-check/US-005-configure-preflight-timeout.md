---
id: US-005
epic: EPIC-016-preflight-driver-check
priority: could-have
status: done
testing: [unit]
---

# US-005 — Configure Pre-flight Timeout

As a **developer / operator**, I want to **configure the pre-flight check timeout via an environment variable**, so that **I can adjust it for slow networks or fast-fail environments**.

## Context

The default 30-second timeout balances first-time driver downloads (which are legitimate and may take time) with fast failure on blocked networks. Some environments need a longer timeout (slow connections) or shorter (fast CI feedback).

**Existing implementation:** none.
**Builds on:** [US-001 — Run Selenium Manager pre-flight check](./US-001-run-selenium-manager-preflight.md).

## Acceptance criteria

- [ ] AC 1 — When `SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS` is set to a valid positive integer, the pre-flight check uses that value as the timeout in milliseconds.
- [ ] AC 2 — When the env var is not set, the default timeout is 30000 ms.
- [ ] AC 3 — When the env var is set to a non-numeric or non-positive value, the default timeout is used and a `warn`-level log entry is emitted.
- [ ] AC 4 — If the pre-flight check exceeds the timeout, it is treated as a failure with cause category `UNKNOWN`.

## Testing

- **Unit (vitest)**: Set env var to various values (valid integer, non-numeric, negative); verify correct timeout is passed to `child_process.execSync`. Mock a timeout error and verify it is classified correctly.

## Notes / implementation hints

- Parse with `parseInt(process.env.SELENIUM_AI_AGENT_PREFLIGHT_TIMEOUT_MS, 10)` and validate `> 0`.
- Covers FR-5.2.

## Open questions

- None.
