# Build and Run Script for Real-time Bus Tracking Application
# This script builds the Docker image and runs the container

# Build the Docker image
Write-Host "🔨 Building Docker image..." -ForegroundColor Green
docker build -t bus-tracking-app .

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker image built successfully!" -ForegroundColor Green
    
    # Stop any existing container
    Write-Host "🛑 Stopping any existing container..." -ForegroundColor Yellow
    docker stop bus-tracking-container 2>$null
    docker rm bus-tracking-container 2>$null
    
    # Run the new container
    Write-Host "🚀 Starting application container..." -ForegroundColor Green
    docker run -d `
        --name bus-tracking-container `
        -p 80:80 `
        -p 8000:8000 `
        -v "${PWD}/data:/app/backend" `
        bus-tracking-app
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Application is now running!" -ForegroundColor Green
        Write-Host "📱 Frontend: http://localhost" -ForegroundColor Cyan
        Write-Host "🔗 API Docs: http://localhost/docs" -ForegroundColor Cyan
        Write-Host "🔐 Admin Login: admin / admin123" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To view logs: docker logs -f bus-tracking-container" -ForegroundColor Gray
        Write-Host "To stop: docker stop bus-tracking-container" -ForegroundColor Gray
    } else {
        Write-Host "❌ Failed to start container" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}