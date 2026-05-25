#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Обновление кода"
git pull

echo "==> Пересборка и перезапуск"
docker compose up -d --build

echo "==> Статус"
docker compose ps

echo ""
echo "Сайт: https://parkmaximum.ru"
echo "Админка: https://parkmaximum.ru/admin/"
