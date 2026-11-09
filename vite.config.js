import { defineConfig } from 'vite'
import { resolve } from 'path'

// 멀티 페이지(MPA). 개발 시 /api 는 로컬 API 서버(8790)로 프록시. 운영은 Vercel 이 같은 도메인에서 처리.
export default defineConfig({
  server: {
    port: 5180,
    strictPort: true,
    proxy: { '/api': 'http://localhost:8790' },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        biz: resolve(__dirname, 'pages/biz.html'),
        complex: resolve(__dirname, 'pages/complex.html'),
        unit: resolve(__dirname, 'pages/unit.html'),
        visit: resolve(__dirname, 'pages/visit.html'),
        admin: resolve(__dirname, 'pages/admin.html'),
      },
    },
  },
})
