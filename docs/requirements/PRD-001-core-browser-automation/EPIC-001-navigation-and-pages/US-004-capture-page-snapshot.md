---
id: US-004
epic: EPIC-001-navigation-and-pages
priority: must-have
status: done
testing: []
---

# US-004 — Capture Page Snapshot

As an **AI agent**, I want to **capture a structured snapshot of the current page**, so that **I can see all interactive elements with their refs and decide what to interact with next**.

## Context

The page snapshot is the AI agent's "eyes" — it provides a structured view of all elements on the page, each with a unique ref that interaction tools (EPIC-002) use for addressing. The snapshot includes element tag names, text, ARIA labels, visibility, clickability, attributes, and bounding boxes. This is distinct from a screenshot (visual image).

**Existing implementation:** `selenium-mcp-server/src/tools/page/capture-page.ts`, `selenium-mcp-server/src/utils/element-discovery.ts`
**Builds on:** [US-001 — Navigate to URL](./US-001-navigate-to-url.md)

## Acceptance criteria

- [ ] AC 1 — Snapshot returns a structured list of all visible elements with unique refs.
- [ ] AC 2 — Each element includes: ref, tagName, text, ariaLabel, isClickable, isVisible, attributes.
- [ ] AC 3 — Snapshot is cached on the Context and reused until the next navigation or interaction.
- [ ] AC 4 — An optional `selector` can be passed via `expectation.snapshotOptions.selector` (not as a direct tool parameter) to limit snapshot scope to a DOM subtree.
- [ ] AC 5 — An optional `maxLength` can be passed via `expectation.snapshotOptions.maxLength` (not as a direct tool parameter) to truncate snapshot text.
