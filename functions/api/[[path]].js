export async function onRequest(context) {
  const { request, env, params } = context;
  
  const backendUrl = env.BACKEND_URL || 'https://yang-production-c0f7.up.railway.app';
  const url = new URL(request.url);
  const targetUrl = `${backendUrl}/api/${params.path.join('/')}${url.search}`;
  
  const newRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    credentials: request.credentials,
  });
  
  const response = await fetch(newRequest);
  
  const newResponse = new Response(response.body, response);
  
  newResponse.headers.set('Access-Control-Allow-Origin', url.origin);
  newResponse.headers.set('Access-Control-Allow-Credentials', 'true');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept');
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  return newResponse;
}
