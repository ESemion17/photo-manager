@echo off
echo Starting Photo Manager...

start "Backend" cmd /k "cd backend\PhotoManager.API && dotnet run --urls http://localhost:5000"
timeout /t 3 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
