import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

let db: SqlJsDatabase | null = null;

const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
const absoluteDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

const dbDir = path.dirname(absoluteDbPath);

export async function initializeDatabase(): Promise<SqlJsDatabase> {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(absoluteDbPath)) {
    const fileBuffer = fs.readFileSync(absoluteDbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`);

  db.run(`
    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cards TEXT NOT NULL,
      interpretation TEXT NOT NULL,
      user_context TEXT,
      order_id TEXT NOT NULL,
      customer_name TEXT,
      customer_gender TEXT,
      customer_age INTEGER,
      related_order_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_readings_order_id ON readings(order_id)`);
  
  try {
    const columns = db.exec("PRAGMA table_info(readings)");
    if (columns.length > 0) {
      const columnNames = columns[0].values.map(row => row[1]);
      
      if (!columnNames.includes('order_id')) {
        db.run('ALTER TABLE readings ADD COLUMN order_id TEXT');
        db.run('CREATE INDEX IF NOT EXISTS idx_readings_order_id ON readings(order_id)');
        console.log('✅ Added order_id column to readings table');
      }
      
      if (!columnNames.includes('customer_name')) {
        db.run('ALTER TABLE readings ADD COLUMN customer_name TEXT');
        console.log('✅ Added customer_name column to readings table');
      }
      
      if (!columnNames.includes('customer_gender')) {
        db.run('ALTER TABLE readings ADD COLUMN customer_gender TEXT');
        console.log('✅ Added customer_gender column to readings table');
      }
      
      if (!columnNames.includes('customer_age')) {
        db.run('ALTER TABLE readings ADD COLUMN customer_age INTEGER');
        console.log('✅ Added customer_age column to readings table');
      }
      
      if (!columnNames.includes('related_order_id')) {
        db.run('ALTER TABLE readings ADD COLUMN related_order_id TEXT');
        db.run('CREATE INDEX IF NOT EXISTS idx_readings_related_order_id ON readings(related_order_id)');
        console.log('✅ Added related_order_id column to readings table');
      }
      
      if (!columnNames.includes('diviner_age')) {
        db.run('ALTER TABLE readings ADD COLUMN diviner_age INTEGER');
        console.log('✅ Added diviner_age column to readings table');
      }
      
      if (!columnNames.includes('partner_age')) {
        db.run('ALTER TABLE readings ADD COLUMN partner_age INTEGER');
        console.log('✅ Added partner_age column to readings table');
      }
      
      if (!columnNames.includes('relationship')) {
        db.run('ALTER TABLE readings ADD COLUMN relationship TEXT');
        console.log('✅ Added relationship column to readings table');
      }
      
      if (!columnNames.includes('is_contacting')) {
        db.run('ALTER TABLE readings ADD COLUMN is_contacting INTEGER DEFAULT 0');
        console.log('✅ Added is_contacting column to readings table');
      }
      
      if (!columnNames.includes('customer_statement')) {
        db.run('ALTER TABLE readings ADD COLUMN customer_statement TEXT');
        console.log('✅ Added customer_statement column to readings table');
      }
      
      if (!columnNames.includes('customer_question')) {
        db.run('ALTER TABLE readings ADD COLUMN customer_question TEXT');
        console.log('✅ Added customer_question column to readings table');
      }
    }
  } catch (e) {
    console.log('ℹ️  Column migration skipped (table may not exist yet)');
  }

  await seedDefaultUser();

  saveDatabase();

  console.log('✅ Database initialized successfully');
  return db;
}

async function seedDefaultUser(): Promise<void> {
  if (!db) return;

  const defaultUsername = process.env.DEFAULT_ADMIN_USERNAME || 'yue';
  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || '123456';

  const result = db.exec('SELECT id FROM users WHERE username = ?', [defaultUsername]);

  if (result.length > 0 && result[0].values.length > 0) {
    console.log(`ℹ️  默认用户 ${defaultUsername} 已存在，跳过创建`);
    return;
  }

  const hashedPassword = await bcrypt.hash(defaultPassword, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [defaultUsername, hashedPassword]);
  console.log(`✅ 默认管理员账号已创建: ${defaultUsername}`);
}

export function getDatabase(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

export function saveDatabase(): void {
  if (!db) return;

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(absoluteDbPath, buffer);
}

export function closeDatabase(): void {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
}

export { db };
