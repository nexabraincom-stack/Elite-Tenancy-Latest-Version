import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

// ── Stripe Price IDs (set in Stripe Dashboard → Products) ────────────────────
// These are env-var driven so you can use test IDs in dev and live IDs in prod.
export const STRIPE_PRICES = {
  standard:     process.env.STRIPE_PRICE_STANDARD     ?? "",
  professional: process.env.STRIPE_PRICE_PROFESSIONAL ?? "",
  premium:      process.env.STRIPE_PRICE_PREMIUM      ?? "",
  managed:      process.env.STRIPE_PRICE_MANAGED      ?? "", // Monthly managed-lettings subscription
} as const;

export type ListingTier = "standard" | "professional" | "premium";

export const TIER_AMOUNTS: Record<ListingTier, number> = {
  standard:     14900, // £149
  professional: 29900, // £299
  premium:      49900, // £499
};
