> **Template** — copy this file to `docs/requirements/PRD-NNN-<slug>/PRD-NNN-<slug>.md`
> and fill in the placeholders. Remove this block after filling in.
>
> Conventions:
> - `NNN` = sequence number (three digits, following the last PRD).
> - `<slug>` = kebab-case short feature name (e.g. `password-reset`).
> - The PRD is the **top of the spec hierarchy**. It captures vision, capabilities, and success metrics.
> - Detailed user stories and acceptance criteria do **not** live here — they live in
>   `docs/requirements/PRD-NNN-<slug>/EPIC-NNN-<slug>/US-NNN-<slug>.md` (see the `epic` and `user-story` skills).

# PRD-NNN — <Title>

> **Status:** draft (<YYYY-MM-DD>)
> **Owner:** <product / dev-lead>
> **Reviewers:** <names>
> **Source material:** <links to sales / customer / research material>

## Problem statement

One paragraph. What is broken or missing today? Who is affected and how?
Refer concretely to existing code/documents (`path/to/file.tsx`, `docs/...`)
so the reader has the context in one click.

## Goal

One sentence, end-state formulated: "A <user> can <X> so that <Y>."

## Users

- **<Role 1>** — what do they need to accomplish?
- **<Role 2>** — same.

## Capabilities (high level)

Bulleted list of user-visible capabilities this feature delivers — one line each, no acceptance criteria. These will be expanded into epics + stories by the next skills.

- Capability 1 — one sentence
- Capability 2 — one sentence
- Capability 3 — one sentence

## Non-functional requirements

- **Performance:** <targets, e.g. "page loads in < 2s p95">
- **Security:** <requirements, e.g. "all routes authenticated">
- **Accessibility:** <floor, e.g. "WCAG AA">
- **Browser/device support:** <matrix>
- **Other:** <durability, recovery, compliance, …>

## Out of scope

Explicit list of what this version will NOT include. Prevents scope creep.

- Item 1
- Item 2

## Open questions

Things that need a decision before or during build.

- <question 1, with whom + when answered>
- <question 2>

## Success metrics

How will we measure if this worked?

- <metric 1, number + measurement method>
- <metric 2>

---

## Epics

Once the PRD is confirmed, the `epic` skill decomposes the capabilities into one or more epics. List them here as they are created:

- [EPIC-NNN — <title>](./EPIC-NNN-<slug>/EPIC-NNN-<slug>.md)
