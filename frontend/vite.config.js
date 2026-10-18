import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { existsSync, readFileSync } from 'fs'

function serveFaceMesh() {
  const faceMeshDir = resolve('node_modules/@mediapipe/face_mesh')
  return {
    name: 'serve-face-mesh',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.includes('face_mesh')) return next()
        const filename = req.url.split('/').pop().split('?')[0]
        const filePath = resolve(faceMeshDir, filename)
        if (!existsSync(filePath)) return next()
        const ext = filename.split('.').pop()
        const types = { js: 'application/javascript', wasm: 'application/wasm', data: 'application/octet-stream', binarypb: 'application/octet-stream' }
        res.setHeader('Content-Type', types[ext] || 'application/octet-stream')
        res.end(readFileSync(filePath))
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveFaceMesh()],
})
