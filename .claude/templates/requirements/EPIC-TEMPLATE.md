> **Template** — copy this file to `docs/requirements/PRD-NNN-<slug>/EPIC-NNN-<slug>/EPIC-NNN-<slug>.md`
> and fill in the placeholders. Remove this block after filling in.
>
> Conventions:
> - `NNN` = sequence number (three digits, following the last epic).
> - `<slug>` = kebab-case short title (e.g. `package-management`).
> - Each user story goes in a separate file `US-NNN-<slug>.md` in the same folder.
> - Don't forget to **explicitly record before the acceptance criteria** whether testing
>   is in scope, and if so at what level (see `.claude/rules/story-testing.md`).

# EPIC-NNN — <Title>

> **Status:** draft (<YYYY-MM-DD>)
> **Owner:** <product / dev-lead>
> **Reviewers:** <names>
> **Source document:** <relative link to PRD or sales / customer material>

## Problem statement

Describe the problem in 1–3 paragraphs. What does the organization currently do, where
does it go wrong, which gap does this epic close? Refer concretely to existing
code/documents (`path/to/file.tsx`, `docs/...`) so the reader has the context
in one click.

## Goal

One paragraph, end-state formulated: "A <user> can <X> so that <Y>".
Not "we are going to build…" but "what will be true afterwards".

## Scope (v1)

**In scope**
- Bullet 1
- Bullet 2

**Out of scope** (become their own epics / left for later)
- Bullet 1
- Bullet 2

## Users

- **<Role 1>** — what do they do in this epic?
- **<Role 2>** — same.

## User stories

Each story has its own file in this folder. Added by the `user-story` skill.

### Must-have
- [US-001 — <title>](./US-001-<slug>.md)
- [US-002 — <title>](./US-002-<slug>.md)

### Should-have
- [US-003 — <title>](./US-003-<slug>.md)

### Could-have / later
- [US-004 — <title>](./US-004-<slug>.md)

## Milestones

| # | Focus | Stories |
|---|---|---|
| MH-1 | <focus> | US-001, US-002 |
| MH-2 | <focus> | US-003 |

MH order is directional, not binding.

## Testing scope

Describe which test level **per epic** is expected by default (unit /
integration / E2E / combination). Per story this can be refined in the
`testing:` frontmatter field.

> If testing is out of scope for the entire epic: explicitly write
> `Tests: out of scope` here with the reason, so that it is a visible choice and
> not an omission.

## Decisions (recorded <YYYY-MM-DD>)

1. <decision 1, with whom + why>
2. <decision 2>

## Open questions

1. <question 1, with who answers it + for which story it is blocking>
2. <question 2>

## Success metrics

- <metric 1, number + measurement method>
- <metric 2>

---

**Relation with other epics:**
- [EPIC-XXX <title>](../EPIC-XXX-<slug>/EPIC-XXX-<slug>.md) — relation.
