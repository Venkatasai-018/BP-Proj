# Single Dockerfile for College Bus Tracking System
# Builds and runs both frontend and backend in one container

FROM node:18-alpine as frontend-builder

# Build React Native Web App
WORKDIR /app/frontend
COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm install -g @expo/cli
RUN npx expo export:web

# Main container with Python backend and nginx
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Create nginx configuration that serves frontend and proxies API
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /var/www/html; \
    index index.html; \
    \
    # Serve frontend files \
    location / { \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-store, no-cache, must-revalidate"; \
    } \
    \
    # Proxy API requests to FastAPI backend \
    location /api/ { \
        proxy_pass http://127.0.0.1:8000/; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Direct API access for documentation and endpoints \
    location ~ ^/(buses|routes|dashboard|docs|openapi.json|redoc) { \
        proxy_pass http://127.0.0.1:8000; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/sites-available/default

# Create supervisor configuration to run both services
RUN echo '[supervisord] \
nodaemon=true \
pidfile=/tmp/supervisord.pid \
logfile=/tmp/supervisord.log \
\
[program:nginx] \
command=nginx -g "daemon off;" \
autostart=true \
autorestart=true \
priority=10 \
stdout_logfile=/dev/stdout \
stdout_logfile_maxbytes=0 \
stderr_logfile=/dev/stderr \
stderr_logfile_maxbytes=0 \
\
[program:fastapi] \
command=gunicorn main:app -w 2 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000 --timeout 120 \
directory=/app \
autostart=true \
autorestart=true \
priority=20 \
stdout_logfile=/dev/stdout \
stdout_logfile_maxbytes=0 \
stderr_logfile=/dev/stderr \
stderr_logfile_maxbytes=0' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash \
set -e \
echo "🚌 Starting College Bus Tracking System..." \
echo "Initializing database..." \
cd /app \
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)" || true \
python seed_data.py || true \
echo "✅ Database initialized" \
echo "🌐 Starting web services..." \
echo "📍 Application will be available at: http://localhost" \
echo "📚 API documentation at: http://localhost/docs" \
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh

# Make startup script executable
RUN chmod +x /app/start.sh

# Expose only port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/docs || exit 1

# Start the application
CMD ["/app/start.sh"]