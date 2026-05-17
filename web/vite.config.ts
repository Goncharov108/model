import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { privatePhilosophyPlugin } from './vite.privatePhilosophyPlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), privatePhilosophyPlugin()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/hermes': {
        target: 'http://127.0.0.1:9119',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hermes/, '') || '/',
        ws: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Forwarded-Prefix', '/hermes')
          })
        },
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
