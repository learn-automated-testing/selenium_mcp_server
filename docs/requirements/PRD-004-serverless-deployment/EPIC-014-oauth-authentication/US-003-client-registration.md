---
id: US-003
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-003 — Dynamic Client Registration

As an **MCP client**, I want to **register as an OAuth client dynamically**, so that **I can obtain a client_id without manual server-side configuration**.

## Context

RFC 7591 Dynamic Client Registration. Client provides redirect_uri and client_name, receives client_id. Public clients — no client_secret.

**Existing implementation:** `lambda/handler.js` (`POST /register` route)

## Acceptance criteria

- [ ] AC 1 — `POST /register` accepts client metadata (redirect_uris, client_name).
- [ ] AC 2 — Returns a client_id for the registered client.
- [ ] AC 3 — No client_secret is issued (public client).
- [ ] AC 4 — Invalid registration requests return appropriate errors.
