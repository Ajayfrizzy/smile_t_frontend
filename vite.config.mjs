import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    historyApiFallback: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  // Ensure proper MIME types for module scripts
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
