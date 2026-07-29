import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Gallery builds use base /projects/fortis/ (see npm run build:gallery).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'gallery' ? '/projects/fortis/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
}))
