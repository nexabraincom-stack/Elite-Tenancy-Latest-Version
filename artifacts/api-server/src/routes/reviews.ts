/**
 * Elite Tenancy — Review Automation (replaces NiceJob £60/mo)
 *
 * Multi-step review request sequence:
 *   Day  7 — Initial request: email + WhatsApp (cron: GET /api/reviews/run-daily at 10:00 UTC)
 *   Day 14 — Friendly reminder: WhatsApp only (cron: GET /api/reviews/run-followup at 10:30 UTC)
 *   Day 30 — Final nudge: WhatsApp only (same cron, different time-window logic)
 *
 * WhatsApp phone lookup: checks leadsTable by email match — no schema change needed.
 * If a phone is found from the leads capture (Ellie chat or contact form), WA fires.
 * If not, email-only (still effective).
 *
 * Env vars:
 *   RESEND_API_KEY          required for email sends (resend.com free tier: 3,000/mo)
 *   REVIEW_URL              Google review link — set after GBP is verified
 *                           Format: https://g.page/r/XXXXXXXXXXXXXXXXXX/review
 *                           Find: business.google.com → Get more reviews → copy link
 *   REVIEW_TRIGGER_TOKEN    secret for the manual POST /api/reviews/request endpoint
 *   WHATSAPP_ACCESS_TOKEN   optional — enables WhatsApp sends (set in Meta Business)
 *   WHATSAPP_PHONE_NUMBER_ID  required with above
 */

import { Router, type IRouter } from "express";
import { isEmailConfigured, sendEmail, reviewRequestEmail } from "../lib/email";
import { sendWhatsAppText, toWhatsAppNumber, isWhatsAppConfigured } from "../lib/whatsapp";
import { db } from "@workspace/db";
import { tenanciesTable, usersTable, leadsTable } from "@workspace/db/schema";
import { eq, lt, gt, isNull, isNotNull, and } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Config ────────────────────────────────────────────────────────────────────

function reviewUrl(): string {
  return process.env.REVIEW_URL ?? "https://g.page/r/elite-tenancy/review";
}

function cronAuthorized(req: { header(name: string): string | undefined }): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // open in dev
  return req.header("authorization") === `Bearer ${secret}`;
}

// ── Phone lookup — finds phone from leadsTable by email ───────────────────────
// Tenants may have submitted their phone via Ellie chat or contact form.
// No schema change needed — we look up across the leads we already captured.
async function lookupPhone(email: string): Promise<string | null> {
  if (!email) return null;
  try {
    const rows = await db
      .select({ phone: leadsTable.phone })
      .from(leadsTable)
      .where(and(eq(leadsTable.email, email), isNotNull(leadsTable.phone)))
      .limit(1);
    return rows[0]?.phone ?? null;
  } catch {
    return null;
  }
}

// ── WhatsApp review request message ──────────────────────────────────────────

function reviewWhatsApp(name: string, step: 1 | 2 | 3): string {
  const firstName = name.split(" ")[0] ?? name;
  const link = reviewUrl();

  if (step === 1) {
    return [
      `Hi ${firstName} 👋`,
      ``,
      `We hope you're settling in well! It's now been a week since your tenancy started with *Elite Tenancy*, and we'd love to hear how it's going.`,
      ``,
      `If you have a moment, leaving us a quick Google review makes a huge difference to us as a new business — and to future tenants looking for a letting agent they can trust 🏡`,
      ``,
      `Leave your review here (takes 60 seconds):`,
      link,
      ``,
      `Thank you so much — we really appreciate it!`,
      `— The Elite Tenancy Team`,
    ].join("\n");
  }

  if (step === 2) {
    return [
      `Hi ${firstName} 👋`,
      ``,
      `Just a gentle nudge from *Elite Tenancy* — we noticed you haven't had a chance to leave us a review yet, and we completely understand life gets busy!`,
      ``,
      `Even just a star rating (no words needed) means the world to us 🙏`,
      link,
      ``,
      `— The Elite Tenancy Team`,
    ].join("\n");
  }

  // step 3 — final
  return [
    `Hi ${firstName} 👋`,
    ``,
    `This is our last reminder — we promise! 😊 If you've been happy with Elite Tenancy's service, a 30-second Google review would mean everything to us.`,
    ``,
    `${link}`,
    ``,
    `Thank you for being part of Elite Tenancy. We're here whenever you need us.`,
    `— The Elite Tenancy Team 🏡`,
  ].join("\n");
}

// ── Manual trigger: POST /api/reviews/request ─────────────────────────────────
// Admin-triggered or n8n-triggered review request for a specific person.
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

  const name  = typeof req.body?.name  === "string" ? req.body.name.trim()  : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const phone = typeof req.body?.phone === "string" ? req.body.phone.trim() : null;

  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    res.status(400).json({ error: "Valid name and email required" });
    return;
  }

  const tpl = reviewRequestEmail(name, req.body?.reviewUrl || reviewUrl());
  const emailResult = await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });

  let waSent = false;
  const wa = phone ? toWhatsAppNumber(phone) : null;
  if (wa && isWhatsAppConfigured()) {
    const waResult = await sendWhatsAppText(wa, reviewWhatsApp(name, 1));
    waSent = waResult.ok;
  }

  if (!emailResult.ok) {
    req.log.warn({ error: emailResult.error }, "Manual review request email failed");
    res.status(502).json({ error: "Failed to send review request", detail: emailResult.error });
    return;
  }

  req.log.info({ email, waSent }, "Manual review request sent");
  res.json({ success: true, id: emailResult.id, waSent });
});

// ── Cron: GET /api/reviews/run-daily (Vercel Cron 10:00 UTC) ─────────────────
// Step 1 — Initial request (day 7): email + WhatsApp
router.get("/reviews/run-daily", async (req, res): Promise<void> => {
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!isEmailConfigured()) {
    res.status(503).json({ error: "Email not configured" });
    return;
  }

  try {
    const sevenDaysAgo  = new Date(Date.now() - 7  * 86_400_000);
    const nineDaysAgo   = new Date(Date.now() - 9  * 86_400_000);

    // Tenancies 7-9 days old with no review requested yet
    const eligible = await db
      .select({
        tenancyId:   tenanciesTable.id,
        tenantName:  usersTable.name,
        tenantEmail: usersTable.email,
      })
      .from(tenanciesTable)
      .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
      .where(
        and(
          lt(tenanciesTable.createdAt,  sevenDaysAgo),
          gt(tenanciesTable.createdAt,  nineDaysAgo),
          isNull(tenanciesTable.reviewRequestedAt),
          eq(tenanciesTable.status, "active"),
        ),
      );

    let emailSent = 0;
    let waSent    = 0;
    const errors: unknown[] = [];

    for (const t of eligible) {
      if (!t.tenantEmail || !t.tenantName) continue;

      // Email
      const tpl = reviewRequestEmail(t.tenantName, reviewUrl());
      const emailResult = await sendEmail({ to: t.tenantEmail, subject: tpl.subject, html: tpl.html });

      if (emailResult.ok) {
        emailSent++;
        await db
          .update(tenanciesTable)
          .set({ reviewRequestedAt: new Date() })
          .where(eq(tenanciesTable.id, t.tenancyId));
        logger.info({ tenancyId: t.tenancyId, email: t.tenantEmail }, "Review request step-1 email sent");
      } else {
        errors.push({ tenancyId: t.tenancyId, error: emailResult.error });
      }

      // WhatsApp (non-blocking, fire-and-forget on failure)
      if (isWhatsAppConfigured()) {
        const phone = await lookupPhone(t.tenantEmail);
        const wa = phone ? toWhatsAppNumber(phone) : null;
        if (wa) {
          const waResult = await sendWhatsAppText(wa, reviewWhatsApp(t.tenantName, 1));
          if (waResult.ok) {
            waSent++;
            logger.info({ tenancyId: t.tenancyId }, "Review request step-1 WhatsApp sent");
          }
        }
      }
    }

    res.json({
      success: true,
      step: 1,
      processed: eligible.length,
      emailSent,
      waSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    logger.error({ err }, "reviews/run-daily failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Cron: GET /api/reviews/run-followup (Vercel Cron 10:30 UTC) ──────────────
// Step 2 — 14-day reminder: WhatsApp only
// Step 3 — 30-day final: WhatsApp only
// Both handled in one endpoint to keep vercel.json tidy.
router.get("/reviews/run-followup", async (req, res): Promise<void> => {
  if (!cronAuthorized(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isWhatsAppConfigured()) {
    res.json({ success: true, skipped: "WhatsApp not configured — follow-ups require WHATSAPP_ACCESS_TOKEN" });
    return;
  }

  try {
    // Step 2: reviewRequestedAt was 7-9 days ago → ~14 days since tenancy start
    const step2Upper = new Date(Date.now() - 7  * 86_400_000);
    const step2Lower = new Date(Date.now() - 9  * 86_400_000);

    // Step 3: reviewRequestedAt was 21-24 days ago → ~28-32 days since tenancy start
    const step3Upper = new Date(Date.now() - 21 * 86_400_000);
    const step3Lower = new Date(Date.now() - 24 * 86_400_000);

    const [step2Rows, step3Rows] = await Promise.all([
      // Step 2: already requested, in the 14-day window
      db.select({
        tenancyId:   tenanciesTable.id,
        tenantName:  usersTable.name,
        tenantEmail: usersTable.email,
      })
      .from(tenanciesTable)
      .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
      .where(
        and(
          isNotNull(tenanciesTable.reviewRequestedAt),
          lt(tenanciesTable.reviewRequestedAt, step2Upper),
          gt(tenanciesTable.reviewRequestedAt, step2Lower),
          eq(tenanciesTable.status, "active"),
        ),
      ),

      // Step 3: already requested, in the 30-day window
      db.select({
        tenancyId:   tenanciesTable.id,
        tenantName:  usersTable.name,
        tenantEmail: usersTable.email,
      })
      .from(tenanciesTable)
      .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
      .where(
        and(
          isNotNull(tenanciesTable.reviewRequestedAt),
          lt(tenanciesTable.reviewRequestedAt, step3Upper),
          gt(tenanciesTable.reviewRequestedAt, step3Lower),
          eq(tenanciesTable.status, "active"),
        ),
      ),
    ]);

    let step2Sent = 0;
    let step3Sent = 0;

    const sendFollowUp = async (
      rows: typeof step2Rows,
      step: 2 | 3,
      counter: { count: number },
    ) => {
      for (const t of rows) {
        if (!t.tenantEmail || !t.tenantName) continue;
        const phone = await lookupPhone(t.tenantEmail);
        const wa = phone ? toWhatsAppNumber(phone) : null;
        if (!wa) continue;
        const result = await sendWhatsAppText(wa, reviewWhatsApp(t.tenantName, step));
        if (result.ok) {
          counter.count++;
          logger.info({ tenancyId: t.tenancyId, step }, `Review follow-up step-${step} WhatsApp sent`);
        }
      }
    };

    const c2 = { count: 0 };
    const c3 = { count: 0 };
    await sendFollowUp(step2Rows, 2, c2);
    await sendFollowUp(step3Rows, 3, c3);
    step2Sent = c2.count;
    step3Sent = c3.count;

    res.json({
      success: true,
      step2: { processed: step2Rows.length, sent: step2Sent },
      step3: { processed: step3Rows.length, sent: step3Sent },
    });
  } catch (err) {
    logger.error({ err }, "reviews/run-followup failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export { router as default };
