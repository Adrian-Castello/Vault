import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: For GitHub Pages set VITE_BASE_PATH to '/<repo-name>/'.
// If you deploy at the root (custom domain), use '/'.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH ?? '/vault/',
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            emoji: ['emoji-picker-react'],
            motion: ['framer-motion'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    },
  }
})
