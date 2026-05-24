import { Router, type IRouter } from "express";
import { db, listingsTable, leadsTable, blogArticlesTable, usersTable } from "@workspace/db";
import { count, desc, eq, gte } from "drizzle-orm";
import {
  GetAdminStatsResponse,
  GetAdminListingsResponse,
  GetAdminLeadsResponse,
  GetAdminArticlesResponse,
  GetAdminUsersResponse,
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
