@echo off
echo Starting Campus Event Management System...

REM Start MongoDB (if not already running)
echo Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"

REM Wait a moment for MongoDB to start
timeout /t 3 /nobreak >nul

REM Start Backend Server
echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo All servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
