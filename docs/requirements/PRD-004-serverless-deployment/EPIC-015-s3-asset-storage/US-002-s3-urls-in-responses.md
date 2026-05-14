---
id: US-002
epic: EPIC-015-s3-asset-storage
priority: must-have
status: done
testing: []
---

# US-002 — Return S3 URLs in Responses

As an **AI agent**, I want to **receive S3 URLs for screenshots in tool responses**, so that **I can reference and share the screenshots via URL**.

## Context

After upload, the tool response is updated to include the S3 URL instead of (or in addition to) the local `/tmp` file path.

**Existing implementation:** `lambda/handler.js` (response URL substitution)
**Builds on:** [US-001 — Auto-upload screenshots to S3](./US-001-s3-screenshot-upload.md)

## Acceptance criteria

- [ ] AC 1 — Tool responses include the S3 URL for uploaded screenshots.
- [ ] AC 2 — Local `/tmp` file paths are not leaked in Lambda responses.
- [ ] AC 3 — If S3 upload fails, the base64 image is still included in the response.
