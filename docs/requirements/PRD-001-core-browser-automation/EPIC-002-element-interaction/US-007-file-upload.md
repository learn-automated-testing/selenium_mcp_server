---
id: US-007
epic: EPIC-002-element-interaction
priority: must-have
status: done
testing: []
---

# US-007 — Upload File

As an **AI agent**, I want to **upload a file to a file input element**, so that **I can test file upload workflows**.

## Context

Sends a file path to an `<input type="file">` element. Path is validated through the sandbox utility.

**Existing implementation:** `selenium-mcp-server/src/tools/input/file-upload.ts`
**Builds on:** [US-004 — Capture page snapshot](../EPIC-001-navigation-and-pages/US-004-capture-page-snapshot.md)

## Acceptance criteria

- [ ] AC 1 — Uploading a valid file path to a file input element triggers the upload.
- [ ] AC 2 — Invalid file paths return an error result.
- [ ] AC 3 — Sending a file path to a non-file-input element does not produce a tool-level validation error — `sendKeys` on an incompatible element will throw a Selenium error.
- [ ] AC 4 — File path is resolved via `path.resolve()`. There is no sandbox validation on the input path — only the output directory is sandboxed.
