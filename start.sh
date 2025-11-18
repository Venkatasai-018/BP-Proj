#!/bin/bash
set -e

echo "🚌 Starting College Bus Tracking System..."
cd /app
export PYTHONPATH=/app:$PYTHONPATH

echo "Initializing database..."
python -c "import os; os.chdir('/app'); from database import Base, engine; Base.metadata.create_all(bind=engine); print('✅ Database created')"

echo "Creating sample data..."
python seed_data.py

echo "✅ Setup complete!"
echo "🌐 Starting services..."
echo "Frontend: http://localhost"
echo "API docs: http://localhost/docs"

exec supervisord -c /etc/supervisor/conf.d/supervisord.conf