/**
 * Elite Tenancy — Native automation cron jobs
 *
 * Replaces N8N's sleep()-based sequences with a DB-backed cron pattern.
 * Vercel Cron hits the GET endpoint at the scheduled time; manual triggers use POST.
 *
 * Crons configured in vercel.json:
 *   GET /api/automations/run-follow-ups  — 08:00 UTC daily (24h lead follow-up)
 *
 * Auth: Vercel Cron sends `Authorization: Bearer {CRON_SECRET}`.
 * If CRON_SECRET is not set the endpoint is closed (fails safe).
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db, leadsTable } from "@workspace/db";
import { and, eq, lt, gt, isNotNull } from "drizzle-orm";
import { sendWhatsAppText, toWhatsAppNumber, isWhatsAppConfigured } from "../lib/whatsapp";
import { logger } from "../lib/logger";

const router: IRouter = Router();

function cronAuthorized(req: { header(name: string): string | undefined }): boolean {
  // Fail closed: this triggers real WhatsApp sends to real leads, and
  // CRON_SECRET isn't documented in .env.example, so it can't be assumed set.
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.header("authorization") === `Bearer ${secret}`;
}

// ── 24h lead follow-up ────────────────────────────────────────────────────────
//
// Picks up leads that arrived 18–42 hours ago, are still status="new" (never
// contacted), and have a phone number. Sends a single WhatsApp follow-up, then
// marks them status="contacted" so they are never messaged again by this cron.
//
// Window 18–42h means the 08:00 UTC cron catches everyone who enquired
// between ~14:00 the day before and ~14:00 two days before — approximately
// "yesterday during business hours." Adjust the window to suit.

async function runFollowUps(): Promise<{ checked: number; sent: number }> {
  if (!isWhatsAppConfigured()) {
    logger.info("Automations: WhatsApp not configured — skipping follow-ups");
    return { checked: 0, sent: 0 };
  }

  const now = Date.now();
  const lowerBound = new Date(now - 42 * 60 * 60 * 1000); // 42 h ago
  const upperBound = new Date(now - 18 * 60 * 60 * 1000); // 18 h ago

  const due = await db
    .select()
    .from(leadsTable)
    .where(
      and(
        eq(leadsTable.status, "new"),
        gt(leadsTable.createdAt, lowerBound),
        lt(leadsTable.createdAt, upperBound),
        isNotNull(leadsTable.phone),
      ),
    );

  let sent = 0;
  for (const lead of due) {
    const wa = toWhatsAppNumber(lead.phone!);
    if (!wa) continue;

    const result = await sendWhatsAppText(wa, [
      `Hi ${lead.name} 👋`,
      ``,
      `Just checking in from *Elite Tenancy* — your enquiry is still live and our lettings team is ready to help.`,
      ``,
      `Have a look at our latest available homes:`,
      `https://www.elitetenancy.co.uk/listings`,
      ``,
      `Reply any time and I'll be happy to help you find the perfect home.`,
    ].join("\n"));

    if (result.ok) {
      await db
        .update(leadsTable)
        .set({ status: "contacted" })
        .where(eq(leadsTable.id, lead.id));
      sent++;
    }
  }

  logger.info({ checked: due.length, sent }, "Automations: 24h follow-up run complete");
  return { checked: due.length, sent };
}

async function followUpHandler(req: Request, res: Response): Promise<void> {
  if (!cronAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const result = await runFollowUps();
    res.json({ ok: true, ...result });
  } catch (err) {
    logger.error({ err }, "Automations: follow-up run failed");
    res.status(500).json({ ok: false, error: "Internal error" });
  }
}

router.get("/automations/run-follow-ups", followUpHandler);
router.post("/automations/run-follow-ups", followUpHandler);

export default router;
