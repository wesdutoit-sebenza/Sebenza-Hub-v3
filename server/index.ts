/**
 * Development server entry point
 * Imports core logic and adds Vite HMR for development
 * Run with: tsx server/index.ts
 */

import { app, initializeServer, startServer, log } from "./core";
import { setupVite } from "./vite";

// Re-export for any modules that import from index.ts
export { app, initializeServer, startServer, log };

(async () => {
  const server = await initializeServer();
  
  // Setup Vite HMR for development
  await setupVite(app, server);
  console.log("[Development] Vite HMR attached");
  
  startServer(server);
})();
