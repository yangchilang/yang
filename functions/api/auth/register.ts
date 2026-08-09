import bcrypt from 'bcryptjs';
import { ensureDatabase, queryFirst, queryRun } from '../../_lib/database';
import { generateToken } from '../../_lib/auth';
import { successResponse, errorResponse, parseBody } from '../../_lib/helpers';

export async function onRequestPost(context: any) {
  const { request, env } = context;
  await ensureDatabase(env);

  const { username, password } = await parseBody(request);

  if (!username) {
    return errorResponse('请提供用户名', 400);
  }
  if (!password || password.length < 8) {
    return errorResponse('密码至少需要8个字符', 400);
  }

  const existing = await queryFirst(env, 'SELECT id FROM users WHERE username = ?', [username]);
  if (existing) {
    return errorResponse('用户名已被注册', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await queryRun(
    env,
    'INSERT INTO users (username, password) VALUES (?, ?) RETURNING id, username, created_at, updated_at',
    [username, hashedPassword]
  );

  const user = result.results[0];
  const token = await generateToken({ userId: user.id, username: user.username }, env);

  return successResponse({ user, token }, 201);
}
