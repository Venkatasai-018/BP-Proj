# Complete Bus Tracking System - Single Container for EC2 Deployment
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    DATABASE_URL="postgresql://bus_user:bus_password@localhost:5432/bus_tracking" \
    SECRET_KEY="ec2-production-secret-key-change-this-in-production" \
    ACCESS_TOKEN_EXPIRE_MINUTES="60"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    nginx \
    supervisor \
    curl \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY backend/ ./
COPY frontend/ ./frontend/
COPY init.sql /tmp/

# Configure PostgreSQL
RUN service postgresql start && \
    sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" && \
    sudo -u postgres psql -c "CREATE USER bus_user WITH SUPERUSER PASSWORD 'bus_password';" && \
    sudo -u postgres createdb -O bus_user bus_tracking && \
    sudo -u postgres psql -d bus_tracking -f /tmp/init.sql && \
    service postgresql stop

# Configure Nginx
RUN echo 'server { \
    listen 80; \
    server_name _; \
    location / { \
        root /app/frontend; \
        try_files $uri $uri/ /live-tracker.html; \
        index live-tracker.html index.html; \
    } \
    location ~ ^/(auth|admin|buses|routes|live|docs|openapi\.json) { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    } \
    location /ws { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
    } \
}' > /etc/nginx/sites-available/bus-tracking && \
    rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/bus-tracking /etc/nginx/sites-enabled/

# Configure Supervisor
RUN echo '[supervisord] \n\
nodaemon=true \n\
user=root \n\
\n\
[program:postgresql] \n\
command=/usr/lib/postgresql/*/bin/postgres -D /var/lib/postgresql/*/main -c config_file=/etc/postgresql/*/main/postgresql.conf \n\
user=postgres \n\
autorestart=true \n\
redirect_stderr=true \n\
\n\
[program:fastapi] \n\
command=/usr/local/bin/uvicorn main:app --host 127.0.0.1 --port 8000 \n\
directory=/app \n\
user=root \n\
autorestart=true \n\
redirect_stderr=true \n\
\n\
[program:nginx] \n\
command=/usr/sbin/nginx -g "daemon off;" \n\
autorestart=true \n\
redirect_stderr=true' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash \n\
set -e \n\
echo "Starting Bus Tracking System..." \n\
\n\
# Start PostgreSQL \n\
service postgresql start \n\
\n\
# Wait for PostgreSQL \n\
until sudo -u postgres psql -c "\\q"; do \n\
  echo "Waiting for PostgreSQL..." \n\
  sleep 1 \n\
done \n\
\n\
echo "PostgreSQL is ready" \n\
\n\
# Start supervisor to manage all services \n\
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh && \
    chmod +x /app/start.sh

# Create health check
RUN echo '#!/bin/bash \n\
curl -f http://localhost/docs > /dev/null 2>&1 && \n\
curl -f http://localhost:8000/live/buses > /dev/null 2>&1 && \n\
sudo -u postgres psql -d bus_tracking -c "SELECT 1" > /dev/null 2>&1' > /app/health_check.sh && \
    chmod +x /app/health_check.sh

# Expose ports
EXPOSE 80 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD /app/health_check.sh

# Start the application
CMD ["/app/start.sh"]