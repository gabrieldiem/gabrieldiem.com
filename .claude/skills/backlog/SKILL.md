---
name: backlog
description: Add, pick up, triage or close items in BACKLOG.md. Use when you notice a bug, debt or idea outside the current task, when the user says "add to backlog", "later", "tech debt", or "pick something from the backlog / work on the backlog".
---

# Backlog

The backlog is `BACKLOG.md` at the repo root. Unlike GYMBROS, this project has no Plane project.

## How items are written

```markdown
- [ ] **Short title** (area, size): why it matters / what done looks like. _Added YYYY-MM-DD_
```

- Section: **Decide** (needs the user's answer), **Later** (planned work), **Tech debt** (known debt).
- Area: `web`, `product`, `infra`, `docs`, `design`.
- Size: S ≤ 1 hour, M ≤ 1 day, L > 1 day.

## Adding an item (while working on something else)

1. Leave it for later unless it blocks the current task.
2. Add the line under the right section. Point to the file or line when it helps (`apps/web/src/features/plant/plant.ts:42`).
3. Commit it together with the current work, or alone as `Add backlog item: <title>`.
4. Mention the new item in your end-of-step summary so the user sees it.

## Picking up work ("work on the backlog")

1. Skip **Decide** items unless the user has answered them.
2. Pick in this order: the item the user named → anything blocking a current feature → tech debt of size S → the oldest **Later** item.
3. Say which item you're taking and why, in one line. Then branch (`fix/…`, `chore/…`, `feat/…`) and work normally: plan, test, commit progressively.
4. When it's done, move the line to **Done**:

   ```markdown
   - [x] **Title**: closed YYYY-MM-DD in <hash or PR>.
   ```

## Closing a decision

When the user answers a **Decide** item, record the answer in the right place (`docs/PRODUCT.md`, `src/content/`, `CLAUDE.md`). Then move the line to **Done** with the answer in one line.
