import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss/nesting'),
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
});