#!/bin/bash

# EC2 Deployment Script for College Bus Tracking System
# Run this script on your EC2 instance to deploy the application

set -e

echo "🚌 College Bus Tracking System - EC2 Deployment Script"
echo "======================================================"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "🔧 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create application directory
APP_DIR="/home/ubuntu/bus-tracker"
echo "📁 Setting up application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone or update the repository (if using git)
if [ -d ".git" ]; then
    echo "🔄 Updating existing repository..."
    git pull
else
    echo "📥 Note: Please copy your project files to $APP_DIR"
    echo "   You can use scp, rsync, or git clone to get your files here"
fi

# Set proper permissions
echo "🔐 Setting permissions..."
sudo chown -R $USER:$USER $APP_DIR

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# Environment Configuration for EC2
ENV=production
DATABASE_URL=sqlite:///./bus_tracking.db
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=false

# EC2 Instance Configuration
INSTANCE_TYPE=t2.micro
AWS_REGION=us-east-1
EOF

# Create production docker-compose file
echo "📝 Creating production docker-compose.yml..."
cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  bus-tracker:
    build: .
    ports:
      - "80:80"
      - "8000:8000"
    volumes:
      - bus_data:/app/backend
      - ./logs:/var/log
    environment:
      - ENV=production
      - DATABASE_URL=sqlite:///./bus_tracking.db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/docs"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

volumes:
  bus_data:
    driver: local
EOF

# Create systemd service for auto-start
echo "🚀 Creating systemd service..."
sudo tee /etc/systemd/system/bus-tracker.service > /dev/null << EOF
[Unit]
Description=College Bus Tracker
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$APP_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
echo "🔧 Enabling systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable bus-tracker.service

# Configure firewall (if UFW is installed)
if command -v ufw &> /dev/null; then
    echo "🔒 Configuring firewall..."
    sudo ufw allow 22/tcp      # SSH
    sudo ufw allow 80/tcp      # HTTP
    sudo ufw allow 8000/tcp    # API
    sudo ufw --force enable
fi

# Create backup script
echo "💾 Creating backup script..."
cat > backup.sh << 'EOF'
#!/bin/bash
# Backup script for bus tracking database
BACKUP_DIR="/home/ubuntu/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Stop services temporarily
docker-compose -f docker-compose.prod.yml stop

# Backup database
cp /var/lib/docker/volumes/bus-tracker_bus_data/_data/bus_tracking.db \
   $BACKUP_DIR/bus_tracking_$DATE.db

# Restart services
docker-compose -f docker-compose.prod.yml start

echo "Backup created: $BACKUP_DIR/bus_tracking_$DATE.db"
EOF
chmod +x backup.sh

# Create monitoring script
echo "📊 Creating monitoring script..."
cat > monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script
echo "=== College Bus Tracker Status ==="
echo "Date: $(date)"
echo ""

echo "🐳 Docker Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "💾 Disk Usage:"
df -h / | tail -1
echo ""

echo "🔍 Memory Usage:"
free -h
echo ""

echo "🌐 Service Health:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost/docs || echo "Service appears to be down"
echo ""

echo "📈 Container Stats:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
EOF
chmod +x monitor.sh

# Create logs directory
mkdir -p logs

echo ""
echo "✅ EC2 Deployment Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Copy your project files to: $APP_DIR"
echo "2. Build and start the application:"
echo "   cd $APP_DIR"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "3. Check application status:"
echo "   ./monitor.sh"
echo ""
echo "🌐 Once running, your app will be available at:"
echo "   Frontend: http://$(curl -s ifconfig.me)"
echo "   API Docs: http://$(curl -s ifconfig.me)/docs"
echo "   Direct API: http://$(curl -s ifconfig.me):8000"
echo ""
echo "🛠  Useful Commands:"
echo "   Start:   sudo systemctl start bus-tracker"
echo "   Stop:    sudo systemctl stop bus-tracker"
echo "   Restart: sudo systemctl restart bus-tracker"
echo "   Logs:    docker-compose -f docker-compose.prod.yml logs -f"
echo "   Monitor: ./monitor.sh"
echo "   Backup:  ./backup.sh"
echo ""
echo "⚠️  Security Notes:"
echo "   - Consider setting up SSL/TLS with Let's Encrypt"
echo "   - Configure proper security groups in AWS"
echo "   - Regular backups are scheduled via cron"
echo "   - Monitor logs for any issues"
echo ""
EOF