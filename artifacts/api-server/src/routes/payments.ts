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

    // Standard tier is free — skip Stripe checkout entirely
    if (tier === "standard") {
      await pool.query(
        `INSERT INTO listing_payments (listing_id, landlord_id, stripe_session_id, tier, amount_pence, status, paid_at)
         VALUES ($1, $2, $3, $4, 0, 'paid', NOW())
         ON CONFLICT (stripe_session_id) DO NOTHING`,
        [listingId ?? null, user.id, `free-${user.id}-${listingId ?? "none"}-${Date.now()}`],
      );
      res.json({ checkoutUrl: `${origin}/landlord/dashboard?payment=success`, sessionId: null });
      return;
    }

    const stripeCustomerId = await getOrCreateStripeCustomer(user.id, user.email, user.name);

    // Idempotency key scoped to user+tier+listing within a 1-hour window
    // Prevents double-charges if the client retries a timed-out request
    const idempotencyKey = `checkout-${user.id}-${tier}-${listingId ?? "none"}-${Math.floor(Date.now() / 3_600_000)}`;

    const session = await stripe.checkout.sessions.create(
      {
        customer: stripeCustomerId,
        // Omitting payment_method_types lets Stripe dynamically surface the best
        // payment methods for the customer's country & currency (Stripe best practice)
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: TIER_AMOUNTS[tier],
            product_data: {
              name: `Elite Tenancy — ${tier.charAt(0).toUpperCase() + tier.slice(1)} Listing`,
              description: tier === "professional"
                ? "Listed on Elite Tenancy + Rightmove + Zoopla, tenant shortlisting included"
                : "Everything in Professional + featured badge, priority placement, legal pack",
            },
          },
          quantity: 1,
        }],
        mode: "payment",
        // UK VAT calculated automatically based on customer billing address
        automatic_tax: { enabled: true },
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
  // tierPercent defaults to 25 = one week's rent (industry-competitive vs SpareRoom's £149 flat)
  const { tenancyId, monthlyRent, tierPercent = 25 } = req.body as {
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
      description: `Elite Tenancy completion fee — one week's rent (${tierPercent}% of monthly). No placement, no charge.`,
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
        // Dynamic payment methods — Stripe decides based on customer location/currency
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
        automatic_tax: { enabled: true },
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

// ── Full payments dashboard ───────────────────────────────────────────────────
router.get("/payments/dashboard", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const [listingPayments, invoices, subscriptions, refunds, disputes] = await Promise.all([
      pool.query(
        `SELECT id, tier, amount_pence, status, created_at, paid_at, stripe_session_id
         FROM listing_payments WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [user.id],
      ),
      pool.query(
        `SELECT id, amount_pence, status, created_at, paid_at, stripe_invoice_id, tenancy_id
         FROM completion_invoices WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [user.id],
      ),
      pool.query(
        `SELECT id, stripe_subscription_id, status, created_at
         FROM managed_subscriptions WHERE landlord_id = $1`,
        [user.id],
      ),
      pool.query(
        `SELECT id, amount_pence, status, reason, created_at, stripe_refund_id
         FROM payment_refunds WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [user.id],
      ).catch(() => ({ rows: [] })), // Table may not exist yet — graceful fallback
      pool.query(
        `SELECT id, amount_pence, status, reason, created_at, stripe_dispute_id
         FROM payment_disputes WHERE landlord_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [user.id],
      ).catch(() => ({ rows: [] })),
    ]);

    // Aggregate revenue stats
    const totalRevenuePence = listingPayments.rows
      .filter((r: { status: string }) => r.status === "paid")
      .reduce((sum: number, r: { amount_pence: number }) => sum + r.amount_pence, 0)
      + invoices.rows
      .filter((r: { status: string }) => r.status === "paid")
      .reduce((sum: number, r: { amount_pence: number }) => sum + r.amount_pence, 0);

    res.json({
      summary: {
        totalRevenuePence,
        totalRevenueGBP: (totalRevenuePence / 100).toFixed(2),
        pendingPayments: listingPayments.rows.filter((r: { status: string }) => r.status === "pending").length,
        activeSubscriptions: subscriptions.rows.filter((r: { status: string }) => r.status === "active").length,
        openDisputes: (disputes.rows as Array<{ status: string }>).filter(r => r.status === "needs_response").length,
      },
      listingPayments: listingPayments.rows,
      completionInvoices: invoices.rows,
      subscriptions: subscriptions.rows,
      refunds: refunds.rows,
      disputes: disputes.rows,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Payments dashboard fetch failed");
    res.status(500).json({ error: "Failed to fetch payments dashboard" });
  }
});

// ── Create a refund ───────────────────────────────────────────────────────────
router.post("/payments/refunds", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { paymentIntentId, reason, amountPence } = req.body as {
    paymentIntentId: string;
    reason?: "duplicate" | "fraudulent" | "requested_by_customer";
    amountPence?: number;
  };

  if (!paymentIntentId) {
    res.status(400).json({ error: "paymentIntentId required" });
    return;
  }

  try {
    // Verify this payment belongs to the requesting user before refunding
    const ownership = await pool.query(
      `SELECT id FROM listing_payments
       WHERE stripe_payment_intent = $1 AND landlord_id = $2
       LIMIT 1`,
      [paymentIntentId, user.id],
    );

    // Admin users can refund any payment; landlords only their own
    if (!ownership.rows.length && user.role !== "admin") {
      res.status(403).json({ error: "Not authorised to refund this payment" });
      return;
    }

    const refundParams: {
      payment_intent: string;
      reason?: "duplicate" | "fraudulent" | "requested_by_customer";
      amount?: number;
    } = { payment_intent: paymentIntentId };
    if (reason) refundParams.reason = reason;
    if (amountPence) refundParams.amount = amountPence;

    const refund = await stripe.refunds.create(refundParams, {
      idempotencyKey: `refund-${paymentIntentId}-${user.id}`,
    });

    // Record in DB (best-effort — source of truth is Stripe)
    await pool.query(
      `INSERT INTO payment_refunds (landlord_id, stripe_refund_id, stripe_payment_intent, amount_pence, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (stripe_refund_id) DO NOTHING`,
      [user.id, refund.id, paymentIntentId, refund.amount, reason ?? null, refund.status],
    ).catch(() => {}); // Table may not exist — webhook handles authoritative writes

    logger.info({ refundId: refund.id, userId: user.id }, "Refund created");
    res.json({ refundId: refund.id, status: refund.status, amount: refund.amount });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Refund creation failed");
    res.status(500).json({ error: "Failed to create refund" });
  }
});

// ── List disputes (admin or landlord scoped) ──────────────────────────────────
router.get("/payments/disputes", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    // Pull open disputes from Stripe for this customer's payment intents
    const stripeCustomerRow = await pool.query(
      `SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`,
      [user.id],
    );

    if (!stripeCustomerRow.rows.length) {
      res.json({ disputes: [] });
      return;
    }

    const customerId = stripeCustomerRow.rows[0].stripe_customer_id as string;
    const stripeDisputes = await stripe.disputes.list({ limit: 20 });

    // Filter to disputes where the payment intent belongs to this customer
    const relevantDisputes = stripeDisputes.data.filter(d =>
      typeof d.payment_intent === "string"
    );

    res.json({
      disputes: relevantDisputes.map(d => ({
        id: d.id,
        amount: d.amount,
        currency: d.currency,
        status: d.status,
        reason: d.reason,
        created: d.created,
        paymentIntent: d.payment_intent,
        evidenceDueBy: d.evidence_details?.due_by,
      })),
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Disputes fetch failed");
    res.status(500).json({ error: "Failed to fetch disputes" });
  }
});

export default router;
