import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * Tracks SPA route changes and scroll depth for both GA4 (if installed)
 * and Plausible (already installed on the site).
 *
 * Drop this hook once in App.tsx — it fires on every navigation automatically.
 */
export function usePageTracking() {
  const [location] = useLocation();
  const firedThresholds = useRef<Set<number>>(new Set());

  // Page-view on every route change
  useEffect(() => {
    const path = location;
    const title = document.title;

    // GA4
    window.gtag?.("event", "page_view", { page_path: path, page_title: title });

    // Plausible (fires automatically via script — this is just belt-and-braces
    // for SPA navigation that Plausible's script may miss without hash routing)
    window.plausible?.("pageview");

    // Reset scroll depth tracking on each navigation
    firedThresholds.current = new Set();

    const handleScroll = () => {
      const scrolled =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight *
        100;

      for (const threshold of SCROLL_THRESHOLDS) {
        if (scrolled >= threshold && !firedThresholds.current.has(threshold)) {
          firedThresholds.current.add(threshold);
          window.gtag?.("event", "scroll", {
            event_category: "Engagement",
            event_label: `${threshold}%`,
            value: threshold,
          });
          window.plausible?.("Scroll Depth", { props: { depth: `${threshold}%`, page: path } });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);
}
