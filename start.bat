@echo off
echo ============================================
echo   Starting FastOJ IDE
echo ============================================
echo.

REM Check if Redis is running
docker ps | findstr fastoj-redis >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Redis container...
    docker start fastoj-redis >nul 2>&1
    if %errorlevel% neq 0 (
        echo Creating new Redis container...
        docker run -d --name fastoj-redis -p 6379:6379 redis:7-alpine >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo [OK] Redis is running

echo.
echo Starting Worker and Dev Server...
echo Worker running in background...
echo.

REM Start worker in background (minimized, no new window)
start /B /MIN cmd /c "set REDIS_URL=redis://localhost:6379 && npm run worker" >nul 2>&1

REM Wait a moment for worker to start
timeout /t 3 /nobreak >nul

echo ============================================
echo   FastOJ IDE Started!
echo   Worker: Running in background
echo   Server: Starting below...
echo   URL: http://localhost:3000
echo ============================================
echo.
echo Press Ctrl+C to stop (worker will continue)
echo To stop worker: taskkill /F /IM node.exe
echo.

REM Set Redis URL and start dev server
set REDIS_URL=redis://localhost:6379
npm run dev
