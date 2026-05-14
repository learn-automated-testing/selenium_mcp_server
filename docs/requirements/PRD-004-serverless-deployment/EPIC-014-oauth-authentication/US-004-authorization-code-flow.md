---
id: US-004
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-004 — Authorization Code Flow

As an **MCP client**, I want to **obtain an authorization code via the authorize endpoint**, so that **I can exchange it for an access token using PKCE**.

## Context

OAuth 2.1 Authorization Code flow with PKCE. The authorize endpoint presents a login form, validates credentials, generates an authorization code with the PKCE code_challenge attached. Code expires in 5 minutes.

**Existing implementation:** `lambda/handler.js` (`GET/POST /authorize` route)

## Acceptance criteria

- [ ] AC 1 — `GET /authorize` presents a login form with client_id, redirect_uri, code_challenge, state.
- [ ] AC 2 — `POST /authorize` validates credentials and generates an authorization code.
- [ ] AC 3 — Authorization code is bound to the code_challenge (PKCE SHA256).
- [ ] AC 4 — Code expires after 5 minutes.
- [ ] AC 5 — Redirects to the client's redirect_uri with code and state parameters.
