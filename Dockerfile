# Multi-stage Dockerfile for College Bus Tracking System - EC2 Optimized
# Stage 1: Build React Native Web App
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Install Expo CLI and build web version
RUN npm install -g @expo/cli
RUN npx expo install --fix
RUN npx expo export:web

# Stage 2: Setup Python Backend and Serve
FROM python:3.11-slim

# Install system dependencies for EC2
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    vim \
    htop \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy backend requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist /var/www/html

# Create nginx configuration
RUN echo 'server { \n\
    listen 80; \n\
    server_name localhost; \n\
    \n\
    # Serve React Native web app \n\
    location / { \n\
        root /var/www/html; \n\
        try_files $uri $uri/ /index.html; \n\
        add_header Cache-Control "no-cache"; \n\
    } \n\
    \n\
    # Proxy API requests to FastAPI \n\
    location /api/ { \n\
        proxy_pass http://localhost:8000/; \n\
        proxy_set_header Host $host; \n\
        proxy_set_header X-Real-IP $remote_addr; \n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n\
        proxy_set_header X-Forwarded-Proto $scheme; \n\
    } \n\
    \n\
    # Direct API access (for development) \n\
    location ~ ^/(buses|routes|dashboard|docs|openapi.json) { \n\
        proxy_pass http://localhost:8000; \n\
        proxy_set_header Host $host; \n\
        proxy_set_header X-Real-IP $remote_addr; \n\
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n\
        proxy_set_header X-Forwarded-Proto $scheme; \n\
    } \n\
}' > /etc/nginx/sites-available/default

# Create supervisor configuration
RUN echo '[supervisord] \n\
nodaemon=true \n\
\n\
[program:nginx] \n\
command=nginx -g "daemon off;" \n\
autostart=true \n\
autorestart=true \n\
stderr_logfile=/var/log/nginx.err.log \n\
stdout_logfile=/var/log/nginx.out.log \n\
\n\
[program:fastapi] \n\
command=python -m uvicorn main:app --host 0.0.0.0 --port 8000 \n\
directory=/app/backend \n\
autostart=true \n\
autorestart=true \n\
stderr_logfile=/var/log/fastapi.err.log \n\
stdout_logfile=/var/log/fastapi.out.log' > /etc/supervisor/conf.d/supervisord.conf

# Create startup script
RUN echo '#!/bin/bash \n\
set -e \n\
\n\
echo "Starting College Bus Tracking System..." \n\
\n\
# Initialize database and sample data \n\
cd /app/backend \n\
python -c "from database import Base, engine; Base.metadata.create_all(bind=engine)" \n\
python seed_data.py \n\
\n\
echo "Database initialized with sample data" \n\
echo "Starting services..." \n\
echo "Frontend available at: http://localhost" \n\
echo "API docs available at: http://localhost/docs" \n\
echo "Direct API access at: http://localhost:8000" \n\
\n\
# Start supervisor to manage nginx and fastapi \n\
exec supervisord -c /etc/supervisor/conf.d/supervisord.conf' > /app/start.sh

# Make startup script executable
RUN chmod +x /app/start.sh

# Expose ports 80 and 8000
EXPOSE 80 8000

# Add non-root user for security
RUN useradd -m -s /bin/bash busapp
RUN chown -R busapp:busapp /app /var/www/html

# Health check for EC2 load balancer
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/docs || exit 1

# Start the application
CMD ["/app/start.sh"]