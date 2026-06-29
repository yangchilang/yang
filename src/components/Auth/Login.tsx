import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

const REMEMBER_KEY = 'tarot_remember_username';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    // 加载记住的用户名
    const savedUsername = localStorage.getItem(REMEMBER_KEY);
    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(username, password);
      // 登录成功后，authStore 的 isAuthenticated 状态会自动更新
      // ProtectedRoute 会响应状态变化，无需刷新页面
      // 处理记住密码
      if (rememberMe) {
        localStorage.setItem(REMEMBER_KEY, username);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // error handled by store
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-tarot-gold/30 shadow-xl p-8">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl text-tarot-gold mb-4"
          >
            ✧
          </motion.div>
          <h1 className="text-3xl font-decorative text-tarot-gray mb-2">
            欢迎回来
          </h1>
          <p className="text-tarot-gray/60 font-crimson">
            登录以保存您的解读历史
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-tarot-gray/80 font-crimson text-sm mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-tarot-gold/20 bg-white/80 text-tarot-gray font-crimson focus:border-tarot-gold focus:outline-none focus:shadow-lg focus:shadow-tarot-gold/20 transition-all"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-tarot-gray/80 font-crimson text-sm mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-tarot-gold/20 bg-white/80 text-tarot-gray font-crimson focus:border-tarot-gold focus:outline-none focus:shadow-lg focus:shadow-tarot-gold/20 transition-all"
              placeholder="请输入密码"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-tarot-gold bg-white border-tarot-gold/30 rounded focus:ring-tarot-gold focus:ring-offset-0"
            />
            <label htmlFor="rememberMe" className="ml-2 text-tarot-gray/70 font-crimson text-sm cursor-pointer">
              记住用户名
            </label>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-crimson text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-decorative text-lg bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>
        </form>

        
      </div>
    </motion.div>
  );
}
