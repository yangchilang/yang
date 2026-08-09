import { SignJWT, jwtVerify } from 'jose';
import { Env, JwtPayload } from './types';

function getSecret(env: Env): Uint8Array {
  const secret = env.JWT_SECRET || 'default_secret_key';
  return new TextEncoder().encode(secret);
}

export async function generateToken(payload: JwtPayload, env: Env): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret(env));
}

export async function verifyToken(token: string, env: Env): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret(env));
  return payload as unknown as JwtPayload;
}

export async function getAuthUser(request: Request, env: Env): Promise<JwtPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    return await verifyToken(token, env);
  } catch {
    return null;
  }
}
