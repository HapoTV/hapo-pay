#!/bin/bash
set -e

echo "Starting HapoPay Application..."

# Wait for database (skip if using Supabase)
if [ -n "$DATABASE_HOST" ] && [ "$DATABASE_HOST" != "db.your-project.supabase.co" ]; then
    echo "Waiting for database..."
    while ! nc -z ${DATABASE_HOST:-localhost} ${DATABASE_PORT:-5432}; do
        sleep 1
    done
    echo "Database is ready!"
else
    echo "Using Supabase database - skipping local database check"
fi

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting application..."
exec "$@"
