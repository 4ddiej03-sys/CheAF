import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🔥 Simple, stable config for Capacitor + iOS
export default defineConfig({
  base: './', // ✅ REQUIRED for iOS white screen fix
  plugins: [react()],
})