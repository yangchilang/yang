import bcrypt from 'bcryptjs';
import { query } from '../utils/database';
import { User } from '../types';
import { generateToken } from '../config/jwt';

const SALT_ROUNDS = 10;

export async function createUser(
  username: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const existingUser = await query(
    'SELECT id FROM users WHERE username = $1',
    [username]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('用户名已被注册');
  }

  if (password.length < 8) {
    throw new Error('密码强度不足：密码至少需要8个字符');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, created_at, updated_at',
    [username, hashedPassword]
  );

  const userRow = result.rows[0];
  const user: Omit<User, 'password'> = {
    id: userRow.id,
    username: userRow.username,
    created_at: userRow.created_at.toISOString(),
    updated_at: userRow.updated_at.toISOString(),
  };

  const token = generateToken({ userId: user.id, username: user.username });

  return { user, token };
}

export async function loginUser(
  username: string,
  password: string
): Promise<{ user: Omit<User, 'password'>; token: string }> {
  const userResult = await query('SELECT * FROM users WHERE username = $1', [username]);

  if (userResult.rows.length === 0) {
    throw new Error('用户名或密码错误');
  }

  const userRow = userResult.rows[0];
  const user: User = {
    id: userRow.id,
    username: userRow.username,
    password: userRow.password,
    created_at: userRow.created_at.toISOString(),
    updated_at: userRow.updated_at.toISOString(),
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

export async function getUserById(userId: number): Promise<Omit<User, 'password'> | null> {
  const userResult = await query(
    'SELECT id, username, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );

  if (userResult.rows.length === 0) {
    return null;
  }

  const userRow = userResult.rows[0];
  return {
    id: userRow.id,
    username: userRow.username,
    created_at: userRow.created_at.toISOString(),
    updated_at: userRow.updated_at.toISOString(),
  };
}