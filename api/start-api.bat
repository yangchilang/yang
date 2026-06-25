@echo off
cd /d "%~dp0"
echo Starting API server...
node dist/server.js
pause
