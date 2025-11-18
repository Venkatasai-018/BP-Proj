#!/bin/bash
# EC2 Deployment Script for Bus Tracking System

set -e

echo "🚀 Starting EC2 deployment for Bus Tracking System..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    
    # Install Docker
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    echo "✅ Docker installed successfully"
fi

# Clone or update repository
REPO_DIR="/home/$(whoami)/bus-tracking"
if [ -d "$REPO_DIR" ]; then
    echo "📁 Updating existing repository..."
    cd "$REPO_DIR"
    git pull
else
    echo "📥 Cloning repository..."
    git clone https://github.com/Venkatasai-018/BP-Proj.git "$REPO_DIR"
    cd "$REPO_DIR"
fi

# Stop existing containers if running
echo "🛑 Stopping existing containers..."
docker stop bus-tracking 2>/dev/null || true
docker rm bus-tracking 2>/dev/null || true

# Build the Docker image
echo "🏗️  Building Docker image..."
docker build -t bus-tracking:latest .

# Run the container
echo "🚀 Starting Bus Tracking System..."
docker run -d \
    --name bus-tracking \
    --restart unless-stopped \
    -p 80:80 \
    -p 8000:8000 \
    -v bus_data:/var/lib/postgresql \
    -e SECRET_KEY="$(openssl rand -hex 32)" \
    -e ACCESS_TOKEN_EXPIRE_MINUTES="60" \
    bus-tracking:latest

# Wait for container to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost/docs > /dev/null 2>&1; then
    echo "✅ Backend API is running"
else
    echo "❌ Backend API is not responding"
fi

if curl -f http://localhost/ > /dev/null 2>&1; then
    echo "✅ Frontend is accessible"
else
    echo "❌ Frontend is not accessible"
fi

# Get public IP
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com/ || echo "Unable to get public IP")

echo ""
echo "🎉 Deployment completed!"
echo "📍 Access your application at:"
echo "   - Live Tracking: http://$PUBLIC_IP/"
echo "   - Admin Panel: http://$PUBLIC_IP/admin"
echo "   - API Docs: http://$PUBLIC_IP:8000/docs"
echo ""
echo "🔑 Default login credentials:"
echo "   Username: admin"
echo "   Password: secret"
echo "   Email: admin@college.edu"
echo ""
echo "🔧 Management commands:"
echo "   - View logs: docker logs bus-tracking"
echo "   - Restart: docker restart bus-tracking"
echo "   - Stop: docker stop bus-tracking"
echo ""
echo "⚠️  Security reminder:"
echo "   - Change default admin password immediately"
echo "   - Configure SSL/HTTPS for production"
echo "   - Set up regular backups"
echo ""

# Show container status
echo "📊 Container status:"
docker ps | grep bus-tracking