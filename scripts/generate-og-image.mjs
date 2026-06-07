/**
 * Elite Tenancy — OG Image Generator
 * Generates a 1200×630 JPEG for social media previews using Playwright.
 * Run: node scripts/generate-og-image.mjs
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load playwright from global npm installation
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
  <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background: #07060e;
      font-family: 'Plus Jakarta Sans', sans-serif;
      position: relative;
    }

    /* ── Subtle grid texture overlay ── */
    .grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(193,155,40,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(193,155,40,0.05) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    /* ── Radial glow top-left ── */
    .glow-tl {
      position: absolute;
      top: -160px; left: -160px;
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(193,155,40,0.18) 0%, transparent 65%);
      border-radius: 50%;
    }

    /* ── Radial glow bottom-right ── */
    .glow-br {
      position: absolute;
      bottom: -200px; right: -80px;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(114,76,11,0.22) 0%, transparent 65%);
      border-radius: 50%;
    }

    /* ── Thin gold border inset ── */
    .border-frame {
      position: absolute;
      inset: 18px;
      border: 1px solid rgba(193,155,40,0.22);
      border-radius: 4px;
      pointer-events: none;
    }

    /* ── Corner accents ── */
    .corner {
      position: absolute;
      width: 20px; height: 20px;
      border-color: rgba(193,155,40,0.7);
      border-style: solid;
    }
    .corner.tl { top: 18px;    left: 18px;   border-width: 2px 0 0 2px; }
    .corner.tr { top: 18px;    right: 18px;  border-width: 2px 2px 0 0; }
    .corner.bl { bottom: 18px; left: 18px;   border-width: 0 0 2px 2px; }
    .corner.br { bottom: 18px; right: 18px;  border-width: 0 2px 2px 0; }

    /* ── Main content ── */
    .content {
      position: absolute; inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      padding: 48px 80px;
    }

    /* ── Monogram shield ── */
    .shield {
      width: 72px; height: 72px;
      margin-bottom: 22px;
      opacity: 0.95;
    }

    /* ── "PREMIUM UK LETTINGS" pill ── */
    .pill {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 5px;
      text-transform: uppercase;
      color: #9a8f7a;
      border: 1px solid rgba(154,143,122,0.3);
      padding: 5px 16px;
      border-radius: 20px;
      margin-bottom: 20px;
    }

    /* ── Wordmark ── */
    .wordmark {
      font-family: 'DM Serif Display', Georgia, serif;
      font-size: 72px;
      font-weight: 400;
      line-height: 1;
      letter-spacing: -1px;
      background: linear-gradient(180deg, #f1e0a8 0%, #e6c45a 35%, #c9a227 72%, #9c7c1c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 18px;
    }

    /* ── Tagline ── */
    .tagline {
      font-size: 19px;
      font-weight: 400;
      color: rgba(255,255,255,0.6);
      text-align: center;
      line-height: 1.5;
      max-width: 680px;
      margin-bottom: 36px;
    }
    .tagline strong {
      color: rgba(255,255,255,0.85);
      font-weight: 600;
    }

    /* ── Divider ── */
    .divider {
      width: 100%;
      max-width: 480px;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(193,155,40,0.4), transparent);
      margin-bottom: 28px;
    }

    /* ── Feature row ── */
    .features {
      display: flex;
      gap: 36px;
      align-items: center;
    }
    .feature {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: rgba(255,255,255,0.5);
    }
    .feature-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e6c45a, #c9a227);
      flex-shrink: 0;
    }
    .sep {
      width: 1px; height: 14px;
      background: rgba(193,155,40,0.25);
    }

    /* ── Domain badge ── */
    .domain {
      position: absolute;
      bottom: 34px;
      right: 44px;
      font-size: 12px;
      font-weight: 500;
      letter-spacing: 1px;
      color: rgba(154,143,122,0.6);
    }
  </style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow-tl"></div>
  <div class="glow-br"></div>
  <div class="border-frame"></div>
  <div class="corner tl"></div>
  <div class="corner tr"></div>
  <div class="corner bl"></div>
  <div class="corner br"></div>

  <div class="content">
    <svg class="shield" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 150" fill="none">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0"    stop-color="#f1e0a8"/>
          <stop offset="0.4"  stop-color="#e6c45a"/>
          <stop offset="0.75" stop-color="#c9a227"/>
          <stop offset="1"    stop-color="#9c7c1c"/>
        </linearGradient>
      </defs>
      <path d="M60 4 L108 24 L108 88 L60 146 L12 88 L12 24 Z"
            stroke="url(#g)" stroke-width="3" stroke-linejoin="round" fill="none" opacity="0.9"/>
      <g stroke="url(#g)" stroke-width="7.5" stroke-linecap="square" fill="none">
        <path d="M43 46 V104"/>
        <path d="M43 46 H62"/>
        <path d="M43 75 H58"/>
        <path d="M43 104 H62"/>
        <path d="M56 46 H88"/>
        <path d="M72 46 V104"/>
      </g>
    </svg>

    <div class="pill">Premium UK Lettings</div>
    <div class="wordmark">Elite Tenancy</div>

    <p class="tagline">
      <strong>Quality rentals. Zero fees.</strong> AI-powered tenant matching,<br/>
      verified landlords, and a seamless letting experience across the UK.
    </p>

    <div class="divider"></div>

    <div class="features">
      <div class="feature"><div class="feature-dot"></div>0% Upfront Fees</div>
      <div class="sep"></div>
      <div class="feature"><div class="feature-dot"></div>AI Tenant Matching</div>
      <div class="sep"></div>
      <div class="feature"><div class="feature-dot"></div>Verified Landlords</div>
      <div class="sep"></div>
      <div class="feature"><div class="feature-dot"></div>Premium Properties</div>
    </div>
  </div>

  <div class="domain">www.elitetenancy.co.uk</div>
</body>
</html>
`;

(async () => {
  console.log("🎨 Launching Playwright to render OG image...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(HTML, { waitUntil: "networkidle" });

  // Wait for Google Fonts to load
  await page.waitForTimeout(2000);

  const buffer = await page.screenshot({
    type: "jpeg",
    quality: 92,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  fs.writeFileSync(OUTPUT, buffer);
  console.log(`✅ OG image saved → ${OUTPUT}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(1)} KB | 1200×630px JPEG`);

  await browser.close();
})();
