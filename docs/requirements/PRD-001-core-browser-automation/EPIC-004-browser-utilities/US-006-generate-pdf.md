---
id: US-006
epic: EPIC-004-browser-utilities
priority: should-have
status: done
testing: []
---

# US-006 — Generate PDF

As an **AI agent**, I want to **generate a PDF from the current page**, so that **I can save a printable copy of the page content**.

## Context

Generates a PDF document from the current page using BiDi `printPage` (cross-browser: Chrome, Firefox, Edge) with CDP fallback (Chrome-only). Supports A4, Letter, and Legal page sizes — no arbitrary custom dimensions.

**Existing implementation:** `selenium-mcp-server/src/tools/browser/pdf-generate.ts`
**Builds on:** [US-001 — Navigate to URL](../EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — PDF is generated from the current page content using BiDi `printPage` or CDP `Page.printToPDF`.
- [ ] AC 2 — Supports `A4`, `Letter`, and `Legal` paper formats (enum). Custom page dimensions are not supported.
- [ ] AC 3 — PDF is saved to the configured output directory when a `filePath` is provided or the server is in file output mode.
- [ ] AC 4 — In stdout mode without `filePath`, the PDF is returned as a base64 resource (`application/pdf`).
- [ ] AC 5 — Additional parameters: `landscape` (boolean), `printBackground` (boolean, default true), `scale` (0.1–2), and `pageRanges` (e.g. `"1-3,5"`).
