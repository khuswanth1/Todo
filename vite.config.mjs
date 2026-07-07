import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    proxy: {
      '/tasks': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
      '/notify': 'http://localhost:8080',
      '/oauth2': 'http://localhost:8080',
      '/api': 'http://localhost:8080'
    }
  },
  build: {
    target: 'esnext' // Support for top-level await
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true
      }
    }
  },
  esbuild: {
    supported: {
      'top-level-await': true
    }
  }
});
