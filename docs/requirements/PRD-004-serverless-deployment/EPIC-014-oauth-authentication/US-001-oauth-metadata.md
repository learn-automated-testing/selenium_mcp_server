---
id: US-001
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-001 — OAuth Metadata Discovery

As an **MCP client**, I want to **discover the OAuth server metadata**, so that **I can automatically configure the authorization flow endpoints**.

## Context

Standard OAuth 2.1 metadata discovery endpoint. Returns authorization endpoint, token endpoint, supported grant types, etc.

**Existing implementation:** `lambda/handler.js` (`/.well-known/oauth-authorization-server` route)

## Acceptance criteria

- [ ] AC 1 — `GET /.well-known/oauth-authorization-server` returns OAuth server metadata JSON.
- [ ] AC 2 — Metadata includes issuer, authorization_endpoint, token_endpoint, registration_endpoint.
- [ ] AC 3 — Metadata includes supported grant types and code challenge methods.
- [ ] AC 4 — No authentication required.
