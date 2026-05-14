---
id: US-003
epic: EPIC-013-lambda-mcp-transport
priority: must-have
status: done
testing: []
---

# US-003 — Stateless Token Validation

As a **developer**, I want to **validate tokens without external state**, so that **the Lambda can survive cold starts and scale without a database**.

## Context

Tokens are self-validating: `${base64payload}.${hmac_sha256_signature}`. The Lambda verifies the HMAC signature using a secret key — no database lookup needed. This design survives cold starts because there's no in-memory session state to lose.

**Existing implementation:** `lambda/handler.js` (token generation and validation functions)

## Acceptance criteria

- [ ] AC 1 — Tokens are `${base64payload}.${hmac_sig}` format.
- [ ] AC 2 — Validation checks HMAC-SHA256 signature against the secret key.
- [ ] AC 3 — Expired tokens (>8 hours) are rejected.
- [ ] AC 4 — Tampered tokens (invalid signature) are rejected.
- [ ] AC 5 — No external state (database, Redis) required for validation.
