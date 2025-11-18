# EC2 Post-Clone Setup Instructions

## After cloning the repository on your EC2 instance, follow these steps:

### Step 1: Navigate to Project Directory
```bash
cd BP-Proj
```

### Step 2: Make Deployment Script Executable
```bash
chmod +x deploy-ec2.sh
```

### Step 3: Run the Deployment Script
```bash
./deploy-ec2.sh
```
**Note**: This script will:
- Install Docker and Docker Compose
- Set up necessary system configurations
- Create production files
- Configure firewall and services

### Step 4: Log Out and Log Back In
```bash
exit
# Then SSH back into your instance
ssh -i your-key.pem ubuntu@your-ec2-public-ip
cd BP-Proj
```
**Why?**: This is needed for Docker group permissions to take effect.

### Step 5: Build and Start the Application
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

### Step 6: Verify Everything is Running
```bash
# Check container status
docker ps

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test the application
curl http://localhost/docs
```

### Step 7: Get Your Public IP and Access the App
```bash
# Get your EC2 public IP
curl -s ifconfig.me
```

Then access your application at:
- **Frontend**: `http://YOUR-EC2-PUBLIC-IP`
- **API Docs**: `http://YOUR-EC2-PUBLIC-IP/docs`
- **Direct API**: `http://YOUR-EC2-PUBLIC-IP:8000`

## Quick Commands Summary

```bash
# Complete setup in one go:
cd BP-Proj
chmod +x deploy-ec2.sh
./deploy-ec2.sh
exit

# After logging back in:
cd BP-Proj
docker-compose -f docker-compose.prod.yml up -d --build

# Check status:
docker ps
curl http://localhost/docs
```

## If You Encounter Issues

1. **Docker permission denied**:
   ```bash
   sudo usermod -aG docker $USER
   exit  # Then log back in
   ```

2. **Port already in use**:
   ```bash
   sudo netstat -tlnp | grep :80
   sudo fuser -k 80/tcp
   ```

3. **Build fails**:
   ```bash
   # Clean and rebuild
   docker-compose -f docker-compose.prod.yml down
   docker system prune -a
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

4. **Check application logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs -f
   ```

## Optional: Enable Auto-Start on Boot
```bash
sudo systemctl enable bus-tracker
sudo systemctl start bus-tracker
```

Your College Bus Tracking System will be fully operational after these steps!