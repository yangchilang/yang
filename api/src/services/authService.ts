import bcrypt from 'bcryptjs';
import { getDatabase, saveDatabase } from '../utils/database';
import { User } from '../types';
import { generateToken } from '../config/jwt';

const SALT_ROUNDS = 10;

export async function createUser(
  username: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const db = getDatabase();

  const existingUser = db.exec(
    'SELECT id FROM users WHERE username = ?',
    [username]
  );

  if (existingUser.length > 0 && existingUser[0].values.length > 0) {
    throw new Error('用户名已被注册');
  }

  if (password.length < 8) {
    throw new Error('密码强度不足：密码至少需要8个字符');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );

  saveDatabase();

  const result = db.exec('SELECT last_insert_rowid() as id');
  const userId = result[0].values[0][0] as number;

  const userResult = db.exec(
    'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  const userRow = userResult[0].values[0];
  const user: Omit<User, 'password'> = {
    id: userRow[0] as number,
    username: userRow[1] as string,
    created_at: userRow[2] as string,
    updated_at: userRow[3] as string,
  };

  const token = generateToken({ userId: user.id, username: user.username });

  return { user, token };
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const db = getDatabase();

  const userResult = db.exec('SELECT * FROM users WHERE username = ?', [username]);

  if (userResult.length === 0 || userResult[0].values.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const userRow = userResult[0].values[0];
  const user: User = {
    id: userRow[0] as number,
    username: userRow[1] as string,
    password: userRow[2] as string,
    created_at: userRow[3] as string,
    updated_at: userRow[4] as string,
  };

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error('用户名或密码错误');
  }

  const token = generateToken({ userId: user.id, username: user.username });

  const userWithoutPassword: Omit<User, 'password'> = {
    id: user.id,
    username: user.username,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { user: userWithoutPassword, token };
}

export function getUserById(userId: number): Omit<User, 'password'> | null {
  const db = getDatabase();

  const userResult = db.exec(
    'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
    [userId]
  );

  if (userResult.length === 0 || userResult[0].values.length === 0) {
    return null;
  }

  const userRow = userResult[0].values[0];
  return {
    id: userRow[0] as number,
    username: userRow[1] as string,
    created_at: userRow[2] as string,
    updated_at: userRow[3] as string,
  };
}
