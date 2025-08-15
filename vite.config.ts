import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import cssInJS from 'vite-plugin-css-injs';


export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    command === 'serve' && componentTagger(),
    cssInJS(),
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