/**
 * Stripe Webhook Handler
 * Mounted BEFORE express.json() so we receive the raw body Stripe signs.
 *
 * Events handled:
 *  checkout.session.completed        → activate listing, record payment
 *  invoice.paid                      → mark completion invoice as paid
 *  invoice.payment_failed            → alert landlord (log only for now)
 *  customer.subscription.created     → activate managed lettings / landlord plan subscription
 *  customer.subscription.updated     → handle plan upgrades/downgrades
 *  customer.subscription.deleted     → deactivate subscription
 *  payment_intent.succeeded          → mark rent payment as paid (BACS)
 *  payment_intent.payment_failed     → flag overdue rent
 *  charge.refunded                   → record refund in DB
 *  charge.dispute.created            → flag disputed payment, notify admin
 *  charge.dispute.closed             → update dispute record
 *  account.updated                   → update Connect account onboarding status (Stripe Connect)
 *  transfer.created                  → record Connect payout to landlord
 */

import { Router, type IRouter } from "express";
import type { Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { stripe } from "../lib/stripe";
import { pool } from "@workspace/db";
import { logger } from "../lib/logger";
import { N8N_EVENTS } from "../lib/n8n";

const router: IRouter = Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

// Raw body parser for this route ONLY
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers["stripe-signature"] as string;

    if (!WEBHOOK_SECRET) {
      logger.error("STRIPE_WEBHOOK_SECRET not configured — rejecting webhook request");
      res.status(503).json({ error: "Webhook endpoint not configured" });
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

    // ── Landlord subscription plan updated (upgrade/downgrade) ───────────────
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const { planId, eliteUserId } = sub.metadata ?? {};

      if (eliteUserId && planId) {
        await pool.query(
          `INSERT INTO landlord_subscriptions (landlord_id, stripe_subscription_id, plan_id, status, current_period_end)
           VALUES ($1, $2, $3, $4, to_timestamp($5))
           ON CONFLICT (stripe_subscription_id)
           DO UPDATE SET plan_id = EXCLUDED.plan_id, status = EXCLUDED.status,
                         current_period_end = EXCLUDED.current_period_end`,
          [
            parseInt(eliteUserId),
            sub.id,
            planId,
            sub.status,
            sub.current_period_end,
          ],
        ).catch(() => {}); // Graceful: table may not exist until migration runs
        logger.info({ subId: sub.id, planId, status: sub.status }, "Landlord subscription updated");

        // Fire n8n: subscription change automation (WhatsApp onboarding flow etc.)
        N8N_EVENTS.subscriptionEvent({
          landlordId: eliteUserId,
          planId,
          status: sub.status,
          subscriptionId: sub.id,
        }).catch(() => {});
      }
      break;
    }

    // ── Refund issued ─────────────────────────────────────────────────────────
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      // charge.refunds.data[0] is the most recent refund
      const refund = charge.refunds?.data?.[0];
      if (refund) {
        await pool.query(
          `INSERT INTO payment_refunds
             (stripe_refund_id, stripe_payment_intent, amount_pence, reason, status)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (stripe_refund_id)
           DO UPDATE SET status = EXCLUDED.status`,
          [refund.id, charge.payment_intent as string, refund.amount, refund.reason, refund.status],
        ).catch(() => {});
        logger.info({ refundId: refund.id, amount: refund.amount }, "Refund recorded");
      }
      break;
    }

    // ── Dispute opened ────────────────────────────────────────────────────────
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      await pool.query(
        `INSERT INTO payment_disputes
           (stripe_dispute_id, stripe_payment_intent, amount_pence, reason, status, due_by)
         VALUES ($1, $2, $3, $4, $5, to_timestamp($6))
         ON CONFLICT (stripe_dispute_id) DO NOTHING`,
        [
          dispute.id,
          dispute.payment_intent as string,
          dispute.amount,
          dispute.reason,
          dispute.status,
          dispute.evidence_details?.due_by ?? null,
        ],
      ).catch(() => {});
      logger.warn({ disputeId: dispute.id, amount: dispute.amount, reason: dispute.reason }, "⚠️ Dispute OPENED — evidence required");

      // Fire n8n: payment dispute alert (triggers admin notification workflow)
      N8N_EVENTS.paymentEvent({
        type: "dispute",
        amount: dispute.amount,
        currency: dispute.currency,
        referenceId: dispute.id,
      }).catch(() => {});
      break;
    }

    // ── Dispute closed ────────────────────────────────────────────────────────
    case "charge.dispute.closed": {
      const dispute = event.data.object as Stripe.Dispute;
      await pool.query(
        `UPDATE payment_disputes SET status = $1 WHERE stripe_dispute_id = $2`,
        [dispute.status, dispute.id],
      ).catch(() => {});
      logger.info({ disputeId: dispute.id, status: dispute.status }, "Dispute closed");
      break;
    }

    // ── Stripe Connect: account onboarding status changed ────────────────────
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const onboardingComplete = account.details_submitted && (account.payouts_enabled ?? false);
      await pool.query(
        `UPDATE landlord_connect_accounts
         SET onboarding_complete = $1
         WHERE stripe_connect_account_id = $2`,
        [onboardingComplete, account.id],
      ).catch(() => {});
      logger.info({ accountId: account.id, onboardingComplete }, "Connect account updated");
      break;
    }

    // ── Connect transfer paid out ─────────────────────────────────────────────
    case "transfer.created": {
      const transfer = event.data.object as Stripe.Transfer;
      await pool.query(
        `UPDATE connect_transfers SET status = 'paid' WHERE stripe_transfer_id = $1`,
        [transfer.id],
      ).catch(() => {});
      logger.info({ transferId: transfer.id, amount: transfer.amount }, "Connect transfer created");
      break;
    }

    default:
      logger.debug({ type: event.type }, "Unhandled Stripe webhook event");
  }
}

export default router;
