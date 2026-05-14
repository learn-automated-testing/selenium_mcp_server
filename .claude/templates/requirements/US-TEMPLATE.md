> **Template** — copy this file to `docs/requirements/PRD-NNN-<slug>/EPIC-NNN-<slug>/US-NNN-<slug>.md` and
> fill in the placeholders. Remove this block after filling in.
>
> Conventions:
> - Story `id` is unique within the epic (US-001, US-002, …).
> - `priority`: `must-have` | `should-have` | `could-have` | `wont-have-now`.
> - `status`: `draft` | `ready` | `in_progress` | `done` | `blocked`.
> - `testing`: list of planned levels, or `[]` if out of scope. In line with
>   `.claude/rules/story-testing.md` — the testing question must be answered before
>   the acceptance criteria are finalized.

---
id: US-NNN
epic: EPIC-NNN-<slug>
priority: must-have
status: draft
testing: [unit, integration, e2e]
---

# US-NNN — <Title>

As a **<role>**, I want to **<action>**, so that **<value / why>**.

## Context

Describe the current situation and what this story delivers. Refer to
existing code/components/pages (`path/to/file.tsx`) and adjacent
stories (`./US-XXX-<slug>.md`) so the reader finds the context in one click.

**Existing implementation:** <what is there now, if anything>.
**Builds on:** <link to previous story / epic>.

## Acceptance criteria

- [ ] AC 1 — concrete, testable, one behavior per line.
- [ ] AC 2.
- [ ] AC 3.

> Write ACs from observable behavior ("X is visible", "clicking Y leads
> to Z"), not from implementation. Implementation notes belong under
> *Notes / implementation hints*.

## Testing

> Only fill in this section if `testing` in the frontmatter is not empty.
> Replace `<unit-framework>`, `<integration-framework>`, and `<e2e-framework>`
> with the tools chosen during project setup (read from `.claude/context.md`).

- **Unit (`<unit-framework>`)**: <which functions / helpers>.
- **Integration (`<integration-framework>`)**: <which flow / API contract>.
- **E2E (`<e2e-framework>`)**: <which scenario, in which spec folder>.

## Notes / implementation hints

Optional — technical hints, alternatives that were considered,
links to relevant services. No ACs here.

## Open questions

- <question 1, with whom / when answered>
- <question 2>
