import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const frontendUrl = env.VITE_FRONTEND_URL || 'http://localhost:7005'
  const port = Number(new URL(frontendUrl).port || 7005)

  return {
    base: './',
    plugins: [react()],
    server: { port },
    preview: { port },
  }
})
