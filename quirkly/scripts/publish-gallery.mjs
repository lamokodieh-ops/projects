/**
 * Copies the Vite production build into docs/quirkly for GitHub Pages.
 * Run via: npm run build:gallery
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const out = join(root, '..', 'docs', 'quirkly')

if (!existsSync(dist)) {
  console.error('No dist/ folder. Run vite build first.')
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(dist, out, { recursive: true })

// GitHub Pages SPA fallback: unknown routes serve the app shell
copyFileSync(join(out, 'index.html'), join(out, '404.html'))

console.log(`Published gallery demo → ${out}`)
console.log('Live URL: https://lamokodieh-ops.github.io/projects/quirkly/')
