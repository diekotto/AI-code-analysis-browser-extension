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
        popup: 'popup.html',
      },
      output: {
        entryFileNames: 'popup/[name]-[hash].js',
        chunkFileNames: 'popup/[name]-[hash].js',
        assetFileNames: 'popup/[name]-[hash].[ext]',
      },
    },
  },
});
