---
id: US-002
epic: EPIC-014-oauth-authentication
priority: must-have
status: done
testing: []
---

# US-002 — Protected Resource Metadata

As an **MCP client**, I want to **discover the protected resource metadata**, so that **I know which authorization server protects the MCP endpoint**.

## Context

Standard OAuth 2.1 protected resource metadata endpoint.

**Existing implementation:** `lambda/handler.js` (`/.well-known/oauth-protected-resource` route)

## Acceptance criteria

- [ ] AC 1 — `GET /.well-known/oauth-protected-resource` returns resource metadata JSON.
- [ ] AC 2 — Metadata includes the resource identifier and authorization server URL.
- [ ] AC 3 — No authentication required.
