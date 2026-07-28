import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Production builds target the GitHub Pages gallery path:
// https://lamokodieh-ops.github.io/projects/mindcare/
// Local `npm run dev` keeps base `/`.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/projects/mindcare/' : '/',
}))
