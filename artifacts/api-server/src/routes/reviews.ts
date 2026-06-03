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

export default router;
