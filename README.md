# gabrieldiem.com

Gabriel Diem's About Me page, built as a working power-station switchboard. His name is a live circuit fed by three replicas. Trip a breaker and another replica takes over its letters. Trip all three and the page goes dark until you restart the plant by hand.

- What's on the page: [docs/PRODUCT.md](docs/PRODUCT.md)
- Design system: [docs/DESIGN.md](docs/DESIGN.md)
- Backlog and open decisions: [BACKLOG.md](BACKLOG.md)
- Working on the code (people and Claude): [CLAUDE.md](CLAUDE.md)

Stack: React + TypeScript (Vite), served by nginx. Docker Compose for dev and prod. No backend.

## Set up

You need **Docker** with Compose v2. To run things outside Docker you also need Node 22.13+.

```bash
git clone git@github.com:gabrieldiem/gabrieldiem.com.git && cd gabrieldiem.com
make install            # optional: local deps for editors and the pre-commit hooks
```

## Run it

```bash
make up                 # dev: http://localhost:5174
make prod               # nginx serving the build: http://localhost:8082
make down               # stop everything
```

## Test it

```bash
make test               # unit tests
make e2e                # Playwright against the running stack: flows, layout, axe audits
make precommit          # eslint, prettier, tsc
```

## Deploying

A push to `master` runs the tests, builds the image, scans it with Trivy and pushes it to `registry.gabrieldiem.com`. Then it starts the production stack file with that image and checks it, before production is touched. Finally it updates the Portainer stack, waits for a healthy container on that commit and checks https://gabrieldiem.com. A failed deploy keeps the site up: if the container was already replaced, the script restores the previous version. `redeploy.yml` deploys an existing tag by hand for a rollback.

### First deploy

Run this once, from the repo root, on the branch you're about to merge:

```bash
deploy/first-deploy-wizard.sh
```

It walks through the steps that need your credentials, and it's safe to run again:

1. Takes a Portainer access token for the `ci` user and the registry password.
2. Creates the GitHub `prod` environment and stores the secrets and variables.
3. Builds and pushes the first image, because a stack needs an image that already exists.
4. Creates the `gabrieldiem-com` stack in Portainer.
5. Adds the site to Caddy on the edge over SSH (`awsbr_edge_gabriel`), asking for your sudo password. It keeps a backup, validates the file and restores it if validation fails.
6. Checks the live site.

Merge after that, and every later deploy is automatic. Until the wizard has run, a push to `master` goes red at the registry login, and production isn't touched.
