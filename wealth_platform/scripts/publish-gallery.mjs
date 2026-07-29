/**
 * Copies the Fortis Vite demo build into docs/fortis for GitHub Pages.
 * Run via: npm run build:gallery (from frontend/)
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'frontend', 'dist')
const out = join(root, '..', 'docs', 'fortis')

if (!existsSync(dist)) {
  console.error('No frontend/dist folder. Run vite build --mode gallery first.')
  process.exit(1)
}

rmSync(out, { recursive: true, force: true })
mkdirSync(out, { recursive: true })
cpSync(dist, out, { recursive: true })
copyFileSync(join(out, 'index.html'), join(out, '404.html'))

console.log(`Published gallery demo → ${out}`)
console.log('Live URL: https://lamokodieh-ops.github.io/projects/fortis/')
