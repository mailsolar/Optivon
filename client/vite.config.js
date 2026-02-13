import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Ensure assets are relative for GitHub Pages
  server: {
    allowedHosts: ['.ngrok-free.app'],
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    }
  }
})
