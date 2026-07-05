/**
 * Elite Tenancy — Google Search Console API Client (service account auth)
 *
 * Uses a service account, not per-user OAuth, since this reads exactly one
 * property (elitetenancy.co.uk) from an automated backend — no interactive
 * consent screen, no refresh-token expiry to manage. Implemented with
 * Node's built-in crypto/https rather than the `googleapis` SDK, matching
 * this codebase's existing pattern (see lib/n8n.ts, lib/whatsapp.ts).
 *
 * One-time setup required before this does anything (see COMPETITIVE_ANALYSIS
 * doc / chat history for the full walkthrough):
 *   1. Google Cloud Console: create a service account, enable the Search
 *      Console API, download its JSON key.
 *   2. Google Search Console → Settings → Users and permissions → Add user
 *      → paste the service account's email → grant at least "Restricted".
 *   3. Set GOOGLE_SERVICE_ACCOUNT_KEY (the full JSON key file contents,
 *      base64-encoded) and GSC_SITE_URL (e.g. "sc-domain:elitetenancy.co.uk"
 *      or "https://www.elitetenancy.co.uk/", matching the GSC property type)
 *      as backend env vars.
 *
 * Until those exist, isGscConfigured() returns false and every function
 * below throws a clear "not configured" error rather than silently failing.
 */

import * as https from "node:https";
import * as crypto from "node:crypto";
import { logger } from "./logger";

const TOKEN_URL = "oauth2.googleapis.com";
const SC_API_HOST = "searchconsole.googleapis.com";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

function getServiceAccount(): ServiceAccountKey | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json);
    if (!parsed.client_email || !parsed.private_key) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isGscConfigured(): boolean {
  return Boolean(getServiceAccount() && process.env.GSC_SITE_URL);
}

function base64url(input: Buffer | string): string {
  return (Buffer.isBuffer(input) ? input : Buffer.from(input))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Signs a service-account JWT and exchanges it for a short-lived access token. */
function nodeHttpsRequest<T>(
  host: string,
  path: string,
  opts: { method?: string; body?: string; headers?: Record<string, string> } = {},
): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: host,
        path,
        method: opts.method ?? "GET",
        headers: { "Content-Type": "application/json", ...(opts.headers ?? {}) },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
        res.on("end", () => {
          const status = res.statusCode ?? 0;
          if (status < 200 || status >= 300) {
            reject(new Error(`Google API error ${status}: ${data.slice(0, 400)}`));
            return;
          }
          try {
            resolve(JSON.parse(data) as T);
          } catch {
            reject(new Error(`Google API: invalid JSON response (${status})`));
          }
        });
      },
    );
    req.on("error", reject);
    req.setTimeout(15_000, () => req.destroy(new Error("Google API request timed out")));
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Cache the access token in-memory for its lifetime (~1hr) — this module is
// loaded once per warm serverless instance, so this saves a token exchange
// on every request without needing external storage.
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const sa = getServiceAccount();
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY is not configured");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claimSet = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: `https://${TOKEN_URL}/token`,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claimSet))}`;
  const signature = crypto.createSign("RSA-SHA256").update(signingInput).sign(sa.private_key);
  const jwt = `${signingInput}.${base64url(signature)}`;

  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }).toString();

  const { access_token, expires_in } = await nodeHttpsRequest<{ access_token: string; expires_in: number }>(
    TOKEN_URL,
    "/token",
    { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body },
  );

  cachedToken = { value: access_token, expiresAt: Date.now() + expires_in * 1000 };
  return access_token;
}

async function scFetch<T>(path: string, opts: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = await getAccessToken();
  return nodeHttpsRequest<T>(SC_API_HOST, path, {
    method: opts.method ?? "GET",
    headers: { Authorization: `Bearer ${token}` },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
}

function siteUrl(): string {
  const url = process.env.GSC_SITE_URL;
  if (!url) throw new Error("GSC_SITE_URL is not configured");
  return url;
}

// ── Search analytics — clicks/impressions/CTR/position by query, page, etc. ──
export interface SearchAnalyticsRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function querySearchAnalytics(params: {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  dimensions?: Array<"query" | "page" | "country" | "device" | "date" | "searchAppearance">;
  rowLimit?: number;
}): Promise<SearchAnalyticsRow[]> {
  const site = encodeURIComponent(siteUrl());
  const result = await scFetch<{ rows?: SearchAnalyticsRow[] }>(
    `/webmasters/v3/sites/${site}/searchAnalytics/query`,
    {
      method: "POST",
      body: {
        startDate: params.startDate,
        endDate: params.endDate,
        dimensions: params.dimensions ?? ["query"],
        rowLimit: params.rowLimit ?? 25,
      },
    },
  );
  return result.rows ?? [];
}

// ── Sitemaps — submission + processing status ────────────────────────────────
export interface SitemapEntry {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  lastDownloaded?: string;
  warnings?: string;
  errors?: string;
  contents?: Array<{ type: string; submitted: string; indexed?: string }>;
}

export async function getSitemaps(): Promise<SitemapEntry[]> {
  const site = encodeURIComponent(siteUrl());
  const result = await scFetch<{ sitemap?: SitemapEntry[] }>(`/webmasters/v3/sites/${site}/sitemaps`);
  return result.sitemap ?? [];
}

// ── URL inspection — live indexing status for a single URL ──────────────────
export interface UrlInspectionResult {
  inspectionResult?: {
    indexStatusResult?: {
      verdict?: string; // PASS | PARTIAL | FAIL | NEUTRAL
      coverageState?: string;
      robotsTxtState?: string;
      indexingState?: string;
      lastCrawlTime?: string;
      pageFetchState?: string;
      googleCanonical?: string;
      userCanonical?: string;
    };
  };
}

export async function inspectUrl(inspectionUrl: string): Promise<UrlInspectionResult> {
  return scFetch<UrlInspectionResult>("/v1/urlInspection/index:inspect", {
    method: "POST",
    body: { inspectionUrl, siteUrl: siteUrl() },
  });
}

// ── Health check ───────────────────────────────────────────────────────────────
export async function checkGscHealth(): Promise<{ configured: boolean; reachable: boolean; error?: string }> {
  if (!isGscConfigured()) return { configured: false, reachable: false };
  try {
    await getSitemaps();
    return { configured: true, reachable: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    logger.warn({ err }, "Search Console health check failed");
    return { configured: true, reachable: false, error };
  }
}
