/**
 * PaymentCheckout — Redirects landlord to Stripe Checkout for listing fee.
 * Usage: <PaymentCheckout tier="standard" onCancel={() => {}} />
 */

import { useState } from "react";
import { Loader2, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ListingTier = "standard" | "professional" | "premium";

interface TierInfo {
  name: string;
  price: string;
  completion: string;
  features: string[];
  highlight: boolean;
}

export const TIER_INFO: Record<ListingTier, TierInfo> = {
  standard: {
    name: "Standard",
    price: "£149",
    completion: "50% of first month's rent on completion",
    features: [
      "Listed until let — no time limit",
      "AI-powered tenant matching",
      "Direct tenant messaging",
      "Tenant referencing included",
    ],
    highlight: false,
  },
  professional: {
    name: "Professional",
    price: "£299",
    completion: "40% of first month's rent on completion",
    features: [
      "Everything in Standard",
      "Professional photography",
      "Premium listing placement",
      "Tenant shortlisting service",
      "Priority viewing scheduling",
    ],
    highlight: true,
  },
  premium: {
    name: "Premium",
    price: "£499",
    completion: "35% of first month's rent on completion",
    features: [
      "Everything in Professional",
      "12-month landlord guarantee",
      "Fully managed option available",
      "Legal tenancy pack included",
      "Priority 24/7 support",
      "Quarterly compliance review",
    ],
    highlight: false,
  },
};

interface Props {
  listingId?: number;
  defaultTier?: ListingTier;
  onCancel?: () => void;
  compact?: boolean;
}

export default function PaymentCheckout({ listingId, defaultTier = "standard", onCancel, compact = false }: Props) {
  const [selectedTier, setSelectedTier] = useState<ListingTier>(defaultTier);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/payments/landlord/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: selectedTier, listingId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Payment failed");
      }
      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
      setLoading(false);
    }
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {(["standard", "professional", "premium"] as ListingTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-3 rounded-xl border text-center transition-all ${
                selectedTier === tier
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-primary/40"
              }`}
            >
              <p className="text-xs font-semibold capitalize">{tier}</p>
              <p className="text-sm font-bold text-foreground mt-0.5">{TIER_INFO[tier].price}</p>
            </button>
          ))}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <CreditCard size={16} className="mr-2" />}
          Pay {TIER_INFO[selectedTier].price} — Activate Listing
        </Button>
        <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
          <Shield size={10} /> Secured by Stripe · GDPR compliant
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold text-foreground mb-2">Choose Your Listing Package</h2>
        <p className="text-muted-foreground">Pay once. Listed until let. Only pay completion fee when your tenancy completes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(["standard", "professional", "premium"] as ListingTier[]).map((tier) => {
          const info = TIER_INFO[tier];
          const isSelected = selectedTier === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`relative text-left p-6 rounded-2xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-border/50 hover:border-primary/40"
              } ${info.highlight ? "ring-2 ring-primary/20" : ""}`}
            >
              {info.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              )}
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-foreground capitalize">{tier}</span>
                {isSelected && <CheckCircle size={18} className="text-primary" />}
              </div>
              <p className="font-display text-3xl font-bold text-foreground mb-1">{info.price}</p>
              <p className="text-xs text-muted-foreground mb-4">upfront, then {info.completion}</p>
              <ul className="space-y-2">
                {info.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle size={12} className="text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-10"
          onClick={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin mr-2" />
          ) : (
            <CreditCard size={18} className="mr-2" />
          )}
          Pay {TIER_INFO[selectedTier].price} — Continue to Secure Checkout
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-2">
        <Shield size={12} />
        256-bit SSL encryption · Powered by Stripe · PCI DSS compliant
      </p>
    </div>
  );
}
