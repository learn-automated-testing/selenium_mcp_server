# EPIC-015 — S3 Asset Storage

> **Status:** done (2026-05-13)
> **Owner:** dev-team
> **Reviewers:** —
> **Source document:** [PRD-004 — Serverless Deployment & Authentication](../PRD-004-serverless-deployment.md)

## Problem statement

Lambda's filesystem is ephemeral (`/tmp` only, wiped between invocations) and cannot serve files to clients. Screenshots and other generated assets need persistent storage accessible via URL. S3 provides durable, URL-addressable storage that integrates natively with Lambda.

Key files: `lambda/handler.js` (S3 upload logic, SCREENSHOT_S3_BUCKET env var).

## Goal

Screenshots taken during Lambda execution are automatically uploaded to S3, and tool responses return S3 URLs instead of local file paths — making assets accessible to remote clients.

## Scope (v1)

**In scope**
- Auto-upload screenshots to configurable S3 bucket
- Return S3 URLs in tool responses instead of local paths

**Out of scope**
- S3 lifecycle policies (expiration, archival)
- CDN / CloudFront distribution
- Non-screenshot asset uploads (PDFs, test specs)
- Pre-signed URL generation for private buckets

## Users

- **AI Agents** — receive S3 URLs for screenshots in tool responses.
- **DevOps/SRE** — configure S3 bucket and IAM permissions.

## User stories

### Must-have
- [US-001 — Auto-upload screenshots to S3](./US-001-s3-screenshot-upload.md)
- [US-002 — Return S3 URLs in responses](./US-002-s3-urls-in-responses.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | S3 integration | US-001, US-002 |

## Testing scope

Tests: out of scope — no test framework configured yet.

## Decisions (recorded 2026-05-13)

1. S3 bucket configurable via `SCREENSHOT_S3_BUCKET` environment variable.
2. AWS SDK v3 used (pre-installed in Lambda runtime — no extra dependency).
3. Upload happens automatically when screenshot tool is invoked on Lambda.
4. S3 key includes timestamp for uniqueness.

## Open questions

- None.

## Success metrics

- Screenshots appear in S3 bucket after tool execution
- Tool responses contain accessible S3 URLs
- No local file paths leaked in Lambda responses

---

**Relation with other epics:**
- [EPIC-013 — Lambda MCP Transport](../EPIC-013-lambda-mcp-transport/EPIC-013-lambda-mcp-transport.md) — S3 replaces local storage on Lambda.
