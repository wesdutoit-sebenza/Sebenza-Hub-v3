/**
 * Sentry instrumentation file
 * 
 * For full Express auto-instrumentation with Sentry v8 ESM, you need to run:
 *   node --import tsx/esm --import ./instrument.ts server/index.ts
 * 
 * The warning "express is not instrumented" is informational - error tracking
 * still works for all manually captured exceptions via Sentry.captureException().
 * Auto-instrumentation of Express routes is not available without the --import flag.
 */

import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

export { Sentry };
