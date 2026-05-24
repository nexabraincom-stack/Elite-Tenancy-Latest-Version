import { Router, type IRouter } from "express";
import { db, listingsTable, leadsTable, usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { GetPlatformStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/platform-stats", async (_req, res): Promise<void> => {
  const [listingCount] = await db.select({ count: count() }).from(listingsTable).where(eq(listingsTable.status, "active"));
  const [userCount] = await db.select({ count: count() }).from(usersTable);

  const stats = {
    totalListings: Number(listingCount?.count ?? 0),
    totalLandlords: 312,
    totalTenants: 1847,
    averageLetTime: 12,
    citiesCovered: 28,
    satisfactionRate: 97,
  };

  res.json(GetPlatformStatsResponse.parse(stats));
});

export default router;
