/**
 * Production server entry point
 * Imports core logic ONLY - NO Vite dependencies
 * Built by esbuild and run on Render
 */

import { initializeServer, startServer } from "./core";

console.log("[Production] Starting Sebenza Hub API server...");

initializeServer().then((server) => {
  console.log("[Production] Backend API only mode - frontend served by Vercel");
  startServer(server);
}).catch((err) => {
  console.error("[Production] Failed to start server:", err);
  process.exit(1);
});
