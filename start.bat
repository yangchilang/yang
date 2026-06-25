@echo off
chcp 65001 > nul
title 塔罗AI - 一键启动

echo ========================================
echo    塔罗AI - 一键启动脚本
echo ========================================
echo.

echo [1/2] 正在启动后端服务...
start "塔罗AI-后端" cmd /k "cd /d %~dp0api && npm start"

timeout /t 3 /nobreak > nul

echo.
echo [2/2] 正在启动前端服务...
start "塔罗AI-前端" cmd /k "cd /d %~dp0 && npm run dev"

echo.
echo ========================================
echo    服务已启动！
echo    前端地址: http://localhost:5173
echo    后端地址: http://localhost:3001
echo ========================================
echo.
echo 提示: 关闭此窗口不会停止服务
echo       如需停止，请关闭相应的终端窗口
echo.
pause