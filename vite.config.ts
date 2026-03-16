import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    proxy: {
      '/ha-api': {
        target: 'http://192.168.4.107:8123',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ha-api/, '/api'),
      },
    },
  },
});
