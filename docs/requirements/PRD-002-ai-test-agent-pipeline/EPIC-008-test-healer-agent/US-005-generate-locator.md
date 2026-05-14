---
id: US-005
epic: EPIC-008-test-healer-agent
priority: must-have
status: done
testing: []
---

# US-005 — Generate Element Locator

As an **AI agent**, I want to **generate a CSS selector and XPath for an element**, so that **I have stable locators to use in test fixes**.

## Context

Generates both CSS and XPath locators for a given element, prioritizing stable attributes (data-testid, aria-label, id) over fragile ones (class names, nth-child).

**Existing implementation:** `selenium-mcp-server/src/tools/agents/healer/browser-generate-locator.ts`
**Builds on:** [US-004 — Inspect page for selectors](./US-004-inspect-page.md)

## Acceptance criteria

- [ ] AC 1 — Input is a natural language `elementDescription` string (not an element ref or selector). The tool searches the page snapshot for elements whose text or aria-label contains the description.
- [ ] AC 2 — Generates multiple suggested locator strategies for the best matching element: `By.id()` (if element has an id), `By.xpath()` (text-based), and ref-based selector.
- [ ] AC 3 — Prioritizes stable attributes (id, text content) in generated locators.
- [ ] AC 4 — Returns an error if no matching element is found in the page snapshot.
