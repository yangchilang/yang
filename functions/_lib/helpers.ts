import { Env } from './types';

export function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function successResponse(data: any, status: number = 200): Response {
  return jsonResponse({ success: true, data }, status);
}

export function errorResponse(error: string, status: number = 400): Response {
  return jsonResponse({ success: false, error }, status);
}

export async function parseBody<T = any>(request: Request): Promise<T> {
  try {
    return await request.json();
  } catch {
    return {} as T;
  }
}

export function getQuery(request: Request): URLSearchParams {
  return new URL(request.url).searchParams;
}
