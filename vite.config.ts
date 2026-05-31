import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // Split heavy vendors into their own cacheable chunks (they're only
            // pulled in by lazy-loaded components, so they stay out of the
            // initial gateway load).
            manualChunks: {
              firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
              motion: ['motion'],
              markdown: ['react-markdown', 'remark-gfm', 'remark-breaks'],
            },
          },
        },
      }
    };
});
