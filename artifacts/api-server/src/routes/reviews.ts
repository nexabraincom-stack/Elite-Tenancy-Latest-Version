import { Router, type IRouter } from "express";
import { db, tenanciesTable, usersTable } from "@workspace/db";
import { and, eq, gte, lt } from "drizzle-orm";
import { isEmailConfigured, sendEmail, reviewRequestEmail } from "../lib/email";

/**
 * Review automation — sends a branded "leave us a review" email.
 *
 * Two entry points:
 *   - POST /api/reviews/request        manual/single send (token-guarded)
 *   - GET|POST /api/reviews/run-daily  Vercel Cron daily sweep (cron-guarded)
 *
 * The daily sweep emails every tenant whose tenancy was created 7–8 days ago.
 * Because it runs once per day over a fixed [8d ago, 7d ago) window, each
 * tenancy crosses the window on exactly one run — so it is naturally idempotent
 * and needs no extra "reviewRequestedAt" column.
 *
 * Env:
 *   REVIEW_TRIGGER_TOKEN  shared secret for manual (x-review-token) + cron (x-cron-token) triggers
 *   CRON_SECRET           Vercel Cron bearer token
 *   REVIEW_URL            where to send reviewers (default Google review link placeholder)
 */

const router: IRouter = Router();

function reviewUrl(): string {
  return process.env.REVIEW_URL ?? "https://g.page/r/elite-tenancy/review";
}

router.post("/reviews/request", async (req, res): Promise<void> => {
  const token = req.header("x-review-token");
  const expected = process.env.REVIEW_TRIGGER_TOKEN;
  if (!expected || token !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!isEmailConfigured()) {
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "Valid name and email required" });
    return;
  }

  const tpl = reviewRequestEmail(name, req.body?.reviewUrl || reviewUrl());
  const result = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });

  if (!result.ok) {
    req.log.warn({ error: result.error }, "Review request email failed");
    res.status(502).json({ error: "Failed to send review request", detail: result.error });
    return;
  }
  req.log.info({ email }, "Review request email sent");
  res.json({ success: true, id: result.id });
});

// Authorise either a Vercel Cron call (Bearer CRON_SECRET) or a manual token.
function cronAuthorized(req: { header(name: string): string | undefined }): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.header("authorization") === `Bearer ${cronSecret}`) return true;
  const token = process.env.REVIEW_TRIGGER_TOKEN;
  if (token && req.header("x-cron-token") === token) return true;
  return false;
}

/**
 * Email a review request to every tenant whose tenancy was created 7–8 days ago.
 * Idempotent by design (see file header) — safe to run once per day.
 */
async function runDailyReviewRequests(): Promise<{ found: number; sent: number }> {
  const now = Date.now();
  const windowStart = new Date(now - 8 * 86400000); // 8 days ago
  const windowEnd = new Date(now - 7 * 86400000);   // 7 days ago

  const rows = await db
    .select({ name: usersTable.name, email: usersTable.email })
    .from(tenanciesTable)
    .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
    .where(and(
      gte(tenanciesTable.createdAt, windowStart),
      lt(tenanciesTable.createdAt, windowEnd),
    ));

  let sent = 0;
  for (const r of rows) {
    if (!r.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) continue;
    const tpl = reviewRequestEmail(r.name || "there", reviewUrl());
    const result = await sendEmail({ to: r.email, subject: tpl.subject, html: tpl.html });
    if (result.ok) sent++;
  }
  return { found: rows.length, sent };
}

// Cron-triggered daily sweep — Vercel Cron hits this via GET; manual via POST.
async function runDailyHandler(req: import("express").Request, res: import("express").Response): Promise<void> {
  if (!cronAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!isEmailConfigured()) { res.status(503).json({ error: "Email service not configured" }); return; }
  const result = await runDailyReviewRequests();
  req.log.info(result, "Daily review-request sweep complete");
  res.json({ success: true, ...result });
}
router.get("/reviews/run-daily", runDailyHandler);
router.post("/reviews/run-daily", runDailyHandler);

export default router;
