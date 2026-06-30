import "./instrument";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import CinematicIntro from "./components/CinematicIntro";
import CookieConsent from "./components/CookieConsent";
import "./index.css";

document.documentElement.classList.add("dark");

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-sm">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            We've been notified and are looking into it. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }
    showDialog
  >
    <CinematicIntro />
    <App />
    <CookieConsent />
    <Analytics />
    <SpeedInsights />
  </Sentry.ErrorBoundary>,
);
