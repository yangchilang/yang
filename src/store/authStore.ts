import { create } from 'zustand';
import { login, logout, getCurrentUser, User } from '../services/authService';
import { getAuthToken } from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await login({ username, password });
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    // 如果本地没有 token，直接保持未登录状态
    const token = getAuthToken();
    if (!token) {
      set({ isLoading: false, isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await getCurrentUser();
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      // 网络错误或其他错误时，如果有 token 存在，保持登录状态（乐观策略）
      // 只有显式调用 logout 才会退出登录
      set({ isLoading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
