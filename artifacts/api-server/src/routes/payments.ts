/**
 * Elite Tenancy — Payment Routes
 *
 * Endpoints:
 *  POST /api/payments/landlord/checkout        → Stripe Checkout (listing fee)
 *  GET  /api/payments/landlord/success         → Post-checkout activation
 *  POST /api/payments/landlord/completion-fee  → Invoice landlord on tenancy confirmation
 *  POST /api/payments/rent/setup-mandate       → BACS Direct Debit setup for tenant
 *  GET  /api/payments/rent/mandate-return      → Redirect after mandate setup
 *  POST /api/payments/landlord/managed         → Subscribe to managed lettings
 *  GET  /api/payments/history                  → Payment history for current user
 *  POST /api/webhooks/stripe                   → Stripe webhook (raw body required)
 */

import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { pool } from "@workspace/db";
import { stripe, STRIPE_PRICES, TIER_AMOUNTS, type ListingTier } from "../lib/stripe";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Helper: get or create Stripe Customer for a user ─────────────────────────
async function getOrCreateStripeCustomer(userId: number, email: string, name: string): Promise<string> {
  const client = await pool.connect();
  try {
    const existing = await client.query(
      "SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1",
      [userId],
    );
    if (existing.rows.length > 0) return existing.rows[0].stripe_customer_id;

    const customer = await stripe.customers.create({ email, name, metadata: { eliteUserId: String(userId) } });
    await client.query(
      "INSERT INTO stripe_customers (user_id, stripe_customer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [userId, customer.id],
    );
    return customer.id;
  } finally {
    client.release();
  }
}

// ── Landlord: Create checkout session for listing fee ────────────────────────
router.post("/payments/landlord/checkout", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { tier = "standard", listingId } = req.body as { tier: ListingTier; listingId?: number };

  if (!["standard", "professional", "premium"].includes(tier)) {
    res.status(400).json({ error: "Invalid tier" });
    return;
  }

  try {
    const origin = req.headers.origin ?? "https://www.elitetenancy.co.uk";

    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    // Idempotency key scoped to user+tier+listing within a 1-hour window
    // Prevents double-charges if the client retries a timed-out request
    const idempotencyKey = `checkout-${user.id}-${tier}-${listingId ?? "none"}-${Math.floor(Date.now() / 3_600_000)}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: TIER_AMOUNTS[tier],
            product_data: {
              name: `Elite Tenancy — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Listing`,
              description: tier === "standard"
                ? "Your property listed until let — pay only on completion"
                : tier === "professional"
                ? "Professional photography, premium placement, tenant shortlisting"
                : "Premium: everything + 12-month landlord guarantee + legal pack",
            },
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${origin}/landlord/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?payment=cancelled`,
        metadata: {
          eliteUserId: String(user.id),
          tier,
          listingId: listingId ? String(listingId) : "",
        },
      },
      { idempotencyKey },
    );

    // Record pending payment
    await pool.query(
      `INSERT INTO listing_payments (listing_id, landlord_id, stripe_session_id, tier, amount_pence, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       ON CONFLICT (stripe_session_id) DO NOTHING`,
      [listingId ?? null, user.id, session.id, tier, TIER_AMOUNTS[tier]],
    );

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Checkout session creation failed");
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// ── Tenant: Set up BACS Direct Debit mandate ──────────────────────────────────
router.post("/payments/rent/setup-mandate", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const origin = req.headers.origin ?? "https://www.elitetenancy.co.uk";

  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    // Create SetupIntent for BACS Direct Debit
    const setupIntent = await stripe.setupIntents.create(
      {
        customer: stripeCustomerId,
        payment_method_types: ["bacs_debit"],
        usage: "off_session",
        return_url: `${origin}/tenant/rent?mandate=success`,
        metadata: { eliteUserId: String(user.id) },
      },
      { idempotencyKey: `bacs-setup-${user.id}-${Math.floor(Date.now() / 3_600_000)}` },
    );

    res.json({
      clientSecret: setupIntent.client_secret,
      stripeCustomerId,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "BACS mandate setup failed");
    res.status(500).json({ error: "Failed to set up direct debit mandate" });
  }
});

// ── Landlord: Completion fee invoice ─────────────────────────────────────────
router.post("/payments/landlord/completion-fee", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { tenancyId, monthlyRent, tierPercent = 50 } = req.body as {
    tenancyId: number;
    monthlyRent: number;
    tierPercent?: number;
  };

  if (!tenancyId || !monthlyRent) {
    res.status(400).json({ error: "tenancyId and monthlyRent required" });
    return;
  }

  try {
    const completionAmount = Math.round((monthlyRent * tierPercent) / 100);
    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    const invoice = await stripe.invoices.create(
      {
        customer: stripeCustomerId,
        auto_advance: true,
        collection_method: "send_invoice",
        days_until_due: 14,
        metadata: { eliteUserId: String(user.id), tenancyId: String(tenancyId) },
      },
      { idempotencyKey: `invoice-${user.id}-${tenancyId}` },
    );

    await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
      amount: completionAmount * 100, // pence
      currency: "gbp",
      description: `Elite Tenancy completion fee (${tierPercent}% of first month's rent)`,
    });

    const finalised = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(finalised.id);

    await pool.query(
      `INSERT INTO completion_invoices (tenancy_id, landlord_id, stripe_invoice_id, amount_pence, status)
       VALUES ($1, $2, $3, $4, 'sent')
       ON CONFLICT (stripe_invoice_id) DO NOTHING`,
      [tenancyId, user.id, finalised.id, completionAmount * 100],
    );

    res.json({ invoiceId: finalised.id, invoiceUrl: finalised.hosted_invoice_url });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Completion fee invoice failed");
    res.status(500).json({ error: "Failed to create completion fee invoice" });
  }
});

// ── Landlord: Subscribe to Managed Lettings ───────────────────────────────────
router.post("/payments/landlord/managed", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { tenancyId } = req.body as { tenancyId: number };
  const origin = req.headers.origin ?? "https://www.elitetenancy.co.uk";

  if (!tenancyId) {
    res.status(400).json({ error: "tenancyId required" });
    return;
  }

  try {
    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    const tenancyResult = await pool.query(
      "SELECT monthly_rent FROM tenancies WHERE id = $1 AND landlord_id = $2",
      [tenancyId, user.id],
    );

    if (!tenancyResult.rows.length) {
      res.status(404).json({ error: "Tenancy not found" });
      return;
    }

    const monthlyRent = tenancyResult.rows[0].monthly_rent;
    // 8% of monthly rent — matches public pricing page
    const managementFee = Math.round(monthlyRent * 0.08 * 100); // pence

    const session = await stripe.checkout.sessions.create(
      {
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: managementFee,
            recurring: { interval: "month" },
            product_data: {
              name: "Elite Tenancy Premium Managed",
              description: "8% of monthly rent — maintenance, compliance, rent collection, inspections",
            },
          },
          quantity: 1,
        }],
        mode: "subscription",
        success_url: `${origin}/landlord/managed?managed=success&tenancy=${tenancyId}`,
        cancel_url: `${origin}/landlord/dashboard`,
        metadata: { eliteUserId: String(user.id), tenancyId: String(tenancyId) },
      },
      { idempotencyKey: `managed-${user.id}-${tenancyId}` },
    );

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Managed lettings subscription failed");
    res.status(500).json({ error: "Failed to create managed lettings subscription" });
  }
});

// ── Payment history ───────────────────────────────────────────────────────────
router.get("/payments/history", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const payments = await pool.query(
      `SELECT id, tier, amount_pence, status, created_at, paid_at FROM listing_payments
       WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id],
    );

    const invoices = await pool.query(
      `SELECT id, amount_pence, status, created_at, paid_at FROM completion_invoices
       WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id],
    );

    res.json({
      listingPayments: payments.rows,
      completionInvoices: invoices.rows,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Payment history fetch failed");
    res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

export default router;
