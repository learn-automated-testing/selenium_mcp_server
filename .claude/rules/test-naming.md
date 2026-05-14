---
paths:
  - "**/*.test.*"
  - "**/*_test.*"
  - "tests/**/*"
---

# Test naming convention

## Rules

- Test names follow the it-should style — never generic names like `test_1` or `testFoo`.
- A failing test name alone should tell you what broke without reading the code.
- Use `describe`/`context` blocks (or nested classes in Python) to group related intents.

**Why:** The test report is a spec of the system's intended behaviour — make it readable.
