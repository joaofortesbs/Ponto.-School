import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Polyfill process for browser compatibility
    'process.env': {},
    'global': 'globalThis',
  },
  esbuild: {
    target: 'esnext',
  },
}));