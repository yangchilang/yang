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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      clearError();
      return;
    }
    
    clearError();
    setIsSubmitting(true);
    
    try {
      await register(username, password);
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto px-4"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-tarot-gold/30 via-gray-300/30 to-tarot-gold/30 rounded-2xl blur-lg"></div>
        
        <div className="relative bg-white rounded-2xl p-8 border border-tarot-gold/20 shadow-lg">
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-6xl mb-4 text-tarot-gold"
            >
              ✦
            </motion.div>
            <h2 className="text-3xl font-decorative text-tarot-gray mb-2">加入神秘世界</h2>
            <p className="text-tarot-gray/60 font-crimson">开启你的塔罗之旅</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-tarot-gray/80 font-crimson mb-2">用户名</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tarot-gold/60">✧</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  className="w-full bg-tarot-lightgray/30 border border-tarot-gold/30 rounded-lg px-10 py-3 text-tarot-gray placeholder-tarot-gray/40 focus:outline-none focus:border-tarot-gold focus:ring-1 focus:ring-tarot-gold/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-tarot-gray/80 font-crimson mb-2">密码</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tarot-gold/60">✧</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少8个字符"
                  required
                  minLength={8}
                  className="w-full bg-tarot-lightgray/30 border border-tarot-gold/30 rounded-lg px-10 pr-12 py-3 text-tarot-gray placeholder-tarot-gray/40 focus:outline-none focus:border-tarot-gold focus:ring-1 focus:ring-tarot-gold/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-tarot-gray/60 hover:text-tarot-gold transition-colors"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-tarot-gray/80 font-crimson mb-2">确认密码</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-tarot-gold/60">✧</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="再次输入密码"
                  required
                  minLength={8}
                  className={`w-full bg-tarot-lightgray/30 border rounded-lg px-10 pr-12 py-3 text-tarot-gray placeholder-tarot-gray/40 focus:outline-none focus:ring-1 transition-all ${
                    password !== confirmPassword && confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-tarot-gold/30 focus:border-tarot-gold focus:ring-tarot-gold/30'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-tarot-gray/60 hover:text-tarot-gold transition-colors"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {password !== confirmPassword && confirmPassword && (
                <p className="text-red-500 text-sm mt-1 font-crimson">密码不一致</p>
              )}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-center font-crimson"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={isSubmitting || password !== confirmPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-tarot-gold to-yellow-500 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-tarot-gold/30 transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  注册中...
                </span>
              ) : (
                '注册'
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center"
          >
            <p className="text-tarot-gray/60 font-crimson">
              已有账号？{' '}
              <button
                onClick={onNavigateToLogin}
                className="text-tarot-gold hover:text-yellow-600 transition-colors underline"
              >
                立即登录
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
