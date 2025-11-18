# Manual Setup Script for Real-time Bus Tracking Application
# Run this if Docker is not available

Write-Host "🚀 Setting up Real-time Bus Tracking Application..." -ForegroundColor Green

# Check if Python is installed
try {
    $pythonVersion = python --version
    Write-Host "✅ Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.11 or higher" -ForegroundColor Red
    Write-Host "Download from: https://www.python.org/downloads/" -ForegroundColor Cyan
    exit 1
}

# Navigate to backend directory
Set-Location "backend"

Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow

# Initialize database
python -c @"
import sys
sys.path.append('.')

try:
    from database import engine, Base
    Base.metadata.create_all(bind=engine)
    print('✅ Database tables created successfully!')
    
    # Create default admin user
    from sqlalchemy.orm import sessionmaker
    from database import User
    from auth import auth_manager
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if admin exists
    admin_user = db.query(User).filter(User.username == 'admin').first()
    if not admin_user:
        hashed_password = auth_manager.get_password_hash('admin123')
        admin_user = User(
            username='admin',
            email='admin@college.edu',
            full_name='System Administrator',
            hashed_password=hashed_password,
            role='super_admin',
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print('✅ Default admin user created (admin/admin123)')
    else:
        print('✅ Admin user already exists')
    
    db.close()
    
except Exception as e:
    print(f'❌ Database initialization error: {e}')
    sys.exit(1)
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database initialized successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Database initialization failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application:" -ForegroundColor Cyan
Write-Host "  1. Backend API: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload" -ForegroundColor Gray
Write-Host "  2. Open frontend: Open ../frontend/live-tracker.html in your browser" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Default admin credentials:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "📱 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: file:///[PATH]/frontend/live-tracker.html" -ForegroundColor Gray
Write-Host "   API Docs: http://localhost:8000/docs" -ForegroundColor Gray
Write-Host "   API Base: http://localhost:8000" -ForegroundColor Gray

# Return to parent directory
Set-Location ".."