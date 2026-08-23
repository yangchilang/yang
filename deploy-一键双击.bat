@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 塔罗解读 · 一键部署到 Cloudflare Pages
color 0B

echo ╔══════════════════════════════════════════════════════════╗
echo ║          塔罗解读 · 一键部署到 Cloudflare Pages         ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║                                                          ║
echo ║   无需手动配置，无需输入任何密钥                          ║
echo ║   密钥已内置到后端代理代码中，前端绝对看不到             ║
echo ║                                                          ║
echo ║   如果弹出浏览器授权窗口，请点击「允许」                 ║
echo ║                                                          ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo [1/1] 正在部署项目 (project-name: ai-tarot-reading-5ed) ...
echo.

call npx wrangler pages deploy dist --branch main --project-name ai-tarot-reading-5ed

if errorlevel 1 (
    echo.
    echo ❌ 部署失败，请把上方错误信息发给助手
    color 0C
) else (
    echo.
    echo ╔══════════════════════════════════════════════════════════╗
    echo ║                   ✅ 部署成功！                          ║
    echo ╠══════════════════════════════════════════════════════════╣
    echo ║                                                          ║
    echo ║   线上地址：https://ai-tarot-reading-5ed.pages.dev      ║
    echo ║                                                          ║
    echo ║   现在请告诉助手「部署完成」，助手会立刻验证功能。      ║
    echo ║                                                          ║
    echo ╚══════════════════════════════════════════════════════════╝
    color 0A
)

echo.
pause
