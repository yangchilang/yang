import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export function Register({ onNavigateToLogin }: RegisterProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('密码至少需要8个字符');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }

    try {
      await register(username, password);
      window.location.reload();
    } catch {
      // error handled by store
    }
  };

  const displayError = localError || error;

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
            ✦
          </motion.div>
          <h1 className="text-3xl font-decorative text-tarot-gray mb-2">
            创建账号
          </h1>
          <p className="text-tarot-gray/60 font-crimson">
            注册以保存和管理您的解读历史
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="至少8个字符"
              required
            />
          </div>

          <div>
            <label className="block text-tarot-gray/80 font-crimson text-sm mb-2">
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-tarot-gold/20 bg-white/80 text-tarot-gray font-crimson focus:border-tarot-gold focus:outline-none focus:shadow-lg focus:shadow-tarot-gold/20 transition-all"
              placeholder="再次输入密码"
              required
            />
          </div>

          {displayError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 font-crimson text-sm text-center"
            >
              {displayError}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-decorative text-lg bg-gradient-to-r from-tarot-gold to-yellow-500 text-white hover:shadow-lg hover:shadow-tarot-gold/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-tarot-gray/60 font-crimson text-sm">
            已有账号？
            <button
              onClick={onNavigateToLogin}
              className="ml-1 text-tarot-gold hover:text-tarot-gold/80 font-crimson transition-colors"
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
