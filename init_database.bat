@echo off
echo Initializing TCE EduRide Database...
echo.

cd backend
call .venv\Scripts\activate

echo Running database initialization...
python -m app.init_db

echo.
echo Database setup complete!
echo You can now start the server with: python -m uvicorn app.main:app --reload
pause
