import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, ShieldCheck, Sparkles, PoundSterling, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const ROWS: Array<{ feature: string; elite: string; them: string }> = [
  { feature: "When you pay", elite: "Only on success — 2 weeks' rent or 8% managed", them: "Upfront, whether or not it lets" },
  { feature: "Empty property?", elite: "You pay nothing", them: "You still pay for the advert" },
  { feature: "AI tenant–property matching", elite: "Yes — every property AI-scored", them: "No — manual scroll & filter" },
  { feature: "After the introduction", elite: "Full portal: rent, docs, maintenance", them: "Relationship ends at contact" },
  { feature: "Renters' Rights Act 2025", elite: "Interactive, compliant agreements", them: "Static information pages" },
  { feature: "Tenant screening", elite: "6-stage referencing & ID checks", them: "Limited — scam ads reported" },
  { feature: "24/7 support", elite: "Ellie AI on web + WhatsApp", them: "Office-hours / email" },
  { feature: "Built for", elite: "All UK cities, equally", them: "London & South East focus" },
];

export default function SpareRoomAlternative() {
  useSeo({
    title: "Best SpareRoom Alternative 2026 | Elite Tenancy",
    description: "Looking for a SpareRoom alternative? Elite Tenancy offers AI-powered matching, verified landlords, and zero fees for tenants. Find your room today.",
    canonical: "https://www.elitetenancy.co.uk/spareroom-alternative",
  });

  return (
    <PublicLayout>
      {/* Hero — full-bleed navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
              The Smarter Alternative
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white leading-[1.05] tracking-tight mt-7">
              Paid to advertise and got <em className="text-accent not-italic">no tenant?</em>
            </h1>
            <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Traditional room sites charge you up front — even if your property sits empty. Elite Tenancy is the <strong className="text-white">no-let, no-fee</strong> alternative: AI-matched tenants, full tenancy management, and Renters' Rights Act 2025 compliance. You pay <strong className="text-white">only when we place a tenant</strong>.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-9">
              <Link href="/list-your-property">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 gap-2 px-8 shadow-lg shadow-accent/30 font-semibold">
                  List Your Property — Free <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/find-my-match">
                <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 font-semibold">
                  Find a Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="bg-background py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Side by side
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Elite Tenancy vs traditional <em className="text-accent not-italic">room sites</em>
            </h2>
          </div>

          <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="grid grid-cols-[1.3fr_1fr_1fr] text-sm">
              <div className="p-4 sm:p-5 font-semibold text-muted-foreground bg-background">Feature</div>
              <div className="p-4 sm:p-5 font-semibold text-primary bg-primary/5 text-center flex items-center justify-center gap-1.5">
                <BadgeCheck size={16} className="text-accent" /> Elite Tenancy
              </div>
              <div className="p-4 sm:p-5 font-semibold text-muted-foreground bg-background text-center">Traditional sites</div>

              {ROWS.map((r, i) => (
                <div key={r.feature} className="contents">
                  <div className={`p-4 sm:p-5 font-medium text-foreground border-t border-border/30 ${i % 2 ? "bg-background/50" : ""}`}>{r.feature}</div>
                  <div className={`p-4 sm:p-5 text-center border-t border-border/30 ${i % 2 ? "bg-primary/[0.03]" : "bg-primary/[0.06]"}`}>
                    <span className="inline-flex items-start gap-1.5 text-foreground">
                      <Check size={15} className="text-accent mt-0.5 shrink-0" />
                      <span>{r.elite}</span>
                    </span>
                  </div>
                  <div className={`p-4 sm:p-5 text-center text-muted-foreground border-t border-border/30 ${i % 2 ? "bg-background/50" : ""}`}>
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
        </div>
      </section>

      {/* Three reasons — Housebox feature cards */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: PoundSterling, title: "Risk-free for landlords", desc: "No upfront advertising fees. If we don't place a tenant, you pay nothing — ever. Your money follows results, not promises." },
              { icon: Sparkles, title: "Actual AI matching", desc: "Instead of endless scrolling, our AI scores every property against real requirements — so the right tenants and homes find each other." },
              { icon: ShieldCheck, title: "Compliant & verified", desc: "Six-stage tenant referencing, ID checks, and Renters' Rights Act 2025-ready agreements built in. Fewer scams, more confidence." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="relative bg-background rounded-xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-border/40"
              >
                <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — navy */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-display text-4xl font-semibold text-white tracking-tight">
            Make the switch in <em className="text-accent not-italic">minutes</em>
          </h2>
          <p className="mt-4 text-white/70 max-w-xl mx-auto">
            List your property free, or let our AI match you to the perfect home. No upfront fees, no empty-room risk — just results.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-9">
            <Link href="/list-your-property">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 gap-2 px-8 shadow-lg shadow-accent/30 font-semibold">
                List Your Property <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 font-semibold">
                See Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
