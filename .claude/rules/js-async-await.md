---
paths:
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.ts"
  - "**/*.tsx"
---

# async/await over `.then()` chains

## Rules

- Use `async`/`await` as the default for asynchronous operations.
- Chain `.then()` only when integrating with a callback-returning API or inside a `Promise.all` pipeline.
- Always `await` inside try/catch when the promise can reject.

**Why:** Await-chains produce linear stack traces and avoid callback-pyramid nesting.
