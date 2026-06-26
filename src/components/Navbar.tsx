import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  view: 'home' | 'login' | 'history' | 'history-detail';
  setView: (view: 'home' | 'login' | 'history' | 'history-detail') => void;
}

export function Navbar({ view, setView }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setView('home');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm"
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl text-tarot-gold transition-transform group-hover:rotate-12">✧</span>
            <span className="font-decorative text-tarot-gray text-xl">shiyue-Tarot</span>
          </button>

          <div className="flex items-center gap-4">
            {view === 'home' && (
              <button
                onClick={() => setView('history')}
                className="px-4 py-2 text-tarot-gray/80 hover:text-tarot-gold font-crimson transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                历史记录
              </button>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-tarot-gray/80 font-crimson">
                  欢迎, {user?.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-tarot-gray/80 hover:text-tarot-gold font-crimson transition-colors"
                >
                  登出
                </button>
              </div>
            ) : (
              <button
                onClick={() => setView('login')}
                className="px-4 py-2 text-tarot-gray/80 hover:text-tarot-gold font-crimson transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
