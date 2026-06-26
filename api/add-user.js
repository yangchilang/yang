const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const username = 'yue';
const password = '123456';

const dbPath = process.env.DATABASE_PATH || './data/database.sqlite';
const absoluteDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.join(process.cwd(), dbPath);

const dbDir = path.dirname(absoluteDbPath);

async function addUser() {
  console.log('正在添加用户...');
  console.log(`用户名: ${username}`);
  console.log(`密码: ${password}`);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(absoluteDbPath)) {
    const fileBuffer = fs.readFileSync(absoluteDbPath);
    db = new SQL.Database(fileBuffer);
    console.log('已打开现有数据库');
  } else {
    db = new SQL.Database();
    console.log('创建新数据库');
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

  const existingUser = db.exec('SELECT id FROM users WHERE username = ?', [username]);
  
  if (existingUser.length > 0 && existingUser[0].values.length > 0) {
    console.log('用户已存在，更新密码...');
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?', [hashedPassword, username]);
  } else {
    console.log('创建新用户...');
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
  }

  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(absoluteDbPath, buffer);

  const userResult = db.exec('SELECT id, username, created_at FROM users WHERE username = ?', [username]);
  if (userResult.length > 0 && userResult[0].values.length > 0) {
    const userRow = userResult[0].values[0];
    console.log('\n✅ 用户添加成功！');
    console.log(`ID: ${userRow[0]}`);
    console.log(`用户名: ${userRow[1]}`);
    console.log(`创建时间: ${userRow[2]}`);
  }

  db.close();
}

addUser().catch(console.error);
