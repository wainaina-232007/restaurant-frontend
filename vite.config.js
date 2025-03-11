// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    // Proxy API requests to Laravel backend
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Uncomment this line if your Laravel API doesn't have an /api prefix
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})