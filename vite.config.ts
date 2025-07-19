import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    command === 'serve' && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      'zustand': 'zustand/esm',
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    target: 'esnext',
  },
}));