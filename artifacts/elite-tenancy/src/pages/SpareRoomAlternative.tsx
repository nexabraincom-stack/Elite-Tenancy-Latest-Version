import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, ShieldCheck, Sparkles, PoundSterling, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

/**
 * Competitor-comparison landing page — targets "SpareRoom alternative",
 * "SpareRoom free", "tenant introduction service" style searches.
 * All claims kept factual and defensible: our completion-only model vs the
 * standard pay-to-advertise classifieds model.
 */

const ROWS: Array<{ feature: string; elite: string; them: string; eliteWin: boolean }> = [
  { feature: "When you pay", elite: "Only on success — 2 weeks' rent or 8% managed", them: "Upfront, whether or not it lets", eliteWin: true },
  { feature: "Empty property? ", elite: "You pay nothing", them: "You still pay for the advert", eliteWin: true },
  { feature: "AI tenant–property matching", elite: "Yes — every property AI-scored", them: "No — manual scroll & filter", eliteWin: true },
  { feature: "After the introduction", elite: "Full portal: rent, docs, maintenance", them: "Relationship ends at contact", eliteWin: true },
  { feature: "Renters' Rights Act 2025", elite: "Interactive, compliant agreements", them: "Static information pages", eliteWin: true },
  { feature: "Tenant screening", elite: "6-stage referencing & ID checks", them: "Limited — scam ads reported", eliteWin: true },
  { feature: "24/7 support", elite: "Ellie AI on web + WhatsApp", them: "Office-hours / email", eliteWin: true },
  { feature: "Built for", elite: "All UK cities, equally", them: "London & South East focus", eliteWin: true },
];

export default function SpareRoomAlternative() {
  useSeo({
    title: "Best SpareRoom Alternative 2026 | Elite Tenancy",
    description: "Looking for a SpareRoom alternative? Elite Tenancy offers AI-powered matching, verified landlords, and zero fees for tenants. Find your room today.",
    canonical: "https://www.elitetenancy.co.uk/spareroom-alternative",
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,146,63,0.12),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              The Smarter Alternative
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
              Paid to advertise and got <span className="text-accent italic">no tenant?</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Traditional room sites charge you up front — even if your property sits empty. Elite Tenancy is the <strong className="text-foreground">no-let, no-fee</strong> alternative: AI-matched tenants, full tenancy management, and Renters' Rights Act 2025 compliance. You pay <strong className="text-foreground">only when we place a tenant</strong>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-9">
              <Link href="/list-your-property">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  List Your Property — Free <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/find-my-match">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">
                  Find a Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Side by side</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Elite Tenancy vs traditional room sites</h2>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="grid grid-cols-[1.3fr_1fr_1fr] text-sm">
            <div className="p-4 sm:p-5 font-semibold text-muted-foreground bg-secondary/60">Feature</div>
            <div className="p-4 sm:p-5 font-bold text-primary bg-primary/5 text-center flex items-center justify-center gap-1.5">
              <BadgeCheck size={16} /> Elite Tenancy
            </div>
            <div className="p-4 sm:p-5 font-semibold text-muted-foreground bg-secondary/60 text-center">Traditional sites</div>

            {ROWS.map((r, i) => (
              <div key={r.feature} className="contents">
                <div className={`p-4 sm:p-5 font-medium text-foreground ${i % 2 ? "bg-secondary/30" : ""}`}>{r.feature}</div>
                <div className={`p-4 sm:p-5 text-center ${i % 2 ? "bg-primary/[0.07]" : "bg-primary/5"}`}>
                  <span className="inline-flex items-start gap-1.5 text-foreground">
                    <Check size={15} className="text-primary mt-0.5 shrink-0" />
                    <span>{r.elite}</span>
                  </span>
                </div>
                <div className={`p-4 sm:p-5 text-center text-muted-foreground ${i % 2 ? "bg-secondary/30" : ""}`}>
                  <span className="inline-flex items-start gap-1.5">
                    <X size={15} className="text-destructive/70 mt-0.5 shrink-0" />
                    <span>{r.them}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-4">
          Comparison reflects Elite Tenancy's completion-only model versus the standard pay-to-advertise classifieds model. Individual sites vary.
        </p>
      </section>

      {/* Three reasons */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-18 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: PoundSterling, title: "Risk-free for landlords", desc: "No upfront advertising fees. If we don't place a tenant, you pay nothing — ever. Your money follows results, not promises." },
              { icon: Sparkles, title: "Actual AI matching", desc: "Instead of endless scrolling, our AI scores every property against real requirements — so the right tenants and homes find each other." },
              { icon: ShieldCheck, title: "Compliant & verified", desc: "Six-stage tenant referencing, ID checks, and Renters' Rights Act 2025-ready agreements built in. Fewer scams, more confidence." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border/50 rounded-xl p-7">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon size={21} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-4xl font-bold text-foreground">Make the switch in minutes</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          List your property free, or let our AI match you to the perfect home. No upfront fees, no empty-room risk — just results.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/list-your-property">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
              List Your Property <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">
              See Pricing
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
