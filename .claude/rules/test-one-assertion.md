---
paths:
  - "**/*.test.*"
  - "**/*_test.*"
---

# One assertion of intent per test

## Rules

- Each test asserts one behavioural intent. Many setups is fine; many intents is a smell — split.
- Test names describe the intent, e.g. `it('rejects empty email')`, not `it('test1')`.
- Never mock the thing under test.

**Why:** Focused tests pinpoint failures. Multi-intent tests hide which behaviour broke.
