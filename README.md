# AI 塔罗牌解读应用

这是一个包含前后端的完整 Web 应用，提供 AI 塔罗牌解读服务，并支持用户注册登录和解读历史保存功能。

## 项目结构

```
g:\1\1/
├── api/                    # 后端 Express.js API
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # 路由
│   │   ├── services/      # 服务层
│   │   ├── types/         # TypeScript 类型
│   │   ├── utils/         # 工具函数
│   │   ├── app.ts         # Express 应用
│   │   └── server.ts      # 服务器入口
│   ├── data/              # 数据库文件目录
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env               # 环境变量
│   └── test-api.js        # API 测试脚本
├── src/                   # 前端 React 应用
│   ├── components/        # React 组件
│   ├── services/          # API 服务
│   ├── store/             # Zustand 状态管理
│   ├── types/             # TypeScript 类型
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 入口文件
├── .env                   # 前端环境变量
└── package.json
```

## 快速开始

### 1. 启动后端服务

```bash
cd api
npm install          # 安装依赖
npm run dev          # 启动开发服务器 (http://localhost:3001)
```

### 2. 启动前端服务

```bash
cd ..               # 返回根目录
npm install         # 安装依赖（如果还没有）
npm run dev         # 启动开发服务器 (http://localhost:5173)
```

### 3. 测试 API

后端启动后，可以运行测试脚本验证 API 功能：

```bash
cd api
node test-api.js
```

## 技术栈

### 后端
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Language**: TypeScript 5
- **Database**: SQLite 3 (sql.js)
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator

### 前端
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Animation**: Framer Motion 10
- **State**: Zustand
- **HTTP**: Axios

## API 端点

### 认证相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 解读历史相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/readings` | GET | 获取解读历史列表 |
| `/api/readings` | POST | 保存新解读 |
| `/api/readings/:id` | GET | 获取解读详情 |
| `/api/readings/:id` | DELETE | 删除解读 |

## 环境变量

### 后端 (.env)

```bash
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/database.sqlite
```

### 前端 (.env)

```bash
VITE_API_URL=http://localhost:3001
VITE_AI_API_KEY=your_nvidia_api_key
```

## 数据库

应用使用 SQLite 数据库，数据库文件存储在 `api/data/database.sqlite`。

### 数据表

**users 表**
- id (INTEGER, 主键)
- email (TEXT, 唯一)
- password (TEXT, bcrypt 加密)
- created_at (DATETIME)
- updated_at (DATETIME)

**readings 表**
- id (INTEGER, 主键)
- user_id (INTEGER, 外键)
- cards (TEXT, JSON 字符串)
- interpretation (TEXT)
- user_context (TEXT)
- created_at (DATETIME)

## 生产部署

### 推荐部署平台

- **前端**: Vercel (https://vercel.com)
- **后端**: Railway (https://railway.app)
- **域名**: Namecheap / GoDaddy

### 部署步骤

1. **前端部署到 Vercel**
   - 连接 GitHub 仓库
   - 配置环境变量
   - 添加自定义域名

2. **后端部署到 Railway**
   - 连接 GitHub 仓库
   - 配置环境变量
   - Railway 会自动处理 HTTPS

3. **DNS 配置**
   - 在域名提供商处配置 DNS 记录
   - 指向 Vercel 和 Railway

## 开发指南

### 代码规范

- 使用 TypeScript 类型标注
- 组件文件不超过 200 行
- 遵循 ESLint + Prettier 配置

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试
```

## 许可证

ISC

## 作者

AI Assistant
