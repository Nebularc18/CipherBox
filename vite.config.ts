import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'cipherforge'
const serviceWorkerVersion = process.env.GITHUB_SHA ?? `${Date.now()}`
const serviceWorkerPath = resolve(import.meta.dirname, 'src/sw.js')

function createServiceWorkerSource() {
  return readFileSync(serviceWorkerPath, 'utf8')
    .replaceAll('__CACHE_VERSION__', serviceWorkerVersion)
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'cipherforge-service-worker',
      configureServer(server) {
        server.middlewares.use('/sw.js', (_request, response) => {
          response.setHeader('Content-Type', 'application/javascript')
          response.end(createServiceWorkerSource())
        })
      },
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: createServiceWorkerSource(),
        })
      },
    },
  ],
  base: process.env.GITHUB_ACTIONS ? `/${repoName}/` : '/',
})
