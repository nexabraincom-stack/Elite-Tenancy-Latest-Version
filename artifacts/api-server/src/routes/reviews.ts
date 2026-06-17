import { Router, type IRouter } from "express";
import { isEmailConfigured, sendEmail, reviewRequestEmail } from "../lib/email";

/**
 * Review automation — sends a branded "leave us a review" email.
 *
 * Designed to be triggered 7 days after a successful placement, either by:
 *   - an n8n / Vercel Cron job hitting POST /api/reviews/request, or
 *   - an admin action.
 *
 * Protected by a shared secret header (x-review-token) matched against
 * REVIEW_TRIGGER_TOKEN so the endpoint can't be abused to send spam.
 *
 * Env:
 *   REVIEW_TRIGGER_TOKEN  shared secret required to call this endpoint
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

import { db } from "@workspace/db";
import { tenanciesTable, usersTable } from "@workspace/db/schema";
import { eq, lt, isNull, and } from "drizzle-orm";

router.get("/reviews/run-daily", async (req, res): Promise<void> => {
  if (!isEmailConfigured()) {
    res.status(503).json({ error: "Email service not configured" });
    return;
  }

  try {
    // Find tenancies created > 7 days ago that haven't had a review requested
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const eligibleTenancies = await db
      .select({
        tenancyId: tenanciesTable.id,
        tenantName: usersTable.name,
        tenantEmail: usersTable.email,
      })
      .from(tenanciesTable)
      .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
      .where(
        and(
          lt(tenanciesTable.createdAt, sevenDaysAgo),
          isNull(tenanciesTable.reviewRequestedAt),
          eq(tenanciesTable.status, "active")
        )
      );

    let sentCount = 0;
    const errors: any[] = [];

    for (const t of eligibleTenancies) {
      if (!t.tenantEmail || !t.tenantName) continue;

      const tpl = reviewRequestEmail(t.tenantName, reviewUrl());
      const result = await sendEmail({ to: t.tenantEmail, subject: tpl.subject, html: tpl.html });

      if (result.ok) {
        sentCount++;
        await db
          .update(tenanciesTable)
          .set({ reviewRequestedAt: new Date() })
          .where(eq(tenanciesTable.id, t.tenancyId));
        req.log.info({ tenancyId: t.tenancyId, email: t.tenantEmail }, "Automated review request sent");
      } else {
        errors.push({ tenancyId: t.tenancyId, error: result.error });
      }
    }

    res.json({
      success: true,
      processed: eligibleTenancies.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    req.log.error({ error }, "Error running daily review cron");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
