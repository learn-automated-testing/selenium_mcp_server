---
id: US-003
epic: EPIC-005-session-management
priority: should-have
status: done
testing: []
---

# US-003 — Enable Stealth Mode

As an **AI agent**, I want to **enable stealth mode**, so that **I can automate sites with bot detection (Cloudflare, DataDome) without being blocked**.

## Context

Injects scripts to mask WebDriver fingerprints — hides `navigator.webdriver`, patches Chrome-specific properties, and applies other anti-detection measures.

**Existing implementation:** `selenium-mcp-server/src/tools/session/set-stealth-mode.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Stealth mode hides `navigator.webdriver` property.
- [ ] AC 2 — Chrome-specific fingerprint properties are patched.
- [ ] AC 3 — Stealth scripts persist across page navigations.
- [ ] AC 4 — Can be enabled before or after navigating to a page.
