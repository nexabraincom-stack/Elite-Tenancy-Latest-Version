import Stripe from "stripe";

// Lazy singleton — instantiated on first use so a missing env var surfaces as
// a 503 response rather than a module-level throw that crashes the entire
// serverless function on cold start.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (process.env.STRIPE_SECRET_KEY!.startsWith("sk_")) {
      console.warn("[stripe] WARNING: Using secret key (sk_). Switch to a restricted key (rk_) with least-privilege permissions.");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      // @ts-ignore: LatestApiVersion literal differs between SDK minor versions; runtime accepts any valid string
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

// Named export kept for backward compatibility — callers that do `stripe.foo`
// will now call via the lazy getter.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
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
