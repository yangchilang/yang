import { ensureDatabase, query } from '../../_lib/database';
import { getAuthUser } from '../../_lib/auth';
import { successResponse, errorResponse, getQuery } from '../../_lib/helpers';

// GET /api/readings/search?keyword=xxx
export async function onRequestGet(context: any) {
  const { request, env } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权', 401);
  }

  const params = getQuery(request);
  const keyword = params.get('keyword');

  if (!keyword) {
    return errorResponse('搜索关键词不能为空', 400);
  }

  const pattern = `%${keyword}%`;

  // 搜索匹配的解读
  const searchResult = await query(
    env,
    `SELECT * FROM readings WHERE user_id = ? AND (order_id LIKE ? OR related_order_id LIKE ? OR title LIKE ?) ORDER BY created_at DESC`,
    [authUser.userId, pattern, pattern, pattern]
  );

  const readings = searchResult.rows;

  // 查询关联解读
  const relatedOrderIds = new Set<string>();
  readings.forEach((r: any) => {
    if (r.order_id) relatedOrderIds.add(r.order_id);
    if (r.related_order_id) relatedOrderIds.add(r.related_order_id);
  });

  const allReadings = new Map<number, any>();
  readings.forEach((r: any) => allReadings.set(r.id, r));

  for (const orderId of relatedOrderIds) {
    const related = await query(
      env,
      `SELECT * FROM readings WHERE user_id = ? AND (order_id = ? OR related_order_id = ?) ORDER BY created_at DESC`,
      [authUser.userId, orderId, orderId]
    );
    related.rows.forEach((r: any) => allReadings.set(r.id, r));
  }

  const result = Array.from(allReadings.values()).sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return successResponse({ readings: result });
}
