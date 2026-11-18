import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En tu PC, /api se redirige a la API de Dragon Ball (igual que en Netlify),
// así el navegador nunca tiene problemas de CORS.
const proxy = {
  '/api': {
    target: 'https://dragonball-api.com',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy },
  preview: { proxy },
})
