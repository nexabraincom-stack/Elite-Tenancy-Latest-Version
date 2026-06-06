import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,

  sendDefaultPii: true,
  enableLogs: true,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // 10% of transactions for performance (safe within free 5k/mo limit)
  tracesSampleRate: 0.1,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/api\.elitetenancy\.co\.uk/,
    /^\/api\//,
  ],

  // 5% of normal sessions; 100% of sessions that hit an error
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
});
