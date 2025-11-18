# Bus Tracking System - Deployment Check
Write-Host "Bus Tracking System - Deployment Check" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Check if Docker is available
try {
    docker --version | Out-Null
    Write-Host "Docker is available" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "Docker Deployment Options:" -ForegroundColor Yellow
    Write-Host "1. Test build only: .\test-docker.ps1" -ForegroundColor White
    Write-Host "2. Build and run locally: .\docker-build.ps1" -ForegroundColor White
    Write-Host "3. EC2 deployment: Use deploy-ec2.sh on Linux" -ForegroundColor White
    
} catch {
    Write-Host "Docker is not available" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Manual Setup" -ForegroundColor Yellow
    Write-Host "1. Install dependencies: .\setup-manual.ps1" -ForegroundColor White
    Write-Host "2. Start backend: .\start-backend.ps1" -ForegroundColor White
    Write-Host "3. Open frontend: Open frontend/live-tracker.html in browser" -ForegroundColor White
    Write-Host ""
    Write-Host "To install Docker:" -ForegroundColor Cyan
    Write-Host "Download Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor White
}

Write-Host ""
Write-Host "System Requirements Check:" -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python: Not found" -ForegroundColor Red
}

# Check if backend files exist
if (Test-Path "backend/main.py") {
    Write-Host "Backend files: Present" -ForegroundColor Green
} else {
    Write-Host "Backend files: Missing" -ForegroundColor Red
}

# Check if frontend files exist
if (Test-Path "frontend/live-tracker.html") {
    Write-Host "Frontend files: Present" -ForegroundColor Green
} else {
    Write-Host "Frontend files: Missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "Ready to deploy!" -ForegroundColor Green