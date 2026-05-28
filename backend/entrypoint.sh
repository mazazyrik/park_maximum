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

is_bot_runner=false
if [ "$#" -gt 0 ] && [ "$1" = "python" ] && [ "$3" = "run_bot" ]; then
  is_bot_runner=true
fi

if [ "$is_bot_runner" = "true" ]; then
  exec "$@"
fi

python manage.py migrate --noinput
python manage.py seed_data
python manage.py collectstatic --noinput

if [ "$#" -gt 0 ]; then
  exec "$@"
fi

exec gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
