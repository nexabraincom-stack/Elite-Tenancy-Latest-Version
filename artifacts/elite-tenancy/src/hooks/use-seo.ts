import { useEffect } from "react";

const DEFAULT_TITLE = "Elite Tenancy — Premium UK Lettings Platform";
const DEFAULT_DESC =
  "Elite Tenancy connects high-quality tenants with premium UK rental properties. AI-powered tenant matching, transparent pricing, and dedicated support for landlords and renters.";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

/**
 * Dynamically updates <title>, meta description, and canonical link
 * for each page. Called in each page component's top-level render.
 *
 * Resets to defaults on unmount so navigating back to a page
 * without useSeo doesn't leave a stale title.
 */
export function useSeo({ title, description, canonical, ogImage }: SeoOptions = {}) {
  const fullTitle = title ? `${title} | Elite Tenancy` : DEFAULT_TITLE;
  const fullDesc = description ?? DEFAULT_DESC;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = fullDesc;

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // OG title + description
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement | null;
    if (ogTitle) ogTitle.content = fullTitle;
    const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement | null;
    if (ogDesc) ogDesc.content = fullDesc;
    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (ogImg) ogImg.content = ogImage;
    }

    // Twitter
    const twTitle = document.querySelector('meta[name="twitter:title"]') as HTMLMetaElement | null;
    if (twTitle) twTitle.content = fullTitle;
    const twDesc = document.querySelector('meta[name="twitter:description"]') as HTMLMetaElement | null;
    if (twDesc) twDesc.content = fullDesc;

    return () => {
      document.title = DEFAULT_TITLE;
      if (metaDesc) metaDesc.content = DEFAULT_DESC;
    };
  }, [fullTitle, fullDesc, canonical, ogImage]);
}
