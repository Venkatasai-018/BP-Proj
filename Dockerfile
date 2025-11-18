FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install -r requirements.txt

# Copy application files
COPY backend/ .
COPY frontend/ ./static/
COPY init.sql .

# Configure PostgreSQL
RUN service postgresql start && \
    sudo -u postgres createuser -s bus_user && \
    sudo -u postgres psql -c "ALTER USER bus_user PASSWORD 'bus_password';" && \
    sudo -u postgres createdb -O bus_user bus_tracking && \
    sudo -u postgres psql -d bus_tracking -f init.sql && \
    service postgresql stop

# Configure Nginx
RUN echo "server {" > /etc/nginx/sites-available/default && \
    echo "    listen 80;" >> /etc/nginx/sites-available/default && \
    echo "    location / {" >> /etc/nginx/sites-available/default && \
    echo "        root /app/static;" >> /etc/nginx/sites-available/default && \
    echo "        try_files \$uri \$uri/ /live-tracker.html;" >> /etc/nginx/sites-available/default && \
    echo "        index live-tracker.html;" >> /etc/nginx/sites-available/default && \
    echo "    }" >> /etc/nginx/sites-available/default && \
    echo "    location ~ ^/(docs|auth|admin|buses|routes|live) {" >> /etc/nginx/sites-available/default && \
    echo "        proxy_pass http://127.0.0.1:8000;" >> /etc/nginx/sites-available/default && \
    echo "    }" >> /etc/nginx/sites-available/default && \
    echo "    location /ws {" >> /etc/nginx/sites-available/default && \
    echo "        proxy_pass http://127.0.0.1:8000;" >> /etc/nginx/sites-available/default && \
    echo "        proxy_http_version 1.1;" >> /etc/nginx/sites-available/default && \
    echo "        proxy_set_header Upgrade \$http_upgrade;" >> /etc/nginx/sites-available/default && \
    echo "        proxy_set_header Connection \"upgrade\";" >> /etc/nginx/sites-available/default && \
    echo "    }" >> /etc/nginx/sites-available/default && \
    echo "}" >> /etc/nginx/sites-available/default

# Configure Supervisor
RUN echo "[supervisord]" > /etc/supervisor/conf.d/supervisord.conf && \
    echo "nodaemon=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:postgres]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=/usr/lib/postgresql/13/bin/postgres -D /var/lib/postgresql/13/main -c config_file=/etc/postgresql/13/main/postgresql.conf" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "user=postgres" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "priority=100" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:fastapi]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=uvicorn main:app --host 127.0.0.1 --port 8000" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "directory=/app" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "priority=200" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "environment=DATABASE_URL=\"postgresql://bus_user:bus_password@localhost:5432/bus_tracking\"" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "[program:nginx]" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "command=nginx -g \"daemon off;\"" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "autorestart=true" >> /etc/supervisor/conf.d/supervisord.conf && \
    echo "priority=300" >> /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo "#!/bin/bash" > /app/start.sh && \
    echo "set -e" >> /app/start.sh && \
    echo "echo 'Starting PostgreSQL...'" >> /app/start.sh && \
    echo "service postgresql start" >> /app/start.sh && \
    echo "sleep 10" >> /app/start.sh && \
    echo "echo 'Initializing database...'" >> /app/start.sh && \
    echo "cd /app" >> /app/start.sh && \
    echo "python -c \"from database import Base, engine; Base.metadata.create_all(bind=engine); print('Database ready')\"" >> /app/start.sh && \
    echo "echo 'Starting all services...'" >> /app/start.sh && \
    echo "supervisord -c /etc/supervisor/conf.d/supervisord.conf" >> /app/start.sh && \
    chmod +x /app/start.sh

# Set environment variables
ENV DATABASE_URL="postgresql://bus_user:bus_password@localhost:5432/bus_tracking"
ENV SECRET_KEY="production-secret-key"

# Expose ports
EXPOSE 80 8000

# Start the application
CMD ["/app/start.sh"]