import { useAuthStore } from '../store/authStore';

interface NavbarProps {
  view: 'home' | 'history-detail' | 'new-reading' | 'reading';
  setView: (view: 'home' | 'history-detail' | 'new-reading' | 'reading') => void;
}

export function Navbar({ view, setView }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    setView('home');
  };

  const handleLogoClick = () => {
    setView('home');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm animate-fade-in-down">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl text-tarot-gold transition-transform group-hover:rotate-12">✧</span>
            <span className="font-decorative text-tarot-gray text-xl">shiyue-Tarot</span>
          </button>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-tarot-gray/80 font-crimson hidden sm:inline">
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
              <span className="text-tarot-gray/50 font-crimson text-sm">
                未登录
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
