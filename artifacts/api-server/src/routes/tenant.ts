import { Router, type IRouter } from "express";
import {
  db,
  tenanciesTable,
  maintenanceRequestsTable,
  rentPaymentsTable,
  documentsTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import {
  GetTenantStatsResponse,
  GetTenantTenancyResponse,
  GetTenantRentResponse,
  GetTenantMaintenanceResponse,
  GetTenantDocumentsResponse,
  SubmitMaintenanceRequestBody,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// All tenant routes require auth (any role can access their own tenancy data)
router.use("/tenant", requireAuth());

// ── Helper: get the active tenancy for the current user ──────────────────────
async function getActiveTenancy(tenantId: number) {
  const [tenancy] = await db
    .select()
    .from(tenanciesTable)
    .where(and(eq(tenanciesTable.tenantId, tenantId), eq(tenanciesTable.status, "active")))
    .orderBy(desc(tenanciesTable.createdAt))
    .limit(1);
  return tenancy ?? null;
}

router.get("/tenant/stats", async (_req, res): Promise<void> => {
  const tenantId = res.locals.user.id;
  const tenancy = await getActiveTenancy(tenantId);

  if (!tenancy) {
    res.json(
      GetTenantStatsResponse.parse({
        rentDue: 0,
        rentDueDate: "",
        daysUntilRenewal: 0,
        openMaintenanceRequests: 0,
        documentsCount: 0,
      }),
    );
    return;
  }

  // Next due payment
  const [nextPayment] = await db
    .select()
    .from(rentPaymentsTable)
    .where(and(eq(rentPaymentsTable.tenancyId, tenancy.id), eq(rentPaymentsTable.status, "due")))
    .orderBy(rentPaymentsTable.dueDate)
    .limit(1);

  const [openMaintenanceCount] = await db
    .select({ count: count() })
    .from(maintenanceRequestsTable)
    .where(
      and(
        eq(maintenanceRequestsTable.tenantId, tenantId),
        eq(maintenanceRequestsTable.status, "open"),
      ),
    );

  const [docsCount] = await db
    .select({ count: count() })
    .from(documentsTable)
    .where(eq(documentsTable.tenancyId, tenancy.id));

  const leaseEnd = new Date(tenancy.leaseEnd);
  const daysUntilRenewal = Math.max(
    0,
    Math.ceil((leaseEnd.getTime() - Date.now()) / 86_400_000),
  );

  res.json(
    GetTenantStatsResponse.parse({
      rentDue: nextPayment?.amount ?? tenancy.monthlyRent,
      rentDueDate: nextPayment?.dueDate ?? "",
      daysUntilRenewal,
      openMaintenanceRequests: Number(openMaintenanceCount?.count ?? 0),
      documentsCount: Number(docsCount?.count ?? 0),
    }),
  );
});

router.get("/tenant/tenancy", async (_req, res): Promise<void> => {
  const tenantId = res.locals.user.id;
  const tenancy = await getActiveTenancy(tenantId);

  if (!tenancy) {
    res.status(404).json({ error: "No active tenancy found" });
    return;
  }

  const [listing] = await db
    .select()
    .from(listingsTable)
    .where(eq(listingsTable.id, tenancy.listingId));

  const [landlord] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, tenancy.landlordId));

  res.json(
    GetTenantTenancyResponse.parse({
      propertyAddress: listing?.addressLine1 || listing?.title || "Property",
      landlordName: landlord?.name ?? "Elite Tenancy Management",
      landlordEmail: landlord?.email ?? "landlord@elitetenancy.co.uk",
      monthlyRent: tenancy.monthlyRent,
      depositAmount: tenancy.depositAmount,
      leaseStart: tenancy.leaseStart,
      leaseEnd: tenancy.leaseEnd,
      tenancyType: tenancy.tenancyType,
      status: tenancy.status,
    }),
  );
});

router.get("/tenant/rent", async (_req, res): Promise<void> => {
  const tenantId = res.locals.user.id;
  const tenancy = await getActiveTenancy(tenantId);

  if (!tenancy) {
    res.json(GetTenantRentResponse.parse([]));
    return;
  }

  const records = await db
    .select()
    .from(rentPaymentsTable)
    .where(eq(rentPaymentsTable.tenancyId, tenancy.id))
    .orderBy(desc(rentPaymentsTable.dueDate));

  res.json(
    GetTenantRentResponse.parse(
      records.map((r) => ({
        id: r.id,
        dueDate: r.dueDate,
        paidDate: r.paidDate ?? null,
        amount: r.amount,
        status: r.status,
        reference: r.reference,
      })),
    ),
  );
});

router.get("/tenant/maintenance", async (_req, res): Promise<void> => {
  const tenantId = res.locals.user.id;

  const requests = await db
    .select()
    .from(maintenanceRequestsTable)
    .where(eq(maintenanceRequestsTable.tenantId, tenantId))
    .orderBy(desc(maintenanceRequestsTable.createdAt));

  res.json(
    GetTenantMaintenanceResponse.parse(
      requests.map((r) => ({
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

router.post("/tenant/maintenance", async (req, res): Promise<void> => {
  const tenantId = res.locals.user.id;

  const parsed = SubmitMaintenanceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid maintenance body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const tenancy = await getActiveTenancy(tenantId);

  const [listing] = tenancy
    ? await db.select().from(listingsTable).where(eq(listingsTable.id, tenancy.listingId))
    : [];

  const [newRequest] = await db
    .insert(maintenanceRequestsTable)
    .values({
      tenantId,
      tenancyId: tenancy?.id ?? null,
      listingId: listing?.id ?? null,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority as "low" | "medium" | "high" | "emergency",
      propertyAddress: listing?.addressLine1 || listing?.title || null,
    })
    .returning();

  req.log.info({ title: parsed.data.title }, "Maintenance request created");
  res.status(201).json({
    id: newRequest.id,
    title: newRequest.title,
    description: newRequest.description,
    category: newRequest.category,
    priority: newRequest.priority,
    status: newRequest.status,
    propertyAddress: newRequest.propertyAddress ?? null,
    createdAt: newRequest.createdAt.toISOString(),
    updatedAt: newRequest.updatedAt.toISOString(),
  });
});

router.get("/tenant/documents", async (_req, res): Promise<void> => {
  const tenantId = res.locals.user.id;
  const tenancy = await getActiveTenancy(tenantId);

  if (!tenancy) {
    res.json(GetTenantDocumentsResponse.parse([]));
    return;
  }

  const docs = await db
    .select()
    .from(documentsTable)
    .where(eq(documentsTable.tenancyId, tenancy.id))
    .orderBy(documentsTable.uploadedAt);

  res.json(
    GetTenantDocumentsResponse.parse(
      docs.map((d) => ({
        id: d.id,
        name: d.name,
        type: d.type,
        uploadedAt: d.uploadedAt,
        size: d.size,
        downloadUrl: d.downloadUrl,
      })),
    ),
  );
});

export default router;
