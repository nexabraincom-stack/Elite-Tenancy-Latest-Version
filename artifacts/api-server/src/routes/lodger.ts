/**
 * MODULE — Lodger Licence Workflow
 *
 * A tenant renting a whole property can take in a lodger with the landlord's
 * written consent, captured here rather than over email/text. Legally
 * distinct from a tenancy: the lodger is an "excluded occupier" under the
 * Protection from Eviction Act 1977 (no security of tenure), licensed by the
 * host tenant — the landlord's role is limited to consenting to the original
 * tenancy permitting it (Renters' Rights Act 2026 "cannot unreasonably
 * refuse" standard).
 *
 *   POST /lodger/request                  — tenant requests to take in a lodger
 *   GET  /lodger/my                       — tenant: list own lodger requests
 *   GET  /lodger/:id                      — either party views a single record
 *   GET  /landlord/lodger-requests        — landlord: requests across their tenancies
 *   POST /lodger/:id/consent              — landlord approves/declines
 *   POST /lodger/:id/generate-agreement   — host tenant generates the licence agreement
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import {
  db,
  pool,
  lodgerLicencesTable,
  tenanciesTable,
  listingsTable,
  usersTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import {
  sendEmail,
  isEmailConfigured,
  lodgerConsentRequestEmail,
  lodgerConsentDecisionEmail,
} from "../lib/email";

const router: IRouter = Router();

// ── Auth helper (mirrors interest.ts's requireUser — this router serves both
// tenant and landlord callers, so a blanket router.use(requireRole(...)) doesn't fit) ──
async function requireUser(
  req: Request,
  res: Response,
): Promise<{ id: number; email: string; name: string; role: string } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const { rows } = await pool.query<{ id: number; email: string; name: string; role: string }>(
    `SELECT id, email, name, role FROM users WHERE clerk_id = $1`,
    [auth.userId],
  );
  if (!rows[0]) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return rows[0];
}

// ── POST /lodger/request ──────────────────────────────────────────────────────
// Tenant requests to take in a lodger under their active tenancy.
router.post("/lodger/request", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { lodgerName, lodgerEmail, lodgerPhone, roomDescription, rentPcm, billsIncluded, moveInDate } =
    req.body as {
      lodgerName?: string;
      lodgerEmail?: string;
      lodgerPhone?: string;
      roomDescription?: string;
      rentPcm?: number;
      billsIncluded?: boolean;
      moveInDate?: string;
    };

  if (!lodgerName || !lodgerEmail || !roomDescription || !rentPcm) {
    res.status(400).json({ error: "lodgerName, lodgerEmail, roomDescription and rentPcm are required" });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lodgerEmail)) {
    res.status(400).json({ error: "A valid lodgerEmail is required" });
    return;
  }

  const [tenancy] = await db
    .select({
      id: tenanciesTable.id,
      landlordId: tenanciesTable.landlordId,
      listingId: tenanciesTable.listingId,
    })
    .from(tenanciesTable)
    .where(and(eq(tenanciesTable.tenantId, user.id), eq(tenanciesTable.status, "active")))
    .orderBy(desc(tenanciesTable.createdAt))
    .limit(1);

  if (!tenancy) {
    res.status(404).json({ error: "You don't have an active tenancy on file to attach a lodger request to" });
    return;
  }

  const [row] = await db
    .insert(lodgerLicencesTable)
    .values({
      tenancyId: tenancy.id,
      hostTenantId: user.id,
      lodgerName,
      lodgerEmail,
      lodgerPhone: lodgerPhone ?? null,
      roomDescription,
      rentPcm,
      billsIncluded: billsIncluded ?? false,
      moveInDate: moveInDate ?? null,
    })
    .returning();

  logger.info({ lodgerLicenceId: row.id, tenancyId: tenancy.id }, "Lodger consent request created");

  // Notify the landlord — this is a written-consent request, so email is the
  // durable record, not just an in-app toast.
  if (isEmailConfigured()) {
    const [landlord] = await db.select().from(usersTable).where(eq(usersTable.id, tenancy.landlordId));
    const [listing] = tenancy.listingId
      ? await db.select().from(listingsTable).where(eq(listingsTable.id, tenancy.listingId))
      : [];
    if (landlord) {
      const { subject, html } = lodgerConsentRequestEmail({
        landlordName: landlord.name,
        tenantName: user.name,
        propertyAddress: listing ? `${listing.addressLine1 || listing.title}, ${listing.city}` : "your property",
        rentPcm,
        reviewUrl: "https://www.elitetenancy.co.uk/landlord/lodger-requests",
      });
      sendEmail({ to: landlord.email, subject, html }).catch(() => {});
    }
  }

  res.status(201).json(row);
});

// ── GET /lodger/my ─────────────────────────────────────────────────────────────
// Tenant: list their own lodger requests.
router.get("/lodger/my", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const rows = await db
    .select()
    .from(lodgerLicencesTable)
    .where(eq(lodgerLicencesTable.hostTenantId, user.id))
    .orderBy(desc(lodgerLicencesTable.createdAt));

  res.json(rows);
});

// ── GET /landlord/lodger-requests ─────────────────────────────────────────────
// Landlord: all lodger requests across tenancies they own.
router.get("/landlord/lodger-requests", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;
  if (user.role !== "landlord") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const rows = await db
    .select({
      id: lodgerLicencesTable.id,
      tenancyId: lodgerLicencesTable.tenancyId,
      hostTenantId: lodgerLicencesTable.hostTenantId,
      lodgerName: lodgerLicencesTable.lodgerName,
      lodgerEmail: lodgerLicencesTable.lodgerEmail,
      lodgerPhone: lodgerLicencesTable.lodgerPhone,
      roomDescription: lodgerLicencesTable.roomDescription,
      rentPcm: lodgerLicencesTable.rentPcm,
      billsIncluded: lodgerLicencesTable.billsIncluded,
      moveInDate: lodgerLicencesTable.moveInDate,
      status: lodgerLicencesTable.status,
      landlordConsentDecidedAt: lodgerLicencesTable.landlordConsentDecidedAt,
      landlordConsentNote: lodgerLicencesTable.landlordConsentNote,
      createdAt: lodgerLicencesTable.createdAt,
      hostTenantName: usersTable.name,
    })
    .from(lodgerLicencesTable)
    .innerJoin(tenanciesTable, eq(tenanciesTable.id, lodgerLicencesTable.tenancyId))
    .innerJoin(usersTable, eq(usersTable.id, lodgerLicencesTable.hostTenantId))
    .where(eq(tenanciesTable.landlordId, user.id))
    .orderBy(desc(lodgerLicencesTable.createdAt));

  res.json(rows);
});

// ── GET /lodger/:id ────────────────────────────────────────────────────────────
// Either the host tenant or the tenancy's landlord may view a single record.
router.get("/lodger/:id", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const [row] = await db
    .select({
      licence: lodgerLicencesTable,
      landlordId: tenanciesTable.landlordId,
    })
    .from(lodgerLicencesTable)
    .innerJoin(tenanciesTable, eq(tenanciesTable.id, lodgerLicencesTable.tenancyId))
    .where(eq(lodgerLicencesTable.id, Number(req.params.id)));

  if (!row || (row.licence.hostTenantId !== user.id && row.landlordId !== user.id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json(row.licence);
});

// ── POST /lodger/:id/consent ──────────────────────────────────────────────────
// Landlord approves or declines. Only the tenancy's own landlord may decide.
router.post("/lodger/:id/consent", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { approve, note } = req.body as { approve?: boolean; note?: string };
  if (typeof approve !== "boolean") {
    res.status(400).json({ error: "approve (boolean) is required" });
    return;
  }

  const [row] = await db
    .select({ licence: lodgerLicencesTable, landlordId: tenanciesTable.landlordId })
    .from(lodgerLicencesTable)
    .innerJoin(tenanciesTable, eq(tenanciesTable.id, lodgerLicencesTable.tenancyId))
    .where(eq(lodgerLicencesTable.id, Number(req.params.id)));

  if (!row || row.landlordId !== user.id) {
    res.status(404).json({ error: "Not found or not your tenancy" });
    return;
  }
  if (row.licence.status !== "pending_landlord_consent") {
    res.status(409).json({ error: "This request has already been decided" });
    return;
  }

  const [updated] = await db
    .update(lodgerLicencesTable)
    .set({
      status: approve ? "consent_approved" : "consent_declined",
      landlordConsentDecidedAt: new Date(),
      landlordConsentNote: note ?? null,
    })
    .where(eq(lodgerLicencesTable.id, row.licence.id))
    .returning();

  logger.info({ lodgerLicenceId: row.licence.id, approve }, "Lodger consent decision recorded");

  if (isEmailConfigured()) {
    const [tenant] = await db.select().from(usersTable).where(eq(usersTable.id, row.licence.hostTenantId));
    if (tenant) {
      const { subject, html } = lodgerConsentDecisionEmail({
        tenantName: tenant.name,
        approved: approve,
        note,
        dashboardUrl: "https://www.elitetenancy.co.uk/tenant/dashboard",
      });
      sendEmail({ to: tenant.email, subject, html }).catch(() => {});
    }
  }

  res.json(updated);
});

// ── POST /lodger/:id/generate-agreement ───────────────────────────────────────
// Host tenant generates the licence agreement once consent is approved.
router.post("/lodger/:id/generate-agreement", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const [row] = await db
    .select({
      licence: lodgerLicencesTable,
      propertyAddress: listingsTable.addressLine1,
      propertyCity: listingsTable.city,
    })
    .from(lodgerLicencesTable)
    .innerJoin(tenanciesTable, eq(tenanciesTable.id, lodgerLicencesTable.tenancyId))
    .leftJoin(listingsTable, eq(listingsTable.id, tenanciesTable.listingId))
    .where(eq(lodgerLicencesTable.id, Number(req.params.id)));

  if (!row || row.licence.hostTenantId !== user.id) {
    res.status(404).json({ error: "Not found or not your request" });
    return;
  }
  if (row.licence.status !== "consent_approved" && row.licence.status !== "active") {
    res.status(409).json({ error: "Landlord consent must be approved before generating an agreement" });
    return;
  }

  const agreementContent = buildLodgerAgreementHtml({
    hostTenantName: user.name,
    lodgerName: row.licence.lodgerName,
    propertyAddress: [row.propertyAddress, row.propertyCity].filter(Boolean).join(", ") || "the property",
    roomDescription: row.licence.roomDescription,
    rentPcm: row.licence.rentPcm,
    billsIncluded: row.licence.billsIncluded,
    moveInDate: row.licence.moveInDate,
  });

  const [updated] = await db
    .update(lodgerLicencesTable)
    .set({
      status: "active",
      agreementContent,
      agreementGeneratedAt: new Date(),
    })
    .where(eq(lodgerLicencesTable.id, row.licence.id))
    .returning();

  res.json(updated);
});

// ── Agreement template ────────────────────────────────────────────────────────
// A licence agreement, NOT a tenancy agreement — the lodger has no security
// of tenure (excluded occupier, Protection from Eviction Act 1977 s.3A).
// This is a starting template, not legal advice; flagged clearly in the
// generated document itself.
function buildLodgerAgreementHtml(data: {
  hostTenantName: string;
  lodgerName: string;
  propertyAddress: string;
  roomDescription: string;
  rentPcm: number;
  billsIncluded: boolean;
  moveInDate: string | null;
}): string {
  const rentPounds = (data.rentPcm / 100).toFixed(2);
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return `
<h1>Lodger Licence Agreement</h1>
<p><em>This is a template generated by Elite Tenancy to help you record the terms of a lodger arrangement. It is not legal advice. For anything unusual or high-value, consider having it reviewed by a solicitor.</em></p>

<h2>Parties</h2>
<p><strong>Host (Resident Tenant):</strong> ${data.hostTenantName}<br/>
<strong>Lodger:</strong> ${data.lodgerName}<br/>
<strong>Property:</strong> ${data.propertyAddress}<br/>
<strong>Date of agreement:</strong> ${today}</p>

<h2>1. Nature of this agreement</h2>
<p>This is a <strong>licence to occupy</strong>, not a tenancy. The Lodger shares the Host's home and does not have exclusive possession of any part of it. As an <strong>excluded occupier</strong> under the Protection from Eviction Act 1977, the Lodger does not have the security of tenure a tenant would have, and can be asked to leave on reasonable notice matching the rent period, without a court order.</p>

<h2>2. Room and use of the property</h2>
<p>${data.roomDescription}</p>
<p>The Lodger may use shared areas of the property (kitchen, bathroom, living areas) alongside the Host, but does not have exclusive use of any room.</p>

<h2>3. Rent</h2>
<p>The Lodger will pay the Host <strong>£${rentPounds} per month</strong>${data.billsIncluded ? ", with bills included" : ", excluding bills unless otherwise agreed in writing"}.</p>
<p>Rent received by the Host under this agreement may qualify for the <strong>Rent a Room Scheme</strong>, which allows up to £7,500 per year in gross rental income to be received completely tax-free (correct as of the 2025/26 tax year — check gov.uk for the current threshold). This is automatic if income is below the threshold; no registration is required unless income exceeds it.</p>

<h2>4. Move-in date</h2>
<p>${data.moveInDate ? `The Lodger will move in on or around ${data.moveInDate}.` : "To be agreed between the Host and Lodger."}</p>

<h2>5. Ending the arrangement</h2>
<p>Either party may end this arrangement by giving reasonable notice — in the absence of a longer period agreed in writing, notice equal to one rental period (e.g. one month for a monthly rent) is standard practice.</p>

<h2>6. Landlord's consent</h2>
<p>This lodger arrangement was made with the written consent of the Host's own landlord, recorded via Elite Tenancy, as required under the Host's tenancy agreement.</p>

<hr/>
<p style="font-size:12px;color:#666;">Generated via Elite Tenancy on ${today}. This document is a starting template only and does not constitute legal advice.</p>
`.trim();
}

export default router;
