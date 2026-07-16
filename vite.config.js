import { defineConfig } from 'vite'

export default defineConfig({
  base: '/lexvision/',   // <-- مهم جدًا لوجود الشرطتين المائلتين في البداية والنهاية
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
    open: true
  }
})
