
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: true
  },
  plugins: [
    react(),
    command === 'serve' && componentTagger(),
  ].filter(Boolean),
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
