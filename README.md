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

## Going live

Pushing to `master` always runs the tests. Building and deploying stay off until the steps below are done, so merging can't break anything or go red on missing secrets.

1. **Create the stack.** In Portainer, add a stack named `gabrieldiem-com` from `deploy/compose.edge.yaml`, with `IMAGE_TAG` as an environment variable. Note its stack and endpoint IDs.
2. **Point Caddy at it.** On the edge, add a site for `gabrieldiem.com` and `www.gabrieldiem.com` that forwards to `127.0.0.1:8091`. Check that port is free.
3. **Move DNS.** Point `gabrieldiem.com` and `www` at the edge. `postit.gabrieldiem.com` has its own record and stays where it is.
4. **Configure GitHub.** In the repo's `prod` environment, add the secrets `REGISTRY_CI_PASSWORD` and `PORTAINER_API_KEY`, and the variables `PORTAINER_URL`, `PORTAINER_STACK_ID` and `PORTAINER_ENDPOINT_ID`.
5. **Turn it on.** Add the repository variable `DEPLOY_ENABLED=true`, then push to `master` or run **Actions → Deploy**.

After that, a push to `master` runs the tests, builds the image, scans it with Trivy, pushes it to the registry, updates the stack, waits for a healthy container and checks the live page. If the check fails, the script restores the previous tag. `redeploy.yml` deploys an existing tag by hand for a rollback.
