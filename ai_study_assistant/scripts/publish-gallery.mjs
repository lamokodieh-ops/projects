/**
 * Builds Cortex frontend in demo mode and copies to docs/cortex.
 */
import { cpSync, copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const frontend = join(root, 'frontend')
const outDir = join(frontend, 'out')
const dest = join(root, '..', 'docs', 'cortex')

const build = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'build'],
  {
    cwd: frontend,
    env: { ...process.env, NEXT_PUBLIC_DEMO: 'true' },
    stdio: 'inherit',
    shell: true,
  },
)

if (build.status !== 0) {
  process.exit(build.status || 1)
}

if (!existsSync(outDir)) {
  console.error('No frontend/out folder after next build.')
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(outDir, dest, { recursive: true })

// SPA-ish fallback for unknown paths on GitHub Pages
const indexHtml = join(dest, 'index.html')
if (existsSync(indexHtml)) {
  copyFileSync(indexHtml, join(dest, '404.html'))
}

writeFileSync(join(dest, '.nojekyll'), '')
// GitHub Pages site root is docs/ — Jekyll strips _next unless this exists there.
writeFileSync(join(root, '..', 'docs', '.nojekyll'), '')

console.log(`Published gallery demo → ${dest}`)
console.log('Live URL: https://lamokodieh-ops.github.io/projects/cortex/')
