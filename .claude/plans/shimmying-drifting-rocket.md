# Plan: Extract S3 Upload Logic into a Lambda Plugin

## Context

The S3 auto-upload logic in `lambda/handler.js` (lines 18, 28-30, 348-398, 490) is a customer/deployment-specific concern that doesn't belong in the core Lambda handler. It couples the handler to AWS S3 for a problem specific to Lambda's ephemeral `/tmp` filesystem. Extracting it as a plugin makes the handler cleaner and the S3 integration optional/replaceable.

The S3 code is already well-isolated — it's a post-processing step on the MCP response that regex-matches screenshot paths and uploads them. No core MCP server code is affected.

## Changes

### 1. Create `lambda/plugins/s3-upload.js`

Extract these pieces from `handler.js`:
- `S3Client` and `PutObjectCommand` imports
- `S3_BUCKET` and `s3` client initialization
- `uploadToS3()` function (lines 348-362)
- `uploadScreenshots()` function (lines 364-398)

Export a single factory function:
```js
// Returns a response post-processor function, or null if not configured
export function createS3Plugin() {
  const bucket = process.env.SCREENSHOT_S3_BUCKET;
  if (!bucket) return null;
  // ... S3 client setup, return uploadScreenshots function
}
```

### 2. Modify `lambda/handler.js`

- Remove S3 imports (`@aws-sdk/client-s3`, `readFile`, `basename`)
- Remove S3 constants (`S3_BUCKET`, `s3`) and functions (`uploadToS3`, `uploadScreenshots`)
- Remove the S3 section comment block
- Add a generic response plugin hook:
  ```js
  import { createS3Plugin } from './plugins/s3-upload.js';
  const responsePlugin = createS3Plugin();
  ```
- Replace line 490 (`responseBody = await uploadScreenshots(responseBody)`) with:
  ```js
  if (responsePlugin) responseBody = await responsePlugin(responseBody);
  ```
- Keep `readFile` / `basename` imports only if still needed elsewhere (they're not — remove them)

### 3. Update documentation

- **EPIC-015-s3-asset-storage.md**: Add note that S3 is now a plugin in `lambda/plugins/s3-upload.js`
- **PRD-004-serverless-deployment.md**: Note S3 capability is a plugin, not baked into the handler
- **US-001, US-002**: No status change needed (still "done"), but add a note about the plugin location

## Files modified

| File | Action |
|------|--------|
| `lambda/plugins/s3-upload.js` | **Create** — extracted S3 logic |
| `lambda/handler.js` | **Modify** — remove S3 code, add plugin import |
| `docs/requirements/PRD-004-serverless-deployment/EPIC-015-s3-asset-storage/EPIC-015-s3-asset-storage.md` | **Modify** — note plugin extraction |
| `docs/requirements/PRD-004-serverless-deployment/PRD-004-serverless-deployment.md` | **Modify** — note S3 is a plugin |

## Verification

1. `ls lambda/plugins/s3-upload.js` — file exists
2. `grep -c "S3" lambda/handler.js` — should return 0 (or only the plugin import)
3. `grep "createS3Plugin" lambda/handler.js` — plugin is wired in
4. Handler still works without `SCREENSHOT_S3_BUCKET` (plugin returns null, no-op)
5. With `SCREENSHOT_S3_BUCKET` set, plugin processes responses as before
