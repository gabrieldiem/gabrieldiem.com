# CLAUDE.md: web

React 19 + TypeScript (strict) + Vite single page. In production it is built to static files and served by nginx.

## Commands

```bash
npm ci
npm run dev          # Vite on :5174
npm run build        # tsc --noEmit && vite build → dist/
npm run test         # vitest run
npm run lint         # eslint + prettier --check
npm run e2e          # playwright test (needs a running stack)
```

## Stack

- Styling: plain CSS with the custom properties from `src/styles/tokens.css` and CSS Modules per feature. `src/styles/base.css` holds what every section shares (`.panel`, `.screw`, `.eng`, `.hand`). No UI kit, no Tailwind.
- Fonts: self-hosted through Fontsource, imported in `main.tsx`. Besley, B612, Courier Prime and Reenie Beanie, each with one job (see `docs/DESIGN.md`).
- State: the plant, through `usePlantState`. Local component state for everything else.
- Testing: Vitest + Testing Library for logic and components, Playwright for real-browser flows, layout and axe at 390×844 and 1440×900.

## Rules

- Copy and facts live in `src/content/`, components render them. The one exception is short section intros that contain a link or are tied to their layout.
- Logic that can be pure stays in a `.ts` file next to the feature (`trace.ts`, `tuner.ts`, `nameCircuit.ts`), with a test in `tests/`. Components stay small and presentational.
- Mobile first: design at 390 px wide, then scale up. Nothing may overflow horizontally from 320 px up; the e2e sweep asserts it.
- Main controls (breakers, knife switch, knob, dial, fix answers) are ≥44 px on touch. Smaller targets stay ≥24 px, the WCAG 2.2 AA minimum: the code card's lines are 28 px so the code stays readable as code, and the sound switch is 28 px.
- Focus is visible and `prefers-reduced-motion` is respected: no current flow, no needle wobble, no tube flicker, and failovers still run.
- Full-screen flashes stay under three per second. The black start timing in `plant.ts` is set for this.
- Motion answers the visitor. Only the current in the name and the meter needles move on their own.
- Anything the eye has to confirm gets a Playwright check, because jsdom applies no CSS. A dialog hidden by CSS passes every unit test.
- After any UI change, take a Playwright screenshot at 390×844 and 1440×900 and look at it before committing.
