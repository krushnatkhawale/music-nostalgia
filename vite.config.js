import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages sub-path for this repo
export default defineConfig({
  base: '/music-nostalgia/',
  plugins: [react()],
})
