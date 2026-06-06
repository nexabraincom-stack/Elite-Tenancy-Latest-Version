import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import CinematicIntro from "./components/CinematicIntro";
import CookieConsent from "./components/CookieConsent";
import "./index.css";

// Sentry must be initialised before React renders so it can catch errors
// in all components, lazy chunks, and async route loaders.
// Only active in production — silent in local dev.
Sentry.init({
  dsn: "https://e1f2c460146a3209c58eca3b4d6aeef3@o4511517845684224.ingest.de.sentry.io/4511517861019728",
  environment: import.meta.env.MODE,          // "production" | "development"
  enabled: import.meta.env.PROD,              // off in dev, on in prod
  integrations: [
    Sentry.browserTracingIntegration(),       // track slow page loads & API calls
    Sentry.replayIntegration({                // record session on error
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Capture 10% of transactions for performance monitoring (free tier safe)
  tracesSampleRate: 0.1,
  // Propagate trace headers to the Elite Tenancy API so backend errors
  // link back to the frontend session that triggered them
  tracePropagationTargets: [
    "https://api.elitetenancy.co.uk",
    /^\/api\//,
  ],
  // Record 5% of sessions normally; 100% of sessions that hit an error
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
});

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <>
    <CinematicIntro />
    <App />
    <CookieConsent />
    <Analytics />
    <SpeedInsights />
  </>,
);
