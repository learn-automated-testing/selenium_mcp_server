# EPIC-014 — OAuth 2.1 Authentication

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-004 — Serverless Deployment & Authentication](../PRD-004-serverless-deployment.md)

## Problem statement

Exposing the MCP server over HTTP without authentication would allow anyone to control a browser remotely. The endpoint needs industry-standard authentication — OAuth 2.1 with PKCE for MCP clients that support it, and a simpler Bearer token (static API key) fallback for quick integration. Dynamic client registration allows new clients to onboard without manual configuration.

Key files: `lambda/handler.js` (OAuth endpoints, token generation, PKCE verification).

## Goal

The Lambda MCP endpoint is protected by OAuth 2.1 Authorization Code flow with PKCE and dynamic client registration — with a static API key fallback for simple use cases.

## Scope (v1)

**In scope**
- OAuth metadata discovery (`.well-known` endpoints)
- Dynamic client registration (RFC 7591)
- Authorization code flow with PKCE challenge/verification (RFC 7636)
- Token exchange (code → access token)
- Bearer token authentication (static API_KEY fallback)
- Self-validating HMAC-SHA256 tokens (no database needed)

**Out of scope**
- Refresh tokens
- Token revocation
- User management / admin UI
- Scope-based authorization (all-or-nothing access)

## Users

- **AI Agents / MCP Clients** — authenticate via OAuth 2.1 PKCE or Bearer token.
- **Developers** — configure API keys, register clients.

## User stories

### Must-have
- [US-001 — OAuth metadata discovery](./US-001-oauth-metadata.md)
- [US-002 — Protected resource metadata](./US-002-resource-metadata.md)
- [US-003 — Dynamic client registration](./US-003-client-registration.md)
- [US-004 — Authorization code flow](./US-004-authorization-code-flow.md)
- [US-005 — Token exchange](./US-005-token-exchange.md)
- [US-006 — Bearer token authentication](./US-006-bearer-token.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | Discovery & registration | US-001, US-002, US-003 |
| MH-2 | Auth flow | US-004, US-005 |
| MH-3 | Fallback auth | US-006 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. OAuth 2.1 with PKCE (SHA256 challenge method) — no implicit or password grants.
2. Tokens are `${base64payload}.${hmac_sig}` — self-validating, no database.
3. Auth codes expire in 5 minutes; access tokens expire in 8 hours.
4. Static API_KEY via environment variable as simple fallback.
5. Dynamic client registration returns client_id — no client_secret (public clients).

## Open questions

- None.

## Success metrics

- Full OAuth PKCE flow works end-to-end: register → authorize → token → /mcp
- Bearer token fallback provides quick access with API key
- Invalid/expired tokens return 401 Unauthorized

---

**Relation with other epics:**
- [EPIC-013 — Lambda MCP Transport](../EPIC-013-lambda-mcp-transport/EPIC-013-lambda-mcp-transport.md) — auth protects the /mcp endpoint.
