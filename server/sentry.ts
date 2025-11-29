/**
 * Sentry helper functions
 * The actual initialization happens in instrument.ts
 */

import * as Sentry from "@sentry/node";
import type { Express } from "express";

export function initSentry() {
  if (process.env.SENTRY_DSN) {
    console.log("[Sentry] Error tracking enabled");
  }
}

export function setupSentryRequestHandlers(_app: Express) {
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
