# EPIC-013 — Lambda MCP Transport

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-004 — Serverless Deployment & Authentication](../PRD-004-serverless-deployment.md)

## Problem statement

The MCP server's default stdio transport only works locally. For remote access — cloud AI agents, CI/CD pipelines, distributed teams — an HTTP transport is needed. AWS Lambda provides serverless scalability, but requires stateless design (cold starts reset all state), a container image with headless Chromium, and an HTTP request/response pattern instead of streaming.

Key files: `lambda/handler.js`, `lambda/Dockerfile`, `lambda/package.json`, `selenium-mcp-server/src/server.ts` (runHttpServer).

## Goal

The MCP server runs on AWS Lambda with an HTTP transport, supporting stateless operation that survives cold starts, with a health check endpoint and headless Chromium in a container image.

## Scope (v1)

**In scope**
- HTTP MCP request handler (POST /mcp) accepting JSON MCP requests
- Health check endpoint (GET /health)
- Stateless design with self-validating HMAC tokens (survives cold starts)
- Lambda container image with headless Chromium (@sparticuz/chromium)

**Out of scope**
- SSE / streaming transport
- WebSocket transport
- Multi-region deployment
- API Gateway custom domain configuration

## Users

- **AI Agents** — send MCP requests over HTTP to remote Lambda endpoint.
- **DevOps/SRE** — deploy and monitor Lambda function.

## User stories

### Must-have
- [US-001 — MCP request handler](./US-001-mcp-request-handler.md)
- [US-002 — Health check endpoint](./US-002-health-check.md)
- [US-003 — Stateless token validation](./US-003-stateless-tokens.md)
- [US-004 — Lambda container with headless Chrome](./US-004-lambda-container.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | HTTP transport | US-001, US-002 |
| MH-2 | Stateless & container | US-003, US-004 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. JSON mode only — no SSE streaming. Simpler for Lambda request/response model.
2. Tokens are self-validating via HMAC-SHA256 — no database or external state needed.
3. Container image uses `@sparticuz/chromium` pre-built for Lambda x86_64.
4. Output directory set to `/tmp` for Lambda's writable filesystem.

## Open questions

- None.

## Success metrics

- Lambda endpoint accepts and processes MCP JSON requests
- Cold starts complete within 10 seconds
- Health check returns status for monitoring

---

**Relation with other epics:**
- [EPIC-014 — OAuth Authentication](../EPIC-014-oauth-authentication/EPIC-014-oauth-authentication.md) — protects the /mcp endpoint.
- [EPIC-015 — S3 Asset Storage](../EPIC-015-s3-asset-storage/EPIC-015-s3-asset-storage.md) — screenshots stored in S3 instead of local filesystem.
