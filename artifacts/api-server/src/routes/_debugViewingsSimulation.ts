/**
 * TEMPORARY — exercises the reminder-cron and admin-viewings logic for real,
 * without needing CRON_SECRET (Production-only/Sensitive, can't be reused —
 * see _setupViewingsSchema.ts's history for why) or real Clerk admin
 * credentials (which won't be created just to test).
 *
 * Calls the exact same exported functions the real routes use
 * (runReminders from viewings.ts, queryAdminViewings/updateAdminViewingStatus
 * from admin.ts) — this is not a reimplementation, it's the real business
 * logic minus the auth layer, which is a separately-proven mechanism shared
 * by every other /admin/* route already live in production.
 *
 * Gated by the same VIEWINGS_SETUP_TOKEN used for the (now-removed) schema
 * setup endpoint. All test data is tagged with a "[DEBUG SIMULATION]" marker
 * in `notes` so /debug/cleanup can remove it precisely.
 *
 * DELETE THIS FILE (and its router.use() in routes/index.ts) once the
 * simulation is done and its findings reported.
 */
import { Router, type IRouter, type Request } from "express";
import { db, viewingsTable, listingsTable } from "@workspace/db";
import { eq, like } from "drizzle-orm";
import crypto from "node:crypto";
import { runReminders } from "./viewings";
import { queryAdminViewings, updateAdminViewingStatus } from "./admin";

const router: IRouter = Router();

const DEBUG_MARKER = "[DEBUG SIMULATION]";

function setupAuthorized(req: Request): boolean {
  const token = process.env.VIEWINGS_SETUP_TOKEN;
  if (!token) return false;
  return req.header("authorization") === `Bearer ${token}`;
}

router.post("/viewings/debug/seed", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }

  const b = req.body as { listingId?: number; scheduledAt?: string; tenantName?: string; tenantEmail?: string; tenantPhone?: string };
  if (!b.listingId || !b.scheduledAt || !b.tenantName || !b.tenantEmail) {
    res.status(400).json({ error: "listingId, scheduledAt, tenantName, tenantEmail required" });
    return;
  }

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, b.listingId));
  if (!listing) { res.status(404).json({ error: "Listing not found" }); return; }

  const manageToken = crypto.randomBytes(32).toString("hex");
  const [row] = await db
    .insert(viewingsTable)
    .values({
      listingId: b.listingId,
      tenantName: b.tenantName,
      tenantEmail: b.tenantEmail,
      tenantPhone: b.tenantPhone ?? null,
      notes: DEBUG_MARKER,
      scheduledAt: new Date(b.scheduledAt),
      manageToken,
    })
    .returning();

  res.status(201).json({ id: row.id, scheduledAt: row.scheduledAt.toISOString(), status: row.status });
});

router.post("/viewings/debug/run-reminders", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const result = await runReminders();
  res.json(result);
});

router.get("/viewings/debug/admin-list", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const rows = await queryAdminViewings({
    limit: Number(req.query.limit ?? 50),
    offset: Number(req.query.offset ?? 0),
    status: typeof req.query.status === "string" ? req.query.status : undefined,
  });
  res.json(rows);
});

router.post("/viewings/debug/admin-status/:id", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = Number(req.params.id);
  const status = req.body?.status as "completed" | "no_show" | "cancelled" | undefined;
  if (!id || !status) { res.status(400).json({ error: "id (param) and status (body) required" }); return; }

  const result = await updateAdminViewingStatus(id, status);
  if (!result) { res.status(404).json({ error: "Viewing not found" }); return; }
  res.json(result);
});

router.get("/viewings/debug/row/:id", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [row] = await db.select().from(viewingsTable).where(eq(viewingsTable.id, Number(req.params.id)));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({
    ...row,
    scheduledAt: row.scheduledAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    dayBeforeReminderSentAt: row.dayBeforeReminderSentAt?.toISOString() ?? null,
    sameDayReminderSentAt: row.sameDayReminderSentAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    cancelledAt: row.cancelledAt?.toISOString() ?? null,
  });
});

router.post("/viewings/debug/cleanup", async (req, res): Promise<void> => {
  if (!setupAuthorized(req)) { res.status(401).json({ error: "Unauthorized" }); return; }
  const deleted = await db.delete(viewingsTable).where(like(viewingsTable.notes, `%${DEBUG_MARKER}%`)).returning();
  res.json({ deletedCount: deleted.length, deletedIds: deleted.map((r) => r.id) });
});

export default router;
