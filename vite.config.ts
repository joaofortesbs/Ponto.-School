
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import { componentTagger } from "lovable-tagger";

const conditionalPlugins: [string, Record<string, any>][] = [];
conditionalPlugins.push(["tempo-devtools/swc", {}]);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base:
    process.env.NODE_ENV === "development"
      ? "/"
      : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"],
  },
  plugins: [
    react({
      plugins: conditionalPlugins,
    }),
    tempo(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "::",
    port: 8080,
  },
}));
