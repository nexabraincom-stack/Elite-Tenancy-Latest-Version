/**
 * Elite Tenancy — Landlord Subscription Plans
 *
 * Blueprint subscription tiers (monthly):
 *  Starter  £19/mo  — Basic listing + AI tenant matching
 *  Growth   £49/mo  — + Priority support + Analytics dashboard
 *  Pro      £99/mo  — + Managed lettings tools + Ellie WhatsApp
 *  Elite   £199/mo  — Full white-glove + dedicated account manager
 *
 * Endpoints:
 *  GET  /api/subscriptions/plans        → List all plans with features
 *  POST /api/subscriptions/checkout     → Create Stripe Checkout for a plan
 *  GET  /api/subscriptions/me           → Get calling user's active subscription
 *  POST /api/subscriptions/portal       → Create Stripe Customer Portal session
 *  POST /api/subscriptions/cancel       → Cancel subscription at period end
 */

import { Router, type IRouter, type Request, type Response } from "express";
import type Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Plan definitions ──────────────────────────────────────────────────────────
const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthlyGBP: 19,
    priceMonthlyPence: 1900,
    stripePriceEnvKey: "STRIPE_PRICE_SUBSCRIPTION_STARTER",
    colour: "#6B7280",
    badge: null,
    features: [
      "1 active listing at a time",
      "AI-powered tenant matching",
      "Basic analytics",
      "Email support (48h response)",
      "RRA 2025 compliance checklist",
    ],
    limits: { listings: 1, aiMatches: 10 },
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthlyGBP: 49,
    priceMonthlyPence: 4900,
    stripePriceEnvKey: "STRIPE_PRICE_SUBSCRIPTION_GROWTH",
    colour: "#3B82F6",
    badge: "Popular",
    features: [
      "Up to 5 active listings",
      "Priority AI tenant matching",
      "Full analytics dashboard",
      "Priority support (12h response)",
      "Automated compliance reminders",
      "Viewing scheduler integration",
      "Landlord performance report",
    ],
    limits: { listings: 5, aiMatches: 50 },
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthlyGBP: 99,
    priceMonthlyPence: 9900,
    stripePriceEnvKey: "STRIPE_PRICE_SUBSCRIPTION_PRO",
    colour: "#8B5CF6",
    badge: "Best Value",
    features: [
      "Unlimited listings",
      "Ellie WhatsApp AI assistant",
      "Automated tenant referencing pipeline",
      "Digital tenancy agreements (Legalesign)",
      "Managed lettings tools",
      "Priority support (4h response)",
      "Dedicated success manager (monthly call)",
      "Early access to new features",
    ],
    limits: { listings: -1, aiMatches: -1 },
  },
  {
    id: "elite",
    name: "Elite",
    priceMonthlyGBP: 199,
    priceMonthlyPence: 19900,
    stripePriceEnvKey: "STRIPE_PRICE_SUBSCRIPTION_ELITE",
    colour: "#F59E0B",
    badge: "White Glove",
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Portfolio performance reviews (weekly)",
      "Custom branded tenant communications",
      "API access for portfolio tools",
      "Priority dispute resolution",
      "Bespoke compliance reporting",
      "£0 completion fee (waived)",
    ],
    limits: { listings: -1, aiMatches: -1 },
  },
] as const;

type PlanId = "starter" | "growth" | "pro" | "elite";

// ── GET /api/subscriptions/plans ──────────────────────────────────────────────
router.get("/subscriptions/plans", async (_req: Request, res: Response): Promise<void> => {
  // Return plan metadata — no auth needed (used on public pricing page too)
  res.json({ plans: SUBSCRIPTION_PLANS });
});

// ── POST /api/subscriptions/checkout ─────────────────────────────────────────
router.post("/subscriptions/checkout", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { planId } = req.body as { planId: PlanId };

  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
  if (!plan) {
    res.status(400).json({ error: `Invalid planId. Valid options: ${SUBSCRIPTION_PLANS.map(p => p.id).join(", ")}` });
    return;
  }

  const origin = req.headers.origin ?? "https://www.elitetenancy.co.uk";

  try {
    // Get or create Stripe customer
    const existingCustomer = await pool.query(
      `SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`,
      [user.id],
    );

    let customerId: string;
    if (existingCustomer.rows.length > 0) {
      customerId = existingCustomer.rows[0].stripe_customer_id as string;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { eliteUserId: String(user.id) },
      });
      await pool.query(
        `INSERT INTO stripe_customers (user_id, stripe_customer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [user.id, customer.id],
      );
      customerId = customer.id;
    }

    // Check if Stripe Price ID is configured
    const stripePriceId = process.env[plan.stripePriceEnvKey];

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (stripePriceId) {
      // Use pre-configured Stripe Price (recommended for production)
      sessionParams = {
        customer: customerId,
        line_items: [{ price: stripePriceId, quantity: 1 }],
        mode: "subscription",
        automatic_tax: { enabled: true },
        success_url: `${origin}/landlord/dashboard?subscription=success&plan=${planId}`,
        cancel_url: `${origin}/pricing?subscription=cancelled`,
        metadata: { eliteUserId: String(user.id), planId },
        subscription_data: {
          metadata: { eliteUserId: String(user.id), planId },
          trial_period_days: planId === "starter" ? 0 : 14, // 14-day free trial on paid plans
        },
      };
    } else {
      // Fallback: inline price_data (for development/staging without pre-configured prices)
      logger.warn({ planId, envKey: plan.stripePriceEnvKey }, "Stripe Price ID not configured — using inline price_data");
      sessionParams = {
        customer: customerId,
        line_items: [{
          price_data: {
            currency: "gbp",
            unit_amount: plan.priceMonthlyPence,
            recurring: { interval: "month" },
            product_data: {
              name: `Elite Tenancy ${plan.name}`,
              description: plan.features.slice(0, 3).join(" · "),
            },
          },
          quantity: 1,
        }],
        mode: "subscription",
        automatic_tax: { enabled: true },
        success_url: `${origin}/landlord/dashboard?subscription=success&plan=${planId}`,
        cancel_url: `${origin}/pricing?subscription=cancelled`,
        metadata: { eliteUserId: String(user.id), planId },
      };
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams,
      { idempotencyKey: `sub-checkout-${user.id}-${planId}-${Math.floor(Date.now() / 3_600_000)}` },
    );

    res.json({ checkoutUrl: session.url, sessionId: session.id, plan: planId });
  } catch (err) {
    logger.error({ err, userId: user.id, planId }, "Subscription checkout failed");
    res.status(500).json({ error: "Failed to create subscription checkout" });
  }
});

// ── GET /api/subscriptions/me ─────────────────────────────────────────────────
router.get("/subscriptions/me", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;

  try {
    const customerRow = await pool.query(
      `SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`,
      [user.id],
    );

    if (!customerRow.rows.length) {
      res.json({ subscription: null, plan: null, message: "No Stripe customer found" });
      return;
    }

    const customerId = customerRow.rows[0].stripe_customer_id as string;

    // Fetch live subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
      expand: ["data.default_payment_method"],
    });

    const active = subscriptions.data.find(s => s.status === "active" || s.status === "trialing");

    if (!active) {
      res.json({ subscription: null, plan: null, status: "none" });
      return;
    }

    const planId = active.metadata.planId as PlanId | undefined;
    const planMeta = planId ? SUBSCRIPTION_PLANS.find(p => p.id === planId) : null;

    res.json({
      subscription: {
        id: active.id,
        status: active.status,
        planId: planId ?? null,
        currentPeriodStart: active.current_period_start,
        currentPeriodEnd: active.current_period_end,
        cancelAtPeriodEnd: active.cancel_at_period_end,
        trialEnd: active.trial_end,
      },
      plan: planMeta ?? null,
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Subscription fetch failed");
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
});

// ── POST /api/subscriptions/portal ───────────────────────────────────────────
// Creates a Stripe Customer Portal session — lets the landlord manage their
// subscription (upgrade, downgrade, cancel, update payment method) without
// us building that UI ourselves.
router.post("/subscriptions/portal", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const origin = req.headers.origin ?? "https://www.elitetenancy.co.uk";

  try {
    const customerRow = await pool.query(
      `SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`,
      [user.id],
    );

    if (!customerRow.rows.length) {
      res.status(404).json({ error: "No Stripe customer found — subscribe first" });
      return;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerRow.rows[0].stripe_customer_id as string,
      return_url: `${origin}/landlord/dashboard`,
    });

    res.json({ portalUrl: session.url });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Customer portal session failed");
    res.status(500).json({ error: "Failed to create customer portal session" });
  }
});

// ── POST /api/subscriptions/cancel ────────────────────────────────────────────
// Cancels at period end (not immediately) — landlord keeps access until billing date.
router.post("/subscriptions/cancel", requireAuth(), async (req: Request, res: Response): Promise<void> => {
  const user = res.locals.user;
  const { subscriptionId, immediately = false } = req.body as {
    subscriptionId: string;
    immediately?: boolean;
  };

  if (!subscriptionId) {
    res.status(400).json({ error: "subscriptionId required" });
    return;
  }

  try {
    // Verify the subscription belongs to this user
    const customerRow = await pool.query(
      `SELECT stripe_customer_id FROM stripe_customers WHERE user_id = $1`,
      [user.id],
    );

    if (!customerRow.rows.length) {
      res.status(404).json({ error: "No Stripe customer found" });
      return;
    }

    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.customer !== customerRow.rows[0].stripe_customer_id && user.role !== "admin") {
      res.status(403).json({ error: "Not authorised to cancel this subscription" });
      return;
    }

    let result: { id: string; status: string; cancel_at_period_end: boolean };

    if (immediately) {
      // Immediate cancellation — used only by admins for fraud/abuse
      const cancelled = await stripe.subscriptions.cancel(subscriptionId);
      result = { id: cancelled.id, status: cancelled.status, cancel_at_period_end: cancelled.cancel_at_period_end };
    } else {
      // Graceful: access remains until next billing date
      const updated = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      result = { id: updated.id, status: updated.status, cancel_at_period_end: updated.cancel_at_period_end };
    }

    logger.info({ subscriptionId, userId: user.id, immediately }, "Subscription cancellation requested");
    res.json({
      ...result,
      message: immediately
        ? "Subscription cancelled immediately"
        : "Subscription will cancel at the end of the current billing period",
    });
  } catch (err) {
    logger.error({ err, userId: user.id }, "Subscription cancellation failed");
    res.status(500).json({ error: "Failed to cancel subscription" });
  }
});

export { SUBSCRIPTION_PLANS };
export default router;
