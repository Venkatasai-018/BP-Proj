#!/bin/bash
set -e

echo "🚌 Starting Bus Tracking System..."

# Start PostgreSQL
echo "Starting PostgreSQL..."
service postgresql start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until sudo -u postgres psql -c '\q' 2>/dev/null; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Initialize database if needed
echo "Checking database initialization..."
cd /app

# Try to create tables (will skip if they exist)
python3 -c "
try:
    import sys
    sys.path.append('/app')
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    print('Database tables ensured')
except Exception as e:
    print(f'Database initialization note: {e}')
" || echo "Database initialization completed or already done"

echo "Starting all services with supervisor..."
# Start supervisor to manage all services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf