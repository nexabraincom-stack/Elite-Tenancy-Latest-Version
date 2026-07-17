import { Router, type IRouter } from "express";
import { db, listingsTable, leadsTable, blogArticlesTable, usersTable, viewingsTable, viewingStatusEnum } from "@workspace/db";
import { count, desc, eq, gte } from "drizzle-orm";
import {
  GetAdminStatsResponse,
  GetAdminListingsResponse,
  GetAdminLeadsResponse,
  GetAdminArticlesResponse,
  GetAdminUsersResponse,
  GetAdminViewingsResponse,
  UpdateViewingStatusParams,
  UpdateViewingStatusBody,
  UpdateViewingStatusResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/requireAuth";

const router: IRouter = Router();

// All admin routes require the "admin" role
router.use("/admin", requireAuth(), requireRole("admin"));

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [listingCount] = await db.select({ count: count() }).from(listingsTable);
  const [leadCount] = await db.select({ count: count() }).from(leadsTable);
  const [userCount] = await db.select({ count: count() }).from(usersTable);
  const [articleCount] = await db.select({ count: count() }).from(blogArticlesTable);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [todayLeads] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(gte(leadsTable.createdAt, todayStart));

  const [activeCount] = await db
    .select({ count: count() })
    .from(listingsTable)
    .where(eq(listingsTable.status, "active"));

  res.json(
    GetAdminStatsResponse.parse({
      totalListings: Number(listingCount?.count ?? 0),
      totalLeads: Number(leadCount?.count ?? 0),
      totalUsers: Number(userCount?.count ?? 0),
      totalArticles: Number(articleCount?.count ?? 0),
      newLeadsToday: Number(todayLeads?.count ?? 0),
      activeListings: Number(activeCount?.count ?? 0),
    }),
  );
});

router.get("/admin/listings", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);

  const rows = await db
    .select()
    .from(listingsTable)
    .orderBy(desc(listingsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(GetAdminListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/admin/leads", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);

  const rows = await db
    .select()
    .from(leadsTable)
    .orderBy(desc(leadsTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    GetAdminLeadsResponse.parse(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone ?? null,
        message: row.message ?? null,
        listingId: row.listingId ?? null,
        listingTitle: row.listingTitle ?? null,
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      })),
    ),
  );
});

// Factored out of the route handler so the same query can be exercised by a
// debug/test caller without going through the Clerk admin-auth layer, which
// is a separately-proven mechanism shared by every /admin/* route.
export async function queryAdminViewings(opts: { limit?: number; offset?: number; status?: string }) {
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;
  const statusFilter = viewingStatusEnum.enumValues.find((v) => v === opts.status);

  const rows = await db
    .select({ viewing: viewingsTable, listingTitle: listingsTable.title })
    .from(viewingsTable)
    .leftJoin(listingsTable, eq(viewingsTable.listingId, listingsTable.id))
    .where(statusFilter ? eq(viewingsTable.status, statusFilter) : undefined)
    .orderBy(desc(viewingsTable.scheduledAt))
    .limit(limit)
    .offset(offset);

  return rows.map(({ viewing, listingTitle }) => ({
    id: viewing.id,
    listingId: viewing.listingId,
    listingTitle: listingTitle ?? null,
    name: viewing.tenantName,
    email: viewing.tenantEmail,
    phone: viewing.tenantPhone ?? null,
    notes: viewing.notes ?? null,
    scheduledAt: viewing.scheduledAt.toISOString(),
    durationMinutes: viewing.durationMinutes,
    status: viewing.status,
    createdAt: viewing.createdAt.toISOString(),
  }));
}

router.get("/admin/viewings", async (req, res): Promise<void> => {
  const rows = await queryAdminViewings({
    limit: Number(req.query.limit ?? 50),
    offset: Number(req.query.offset ?? 0),
    status: typeof req.query.status === "string" ? req.query.status : undefined,
  });
  res.json(GetAdminViewingsResponse.parse(rows));
});

// Same rationale as queryAdminViewings above — factored out for debug/test use.
export async function updateAdminViewingStatus(id: number, status: "completed" | "no_show" | "cancelled") {
  const patch: Partial<typeof viewingsTable.$inferInsert> = { status };
  if (status === "completed") patch.completedAt = new Date();
  if (status === "cancelled") { patch.cancelledAt = new Date(); patch.cancelledBy = "admin"; }

  const updated = await db
    .update(viewingsTable)
    .set(patch)
    .where(eq(viewingsTable.id, id))
    .returning();

  if (!updated[0]) return null;

  const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, updated[0].listingId));
  return {
    id: updated[0].id,
    listingId: updated[0].listingId,
    listingTitle: listing?.title ?? null,
    name: updated[0].tenantName,
    email: updated[0].tenantEmail,
    phone: updated[0].tenantPhone ?? null,
    notes: updated[0].notes ?? null,
    scheduledAt: updated[0].scheduledAt.toISOString(),
    durationMinutes: updated[0].durationMinutes,
    status: updated[0].status,
    createdAt: updated[0].createdAt.toISOString(),
  };
}

router.post("/admin/viewings/:id/status", async (req, res): Promise<void> => {
  const paramsParsed = UpdateViewingStatusParams.safeParse(req.params);
  const bodyParsed = UpdateViewingStatusBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: (paramsParsed.error ?? bodyParsed.error)?.message });
    return;
  }

  const result = await updateAdminViewingStatus(paramsParsed.data.id, bodyParsed.data.status);
  if (!result) { res.status(404).json({ error: "Viewing not found" }); return; }
  res.json(UpdateViewingStatusResponse.parse(result));
});

router.get("/admin/articles", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);

  const rows = await db
    .select()
    .from(blogArticlesTable)
    .orderBy(desc(blogArticlesTable.publishedAt))
    .limit(limit)
    .offset(offset);

  res.json(
    GetAdminArticlesResponse.parse(
      rows.map((row) => ({
        ...row,
        tags: row.tags ?? [],
        imageUrl: row.imageUrl ?? null,
        publishedAt: row.publishedAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      })),
    ),
  );
});

router.get("/admin/users", async (req, res): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);

  const rows = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(limit)
    .offset(offset);

  res.json(
    GetAdminUsersResponse.parse(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.createdAt.toISOString(),
        lastActiveAt: row.lastActiveAt?.toISOString() ?? null,
      })),
    ),
  );
});

function serializeListing(row: typeof listingsTable.$inferSelect) {
  return {
    ...row,
    photos: row.photos ?? [],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    availableFrom: row.availableFrom ?? null,
    floorAreaSqm: row.floorAreaSqm ?? null,
    aiMatchScore: row.aiMatchScore ?? null,
    addressLine1: row.addressLine1 ?? "",
  };
}

export default router;
