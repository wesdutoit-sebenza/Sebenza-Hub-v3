import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.log("[Sentry] No DSN configured, error tracking disabled");
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });

  console.log("[Sentry] Error tracking initialized");
}

export function setupSentryRequestHandlers(_app: Express) {
  if (!process.env.SENTRY_DSN) return;
}

export function setupSentryErrorHandler(app: Express) {
  if (!process.env.SENTRY_DSN) return;
  
  Sentry.setupExpressErrorHandler(app);
}

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

export function clearUser() {
  Sentry.setUser(null);
}

export { Sentry };
