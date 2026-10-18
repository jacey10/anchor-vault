import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Required for GitHub Pages project deployment
  base: '/anchor-vault/',

  build: {
    // Keep in sync with the /assets/ rules in vercel.json
    assetsDir: 'assets',
  },
})
