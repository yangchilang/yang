import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    // 代码分割优化：将大型依赖拆分为单独 chunk
    rollupOptions: {
      output: {
        manualChunks: {
          // React 核心库单独打包
          'react-vendor': ['react', 'react-dom'],
          // 动画库单独打包
          'animation': ['framer-motion'],
          // 工具库
          'utils': ['axios', 'zustand'],
          // 大型第三方库
          'html2canvas': ['html2canvas'],
        },
      },
    },
    // 压缩优化（使用 esbuild，Vite 内置）
    minify: 'esbuild',
  },
})
