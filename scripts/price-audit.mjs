#!/usr/bin/env node
/**
 * MODULE 5 — Anti-Bot Resilient Price Auditing Script
 * Elite Tenancy — Competitor Market Price Monitor
 *
 * Usage:
 *   node scripts/price-audit.mjs                    # all targets, London
 *   node scripts/price-audit.mjs --postcode SW1A    # specific area
 *   node scripts/price-audit.mjs --target spareroom # single target
 *   node scripts/price-audit.mjs --output ./data/market.json
 *
 * Dependencies:
 *   npm install playwright @playwright/test
 *   npx playwright install chromium
 *
 * Anti-bot techniques used:
 *   - Randomised delays between all requests (3–12 seconds)
 *   - Real browser fingerprint (Playwright Chromium, not headless API)
 *   - Rotating User-Agent strings from real Chrome/Firefox/Safari builds
 *   - Persistent cookie jar per session (survives across page navigations)
 *   - Mouse movement simulation before critical clicks
 *   - Viewport randomisation (1280–1920 × 800–1080)
 *   - Random scroll depth before scraping
 *   - No obvious Playwright-specific navigator properties
 */

import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const POSTCODE   = getArg("--postcode") ?? "London";
const TARGET     = getArg("--target");    // null = all
const OUTPUT     = getArg("--output") ?? resolve(dirname(fileURLToPath(import.meta.url)), "../data/market-prices.json");
const HEADLESS   = !args.includes("--show"); // --show to watch the browser

// ── Constants ─────────────────────────────────────────────────────────────────
const TARGETS = [
  {
    id:      "spareroom",
    name:    "SpareRoom",
    url:     `https://www.spareroom.co.uk/flatshare/?search_type=flatshare&location=${encodeURIComponent(POSTCODE)}&sort_by=price&search_id=&max_rent=&min_rent=&per=pcm&furnished_type=&days_of_wk_available=7+days+a+week&ignore_search_save=&page=1`,
    pricingUrl: "https://www.spareroom.co.uk/content/info-advice/early-bird-explained/",
    parser:  parseSpareRoom,
  },
  {
    id:      "openrent",
    name:    "OpenRent",
    url:     `https://www.openrent.co.uk/properties-to-rent/?term=${encodeURIComponent(POSTCODE)}&prices=0,10000&bedrooms=0,10`,
    pricingUrl: "https://www.openrent.co.uk/pricing",
    parser:  parseOpenRent,
  },
  {
    id:      "zoopla",
    name:    "Zoopla",
    url:     `https://www.zoopla.co.uk/to-rent/property/${POSTCODE.toLowerCase().replace(/\s+/g, "-")}/`,
    pricingUrl: "https://www.zoopla.co.uk/advertisewithus/",
    parser:  parseZoopla,
  },
  {
    id:      "rightmove",
    name:    "Rightmove",
    url:     `https://www.rightmove.co.uk/property-to-rent/find.html?locationIdentifier=REGION%5E87490&maxBedrooms=&minBedrooms=&maxPrice=&minPrice=&radius=10`,
    pricingUrl: "https://www.rightmove.co.uk/advertise.html",
    parser:  parseRightmove,
  },
  {
    id:      "gumtree",
    name:    "Gumtree",
    url:     `https://www.gumtree.com/flats-and-houses-for-rent/london`,
    pricingUrl: "https://www.gumtree.com/uk/advertise-on-gumtree",
    parser:  parseGumtree,
  },
];

// Rotating UA strings — recent real Chrome/Firefox/Safari builds
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.118 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Sleep between min and max milliseconds (randomised to defeat timing fingerprints). */
function sleep(minMs, maxMs) {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((r) => setTimeout(r, Math.round(ms)));
}

/** Pick random item from array. */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Randomised viewport dims. */
function randomViewport() {
  return {
    width:  1280 + Math.floor(Math.random() * 640),
    height:  800 + Math.floor(Math.random() * 280),
  };
}

/** Simulate human mouse movement across the viewport. */
async function humanMove(page) {
  const vp = page.viewportSize();
  const points = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < points; i++) {
    await page.mouse.move(
      Math.random() * (vp?.width ?? 1280),
      Math.random() * (vp?.height ?? 800),
    );
    await sleep(80, 220);
  }
}

/** Scroll to a random depth on the page. */
async function humanScroll(page) {
  const scrolls = 2 + Math.floor(Math.random() * 5);
  for (let i = 0; i < scrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy({ top: 200 + Math.random() * 600, behavior: "smooth" });
    });
    await sleep(400, 900);
  }
}

/** Extract a number from text like "£950 pcm" → 950 */
function parsePcm(text) {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/[\d]+/);
  return m ? parseInt(m[0]) : null;
}

// ── Site-specific parsers ─────────────────────────────────────────────────────

async function parseSpareRoom(page) {
  await page.waitForSelector(".listing-result", { timeout: 15000 }).catch(() => {});

  const listings = await page.$$eval(".listing-result", (els) =>
    els.slice(0, 20).map((el) => ({
      title:   el.querySelector("h2")?.textContent?.trim() ?? "",
      price:   el.querySelector(".price")?.textContent?.trim() ?? "",
      area:    el.querySelector(".roomType")?.textContent?.trim() ?? "",
      link:    el.querySelector("a")?.getAttribute("href") ?? "",
    })),
  );

  const prices = listings.map((l) => parsePcm(l.price)).filter(Boolean);
  return {
    siteId: "spareroom",
    postcode: POSTCODE,
    listingsSampled: listings.length,
    prices,
    medianPcm:   median(prices),
    minPcm:      Math.min(...prices),
    maxPcm:      Math.max(...prices),
    avgPcm:      avg(prices),
    sampleListings: listings.slice(0, 5),
    // Known pricing model from research (SpareRoom_Intel_NexusPrime_v1.pdf)
    platformPricing: {
      boost7d:    1400,  // £14
      boost14d:   2500,  // £25
      boost28d:   2800,  // £28
      featured6mo: 14900, // £149
    },
  };
}

async function parseOpenRent(page) {
  await page.waitForSelector(".property-box", { timeout: 15000 }).catch(() => {});

  const listings = await page.$$eval(".property-box", (els) =>
    els.slice(0, 20).map((el) => ({
      title:  el.querySelector("h2, .property-title")?.textContent?.trim() ?? "",
      price:  el.querySelector(".price-pcm, .rent, [class*='price']")?.textContent?.trim() ?? "",
      area:   el.querySelector(".postcode, .area")?.textContent?.trim() ?? "",
    })),
  ).catch(() => []);

  const prices = listings.map((l) => parsePcm(l.price)).filter(Boolean);
  return {
    siteId: "openrent",
    postcode: POSTCODE,
    listingsSampled: listings.length,
    prices,
    medianPcm: median(prices),
    minPcm:    prices.length ? Math.min(...prices) : null,
    maxPcm:    prices.length ? Math.max(...prices) : null,
    avgPcm:    avg(prices),
    sampleListings: listings.slice(0, 5),
    // OpenRent known pricing (from research)
    platformPricing: {
      free:           0,    // free listing on OpenRent
      portalListing:  2900, // £29 — all portals (Rightmove/Zoopla)
      rentNow:        5800, // £58 — full tenancy + referencing
      tenantRef:      2000, // £20/tenant reference
    },
  };
}

async function parseZoopla(page) {
  await page.waitForSelector("[data-testid='regular-listings']", { timeout: 20000 }).catch(() => {});

  const listings = await page.$$eval("article[data-testid='search-result']", (els) =>
    els.slice(0, 20).map((el) => ({
      title:  el.querySelector("h2, [data-testid='listing-title']")?.textContent?.trim() ?? "",
      price:  el.querySelector("[data-testid='listing-price']")?.textContent?.trim() ?? "",
      area:   el.querySelector("[data-testid='listing-description']")?.textContent?.trim() ?? "",
    })),
  ).catch(() => []);

  const prices = listings.map((l) => parsePcm(l.price)).filter(Boolean);
  return {
    siteId: "zoopla",
    postcode: POSTCODE,
    listingsSampled: listings.length,
    prices,
    medianPcm: median(prices),
    minPcm:    prices.length ? Math.min(...prices) : null,
    maxPcm:    prices.length ? Math.max(...prices) : null,
    avgPcm:    avg(prices),
    sampleListings: listings.slice(0, 5),
    // Zoopla only accepts agent listings (agent-only model)
    platformPricing: {
      agentOnly: true,
      perBranch: "contact-for-pricing",
    },
  };
}

async function parseRightmove(page) {
  await page.waitForSelector(".propertyCard", { timeout: 20000 }).catch(() => {});

  const listings = await page.$$eval(".propertyCard", (els) =>
    els.slice(0, 20).map((el) => ({
      title:  el.querySelector(".propertyCard-title")?.textContent?.trim() ?? "",
      price:  el.querySelector(".propertyCard-priceValue")?.textContent?.trim() ?? "",
      area:   el.querySelector(".propertyCard-address")?.textContent?.trim() ?? "",
    })),
  ).catch(() => []);

  const prices = listings.map((l) => parsePcm(l.price)).filter(Boolean);
  return {
    siteId: "rightmove",
    postcode: POSTCODE,
    listingsSampled: listings.length,
    prices,
    medianPcm: median(prices),
    minPcm:    prices.length ? Math.min(...prices) : null,
    maxPcm:    prices.length ? Math.max(...prices) : null,
    avgPcm:    avg(prices),
    sampleListings: listings.slice(0, 5),
    // Rightmove known pricing (from research — agent-only)
    platformPricing: {
      agentOnly: true,
      perBranchPerMonth: 153000, // ~£1,530/month per agent branch
    },
  };
}

async function parseGumtree(page) {
  await page.waitForSelector(".css-qo5s4m, .listing-summary", { timeout: 15000 }).catch(() => {});

  const listings = await page.$$eval("[data-q='search-result']", (els) =>
    els.slice(0, 20).map((el) => ({
      title: el.querySelector("[data-q='tile-title']")?.textContent?.trim() ?? "",
      price: el.querySelector("[data-q='price']")?.textContent?.trim() ?? "",
      area:  el.querySelector("[data-q='tile-location']")?.textContent?.trim() ?? "",
    })),
  ).catch(() => []);

  const prices = listings.map((l) => parsePcm(l.price)).filter(Boolean);
  return {
    siteId: "gumtree",
    postcode: POSTCODE,
    listingsSampled: listings.length,
    prices,
    medianPcm: median(prices),
    minPcm:    prices.length ? Math.min(...prices) : null,
    maxPcm:    prices.length ? Math.max(...prices) : null,
    avgPcm:    avg(prices),
    sampleListings: listings.slice(0, 5),
    platformPricing: {
      freeBasic: 0,
      featured:  "variable",
    },
  };
}

// ── Stats helpers ─────────────────────────────────────────────────────────────

function median(arr) {
  if (!arr.length) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function avg(arr) {
  if (!arr.length) return null;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ── Main scraper ──────────────────────────────────────────────────────────────

async function scrapeTarget(browser, target) {
  const ua       = pick(USER_AGENTS);
  const viewport = randomViewport();

  console.log(`\n▶ [${target.name}] Starting...`);
  console.log(`  UA: ${ua.slice(0, 60)}...`);
  console.log(`  Viewport: ${viewport.width}×${viewport.height}`);

  const context = await browser.newContext({
    userAgent:            ua,
    viewport,
    locale:               "en-GB",
    timezoneId:           "Europe/London",
    extraHTTPHeaders: {
      "Accept-Language":  "en-GB,en;q=0.9",
      "Accept":           "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Encoding":  "gzip, deflate, br",
      "Sec-Fetch-Dest":   "document",
      "Sec-Fetch-Mode":   "navigate",
      "Sec-Fetch-Site":   "none",
      "Sec-CH-UA-Platform": '"Windows"',
    },
    // Disable webdriver flag
    javaScriptEnabled: true,
  });

  // Patch navigator.webdriver before any page load
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    Object.defineProperty(navigator, "plugins",   { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-GB", "en"] });
  });

  const page = await context.newPage();
  let result = null;
  let error  = null;

  try {
    // Random initial delay before hitting site (3–8s)
    await sleep(3000, 8000);

    console.log(`  → Navigating to ${target.url}`);
    await page.goto(target.url, {
      waitUntil: "domcontentloaded",
      timeout:   30000,
    });

    // Human behaviour: move mouse, scroll
    await humanMove(page);
    await sleep(1000, 3000);
    await humanScroll(page);
    await sleep(2000, 5000);

    // Accept cookie banner if present
    await acceptCookies(page);
    await sleep(800, 2000);

    // Run the site-specific parser
    result = await target.parser(page);
    result.scrapedAt = new Date().toISOString();
    result.searchUrl = target.url;

    console.log(`  ✓ ${result.listingsSampled} listings, median £${result.medianPcm ?? "N/A"}/pcm`);

    // Also scrape pricing page if available
    if (target.pricingUrl) {
      await sleep(3000, 7000);
      console.log(`  → Fetching pricing page...`);
      try {
        await page.goto(target.pricingUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        await sleep(1500, 3000);
        await humanScroll(page);

        const pricingText = await page.evaluate(() => document.body.innerText);
        result.pricingPageText = pricingText.slice(0, 2000); // cap at 2k chars
      } catch (e) {
        result.pricingPageError = e.message;
      }
    }
  } catch (e) {
    error = e.message ?? String(e);
    console.error(`  ✗ Error: ${error}`);
    result = { siteId: target.id, error, scrapedAt: new Date().toISOString() };
  } finally {
    await context.close();
  }

  return result;
}

/** Try common cookie/consent banner accept patterns. Silently no-ops if none found. */
async function acceptCookies(page) {
  const selectors = [
    "button[id*='accept']",
    "button[class*='accept']",
    "button[data-testid*='accept']",
    "#onetrust-accept-btn-handler",
    ".cookie-consent-accept",
    "[aria-label*='Accept']",
    "button:has-text('Accept all')",
    "button:has-text('Accept cookies')",
    "button:has-text('I agree')",
    "button:has-text('OK')",
  ];

  for (const sel of selectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        await btn.click({ timeout: 3000 });
        console.log(`  ✓ Cookie banner accepted (${sel})`);
        return;
      }
    } catch {
      // Not found — try next
    }
  }
}

// ── Competitive analysis summary ──────────────────────────────────────────────

function buildSummary(results) {
  const valid = results.filter((r) => !r.error && r.medianPcm);

  if (!valid.length) return null;

  const allPrices = valid.flatMap((r) => r.prices ?? []);
  const ukMedian  = median(allPrices);

  return {
    searchArea:          POSTCODE,
    generatedAt:         new Date().toISOString(),
    sitesAudited:        results.length,
    sitesSuccessful:     valid.length,
    ukMarketMedianPcm:   ukMedian,
    byPlatform: valid.map((r) => ({
      platform:          r.siteId,
      medianPcm:         r.medianPcm,
      minPcm:            r.minPcm,
      maxPcm:            r.maxPcm,
      listingsSampled:   r.listingsSampled,
    })),
    // Elite Tenancy competitive position
    eliteTenancyPositioning: {
      standardTier:           0,           // FREE
      professionalTier:       29,          // £29
      premiumTier:            59,          // £59
      completionFeeWeeksRent: 1,           // one week's rent (25% of monthly)
      vsSpareRoom:            "Free listing vs £14-149 boost fees",
      vsOpenRent:             "Free listing vs £29 portal fee; completion-only vs upfront charge",
      vsRightmove:            "Open to landlords vs agent-only (£1,530+/mo)",
      moat:                   "No placement, no charge — structurally impossible for SpareRoom/OpenRent to match without destroying their P&L",
    },
  };
}

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log("═══════════════════════════════════════════════════════");
  console.log("  Elite Tenancy — Competitor Price Audit");
  console.log(`  Area: ${POSTCODE} | Targets: ${TARGET ?? "all"}`);
  console.log("═══════════════════════════════════════════════════════");

  const targets = TARGET
    ? TARGETS.filter((t) => t.id === TARGET)
    : TARGETS;

  if (!targets.length) {
    console.error(`Unknown target '${TARGET}'. Available: ${TARGETS.map((t) => t.id).join(", ")}`);
    process.exit(1);
  }

  const browser = await chromium.launch({
    headless: HEADLESS,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
    ],
  });

  const results = [];

  for (const target of targets) {
    const result = await scrapeTarget(browser, target);
    results.push(result);

    // Inter-site delay: 10–20s (looks like a real user switching tabs)
    if (target !== targets.at(-1)) {
      const delay = 10000 + Math.random() * 10000;
      console.log(`\n  Waiting ${Math.round(delay / 1000)}s before next site...`);
      await sleep(delay, delay);
    }
  }

  await browser.close();

  // Build output
  const summary = buildSummary(results);
  const output = {
    summary,
    details: results,
  };

  // Write to file
  const outPath = resolve(OUTPUT);
  const outDir  = dirname(outPath);
  if (!existsSync(outDir)) await mkdir(outDir, { recursive: true });

  await writeFile(outPath, JSON.stringify(output, null, 2), "utf8");

  console.log("\n═══════════════════════════════════════════════════════");
  console.log(`  Audit complete. Results written to:`);
  console.log(`  ${outPath}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // Print quick summary
  if (summary) {
    console.log("Quick Summary:");
    console.log(`  UK Market Median: £${summary.ukMarketMedianPcm}/pcm`);
    for (const p of summary.byPlatform) {
      console.log(`  ${p.platform.padEnd(12)}: £${p.medianPcm}/pcm median  (${p.listingsSampled} listings)`);
    }
    console.log("\nElite Tenancy Position:");
    console.log(`  ${summary.eliteTenancyPositioning.moat}`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
