import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Login } from './Auth/Login';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * 路由守卫组件
 * - 未登录用户显示登录界面
 * - 已登录用户显示受保护内容
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // 认证检查中显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-tarot-gold/20 rounded-full" />
            <div className="absolute inset-2 border-4 border-tarot-gold/40 rounded-full animate-spin" style={{ animationDuration: '1.5s' }} />
            <div className="absolute inset-4 border-4 border-tarot-gold/60 rounded-full" />
          </div>
          <p className="text-tarot-gray/60 font-crimson">正在检查登录状态...</p>
        </motion.div>
      </div>
    );
  }

  // 未登录显示登录界面或自定义 fallback
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl text-tarot-gold/30 mb-4"
          >
            🔒
          </motion.div>
          <h2 className="text-2xl font-decorative text-tarot-gray mb-2">
            需要登录
          </h2>
          <p className="text-tarot-gray/60 font-crimson mb-6">
            请先登录账号以使用塔罗解读功能
          </p>
        </div>
        <Login />
      </motion.div>
    );
  }

  // 已登录显示受保护内容
  return <>{children}</>;
}
