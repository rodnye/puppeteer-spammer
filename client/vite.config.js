import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: './',
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': process.env.VITE_API_BASE || 'http://localhost:3000',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
});
