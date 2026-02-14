import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [".."]
    },
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist"
  }
});
