FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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
RUN echo 'server {\n\
    listen 80;\n\
    location / {\n\
        root /app/static;\n\
        try_files $uri $uri/ /live-tracker.html;\n\
        index live-tracker.html;\n\
    }\n\
    location /api/ {\n\
        proxy_pass http://127.0.0.1:8000/;\n\
    }\n\
    location ~ ^/(docs|openapi.json|auth|admin|buses|routes|live) {\n\
        proxy_pass http://127.0.0.1:8000;\n\
    }\n\
    location /ws {\n\
        proxy_pass http://127.0.0.1:8000;\n\
        proxy_http_version 1.1;\n\
        proxy_set_header Upgrade $http_upgrade;\n\
        proxy_set_header Connection "upgrade";\n\
    }\n\
}' > /etc/nginx/sites-available/default

# Configure Supervisor
RUN echo '[supervisord]\n\
nodaemon=true\n\
\n\
[program:postgres]\n\
command=/usr/lib/postgresql/13/bin/postgres -D /var/lib/postgresql/13/main -c config_file=/etc/postgresql/13/main/postgresql.conf\n\
user=postgres\n\
autorestart=true\n\
\n\
[program:fastapi]\n\
command=uvicorn main:app --host 127.0.0.1 --port 8000\n\
directory=/app\n\
autorestart=true\n\
environment=DATABASE_URL="postgresql://bus_user:bus_password@localhost:5432/bus_tracking"\n\
\n\
[program:nginx]\n\
command=nginx -g "daemon off;"\n\
autorestart=true\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash\n\
service postgresql start\n\
sleep 5\n\
supervisord -c /etc/supervisor/conf.d/supervisord.conf\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 80 8000

# Set environment variables
ENV DATABASE_URL="postgresql://bus_user:bus_password@localhost:5432/bus_tracking"
ENV SECRET_KEY="your-secret-key-change-in-production"

# Start the application
CMD ["/app/start.sh"]