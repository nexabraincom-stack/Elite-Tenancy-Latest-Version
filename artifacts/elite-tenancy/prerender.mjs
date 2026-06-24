/**
 * Build-time prerender script for Elite Tenancy (Vite + React + Wouter)
 *
 * Run: node prerender.mjs   (after vite build)
 * Added to package.json as "postbuild": "node prerender.mjs"
 *
 * Launches a local HTTP server over dist/, visits every URL in sitemap.xml,
 * captures the fully-rendered HTML, and writes static index.html files.
 * Googlebot then receives complete HTML on first request.
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { createReadStream, existsSync } from "fs";
import { extname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "dist");
const BASE_URL = "http://localhost:4173";
const SITE_URL = "https://www.elitetenancy.co.uk";

// ── Priority routes to prerender (top traffic pages first) ───────────────────
const PRIORITY_ROUTES = [
  "/",
  "/listings",
  "/blog",
  "/for-landlords",
  "/right-to-rent-check",
  "/renter-passport",
  "/pricing",
  "/how-it-works",
  "/contact",
  "/find-a-room",
  "/spareroom-alternative",
  "/rra-2025-checker",
  // Blog articles
  "/blog/renters-rights-act-2026-landlord-guide",
  "/blog/section-21-abolished-2026-landlord-guide",
  "/blog/section-21-abolished-what-it-means-for-tenants",
  "/blog/no-dss-illegal-2026-benefits-tenants-landlord-guide",
  "/blog/can-landlord-refuse-pets-2026-uk",
  "/blog/assured-periodic-tenancy-explained",
  "/blog/rent-in-advance-legal-2026-uk",
  "/blog/hmo-licence-uk-2026-complete-guide",
  "/blog/letting-agent-fees-uk-2026-landlord-guide",
  "/blog/landlord-guide-letting-2026",
  "/blog/buy-to-let-2026-worth-it",
  "/blog/average-rent-uk-2026-city-price-guide",
  "/blog/average-rent-birmingham-2026",
  "/blog/average-rent-manchester-2026-area-guide",
  "/blog/manchester-vs-london-rent-2026",
  "/blog/find-premium-rentals-london-2026",
  "/blog/tenancy-agreement-clauses-guide",
  "/blog/ai-tenant-matching-how-it-works",
  // City pages
  "/london", "/manchester", "/birmingham", "/leeds", "/bristol",
  // International
  "/international-students", "/move-to-uk",
];

const MIME = {
  ".html": "text/html",
  ".js":   "application/javascript",
  ".css":  "text/css",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".json": "application/json",
  ".xml":  "application/xml",
  ".txt":  "text/plain",
  ".woff2":"font/woff2",
};

// ── Static file server ────────────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let urlPath = req.url.split("?")[0];
      let filePath = join(DIST, urlPath);

      // Serve pre-existing prerendered file if present
      if (existsSync(join(filePath, "index.html"))) {
        filePath = join(filePath, "index.html");
      } else if (!extname(filePath)) {
        // SPA fallback — serve root index.html for any HTML route
        filePath = join(DIST, "index.html");
      }

      const ext = extname(filePath);
      const mime = MIME[ext] ?? "application/octet-stream";

      if (!existsSync(filePath)) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, { "Content-Type": mime });
      createReadStream(filePath).pipe(res);
    });

    server.listen(4173, "127.0.0.1", () => resolve(server));
  });
}

// ── Puppeteer prerender ───────────────────────────────────────────────────────
async function prerender(routes) {
  let puppeteer;
  try {
    puppeteer = (await import("puppeteer")).default;
  } catch {
    console.warn("[prerender] puppeteer not installed — skipping prerender step.");
    console.warn("            Run: pnpm add -D puppeteer");
    return;
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
  } catch (err) {
    console.warn("[prerender] Chrome could not be launched — skipping prerender.");
    console.warn("            This is expected in Vercel/CI environments without Chrome.");
    console.warn("           ", err.message);
    return;
  }

  const page = await browser.newPage();
  await page.setUserAgent("EliteTenancyPrerender/1.0 Googlebot-compatible");

  // Mock IntersectionObserver so lazy content renders immediately
  await page.evaluateOnNewDocument(() => {
    window.__PRERENDER__ = true;
    window.IntersectionObserver = class {
      constructor(cb) { this._cb = cb; }
      observe(el) { this._cb([{ isIntersecting: true, target: el }], this); }
      unobserve() {}
      disconnect() {}
    };
  });

  let ok = 0;
  let fail = 0;

  for (const route of routes) {
    try {
      const url = `${BASE_URL}${route}`;
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });

      // Wait for React to hydrate
      await page.waitForSelector("#root > *", { timeout: 10_000 }).catch(() => {});

      let html = await page.content();

      // Inject prerender timestamp comment
      html = html.replace(
        "</head>",
        `  <!-- prerendered: ${new Date().toISOString()} -->\n</head>`
      );

      // Replace localhost URLs with production URL
      html = html.replaceAll(BASE_URL, SITE_URL);

      // Write to dist/<route>/index.html
      const outDir = route === "/" ? DIST : join(DIST, route.slice(1));
      mkdirSync(outDir, { recursive: true });
      const outFile = join(outDir, "index.html");
      writeFileSync(outFile, html, "utf8");

      console.log(`  ✅  ${route}`);
      ok++;
    } catch (err) {
      console.warn(`  ❌  ${route} — ${err.message}`);
      fail++;
    }
  }

  await browser.close();
  console.log(`\n[prerender] Done: ${ok} ok, ${fail} failed out of ${routes.length} routes.\n`);
}

// ── Entry ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("[prerender] Starting local server…");
  const server = await startServer();

  console.log(`[prerender] Prerendering ${PRIORITY_ROUTES.length} routes…\n`);
  await prerender(PRIORITY_ROUTES);

  server.close();
}

main().catch((err) => {
  // Prerender is an enhancement — never fail the Vercel build for it.
  console.warn("[prerender] Skipped:", err.message);
});
