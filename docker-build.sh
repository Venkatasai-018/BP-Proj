#!/bin/bash
# Simple Docker Build and Run Script

echo "🚌 Bus Tracking System - Docker Build & Deploy"
echo "=============================================="

# Build the image
echo "🏗️  Building Docker image..."
docker build -t bus-tracking:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Stop and remove existing container
echo "🛑 Stopping existing container..."
docker stop bus-tracking 2>/dev/null || true
docker rm bus-tracking 2>/dev/null || true

# Run new container
echo "🚀 Starting Bus Tracking System..."
docker run -d \
    --name bus-tracking \
    --restart unless-stopped \
    -p 80:80 \
    -p 8000:8000 \
    -v bus_data:/var/lib/postgresql \
    -e SECRET_KEY="production-secret-key-$(date +%s)" \
    -e ACCESS_TOKEN_EXPIRE_MINUTES="60" \
    bus-tracking:latest

if [ $? -eq 0 ]; then
    echo "✅ Container started successfully!"
    
    # Wait and check
    echo "⏳ Waiting for services to initialize..."
    sleep 20
    
    echo ""
    echo "📍 Your application is available at:"
    echo "   - Main App: http://localhost/"
    echo "   - API Docs: http://localhost:8000/docs"
    echo "   - Admin: http://localhost/admin"
    echo ""
    echo "🔑 Default Admin Login:"
    echo "   Username: admin"
    echo "   Password: secret"
    echo ""
    echo "🔧 Useful commands:"
    echo "   - View logs: docker logs bus-tracking"
    echo "   - Restart: docker restart bus-tracking"
    echo "   - Stop: docker stop bus-tracking"
    
else
    echo "❌ Failed to start container!"
    exit 1
fi