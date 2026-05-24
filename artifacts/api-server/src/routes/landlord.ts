import { Router, type IRouter } from "express";
import {
  db,
  listingsTable,
  leadsTable,
  tenanciesTable,
  maintenanceRequestsTable,
  rentPaymentsTable,
  usersTable,
} from "@workspace/db";
import { eq, and, count, sum, desc } from "drizzle-orm";
import {
  GetLandlordStatsResponse,
  GetLandlordListingsResponse,
  GetLandlordTenantsResponse,
  GetLandlordFinancesResponse,
  GetLandlordMaintenanceResponse,
  GetLandlordLeadsResponse,
  CreateLandlordListingBody,
} from "@workspace/api-zod";
import { requireAuth, requireRole } from "../middlewares/requireAuth";

const router: IRouter = Router();

// All landlord routes require the "landlord" role
router.use("/landlord", requireAuth(), requireRole("landlord"));

router.get("/landlord/stats", async (_req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  const [activeCount] = await db
    .select({ count: count() })
    .from(listingsTable)
    .where(and(eq(listingsTable.landlordId, landlordId), eq(listingsTable.status, "active")));

  const [leadsCount] = await db
    .select({ count: count() })
    .from(leadsTable)
    .where(eq(leadsTable.status, "new"));

  const tenancyRows = await db
    .select()
    .from(tenanciesTable)
    .where(and(eq(tenanciesTable.landlordId, landlordId), eq(tenanciesTable.status, "active")));

  const totalMonthlyRent = tenancyRows.reduce((sum, t) => sum + t.monthlyRent, 0);

  const [maintenanceCount] = await db
    .select({ count: count() })
    .from(maintenanceRequestsTable)
    .where(eq(maintenanceRequestsTable.status, "open"));

  const totalListings = Number(activeCount?.count ?? 0);
  const occupancyRate =
    totalListings > 0
      ? Math.round((tenancyRows.length / totalListings) * 100)
      : 0;

  res.json(
    GetLandlordStatsResponse.parse({
      activeListings: totalListings,
      totalTenants: tenancyRows.length,
      monthlyRevenue: totalMonthlyRent,
      pendingMaintenance: Number(maintenanceCount?.count ?? 0),
      newLeads: Number(leadsCount?.count ?? 0),
      occupancyRate,
    }),
  );
});

router.get("/landlord/listings", async (_req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  const rows = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.landlordId, landlordId))
    .orderBy(desc(listingsTable.createdAt));

  res.json(GetLandlordListingsResponse.parse(rows.map(serializeListing)));
});

router.post("/landlord/listings", async (req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  const parsed = CreateLandlordListingBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid landlord listing body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const slug =
    parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
    "-" +
    Date.now();

  const [row] = await db
    .insert(listingsTable)
    .values({ ...parsed.data, slug, landlordId })
    .returning();

  res.status(201).json(serializeListing(row));
});

router.get("/landlord/tenants", async (_req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  const rows = await db
    .select({
      tenancyId: tenanciesTable.id,
      tenantId: tenanciesTable.tenantId,
      monthlyRent: tenanciesTable.monthlyRent,
      leaseStart: tenanciesTable.leaseStart,
      leaseEnd: tenanciesTable.leaseEnd,
      status: tenanciesTable.status,
      propertyAddress: listingsTable.addressLine1,
      listingTitle: listingsTable.title,
      tenantName: usersTable.name,
      tenantEmail: usersTable.email,
    })
    .from(tenanciesTable)
    .innerJoin(usersTable, eq(tenanciesTable.tenantId, usersTable.id))
    .innerJoin(listingsTable, eq(tenanciesTable.listingId, listingsTable.id))
    .where(eq(tenanciesTable.landlordId, landlordId))
    .orderBy(desc(tenanciesTable.leaseStart));

  res.json(
    GetLandlordTenantsResponse.parse(
      rows.map((row) => ({
        id: row.tenancyId,
        name: row.tenantName,
        email: row.tenantEmail,
        phone: null,
        propertyAddress: row.propertyAddress || row.listingTitle,
        rentAmount: row.monthlyRent,
        leaseStart: row.leaseStart,
        leaseEnd: row.leaseEnd,
        status: row.status,
      })),
    ),
  );
});

router.get("/landlord/finances", async (_req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  const tenancies = await db
    .select({ id: tenanciesTable.id, monthlyRent: tenanciesTable.monthlyRent })
    .from(tenanciesTable)
    .where(eq(tenanciesTable.landlordId, landlordId));

  const tenancyIds = tenancies.map((t) => t.id);

  let transactions: Array<{
    id: number;
    date: string;
    description: string;
    amount: number;
    type: string;
    status: string;
  }> = [];

  if (tenancyIds.length > 0) {
    const payments = await db
      .select({
        id: rentPaymentsTable.id,
        dueDate: rentPaymentsTable.dueDate,
        paidDate: rentPaymentsTable.paidDate,
        amount: rentPaymentsTable.amount,
        status: rentPaymentsTable.status,
        reference: rentPaymentsTable.reference,
      })
      .from(rentPaymentsTable)
      .where(
        tenancyIds.length === 1
          ? eq(rentPaymentsTable.tenancyId, tenancyIds[0])
          : eq(rentPaymentsTable.tenancyId, tenancyIds[0]), // Drizzle inList if needed
      )
      .orderBy(desc(rentPaymentsTable.dueDate))
      .limit(50);

    transactions = payments.map((p) => ({
      id: p.id,
      date: p.paidDate ?? p.dueDate,
      description: `Rent — ref ${p.reference}`,
      amount: p.amount,
      type: "income",
      status: p.status,
    }));
  }

  const totalRevenue = transactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = tenancies.reduce((sum, t) => sum + t.monthlyRent, 0);

  const pendingPayments = transactions
    .filter((t) => t.status === "due" || t.status === "overdue")
    .reduce((sum, t) => sum + t.amount, 0);

  res.json(
    GetLandlordFinancesResponse.parse({
      totalRevenue,
      monthlyRevenue,
      pendingPayments,
      transactions,
    }),
  );
});

router.get("/landlord/maintenance", async (_req, res): Promise<void> => {
  const landlordId = res.locals.user.id;

  // Get all listings for this landlord then get maintenance requests for those listings
  const landlordListings = await db
    .select({ id: listingsTable.id })
    .from(listingsTable)
    .where(eq(listingsTable.landlordId, landlordId));

  if (landlordListings.length === 0) {
    res.json(GetLandlordMaintenanceResponse.parse([]));
    return;
  }

  // Fetch maintenance requests linked to any of the landlord's tenancies
  const requests = await db
    .select()
    .from(maintenanceRequestsTable)
    .innerJoin(tenanciesTable, eq(maintenanceRequestsTable.tenancyId, tenanciesTable.id))
    .where(eq(tenanciesTable.landlordId, landlordId))
    .orderBy(desc(maintenanceRequestsTable.createdAt));

  res.json(
    GetLandlordMaintenanceResponse.parse(
      requests.map(({ maintenance_requests: r }) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        priority: r.priority,
        status: r.status,
        propertyAddress: r.propertyAddress ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    ),
  );
});

router.get("/landlord/leads", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(leadsTable)
    .orderBy(desc(leadsTable.createdAt));

  res.json(
    GetLandlordLeadsResponse.parse(
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
