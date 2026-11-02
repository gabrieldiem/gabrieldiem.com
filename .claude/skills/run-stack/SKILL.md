---
name: run-stack
description: Start the site and verify a change end to end, including Playwright screenshots at mobile and desktop sizes. Use when asked to run, start, test, check or screenshot the site, or before committing a UI change.
---

# Run and verify

## Start

```bash
make up                        # Vite on http://localhost:5174, in Docker
make local                     # the same, natively
make prod                      # nginx serving the build on http://localhost:8082
```

Local storage holds the session between runs. Use a fresh browser context to see a first visit.

## Verify a change

Run what matches the change, and run everything before calling a phase done:

| Changed | Run |
|---|---|
| logic or content | `make test` + `cd apps/web && npm run lint` |
| any UI | the above + `make e2e` + screenshots (below), and actually look at them |
| Dockerfile, nginx or deploy files | `make test`, `make prod`, then `E2E_BASE_URL=http://localhost:8082 make e2e` |
| before calling a phase done | `make precommit` + `npm run build` + `E2E_BASE_URL=http://localhost:8082 make e2e` |

`make e2e` needs a running stack. Done means green, with no skipped spec you didn't expect and every screenshot looked at.

## Screenshots

`tests/e2e/smoke.spec.ts` writes each section to `apps/web/test-results/screens/` (gitignored) at both sizes:

- mobile: 390×844, `deviceScaleFactor: 2`, `isMobile: true`, `hasTouch: true`
- desktop: 1440×900

Look at the changed section at both sizes, plus the states a test can't judge: mid-failover and the blackout (`failover-*.png`, `blackout-*.png`). Check them against `docs/DESIGN.md`.

For a section that should match an earlier look, compare with `docs/prototype/index.html` by serving the repo root over HTTP, using reduced motion so nothing is animating.

## Stop

```bash
make down
```
