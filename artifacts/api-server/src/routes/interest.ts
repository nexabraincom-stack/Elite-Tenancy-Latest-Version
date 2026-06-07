/**
 * MODULE 3 — Asymmetrical "Who's Interested" Engine
 *
 * Tenants express interest silently. Landlords see a ranked pool.
 * When a landlord "reciprocates", messaging unlocks for that pair only.
 * This asymmetry forces high-intent signals and prevents spam.
 *
 *   POST /interest/trigger              — tenant expresses interest in a listing
 *   GET  /interest/listing/:listingId   — landlord: ranked interested pool
 *   POST /interest/:interestId/reciprocate — landlord reciprocates → mutual → unlock messaging
 *   POST /interest/:interestId/dismiss  — landlord dismisses
 *   GET  /interest/my                   — tenant: list own interest states
 *   GET  /interest/high-intent/:listingId — top affinity matches (landlord-only)
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { dispatchToUser } from "../lib/wsDispatch";
import { N8N_EVENTS } from "../lib/n8n";

const router: IRouter = Router();

// ── Auth helper ───────────────────────────────────────────────────────────────
async function requireUser(
  req: Request,
  res: Response,
): Promise<{ id: number; email: string; role: string } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const { rows } = await pool.query<{ id: number; email: string; role: string }>(
    `SELECT id, email, role FROM users WHERE clerk_id = $1`,
    [auth.userId],
  );
  if (!rows[0]) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return rows[0];
}

// ── Affinity scoring ──────────────────────────────────────────────────────────
/**
 * Computes a 0-100 affinity score for a tenant × listing pair.
 * Pure SQL — avoids a round-trip AI call for every interest event.
 * EliteScore (0-100) + budget fit (25pts) + lifestyle match (20pts) + employment (15pts)
 */
async function computeAffinity(tenantUserId: number, listingId: number): Promise<number> {
  const { rows } = await pool.query<{ score: number }>(
    `WITH tenant AS (
       SELECT tp.*, u.id AS uid
         FROM tenant_profiles tp
         JOIN users u ON u.id = tp.user_id
        WHERE tp.user_id = $1
     ),
     listing AS (
       SELECT l.rent_pcm_pence, l.city, l.postcode, l.furnished,
              l.bills_included, l.pets_allowed
         FROM listings l
        WHERE l.id = $2
     )
     SELECT
       LEAST(100, GREATEST(0,
         /* EliteScore weight: 40pts */
         (COALESCE((SELECT elite_score FROM tenant), 0) * 0.40)

         /* Budget fit: 25pts (full score if rent is within budget) */
         + CASE
             WHEN (SELECT budget_max_pcm FROM tenant) >= (SELECT rent_pcm_pence / 100 FROM listing)
               AND (SELECT budget_min_pcm FROM tenant) <= (SELECT rent_pcm_pence / 100 FROM listing)
             THEN 25
             WHEN (SELECT budget_max_pcm FROM tenant) >= (SELECT rent_pcm_pence / 100 FROM listing)
             THEN 15
             ELSE 0
           END

         /* Bills preference: 10pts */
         + CASE
             WHEN (SELECT bills_pref FROM tenant) IS NULL THEN 5
             WHEN (SELECT bills_pref FROM tenant) = (SELECT bills_included FROM listing) THEN 10
             ELSE 0
           END

         /* Pet match: 10pts */
         + CASE
             WHEN NOT (SELECT has_pets FROM tenant) THEN 10
             WHEN (SELECT pets_allowed FROM listing) THEN 10
             ELSE 0
           END

         /* Employment status: 15pts — employed/self-employed score highest */
         + CASE (SELECT employment_status FROM tenant)
             WHEN 'employed'      THEN 15
             WHEN 'self_employed' THEN 12
             WHEN 'student'       THEN 8
             WHEN 'retired'       THEN 8
             WHEN 'dss'           THEN 3
             ELSE 5
           END
       )) AS score`,
    [tenantUserId, listingId],
  );

  return rows[0]?.score ?? 0;
}

// ── POST /interest/trigger ────────────────────────────────────────────────────
router.post("/trigger", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { listingId, interaction = "interested" } = req.body as {
    listingId: number;
    interaction?: "saved" | "interested" | "applied";
  };

  if (!listingId) {
    res.status(400).json({ error: "listingId is required" });
    return;
  }

  if (!["saved", "interested", "applied"].includes(interaction)) {
    res.status(400).json({ error: "interaction must be saved | interested | applied" });
    return;
  }

  // Verify listing exists
  const { rows: listingRows } = await pool.query<{ landlord_id: number }>(
    `SELECT landlord_id FROM listings WHERE id = $1 AND status = 'active'`,
    [listingId],
  );
  if (!listingRows[0]) {
    res.status(404).json({ error: "Listing not found or inactive" });
    return;
  }
  const landlordUserId = listingRows[0].landlord_id;

  // Compute affinity score
  const affinityScore = await computeAffinity(user.id, listingId);

  // Upsert — upgrade interaction level if re-expressing interest
  const { rows } = await pool.query<{ id: number; status: string; is_new: boolean }>(
    `INSERT INTO tenant_interests (tenant_user_id, listing_id, interaction, affinity_score, status)
     VALUES ($1, $2, $3, $4, 'pending')
     ON CONFLICT (tenant_user_id, listing_id)
     DO UPDATE
       SET interaction   = EXCLUDED.interaction,
           affinity_score = GREATEST(tenant_interests.affinity_score, EXCLUDED.affinity_score)
     RETURNING id, status, (xmax = 0) AS is_new`,
    [user.id, listingId, interaction, affinityScore],
  );

  const interest = rows[0];

  logger.info(
    { tenantId: user.id, listingId, interaction, affinityScore },
    "Tenant interest recorded",
  );

  // Push real-time notification to landlord if they're online
  dispatchToUser(landlordUserId, {
    type: "new_interest",
    interestId: interest.id,
    listingId,
    interaction,
    affinityScore,
    timestamp: new Date().toISOString(),
  });

  // Fire n8n for high-affinity signals (score ≥ 70)
  if (affinityScore >= 70 && interest.is_new) {
    N8N_EVENTS.tenantApplication({
      applicationId: interest.id,
      tenantId: String(user.id),
      tenantName: user.email,
      tenantEmail: user.email,
      listingId,
    }).catch(() => {});
  }

  res.status(201).json({
    interestId: interest.id,
    status: interest.status,
    affinityScore,
    message: interaction === "applied"
      ? "Application submitted. The landlord will be notified."
      : "Interest registered anonymously. You'll be notified if the landlord reciprocates.",
  });
});

// ── GET /interest/listing/:listingId ─────────────────────────────────────────
// Landlord: see ranked pool of interested tenants (identity revealed only if mutual)
router.get("/listing/:listingId", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  // Verify ownership
  const { rows: listingRows } = await pool.query(
    `SELECT id FROM listings WHERE id = $1 AND landlord_id = $2`,
    [req.params.listingId, user.id],
  );
  if (!listingRows[0]) {
    res.status(403).json({ error: "Listing not found or access denied" });
    return;
  }

  // Mark unseen interests as seen
  await pool.query(
    `UPDATE tenant_interests
        SET status = 'seen', seen_by_landlord_at = NOW()
      WHERE listing_id = $1 AND status = 'pending'`,
    [req.params.listingId],
  );

  // Return ranked pool — tenant identity is masked unless mutual
  const { rows } = await pool.query(
    `SELECT
       ti.id,
       ti.interaction,
       ti.affinity_score,
       ti.status,
       ti.messaging_unlocked,
       ti.created_at,
       -- Only reveal identity when mutual
       CASE WHEN ti.status = 'mutual' THEN u.name  ELSE 'Anonymous Tenant' END AS tenant_name,
       CASE WHEN ti.status = 'mutual' THEN u.email ELSE NULL END               AS tenant_email,
       tp.employment_status,
       tp.elite_score,
       tp.has_pets,
       tp.smoker,
       tp.couple,
       tp.budget_max_pcm,
       tp.target_move_in,
       tp.is_verified
     FROM tenant_interests ti
     JOIN users u ON u.id = ti.tenant_user_id
LEFT JOIN tenant_profiles tp ON tp.user_id = ti.tenant_user_id
    WHERE ti.listing_id = $1
      AND ti.status != 'dismissed'
 ORDER BY ti.affinity_score DESC, ti.created_at ASC`,
    [req.params.listingId],
  );

  res.json({
    listingId: Number(req.params.listingId),
    total: rows.length,
    pool: rows,
  });
});

// ── GET /interest/high-intent/:listingId ──────────────────────────────────────
// Landlord: top 10 by affinity score — the "hot leads" view
router.get("/high-intent/:listingId", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows: listingRows } = await pool.query(
    `SELECT id FROM listings WHERE id = $1 AND landlord_id = $2`,
    [req.params.listingId, user.id],
  );
  if (!listingRows[0]) {
    res.status(403).json({ error: "Listing not found or access denied" });
    return;
  }

  const { rows } = await pool.query(
    `SELECT
       ti.id,
       ti.affinity_score,
       ti.interaction,
       ti.status,
       ti.messaging_unlocked,
       ti.created_at,
       CASE WHEN ti.status = 'mutual' THEN u.name  ELSE 'Anonymous'    END AS tenant_name,
       CASE WHEN ti.status = 'mutual' THEN u.email ELSE NULL           END AS tenant_email,
       tp.employment_status,
       tp.elite_score,
       tp.is_verified,
       tp.budget_max_pcm,
       tp.target_move_in
     FROM tenant_interests ti
     JOIN users u ON u.id = ti.tenant_user_id
LEFT JOIN tenant_profiles tp ON tp.user_id = ti.tenant_user_id
    WHERE ti.listing_id = $1
      AND ti.status != 'dismissed'
 ORDER BY ti.affinity_score DESC
    LIMIT 10`,
    [req.params.listingId],
  );

  res.json({
    listingId: Number(req.params.listingId),
    highIntentMatches: rows,
  });
});

// ── POST /interest/:interestId/reciprocate ────────────────────────────────────
// Landlord reciprocates → state becomes MUTUAL → messaging unlocked
router.post("/:interestId/reciprocate", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  // Verify landlord owns the listing tied to this interest
  const { rows } = await pool.query<{ id: number; tenant_user_id: number; listing_id: number }>(
    `UPDATE tenant_interests ti
        SET status = 'mutual', mutual_at = NOW(), messaging_unlocked = true
       FROM listings l
      WHERE ti.id = $1
        AND ti.listing_id = l.id
        AND l.landlord_id = $2
        AND ti.status IN ('pending','seen')
     RETURNING ti.id, ti.tenant_user_id, ti.listing_id`,
    [req.params.interestId, user.id],
  );

  if (!rows[0]) {
    res.status(404).json({
      error: "Interest not found, already mutual/dismissed, or not your listing",
    });
    return;
  }

  const { tenant_user_id, listing_id } = rows[0];

  logger.info(
    { interestId: rows[0].id, listingId: listing_id, tenantId: tenant_user_id },
    "Mutual interest — messaging unlocked",
  );

  // Push real-time unlock notification to tenant
  dispatchToUser(tenant_user_id, {
    type: "interest_mutual",
    interestId: Number(req.params.interestId),
    listingId: listing_id,
    message: "Your interest was noticed! You can now message this landlord.",
    timestamp: new Date().toISOString(),
  });

  // Also push confirmation back to landlord
  dispatchToUser(user.id, {
    type: "interest_reciprocated",
    interestId: Number(req.params.interestId),
    listingId: listing_id,
    timestamp: new Date().toISOString(),
  });

  res.json({
    message: "Interest reciprocated. Messaging is now unlocked for both parties.",
    interestId: Number(req.params.interestId),
    messagingUnlocked: true,
  });
});

// ── POST /interest/:interestId/dismiss ────────────────────────────────────────
// Landlord dismisses a tenant from the pool.
router.post("/:interestId/dismiss", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rowCount } = await pool.query(
    `UPDATE tenant_interests ti
        SET status = 'dismissed'
       FROM listings l
      WHERE ti.id = $1
        AND ti.listing_id = l.id
        AND l.landlord_id = $2`,
    [req.params.interestId, user.id],
  );

  if (!rowCount) {
    res.status(404).json({ error: "Interest not found or not your listing" });
    return;
  }

  res.json({ message: "Tenant dismissed from pool." });
});

// ── GET /interest/my ──────────────────────────────────────────────────────────
// Tenant: list own interest states across all listings
router.get("/my", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    `SELECT
       ti.id,
       ti.listing_id,
       ti.interaction,
       ti.affinity_score,
       ti.status,
       ti.messaging_unlocked,
       ti.created_at,
       l.title AS listing_title,
       l.city,
       l.rent_pcm_pence
     FROM tenant_interests ti
     JOIN listings l ON l.id = ti.listing_id
    WHERE ti.tenant_user_id = $1
 ORDER BY ti.created_at DESC
    LIMIT 50`,
    [user.id],
  );

  res.json(rows);
});

export default router;
