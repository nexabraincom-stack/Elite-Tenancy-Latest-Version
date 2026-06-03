import { Router, type IRouter } from "express";
import { db, leadsTable } from "@workspace/db";
import { N8N_EVENTS } from "../lib/n8n";
import { isEmailConfigured, sendEmail, getAdminEmail, adminLeadEmail } from "../lib/email";

/**
 * External lead intake — the legitimate Nextdoor pipeline.
 *
 * Nextdoor Ads / Nextdoor's official Zapier integration pushes new local leads
 * here (NO scraping). Each lead lands in our leads table + fires an admin alert,
 * exactly like a website enquiry. Token-guarded so only our Zapier can post.
 *
 * Env: INTEGRATION_TOKEN  (shared secret set in the Zapier webhook headers)
 *
 * POST /api/integrations/lead
 *   headers: x-integration-token: <INTEGRATION_TOKEN>
 *   body: { name, email, phone?, message?, source? }
 */

const router: IRouter = Router();

router.post("/integrations/lead", async (req, res): Promise<void> => {
  const expected = process.env.INTEGRATION_TOKEN;
  if (!expected || req.header("x-integration-token") !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const b = (req.body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim().slice(0, 120) : "";
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 160) : "";
  const phone = typeof b.phone === "string" ? b.phone.trim().slice(0, 40) : null;
  const message = typeof b.message === "string" ? b.message.trim().slice(0, 2000) : null;
  const source = typeof b.source === "string" && b.source ? b.source.trim().slice(0, 40) : "nextdoor";

  if (!name && !email) {
    res.status(400).json({ error: "At least a name or email is required." });
    return;
  }

  let row;
  try {
    [row] = await db.insert(leadsTable).values({
      name: name || "Unknown (via " + source + ")",
      email: email || "no-email@unknown",
      phone,
      message: `[${source}] ${message ?? ""}`.trim(),
      status: "new",
    }).returning();
  } catch (err) {
    req.log.error({ err }, "Integration lead save failed");
    res.status(500).json({ error: "Could not save lead." });
    return;
  }

  // Notify (n8n + email) — non-blocking
  N8N_EVENTS.newEnquiry({
    id: row.id, name: row.name, email: row.email, phone: row.phone ?? null,
    message: row.message ?? null, listingId: null, listingTitle: null, source: "lead",
  }).catch(() => {});

  if (isEmailConfigured()) {
    const mail = adminLeadEmail({ name: row.name, email: row.email, phone: row.phone ?? null, message: row.message ?? null, source, listingTitle: null });
    sendEmail({ to: getAdminEmail(), subject: mail.subject, html: mail.html }).catch(() => {});
  }

  req.log.info({ source, leadId: row.id }, "External lead ingested");
  res.status(201).json({ ok: true, id: row.id });
});

export default router;
