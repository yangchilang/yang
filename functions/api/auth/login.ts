import bcrypt from 'bcryptjs';
import { ensureDatabase, queryFirst } from '../../_lib/database';
import { generateToken } from '../../_lib/auth';
import { successResponse, errorResponse, parseBody } from '../../_lib/helpers';

export async function onRequestPost(context: any) {
  const { request, env } = context;

  try {
    await ensureDatabase(env);

    const { username, password } = await parseBody(request);

    if (!username || !password) {
      return errorResponse('请提供用户名和密码', 400);
    }

    const user = await queryFirst(env, 'SELECT * FROM users WHERE username = ?', [username]);

    if (!user) {
      return errorResponse('用户名或密码错误', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('用户名或密码错误', 401);
    }

    const token = await generateToken({ userId: user.id, username: user.username }, env);

    return successResponse({
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token,
    });
  } catch (e: any) {
    return errorResponse(`内部错误: ${e.message || e}`, 500);
  }
}
