/**
 * Elite Tenancy — Public viewing booking
 *
 * - GET  /viewings/availability          (public) — bookable slots for a listing+date
 * - POST /viewings                       (public) — book a slot
 * - GET  /viewings/manage/:token         (public) — tenant looks up their own booking
 * - POST /viewings/manage/:token/cancel  (public) — tenant self-cancel (idempotent)
 * - GET/POST /viewings/run-reminders     (CRON_SECRET-gated) — day-before + same-day reminder sweep
 *
 * Admin listing/status-update endpoints live in routes/admin.ts, under the
 * existing requireAuth()+requireRole("admin") gate — not here, since a bare
 * "signed in" check would wrongly let any tenant/landlord see every booking.
 *
 * The booking record is the source of truth: the DB insert happens first,
 * and the response always includes the manage link directly, so a tenant
 * isn't stranded even if both the confirmation email and WhatsApp message
 * fail to send. Notifications are best-effort side effects, never a
 * dependency for booking success.
 */
import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { db, viewingsTable, listingsTable, leadsTable } from "@workspace/db";
import { and, eq, gte, lt, isNull } from "drizzle-orm";
import {
  GetViewingAvailabilityQueryParams,
  CreateViewingBody,
  GetViewingByTokenParams,
  CancelViewingByTokenParams,
} from "@workspace/api-zod";
import {
  VIEWING_TIMEZONE,
  SLOT_DURATION_MINUTES,
  generateSlotGrid,
  isValidSlotStart,
  isWithinMinNotice,
  isWithinBookingHorizon,
  londonDateParts,
  londonDayBoundsUtc,
  addDaysToDateStr,
  formatLondonDateTime,
} from "../lib/viewingAvailability";
import {
  isEmailConfigured,
  sendEmail,
  getAdminEmail,
  viewingConfirmationEmail,
  viewingDayBeforeReminderEmail,
  viewingSameDayReminderEmail,
  viewingCancelledAdminAlertEmail,
} from "../lib/email";
import { sendWhatsAppText, toWhatsAppNumber } from "../lib/whatsapp";
import { logger } from "../lib/logger";

const router: IRouter = Router();

type ViewingRow = typeof viewingsTable.$inferSelect;

function manageUrlFor(token: string): string {
  const base = process.env.PUBLIC_APP_URL ?? "https://www.elitetenancy.co.uk";
  return `${base}/viewings/manage/${token}`;
}

function serializeViewing(row: ViewingRow, listingTitle: string | null) {
  return {
    id: row.id,
    listingId: row.listingId,
    listingTitle,
    name: row.tenantName,
    email: row.tenantEmail,
    phone: row.tenantPhone ?? null,
    notes: row.notes ?? null,
    scheduledAt: row.scheduledAt.toISOString(),
    durationMinutes: row.durationMinutes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeBookingConfirmation(row: ViewingRow, listingTitle: string | null) {
  return {
    ...serializeViewing(row, listingTitle),
    manageToken: row.manageToken,
    manageUrl: manageUrlFor(row.manageToken),
  };
}

// ── Availability ─────────────────────────────────────────────────────────────

router.get("/viewings/availability", async (req, res): Promise<void> => {
  const parsed = GetViewingAvailabilityQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { listingId, date } = parsed.data;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ error: "date must be in YYYY-MM-DD format" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing || listing.status !== "active") {
    res.json({ listingId, date, timezone: VIEWING_TIMEZONE, available: false, slots: [] });
    return;
  }

  const grid = generateSlotGrid(date).filter((s) => isWithinMinNotice(s) && isWithinBookingHorizon(s));
  if (grid.length === 0) {
    res.json({ listingId, date, timezone: VIEWING_TIMEZONE, available: false, slots: [] });
    return;
  }

  const { start, end } = londonDayBoundsUtc(date);
  const taken = await db
    .select({ scheduledAt: viewingsTable.scheduledAt })
    .from(viewingsTable)
    .where(and(
      eq(viewingsTable.listingId, listingId),
      eq(viewingsTable.status, "confirmed"),
      gte(viewingsTable.scheduledAt, start),
      lt(viewingsTable.scheduledAt, end),
    ));
  const takenTimes = new Set(taken.map((t) => t.scheduledAt.getTime()));

  const openSlots = grid.filter((s) => !takenTimes.has(s.getTime()));
  res.json({
    listingId,
    date,
    timezone: VIEWING_TIMEZONE,
    available: openSlots.length > 0,
    slots: openSlots.map((s) => ({ startsAt: s.toISOString() })),
  });
});

// ── Create booking ───────────────────────────────────────────────────────────

router.post("/viewings", async (req, res): Promise<void> => {
  const parsed = CreateViewingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { listingId, slotStart, name, email, phone, notes } = parsed.data;

  const slotDate = new Date(slotStart);
  if (Number.isNaN(slotDate.getTime())) { res.status(400).json({ error: "Invalid slotStart" }); return; }
  if (!isValidSlotStart(slotDate)) { res.status(400).json({ error: "That's not a valid viewing slot — please pick a time from the availability list." }); return; }
  if (!isWithinMinNotice(slotDate)) { res.status(400).json({ error: "Viewings need at least a few hours' notice — please pick a later time." }); return; }
  if (!isWithinBookingHorizon(slotDate)) { res.status(400).json({ error: "That date is too far ahead to book yet." }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, listingId));
  if (!listing || listing.status !== "active") {
    res.status(409).json({ error: "This listing isn't currently available for viewings." });
    return;
  }

  // Soft-block: an existing future confirmed booking by the same email for
  // this listing — surface it instead of creating a silent duplicate.
  const existing = await db
    .select()
    .from(viewingsTable)
    .where(and(
      eq(viewingsTable.listingId, listingId),
      eq(viewingsTable.tenantEmail, email),
      eq(viewingsTable.status, "confirmed"),
      gte(viewingsTable.scheduledAt, new Date()),
    ));
  if (existing.length > 0) {
    res.status(409).json({
      error: "You already have an upcoming viewing booked for this listing.",
      manageUrl: manageUrlFor(existing[0].manageToken),
    });
    return;
  }

  const manageToken = crypto.randomBytes(32).toString("hex");
  let row: ViewingRow;
  try {
    const inserted = await db
      .insert(viewingsTable)
      .values({
        listingId,
        tenantName: name,
        tenantEmail: email,
        tenantPhone: phone ?? null,
        notes: notes ?? null,
        scheduledAt: slotDate,
        manageToken,
      })
      .returning();
    row = inserted[0];
  } catch (err) {
    // Postgres unique_violation on the partial index — someone else took this
    // exact slot in the race between the availability check and this insert.
    if ((err as { code?: string })?.code === "23505") {
      res.status(409).json({ error: "That slot was just taken — please pick another." });
      return;
    }
    req.log.error({ err }, "Viewing booking insert failed");
    res.status(500).json({ error: "Could not book the viewing. Please try again." });
    return;
  }

  // Link a lead row so this booking stays visible in existing lead reporting.
  // Fire-and-forget: never blocks or fails the booking response.
  db.insert(leadsTable)
    .values({
      name,
      email,
      phone: phone ?? null,
      message: `[Viewing booked] ${formatLondonDateTime(slotDate)}${notes ? ` — ${notes}` : ""}`,
      listingId,
      listingTitle: listing.title,
      status: "new",
    })
    .returning()
    .then(([lead]) => {
      if (lead) {
        db.update(viewingsTable).set({ leadId: lead.id }).where(eq(viewingsTable.id, row.id)).catch(() => {});
      }
    })
    .catch(() => {});

  const manageUrl = manageUrlFor(manageToken);

  if (isEmailConfigured()) {
    const tpl = viewingConfirmationEmail({ tenantName: name, listingTitle: listing.title, scheduledAt: slotDate, manageUrl });
    sendEmail({ to: email, subject: tpl.subject, html: tpl.html }).catch(() => {});
  }
  if (phone) {
    const wa = toWhatsAppNumber(phone);
    if (wa) {
      sendWhatsAppText(wa, [
        `Hi ${name} 👋`,
        ``,
        `Your viewing for *${listing.title}* is confirmed for *${formatLondonDateTime(slotDate)}*.`,
        ``,
        `Manage or cancel any time: ${manageUrl}`,
      ].join("\n")).catch(() => {});
    }
  }

  res.status(201).json(serializeBookingConfirmation(row, listing.title));
});

// ── Self-service manage / cancel ─────────────────────────────────────────────

router.get("/viewings/manage/:token", async (req, res): Promise<void> => {
  const parsed = GetViewingByTokenParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [row] = await db.select().from(viewingsTable).where(eq(viewingsTable.manageToken, parsed.data.token));
  if (!row) { res.status(404).json({ error: "Booking not found" }); return; }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, row.listingId));
  res.json(serializeBookingConfirmation(row, listing?.title ?? null));
});

router.post("/viewings/manage/:token/cancel", async (req, res): Promise<void> => {
  const parsed = CancelViewingByTokenParams.safeParse(req.params);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [row] = await db.select().from(viewingsTable).where(eq(viewingsTable.manageToken, parsed.data.token));
  if (!row) { res.status(404).json({ error: "Booking not found" }); return; }

  let final: ViewingRow = row;
  if (row.status === "confirmed") {
    const updated = await db
      .update(viewingsTable)
      .set({ status: "cancelled", cancelledAt: new Date(), cancelledBy: "tenant" })
      .where(eq(viewingsTable.id, row.id))
      .returning();
    final = updated[0];

    if (isEmailConfigured()) {
      const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, row.listingId));
      const tpl = viewingCancelledAdminAlertEmail({
        tenantName: row.tenantName,
        listingTitle: listing?.title ?? "a listing",
        scheduledAt: row.scheduledAt,
        cancelledBy: "tenant",
      });
      sendEmail({ to: getAdminEmail(), subject: tpl.subject, html: tpl.html }).catch(() => {});
    }
  }
  // Already cancelled/completed/no_show: idempotent no-op, just return current state.

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, final.listingId));
  res.json(serializeBookingConfirmation(final, listing?.title ?? null));
});

// ── Reminder cron ─────────────────────────────────────────────────────────────
//
// Vercel Cron on this account only supports once-daily invocation (all 5
// existing crons in vercel.json are once-daily), so this single run computes
// both a "day before" batch and a "later today" batch rather than assuming a
// finer-grained "N hours before" schedule is available.

function cronAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.header("authorization") === `Bearer ${secret}`;
}

async function sendReminder(v: ViewingRow, kind: "day_before" | "same_day"): Promise<void> {
  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, v.listingId));
  const listingTitle = listing?.title ?? "your viewing";
  const manageUrl = manageUrlFor(v.manageToken);

  if (isEmailConfigured()) {
    const tpl = kind === "day_before"
      ? viewingDayBeforeReminderEmail({ tenantName: v.tenantName, listingTitle, scheduledAt: v.scheduledAt, manageUrl })
      : viewingSameDayReminderEmail({ tenantName: v.tenantName, listingTitle, scheduledAt: v.scheduledAt, manageUrl });
    await sendEmail({ to: v.tenantEmail, subject: tpl.subject, html: tpl.html }).catch(() => {});
  }
  if (v.tenantPhone) {
    const wa = toWhatsAppNumber(v.tenantPhone);
    if (wa) {
      const when = kind === "day_before" ? "tomorrow" : "later today";
      await sendWhatsAppText(wa, [
        `Hi ${v.tenantName} 👋`,
        ``,
        `Reminder: your viewing for *${listingTitle}* is ${when} at *${formatLondonDateTime(v.scheduledAt)}*.`,
        ``,
        `Need to cancel or check the details? ${manageUrl}`,
      ].join("\n")).catch(() => {});
    }
  }
}

async function runReminders(): Promise<{ dayBeforeChecked: number; dayBeforeSent: number; sameDayChecked: number; sameDaySent: number }> {
  const now = new Date();
  const { dateStr: todayStr } = londonDateParts(now);
  const tomorrowStr = addDaysToDateStr(todayStr, 1);
  const todayBounds = londonDayBoundsUtc(todayStr);
  const tomorrowBounds = londonDayBoundsUtc(tomorrowStr);

  const sameDayDue = await db
    .select()
    .from(viewingsTable)
    .where(and(
      eq(viewingsTable.status, "confirmed"),
      gte(viewingsTable.scheduledAt, now),
      lt(viewingsTable.scheduledAt, todayBounds.end),
      isNull(viewingsTable.sameDayReminderSentAt),
    ));

  const dayBeforeDue = await db
    .select()
    .from(viewingsTable)
    .where(and(
      eq(viewingsTable.status, "confirmed"),
      gte(viewingsTable.scheduledAt, tomorrowBounds.start),
      lt(viewingsTable.scheduledAt, tomorrowBounds.end),
      isNull(viewingsTable.dayBeforeReminderSentAt),
    ));

  // Reminder-sent timestamps are stamped once the send is *attempted*, not
  // only on confirmed delivery — this cron runs once a day, so gating on
  // success risks silently never sending again after a transient blip,
  // whereas gating on attempt risks (rarely) missing one reminder, and the
  // original booking confirmation is the fallback communication either way.
  let sameDaySent = 0;
  for (const v of sameDayDue) {
    await sendReminder(v, "same_day");
    await db.update(viewingsTable).set({ sameDayReminderSentAt: new Date() }).where(eq(viewingsTable.id, v.id));
    sameDaySent++;
  }

  let dayBeforeSent = 0;
  for (const v of dayBeforeDue) {
    await sendReminder(v, "day_before");
    await db.update(viewingsTable).set({ dayBeforeReminderSentAt: new Date() }).where(eq(viewingsTable.id, v.id));
    dayBeforeSent++;
  }

  logger.info(
    { dayBeforeChecked: dayBeforeDue.length, dayBeforeSent, sameDayChecked: sameDayDue.length, sameDaySent },
    "Viewing reminders run complete",
  );
  return { dayBeforeChecked: dayBeforeDue.length, dayBeforeSent, sameDayChecked: sameDayDue.length, sameDaySent };
}

async function remindersHandler(req: Request, res: Response): Promise<void> {
  if (!cronAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  try {
    const result = await runReminders();
    res.json({ ok: true, ...result });
  } catch (err) {
    logger.error({ err }, "Viewing reminders run failed");
    res.status(500).json({ ok: false, error: "Internal error" });
  }
}
router.get("/viewings/run-reminders", remindersHandler);
router.post("/viewings/run-reminders", remindersHandler);

export default router;
