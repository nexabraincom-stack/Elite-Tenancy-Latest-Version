/**
 * Admin — live Search Console data for the SEO dashboard.
 * Read-only, admin-only. Gracefully reports "not configured" until the
 * service account key + GSC_SITE_URL env vars are actually set — see
 * lib/googleSearchConsole.ts for the one-time setup this depends on.
 */

import { Router, type IRouter } from "express";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import {
  isGscConfigured,
  querySearchAnalytics,
  getSitemaps,
  inspectUrl,
  checkGscHealth,
} from "../lib/googleSearchConsole";

const router: IRouter = Router();

router.use("/admin/seo", requireAuth(), requireRole("admin"));

router.get("/admin/seo/status", async (_req, res): Promise<void> => {
  const health = await checkGscHealth();
  res.json(health);
});

router.get("/admin/seo/search-analytics", async (req, res): Promise<void> => {
  if (!isGscConfigured()) {
    res.status(503).json({ error: "Search Console isn't connected yet — see /admin/seo-dashboard for setup steps" });
    return;
  }

  const days = Math.min(Number(req.query.days) || 28, 90);
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const dimensions = (req.query.dimensions as string | undefined)?.split(",") as
    | Array<"query" | "page" | "country" | "device" | "date" | "searchAppearance">
    | undefined;

  try {
    const rows = await querySearchAnalytics({
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: dimensions ?? ["query"],
      rowLimit: Math.min(Number(req.query.limit) || 25, 1000),
    });
    res.json({ startDate: fmt(start), endDate: fmt(end), rows });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Search Console request failed" });
  }
});

router.get("/admin/seo/sitemaps", async (_req, res): Promise<void> => {
  if (!isGscConfigured()) {
    res.status(503).json({ error: "Search Console isn't connected yet — see /admin/seo-dashboard for setup steps" });
    return;
  }
  try {
    const sitemaps = await getSitemaps();
    res.json({ sitemaps });
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Search Console request failed" });
  }
});

router.get("/admin/seo/inspect-url", async (req, res): Promise<void> => {
  if (!isGscConfigured()) {
    res.status(503).json({ error: "Search Console isn't connected yet — see /admin/seo-dashboard for setup steps" });
    return;
  }
  const url = req.query.url as string | undefined;
  if (!url) {
    res.status(400).json({ error: "url query param is required" });
    return;
  }
  try {
    const result = await inspectUrl(url);
    res.json(result);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : "Search Console request failed" });
  }
});

export default router;
