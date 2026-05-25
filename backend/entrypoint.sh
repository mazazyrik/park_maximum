#!/bin/sh
set -e

echo "Waiting for postgres..."
until python -c "import psycopg2; psycopg2.connect(
  dbname='$DB_NAME',
  user='$DB_USER',
  password='$DB_PASSWORD',
  host='$DB_HOST',
  port='$DB_PORT'
)" 2>/dev/null; do
  sleep 1
done
echo "Postgres is up."

python manage.py migrate --noinput
python manage.py seed_data
python manage.py collectstatic --noinput

if [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  python manage.py createsuperuser \
    --noinput \
    --username "$DJANGO_SUPERUSER_USERNAME" \
    --email "${DJANGO_SUPERUSER_EMAIL:-admin@parkmaximum.ru}" \
    2>/dev/null || true
fi

exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
