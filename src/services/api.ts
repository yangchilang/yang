export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const API_BASE_URL = 'https://yang-production-c0f7.up.railway.app';

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = getApiUrl(path);
  const token = localStorage.getItem('tarot_auth_token');

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }));
      return {
        success: false,
        error: error.error || `请求失败 (${response.status})`,
      };
    }

    return response.json();
  } catch (error) {
    return {
      success: false,
      error: '网络连接失败，请检查网络后重试',
    };
  }
}

export function setAuthToken(token: string): void {
  localStorage.setItem('tarot_auth_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('tarot_auth_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('tarot_auth_token');
}
