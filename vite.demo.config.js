import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// One-off config to build only the standalone home redesign preview, avoiding
// the app's index.html entry (and its Auth.jsx/auth.jsx case collision in the
// dev scanner). Not part of the shipped app.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '/tmp/demo-dist',
    emptyOutDir: true,
    rollupOptions: { input: 'home-demo.html' },
  },
})
