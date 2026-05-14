---
id: US-005
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-005 — Token Exchange

As an **MCP client**, I want to **exchange an authorization code for an access token**, so that **I can authenticate subsequent MCP requests**.

## Context

Token endpoint verifies the PKCE code_verifier against the stored code_challenge, then issues a self-validating HMAC access token with 8-hour TTL.

**Existing implementation:** `lambda/handler.js` (`POST /token` route)

## Acceptance criteria

- [ ] AC 1 — `POST /token` accepts authorization_code grant with code_verifier.
- [ ] AC 2 — PKCE code_verifier is verified against the code_challenge (SHA256).
- [ ] AC 3 — Returns a self-validating HMAC access token.
- [ ] AC 4 — Token TTL is 8 hours.
- [ ] AC 5 — Invalid code or code_verifier returns appropriate error.
- [ ] AC 6 — Expired codes are rejected.
