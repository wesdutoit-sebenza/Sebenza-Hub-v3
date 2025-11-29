/**
 * Core server setup - shared between development and production
 * This file has NO vite dependencies and is safe to bundle
 */

import "./instrument";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import compression from "compression";
import { pool as pgPool } from "./db-pool";
import { initSentry, setupSentryRequestHandlers, setupSentryErrorHandler } from "./sentry";

initSentry();

// Simple log function for server output
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export const app = express();

setupSentryRequestHandlers(app);

// Enable Brotli/Gzip compression for all responses
app.use(compression({
  brotli: { enabled: true },
  threshold: 0
}));

// CORS configuration for cross-origin requests (Vercel frontend → Render backend)
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    if (process.env.NODE_ENV === "production" && allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    }
    
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Session configuration
const PgSession = connectPgSimple(session);

// Pre-create session table to avoid race conditions
setTimeout(async () => {
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
    `);
    console.log('[Session] Session table ready');
  } catch (err: any) {
    console.error('[Session] Table creation warning:', err.message);
  }
}, 2000);

// Cookie domain configuration for shared domain (sebenzahub.co.za + api.sebenzahub.co.za)
// COOKIE_DOMAIN should be ".sebenzahub.co.za" for production with subdomains
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
const isProduction = process.env.NODE_ENV === "production" || !!process.env.REPLIT_DEPLOYMENT;

app.use(
  session({
    store: new PgSession({
      pool: pgPool,
      tableName: "session",
      createTableIfMissing: false,
    }),
    secret: process.env.SESSION_SECRET || "sebenza-hub-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      // Use "lax" for same root domain (sebenzahub.co.za + api.sebenzahub.co.za)
      // Use "none" only for completely different domains (requires secure: true)
      sameSite: cookieDomain ? "lax" : (process.env.ALLOWED_ORIGINS ? "none" : "lax"),
      // Set domain for cross-subdomain cookies (e.g., ".sebenzahub.co.za")
      domain: cookieDomain,
    },
    proxy: true,
  })
);

app.use(cookieParser());
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files with aggressive caching
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (/\.(pdf|doc|docx)$/i.test(path)) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// Initialize routes and return HTTP server
export async function initializeServer() {
  // Admin Setup Endpoint
  const { db } = await import('./db');
  const { users } = await import('@shared/schema');
  const { eq } = await import('drizzle-orm');
  
  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { secret, email } = req.body;

      if (!secret || secret !== process.env.ADMIN_SETUP_SECRET) {
        return res.status(403).json({
          success: false,
          message: "Invalid setup secret",
        });
      }

      const existingAdmins = await db
        .select()
        .from(users)
        .where(eq(users.role, "admin"));

      if (existingAdmins.length > 0) {
        return res.status(403).json({
          success: false,
          message: "Admin users already exist. This endpoint is locked.",
        });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: "Valid email address required",
        });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (!user) {
        return res.status(404).json({
          success: false,
          message: `No user found with email: ${email}`,
        });
      }

      const [updatedUser] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, user.id))
        .returning();

      console.log(`[Admin Setup] User ${email} promoted to admin by setup endpoint`);

      res.json({
        success: true,
        message: `User ${email} has been promoted to admin`,
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } catch (error: any) {
      console.error("[Admin Setup] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to setup admin user",
      });
    }
  });
  
  // Setup authentication routes
  const { setupAuthRoutes } = await import('./auth-routes');
  setupAuthRoutes(app);
  
  const server = await registerRoutes(app);

  setupSentryErrorHandler(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  return server;
}

// Start server and background services
export function startServer(server: ReturnType<typeof import('http').createServer>) {
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start background workers if Redis is available
    import('./start-workers.js').catch(err => {
      console.log('[Workers] Background workers not started:', err.message);
    });
    
    // Initialize billing cron job for monthly usage resets
    import('./services/billing-cron.js').then(({ initializeBillingCron }) => {
      initializeBillingCron();
    }).catch(err => {
      console.error('[Billing Cron] Failed to initialize billing cron job:', err.message);
    });
  });
}
