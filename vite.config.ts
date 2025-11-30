import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked relatively (essential for GitHub Pages)
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // This is critical to prevent "Uncaught ReferenceError: process is not defined" in the browser
  define: {
    'process.env': {}
  }
});