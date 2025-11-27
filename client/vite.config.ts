import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@shared/schema": path.resolve(import.meta.dirname, "server-schema"),
      "@assets": path.resolve(import.meta.dirname, "../attached_assets"),
    },
  },

  root: ".",  // ★ IMPORTANT: ensures Vercel builds inside "client"

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },

  server: {
    port: 5000,
    host: "0.0.0.0",
  },
});
