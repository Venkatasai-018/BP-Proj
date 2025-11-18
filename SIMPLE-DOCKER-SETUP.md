# Simple Docker Deployment for College Bus Tracking System

## One-Command Setup

After cloning the repository on your server/EC2:

```bash
# Navigate to project directory
cd BP-Proj

# Build and run the application
docker build -t bus-tracker .
docker run -d -p 80:80 --name bus-tracker-app bus-tracker
```

## Access Your Application

Once the container is running:
- **Web Application**: `http://YOUR-SERVER-IP`
- **API Documentation**: `http://YOUR-SERVER-IP/docs`

## Management Commands

```bash
# Check if container is running
docker ps

# View logs
docker logs bus-tracker-app

# Stop the application
docker stop bus-tracker-app

# Start the application
docker start bus-tracker-app

# Remove container (to rebuild)
docker rm -f bus-tracker-app

# Rebuild and restart
docker build -t bus-tracker .
docker run -d -p 80:80 --name bus-tracker-app bus-tracker
```

## For EC2 Users

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Venkatasai-018/BP-Proj.git
   cd BP-Proj
   ```

2. **Install Docker** (if not installed):
   ```bash
   sudo apt update
   sudo apt install -y docker.io
   sudo systemctl enable docker
   sudo systemctl start docker
   sudo usermod -aG docker $USER
   # Log out and log back in
   ```

3. **Build and run**:
   ```bash
   docker build -t bus-tracker .
   docker run -d -p 80:80 --name bus-tracker-app bus-tracker
   ```

4. **Configure Security Group** (AWS EC2):
   - Allow inbound traffic on port 80 (HTTP)

5. **Access your application**:
   - Get your EC2 public IP and visit: `http://YOUR-EC2-PUBLIC-IP`

## Troubleshooting

- **Container won't start**: Check logs with `docker logs bus-tracker-app`
- **Can't access website**: Ensure port 80 is open in your firewall/security group
- **API not working**: Check if both nginx and FastAPI are running inside the container

## What This Dockerfile Does

1. **Builds the React Native web app** using Expo
2. **Sets up Python FastAPI backend** with sample data
3. **Configures Nginx** to serve the frontend and proxy API requests
4. **Runs everything in one container** on port 80
5. **Automatically initializes** the database with sample bus data

Your College Bus Tracking System will be fully operational with a single Docker command!