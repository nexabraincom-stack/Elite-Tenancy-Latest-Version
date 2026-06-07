/**
 * Elite Tenancy — OG Image Generator (IVORY LUXE theme)
 * Matches the website's exact "Ivory Luxe" palette:
 *   Background : hsl(40 33% 96%)  → #F8F5EE warm ivory
 *   Foreground : hsl(167 39% 14%) → #132B24 deep forest green
 *   Primary    : hsl(165 41% 21%) → #1A3B34 forest green
 *   Accent     : hsl(41 49% 48%)  → #B8892E champagne gold
 *   Muted fg   : hsl(34 11% 40%)  → #736860 warm taupe
 *   Border     : hsl(150 18% 88%) → #D7E4DE soft sage
 * Run: node scripts/generate-og-image.mjs
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PLAYWRIGHT_PATH = "C:/Users/hp/AppData/Roaming/npm/node_modules/playwright/index.js";
const { chromium } = require(PLAYWRIGHT_PATH);

const OUTPUT = path.resolve(__dirname, "../artifacts/elite-tenancy/public/og-image.jpg");

const HTML = /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=1200"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      /* Warm ivory background — matches website --background: hsl(40 33% 96%) */
      background: #F8F5EE;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    }

    /* ── Subtle linen texture (layered radials for depth) ── */
    .texture {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse 900px 500px at 15% 50%, rgba(26,59,52,0.04) 0%, transparent 70%),
        radial-gradient(ellipse 600px 400px at 85% 20%, rgba(184,137,46,0.06) 0%, transparent 65%),
        radial-gradient(ellipse 500px 300px at 80% 90%, rgba(26,59,52,0.03) 0%, transparent 70%);
    }

    /* ── Subtle grid (sage green lines) ── */
    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(26,59,52,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(26,59,52,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    /* ── Outer border — sage green ── */
    .border-outer {
      position: absolute;
      inset: 0;
      border-bottom: 4px solid #1A3B34;
    }

    /* ── Inner frame — thin champagne gold ── */
    .border-frame {
      position: absolute;
      inset: 20px;
      border: 1px solid rgba(184,137,46,0.3);
      border-radius: 3px;
    }

    /* ── Corner accents — forest green ── */
    .corner {
      position: absolute;
      width: 22px; height: 22px;
      border-color: #1A3B34;
      border-style: solid;
      opacity: 0.6;
    }
    .corner.tl { top: 20px;    left: 20px;   border-width: 2px 0 0 2px; }
    .corner.tr { top: 20px;    right: 20px;  border-width: 2px 2px 0 0; }
    .corner.bl { bottom: 20px; left: 20px;   border-width: 0 0 2px 2px; }
    .corner.br { bottom: 20px; right: 20px;  border-width: 0 2px 2px 0; }

    /* ── Left accent bar — champagne gold ── */
    .accent-bar {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 6px;
      background: linear-gradient(180deg, #B8892E 0%, #D4A84B 40%, #B8892E 70%, #8B6622 100%);
    }

    /* ── Main content container ── */
    .content {
      position: absolute; inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 90px 56px 96px;
    }

    /* ── ET shield monogram ── */
    .shield {
      width: 64px; height: 64px;
      margin-bottom: 20px;
    }

    /* ── "PREMIUM UK LETTINGS" overline ── */
    .overline {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 5.5px;
      text-transform: uppercase;
      /* muted foreground: hsl(34 11% 40%) */
      color: #736860;
      margin-bottom: 14px;
    }

    /* ── Main wordmark — Cormorant Garamond serif ── */
    .wordmark {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 82px;
      font-weight: 600;
      font-style: italic;
      line-height: 0.95;
      letter-spacing: -1px;
      /* deep forest green foreground */
      color: #132B24;
      margin-bottom: 6px;
      text-align: center;
    }

    /* ── "UK's Premier Lettings Platform" sub-wordmark ── */
    .sub-wordmark {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #1A3B34;
      opacity: 0.5;
      margin-bottom: 30px;
    }

    /* ── Gold divider ── */
    .divider {
      width: 360px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #B8892E, transparent);
      margin-bottom: 26px;
    }

    /* ── Tagline ── */
    .tagline {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 22px;
      font-weight: 500;
      color: #1A3B34;
      opacity: 0.75;
      text-align: center;
      line-height: 1.5;
      max-width: 640px;
      margin-bottom: 30px;
    }

    /* ── Feature pills ── */
    .features {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }

    .pill-feature {
      display: flex;
      align-items: center;
      gap: 7px;
      background: rgba(26,59,52,0.06);
      border: 1px solid rgba(26,59,52,0.12);
      border-radius: 100px;
      padding: 6px 14px;
      font-size: 11.5px;
      font-weight: 600;
      color: #1A3B34;
      letter-spacing: 0.3px;
    }
    .pill-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #B8892E;
      flex-shrink: 0;
    }

    /* ── Domain watermark ── */
    .domain {
      position: absolute;
      bottom: 30px;
      right: 40px;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 1.5px;
      color: #736860;
      opacity: 0.7;
    }

    /* ── "Est. 2025" badge top-right ── */
    .est {
      position: absolute;
      top: 34px;
      right: 40px;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #B8892E;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="texture"></div>
  <div class="grid"></div>
  <div class="accent-bar"></div>
  <div class="border-outer"></div>
  <div class="border-frame"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="est">Est. 2025 · London</div>

  <div class="content">

    <!-- ET shield monogram in forest green + gold -->
    <svg class="shield" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" fill="none">
      <defs>
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stop-color="#D4A84B"/>
          <stop offset="0.5"  stop-color="#B8892E"/>
          <stop offset="1"    stop-color="#8B6622"/>
        </linearGradient>
      </defs>
      <!-- Shield outline in forest green -->
      <path d="M60 4 L108 24 L108 88 L60 146 L12 88 L12 24 Z"
            stroke="#1A3B34" stroke-width="3" stroke-linejoin="round"
            fill="rgba(26,59,52,0.05)" opacity="0.8"/>
      <!-- ET letters in champagne gold -->
      <g stroke="url(#goldGrad)" stroke-width="7.5" stroke-linecap="square" fill="none">
        <path d="M43 46 V104"/>
        <path d="M43 46 H62"/>
        <path d="M43 75 H58"/>
        <path d="M43 104 H62"/>
        <path d="M56 46 H88"/>
        <path d="M72 46 V104"/>
      </g>
    </svg>

    <div class="overline">Premium UK Lettings</div>

    <div class="wordmark">Elite Tenancy</div>
    <div class="sub-wordmark">Est. · London · Nationwide</div>

    <div class="divider"></div>

    <p class="tagline">
      Quality rentals, verified landlords &amp; zero upfront fees —<br/>
      powered by AI matching across the United Kingdom.
    </p>

    <div class="features">
      <div class="pill-feature"><div class="pill-dot"></div>0% Upfront Fees</div>
      <div class="pill-feature"><div class="pill-dot"></div>AI Tenant Matching</div>
      <div class="pill-feature"><div class="pill-dot"></div>Verified Landlords</div>
      <div class="pill-feature"><div class="pill-dot"></div>Premium Properties</div>
    </div>
  </div>

  <div class="domain">www.elitetenancy.co.uk</div>
</body>
</html>
`;

(async () => {
  console.log("🎨 Rendering OG image (Ivory Luxe theme)...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(HTML, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500); // wait for Google Fonts

  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 94,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  fs.writeFileSync(OUTPUT, buffer);
  console.log(`✅ OG image saved → ${OUTPUT}`);
  console.log(`   ${(buffer.length / 1024).toFixed(1)} KB  |  1200×630px JPEG`);
  console.log(`   Theme: Ivory Luxe (#F8F5EE bg · #132B24 forest green · #B8892E champagne gold)`);

  await browser.close();
})();
