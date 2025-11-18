# Quick Docker Test
Write-Host "Testing Docker build for Bus Tracking System" -ForegroundColor Cyan

# Check if in correct directory
if (!(Test-Path "Dockerfile")) {
    Write-Host "Dockerfile not found. Please run from the project root directory." -ForegroundColor Red
    exit 1
}

# Test build
Write-Host "Testing Docker build..." -ForegroundColor Yellow
docker build -t bus-tracking-test:latest . --no-cache

if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker build successful!" -ForegroundColor Green
    
    Write-Host "Image size:" -ForegroundColor Cyan
    docker images bus-tracking-test:latest
    
    Write-Host ""
    Write-Host "Ready for deployment! Use:" -ForegroundColor Green
    Write-Host "   .\docker-build.ps1      (for local testing)" -ForegroundColor White
    Write-Host "   ./deploy-ec2.sh         (for EC2 deployment)" -ForegroundColor White
} else {
    Write-Host "Docker build failed!" -ForegroundColor Red
    Write-Host "Check the Dockerfile and ensure all files are present." -ForegroundColor Yellow
}

# Cleanup test image
docker rmi bus-tracking-test:latest 2>$null