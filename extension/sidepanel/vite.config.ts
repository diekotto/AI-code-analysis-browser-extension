import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        sidepanel: 'sidepanel.html',
      },
      output: {
        entryFileNames: 'sidepanel/[name]-[hash].js',
        chunkFileNames: 'sidepanel/[name]-[hash].js',
        assetFileNames: 'sidepanel/[name]-[hash].[ext]',
      },
    },
  },
});
