# Windows PowerShell - Docker Build and Deploy Script
Write-Host "🚌 Bus Tracking System - Docker Build & Deploy" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verify required files exist
$requiredFiles = @("Dockerfile", "docker-configs\start.sh", "docker-configs\nginx.conf", "backend\main.py", "init.sql")
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Required file missing: $file" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ All required files present" -ForegroundColor Green

# Build the image
Write-Host "🏗️  Building Docker image..." -ForegroundColor Yellow
docker build -t bus-tracking:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "Check the output above for error details." -ForegroundColor Yellow
    exit 1
}

# Stop and remove existing container
Write-Host "🛑 Stopping existing container..." -ForegroundColor Yellow
docker stop bus-tracking 2>$null
docker rm bus-tracking 2>$null

# Run new container
Write-Host "🚀 Starting Bus Tracking System..." -ForegroundColor Yellow
$secretKey = "production-secret-key-$(Get-Date -Format 'yyyyMMddHHmmss')"

docker run -d `
    --name bus-tracking `
    --restart unless-stopped `
    -p 80:80 `
    -p 8000:8000 `
    -v bus_data:/var/lib/postgresql `
    -e SECRET_KEY="$secretKey" `
    -e ACCESS_TOKEN_EXPIRE_MINUTES="60" `
    -e DATABASE_URL="postgresql://bus_user:bus_password@localhost:5432/bus_tracking" `
    bus-tracking:latest

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container started successfully!" -ForegroundColor Green
    
    # Wait and check
    Write-Host "⏳ Waiting for services to initialize (60 seconds)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
    
    # Check container status
    $containerStatus = docker ps --filter "name=bus-tracking" --format "{{.Status}}"
    if ($containerStatus) {
        Write-Host "✅ Container is running: $containerStatus" -ForegroundColor Green
        
        # Test health check
        Write-Host "🔍 Testing application health..." -ForegroundColor Yellow
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000/docs" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend API is responding" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Backend API check failed - may still be starting" -ForegroundColor Yellow
        }
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost/" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Frontend is accessible" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Frontend check failed - may still be starting" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Container may not be running properly" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📍 Your application is available at:" -ForegroundColor Cyan
    Write-Host "   - Live Tracking: http://localhost/" -ForegroundColor White
    Write-Host "   - API Docs: http://localhost:8000/docs" -ForegroundColor White
    Write-Host "   - Admin Panel: http://localhost/admin" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Default Admin Login:" -ForegroundColor Cyan
    Write-Host "   Username: admin" -ForegroundColor White
    Write-Host "   Password: secret" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Useful commands:" -ForegroundColor Cyan
    Write-Host "   - View logs: docker logs bus-tracking" -ForegroundColor White
    Write-Host "   - Follow logs: docker logs bus-tracking -f" -ForegroundColor White
    Write-Host "   - Restart: docker restart bus-tracking" -ForegroundColor White
    Write-Host "   - Stop: docker stop bus-tracking" -ForegroundColor White
    Write-Host "   - Shell access: docker exec -it bus-tracking /bin/bash" -ForegroundColor White
    
} else {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
    Write-Host "Check Docker logs for details: docker logs bus-tracking" -ForegroundColor Yellow
    exit 1
}