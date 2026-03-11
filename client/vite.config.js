import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    allowedHosts: [
      '.ngrok-free.app',
      '.trycloudflare.com',
      'localhost',
    ],
    port: 5173,
    proxy: {
      // REST API calls go through proxy (fine for HTTP)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Socket.IO proxy — only used as fallback.
      // TerminalLayout connects directly to :5000 to avoid WS frame issues.
      // Keeping this here for polling transport fallback support.
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  }
})