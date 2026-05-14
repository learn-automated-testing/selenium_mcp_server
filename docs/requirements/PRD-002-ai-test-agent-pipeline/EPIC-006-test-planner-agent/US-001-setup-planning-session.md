---
id: US-001
epic: EPIC-006-test-planner-agent
priority: must-have
status: done
testing: []
---

# US-001 — Setup Planning Session

As an **AI agent**, I want to **initialize a test planning session for a target URL**, so that **I can discover all navigation links and begin systematic exploration of the application**.

## Context

The entry point for the planner workflow. Navigates to the target URL, discovers all navigation links via JavaScript extraction, and returns a structured list of pages to explore.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/planner/planner-setup-page.ts`
**Builds on:** [US-001 — Navigate to URL](../../PRD-001-core-browser-automation/EPIC-001-navigation-and-pages/US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Navigates to the target URL and captures a page snapshot.
- [ ] AC 2 — Discovers all navigation links on the page via JavaScript extraction.
- [ ] AC 3 — Returns a structured list of discovered links with labels and URLs.
- [ ] AC 4 — Links are deduplicated and sorted for systematic exploration.
