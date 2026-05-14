---
id: US-001
epic: EPIC-013-lambda-mcp-transport
priority: must-have
status: done
testing: []
---

# US-001 — MCP Request Handler

As an **AI agent**, I want to **send MCP JSON requests to the Lambda endpoint**, so that **I can use all browser automation tools remotely over HTTP**.

## Context

The `POST /mcp` endpoint accepts MCP JSON requests, routes them to the tool execution pipeline (same as stdio transport), and returns JSON responses. This is the core of the HTTP transport.

**Existing implementation:** `lambda/handler.js` (handleMcpRequest function)
**Builds on:** `selenium-mcp-server/src/server.ts` (runHttpServer)

## Acceptance criteria

- [ ] AC 1 — `POST /mcp` accepts valid MCP JSON requests.
- [ ] AC 2 — Requests are routed to the same tool execution pipeline as stdio transport.
- [ ] AC 3 — Tool results are returned as JSON responses.
- [ ] AC 4 — Invalid MCP requests return appropriate error responses.
- [ ] AC 5 — Request requires valid authentication (OAuth token or API key).
