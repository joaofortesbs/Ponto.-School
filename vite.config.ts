
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
    react({
      // Disable TypeScript checking in SWC to avoid conflicts
      tsDecorators: true,
    }),
    command === 'serve' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure esbuild doesn't interfere with TypeScript
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  },
  // Optimize build process
  build: {
    target: 'esnext',
    minify: 'esbuild',
  }
}));
