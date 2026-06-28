/**
 * Elite Tenancy — Ellie Reputation Intelligence Module
 *
 * Replaces NiceJob (£60/mo) + Cloutly (£22/mo) + BrightLocal citation audit (£29/mo)
 * Total saving: £111/month — using your existing stack + free AI providers.
 *
 * What Ellie's AI handles (FREE via multi-provider chain in lib/ai.ts):
 *   Groq (Llama 3.3 70B) → Gemini 2.5 Flash → Cerebras → OpenRouter → Vercel Gateway
 *   Add any free API key to lib/ai.ts providers — no code change needed.
 *
 * Endpoints (all admin-protected):
 *   GET  /api/reputation/health                     → feature flags + config status
 *   GET  /api/reputation/reviews                    → fetch all GBP reviews (Cloutly)
 *   POST /api/reputation/reviews/:reviewId/draft    → AI-draft reply (free AI)
 *   POST /api/reputation/reviews/:reviewId/reply    → post reply to GBP
 *   GET  /api/reputation/nap                        → NAP consistency audit (BrightLocal)
 *   POST /api/reputation/social/draft               → AI-generate GBP post (free AI)
 *   POST /api/reputation/social                     → publish post to GBP
 *
 * Required env vars (Vercel backend → Settings → Environment Variables):
 *   GBP_LOCATION_NAME      Google Business Profile location resource name
 *                          Format: accounts/{accountId}/locations/{locationId}
 *                          Find it: business.google.com → Profile → ⋮ → Business Profile settings → Advanced settings
 *   GBP_ACCESS_TOKEN       OAuth 2.0 access token (scope: business.manage)
 *                          Generate: https://developers.google.com/oauthplayground
 *                          Step 1: Select "Google My Business API v4" → Authorize
 *                          Step 2: Exchange authorization code → copy access_token
 *                          Note: expires in 1 hour. Set GBP_REFRESH_TOKEN for auto-refresh.
 *
 * Optional env vars for auto token refresh (set these to avoid expiry issues):
 *   GBP_REFRESH_TOKEN      OAuth refresh token (from the same OAuth Playground flow)
 *   GBP_CLIENT_ID          OAuth client ID (from Google Cloud Console)
 *   GBP_CLIENT_SECRET      OAuth client secret (from Google Cloud Console)
 *
 * Without GBP env vars: all GBP endpoints return 424 (no crashes, no impact on other routes).
 * AI endpoints (draft/NAP) work regardless — they only need AI_GATEWAY_API_KEY (already set).
 */

import { Router, type IRouter, type Request, type Response } from "express";
import https from "node:https";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { aiChat } from "../lib/ai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Config ────────────────────────────────────────────────────────────────────

function isGbpConfigured(): boolean {
  return Boolean(process.env.GBP_LOCATION_NAME && process.env.GBP_ACCESS_TOKEN);
}

function gbpLocation(): string {
  return (process.env.GBP_LOCATION_NAME ?? "").replace(/\/$/, "");
}

// ── GBP OAuth token auto-refresh ──────────────────────────────────────────────

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getGbpToken(): Promise<string> {
  // If we have a cached token that's still valid (with 60s buffer), return it
  if (cachedToken && cachedToken.expiresAt - 60_000 > Date.now()) {
    return cachedToken.value;
  }

  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  const clientId = process.env.GBP_CLIENT_ID;
  const clientSecret = process.env.GBP_CLIENT_SECRET;

  // If refresh credentials are set, exchange them for a new token
  if (refreshToken && clientId && clientSecret) {
    try {
      const newToken = await exchangeRefreshToken(refreshToken, clientId, clientSecret);
      cachedToken = { value: newToken.access_token, expiresAt: Date.now() + newToken.expires_in * 1000 };
      return cachedToken.value;
    } catch (err) {
      logger.warn({ err }, "GBP token refresh failed — falling back to static token");
    }
  }

  // Fall back to the static GBP_ACCESS_TOKEN
  return process.env.GBP_ACCESS_TOKEN!;
}

interface TokenResponse { access_token: string; expires_in: number }

function exchangeRefreshToken(refresh: string, clientId: string, clientSecret: string): Promise<TokenResponse> {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString();

    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`Token refresh failed ${res.statusCode}: ${responseBody.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(responseBody) as TokenResponse);
          } catch {
            reject(new Error("Token refresh non-JSON response"));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── GBP API helper ────────────────────────────────────────────────────────────

interface GbpRequestOpts {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  body?: Record<string, unknown>;
}

async function gbpRequest<T = unknown>(opts: GbpRequestOpts): Promise<T> {
  const token = await getGbpToken();
  const payload = opts.body ? JSON.stringify(opts.body) : null;

  return new Promise<T>((resolve, reject) => {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };
    if (payload) {
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = String(Buffer.byteLength(payload));
    }

    const url = new URL(`https://mybusiness.googleapis.com/v4/${opts.path}`);
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: opts.method,
        headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString("utf8");
          if ((res.statusCode ?? 0) >= 400) {
            reject(new Error(`GBP API ${res.statusCode}: ${responseBody.slice(0, 300)}`));
            return;
          }
          try {
            resolve(JSON.parse(responseBody) as T);
          } catch {
            reject(new Error(`GBP API non-JSON: ${responseBody.slice(0, 100)}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("GBP API timeout")));
    if (payload) req.write(payload);
    req.end();
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GbpReview {
  name: string;
  reviewId: string;
  reviewer: { displayName: string; profilePhotoUrl?: string };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: { comment: string; updateTime: string };
}

interface GbpReviewsResponse {
  reviews?: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
  nextPageToken?: string;
}

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

// ── Admin guard (all reputation routes require authenticated admin) ─────────────
const adminGuard = [requireAuth(), requireRole("admin")];

// ── GET /api/reputation/health ────────────────────────────────────────────────
router.get("/reputation/health", adminGuard, (_req: Request, res: Response): void => {
  res.json({
    status: "ok",
    gbp: isGbpConfigured() ? "connected" : "not_configured",
    ai: process.env.AI_GATEWAY_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY ? "active" : "not_configured",
    freeAiProviders: [
      { name: "Groq",       active: Boolean(process.env.GROQ_API_KEY),       model: "Llama 3.3 70B",   cost: "FREE" },
      { name: "Gemini",     active: Boolean(process.env.GEMINI_API_KEY),     model: "Gemini 2.5 Flash", cost: "FREE" },
      { name: "Cerebras",   active: Boolean(process.env.CEREBRAS_API_KEY),   model: "Llama 3.3 70B",   cost: "FREE" },
      { name: "OpenRouter", active: Boolean(process.env.OPENROUTER_API_KEY), model: "Llama 3.3 70B",   cost: "FREE" },
      { name: "Vercel Gateway", active: Boolean(process.env.AI_GATEWAY_API_KEY), model: "Llama 4 Maverick", cost: "paid fallback" },
    ],
    features: {
      reviewMonitoring:     isGbpConfigured()  ? "active"   : "needs_GBP_vars",
      aiReplyDrafting:      "active",           // works with any AI key — always on
      reviewRequestEmail:   "active",           // reviews.ts run-daily cron 10:00 UTC
      reviewRequestWhatsApp: Boolean(process.env.WHATSAPP_ACCESS_TOKEN) ? "active" : "needs_WA_vars",
      napAudit:             "active",           // static, always on
      socialPostDraft:      "active",           // AI-only, always on
      socialPostPublish:    isGbpConfigured()  ? "active"   : "needs_GBP_vars",
    },
    savings: {
      nicejob:    "£60/mo — replaced by reviews.ts + whatsapp.ts automation",
      cloutly:    "£22/mo — replaced by this reputation.ts module",
      brightlocal: "£29/mo — NAP audit replaced; directory sync not replicable without paid API",
      totalSaved: "£111/month",
    },
    setupRequired: isGbpConfigured() ? [] : [
      "GBP_LOCATION_NAME (accounts/{id}/locations/{id}) — from business.google.com",
      "GBP_ACCESS_TOKEN — from developers.google.com/oauthplayground",
      "Optional: GBP_REFRESH_TOKEN + GBP_CLIENT_ID + GBP_CLIENT_SECRET for auto-refresh",
    ],
  });
});

// ── GET /api/reputation/reviews ───────────────────────────────────────────────
router.get("/reputation/reviews", adminGuard, async (req: Request, res: Response): Promise<void> => {
  if (!isGbpConfigured()) {
    res.status(424).json({
      error: "GBP not configured",
      hint: "Set GBP_LOCATION_NAME + GBP_ACCESS_TOKEN in Vercel backend env vars",
      setup: "Follow guide at: https://developers.google.com/oauthplayground",
    });
    return;
  }

  try {
    const pageToken = typeof req.query.pageToken === "string" ? `?pageToken=${encodeURIComponent(req.query.pageToken)}` : "";
    const data = await gbpRequest<GbpReviewsResponse>({
      method: "GET",
      path: `${gbpLocation()}/reviews${pageToken}`,
    });

    const reviews = (data.reviews ?? []).map((r) => ({
      ...r,
      stars: STAR_MAP[r.starRating] ?? 0,
      needsReply: !r.reviewReply,
      ageHours: Math.floor((Date.now() - new Date(r.createTime).getTime()) / 3_600_000),
      ageLabel: formatAge(new Date(r.createTime)),
    }));

    // Sort: unanswered first, then newest
    reviews.sort((a, b) => {
      if (a.needsReply !== b.needsReply) return a.needsReply ? -1 : 1;
      return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });

    res.json({
      reviews,
      averageRating: data.averageRating ?? null,
      totalReviewCount: data.totalReviewCount ?? 0,
      unanswered: reviews.filter((r) => r.needsReply).length,
      nextPageToken: data.nextPageToken ?? null,
    });
  } catch (err) {
    logger.error({ err }, "GBP reviews fetch failed");
    res.status(502).json({
      error: "Failed to fetch GBP reviews",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

function formatAge(date: Date): string {
  const hours = Math.floor((Date.now() - date.getTime()) / 3_600_000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ── POST /api/reputation/reviews/:reviewId/draft ──────────────────────────────
// Free AI draft — uses Groq → Gemini → Cerebras → OpenRouter → Vercel Gateway
router.post("/reputation/reviews/:reviewId/draft", adminGuard, async (req: Request, res: Response): Promise<void> => {
  const { reviewText, reviewerName, starRating } = req.body as {
    reviewText?: string;
    reviewerName?: string;
    starRating?: number;
  };

  if (!reviewerName) {
    res.status(400).json({ error: "reviewerName is required" });
    return;
  }

  const stars = starRating ?? 5;
  const firstName = (reviewerName ?? "").split(" ")[0] ?? "there";
  const tone =
    stars >= 4 ? "warm, grateful, genuine — not corporate"
    : stars === 3 ? "appreciative but subtly improvement-focused"
    : "empathetic, apologetic, focused on resolution and making things right";

  try {
    const draft = await aiChat(
      [
        {
          role: "system",
          content: `You are writing a Google review reply for Elite Tenancy Ltd, a premium UK letting agency in East Ham, London. Co. No. 17135665.

Rules:
- Be ${tone}
- Address the reviewer as "${firstName}"
- 2-4 sentences MAXIMUM — short and genuine, never corporate
- Mention "Elite Tenancy" once
- 1-2 STAR reviews: acknowledge the concern warmly, invite them to reach us at info@elitetenancy.co.uk or +44 7446 192577 to resolve
- 3 STAR: thank them, acknowledge there is room to improve, invite feedback
- 4-5 STAR: thank warmly, say we are glad to have helped, end with something specific to letting if possible
- Never mention specific properties, addresses, or internal processes
- Never make legal promises
- End with "— The Elite Tenancy Team 🏡"
- Keep it human — as if a person wrote it, not a template`,
        },
        {
          role: "user",
          content: `${stars}-star review from ${reviewerName}: "${reviewText ?? "(no text — just a star rating)"}"

Write a reply.`,
        },
      ],
      { maxTokens: 200, temperature: 0.72 },
    );

    res.json({ draft, stars, reviewerId: req.params.reviewId });
  } catch (err) {
    logger.error({ err }, "AI review reply draft failed");
    res.status(502).json({
      error: "AI draft unavailable — try again or write manually",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

// ── POST /api/reputation/reviews/:reviewId/reply ──────────────────────────────
router.post("/reputation/reviews/:reviewId/reply", adminGuard, async (req: Request, res: Response): Promise<void> => {
  if (!isGbpConfigured()) {
    res.status(424).json({ error: "GBP not configured — set GBP_LOCATION_NAME + GBP_ACCESS_TOKEN" });
    return;
  }

  const { comment } = req.body as { comment?: string };
  if (!comment || comment.trim().length < 5) {
    res.status(400).json({ error: "comment is required (min 5 chars)" });
    return;
  }

  const reviewId = String(req.params.reviewId);
  try {
    await gbpRequest({
      method: "PUT",
      path: `${gbpLocation()}/reviews/${reviewId}/reply`,
      body: { comment: comment.trim().slice(0, 4096) },
    });

    logger.info({ reviewId }, "GBP review reply posted");
    res.json({ success: true, reviewId, postedAt: new Date().toISOString() });
  } catch (err) {
    logger.error({ err, reviewId }, "GBP review reply failed");
    res.status(502).json({
      error: "Failed to post reply to GBP",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

// ── GET /api/reputation/nap ───────────────────────────────────────────────────
// NAP = Name / Address / Phone — consistency across directories
// Partial BrightLocal replacement (the free part: auditing + tracking)
router.get("/reputation/nap", adminGuard, (_req: Request, res: Response): void => {
  const CANONICAL = {
    name: "Elite Tenancy Ltd",
    address: "Office 18077, 182-184 High Street North, East Ham, London, E6 2JA",
    phone: "+44 7446 192577",
    website: "https://www.elitetenancy.co.uk",
    email: "info@elitetenancy.co.uk",
    category: "Letting Agent",
    hours: "Mon–Fri 09:00–18:00, Sat 10:00–15:00",
  };

  // Update status manually as you verify each directory.
  // Status values: "verified" | "pending_action" | "unchecked" | "not_listed"
  const DIRECTORIES = [
    // Critical — most impact on local SEO and trust
    { name: "Google Business Profile",  status: "pending_action", priority: "critical", editUrl: "https://business.google.com",                       note: "Video verification pending — must complete" },
    { name: "Bing Places",              status: "pending_action", priority: "critical", editUrl: "https://www.bingplaces.com/Dashboard",              note: "Enter verification PIN from email" },
    { name: "AllAgents",               status: "unchecked",      priority: "critical", editUrl: "https://www.allagents.co.uk/join/",                 note: "Key UK lettings review platform" },
    { name: "Zoopla Agent Listing",    status: "unchecked",      priority: "critical", editUrl: "https://www.zoopla.co.uk/advertise/",               note: "Major UK portal — high visibility" },

    // High — significant local SEO signals
    { name: "Yell.com",                status: "unchecked",      priority: "high",     editUrl: "https://www.yell.com/business-owner/free-listing/", note: "Top UK directory" },
    { name: "Apple Maps",              status: "unchecked",      priority: "high",     editUrl: "https://mapsconnect.apple.com",                     note: "iOS Maps — growing UK usage" },
    { name: "Facebook Business Page",  status: "unchecked",      priority: "high",     editUrl: "https://www.facebook.com/pages/create",             note: "Social proof + reviews" },
    { name: "Checkatrade",             status: "unchecked",      priority: "high",     editUrl: "https://www.checkatrade.com/join/",                 note: "High trust in UK" },
    { name: "OnTheMarket",             status: "unchecked",      priority: "high",     editUrl: "https://www.onthemarket.com/advertise/",            note: "UK lettings portal" },

    // Medium — useful but lower priority
    { name: "Thomson Local",           status: "unchecked",      priority: "medium",   editUrl: "https://www.thomsonlocal.com/add-business/",        note: "" },
    { name: "Foursquare / Swarm",      status: "unchecked",      priority: "medium",   editUrl: "https://foursquare.com/add-place/",                 note: "Powers Apple Maps + others" },
    { name: "Nextdoor",                status: "unchecked",      priority: "medium",   editUrl: "https://business.nextdoor.com",                     note: "Hyper-local — East Ham community" },
    { name: "TrustPilot",              status: "unchecked",      priority: "medium",   editUrl: "https://business.trustpilot.com",                   note: "High consumer trust in UK" },
    { name: "Primelocation",           status: "unchecked",      priority: "medium",   editUrl: "https://www.primelocation.com/advertise/",          note: "UK lettings portal" },

    // Low — supplementary
    { name: "FreeIndex",               status: "unchecked",      priority: "low",      editUrl: "https://www.freeindex.co.uk/add-listing/",          note: "" },
    { name: "HotFrog UK",              status: "unchecked",      priority: "low",      editUrl: "https://www.hotfrog.co.uk/addyourbusiness",         note: "" },
    { name: "Cylex UK",                status: "unchecked",      priority: "low",      editUrl: "https://www.cylex.co.uk/add-business.html",         note: "" },
    { name: "Scoot",                   status: "unchecked",      priority: "low",      editUrl: "https://www.scoot.co.uk/add-your-business/",        note: "" },
  ];

  const byPriority = (p: string) => DIRECTORIES.filter((d) => d.priority === p);
  const verified = DIRECTORIES.filter((d) => d.status === "verified").length;
  const pending  = DIRECTORIES.filter((d) => d.status === "pending_action").length;

  res.json({
    canonicalNap: CANONICAL,
    summary: {
      total: DIRECTORIES.length,
      verified,
      pendingAction: pending,
      unchecked: DIRECTORIES.filter((d) => d.status === "unchecked").length,
      napScore: Math.round((verified / DIRECTORIES.length) * 100),
      brightlocalEquivalentCost: "£29/month — we do this for £0",
    },
    directories: {
      critical: byPriority("critical"),
      high:     byPriority("high"),
      medium:   byPriority("medium"),
      low:      byPriority("low"),
    },
    nextActions: DIRECTORIES
      .filter((d) => d.status !== "verified" && (d.priority === "critical" || d.priority === "high"))
      .map((d) => ({ name: d.name, editUrl: d.editUrl, note: d.note }))
      .slice(0, 5),
    instructions: "To mark a directory verified after updating it, change its status to 'verified' in reputation.ts and redeploy. Admin UI tracker coming soon.",
  });
});

// ── POST /api/reputation/social/draft ─────────────────────────────────────────
// Free AI — generates a GBP Local Post from a listing or topic
router.post("/reputation/social/draft", adminGuard, async (req: Request, res: Response): Promise<void> => {
  const { topic, listingTitle, listingCity, listingPrice, listingType, postType = "listing" } = req.body as {
    topic?: string;
    listingTitle?: string;
    listingCity?: string;
    listingPrice?: number;
    listingType?: string;
    postType?: "listing" | "legal_update" | "company_news" | "local_tip";
  };

  if (!topic && !listingTitle) {
    res.status(400).json({ error: "topic or listingTitle is required" });
    return;
  }

  const prompts: Record<string, string> = {
    listing: `New property available: ${listingTitle} in ${listingCity ?? "the area"} — ${listingType ?? "property"} at £${listingPrice ?? "POA"}/month`,
    legal_update: `UK lettings legal update: ${topic}`,
    company_news: `Elite Tenancy news: ${topic}`,
    local_tip: `Local letting tip for East Ham / East London: ${topic}`,
  };
  const context = prompts[postType] ?? topic ?? listingTitle ?? "";

  try {
    const draft = await aiChat(
      [
        {
          role: "system",
          content: `You are writing a Google Business Profile post for Elite Tenancy Ltd, a premium UK letting agency in East Ham, London (E6 2JA).

Rules:
- 150-250 words — punchy and engaging, not corporate fluff
- Written for East Ham / East London area tenants and landlords
- Include a clear call to action at the end linking to www.elitetenancy.co.uk/listings (for property posts) or relevant page
- 1-2 emojis used naturally — never excessive
- Professional but warm — as if a knowledgeable letting professional wrote it
- NO hashtags (GBP posts do not support hashtags)
- For listing posts: lead with the headline feature (location, price, key benefit)
- For legal updates: explain the implication in plain English first, then mention Elite Tenancy's compliance
- DO NOT use: "Are you looking for...", "In today's market...", "Look no further!" — avoid all clichés`,
        },
        {
          role: "user",
          content: `Write a GBP post about: ${context}`,
        },
      ],
      { maxTokens: 400, temperature: 0.8 },
    );

    res.json({ draft, postType, charCount: draft.length, withinLimit: draft.length <= 1500 });
  } catch (err) {
    logger.error({ err }, "GBP social post AI draft failed");
    res.status(502).json({
      error: "AI draft unavailable — try again",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

// ── POST /api/reputation/social ───────────────────────────────────────────────
// Publishes a Local Post to GBP
router.post("/reputation/social", adminGuard, async (req: Request, res: Response): Promise<void> => {
  if (!isGbpConfigured()) {
    res.status(424).json({
      error: "GBP not configured",
      hint: "Set GBP_LOCATION_NAME + GBP_ACCESS_TOKEN to publish GBP posts",
    });
    return;
  }

  const {
    summary,
    callToActionUrl,
    callToActionType = "LEARN_MORE",
    topicType = "STANDARD",
  } = req.body as {
    summary?: string;
    callToActionUrl?: string;
    callToActionType?: string;
    topicType?: string;
  };

  if (!summary || summary.trim().length < 10) {
    res.status(400).json({ error: "summary is required (min 10 chars, max 1500)" });
    return;
  }

  const postBody: Record<string, unknown> = {
    languageCode: "en-GB",
    summary: summary.trim().slice(0, 1500),
    topicType,
  };

  if (callToActionUrl) {
    postBody.callToAction = { actionType: callToActionType, url: callToActionUrl };
  }

  try {
    const result = await gbpRequest({
      method: "POST",
      path: `${gbpLocation()}/localPosts`,
      body: postBody,
    });

    logger.info({ topicType, charCount: summary.length }, "GBP local post published");
    res.status(201).json({ success: true, post: result, publishedAt: new Date().toISOString() });
  } catch (err) {
    logger.error({ err }, "GBP local post publish failed");
    res.status(502).json({
      error: "Failed to publish GBP post",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
