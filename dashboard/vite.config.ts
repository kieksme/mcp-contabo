import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Frontend build only — the Express server is built separately via tsc
// (see package.json `build:server`). Static output goes to dist/web so it
// doesn't collide with the server's dist/server output.
export default defineConfig({
  root: "src/web",
  plugins: [react()],
  build: {
    outDir: "../../dist/web",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/health": "http://localhost:3000",
    },
  },
});
