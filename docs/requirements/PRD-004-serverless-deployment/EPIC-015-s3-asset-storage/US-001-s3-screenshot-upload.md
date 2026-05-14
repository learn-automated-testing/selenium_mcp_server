---
id: US-001
epic: EPIC-015-s3-asset-storage
priority: must-have
status: done
testing: []
---

# US-001 — Auto-Upload Screenshots to S3

As an **AI agent**, I want to **have screenshots automatically uploaded to S3**, so that **they are accessible via URL and persist beyond the Lambda invocation**.

## Context

When running on Lambda, the take_screenshot tool saves to `/tmp` (ephemeral). This feature intercepts the screenshot result and uploads the PNG to a configured S3 bucket using AWS SDK v3.

**Existing implementation:** `lambda/handler.js` (S3 upload logic, SCREENSHOT_S3_BUCKET env var)

## Acceptance criteria

- [ ] AC 1 — Screenshots are uploaded to the S3 bucket specified by SCREENSHOT_S3_BUCKET.
- [ ] AC 2 — Upload uses AWS SDK v3 (pre-installed in Lambda runtime).
- [ ] AC 3 — S3 key includes timestamp for uniqueness.
- [ ] AC 4 — Upload happens automatically when screenshot tool is invoked on Lambda.
- [ ] AC 5 — Upload failure does not break the tool response (graceful degradation).
