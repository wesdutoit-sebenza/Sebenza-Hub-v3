import * as Sentry from "@sentry/node";
import type { Express, Request, Response, NextFunction } from "express";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("[Sentry] No DSN configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });

  console.log("[Sentry] Error tracking initialized");
}

export function setupSentryMiddleware(app: Express) {
  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export { Sentry };
