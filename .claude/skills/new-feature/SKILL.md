---
name: new-feature
description: Checklist for adding or changing a section of the page, from content through feature folder, tests and docs. Use for any new section, new interactive behaviour, or a change to the plant's rules.
---

# New feature, end to end

Read the relevant part of `docs/PRODUCT.md` and `docs/DESIGN.md` first. Use the names from `docs/GLOSSARY.md`.

Commit after each numbered block once it's verified.

## 1. Content

- [ ] Facts and copy go in `apps/web/src/content/`, typed. Every fact traces to Gabriel's resume or repos. A drafted or inferred line gets a `decide` item in `BACKLOG.md`.
- [ ] Run the `unslop` skill on the copy.
- [ ] Add a rule to `tests/content.test.ts` when a claim depends on data (see the checks on model scores).

## 2. Logic

- [ ] Pure logic goes in a `.ts` file in `src/features/<name>/`. Plant rules go in `features/plant/plant.ts`.
- [ ] Rule-heavy logic: write the test first (`mattpocock-skills:tdd`), in `tests/`.
- [ ] Anything that outlives the page goes in the checkpoint, through a method on the plant.

## 3. UI

- [ ] Component and CSS Module in `src/features/<name>/`, using tokens from `src/styles/tokens.css`. Follow `docs/DESIGN.md`: the section is a piece of equipment from the same room, and its structure carries meaning.
- [ ] Interactive controls are real buttons, links or inputs, reachable by keyboard, and sized per the touch target rule in `apps/web/CLAUDE.md`.
- [ ] Reduced motion keeps the behaviour and drops the animation.
- [ ] Testing Library test for logic-bearing components.

## 4. Verify and wrap up

- [ ] Playwright spec in `tests/e2e/` for the flow, and an axe audit if it adds a new state.
- [ ] `run-stack` skill: tests, lint, build, screenshots at 390×844 and 1440×900, looked at.
- [ ] Update `docs/PRODUCT.md` if a rule changed, `docs/GLOSSARY.md` for new terms, and the Architecture section of `CLAUDE.md` if the shape changed.
- [ ] Out-of-scope findings go to `BACKLOG.md`.
- [ ] Summary: what was built, what could break, which tests cover it, any new backlog items.
