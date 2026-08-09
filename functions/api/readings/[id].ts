import { ensureDatabase, queryFirst, queryRun } from '../../_lib/database';
import { getAuthUser } from '../../_lib/auth';
import { successResponse, errorResponse } from '../../_lib/helpers';

// GET /api/readings/:id
export async function onRequestGet(context: any) {
  const { request, env, params } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权', 401);
  }

  const readingId = parseInt(params.id);
  if (isNaN(readingId)) {
    return errorResponse('解读ID无效', 400);
  }

  const reading = await queryFirst(
    env,
    'SELECT * FROM readings WHERE id = ? AND user_id = ?',
    [readingId, authUser.userId]
  );

  if (!reading) {
    return errorResponse('解读不存在', 404);
  }

  return successResponse(reading);
}

// DELETE /api/readings/:id
export async function onRequestDelete(context: any) {
  const { request, env, params } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权', 401);
  }

  const readingId = parseInt(params.id);
  if (isNaN(readingId)) {
    return errorResponse('解读ID无效', 400);
  }

  const existing = await queryFirst(
    env,
    'SELECT id FROM readings WHERE id = ? AND user_id = ?',
    [readingId, authUser.userId]
  );

  if (!existing) {
    return errorResponse('解读不存在', 404);
  }

  await queryRun(
    env,
    'DELETE FROM readings WHERE id = ? AND user_id = ?',
    [readingId, authUser.userId]
  );

  return successResponse({ message: '删除成功' });
}
