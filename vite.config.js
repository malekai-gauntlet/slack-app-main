import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add WebSocket configuration
    hmr: {
      // Increase timeout and retry settings
      timeout: 5000,
      overlay: true,
      // Add more stable WebSocket settings
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    // Add watch options to prevent excessive reloads
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
});