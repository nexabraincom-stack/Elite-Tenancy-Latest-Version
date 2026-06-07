/**
 * MODULE 2 — Automated 2026 Tenancy Takeover Pipeline
 *
 * RRA 2026-compliant lease assignment workflow:
 *   POST /takeover/initiate           — outgoing tenant starts a takeover
 *   GET  /takeover/:id                — fetch takeover details
 *   POST /takeover/:id/generate-rooms — AI room config snapshot
 *   GET  /takeover/consent/:token     — landlord opens consent link
 *   POST /takeover/consent/:token     — landlord approves or rejects
 *   POST /takeover/:id/execute-deed   — record signed deed of assignment
 *   POST /takeover/:id/deposit-init   — mark deposit transfer initiated
 *   GET  /takeover/my                 — assignor: list own takeovers
 *   POST /takeover/:id/remind         — manual reminder trigger (admin)
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { N8N_EVENTS, fireWebhook } from "../lib/n8n";
import crypto from "node:crypto";

const router: IRouter = Router();

// ── Auth helper (mirrors pattern in subscriptions.ts) ─────────────────────────
async function requireUser(req: Request, res: Response): Promise<{ id: number; email: string } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const { rows } = await pool.query<{ id: number; email: string }>(
    `SELECT id, email FROM users WHERE clerk_id = $1`,
    [auth.userId],
  );
  if (!rows[0]) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return rows[0];
}

// ── POST /takeover/initiate ───────────────────────────────────────────────────
// Outgoing tenant registers intent to assign their lease.
router.post("/initiate", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const {
    listingId,
    landlordUserId,
    monthlyRentPence,
    depositAmountPence,
    originalLeaseStart,
    originalLeaseEnd,
    isPeriodic = false,
    periodicCycleDays = 30,
    depositScheme,
    notes,
  } = req.body as {
    listingId?: number;
    landlordUserId?: number;
    monthlyRentPence: number;
    depositAmountPence: number;
    originalLeaseStart?: string;
    originalLeaseEnd?: string;
    isPeriodic?: boolean;
    periodicCycleDays?: number;
    depositScheme?: "DPS" | "TDS" | "MyDeposits";
    notes?: string;
  };

  if (!monthlyRentPence || !depositAmountPence) {
    res.status(400).json({ error: "monthlyRentPence and depositAmountPence are required" });
    return;
  }

  // Generate a secure single-use landlord consent token
  const consentToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Calculate remaining fixed months
  let remainingFixedMonths: number | null = null;
  if (originalLeaseEnd && !isPeriodic) {
    const now = new Date();
    const end = new Date(originalLeaseEnd);
    remainingFixedMonths = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)),
    );
  }

  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO tenancy_takeovers (
       assignor_user_id, landlord_user_id, listing_id,
       monthly_rent_pence, deposit_amount_pence,
       original_lease_start, original_lease_end, remaining_fixed_months,
       is_periodic, periodic_cycle_days,
       deposit_scheme,
       landlord_consent_token, consent_token_expires_at,
       approval_status, notes
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'pending',$14)
     RETURNING id`,
    [
      user.id,
      landlordUserId ?? null,
      listingId ?? null,
      monthlyRentPence,
      depositAmountPence,
      originalLeaseStart ?? null,
      originalLeaseEnd ?? null,
      remainingFixedMonths,
      isPeriodic,
      periodicCycleDays,
      depositScheme ?? null,
      consentToken,
      tokenExpiry.toISOString(),
      notes ?? null,
    ],
  );

  const takeover = rows[0];

  // Fire n8n: takeover initiated webhook
  const n8nPath = process.env.N8N_WEBHOOK_TAKEOVER_INITIATED;
  if (n8nPath) {
    fireWebhook(n8nPath, {
      event: "takeover_initiated",
      timestamp: new Date().toISOString(),
      takeoverId: takeover.id,
      assignorId: user.id,
      landlordUserId: landlordUserId ?? null,
      consentUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.elitetenancy.co.uk"}/takeover/consent/${consentToken}`,
    }).catch(() => {});
  }

  logger.info({ takeoverId: takeover.id, assignorId: user.id }, "Tenancy takeover initiated");

  res.status(201).json({
    id: takeover.id,
    status: "pending",
    consentToken,
    consentUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.elitetenancy.co.uk"}/takeover/consent/${consentToken}`,
    message: "Takeover initiated. Send the consent URL to your landlord.",
  });
});

// ── GET /takeover/my ──────────────────────────────────────────────────────────
router.get("/my", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    `SELECT t.*,
            l.title AS listing_title
       FROM tenancy_takeovers t
  LEFT JOIN listings l ON l.id = t.listing_id
      WHERE t.assignor_user_id = $1
        OR  t.assignee_user_id = $1
   ORDER BY t.created_at DESC
      LIMIT 20`,
    [user.id],
  );

  res.json(rows);
});

// ── GET /takeover/:id ─────────────────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    `SELECT t.*,
            l.title AS listing_title
       FROM tenancy_takeovers t
  LEFT JOIN listings l ON l.id = t.listing_id
      WHERE t.id = $1
        AND (t.assignor_user_id = $2 OR t.assignee_user_id = $2 OR t.landlord_user_id = $2)`,
    [req.params.id, user.id],
  );

  if (!rows[0]) {
    res.status(404).json({ error: "Takeover not found" });
    return;
  }

  res.json(rows[0]);
});

// ── POST /takeover/:id/generate-rooms ─────────────────────────────────────────
// Generate a structured room configuration snapshot for the deed of assignment.
router.post("/:id/generate-rooms", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rooms } = req.body as {
    rooms: Array<{
      name: string;
      type: "bedroom" | "living" | "kitchen" | "bathroom" | "other";
      furnished: boolean;
      condition: "excellent" | "good" | "fair" | "poor";
      notes?: string;
    }>;
  };

  if (!Array.isArray(rooms) || rooms.length === 0) {
    res.status(400).json({ error: "rooms array is required" });
    return;
  }

  const config = {
    generatedAt: new Date().toISOString(),
    generatedBy: user.id,
    rooms,
    totalRooms: rooms.length,
    furnishedRooms: rooms.filter((r) => r.furnished).length,
  };

  await pool.query(
    `UPDATE tenancy_takeovers
        SET room_configuration = $1, updated_at = NOW()
      WHERE id = $2 AND assignor_user_id = $3`,
    [JSON.stringify(config), req.params.id, user.id],
  );

  res.json({ roomConfiguration: config });
});

// ── GET /takeover/consent/:token ──────────────────────────────────────────────
// Landlord opens consent link — show them the takeover details.
router.get("/consent/:token", async (req: Request, res: Response): Promise<void> => {
  const { rows } = await pool.query(
    `SELECT t.*,
            u.name   AS assignor_name,
            u.email  AS assignor_email,
            l.title  AS listing_title,
            l.address AS listing_address
       FROM tenancy_takeovers t
       JOIN users u ON u.id = t.assignor_user_id
  LEFT JOIN listings l ON l.id = t.listing_id
      WHERE t.landlord_consent_token = $1
        AND t.consent_token_expires_at > NOW()
        AND t.approval_status = 'pending'`,
    [req.params.token],
  );

  if (!rows[0]) {
    res.status(410).json({ error: "Consent link expired or already used" });
    return;
  }

  // Move to landlord_review state
  await pool.query(
    `UPDATE tenancy_takeovers
        SET approval_status = 'landlord_review', updated_at = NOW()
      WHERE landlord_consent_token = $1`,
    [req.params.token],
  );

  const takeover = rows[0];
  res.json({
    takeoverId: takeover.id,
    assignorName: takeover.assignor_name,
    assignorEmail: takeover.assignor_email,
    listingTitle: takeover.listing_title,
    listingAddress: takeover.listing_address,
    monthlyRentPence: takeover.monthly_rent_pence,
    depositAmountPence: takeover.deposit_amount_pence,
    remainingFixedMonths: takeover.remaining_fixed_months,
    isPeriodic: takeover.is_periodic,
    depositScheme: takeover.deposit_scheme,
    roomConfiguration: takeover.room_configuration,
    status: "landlord_review",
    message: "Please review the tenancy takeover details and approve or reject below.",
  });
});

// ── POST /takeover/consent/:token ─────────────────────────────────────────────
// Landlord approves or rejects.
router.post("/consent/:token", async (req: Request, res: Response): Promise<void> => {
  const { decision, rejectionReason } = req.body as {
    decision: "approved" | "rejected";
    rejectionReason?: string;
  };

  if (!["approved", "rejected"].includes(decision)) {
    res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
    return;
  }

  const { rows } = await pool.query(
    `UPDATE tenancy_takeovers
        SET approval_status       = $1,
            landlord_consented_at = CASE WHEN $1 = 'approved' THEN NOW() ELSE NULL END,
            notes                 = CASE WHEN $1 = 'rejected' THEN $2 ELSE notes END,
            updated_at            = NOW()
      WHERE landlord_consent_token = $3
        AND consent_token_expires_at > NOW()
        AND approval_status = 'landlord_review'
     RETURNING id, assignor_user_id`,
    [decision, rejectionReason ?? null, req.params.token],
  );

  if (!rows[0]) {
    res.status(410).json({ error: "Consent link expired, already used, or not in review state" });
    return;
  }

  const { id: takeoverId, assignor_user_id } = rows[0];

  logger.info({ takeoverId, decision }, `Tenancy takeover ${decision} by landlord`);

  // Fire n8n: notify assignor
  const n8nPath = process.env.N8N_WEBHOOK_TAKEOVER_DECISION;
  if (n8nPath) {
    fireWebhook(n8nPath, {
      event: "takeover_decision",
      timestamp: new Date().toISOString(),
      takeoverId,
      assignorUserId: assignor_user_id,
      decision,
      rejectionReason: rejectionReason ?? null,
    }).catch(() => {});
  }

  res.json({
    takeoverId,
    decision,
    message: decision === "approved"
      ? "Takeover approved. The outgoing tenant can now proceed with the deed of assignment."
      : "Takeover rejected. The outgoing tenant has been notified.",
  });
});

// ── POST /takeover/:id/execute-deed ───────────────────────────────────────────
// Record that the deed of assignment has been signed.
router.post("/:id/execute-deed", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { deedDocumentUrl } = req.body as { deedDocumentUrl?: string };

  const { rowCount } = await pool.query(
    `UPDATE tenancy_takeovers
        SET deed_executed = true, deed_executed_at = NOW(),
            deed_document_url = $1, updated_at = NOW()
      WHERE id = $2
        AND (assignor_user_id = $3 OR landlord_user_id = $3)
        AND approval_status = 'approved'`,
    [deedDocumentUrl ?? null, req.params.id, user.id],
  );

  if (!rowCount) {
    res.status(404).json({ error: "Takeover not found, not approved, or access denied" });
    return;
  }

  logger.info({ takeoverId: req.params.id }, "Deed of assignment executed");
  res.json({ message: "Deed of assignment recorded. Proceed with deposit transfer." });
});

// ── POST /takeover/:id/deposit-init ───────────────────────────────────────────
// Mark deposit protection transfer as initiated.
router.post("/:id/deposit-init", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { depositReference } = req.body as { depositReference?: string };

  const { rowCount } = await pool.query(
    `UPDATE tenancy_takeovers
        SET deposit_transfer_initiated = true,
            deposit_transfer_at        = NOW(),
            deposit_reference          = $1,
            updated_at                 = NOW()
      WHERE id = $2
        AND (assignor_user_id = $3 OR landlord_user_id = $3)
        AND deed_executed = true`,
    [depositReference ?? null, req.params.id, user.id],
  );

  if (!rowCount) {
    res.status(404).json({
      error: "Takeover not found, deed not yet executed, or access denied",
    });
    return;
  }

  logger.info({ takeoverId: req.params.id }, "Deposit transfer initiated");
  res.json({ message: "Deposit transfer marked as initiated. Tenancy takeover complete." });
});

// ── POST /takeover/:id/remind ─────────────────────────────────────────────────
// Manual reminder trigger (admin / cron use).
router.post("/:id/remind", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    `UPDATE tenancy_takeovers
        SET last_reminder_sent_at = NOW(),
            reminder_count = reminder_count + 1,
            updated_at = NOW()
      WHERE id = $1
        AND (assignor_user_id = $2 OR landlord_user_id = $2)
     RETURNING id, reminder_count, assignor_user_id, landlord_user_id`,
    [req.params.id, user.id],
  );

  if (!rows[0]) {
    res.status(404).json({ error: "Takeover not found or access denied" });
    return;
  }

  const path = process.env.N8N_WEBHOOK_TAKEOVER_INITIATED;
  if (path) {
    fireWebhook(path, {
      event: "takeover_reminder",
      timestamp: new Date().toISOString(),
      takeoverId: rows[0].id,
      reminderCount: rows[0].reminder_count,
    }).catch(() => {});
  }

  res.json({ message: "Reminder sent", reminderCount: rows[0].reminder_count });
});

export default router;
