# Start Backend Server Script
# Quick script to start the FastAPI backend server

Write-Host "🚀 Starting Real-time Bus Tracking Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "backend"

# Check if database exists
if (-not (Test-Path "bus_tracking.db")) {
    Write-Host "⚠️ Database not found. Running initialization..." -ForegroundColor Yellow
    & ..\setup-manual.ps1
}

Write-Host "🔥 Starting FastAPI server..." -ForegroundColor Cyan
Write-Host "📱 Backend API will be available at: http://localhost:8000" -ForegroundColor Green
Write-Host "🔗 API Documentation: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "🔐 Admin login: admin / admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Gray

# Start the server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Return to parent directory when done
Set-Location ".."