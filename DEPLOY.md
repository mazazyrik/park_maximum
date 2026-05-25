# Деплой на сервер parkmaximum.ru

Пошаговые команды для первого запуска на `5.35.84.172`.

---

## 1. Подключиться к серверу

```bash
ssh root@5.35.84.172
```

---

## 2. Установить Docker (Ubuntu/Debian)

```bash
apt update && apt install -y git curl
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

---

## 3. Открыть порты

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

Если используется cloud firewall (Hetzner, Selectel и т.д.) — откройте **80** и **443** там тоже.

---

## 4. Проверить DNS

```bash
dig +short parkmaximum.ru
dig +short www.parkmaximum.ru
```

Оба должны вернуть `5.35.84.172`.

---

## 5. Клонировать проект

```bash
git clone <repository-url> /opt/parkmaximum
cd /opt/parkmaximum
```

---

## 6. Создать `.env`

```bash
cp .env.example .env
nano .env
```

Обязательно замените:

- `SECRET_KEY` — сгенерировать:
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(50))"
  ```
- `DB_PASSWORD`
- `DJANGO_SUPERUSER_PASSWORD`
- `CERTBOT_EMAIL`

---

## 7. Первый запуск (HTTP)

```bash
chmod +x scripts/*.sh
docker compose up -d --build
docker compose ps
docker compose logs -f backend
```

Проверка: http://parkmaximum.ru

---

## 8. Включить HTTPS (Certbot)

```bash
cd /opt/parkmaximum
./scripts/setup-ssl.sh
```

Скрипт сам:
1. Поставит HTTP-конфиг с webroot для Let's Encrypt
2. Получит сертификат для `parkmaximum.ru` и `www.parkmaximum.ru`
3. Переключит nginx на HTTPS
4. Проверит ответ сервера

Проверка:

```bash
curl -I https://parkmaximum.ru
curl -I https://www.parkmaximum.ru
```

---

## 9. Автопродление сертификата

```bash
crontab -e
```

Добавить строку:

```cron
0 4 * * * cd /opt/parkmaximum && ./scripts/renew-ssl.sh >> /var/log/parkmaximum-certbot.log 2>&1
```

Проверка без реального продления:

```bash
cd /opt/parkmaximum
docker compose run --rm certbot renew --dry-run
```

---

## 10. Обновление проекта

```bash
cd /opt/parkmaximum
./scripts/deploy-update.sh
```

---

## Полезные команды

```bash
# логи
docker compose logs -f
docker compose logs -f backend
docker compose logs -f nginx

# перезапуск
docker compose restart

# остановка
docker compose down

# Django shell
docker compose exec backend python manage.py shell

# пересоздать seed-данные
docker compose exec backend python manage.py seed_data --force

# создать админа вручную
docker compose exec backend python manage.py createsuperuser
```

---

## Если SSL не выдаётся

```bash
# DNS
dig +short parkmaximum.ru

# nginx конфиг
docker compose exec nginx nginx -t

# логи
docker compose logs nginx

# повторить получение сертификата
cd /opt/parkmaximum
cp nginx/default.init.conf nginx/default.conf
docker compose exec -T nginx nginx -s reload
docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email admin@parkmaximum.ru --agree-tos --no-eff-email \
  -d parkmaximum.ru -d www.parkmaximum.ru
cp nginx/default.ssl.conf nginx/default.conf
docker compose exec -T nginx nginx -s reload
```

---

## URL после деплоя

| Сервис | URL |
|--------|-----|
| Сайт | https://parkmaximum.ru |
| Админка | https://parkmaximum.ru/admin/ |
| API тарифов | https://parkmaximum.ru/api/v1/tariffs/ |
| API маршрутов | https://parkmaximum.ru/api/v1/routes/ |
