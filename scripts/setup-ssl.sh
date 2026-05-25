#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

DOMAIN="${DOMAIN:-parkmaximum.ru}"
EMAIL="${CERTBOT_EMAIL:-admin@parkmaximum.ru}"

if [ ! -f .env ]; then
  echo "Файл .env не найден. Скопируйте .env.example и заполните значения."
  exit 1
fi

echo "==> Шаг 1/5: HTTP-конфиг для получения сертификата"
cp nginx/default.init.conf nginx/default.conf

echo "==> Шаг 2/5: Запуск контейнеров"
docker compose up -d --build

echo "==> Шаг 3/5: Получение SSL-сертификата Let's Encrypt"
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  -d "$DOMAIN" \
  -d "www.$DOMAIN"

echo "==> Шаг 4/5: Включение HTTPS"
cp nginx/default.ssl.conf nginx/default.conf
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload

echo "==> Шаг 5/5: Проверка"
sleep 2
curl -sI "https://$DOMAIN" | head -5
curl -sI "https://www.$DOMAIN" | head -5

echo ""
echo "Готово. HTTPS включён для $DOMAIN и www.$DOMAIN"
echo "Для автопродления добавьте cron:"
echo "  0 4 * * * cd $ROOT_DIR && ./scripts/renew-ssl.sh >> /var/log/parkmaximum-certbot.log 2>&1"
