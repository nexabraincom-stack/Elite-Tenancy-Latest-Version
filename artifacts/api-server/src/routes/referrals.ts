/**
 * Elite Tenancy — Referral & Trial Programme
 *
 * Referral rewards (credited after all conditions met — admin marks "rewarded"):
 *   Tenant   → £20  after referee completes all 6 referencing verification steps
 *   Landlord → £50  after referee lists first property AND first tenancy is signed
 *   Agency   → £100 after referee has 3+ active listings within first 30 days
 *
 * Free trial on signup (extended from 7 → 14 days for all paid tiers):
 *   Tenant   → 14-day trial of premium tenant features
 *   Landlord → 14-day Growth plan trial (first subscription)
 *   Agency   → 14-day Pro plan trial
 *
 * Endpoints:
 *   GET  /api/referrals/me                   → get user's code, stats, trial
 *   POST /api/referrals/apply                → link referee to referrer at signup
 *   POST /api/referrals/verify-step          → tenant: mark 1 of 6 steps complete
 *   GET  /api/referrals/admin                → admin: all referrals + trials (admin only)
 *   POST /api/referrals/admin/:id/reward     → admin: mark referral as paid out
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { pool } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/requireAuth";
import { randomBytes } from "crypto";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Auto-create tables on startup ─────────────────────────────────────────────
;(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id                   SERIAL PRIMARY KEY,
        code                 TEXT UNIQUE NOT NULL,
        referrer_id          INTEGER NOT NULL,
        referrer_role        TEXT NOT NULL DEFAULT 'tenant',
        referee_id           INTEGER,
        referee_email        TEXT,
        status               TEXT NOT NULL DEFAULT 'pending',
        verifications_completed INTEGER NOT NULL DEFAULT 0,
        reward_amount_pence  INTEGER NOT NULL DEFAULT 0,
        rewarded_at          TIMESTAMPTZ,
        completed_at         TIMESTAMPTZ,
        created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS user_trials (
        id          SERIAL PRIMARY KEY,
        user_id     INTEGER UNIQUE NOT NULL,
        user_role   TEXT NOT NULL,
        trial_plan  TEXT NOT NULL DEFAULT 'growth',
        started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ends_at     TIMESTAMPTZ NOT NULL,
        source      TEXT NOT NULL DEFAULT 'signup',
        referral_id INTEGER,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  } catch (err) {
    logger.error({ err }, "referrals: table init failed");
  }
})();

// ── Constants ─────────────────────────────────────────────────────────────────

const REWARD_PENCE: Record<string, number> = {
  tenant:   2000,   // £20
  landlord: 5000,   // £50
  agency:   10000,  // £100
};

const VERIFICATIONS_REQUIRED = 6;

const TRIAL_PLAN: Record<string, string> = {
  tenant:   "premium_tenant",
  landlord: "growth",
  agency:   "pro",
};

// ── GET /referrals/me ─────────────────────────────────────────────────────────

router.get("/referrals/me", requireAuth(), async (_req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    // Get or create this user's referral code
    let codeRow = await pool.query(
      `SELECT code FROM referrals WHERE referrer_id = $1 AND referee_id IS NULL AND status = 'pending' LIMIT 1`,
      [user.id]
    );
    if (codeRow.rows.length === 0) {
      const code = randomBytes(5).toString("hex").toUpperCase();
      codeRow = await pool.query(
        `INSERT INTO referrals (code, referrer_id, referrer_role, reward_amount_pence)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (code) DO UPDATE SET code = referrals.code
         RETURNING code`,
        [code, user.id, user.role, REWARD_PENCE[user.role] ?? 2000]
      );
    }
    const code = codeRow.rows[0].code as string;

    // Stats: how many referrals this user has triggered
    const stats = await pool.query(
      `SELECT
         COUNT(*)                                          FILTER (WHERE status = 'in_progress') AS in_progress,
         COUNT(*)                                          FILTER (WHERE status = 'completed')   AS completed,
         COUNT(*)                                          FILTER (WHERE status = 'rewarded')    AS rewarded,
         COALESCE(SUM(reward_amount_pence)                FILTER (WHERE status = 'rewarded'), 0) AS total_earned_pence
       FROM referrals
       WHERE referrer_id = $1 AND referee_id IS NOT NULL`,
      [user.id]
    );
    const s = stats.rows[0];

    // Trial status for this user
    const trial = await pool.query(
      `SELECT * FROM user_trials WHERE user_id = $1 LIMIT 1`,
      [user.id]
    );
    const trialRow = trial.rows[0] ?? null;
    const trialDaysLeft = trialRow
      ? Math.max(0, Math.ceil((new Date(trialRow.ends_at).getTime() - Date.now()) / 86_400_000))
      : null;

    // If referee: show own referral progress
    const ownReferral = await pool.query(
      `SELECT verifications_completed, status FROM referrals WHERE referee_id = $1 LIMIT 1`,
      [user.id]
    );
    const myProgress = ownReferral.rows[0] ?? null;

    const baseUrl = process.env.FRONTEND_URL ?? "https://www.elitetenancy.co.uk";
    const referralUrl = `${baseUrl}/sign-up?ref=${code}`;

    res.json({
      code,
      referralUrl,
      rewardAmountGBP: (REWARD_PENCE[user.role] ?? 2000) / 100,
      verificationsRequired: user.role === "tenant" ? VERIFICATIONS_REQUIRED : null,
      stats: {
        inProgress:   parseInt(s.in_progress),
        completed:    parseInt(s.completed),
        rewarded:     parseInt(s.rewarded),
        totalEarned:  parseInt(s.total_earned_pence) / 100,
      },
      trial: trialRow
        ? {
            plan:     trialRow.trial_plan,
            endsAt:   trialRow.ends_at,
            daysLeft: trialDaysLeft,
            source:   trialRow.source,
          }
        : null,
      myProgress: myProgress
        ? {
            steps:    myProgress.verifications_completed,
            total:    VERIFICATIONS_REQUIRED,
            status:   myProgress.status,
          }
        : null,
    });
  } catch (err) {
    logger.error({ err }, "GET /referrals/me error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /referrals/apply ─────────────────────────────────────────────────────

router.post("/referrals/apply", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { code } = req.body as { code?: string };

  if (!code?.trim()) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  try {
    // Find open referral code
    const ref = await pool.query(
      `SELECT * FROM referrals WHERE code = $1 AND status = 'pending' AND referee_id IS NULL LIMIT 1`,
      [code.trim().toUpperCase()]
    );
    if (ref.rows.length === 0) {
      res.status(404).json({ error: "Invalid or already-used referral code" });
      return;
    }
    const refRow = ref.rows[0];

    if (refRow.referrer_id === user.id) {
      res.status(400).json({ error: "You cannot use your own referral code" });
      return;
    }

    // Check not already referred
    const existing = await pool.query(
      `SELECT id FROM referrals WHERE referee_id = $1 LIMIT 1`,
      [user.id]
    );
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "You have already used a referral code" });
      return;
    }

    // Link referee
    await pool.query(
      `UPDATE referrals SET referee_id = $1, status = 'in_progress' WHERE id = $2`,
      [user.id, refRow.id]
    );

    // Start 14-day trial for referee
    const plan = TRIAL_PLAN[user.role] ?? "growth";
    await pool.query(
      `INSERT INTO user_trials (user_id, user_role, trial_plan, ends_at, source, referral_id)
       VALUES ($1, $2, $3, NOW() + INTERVAL '14 days', 'referral', $4)
       ON CONFLICT (user_id) DO NOTHING`,
      [user.id, user.role, plan, refRow.id]
    );

    res.json({
      success: true,
      message: "Referral applied! You have unlocked a 14-day free trial.",
      trialDays: 14,
      plan,
    });
  } catch (err) {
    logger.error({ err }, "POST /referrals/apply error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /referrals/verify-step  (tenant referencing pipeline) ────────────────

router.post("/referrals/verify-step", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { step } = req.body as { step?: number };

  if (!step || step < 1 || step > VERIFICATIONS_REQUIRED) {
    res.status(400).json({ error: `step must be 1–${VERIFICATIONS_REQUIRED}` });
    return;
  }

  try {
    const ref = await pool.query(
      `SELECT * FROM referrals WHERE referee_id = $1 AND status = 'in_progress' LIMIT 1`,
      [user.id]
    );
    if (ref.rows.length === 0) {
      res.json({ message: "No active referral found for your account" });
      return;
    }
    const refRow = ref.rows[0];
    const newCount = Math.max(refRow.verifications_completed as number, step);

    if (newCount >= VERIFICATIONS_REQUIRED) {
      await pool.query(
        `UPDATE referrals
         SET verifications_completed = $1,
             status = 'completed',
             completed_at = NOW()
         WHERE id = $2`,
        [VERIFICATIONS_REQUIRED, refRow.id]
      );
      res.json({
        message: "All 6 verifications complete. Your referrer will receive their £20 reward.",
        completed: true,
        progress: VERIFICATIONS_REQUIRED,
        total: VERIFICATIONS_REQUIRED,
      });
      return;
    }

    await pool.query(
      `UPDATE referrals SET verifications_completed = $1 WHERE id = $2`,
      [newCount, refRow.id]
    );
    res.json({
      message: `Step ${step} verified. ${VERIFICATIONS_REQUIRED - newCount} step(s) remaining.`,
      completed: false,
      progress: newCount,
      total: VERIFICATIONS_REQUIRED,
    });
  } catch (err) {
    logger.error({ err }, "POST /referrals/verify-step error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── GET /referrals/admin  (admin only) ────────────────────────────────────────

router.get(
  "/referrals/admin",
  [requireAuth(), requireRole("admin")],
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const refs = await pool.query(`
        SELECT r.*,
               u1.name  AS referrer_name,  u1.email AS referrer_email,
               u2.name  AS referee_name,   u2.email AS referee_email_joined
        FROM   referrals r
        LEFT JOIN users u1 ON u1.id = r.referrer_id
        LEFT JOIN users u2 ON u2.id = r.referee_id
        ORDER  BY r.created_at DESC
        LIMIT  200
      `);

      const trials = await pool.query(`
        SELECT t.*, u.name, u.email
        FROM   user_trials t
        JOIN   users u ON u.id = t.user_id
        ORDER  BY t.created_at DESC
        LIMIT  200
      `);

      const rows = refs.rows;
      res.json({
        referrals: rows,
        trials: trials.rows,
        summary: {
          total:      rows.length,
          inProgress: rows.filter((r: any) => r.status === "in_progress").length,
          completed:  rows.filter((r: any) => r.status === "completed").length,
          rewarded:   rows.filter((r: any) => r.status === "rewarded").length,
          pendingPayout: rows
            .filter((r: any) => r.status === "completed")
            .reduce((sum: number, r: any) => sum + (r.reward_amount_pence as number), 0) / 100,
        },
      });
    } catch (err) {
      logger.error({ err }, "GET /referrals/admin error");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ── POST /referrals/admin/:id/reward  (mark paid out) ────────────────────────

router.post(
  "/referrals/admin/:id/reward",
  [requireAuth(), requireRole("admin")],
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `UPDATE referrals
         SET status = 'rewarded', rewarded_at = NOW()
         WHERE id = $1 AND status = 'completed'
         RETURNING *`,
        [id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: "Referral not found or not in completed state" });
        return;
      }
      res.json({ success: true, referral: result.rows[0] });
    } catch (err) {
      logger.error({ err }, "POST /referrals/admin/:id/reward error");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
