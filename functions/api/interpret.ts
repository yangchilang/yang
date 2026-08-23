import { parseBody, errorResponse, successResponse } from '../_lib/helpers';

interface InterpretRequest {
  prompt: string;
  model?: string;
}

const ALLOWED_MODELS = new Set([
  'deepseek-v4-flash',
  'deepseek-v4-pro',
  'deepseek-chat',
  'deepseek-reasoner',
]);

const DEFAULT_MODEL = 'deepseek-v4-flash';
const DEFAULT_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// POST /api/interpret
// 同源后端中转，API Key 只在服务端环境变量中存在，绝不返回给前端。
export async function onRequestPost(context: any) {
  const { request, env } = context;

  const apiKey: string | undefined =
    (env && (env.VITE_API_KEY || env.DEEPSEEK_API_KEY || env.API_KEY)) ||
    process?.env?.VITE_API_KEY ||
    process?.env?.DEEPSEEK_API_KEY ||
    process?.env?.API_KEY;

  const baseUrl: string =
    (env && (env.VITE_API_URL || env.DEEPSEEK_API_URL)) ||
    process?.env?.VITE_API_URL ||
    process?.env?.DEEPSEEK_API_URL ||
    DEFAULT_API_URL;

  if (!apiKey || !apiKey.trim()) {
    return errorResponse('后端未配置解读服务密钥，请在 Cloudflare Pages 环境变量中设置 VITE_API_KEY', 500);
  }

  const body = (await parseBody<InterpretRequest>(request)) || {};
  const { prompt } = body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return errorResponse('缺少解读参数 prompt', 400);
  }

  let model = typeof body.model === 'string' && body.model.trim() ? body.model.trim() : DEFAULT_MODEL;
  if (!ALLOWED_MODELS.has(model)) {
    // 未知模型名不放行，避免被当作代理滥用
    return errorResponse(`不支持的模型：${model}`, 400);
  }

  const upstreamPayload: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 8192,
    temperature: 0.8,
    top_p: 0.95,
    thinking: { type: 'disabled' },
  };

  let status = 502;
  let upstreamText = '';
  try {
    const upstream = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(upstreamPayload),
      // Cloudflare Workers / Pages Functions 不需要额外设置超时，默认运行时限足够
    });

    status = upstream.status;
    upstreamText = await upstream.text().catch(() => '');

    if (!upstream.ok) {
      const snippet = upstreamText.slice(0, 500);
      console.error(`[interpret] DeepSeek 上游失败 status=${status} model=${model} snippet=${snippet}`);
      return errorResponse(
        `解读服务调用失败（${status}）${snippet ? `：${snippet}` : ''}`,
        status >= 500 ? 502 : 400,
      );
    }

    let data: any = null;
    try {
      data = JSON.parse(upstreamText);
    } catch {
      console.error(`[interpret] DeepSeek 返回不是合法 JSON: ${upstreamText.slice(0, 200)}`);
      return errorResponse('解读服务返回格式异常，请稍后重试', 502);
    }

    const choice = data?.choices?.[0];
    const message = choice?.message ?? {};
    const content = typeof message.content === 'string' ? message.content.trim() : '';
    const reasoning = typeof message.reasoning_content === 'string' ? message.reasoning_content.trim() : '';
    const finishReason = typeof choice?.finish_reason === 'string' ? choice.finish_reason : '';
    const finalContent = content || reasoning;

    console.info(
      `[interpret] 成功 status=${status} model=${model || DEFAULT_MODEL} ` +
        `finish_reason=${finishReason} content_len=${content.length} reasoning_len=${reasoning.length}`,
    );

    if (!finalContent) {
      const snippet = JSON.stringify(data).slice(0, 300);
      console.error(`[interpret] 内容为空，snippet=${snippet}`);
      return errorResponse(`解读服务返回空内容（finish_reason=${finishReason}）`, 502);
    }

    return successResponse({
      content: finalContent,
      finishReason,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[interpret] 异常：${msg}`);
    return errorResponse(`解读服务异常：${msg}`, 502);
  }
}
