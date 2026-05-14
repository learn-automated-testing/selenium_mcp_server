---
id: US-002
epic: EPIC-006-test-planner-agent
priority: must-have
status: done
testing: []
---

# US-002 — Explore Page in Detail

As an **AI agent**, I want to **deep-explore a specific page**, so that **I can discover all forms, interactive elements, and potential test scenarios on that page**.

## Context

After setup discovers the page list, the planner explores each page in detail — discovering forms (with their fields), interactive elements, and potential user workflows.

**Existing implementation:** `selenium-mcp-server/src/tools/agents/planner/planner-explore-page.ts`
**Builds on:** [US-001 — Setup planning session](./US-001-setup-planning-session.md)

## Acceptance criteria

- [ ] AC 1 — Navigates to the specified page URL and captures detailed snapshot.
- [ ] AC 2 — Discovers all forms with their input fields, labels, and types.
- [ ] AC 3 — Identifies interactive elements (buttons, links, dropdowns) beyond forms.
- [ ] AC 4 — Returns structured data about discovered elements and potential test scenarios.
