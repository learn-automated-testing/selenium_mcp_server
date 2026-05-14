---
id: US-006
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-006 — Bearer Token Authentication

As a **developer**, I want to **authenticate with a static API key**, so that **I can quickly access the MCP endpoint without going through the full OAuth flow**.

## Context

Simple fallback authentication. Static API_KEY configured via environment variable. Sent as `Authorization: Bearer <API_KEY>`.

**Existing implementation:** `lambda/handler.js` (Bearer token validation)

## Acceptance criteria

- [ ] AC 1 — `Authorization: Bearer <API_KEY>` header authenticates the request.
- [ ] AC 2 — API_KEY is configured via environment variable.
- [ ] AC 3 — Invalid API key returns 401 Unauthorized.
- [ ] AC 4 — Missing Authorization header returns 401 Unauthorized.
