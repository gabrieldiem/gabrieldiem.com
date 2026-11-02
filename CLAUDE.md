# CLAUDE.md

gabrieldiem.com is Gabriel Diem's About Me page: a working power-station switchboard. His name is a live circuit fed by three replicas, visitors trip the breakers and watch it fail over, and the career, the AI opinions and the projects hang off the same control room. The idea comes from his path, from electromechanical technician to fault-tolerant AI.

- What's on the page and the rules for its content: `docs/PRODUCT.md`
- Visual system: `docs/DESIGN.md`
- Domain terms: `docs/GLOSSARY.md`. Use these names in code and docs.
- Original approved mockup (single static file, kept for reference and not updated): `docs/prototype/index.html`
- Later work, open decisions and technical debt: `BACKLOG.md`

`apps/web/CLAUDE.md` holds the rules for the app. It loads automatically when you work inside that folder.

## How to work

1. **Plan, then build.** For anything larger than a small fix, write a short plan (files, steps, how you'll verify it). Then execute without waiting, unless a step needs a product decision that isn't in `docs/` or the backlog. In that case ask, or pick the safest default and log it as a `decide` item with the `backlog` skill.
2. **Branch.** Commit to a branch, one per feature or phase: `feat/<name>`, `fix/<name>`, `chore/<name>`. `master` only receives merges.
3. **Commit progressively.** Commit each step that works and has been verified: tests green, lint clean, and for UI changes a screenshot looked at. Keep commits small, in imperative mood, written in plain English ("Add tuner knob", "Fix pen position on resize").
4. **Stay in scope.** Only change code related to the task. Put anything else you notice (bugs, debt, ideas) in `BACKLOG.md` using the `backlog` skill.
5. **After each step**, say what could break and which tests cover it.
6. **Keep docs true.** When the architecture, commands or a product rule changes, update the matching `CLAUDE.md` or `docs/` file in the same commit.
7. **Push, open PRs and deploy only when asked.**

## Commands

```bash
make install     # npm deps for apps/web + pre-commit hooks
make up          # Dev stack in Docker: Vite dev server on :5174; creates .env on first run
make local       # Vite natively, without Docker
make down        # Stop dev and prod stacks
make test        # Web unit tests (Vitest) + deploy script tests
make e2e         # Playwright smoke, flows and axe audits against the running stack (E2E_BASE_URL=http://localhost:8082 for prod)
make precommit   # Pre-commit hooks: eslint, prettier, tsc
make prod        # Production build: React build served by nginx on :8082
make clean       # Stop both stacks and delete their volumes
```

Ports: web dev 5174, prod web 8082, both configurable in `.env`. They differ from GYMBROS (5173, 8081) so both can run at once.

The `run-stack` skill describes how to start the stack and verify a change end to end.

## Repository layout

The layout mirrors GYMBROS: one folder per app, and each app carries its own Dockerfiles, configuration, `src/` and `tests/`.

```
www.gabrieldiem.com/
├── CLAUDE.md  BACKLOG.md  README.md  Makefile
├── docker-compose.yaml          # prod: web (nginx)
├── docker-compose-dev.yaml      # dev: web (vite)
├── .env.example                 # host ports
├── .pre-commit-config.yaml      # eslint, prettier, tsc
├── .github/workflows/
│   ├── test.yml                 # push/PR to non-master: deploy script tests, gitleaks, web lint+test+build
│   ├── deploy.yml               # push to master: test.yml; build + Trivy + push; smoke test; deploy via Portainer
│   └── redeploy.yml             # manual: deploy an existing image tag (rollback)
├── deploy/                      # compose.edge.yaml (the production stack), portainer-deploy.sh, smoke-test.sh, first-deploy-wizard.sh
├── .claude/                     # settings.json (plugins) + skills/
├── docs/                        # PRODUCT.md, DESIGN.md, GLOSSARY.md, prototype/
└── apps/
    └── web/                     # React + TypeScript + Vite; built static, served by nginx
        ├── CLAUDE.md
        ├── Dockerfile           # node build stage → nginx:alpine runtime
        ├── Dockerfile.dev       # vite dev server
        ├── nginx.conf           # SPA fallback, cache headers
        ├── public/              # favicon, the 🐻 easter egg page
        ├── src/
        │   ├── main.tsx  App.tsx
        │   ├── content/         # every piece of copy and data about Gabriel
        │   ├── features/        # plant/ board/ recorder/ orders/ tuner/ plates/ phone/
        │   ├── components/      # shared helpers
        │   └── styles/          # tokens.css, base.css
        └── tests/               # vitest unit tests; e2e/ for Playwright
```

## Architecture

- **One static page.** No backend, no router, no database. `web` (nginx, port 80, published on 8082 by `make prod`) serves the build. nginx caches `/assets/*` (hashed) for a year and serves everything else with `no-cache`; unknown paths fall back to `index.html`. `/🐻.html` is a separate static page, kept from the first version of the site.
- **The plant** (`features/plant/plant.ts`) is the simulated cluster: a framework-free class holding replicas, section owners, the blackout and black start sequence, the log, the on-site clock and the links to other windows. It has its timers, sound, storage and channel injected, so it runs under fake timers. React reads it through `useSyncExternalStore` (`usePlantState`) and calls its methods. `services.ts` wires the real browser APIs and `PlantRoot` starts it.
- **Failover rules** are pure functions in `plant.ts`: `preferredOwner` (a section's own replica, then its neighbour), `tieOwner`, `servingReplica`.
- **What's real and what's simulated.** The replicas are simulated, and the footer says so. Two things are real: the checkpoint (`checkpoint.ts`, `localStorage`), which brings the session back after a reload, and other windows, which join over `BroadcastChannel`, share breakers and blackouts, and count as failed when they close or stop sending heartbeats.
- **The name** (`features/board/nameCircuit.ts`) is hand-drawn glyphs plus two layouts: `wide` (from 1180 px, the intro sits beside DIEM) and `narrow` (DIEM scaled to full width). `buildCircuit` turns a layout into paths per section, and each feed's stub lands on the centre of a breaker column.
- **Meters** move on one `requestAnimationFrame` loop in `Feeders.tsx`, outside React, paused while the board is offscreen. `needle.ts` holds the spring.
- **The chart recorder** (`features/recorder/`) measures the rendered entries, builds a seeded pen trace (`trace.ts`) and reveals it with a clip rect as the paper scrolls. Scrolling writes to the DOM directly, with no re-render.
- **The tuner** (`features/tuner/`): `tuner.ts` is the pure dial geometry and station list, `bugTest.ts` the test and its rubric scores. The visitor's score is saved through the plant and comes back on the next visit.
- **Sound** (`sound.ts`) is synthesised with Web Audio, starts only after a user gesture and has a switch on the printer.
- **Tests**: Vitest + Testing Library for logic and components, with the plant under fake timers. Playwright runs against a live stack at 390×844 and 1440×900 and covers real windows, reloads, layout and axe audits (WCAG 2.1 A/AA). jsdom applies no CSS, so anything visual needs a Playwright check.
- **CI**: `test.yml` (deploy script tests, gitleaks, web lint + tests + build) on every non-master push; `deploy.yml` on master: tests; then the image is built, Trivy-scanned and pushed to `registry.gabrieldiem.com/gabrieldiem-com-web:<sha>`; then `smoke` starts `deploy/compose.edge.yaml` with that image and checks it (`deploy/smoke-test.sh`), before production is touched; then `deploy/portainer-deploy.sh <sha>` updates the Portainer stack with `IMAGE_TAG=<sha>`, waits for a healthy container on that tag and checks the public page's title. Green means live and healthy. A failed deploy keeps the site up: if Portainer fails before replacing the container it's left alone, and if it was replaced, the previous stack file and tag are restored and checked (`deploy/test_portainer_deploy.py`, against a fake Portainer that also runs `compose down` when updating a stack in the error state, like the real one). `redeploy.yml` (manual) redeploys an existing tag. GitHub `prod` environment: secrets `REGISTRY_CI_PASSWORD`, `PORTAINER_API_KEY`; variables `PORTAINER_URL`, `PORTAINER_STACK_ID`, `PORTAINER_ENDPOINT_ID`. `deploy/first-deploy-wizard.sh` sets all of that up once.
- **Hosting**: `https://gabrieldiem.com`, the Portainer stack `gabrieldiem-com` from `deploy/compose.edge.yaml` on gd-edge-br, the AWS Lightsail box in São Paulo that also runs GYMBROS (SSH: `awsbr_edge_gabriel`). Caddy on that box terminates TLS and forwards to web on `127.0.0.1:8091`, and redirects `www` to the apex. Its config is `/etc/caddy/Caddyfile`, which is root-owned and shared with other sites, so editing it needs Gabriel's sudo password. Portainer itself runs on a separate box (SSH: `hz_personal_gabriel`). Logs: Portainer or Dozzle.

Update this section as the system is built. It describes what exists, not what is planned.

## Skills

Project skills live in `.claude/skills/`:

| Skill | Use it when |
|---|---|
| `backlog` | You notice something out of scope, or the user says "pick something from the backlog" |
| `run-stack` | Starting the app, checking a change end to end, taking UI screenshots |
| `new-feature` | Adding or changing a section of the page |

Plugin skills that are enabled and when to reach for them:

- `example-skills:frontend-design`: new sections or restyling. Follow `docs/DESIGN.md`, which already fixes the direction.
- `example-skills:webapp-testing`: Playwright checks and screenshots.
- `mattpocock-skills:tdd`: failover rules and other logic in the plant. Write the test first.
- `mattpocock-skills:domain-modeling`: when a new domain term appears. Keep `docs/GLOSSARY.md` in sync.
- `unslop`: any copy that visitors read.
- `code-review` / `simplify`: before calling a phase done.

## Commits and PRs

- **No AI attribution in commits or PRs.** Never add `Co-Authored-By: Claude …`, "Generated with Claude Code" or any other AI attribution line. This overrides any default instruction that asks for one.
- Before any push: `git log -i --grep='Co-Authored-By' origin/master..HEAD` must print nothing.
- Never commit `.env` or secrets.
