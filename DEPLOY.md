# 部署指南 - tarot-yue.cn

## 架构概览

- **前端**：Vercel → `https://tarot-yue.cn`
- **后端**：Railway → `https://api.tarot-yue.cn`
- **数据库**：SQLite（Railway 持久化卷）

---

## 1. 后端部署（Railway）

### 1.1 准备代码

```bash
cd api
npm install
npm run build
```

### 1.2 在 Railway 创建项目

1. 访问 [railway.app](https://railway.app)
2. 点击 **New Project** → **Deploy from GitHub repo**
3. 选择你的 GitHub 仓库
4. 进入项目设置，添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `PORT` | `3001` | 服务端口 |
| `NODE_ENV` | `production` | 环境模式 |
| `JWT_SECRET` | *(随机长字符串)* | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | `7d` | Token 有效期 |
| `CORS_ORIGIN` | `https://tarot-yue.cn` | 允许的前端域名 |
| `DATABASE_PATH` | `/data/database.sqlite` | 数据库路径（Railway 持久化卷） |

5. 在 Railway Dashboard 中添加 **Volume**：
   - 挂载路径：`/data`
   - 大小：1GB（足够）

### 1.3 生成域名

1. 进入 Railway 项目 → Settings → Domains
2. 点击 **Generate Domain**，获取类似 `xxx.up.railway.app` 的域名
3. 或者添加自定义域名 `api.tarot-yue.cn`：
   - 在 Railway 中添加自定义域名 `api.tarot-yue.cn`
   - 在你的域名解析商（阿里云/腾讯云等）添加 CNAME 记录：
     - 主机记录：`api`
     - 记录类型：`CNAME`
     - 记录值：`xxx.up.railway.app`（Railway 提供的域名）

### 1.4 验证部署

```bash
curl https://api.tarot-yue.cn/api/health
# 应返回 {"status":"ok","timestamp":"..."}
```

---

## 2. 前端部署（Vercel）

### 2.1 准备代码

```bash
# 在根目录
cd ..
npm install
npm run build
```

### 2.2 在 Vercel 创建项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 **Add New Project**
3. 导入你的 GitHub 仓库
4. 构建设置（通常自动识别）：
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 环境变量：
   - `VITE_API_URL` = `https://api.tarot-yue.cn`

### 2.3 绑定自定义域名

1. 进入 Vercel 项目 → Settings → Domains
2. 添加域名 `tarot-yue.cn`
3. Vercel 会提供 DNS 配置：
   - 在你的域名解析商添加：
     - A 记录：`@` → `76.76.21.21`（Vercel 提供的 IP）
     - 或 CNAME 记录：`@` → `cname.vercel-dns.com`
4. 等待 DNS 生效（通常几分钟到几小时）

### 2.4 验证部署

访问 `https://tarot-yue.cn`，确认页面正常加载。

---

## 3. 域名解析总览

在你的域名解析商（阿里云/腾讯云/DNSPod 等）配置：

| 记录类型 | 主机记录 | 记录值 | 说明 |
|----------|----------|--------|------|
| A | `@` | `76.76.21.21` | 主域名 → Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | www 子域名 → Vercel |
| CNAME | `api` | `xxx.up.railway.app` | API 子域名 → Railway |

> **注意**：如果你使用 Cloudflare 解析，A 记录值请使用 Vercel 提供的实际 IP，或者使用 CNAME 扁平化。

---

## 4. 常见问题

### 4.1 跨域问题（CORS）

如果前端调用 API 时报 CORS 错误：

1. 检查 Railway 环境变量 `CORS_ORIGIN` 是否包含 `https://tarot-yue.cn`
2. 检查 `api/src/app.ts` 中的 `defaultOrigins` 数组是否包含你的域名
3. 重启 Railway 服务

### 4.2 数据库丢失

SQLite 数据库必须存储在 Railway Volume 中：

- 确保 `DATABASE_PATH=/data/database.sqlite`
- 确保已挂载 Volume 到 `/data`
- 不要部署到无持久化存储的平台（如 Vercel Serverless）

### 4.3 HTTPS 混合内容

确保所有 URL 都使用 `https://`，包括：
- 前端 `.env.production` 中的 `VITE_API_URL`
- Railway 的自定义域名已启用 HTTPS

---

## 5. 更新部署

### 前端更新

推送代码到 GitHub 的 main 分支，Vercel 会自动重新部署。

### 后端更新

推送代码到 GitHub 的 main 分支，Railway 会自动重新部署。

---

## 6. 备选方案：单域名部署

如果你不想用 `api.tarot-yue.cn` 子域名，可以将前后端都部署到 Railway：

1. 在 Railway 中同时部署前后端
2. 使用同一个域名 `tarot-yue.cn`
3. 后端 Express 同时 serve 前端静态文件（`dist` 目录）

这种方式更简单，但 Vercel 的 CDN 和前端优化会更好。
