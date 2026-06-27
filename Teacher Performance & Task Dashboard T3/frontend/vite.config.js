import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Teacher-Performance-Task-Dashboard-1/',
  plugins: [react()],
  build: {
    // Force stable esbuild minifier, avoiding experimental bundlers like Rolldown
    minify: 'esbuild',
    rollupOptions: {}
  }
})
