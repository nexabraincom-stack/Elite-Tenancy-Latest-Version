import * as Sentry from "@sentry/node";

// Sentry must be initialised before any other imports so it can
// instrument Express, database calls, and all async operations.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? "production",
  enabled: process.env.NODE_ENV === "production",

  sendDefaultPii: true,
  enableLogs: true,

  // Capture 10% of transactions for performance monitoring
  tracesSampleRate: 0.1,
});
