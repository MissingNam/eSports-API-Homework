import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Puerto fijo: el backend solo acepta CORS desde http://localhost:5173
export default defineConfig({
  plugins: [vue()],
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true
  }
})