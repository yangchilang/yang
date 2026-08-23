# ============================================================
# 塔罗解读 - 一键部署到 Cloudflare Pages 脚本
# 用法：在 g:\1\1 目录下，右键 -> "使用 PowerShell 运行"
#   或者打开 PowerShell：cd g:\1\1 ; .\deploy.ps1
# ============================================================

$ErrorActionPreference = "Stop"

# ---------- 配置 ----------
$PROJECT_NAME = "yue-tarot-reading"
$BRANCH = "main"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  塔罗解读 · Cloudflare Pages 一键部署脚本" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[0/6] 检查 Node.js 环境..." -ForegroundColor Yellow
try {
    $nodeVer = node --version
    $npmVer = npm --version
    Write-Host "     Node.js $nodeVer  npm $npmVer  就绪" -ForegroundColor Green
} catch {
    Write-Host "     ❌ 未检测到 Node.js，请先安装 Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/6] 构建前端 (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "     ❌ 构建失败，请检查上方错误信息" -ForegroundColor Red
    exit 1
}
Write-Host "     ✅ 构建完成 (dist/)" -ForegroundColor Green

Write-Host ""
Write-Host "[2/6] 第一次部署 Pages（创建项目 $PROJECT_NAME）..." -ForegroundColor Yellow
Write-Host "     如果弹出浏览器授权窗口，请点击「允许」。" -ForegroundColor Gray
npx wrangler pages deploy dist --branch $BRANCH --project-name $PROJECT_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Host "     ❌ 部署失败，如果提示未登录请先执行：npx wrangler login" -ForegroundColor Red
    exit 1
}
Write-Host "     ✅ 第一次部署完成" -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] 配置解读服务密钥 (DeepSeek API Key)" -ForegroundColor Yellow
Write-Host "     请前往 https://platform.deepseek.com/api_keys 生成一把全新的 Key" -ForegroundColor Gray
Write-Host "     注意：之前在聊天中暴露过的 Key 必须先作废！" -ForegroundColor Gray
Write-Host ""
$secureKey = Read-Host "     粘贴 Key 后按回车（输入时屏幕上不显示任何字符，正常）" -AsSecureString
$bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
$plainKey = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr).Trim()
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)

if ([string]::IsNullOrWhiteSpace($plainKey) -or $plainKey.Length -lt 20) {
    Write-Host "     ❌ Key 太短了，应该是 sk- 开头的一长串" -ForegroundColor Red
    exit 1
}
Write-Host "     ✅ 已读取 Key（长度 $($plainKey.Length) 字符），仅存于内存" -ForegroundColor Green

Write-Host ""
Write-Host "[4/6] 写入加密 Secret VITE_API_KEY 到 Cloudflare Pages..." -ForegroundColor Yellow
$tmpFile = Join-Path $env:TEMP ("tarot-key-" + (Get-Random) + ".txt")
try {
    [System.IO.File]::WriteAllText($tmpFile, $plainKey, [System.Text.Encoding]::UTF8)
    Write-Host "     临时密钥文件: $tmpFile（用完立即删除）" -ForegroundColor Gray
    npx wrangler secret put VITE_API_KEY --project-name $PROJECT_NAME --from-file $tmpFile
    if ($LASTEXITCODE -ne 0) {
        Write-Host "     ❌ 写入 Secret 失败，请检查上方错误" -ForegroundColor Red
        exit 1
    }
    Write-Host "     ✅ Secret 已加密写入（Cloudflare 控制台也看不到明文）" -ForegroundColor Green
} finally {
    if (Test-Path $tmpFile) { Remove-Item $tmpFile -Force; Write-Host "     ✅ 临时密钥文件已从磁盘删除" -ForegroundColor Green }
    Remove-Variable plainKey, secureKey, bstr -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "[5/6] 再次部署（让 Secret 配置生效）..." -ForegroundColor Yellow
npx wrangler pages deploy dist --branch $BRANCH --project-name $PROJECT_NAME
Write-Host "     ✅ 部署完成" -ForegroundColor Green

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  🎉 部署完成！" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  线上地址： https://$PROJECT_NAME.pages.dev"
Write-Host ""
Write-Host "  接下来请把这个地址发给我，我帮你验证功能和安全配置。"
Write-Host ""
Write-Host "  另外记得：之前暴露过的所有 Key 都要在 DeepSeek 后台删除。"
Write-Host ""
