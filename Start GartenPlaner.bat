@echo off
title GartenPlaner
cd /d "%~dp0"

:: Prüfe ob Node.js installiert ist
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ❌ Node.js wurde nicht gefunden!
    echo     Bitte installiere Node.js von https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Prüfe ob dist/ vorhanden ist
if not exist "dist\index.html" (
    echo.
    echo  📦 Frontend wird einmalig gebaut...
    echo.
    call npm run build
    if %errorlevel% neq 0 (
        echo.
        echo  ❌ Build fehlgeschlagen!
        pause
        exit /b 1
    )
)

echo.
echo  🌱 GartenPlaner wird gestartet...
echo  🌐 Browser öffnet sich automatisch auf http://localhost:3001
echo.
echo  Dieses Fenster offen lassen (schließen = App beenden)
echo  ────────────────────────────────────────────────────────
echo.

node server/index.js
