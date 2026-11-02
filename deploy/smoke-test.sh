#!/usr/bin/env bash
# Start the production stack file with the given image and check it works, without touching
# production. Run by CI before every deploy.
#
#   deploy/smoke-test.sh <image-tag>
#
# Catches an image that doesn't start, a broken nginx config, a build that lost its assets, and stack
# file mistakes.
set -euo pipefail

export IMAGE_TAG=${1:?usage: smoke-test.sh <image-tag>}

DIR=$(cd "$(dirname "$0")" && pwd)
BASE=http://127.0.0.1:8091
compose=(docker compose -p gabrieldiem-com-smoke -f "$DIR/compose.edge.yaml")

finish() {
  local code=$?
  if [ "$code" -ne 0 ]; then
    echo "❌ Smoke test failed. The running version was not touched."
    "${compose[@]}" ps -a || true
    "${compose[@]}" logs --tail 40 web || true
  fi
  "${compose[@]}" down --remove-orphans >/dev/null 2>&1 || true
  exit "$code"
}
trap finish EXIT

# check <description> <text expected in the output> <curl args...>
check() {
  local description=$1 expected=$2 output
  shift 2
  output=$(curl -s --max-time 10 "$@")
  if ! grep -qi -- "$expected" <<<"$output"; then
    echo "   ${description}: expected '${expected}', got: ${output:0:300}"
    return 1
  fi
  echo "   ${description}: ok"
}

echo "🚀 Starting the stack on ${IMAGE_TAG}"
"${compose[@]}" up -d --wait --wait-timeout 60

echo "🩺 Checking it"
# portainer-deploy.sh looks for this same title on the live site.
check "page title" '<title>Gabriel Diem</title>' "$BASE/"
check "React root" 'id="root"' "$BASE/"
check "page revalidates" '^cache-control: no-cache' -D - -o /dev/null "$BASE/"
check "security headers" '^x-frame-options: deny' -D - -o /dev/null "$BASE/"
check "unknown paths render the page" '<title>Gabriel Diem</title>' "$BASE/some/unknown/path"
check "easter egg page" '🐻' "$BASE/%F0%9F%90%BB.html"

script=$(curl -s --max-time 10 "$BASE/" | grep -oE '/assets/index-[^"]+\.js' | head -1)
[ -n "$script" ] || {
  echo "   no script found in the page"
  exit 1
}
check "script is served" '^200' -o /dev/null -w '%{http_code}' "$BASE$script"
# Caddy adds a Via header, and nginx doesn't compress requests with one unless told to.
check "script is compressed behind Caddy" '^content-encoding: gzip' -D - -o /dev/null \
  -H 'Accept-Encoding: gzip' -H 'Via: 1.1 Caddy' "$BASE$script"
check "script caches for a year" '^cache-control: public, max-age=31536000, immutable' -D - -o /dev/null "$BASE$script"

echo "✅ ${IMAGE_TAG} passed"
