import { Router, type IRouter } from "express";
import { db, rtrChecksTable } from "@workspace/db";
import { and, eq, isNull, lte } from "drizzle-orm";
import { isEmailConfigured, sendEmail, getAdminEmail } from "../lib/email";

/**
 * Right to Rent — guided share-code check recorder + expiry reminders.
 *
 * The GOV.UK landlord checking service has no public API, so we don't store
 * share codes or DOB. The landlord runs the official check, then records the
 * RESULT here. For time-limited rights we store the expiry and email a reminder
 * before it lapses, prompting the landlord to request a fresh share code.
 *
 * - POST /api/rtr/check          (public, rate-limited) — record a result
 * - POST /api/rtr/run-reminders  (token-guarded) — cron: email due reminders
 */

const router: IRouter = Router();
const VALID_STATUS = new Set(["unlimited", "time_limited", "none"]);

function brandEmail(title: string, body: string): string {
  return `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;background:#faf7f1;padding:28px;border-radius:12px;color:#1f2d28;">
    <h2 style="font-family:Georgia,serif;color:#15302a;margin:0 0 12px;">${title}</h2>${body}
    <p style="font-size:12px;color:#8a8275;margin-top:18px;">Elite Tenancy · Right to Rent assistant</p></div>`;
}

router.post("/rtr/check", async (req, res): Promise<void> => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const landlordEmail = typeof b.landlordEmail === "string" ? b.landlordEmail.trim() : "";
  const tenantName = typeof b.tenantName === "string" ? b.tenantName.trim().slice(0, 120) : "";
  const rightStatus = typeof b.rightStatus === "string" ? b.rightStatus.trim() : "";
  const landlordName = typeof b.landlordName === "string" ? b.landlordName.trim().slice(0, 120) : null;
  const expiryDate = typeof b.expiryDate === "string" && b.expiryDate ? b.expiryDate.slice(0, 20) : null;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(landlordEmail)) { res.status(400).json({ error: "A valid landlord email is required." }); return; }
  if (!tenantName) { res.status(400).json({ error: "Tenant name is required." }); return; }
  if (!VALID_STATUS.has(rightStatus)) { res.status(400).json({ error: "Select the result of your GOV.UK check." }); return; }
  if (rightStatus === "time_limited" && !expiryDate) { res.status(400).json({ error: "Enter the expiry date for a time-limited right." }); return; }

  let row;
  try {
    [row] = await db.insert(rtrChecksTable).values({
      landlordEmail, landlordName, tenantName, rightStatus,
      expiryDate: rightStatus === "time_limited" ? expiryDate : null,
      status: "active",
    }).returning();
  } catch (err) {
    req.log.error({ err }, "RTR check save failed");
    res.status(500).json({ error: "Could not save the check. Please try again." });
    return;
  }

  // Confirmation email (+ admin copy) — non-blocking
  if (isEmailConfigured()) {
    const summary = rightStatus === "unlimited"
      ? `<strong>${tenantName}</strong> has an <strong>unlimited</strong> right to rent. No re-check needed.`
      : rightStatus === "time_limited"
        ? `<strong>${tenantName}</strong> has a <strong>time-limited</strong> right to rent expiring <strong>${expiryDate}</strong>. We'll email you a reminder before it lapses so you can request a fresh share code.`
        : `<strong>${tenantName}</strong> showed <strong>no</strong> right to rent. Do not proceed — letting to someone without the right to rent risks a civil penalty.`;
    sendEmail({
      to: landlordEmail,
      subject: `Right to Rent recorded — ${tenantName}`,
      html: brandEmail("Right to Rent check saved", `<p style="font-size:14px;line-height:1.6;">${summary}</p>`),
    }).catch(() => {});
    sendEmail({ to: getAdminEmail(), subject: `RTR check logged — ${tenantName} (${rightStatus})`, html: brandEmail("RTR check logged", `<p>${summary}</p><p>Landlord: ${landlordEmail}</p>`) }).catch(() => {});
  }

  res.status(201).json({ id: row.id, tenantName: row.tenantName, rightStatus: row.rightStatus, expiryDate: row.expiryDate });
});

// Authorise either a Vercel Cron call (Bearer CRON_SECRET) or a manual token.
function cronAuthorized(req: { header(name: string): string | undefined }): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.header("authorization") === `Bearer ${cronSecret}`) return true;
  const token = process.env.REVIEW_TRIGGER_TOKEN;
  if (token && req.header("x-cron-token") === token) return true;
  return false;
}

async function runReminders(): Promise<{ checked: number; reminded: number }> {
  // 30 days out (ISO date string compares correctly lexicographically)
  const cutoff = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const due = await db.select().from(rtrChecksTable).where(and(
    eq(rtrChecksTable.status, "active"),
    eq(rtrChecksTable.rightStatus, "time_limited"),
    isNull(rtrChecksTable.remindedAt),
    lte(rtrChecksTable.expiryDate, cutoff),
  ));
  let sent = 0;
  for (const c of due) {
    const r = await sendEmail({
      to: c.landlordEmail,
      subject: `⏰ Right to Rent expiring soon — ${c.tenantName}`,
      html: brandEmail("Time to re-check Right to Rent", `<p style="font-size:14px;line-height:1.6;"><strong>${c.tenantName}</strong>'s time-limited right to rent expires on <strong>${c.expiryDate}</strong>. Ask them for a new GOV.UK share code and run a follow-up check to keep your statutory excuse.</p><p><a href="https://www.elitetenancy.co.uk/right-to-rent-check" style="color:#b8923f;">Record your follow-up check →</a></p>`),
    });
    if (r.ok) { await db.update(rtrChecksTable).set({ remindedAt: new Date(), status: "reminded" }).where(eq(rtrChecksTable.id, c.id)); sent++; }
  }
  return { checked: due.length, reminded: sent };
}

// Cron-triggered reminder sweep — Vercel Cron hits this via GET; manual via POST.
async function reminderHandler(req: import("express").Request, res: import("express").Response): Promise<void> {
  if (!cronAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!isEmailConfigured()) { res.status(503).json({ error: "Email not configured" }); return; }
  const result = await runReminders();
  res.json(result);
}
router.get("/rtr/run-reminders", reminderHandler);
router.post("/rtr/run-reminders", reminderHandler);

export default router;
