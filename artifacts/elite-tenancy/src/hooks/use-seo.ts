import { useEffect } from "react";

const BASE_URL = "https://www.elitetenancy.co.uk";
const DEFAULT_TITLE = "Elite Tenancy — Premium UK Lettings Platform";
const DEFAULT_DESC =
  "Elite Tenancy connects high-quality tenants with premium UK rental properties. AI-powered tenant matching, transparent pricing, and dedicated support for landlords and renters.";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;
}

/**
 * Dynamically updates all SEO-relevant <head> tags for the current page.
 * Handles: <title>, meta description, robots, canonical, og:*, twitter:*
 * Resets to homepage defaults on unmount so navigating away doesn't leave
 * stale tags on the next page that doesn't call useSeo().
 */
export function useSeo({
  title,
  description,
  canonical,
  ogImage,
  noindex = false,
}: SeoOptions = {}) {
  const fullTitle = title ?? DEFAULT_TITLE;
  const fullDesc = description ?? DEFAULT_DESC;
  const effectiveCanonical =
    canonical ?? `${window.location.origin}${window.location.pathname}`;
  const effectiveImage = ogImage ?? DEFAULT_IMAGE;

  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Meta description ───────────────────────────────────────────────────
    let metaDesc = document.querySelector(
      'meta[name="description"]'
    ) as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = fullDesc;

    // ── Robots ─────────────────────────────────────────────────────────────
    let metaRobots = document.querySelector(
      'meta[name="robots"]'
    ) as HTMLMetaElement | null;
    if (!metaRobots) {
      metaRobots = document.createElement("meta");
      metaRobots.name = "robots";
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = noindex ? "noindex, nofollow" : "index, follow";

    // ── Canonical ──────────────────────────────────────────────────────────
    let link = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = effectiveCanonical;

    // ── Open Graph ─────────────────────────────────────────────────────────
    const setMeta = (
      selector: string,
      attr: string,
      value: string
    ) => {
      const el = document.querySelector(selector) as HTMLMetaElement | null;
      if (el) el.setAttribute(attr, value);
    };

    setMeta('meta[property="og:title"]',       "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", fullDesc);
    setMeta('meta[property="og:url"]',         "content", effectiveCanonical);
    setMeta('meta[property="og:image"]',       "content", effectiveImage);

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta('meta[name="twitter:title"]',       "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", fullDesc);
    setMeta('meta[name="twitter:image"]',       "content", effectiveImage);

    // ── Cleanup: reset to homepage defaults on unmount ─────────────────────
    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDesc)   metaDesc.content   = DEFAULT_DESC;
      if (metaRobots) metaRobots.content = "index, follow";
      if (link)       link.href          = `${BASE_URL}/`;
      setMeta('meta[property="og:title"]',       "content", DEFAULT_TITLE);
      setMeta('meta[property="og:description"]', "content", DEFAULT_DESC);
      setMeta('meta[property="og:url"]',         "content", `${BASE_URL}/`);
      setMeta('meta[property="og:image"]',       "content", DEFAULT_IMAGE);
      setMeta('meta[name="twitter:title"]',       "content", DEFAULT_TITLE);
      setMeta('meta[name="twitter:description"]', "content", DEFAULT_DESC);
      setMeta('meta[name="twitter:image"]',       "content", DEFAULT_IMAGE);
    };
  }, [fullTitle, fullDesc, effectiveCanonical, effectiveImage, noindex]);
}
