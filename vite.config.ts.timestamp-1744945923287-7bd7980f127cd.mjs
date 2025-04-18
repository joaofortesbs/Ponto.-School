// vite.config.ts
import path from "path";
import { defineConfig } from "file:///home/runner/workspace/node_modules/vite/dist/node/index.js";
import react from "file:///home/runner/workspace/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { tempo } from "file:///home/runner/workspace/node_modules/tempo-devtools/dist/vite/index.js";
var __vite_injected_original_dirname = "/home/runner/workspace";
var conditionalPlugins = [];
conditionalPlugins.push(["tempo-devtools/swc", {}]);
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "development" ? "/" : process.env.VITE_BASE_PATH || "/",
  optimizeDeps: {
    entries: ["src/main.tsx", "src/tempobook/**/*"]
  },
  plugins: [
    react({
      plugins: conditionalPlugins
    }),
    tempo()
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
    host: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9ydW5uZXIvd29ya3NwYWNlL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3J1bm5lci93b3Jrc3BhY2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgeyB0ZW1wbyB9IGZyb20gXCJ0ZW1wby1kZXZ0b29scy9kaXN0L3ZpdGVcIjtcblxuY29uc3QgY29uZGl0aW9uYWxQbHVnaW5zOiBbc3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBhbnk+XVtdID0gW107XG5jb25kaXRpb25hbFBsdWdpbnMucHVzaChbXCJ0ZW1wby1kZXZ0b29scy9zd2NcIiwge31dKTtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGJhc2U6XG4gICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09IFwiZGV2ZWxvcG1lbnRcIlxuICAgICAgPyBcIi9cIlxuICAgICAgOiBwcm9jZXNzLmVudi5WSVRFX0JBU0VfUEFUSCB8fCBcIi9cIixcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZW50cmllczogW1wic3JjL21haW4udHN4XCIsIFwic3JjL3RlbXBvYm9vay8qKi8qXCJdLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3Qoe1xuICAgICAgcGx1Z2luczogY29uZGl0aW9uYWxQbHVnaW5zLFxuICAgIH0pLFxuICAgIHRlbXBvKCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBwcmVzZXJ2ZVN5bWxpbmtzOiB0cnVlLFxuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxuICBzZXJ2ZXI6IHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgYWxsb3dlZEhvc3RzOiB0cnVlLFxuICAgIGhvc3Q6IHRydWUsXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBb1AsT0FBTyxVQUFVO0FBQ3JRLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sV0FBVztBQUNsQixTQUFTLGFBQWE7QUFIdEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTSxxQkFBc0QsQ0FBQztBQUM3RCxtQkFBbUIsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQztBQUdsRCxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixNQUNFLFFBQVEsSUFBSSxhQUFhLGdCQUNyQixNQUNBLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxFQUNwQyxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsZ0JBQWdCLG9CQUFvQjtBQUFBLEVBQ2hEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixTQUFTO0FBQUEsSUFDWCxDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1Asa0JBQWtCO0FBQUEsSUFDbEIsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFTixjQUFjO0FBQUEsSUFDZCxNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
