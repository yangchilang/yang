import { ensureDatabase, queryFirst, queryRun } from '../../_lib/database';
import { getAuthUser } from '../../_lib/auth';
import { successResponse, errorResponse, parseBody } from '../../_lib/helpers';

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

// PUT /api/readings/:id - 重新解读后回写解读内容（也可顺带补写牌阵 spread）
export async function onRequestPut(context: any) {
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

  const body = await parseBody<{ interpretation?: string; spread?: unknown }>(request);
  const sets: string[] = [];
  const vals: unknown[] = [];

  if (typeof body.interpretation === 'string' && body.interpretation.trim()) {
    sets.push('interpretation = ?');
    vals.push(body.interpretation);
  }
  if (body.spread !== undefined) {
    const spreadJson = body.spread
      ? (typeof body.spread === 'string' ? body.spread : JSON.stringify(body.spread))
      : null;
    sets.push('spread = ?');
    vals.push(spreadJson);
  }

  if (sets.length === 0) {
    return errorResponse('没有需要更新的字段', 400);
  }

  vals.push(readingId, authUser.userId);

  const result = await queryRun(
    env,
    `UPDATE readings SET ${sets.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
    vals
  );

  return successResponse(result.results[0]);
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
