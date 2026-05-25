#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

docker compose run --rm certbot renew --quiet
docker compose exec -T nginx nginx -s reload

echo "$(date): certificates renewed, nginx reloaded"
