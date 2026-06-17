import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useSeo } from "@/hooks/use-seo";

const landlordSteps = [
  { step: "01", title: "Book your free valuation", desc: "We remotely assess your property using listing details, market data, and comparable lettings to provide a realistic, data-backed rental valuation." },
  { step: "02", title: "We prepare your listing", desc: "We arrange professional photography (via trusted local partners), write compelling copy, and prepare your listing for our premium platform and all major property portals." },
  { step: "03", title: "Tenant matching begins", desc: "Before your property goes live, we search our active tenant database for pre-qualified applicants who match your requirements. Many properties let before they're publicly listed." },
  { step: "04", title: "Viewings coordinated", desc: "We arrange viewings via trusted local viewing agents and run every serious applicant through our six-stage screening process." },
  { step: "05", title: "You approve the tenant", desc: "We present you with our recommendation and the full screening report. The final decision is always yours." },
  { step: "06", title: "Tenancy setup and completion", desc: "We guide you through preparing the tenancy agreement, conducting Right to Rent checks (using GOV.UK share codes), and arranging deposit protection. Once the tenant moves in, we invoice." },
];

const tenantSteps = [
  { step: "01", title: "Create your profile", desc: "Sign up and tell us what you're looking for — location, budget, move-in date, and any requirements. The more detail you give, the better we can match you." },
  { step: "02", title: "Browse or be matched", desc: "Search our listings directly, or let our matching system alert you when a suitable property becomes available — sometimes before it's publicly listed." },
  { step: "03", title: "Request a viewing", desc: "Found something you like? Request a viewing directly through our platform. We aim to offer viewings within 48 hours." },
  { step: "04", title: "Complete your application", desc: "If you'd like to proceed, we'll guide you through our referencing process: credit check, affordability assessment, employer reference, and landlord reference." },
  { step: "05", title: "Receive your offer letter", desc: "Once approved, we'll issue a formal offer letter setting out the terms. You'll have 48 hours to confirm." },
  { step: "06", title: "Move in", desc: "We prepare your tenancy agreement, register your deposit with a government-approved scheme, and hand over the keys. Welcome to your new home." },
];

export default function HowItWorks() {
  useSeo({
    title: "How Elite Tenancy Works | UK Lettings Made Simple",
    description: "See exactly how Elite Tenancy works for landlords and tenants. From valuation to move-in in as little as 12 days.",
    canonical: "https://www.elitetenancy.co.uk/how-it-works",
  });
  const [tab, setTab] = useState<"landlord" | "tenant">("landlord");
  const steps = tab === "landlord" ? landlordSteps : tenantSteps;

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">The process</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">How It Works</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Whether you're a landlord or a tenant, we've made every step as simple and transparent as possible.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex bg-card border border-border/50 rounded-xl p-1 mb-12 max-w-xs mx-auto">
          <button
            onClick={() => setTab("landlord")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "landlord" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For Landlords
          </button>
          <button
            onClick={() => setTab("tenant")}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              tab === "tenant" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            For Tenants
          </button>
        </div>

        <div className="space-y-4">
          {steps.map(({ step, title, desc }, index) => (
            <div key={step} className="relative flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-serif font-bold text-sm shrink-0">
                  {step}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 w-px bg-border/50 mt-2 min-h-[32px]" />
                )}
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5 flex-1 mb-4">
                <h3 className="font-semibold text-foreground mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          {tab === "landlord" ? (
            <Link href="/valuation">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                Book a Free Valuation
              </Button>
            </Link>
          ) : (
            <Link href="/listings">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                Browse Properties
              </Button>
            </Link>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
