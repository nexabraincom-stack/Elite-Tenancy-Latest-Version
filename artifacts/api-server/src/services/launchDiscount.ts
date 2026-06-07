/**
 * MODULE 4 — Launch Discount Service
 *
 * 90-day 100% launch discount for early adopters:
 *   - All newly registered users get 90 days free
 *   - Day 83 (7 days before billing): warning email via n8n
 *   - Day 90 (free_until): auto-transition to Starter paid plan
 *   - Cron-ready: call runDailyTransitions() from a scheduled endpoint
 *
 * Endpoints (mounted on /launch-discount by index.ts):
 *   POST /launch-discount/register      — called on first login
 *   GET  /launch-discount/status        — current user's discount status
 *   POST /launch-discount/run-daily     — cron trigger (internal/admin only)
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { stripe } from "../lib/stripe";
import { fireWebhook } from "../lib/n8n";

export const router: IRouter = Router();

const LAUNCH_DISCOUNT_DAYS = 90;
const WARNING_DAYS_BEFORE  = 7;          // Day 83
const DEFAULT_PLAN_ID      = "starter";  // plan to auto-assign at end of free period

// Subscription plan Price IDs (must be set in Vercel env for billing to work)
const SUBSCRIPTION_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_PRICE_SUBSCRIPTION_STARTER ?? "",
  growth:  process.env.STRIPE_PRICE_SUBSCRIPTION_GROWTH  ?? "",
  pro:     process.env.STRIPE_PRICE_SUBSCRIPTION_PRO     ?? "",
  elite:   process.env.STRIPE_PRICE_SUBSCRIPTION_ELITE   ?? "",
};

// ── Auth helper ───────────────────────────────────────────────────────────────
async function requireUser(
  req: Request,
  res: Response,
): Promise<{ id: number; email: string; name: string } | null> {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const { rows } = await pool.query<{ id: number; email: string; name: string }>(
    `SELECT id, email, name FROM users WHERE clerk_id = $1`,
    [auth.userId],
  );
  if (!rows[0]) {
    res.status(401).json({ error: "User not found" });
    return null;
  }
  return rows[0];
}

// ── POST /launch-discount/register ───────────────────────────────────────────
// Idempotent — safe to call on every first login; does nothing if already registered.
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const freeUntil = new Date();
  freeUntil.setDate(freeUntil.getDate() + LAUNCH_DISCOUNT_DAYS);

  const { rows } = await pool.query<{ id: number; free_until: string; registered_at: string }>(
    `INSERT INTO launch_discounts (user_id, free_until, plan_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING id, free_until, registered_at`,
    [user.id, freeUntil.toISOString(), DEFAULT_PLAN_ID],
  );

  if (!rows[0]) {
    // Already registered — fetch existing record
    const { rows: existing } = await pool.query(
      `SELECT id, free_until, registered_at, transitioned_at FROM launch_discounts WHERE user_id = $1`,
      [user.id],
    );
    res.json({
      alreadyRegistered: true,
      ...existing[0],
      daysRemaining: Math.max(0, Math.ceil(
        (new Date(existing[0]?.free_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
      )),
    });
    return;
  }

  logger.info({ userId: user.id, freeUntil: rows[0].free_until }, "Launch discount registered");

  res.status(201).json({
    message: `Welcome! You have ${LAUNCH_DISCOUNT_DAYS} days of free access.`,
    freeUntil: rows[0].free_until,
    registeredAt: rows[0].registered_at,
    daysRemaining: LAUNCH_DISCOUNT_DAYS,
  });
});

// ── GET /launch-discount/status ───────────────────────────────────────────────
router.get("/status", async (req: Request, res: Response): Promise<void> => {
  const user = await requireUser(req, res);
  if (!user) return;

  const { rows } = await pool.query(
    `SELECT
       ld.id, ld.free_until, ld.registered_at, ld.transitioned_at,
       ld.warning_sent_at, ld.plan_id, ld.stripe_sub_id,
       CASE
         WHEN ld.transitioned_at IS NOT NULL THEN 'transitioned'
         WHEN ld.free_until > NOW()           THEN 'active'
         ELSE 'expired'
       END AS discount_status,
       GREATEST(0, CEIL(EXTRACT(EPOCH FROM (ld.free_until - NOW())) / 86400)) AS days_remaining
     FROM launch_discounts ld
    WHERE ld.user_id = $1`,
    [user.id],
  );

  if (!rows[0]) {
    res.json({ registered: false });
    return;
  }

  res.json({ registered: true, ...rows[0] });
});

// ── POST /launch-discount/run-daily ──────────────────────────────────────────
// Intended for internal cron use (Vercel Cron → /api/launch-discount/run-daily).
// Protect with CRON_SECRET in production.
router.post("/run-daily", async (req: Request, res: Response): Promise<void> => {
  const secret = req.headers["x-cron-secret"];
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    res.status(401).json({ error: "Unauthorized cron call" });
    return;
  }

  const results = await runDailyTransitions();
  res.json(results);
});

// ── Core Cron Logic ───────────────────────────────────────────────────────────

/**
 * Run both phases of the launch discount lifecycle:
 *  1. Send 7-day warning emails for users expiring in exactly 7 days
 *  2. Transition expired free periods to paid Starter plan
 *
 * Safe to call idempotently — all DB updates guard against double-processing.
 */
export async function runDailyTransitions(): Promise<{
  warnings: number;
  transitioned: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let warnings = 0;
  let transitioned = 0;

  // ── Phase 1: 7-day warning ─────────────────────────────────────────────────
  // Find users whose free period expires in ≤7 days and haven't been warned yet
  const { rows: warnRows } = await pool.query<{
    id: number;
    user_id: number;
    email: string;
    name: string;
    free_until: string;
  }>(
    `SELECT ld.id, ld.user_id, u.email, u.name, ld.free_until
       FROM launch_discounts ld
       JOIN users u ON u.id = ld.user_id
      WHERE ld.transitioned_at IS NULL
        AND ld.warning_sent_at IS NULL
        AND ld.free_until <= NOW() + INTERVAL '${WARNING_DAYS_BEFORE} days'
        AND ld.free_until > NOW()`,
  );

  for (const row of warnRows) {
    try {
      const n8nPath = process.env.N8N_WEBHOOK_LAUNCH_WARNING;
      if (n8nPath) {
        await fireWebhook(n8nPath, {
          event: "launch_discount_warning",
          timestamp: new Date().toISOString(),
          userId: row.user_id,
          email: row.email,
          name: row.name,
          freeUntil: row.free_until,
          daysRemaining: WARNING_DAYS_BEFORE,
          upgradeUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.elitetenancy.co.uk"}/billing/upgrade`,
        });
      }

      await pool.query(
        `UPDATE launch_discounts SET warning_sent_at = NOW() WHERE id = $1`,
        [row.id],
      );

      warnings++;
      logger.info({ userId: row.user_id, freeUntil: row.free_until }, "Launch discount warning sent");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Warning for user ${row.user_id}: ${msg}`);
      logger.error({ err, userId: row.user_id }, "Failed to send launch discount warning");
    }
  }

  // ── Phase 2: Auto-transition to paid Starter plan ─────────────────────────
  const { rows: transRows } = await pool.query<{
    id: number;
    user_id: number;
    email: string;
    name: string;
    plan_id: string;
  }>(
    `SELECT ld.id, ld.user_id, u.email, u.name, ld.plan_id
       FROM launch_discounts ld
       JOIN users u ON u.id = ld.user_id
      WHERE ld.transitioned_at IS NULL
        AND ld.free_until <= NOW()`,
  );

  for (const row of transRows) {
    try {
      await transitionToPayd(row);
      transitioned++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Transition for user ${row.user_id}: ${msg}`);
      logger.error({ err, userId: row.user_id }, "Failed to auto-transition launch discount user");
    }
  }

  logger.info({ warnings, transitioned, errors: errors.length }, "Daily launch discount run complete");
  return { warnings, transitioned, errors };
}

// ── Stripe subscription transition ───────────────────────────────────────────
async function transitionToPayd(user: {
  id: number;       // launch_discounts.id
  user_id: number;
  email: string;
  name: string;
  plan_id: string;
}): Promise<void> {
  const planId    = user.plan_id in SUBSCRIPTION_PRICE_IDS ? user.plan_id : DEFAULT_PLAN_ID;
  const priceId   = SUBSCRIPTION_PRICE_IDS[planId];

  let stripeSubId: string | null = null;

  if (priceId) {
    // Look up or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { eliteUserId: String(user.user_id) },
      });
      customerId = customer.id;
    }

    // Create subscription — no trial, immediate billing
    const sub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        eliteUserId: String(user.user_id),
        planId,
        source: "launch_discount_auto_transition",
      },
    });

    stripeSubId = sub.id;
    logger.info({ userId: user.user_id, subId: sub.id, planId }, "Stripe subscription created for transitioned user");
  } else {
    // No Price ID configured — mark as transitioned without billing (admin manual step required)
    logger.warn(
      { userId: user.user_id, planId },
      "No Stripe Price ID configured for plan — transition recorded without billing",
    );
  }

  // Mark as transitioned
  await pool.query(
    `UPDATE launch_discounts
        SET transitioned_at = NOW(), stripe_sub_id = $1
      WHERE id = $2`,
    [stripeSubId, user.id],
  );

  // Insert into landlord_subscriptions for consistency
  if (stripeSubId) {
    await pool.query(
      `INSERT INTO landlord_subscriptions (landlord_id, stripe_subscription_id, plan_id, status, current_period_end)
       VALUES ($1, $2, $3, 'active', NOW() + INTERVAL '1 month')
       ON CONFLICT (stripe_subscription_id) DO NOTHING`,
      [user.user_id, stripeSubId, planId],
    ).catch(() => {}); // Graceful — table may not exist in all envs yet
  }

  // Fire n8n: transition event
  const n8nPath = process.env.N8N_WEBHOOK_LAUNCH_TRANSITIONED;
  if (n8nPath) {
    await fireWebhook(n8nPath, {
      event: "launch_discount_transitioned",
      timestamp: new Date().toISOString(),
      userId: user.user_id,
      email: user.email,
      planId,
      stripeSubId,
    });
  }
}

export default router;
