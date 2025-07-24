@echo off
title Campus Textbook Trading Platform
rem Get script directory
set "SCRIPT_DIR=%~dp0"
echo Project path: %SCRIPT_DIR%
rem Check Python
echo [1/4] Checking Python environment...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found
    echo Please install Python 3.8+
    pause
    exit /b 1
)
echo SUCCESS: Python environment OK
rem Switch to backend directory
echo.
echo [2/4] Preparing backend service...
pushd "%SCRIPT_DIR%backend"
if not exist simple_server.py (
    echo ERROR: simple_server.py not found
    echo Current directory: %cd%
    popd
    pause
    exit /b 1
)
echo SUCCESS: Backend files exist
rem Start backend service
echo.
echo [3/4] Starting backend server...
echo Service URL: http://localhost:5000
echo.
start "Backend Service" cmd /k "title Backend Server && color 0B && python simple_server.py"

rem Wait for backend startup
echo [4/4] Waiting for service startup...
timeout /t 3 /nobreak >nul

rem Open frontend page
echo.
echo Opening frontend page...
if exist "%SCRIPT_DIR%frontend\index.html" (
    start "" "%SCRIPT_DIR%frontend\index.html"
    echo SUCCESS: Frontend page opened
) else (
    echo ERROR: Frontend page not found
)

echo.
echo ========================================
echo            STARTUP COMPLETE
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend: Opened in browser
echo.
echo NOTE: Keep backend window open
echo       Closing it will stop the service
echo.
echo ========================================

popd
echo.
pause