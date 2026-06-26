import { apiRequest, setAuthToken, removeAuthToken } from './api';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    username: string;
    created_at: string;
    updated_at: string;
  };
  token: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.success && response.data) {
    setAuthToken(response.data.token);
    return response.data;
  }

  throw new Error(response.error || '登录失败');
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiRequest<User>('/api/auth/me');

  if (response.success && response.data) {
    return response.data;
  }

  throw new Error(response.error || '获取用户信息失败');
}

export function logout(): void {
  removeAuthToken();
}
