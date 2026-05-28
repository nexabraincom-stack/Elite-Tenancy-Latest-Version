/**
 * Elite Tenancy — Stripe Connect v2 Marketplace Routes
 *
 * Enables landlords to receive payouts directly via Stripe Connect.
 * Uses the new /v2/core/accounts API (controller-based, not legacy types).
 *
 * Endpoints:
 *  POST /api/connect/accounts              → Onboard a landlord as a Connected Account
 *  POST /api/connect/account-sessions      → Create AccountSession for embedded onboarding UI
 *  GET  /api/connect/accounts/me           → Get the calling landlord's Connect status
 *  POST /api/connect/transfers             → Transfer completion fee to landlord (admin only)
 *  GET  /api/connect/balance               → Get landlord's Stripe Connect balance
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { stripe } from "../lib/stripe";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Onboard landlord: create a Connect account ────────────────────────────────
router.post("/connect/accounts", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    // Check if landlord already has a Connect account
    const existing = await pool.query(
      `SELECT stripe_connect_account_id, onboarding_complete
       FROM landlord_connect_accounts WHERE landlord_id = $1`,
      [user.id],
    );

    if (existing.rows.length > 0) {
      res.json({
        accountId: existing.rows[0].stripe_connect_account_id,
        onboardingComplete: existing.rows[0].onboarding_complete,
        message: "Connect account already exists",
      });
      return;
    }

    // Create Connect account using Accounts v2 API (controller-based)
    // This is the modern approach — no legacy Standard/Express/Custom types
    const account = await stripe.accounts.create({
      controller: {
        stripe_dashboard: {
          type: "none", // Elite Tenancy controls the dashboard, not Stripe's hosted one
        },
        fees: {
          payer: "application", // Elite Tenancy collects fees, landlord gets net
        },
        losses: {
          payments: "application",
        },
        requirement_collection: "application",
      },
      capabilities: {
        transfers: { requested: true },
        gb_bank_transfer_payments: { requested: true },
      },
      country: "GB",
      metadata: {
        eliteUserId: String(user.id),
        eliteUserEmail: user.email,
      },
    });

    // Store Connect account ID
    await pool.query(
      `INSERT INTO landlord_connect_accounts (landlord_id, stripe_connect_account_id, onboarding_complete)
       VALUES ($1, $2, false)
       ON CONFLICT (landlord_id) DO UPDATE
       SET stripe_connect_account_id = EXCLUDED.stripe_connect_account_id`,
      [user.id, account.id],
    );

    logger.info({ accountId: account.id, userId: user.id }, "Connect account created");
    res.json({
      accountId: account.id,
      onboardingComplete: false,
      message: "Connect account created — proceed to account session for onboarding",
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Connect account creation failed");
    res.status(500).json({ error: "Failed to create Connect account" });
  }
});

// ── Create AccountSession (embedded onboarding UI token) ─────────────────────
router.post("/connect/account-sessions", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const connectRow = await pool.query(
      `SELECT stripe_connect_account_id FROM landlord_connect_accounts WHERE landlord_id = $1`,
      [user.id],
    );

    if (!connectRow.rows.length) {
      res.status(404).json({ error: "No Connect account found — create one first via POST /api/connect/accounts" });
      return;
    }

    const connectedAccountId = connectRow.rows[0].stripe_connect_account_id as string;

    // AccountSession grants short-lived access for the embedded Connect component
    const accountSession = await stripe.accountSessions.create({
      account: connectedAccountId,
      components: {
        account_onboarding: { enabled: true },
        account_management: { enabled: true },
        balances: { enabled: true },
        payouts: { enabled: true },
      },
    });

    res.json({ clientSecret: accountSession.client_secret });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Account session creation failed");
    res.status(500).json({ error: "Failed to create account session" });
  }
});

// ── Get current landlord's Connect account status ─────────────────────────────
router.get("/connect/accounts/me", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const connectRow = await pool.query(
      `SELECT stripe_connect_account_id, onboarding_complete, created_at
       FROM landlord_connect_accounts WHERE landlord_id = $1`,
      [user.id],
    );

    if (!connectRow.rows.length) {
      res.json({ connected: false, message: "No Connect account — call POST /api/connect/accounts to start onboarding" });
      return;
    }

    const { stripe_connect_account_id: accountId, onboarding_complete } = connectRow.rows[0];

    // Fetch live status from Stripe
    const stripeAccount = await stripe.accounts.retrieve(accountId as string);

    const payoutsEnabled = stripeAccount.payouts_enabled ?? false;
    const chargesEnabled = stripeAccount.charges_enabled ?? false;
    const detailsSubmitted = stripeAccount.details_submitted ?? false;

    // Update DB if onboarding just completed
    if (detailsSubmitted && !onboarding_complete) {
      await pool.query(
        `UPDATE landlord_connect_accounts SET onboarding_complete = true WHERE landlord_id = $1`,
        [user.id],
      );
    }

    res.json({
      connected: true,
      accountId,
      payoutsEnabled,
      chargesEnabled,
      detailsSubmitted,
      onboardingComplete: detailsSubmitted,
      requirements: stripeAccount.requirements?.currently_due ?? [],
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Connect account status fetch failed");
    res.status(500).json({ error: "Failed to fetch Connect account status" });
  }
});

// ── Transfer completion fee to landlord (admin only) ──────────────────────────
//
// Called after a tenancy is confirmed and the landlord's completion fee has been
// collected. Transfers the landlord's share (total - Elite Tenancy platform fee)
// to their connected Stripe account.
router.post("/connect/transfers", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  if (user.role !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  const { landlordUserId, amountPence, tenancyId, description } = req.body as {
    landlordUserId: number;
    amountPence: number;
    tenancyId: number;
    description?: string;
  };

  if (!landlordUserId || !amountPence || !tenancyId) {
    res.status(400).json({ error: "landlordUserId, amountPence, tenancyId are required" });
    return;
  }

  try {
    const connectRow = await pool.query(
      `SELECT stripe_connect_account_id, onboarding_complete
       FROM landlord_connect_accounts WHERE landlord_id = $1`,
      [landlordUserId],
    );

    if (!connectRow.rows.length || !connectRow.rows[0].onboarding_complete) {
      res.status(422).json({ error: "Landlord has not completed Connect onboarding" });
      return;
    }

    const destinationAccountId = connectRow.rows[0].stripe_connect_account_id as string;

    const transfer = await stripe.transfers.create(
      {
        amount: amountPence,
        currency: "gbp",
        destination: destinationAccountId,
        description: description ?? `Elite Tenancy payout — tenancy #${tenancyId}`,
        metadata: {
          tenancyId: String(tenancyId),
          landlordUserId: String(landlordUserId),
          initiatedByAdmin: String(user.id),
        },
      },
      { idempotencyKey: `transfer-tenancy-${tenancyId}-landlord-${landlordUserId}` },
    );

    // Record transfer
    await pool.query(
      `INSERT INTO connect_transfers (tenancy_id, landlord_id, stripe_transfer_id, amount_pence, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (stripe_transfer_id) DO NOTHING`,
      [tenancyId, landlordUserId, transfer.id, amountPence],
    );

    logger.info({ transferId: transfer.id, landlordUserId, amountPence }, "Connect transfer created");
    res.json({ transferId: transfer.id, status: "pending", amountPence });
  } catch (err) {
    logger.error({ err }, "Connect transfer failed");
    res.status(500).json({ error: "Failed to create transfer" });
  }
});

// ── Get Connect balance (landlord only) ───────────────────────────────────────
router.get("/connect/balance", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const connectRow = await pool.query(
      `SELECT stripe_connect_account_id, onboarding_complete
       FROM landlord_connect_accounts WHERE landlord_id = $1`,
      [user.id],
    );

    if (!connectRow.rows.length) {
      res.json({ connected: false, balance: null });
      return;
    }

    const balance = await stripe.balance.retrieve({
      stripeAccount: connectRow.rows[0].stripe_connect_account_id as string,
    });

    res.json({
      connected: true,
      onboardingComplete: connectRow.rows[0].onboarding_complete,
      available: balance.available.map(b => ({
        amount: b.amount,
        currency: b.currency,
        gbp: (b.amount / 100).toFixed(2),
      })),
      pending: balance.pending.map(b => ({
        amount: b.amount,
        currency: b.currency,
        gbp: (b.amount / 100).toFixed(2),
      })),
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Connect balance fetch failed");
    res.status(500).json({ error: "Failed to fetch Connect balance" });
  }
});

export default router;
