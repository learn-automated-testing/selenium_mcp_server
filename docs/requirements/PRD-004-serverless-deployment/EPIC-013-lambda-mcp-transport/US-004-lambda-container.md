---
id: US-004
epic: EPIC-013-lambda-mcp-transport
priority: must-have
status: done
testing: []
---

# US-004 — Lambda Container with Headless Chrome

As a **DevOps engineer**, I want to **deploy the MCP server as a Lambda container with headless Chrome**, so that **browser automation works in the serverless environment**.

## Context

Lambda doesn't have a browser installed. The container image includes `@sparticuz/chromium` (pre-built for Lambda x86_64) and Node.js 20. Output directory is set to `/tmp` (Lambda's writable filesystem).

**Existing implementation:** `lambda/Dockerfile`, `lambda/package.json`

## Acceptance criteria

- [ ] AC 1 — Container image includes Node.js 20 and @sparticuz/chromium.
- [ ] AC 2 — Chromium binary works on Lambda x86_64 architecture.
- [ ] AC 3 — Output directory defaults to `/tmp`.
- [ ] AC 4 — Container builds and deploys successfully to AWS Lambda.
