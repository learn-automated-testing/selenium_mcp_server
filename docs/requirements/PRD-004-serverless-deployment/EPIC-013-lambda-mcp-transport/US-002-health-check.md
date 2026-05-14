---
id: US-002
epic: EPIC-013-lambda-mcp-transport
priority: must-have
status: done
testing: []
---

# US-002 — Health Check Endpoint

As a **DevOps engineer**, I want to **check the Lambda endpoint health**, so that **I can monitor availability and set up health-check alerts**.

## Context

Simple `GET /health` endpoint that returns server status. No authentication required.

**Existing implementation:** `lambda/handler.js` (health check route)

## Acceptance criteria

- [ ] AC 1 — `GET /health` returns 200 with server status JSON.
- [ ] AC 2 — No authentication required for health check.
- [ ] AC 3 — Response includes server version or identifier.
