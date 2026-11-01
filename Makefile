# Makefile for gabrieldiem.com (apps/web)

# Declare phony targets to avoid conflicts with files of the same name
.PHONY: install up down prod local test test-web e2e precommit clean

DEV := docker compose -f docker-compose-dev.yaml
PROD := docker compose -f docker-compose.yaml

# First run: create .env from the template.
.env:
	cp .env.example .env

install:
	cd apps/web && npm ci
	pre-commit install

up: .env
	$(DEV) up --build

prod: .env
	$(PROD) up --build

# Vite natively, without Docker.
local:
	cd apps/web && npm run dev

down:
	$(PROD) down
	$(DEV) down --remove-orphans

test: test-web

test-web:
	cd apps/web && npm run test

# Playwright against the running dev stack (`make up` in another terminal).
# E2E_BASE_URL=http://localhost:8082 runs it against the nginx build from `make prod`.
e2e:
	cd apps/web && npm run e2e

precommit:
	pre-commit run --all-files

clean:
	$(PROD) down -v --remove-orphans || true
	$(DEV) down -v --remove-orphans || true
