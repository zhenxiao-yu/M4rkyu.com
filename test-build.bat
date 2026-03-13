@echo off
echo ==========================================
echo Testing m4rkyu.com Repository
echo ==========================================
echo.

cd /d "H:\Github\M4rkyu.com"

echo [1/5] Checking Node.js version...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found
    exit /b 1
)

echo.
echo [2/5] Checking for .env file...
if exist ".env" (
    echo OK: .env file found
) else (
    echo WARNING: .env file not found
    echo Copy .env.example to .env and fill in your Firebase config
)

echo.
echo [3/5] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    exit /b 1
)

echo.
echo [4/5] Running lint check...
call npm run lint
if errorlevel 1 (
    echo WARNING: Lint errors found
) else (
    echo OK: Lint passed
)

echo.
echo [5/5] Building project...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

echo.
echo ==========================================
echo All tests completed!
echo ==========================================
pause
