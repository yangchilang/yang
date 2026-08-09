# 塔罗牌解读应用

基于 Cloudflare Pages 全栈部署的塔罗牌解读应用，支持用户登录、塔罗解读和历史记录管理。

## 项目结构

```
g:\1\1/
├── functions/                 # Cloudflare Pages Functions（后端 API）
│   ├── _lib/
│   │   ├── auth.ts            # JWT 生成与验证
│   │   ├── database.ts        # D1 数据库操作
│   │   ├── helpers.ts         # 响应格式化、请求解析
│   │   └── types.ts           # 类型定义
│   └── api/
│       ├── auth/              # 认证端点（login/register/me）
│       └── readings/          # 解读 CRUD（index/[id]/search）
├── src/                       # 前端 React 应用
│   ├── components/            # React 组件
│   ├── services/              # API 服务层
│   ├── store/                 # Zustand 状态管理
│   ├── types/                 # TypeScript 类型
│   ├── App.tsx                # 主应用组件
│   └── main.tsx               # 入口文件
├── scripts/
│   └── copy-functions.js      # 构建时复制 functions 到 dist
├── wrangler.toml              # Cloudflare Pages 配置
└── package.json
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端默认运行在 `http://localhost:5173`。

### 本地开发后端（可选）

如需本地调试 Pages Functions：

```bash
npx wrangler pages dev dist --binding DB:DB
```

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/`，同时复制 `functions/` 到 `dist/functions/`。

### 部署到 Cloudflare Pages

```bash
npm run deploy
```

或通过 GitHub 仓库连接 Cloudflare Pages 实现自动部署。

## 技术栈

### 后端
- **Runtime**: Cloudflare Pages Functions
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: JWT (jose) + bcryptjs
- **兼容性**: nodejs_compat

### 前端
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **Animation**: Framer Motion 10
- **State**: Zustand

## API 端点

所有端点前缀为 `/api`，由 Pages Functions 提供。

### 认证

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/auth/login` | POST | 用户登录 |
| `/api/auth/register` | POST | 用户注册 |
| `/api/auth/me` | GET | 获取当前用户信息 |

### 解读历史

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/readings` | GET | 分页获取解读列表 |
| `/api/readings` | POST | 保存新解读 |
| `/api/readings/:id` | GET | 获取解读详情 |
| `/api/readings/:id` | DELETE | 删除解读 |
| `/api/readings/search` | GET | 搜索解读 |

## 环境变量

### 前端 (.env)

```bash
# 可选：指定后端 API 地址，不设置时使用相对路径 /api
# VITE_API_URL=https://tarot-yue.cn

# 解读服务密钥
VITE_API_KEY=your_deepseek_api_key
```

### Cloudflare Pages 项目设置

在 Cloudflare Pages 项目的 Settings → Environment variables 中配置：
- `VITE_API_KEY`: DeepSeek API 密钥

Bindings 中配置：
- D1 database: `DB` → `tarot-db`

## 数据库

使用 Cloudflare D1（基于 SQLite）。

### 数据表

**users 表**
- id (INTEGER, 主键)
- username (TEXT, 唯一)
- password (TEXT, bcrypt 加密)
- created_at, updated_at (TEXT)

**readings 表**
- id (INTEGER, 主键)
- user_id (INTEGER, 外键)
- cards (TEXT, JSON)
- interpretation (TEXT)
- user_context, order_id, title (TEXT)
- customer_gender, related_order_id (TEXT, 可空)
- customer_info, customer_statement, customer_question (TEXT, 可空)
- created_at (TEXT)

数据库表在首次请求时自动创建（见 `functions/_lib/database.ts` 的 `ensureDatabase`），同时自动创建默认管理员账号 `yue / 123456`。

## 许可证

ISC
