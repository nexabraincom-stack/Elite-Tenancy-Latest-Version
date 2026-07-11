/**
 * Routing Middleware — dynamic SEO injection for /listings/:id
 *
 * Plain JS (not .ts): Vercel's build step compiles middleware.ts through
 * this project's own tsconfig.json, which sets "noEmit": true (Vite
 * projects normally leave transpilation to Vite, not tsc) — that caused
 * the compile step to silently no-op ("middleware.ts: Emit skipped") and
 * the middleware never got attached to the deployment. Plain .js sidesteps
 * that compile step entirely.
 *
 * seo-prerender.mjs only prerenders known-at-build-time routes. Individual
 * listing pages are per-row DB content discovered by Googlebot via crawling,
 * so they always fell through to the generic dist/public/index.html shell —
 * which hardcodes the HOMEPAGE canonical, title, and description in the raw
 * HTML. ListingDetail.tsx never calls useSeo() either, so nothing ever
 * corrected it client-side. Confirmed live via curl: /listings/1 and
 * /listings/5 both served <link rel="canonical" href=".../"> (homepage)
 * and the homepage <title>, which is exactly why Google Search Console
 * classified every listing page as "Alternate page with proper canonical
 * tag" pointing at the homepage (48 of the 55 not-indexed pages).
 *
 * This intercepts /listings/:id before static serving, fetches the real
 * listing (same request cycle re-enters routing, so the existing /api/*
 * rewrite to the backend still applies), and returns the same HTML shell
 * with the correct per-listing title/description/canonical/OG/hreflang —
 * or a genuine HTTP 404 (not a soft 200) when the listing no longer exists.
 */

const BASE_URL = "https://www.elitetenancy.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.jpg`;

export const config = {
  matcher: ["/listings/:id"],
};

function esc(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function truncate(str, max) {
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
}

function injectHead(template, opts) {
  let html = template;
  const safe = (s) => esc(s);

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${safe(opts.title)}</title>`);
  html = html.replace(
    /(<meta name="description" content=")[^"]*(")/,
    `$1${safe(opts.desc)}$2`,
  );
  html = html.replace(
    /(<meta name="robots" content=")[^"]*(")/,
    `$1${opts.noindex ? "noindex, nofollow" : "index, follow"}$2`,
  );
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${safe(opts.canonical)}$2`,
  );
  html = html.replace(
    /(<link rel="alternate" hreflang="[^"]*"\s+href=")[^"]*(")/g,
    `$1${safe(opts.canonical)}$2`,
  );
  html = html.replace(
    /(<meta property="og:title"\s+content=")[^"]*(")/,
    `$1${safe(opts.title)}$2`,
  );
  html = html.replace(
    /(<meta property="og:description"\s+content=")[^"]*(")/,
    `$1${safe(opts.desc)}$2`,
  );
  html = html.replace(
    /(<meta property="og:url"\s+content=")[^"]*(")/,
    `$1${safe(opts.canonical)}$2`,
  );
  html = html.replace(
    /(<meta property="og:image"\s+content=")[^"]*(")/,
    `$1${safe(opts.ogImage)}$2`,
  );
  html = html.replace(
    /(<meta name="twitter:title"\s+content=")[^"]*(")/,
    `$1${safe(opts.title)}$2`,
  );
  html = html.replace(
    /(<meta name="twitter:description"\s+content=")[^"]*(")/,
    `$1${safe(opts.desc)}$2`,
  );
  html = html.replace(
    /(<meta name="twitter:image"\s+content=")[^"]*(")/,
    `$1${safe(opts.ogImage)}$2`,
  );
  html = html.replace(
    /(<noscript>[\s\S]*?<h1>)[^<]*(<\/h1>)/,
    `$1${safe(opts.title)}$2`,
  );
  html = html.replace(
    /(<noscript>[\s\S]*?<p>)[^<]*(<\/p>)/,
    `$1${safe(opts.desc)}$2`,
  );

  if (opts.breadcrumbName) {
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Listings", item: `${BASE_URL}/listings` },
        { "@type": "ListItem", position: 3, name: opts.breadcrumbName, item: opts.canonical },
      ],
    };
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">\n${JSON.stringify(breadcrumb, null, 2)}\n</script>\n</head>`,
    );
  }

  return html;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const id = url.pathname.split("/")[2];

  if (!id || !/^\d+$/.test(id)) {
    return fetch(new URL("/index.html", url));
  }

  const [listingRes, template] = await Promise.all([
    fetch(new URL(`/api/listings/${id}`, url)),
    fetch(new URL("/index.html", url)).then((r) => r.text()),
  ]);

  const canonical = `${BASE_URL}/listings/${id}`;

  if (!listingRes.ok) {
    const html = injectHead(template, {
      title: "Property No Longer Available | Elite Tenancy",
      desc: "This property listing is no longer available. Browse our current verified UK rental properties on Elite Tenancy.",
      canonical,
      ogImage: DEFAULT_OG_IMAGE,
      noindex: true,
    });
    return new Response(html, {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const listing = await listingRes.json();

  const bedroomLabel = listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms}-bed`;
  const category = listing.category ?? "property";
  const title = truncate(`${listing.title} — ${listing.city} | Elite Tenancy`, 70);
  const priceLabel = `£${Number(listing.price).toLocaleString("en-GB")}/${listing.pricePeriod ?? "month"}`;
  const descBase = listing.description?.trim()
    ? listing.description.trim()
    : `${bedroomLabel} ${category} to rent in ${listing.city} for ${priceLabel}. Verified landlord, zero tenant fees.`;
  const desc = truncate(`${bedroomLabel} ${category} in ${listing.city}, ${priceLabel}. ${descBase}`, 160);
  const ogImage = listing.photos?.[0] ?? DEFAULT_OG_IMAGE;

  const html = injectHead(template, {
    title,
    desc,
    canonical,
    ogImage,
    noindex: false,
    breadcrumbName: listing.title,
  });

  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
