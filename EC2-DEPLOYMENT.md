# EC2 Deployment Guide for College Bus Tracking System

## Prerequisites

- AWS EC2 instance (t2.micro or larger recommended)
- Ubuntu 20.04 LTS or newer
- Security group allowing ports 22 (SSH), 80 (HTTP), and 8000 (API)
- At least 1GB RAM and 8GB storage

## Quick Deployment (Method 1: Automated Script)

1. **Launch EC2 Instance**
   ```bash
   # Connect to your EC2 instance
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

2. **Copy Project Files**
   ```bash
   # Option A: Use SCP to copy files from local machine
   scp -i your-key.pem -r /local/path/to/BP-Proj ubuntu@your-ec2-ip:/home/ubuntu/

   # Option B: Use Git (if repository is public)
   git clone https://github.com/your-username/BP-Proj.git
   cd BP-Proj
   ```

3. **Run Deployment Script**
   ```bash
   chmod +x deploy-ec2.sh
   ./deploy-ec2.sh
   ```

4. **Build and Start Application**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

## Manual Deployment (Method 2: Step by Step)

### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 2: Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Step 3: Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Step 4: Deploy Application
```bash
# Navigate to project directory
cd /path/to/BP-Proj

# Build and start
docker-compose up -d --build
```

## Access Your Application

After deployment, your application will be available at:
- **Frontend**: `http://YOUR-EC2-PUBLIC-IP`
- **API Documentation**: `http://YOUR-EC2-PUBLIC-IP/docs`
- **Direct API**: `http://YOUR-EC2-PUBLIC-IP:8000`

## AWS Security Group Configuration

Configure your EC2 security group with these rules:

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | Your IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web interface |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | API access |

## Management Commands

### Start/Stop Services
```bash
# Start
sudo systemctl start bus-tracker
# or
docker-compose -f docker-compose.prod.yml up -d

# Stop
sudo systemctl stop bus-tracker
# or
docker-compose -f docker-compose.prod.yml down

# Restart
sudo systemctl restart bus-tracker
```

### Monitor Application
```bash
# Check status
./monitor.sh

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container status
docker ps
```

### Backup Database
```bash
# Create backup
./backup.sh

# View backups
ls -la /home/ubuntu/backups/
```

## Troubleshooting

### Common Issues

1. **Port 80 Access Denied**
   ```bash
   sudo netstat -tlnp | grep :80
   sudo fuser -k 80/tcp
   ```

2. **Docker Permission Issues**
   ```bash
   sudo usermod -aG docker $USER
   # Logout and login again
   ```

3. **Application Not Starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs

   # Rebuild if needed
   docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
   ```

4. **Database Issues**
   ```bash
   # Reset database
   docker-compose -f docker-compose.prod.yml down
   docker volume rm bus-tracker_bus_data
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Performance Optimization

1. **For t2.micro instances**:
   ```bash
   # Add swap space
   sudo fallocate -l 1G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

2. **Monitor resources**:
   ```bash
   # CPU and memory usage
   htop

   # Disk usage
   df -h

   # Docker stats
   docker stats
   ```

## Production Considerations

### SSL/HTTPS Setup (Optional)
```bash
# Install Certbot for Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Backup Automation
```bash
# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/ubuntu/bus-tracker/backup.sh
```

### Monitoring Setup
```bash
# Add monitoring to crontab
crontab -e
# Add: */5 * * * * /home/ubuntu/bus-tracker/monitor.sh >> /home/ubuntu/bus-tracker/logs/monitor.log
```

## Scaling Options

### Horizontal Scaling
- Use Application Load Balancer
- Multiple EC2 instances
- Shared database (RDS)

### Vertical Scaling
- Upgrade to larger EC2 instance type
- Add more RAM/CPU as needed

## Cost Optimization

1. **Use t2.micro for development** (free tier eligible)
2. **Schedule instance start/stop** for non-production
3. **Use reserved instances** for production workloads
4. **Monitor with AWS CloudWatch** for cost alerts

## Support

For issues specific to EC2 deployment:
1. Check EC2 system logs: `sudo journalctl -u bus-tracker`
2. Review application logs: `docker-compose logs`
3. Monitor system resources: `./monitor.sh`
4. Check AWS CloudWatch metrics

Your College Bus Tracking System is now ready to serve students and staff with real-time bus location information!