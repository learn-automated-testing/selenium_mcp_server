---
id: US-004
epic: EPIC-004-browser-utilities
priority: must-have
status: done
testing: []
---

# US-004 — Monitor Network Requests

As an **AI agent**, I want to **view a summary of network requests**, so that **I can debug API calls, check for failed requests, and understand application behavior**.

## Context

Returns a summary of network requests parsed from Chrome's performance logs. Only captures HTTP method and URL — no status codes or timing data.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/network-monitor.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — `action: 'get_requests'` returns a summary of network requests with **method and URL only** — status codes are not captured.
- [ ] AC 2 — There is no timing data — only `method URL` pairs are returned from performance log entries.
- [ ] AC 3 — There is no failure indication — the tool does not distinguish between successful and failed requests.
- [ ] AC 4 — `action: 'clear'` consumes and discards the current performance logs (effectively clearing them).
- [ ] AC 5 — `action: 'set_offline'` toggles network offline mode via Chrome DevTools Protocol (`Network.emulateNetworkConditions`). This is Chrome-only and requires CDP support.
