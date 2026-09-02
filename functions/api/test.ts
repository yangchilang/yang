import { successResponse } from '../_lib/helpers';

// GET /api/test - 部署后用于验证 Pages Functions 是否生效
export async function onRequestGet() {
  return successResponse({ ok: true, msg: 'test endpoint works' });
}
