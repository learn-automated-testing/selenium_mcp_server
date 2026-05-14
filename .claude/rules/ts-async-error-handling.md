---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript async error handling

## Rules

- Every `await` that can reject must be in a try/catch OR returned from a function that documents it throws.
- Error messages must include operation name and relevant parameters.
- Never silently swallow errors with empty catch blocks.

**Why:** Unhandled rejections crash the process. Silent catches mask production incidents.

## Examples

### Good

```ts
try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} returned ${res.status}`);
  return await res.json();
} catch (err) {
  throw new Error(`loadUser(${userId}) failed: ${(err as Error).message}`);
}
```
