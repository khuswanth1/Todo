import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
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
