import { useMemo } from 'react';

/**
 * 检测是否为移动设备
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.innerWidth < 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );
}

/**
 * 检测用户是否偏好减少动画
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

/**
 * 移动端优化的星空背景
 * - 移动端大幅减少动画元素数量
 * - 使用纯 CSS 动画替代 framer-motion，性能更好
 * - 支持 prefers-reduced-motion 无障碍
 */
export function MobileOptimizedBackground() {
  const isMobile = isMobileDevice();
  const reducedMotion = prefersReducedMotion();

  // 移动端只渲染 12 颗星星，桌面端 30 颗
  const starCount = isMobile ? 12 : 30;

  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: starCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 4,
    }));
  }, [starCount]);

  // 如果用户偏好减少动画，只显示静态背景
  if (reducedMotion) {
    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              background: 'rgba(212, 175, 55, 0.4)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* 星星 - 使用 CSS 动画 */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: 'linear-gradient(135deg, #FFD700, #FF69B4)',
            boxShadow: `0 0 ${star.size * 2}px rgba(255, 215, 0, 0.5)`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* 移动端不渲染流星，桌面端只渲染 2 颗 */}
      {!isMobile && (
        <>
          <div
            className="absolute w-1 h-1 rounded-full shooting-star"
            style={{
              boxShadow: '0 0 10px 2px rgba(255, 215, 0, 0.6)',
            }}
          />
          <div
            className="absolute w-1 h-1 rounded-full shooting-star"
            style={{
              animationDelay: '4s',
              boxShadow: '0 0 10px 2px rgba(255, 105, 180, 0.6)',
            }}
          />
        </>
      )}

      {/* 光晕效果 - 移动端只渲染 2 个，桌面端 4 个 */}
      {Array.from({ length: isMobile ? 2 : 4 }, (_, i) => (
        <div
          key={`glow-${i}`}
          className="absolute rounded-full glow-orb"
          style={{
            width: `${30 + i * 20}px`,
            height: `${30 + i * 20}px`,
            background:
              i % 2 === 0
                ? 'radial-gradient(circle, rgba(255, 215, 0, 0.15), transparent 70%)'
                : 'radial-gradient(circle, rgba(255, 105, 180, 0.1), transparent 70%)',
            filter: 'blur(30px)',
            left: `${10 + i * 25}%`,
            top: `${20 + (i % 2) * 40}%`,
            animationDuration: `${8 + i * 4}s`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}

      {/* 静态几何图案背景 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20400%20400%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2230%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2260%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%2290%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.15%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22200%22%20r%3D%22120%22%20fill%3D%22none%22%20stroke%3D%22%23d4af37%22%20stroke-width%3D%220.15%22%2F%3E%3C/svg%3E')] opacity-5" />
    </div>
  );
}
