import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'cipherforge'
const serviceWorkerVersion = process.env.GITHUB_SHA ?? `${Date.now()}`

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cipherforge-service-worker',
      apply: 'build',
      generateBundle() {
        const source = readFileSync(resolve(import.meta.dirname, 'src/sw.js'), 'utf8')
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: source.replaceAll('__CACHE_VERSION__', serviceWorkerVersion),
        })
      },
    },
  ],
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/',
})
