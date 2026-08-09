import { ensureDatabase, queryFirst } from '../../_lib/database';
import { getAuthUser } from '../../_lib/auth';
import { successResponse, errorResponse } from '../../_lib/helpers';

export async function onRequestGet(context: any) {
  const { request, env } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权：缺少认证令牌', 401);
  }

  const user = await queryFirst(
    env,
    'SELECT id, username, created_at, updated_at FROM users WHERE id = ?',
    [authUser.userId]
  );

  if (!user) {
    return errorResponse('用户不存在', 404);
  }

  return successResponse(user);
}
