---
paths:
  - "tests/**/*"
  - "**/*.test.*"
  - "**/*_test.*"
---

# Zero tolerance for flaky tests

## Rules

- Any test that fails intermittently is quarantined (skip with reason + ticket) — never wrapped in retries.
- Do not add `retry` mechanisms around tests to mask flakiness.
- Root-cause flakes: race conditions, shared state, time dependency, or external-service reliance.

**Why:** Retrying hides real bugs and trains the team to ignore failing tests.
