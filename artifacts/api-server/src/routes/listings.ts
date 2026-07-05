import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc, type SQL } from "drizzle-orm";
import { db, listingsTable } from "@workspace/db";
import {
  GetListingsQueryParams,
  GetListingsResponse,
  GetFeaturedListingsResponse,
  GetListingByIdParams,
  GetListingByIdResponse,
  CreateListingBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/listings", async (req, res): Promise<void> => {
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { city, minPrice, maxPrice, bedrooms, category, furnished, dssAccepted } = parsed.data;
  const conditions: SQL[] = [eq(listingsTable.status, "active")];

  if (city) conditions.push(eq(listingsTable.city, city));
  if (minPrice != null) conditions.push(gte(listingsTable.price, minPrice));
  if (maxPrice != null) conditions.push(lte(listingsTable.price, maxPrice));
  if (bedrooms != null) conditions.push(eq(listingsTable.bedrooms, bedrooms));
  if (category) conditions.push(eq(listingsTable.category, category));
  if (furnished != null) conditions.push(eq(listingsTable.furnished, furnished));
  if (dssAccepted != null) conditions.push(eq(listingsTable.dssAccepted, dssAccepted));

  const rows = await db
    .select()
    .from(listingsTable)
    .where(and(...conditions))
    .orderBy(desc(listingsTable.createdAt));

  res.json(GetListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/listings/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(listingsTable)
    .where(and(eq(listingsTable.isFeatured, true), eq(listingsTable.status, "active")))
    .orderBy(desc(listingsTable.createdAt))
    .limit(6);

  res.json(GetFeaturedListingsResponse.parse(rows.map(serializeListing)));
});

router.get("/listings/:id", async (req, res): Promise<void> => {
  const params = GetListingByIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Listing not found" });
    return;
  }

  await db
    .update(listingsTable)
    .set({ viewCount: (row.viewCount ?? 0) + 1 })
    .where(eq(listingsTable.id, row.id));

  res.json(GetListingByIdResponse.parse(serializeListing(row)));
});

// Require auth to create a listing
router.post("/listings", requireAuth(), async (req, res): Promise<void> => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid listing body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const landlordId = res.locals.user.id;
  const slug = slugify(parsed.data.title);

  const [row] = await db
    .insert(listingsTable)
    .values({ ...parsed.data, slug, landlordId })
    .returning();

  res.status(201).json(GetListingByIdResponse.parse(serializeListing(row)));
});

function slugify(title: string): string {
  return (
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" +
    Date.now()
  );
}

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
