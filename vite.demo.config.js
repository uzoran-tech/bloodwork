import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One-off config to build only the standalone Insights preview. Not shipped.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '/tmp/demo-dist',
    emptyOutDir: true,
    rollupOptions: { input: 'home-demo.html' },
  },
})
