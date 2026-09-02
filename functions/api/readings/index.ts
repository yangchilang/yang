import { ensureDatabase, query, queryRun } from '../../_lib/database';
import { getAuthUser } from '../../_lib/auth';
import { successResponse, errorResponse, parseBody, getQuery } from '../../_lib/helpers';

// GET /api/readings - 分页获取用户的解读列表
export async function onRequestGet(context: any) {
  const { request, env } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权', 401);
  }

  const params = getQuery(request);
  const page = parseInt(params.get('page') || '1') || 1;
  const limit = parseInt(params.get('limit') || '10') || 10;
  const offset = (page - 1) * limit;

  const totalResult = await query(
    env,
    'SELECT COUNT(*) as count FROM readings WHERE user_id = ?',
    [authUser.userId]
  );
  const total = totalResult.rows[0].count;

  const readingsResult = await query(
    env,
    'SELECT * FROM readings WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [authUser.userId, limit, offset]
  );

  const totalPages = Math.ceil(total / limit);

  return successResponse({
    readings: readingsResult.rows,
    pagination: { page, limit, total, totalPages },
  });
}

// POST /api/readings - 创建解读记录
export async function onRequestPost(context: any) {
  const { request, env } = context;
  await ensureDatabase(env);

  const authUser = await getAuthUser(request, env);
  if (!authUser) {
    return errorResponse('未授权', 401);
  }

  const body = await parseBody(request);
  const {
    cards, interpretation, user_context, order_id, title,
    customer_gender, related_order_id, customer_info,
    customer_statement, customer_question, spread,
  } = body;

  if (!cards || !order_id) {
    return errorResponse('卡牌和订单号不能为空', 400);
  }

  const cardsJson = typeof cards === 'string' ? cards : JSON.stringify(cards);
  const spreadJson = spread ? (typeof spread === 'string' ? spread : JSON.stringify(spread)) : null;

  const result = await queryRun(
    env,
    `INSERT INTO readings (user_id, cards, interpretation, user_context, order_id, title, customer_gender, related_order_id, customer_info, customer_statement, customer_question, spread)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    [
      authUser.userId, cardsJson, interpretation || '', user_context || '',
      order_id, title || null, customer_gender || null, related_order_id || null,
      customer_info || null, customer_statement || null, customer_question || null,
      spreadJson,
    ]
  );

  const reading = result.results[0];
  return successResponse(reading, 201);
}
