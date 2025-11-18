# EC2 Docker Cleanup and Deployment Commands

## Step 1: Clean up all Docker containers and images on EC2

```bash
# Stop all running containers
docker stop $(docker ps -aq) 2>/dev/null || true

# Remove all containers
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove all images
docker rmi $(docker images -q) 2>/dev/null || true

# Clean up system
docker system prune -af
```

## Step 2: Build and run the fixed container

```bash
# Navigate to your project directory
cd BP-Proj

# Build using the fixed Dockerfile
docker build -f Dockerfile.fixed -t bus-tracker-fixed .

# Run the container
docker run -d -p 80:80 --name bus-tracker-app bus-tracker-fixed

# Check if it's running
docker ps

# Check logs
docker logs -f bus-tracker-app
```

## Step 3: Test the application

```bash
# Test API endpoint
curl http://localhost/docs

# Check container status
docker logs bus-tracker-app | tail -20
```

## If you still get errors:

```bash
# Get more detailed logs
docker logs bus-tracker-app

# Get into the container to debug
docker exec -it bus-tracker-app /bin/bash

# Inside container, check files
ls -la /app
python -c "import sys; print(sys.path)"
```

## Access your application

Once running successfully:
- **Web Interface**: `http://YOUR-EC2-PUBLIC-IP`
- **API Documentation**: `http://YOUR-EC2-PUBLIC-IP/docs`

The fixed Dockerfile addresses the import path issues and provides better error handling.