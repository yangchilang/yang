import bcrypt from 'bcryptjs';
import { Env } from './types';

let initialized = false;

/** 把 PostgreSQL 参数占位符 $1, $2 转换为 D1 的 ? */
function convertSql(sql: string): string {
  return sql.replace(/\$\d+/g, '?');
}

/** 通用查询函数，兼容原 pg 的 pool.query 接口 */
export async function query(env: Env, text: string, params: any[] = []) {
  const sql = convertSql(text);
  const stmt = env.DB.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  const result = await bound.all();
  return { rows: result.results || [] };
}

/** 单行查询 */
export async function queryFirst(env: Env, text: string, params: any[] = []) {
  const sql = convertSql(text);
  const stmt = env.DB.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  return await bound.first();
}

/** 执行（INSERT/UPDATE/DELETE），支持 RETURNING */
export async function queryRun(env: Env, text: string, params: any[] = []) {
  const sql = convertSql(text);
  const stmt = env.DB.prepare(sql);
  const bound = params.length > 0 ? stmt.bind(...params) : stmt;
  return await bound.all();
}

/** 初始化数据库：建表 + 默认用户 */
export async function ensureDatabase(env: Env): Promise<void> {
  if (initialized) return;
  initialized = true;

  await env.DB.batch([
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`),
    env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cards TEXT NOT NULL,
        interpretation TEXT NOT NULL,
        user_context TEXT,
        order_id TEXT NOT NULL,
        title TEXT,
        customer_gender TEXT,
        related_order_id TEXT,
        customer_info TEXT,
        customer_statement TEXT,
        customer_question TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC)`),
    env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_readings_order_id ON readings(order_id)`),
  ]);

  // 创建默认管理员
  const existing = await env.DB.prepare('SELECT id FROM users WHERE username = ?').bind('yue').first();
  if (!existing) {
    const hashedPassword = await bcrypt.hash('123456', 10);
    await env.DB.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
      .bind('yue', hashedPassword)
      .run();
    console.log('✅ 默认管理员账号已创建: yue');
  }
}
