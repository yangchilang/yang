import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import bcrypt from 'bcryptjs';

let pool: Pool | null = null;

export async function initializeDatabase(): Promise<Pool> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const config: PoolConfig = {
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === 'production' || !databaseUrl.includes('localhost')
      ? { rejectUnauthorized: false }
      : undefined,
  };

  pool = new Pool(config);

  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connection established');
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL:', error);
    throw error;
  }

  await createTables();
  await seedDefaultUser();

  console.log('✅ Database initialized successfully');
  return pool;
}

async function createTables(): Promise<void> {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS readings (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_readings_order_id ON readings(order_id)`);
}

async function seedDefaultUser(): Promise<void> {
  if (!pool) return;

  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'yue';
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || '123456';

  const result = await pool.query(
    'SELECT id FROM users WHERE username = $1',
    [defaultUsername]
  );

  if (result.rows.length > 0) {
    console.log(`ℹ️ 默认用户 ${defaultUsername} 已存在，跳过创建`);
    return;
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2)',
    [defaultUsername, hashedPassword]
  );
  console.log(`✅ 默认管理员账号已创建: ${defaultUsername}`);
}

export function getDatabase(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const db = getDatabase();
  return db.query(text, params) as Promise<QueryResult<T>>;
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { pool };