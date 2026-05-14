# Validate all user input at the boundary

## Rules

- Every HTTP handler, queue consumer, or file parser validates input against an explicit schema before use.
- Reject unknown fields in strict mode rather than silently dropping them.
- Return 400-level errors with a specific field name on validation failure.

**Why:** Validation at the boundary keeps the internal code model clean and predictable.
