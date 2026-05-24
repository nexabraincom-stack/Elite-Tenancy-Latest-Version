/**
 * Stripe Webhook Handler
 * Mounted BEFORE express.json() so we receive the raw body Stripe signs.
 *
 * Events handled:
 *  checkout.session.completed      → activate listing, record payment
 *  invoice.paid                    → mark completion invoice as paid
 *  invoice.payment_failed          → alert landlord (log only for now)
 *  customer.subscription.created   → activate managed lettings subscription
 *  customer.subscription.deleted   → deactivate managed subscription
 *  payment_intent.succeeded        → mark rent payment as paid (BACS)
 *  payment_intent.payment_failed   → flag overdue rent
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Raw body parser for this route ONLY
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;

    if (!WEBHOOK_SECRET) {
      logger.warn("STRIPE_WEBHOOK_SECRET not set — skipping signature verification");
      res.json({ received: true });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, WEBHOOK_SECRET);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error({ msg }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: `Webhook Error: ${msg}` });
      return;
    }

    logger.info({ type: event.type, id: event.id }, "Stripe webhook received");

    try {
      await handleEvent(event);
    } catch (err) {
      logger.error({ err, eventType: event.type }, "Stripe webhook handler error");
      // Return 200 anyway — Stripe will retry on 4xx/5xx
    }

    res.json({ received: true });
  },
);

// ── PayPal IPN webhook (lightweight) ─────────────────────────────────────────
// If you add PayPal later, mount its IPN handler here
router.post(
  "/paypal",
  express.raw({ type: "application/x-www-form-urlencoded" }),
  async (_req: Request, res: Response): Promise<void> => {
    // TODO: verify IPN and process
    logger.info("PayPal IPN received");
    res.send("OK");
  },
);

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    // ── Listing fee paid ──────────────────────────────────────────────────────
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "payment") break;

      const { listingId, tier } = session.metadata ?? {};

      // Mark listing payment as paid
      await pool.query(
        `UPDATE listing_payments
         SET status = 'paid', paid_at = NOW(), stripe_payment_intent = $1
         WHERE stripe_session_id = $2`,
        [session.payment_intent as string, session.id],
      );

      // Activate / upgrade the listing
      if (listingId) {
        const isPremium = tier === "premium" || tier === "professional";
        await pool.query(
          `UPDATE listings
           SET status = 'active', is_premium = $1, is_featured = $2
           WHERE id = $3`,
          [isPremium, tier === "premium", parseInt(listingId)],
        );
        logger.info({ listingId, tier }, "Listing activated after payment");
      }
      break;
    }

    // ── Managed lettings subscription started ────────────────────────────────
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const { tenancyId, eliteUserId } = sub.metadata ?? {};
      if (tenancyId && eliteUserId) {
        await pool.query(
          `INSERT INTO managed_subscriptions (tenancy_id, landlord_id, stripe_subscription_id, status)
           VALUES ($1, $2, $3, 'active')
           ON CONFLICT DO NOTHING`,
          [parseInt(tenancyId), parseInt(eliteUserId), sub.id],
        );
        logger.info({ tenancyId, subId: sub.id }, "Managed subscription activated");
      }
      break;
    }

    // ── Managed lettings subscription cancelled ───────────────────────────────
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await pool.query(
        `UPDATE managed_subscriptions SET status = 'cancelled' WHERE stripe_subscription_id = $1`,
        [sub.id],
      );
      break;
    }

    // ── Completion invoice paid ───────────────────────────────────────────────
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await pool.query(
        `UPDATE completion_invoices SET status = 'paid', paid_at = NOW()
         WHERE stripe_invoice_id = $1`,
        [invoice.id],
      );
      logger.info({ invoiceId: invoice.id }, "Completion invoice paid");
      break;
    }

    // ── Completion invoice payment failed ────────────────────────────────────
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await pool.query(
        `UPDATE completion_invoices
         SET status = 'payment_failed'
         WHERE stripe_invoice_id = $1`,
        [invoice.id],
      );
      logger.warn(
        {
          invoiceId: invoice.id,
          customerId: invoice.customer,
          attemptCount: (invoice as Stripe.Invoice & { attempt_count?: number }).attempt_count,
          nextAttempt: invoice.next_payment_attempt,
        },
        "Invoice payment failed — Stripe will retry per invoice settings",
      );
      // TODO: trigger landlord notification (email/in-app) if attemptCount >= 3
      break;
    }

    // ── BACS rent payment succeeded ───────────────────────────────────────────
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.payment_method_types.includes("bacs_debit") && pi.metadata?.rentPaymentId) {
        await pool.query(
          `UPDATE rent_payments SET status = 'paid', paid_date = NOW()
           WHERE id = $1`,
          [parseInt(pi.metadata.rentPaymentId)],
        );
        logger.info({ piId: pi.id }, "Rent payment succeeded (BACS)");
      }
      break;
    }

    // ── BACS rent payment failed ──────────────────────────────────────────────
    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      if (pi.metadata?.rentPaymentId) {
        await pool.query(
          `UPDATE rent_payments SET status = 'overdue' WHERE id = $1`,
          [parseInt(pi.metadata.rentPaymentId)],
        );
        logger.warn({ piId: pi.id }, "Rent payment FAILED (BACS)");
      }
      break;
    }

    default:
      logger.debug({ type: event.type }, "Unhandled Stripe webhook event");
  }
}

export default router;
