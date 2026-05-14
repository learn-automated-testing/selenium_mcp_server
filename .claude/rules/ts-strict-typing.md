---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript strict typing

## Rules

- Do not use `any` — use `unknown` and narrow at the boundary.
- All exported functions have explicit return types.
- Prefer `interface` over `type` for object shapes.
- Use `readonly` on immutable fields.

**Why:** `any` disables the type system. Explicit return types make refactors safe.

## Examples

### Good

```ts
export function parse(input: unknown): Result<User, Error> { /* narrow then return */ }
```

### Bad

```ts
export function parse(input: any) { return input as User; }
```
