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

exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
