
# 塔罗牌解读应用 - 技术架构文档

## 1. 系统架构

```
┌─────────────────────────────────────────────────────┐
│                    React 前端                        │
│  ┌─────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │  登录页  │  │  注册页   │  │   历史记录页      │   │
│  └────┬────┘  └────┬─────┘  └────────┬────────┘   │
│       │           │                  │             │
│       └───────────┼──────────────────┘             │
│                   ↓                                 │
│           ┌───────────────┐                        │
│           │  API 服务层    │                        │
│           │ (Zustand)     │                        │
│           └───────┬───────┘                        │
└───────────────────┼─────────────────────────────────┘
                    │ HTTPS/REST
                    ↓
┌─────────────────────────────────────────────────────┐
│                   Express.js 后端                    │
│  ┌────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ 认证中间件  │  │ 用户路由      │  │ 历史路由  │  │
│  └─────┬──────┘  └──────┬───────┘  └───┬───────┘  │
│        │               │              │            │
│        └───────────────┼──────────────┘            │
│                        ↓                            │
│              ┌────────────────┐                    │
│              │  业务逻辑层    │                    │
│              │ (Controllers) │                    │
│              └───────┬────────┘                    │
│                      ↓                              │
│              ┌────────────────┐                    │
│              │   数据访问层   │                    │
│              │  (better-sqlite3) │                │
│              └────────────────┘                    │
└─────────────────────────────────────────────────────┘
                    ↓
              ┌────────────┐
              │  SQLite    │
              │  Database  │
              └────────────┘
```

## 2. 域名和部署策略

### 2.1 域名购买建议
- **推荐域名**: tarot-ai.com / aitarot.com / meigu.com（根据实际可用性选择）
- **购买平台**: 
  - Namecheap（国际）
  - GoDaddy（国际）
  - 阿里云/腾讯云（国内，需备案）
- **预算**: .com 域名通常 $10-15/年

### 2.2 免费部署平台组合

#### 前端部署：Vercel ⭐推荐
- **优点**: 
  - 免费套餐包含足够流量（100GB带宽/月）
  - 自动HTTPS/SSL证书
  - 自定义域名绑定简单
  - 全球CDN加速
  - 预览部署功能
- **地址**: https://vercel.com
- **自定义域名**: 支持（需DNS配置）

#### 后端部署：Railway ⭐推荐
- **优点**:
  - 每月$5免费额度（小型应用足够）
  - 支持Node.js应用
  - 内置PostgreSQL/SQLite支持
  - 自动HTTPS
  - 简单的环境变量管理
- **地址**: https://railway.app
- **注意**: SQLite可能需要配置持久化存储

#### 备选：Render
- **优点**: 永久免费套餐（适合小型项目）
- **缺点**: 冷启动较慢
- **地址**: https://render.com

### 2.3 部署架构图
```
用户浏览器 (HTTPS)
      ↓
   你的域名 (tarot-ai.com)
      ↓
┌────────────────────────────────┐
│         Vercel CDN             │
│    (前端静态资源 + HTTPS)       │
└────────┬───────────────────────┘
         ↓
    API 请求
         ↓
┌────────────────────────────────┐
│       Railway/Render           │
│    (Express.js 后端 + HTTPS)   │
└────────┬───────────────────────┘
         ↓
    数据库
    (Railway PostgreSQL 或 SQLite)
```

### 2.4 DNS 配置
购买域名后，需要配置DNS：
```
类型    名称    值
A      @      [Vercel IP]
CNAME  www    [your-app].vercel.app
```

### 2.5 环境变量配置

#### 前端 (.env)
```bash
VITE_API_URL=https://api.your-domain.com
VITE_API_KEY=your_api_key
```

#### 后端 (.env)
```bash
PORT=3001
NODE_ENV=production
JWT_SECRET=generate_a_secure_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
DATABASE_PATH=./data/database.sqlite
```

## 3. 前端架构

### 3.1 技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3 + 自定义CSS变量
- **动画**: Framer Motion 10
- **状态管理**: Zustand（用于全局状态）
- **HTTP客户端**: Axios
- **路由**: React Router DOM 6

### 3.2 目录结构
```
src/
├── components/
│   ├── InputPhase.tsx          # 塔罗牌输入界面
│   ├── ReadingPhase.tsx         # 解读结果展示
│   ├── TarotCard.tsx            # 塔罗牌卡片组件
│   ├── Auth/
│   │   ├── LoginForm.tsx       # 登录表单
│   │   └── RegisterForm.tsx     # 注册表单
│   └── History/
│       ├── HistoryList.tsx      # 历史记录列表
│       └── HistoryCard.tsx      # 历史记录卡片
├── pages/
│   ├── Home.tsx                # 首页（塔罗解读）
│   ├── Login.tsx               # 登录页
│   ├── Register.tsx            # 注册页
│   ├── History.tsx             # 历史记录页
│   └── ReadingDetail.tsx       # 解读详情页
├── services/
│   ├── api.ts                  # API基础配置
│   ├── authService.ts          # 认证相关API
│   ├── readingService.ts        # 解读历史API
│   └── aiService.ts            # 解读服务
├── store/
│   ├── authStore.ts            # 认证状态管理
│   └── readingStore.ts         # 解读历史状态管理
├── hooks/
│   ├── useAuth.ts              # 认证Hook
│   └── useReadings.ts          # 解读历史Hook
├── types/
│   └── index.ts                # TypeScript类型定义
├── utils/
│   ├── helpers.ts             # 工具函数
│   └── api.ts                 # API请求封装
├── App.tsx                     # 主应用组件
├── main.tsx                    # 入口文件
└── index.css                   # 全局样式
```

### 3.3 路由设计
```typescript
const routes = [
  { path: '/', component: Home, auth: false },
  { path: '/login', component: Login, auth: false },
  { path: '/register', component: Register, auth: false },
  { path: '/history', component: History, auth: true },
  { path: '/reading/:id', component: ReadingDetail, auth: true }
]
```

### 3.4 状态管理
使用 Zustand 进行全局状态管理：

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// readingStore.ts
interface ReadingState {
  readings: Reading[];
  currentReading: Reading | null;
  fetchReadings: () => Promise<void>;
  saveReading: (data: ReadingInput) => Promise<void>;
  deleteReading: (id: number) => Promise<void>;
}
```

## 4. 后端架构

### 4.1 技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js 4
- **语言**: TypeScript 5
- **数据库**: SQLite 3（better-sqlite3）
- **认证**: jsonwebtoken (JWT)
- **密码加密**: bcrypt
- **验证**: express-validator
- **CORS**: cors

### 4.2 目录结构
```
api/
├── src/
│   ├── config/
│   │   ├── database.ts          # 数据库配置
│   │   └── jwt.ts               # JWT配置
│   ├── middleware/
│   │   ├── auth.ts              # 认证中间件
│   │   ├── errorHandler.ts      # 错误处理
│   │   └── validation.ts        # 数据验证
│   ├── routes/
│   │   ├── auth.ts              # 认证路由
│   │   ├── readings.ts          # 解读历史路由
│   │   └── index.ts             # 路由汇总
│   ├── controllers/
│   │   ├── authController.ts     # 认证控制器
│   │   └── readingController.ts  # 解读历史控制器
│   ├── models/
│   │   ├── User.ts              # 用户模型
│   │   └── Reading.ts           # 解读记录模型
│   ├── services/
│   │   ├── authService.ts        # 认证服务
│   │   └── readingService.ts     # 解读历史服务
│   ├── types/
│   │   └── index.ts             # 类型定义
│   ├── utils/
│   │   ├── helpers.ts           # 工具函数
│   │   └── database.ts          # 数据库初始化
│   ├── app.ts                   # Express应用
│   └── server.ts                # 服务器入口
├── data/                        # 数据库文件目录
│   └── database.sqlite
├── package.json
├── tsconfig.json
├── .env.example
└── .gitignore
```

### 4.3 API 设计

#### 认证接口

**POST /api/auth/register** - 用户注册
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (201)
{
  success: true;
  data: {
    user: { id: number; email: string };
    token: string;
  }
}

// Error (400)
{
  success: false;
  error: "邮箱已被注册" | "密码强度不足"
}
```

**POST /api/auth/login** - 用户登录
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (200)
{
  success: true;
  data: {
    user: { id: number; email: string };
    token: string;
  }
}

// Error (401)
{
  success: false;
  error: "邮箱或密码错误"
}
```

**GET /api/auth/me** - 获取当前用户
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  success: true;
  data: {
    id: number;
    email: string;
    created_at: string;
  }
}

// Error (401)
{
  success: false;
  error: "未授权"
}
```

#### 解读历史接口

**GET /api/readings** - 获取历史列表
```typescript
// Headers: Authorization: Bearer <token>

// Query: ?page=1&limit=10

// Response (200)
{
  success: true;
  data: {
    readings: Reading[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  }
}
```

**POST /api/readings** - 保存解读
```typescript
// Headers: Authorization: Bearer <token>

// Request
{
  cards: SelectedCard[];
  interpretation: string;
  user_context: string;
}

// Response (201)
{
  success: true;
  data: Reading;
}
```

**GET /api/readings/:id** - 获取解读详情
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  success: true;
  data: Reading;
}

// Error (404)
{
  success: false;
  error: "解读不存在"
}
```

**DELETE /api/readings/:id** - 删除解读
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  success: true;
  message: "删除成功"
}

// Error (404)
{
  success: false;
  error: "解读不存在"
}
```

## 5. 数据库设计

### 5.1 数据库选择
- **SQLite (better-sqlite3)**: 
  - ✅ 轻量级、无需单独服务器
  - ✅ 适合小型应用（<100用户完全够用）
  - ✅ 开发简单，部署方便
  - ✅ Railwave支持SQLite持久化存储
  - ❌ 不适合高并发写入
- **文件存储**: `api/data/database.sqlite`

### 5.2 数据表结构

#### users 表
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

#### readings 表
```sql
CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  cards TEXT NOT NULL, -- JSON字符串
  interpretation TEXT NOT NULL,
  user_context TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_readings_user_id ON readings(user_id);
CREATE INDEX idx_readings_created_at ON readings(created_at DESC);
```

### 5.3 关系图
```
┌─────────────┐       ┌─────────────┐
│   users     │       │  readings   │
├─────────────┤       ├─────────────┤
│ id (PK)     │──1:N──│ id (PK)     │
│ email       │       │ user_id(FK) │
│ password    │       │ cards       │
│ created_at  │       │ interpretation│
│ updated_at  │       │ user_context │
└─────────────┘       │ created_at  │
                      └─────────────┘
```

## 6. 认证机制

### 6.1 JWT Token
- **签名算法**: HS256
- **过期时间**: 7天
- **Payload**: { userId, email }
- **存储**: 前端 localStorage
- **刷新策略**: Token过期后需要重新登录

### 6.2 密码安全
- **加密算法**: bcrypt
- **盐值轮数**: 10
- **验证方式**: bcrypt.compare
- **密码要求**: 最少8位

### 6.3 中间件流程
```
请求 → 提取Token → 验证Token → 解析用户 → 附加到req → 路由处理
```

## 7. 安全措施

### 7.1 输入验证
- 所有输入使用 express-validator 验证
- 邮箱格式验证
- 密码强度检查（最小8位）
- SQL注入防护（better-sqlite3参数化查询）

### 7.2 CORS 配置
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN, // 生产环境指向你的域名
  credentials: true
}));
```

### 7.3 错误处理
- 全局错误处理中间件
- 统一错误响应格式
- 敏感信息不返回给客户端
- 生产环境不泄露错误详情

## 8. 环境配置

### 8.1 前端环境变量 (.env)
```bash
VITE_API_URL=https://api.your-domain.com
VITE_API_KEY=your_api_key_here
```

### 8.2 后端环境变量 (.env)
```bash
PORT=3001
NODE_ENV=production
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com
DATABASE_PATH=./data/database.sqlite
```

### 8.3 .env.example 示例
```bash
# 后端环境变量示例
PORT=3001
NODE_ENV=development
JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
DATABASE_PATH=./data/database.sqlite
```

## 9. 部署流程

### 9.1 部署前准备

1. **安装依赖**
   ```bash
   # 前端
   npm install

   # 后端
   cd api
   npm install
   ```

2. **配置环境变量**
   - 复制 `.env.example` 为 `.env`
   - 生成安全的 JWT_SECRET
   - 配置数据库路径

3. **测试本地运行**
   ```bash
   # 终端1: 启动后端
   cd api
   npm run dev

   # 终端2: 启动前端
   npm run dev
   ```

### 9.2 前端部署到 Vercel

1. **连接GitHub仓库**
   - 在 Vercel 中导入你的 GitHub 仓库
   - 选择 "React" 框架
   - 配置环境变量

2. **配置构建命令**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **添加自定义域名**
   - 在 Vercel 项目设置中添加你的域名
   - 按照提示配置 DNS
   - 等待 SSL 证书自动生成

### 9.3 后端部署到 Railway

1. **连接GitHub仓库**
   - 在 Railway 中导入后端仓库
   - Railway 会自动检测 Node.js

2. **配置环境变量**
   - 在 Railway 控制台添加所有环境变量
   - 特别注意 `DATABASE_PATH`

3. **启动项目**
   - Railway 会自动检测启动命令
   - 如果需要，配置自定义 start 命令

4. **获取API URL**
   - Railway 会提供一个随机URL
   - 可以绑定自定义域名

### 9.4 DNS 配置（以 GoDaddy + Vercel 为例）

1. **在 Vercel**
   - 项目 → Settings → Domains
   - 添加你的域名（如 tarot-ai.com）
   - Vercel 会提供具体的 DNS 记录

2. **在域名提供商**
   ```
   类型    主机名    值
   A       @        76.76.21.21 (Vercel IP)
   CNAME   www      cname.vercel-dns.com
   ```

3. **验证**
   - DNS 更改可能需要几分钟到48小时生效
   - 在 Vercel 中点击 "Refresh" 查看验证状态

## 10. 开发和调试

### 10.1 开发模式

```bash
# 前端开发
npm run dev
# 访问 http://localhost:5173

# 后端开发
cd api
npm run dev
# API 运行在 http://localhost:3001
```

### 10.2 生产构建

```bash
# 前端构建
npm run build
# 输出到 dist/ 目录

# 后端构建
cd api
npm run build
# 输出到 dist/ 目录

# 启动后端生产服务
cd api
npm start
```

### 10.3 测试 API

```bash
# 测试注册
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 测试登录
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 获取历史（需要Token）
curl -X GET http://localhost:3001/api/readings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 11. 维护和监控

### 11.1 日志
- 使用 console.log/error 进行基本日志
- Railway 提供内置日志查看
- Vercel 提供部署日志和访问日志

### 11.2 错误追踪
- 基本的 console.error 日志
- 浏览器控制台查看前端错误
- Railway 日志查看后端错误

### 11.3 数据库维护
- SQLite 文件会随着使用逐渐增大
- Railway 提供持久化存储
- 可以定期备份数据库文件

## 12. 扩展性考虑

### 12.1 如果用户增长（>100用户）
- **数据库**: 升级到 PostgreSQL（Railway 提供）
- **缓存**: 添加 Redis 缓存
- **CDN**: Vercel 已经提供全球CDN

### 12.2 如果需要更多功能
- 邮箱验证（SendGrid/Mailgun）
- 密码重置
- 用户头像
- 社交登录（Google/GitHub）

## 13. 成本估算

### 13.1 初期成本（小型规模）
- **域名**: ~$12/年
- **Vercel**: 免费
- **Railway**: 免费额度（$5/月）
- **总计**: ~$12/年

### 13.2 中期成本（用户增长后）
- **域名**: ~$12/年
- **Vercel**: 免费（小型项目）
- **Railway**: ~$5-20/月
- **总计**: ~$60-250/年

## 14. 开发规范

### 14.1 代码规范
- 使用 TypeScript 类型标注
- 遵循 ESLint + Prettier 配置
- 组件文件不超过200行
- 函数功能单一

### 14.2 Git提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试
```

### 14.3 API规范
- RESTful API 设计
- 统一响应格式：{ success: boolean, data/error: any }
- 使用标准HTTP状态码
- 所有需要认证的接口在请求头中携带Token

## 15. 下一步行动计划

### Phase 1: 项目初始化 ⏳
- [ ] 创建后端项目结构
- [ ] 配置 Express + TypeScript
- [ ] 初始化 SQLite 数据库
- [ ] 编写数据模型和路由

### Phase 2: 认证系统
- [ ] 实现注册/登录API
- [ ] JWT Token 生成和验证
- [ ] 创建认证中间件
- [ ] 前端登录/注册页面

### Phase 3: 解读历史
- [ ] 实现历史CRUD API
- [ ] 前端历史列表页面
- [ ] 历史详情页面
- [ ] 删除功能

### Phase 4: 集成和测试
- [ ] 前后端集成测试
- [ ] 功能测试
- [ ] 用户体验优化

### Phase 5: 部署准备
- [ ] 配置生产环境变量
- [ ] 优化构建配置
- [ ] 准备部署文档

### Phase 6: 域名和上线
- [ ] 购买域名
- [ ] 配置 DNS
- [ ] 部署到 Vercel 和 Railway
- [ ] 配置自定义域名
- [ ] HTTPS 验证

---

**版本**: 2.0.0
**最后更新**: 2026-06-01
**负责人**: 开发团队
**备注**: 优化了部署策略，支持免费平台和.com域名部署
