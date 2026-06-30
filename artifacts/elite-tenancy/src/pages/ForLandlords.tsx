import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, TrendingUp, Users, Clock, Star, ArrowRight, Home, Award, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const benefits = [
  { icon: Shield, title: "Zero Upfront Risk", desc: "We only invoice on successful completion. If we don't let your property, you don't pay." },
  { icon: Users, title: "Pre-Qualified Tenants", desc: "Every applicant undergoes our six-stage screening. Only the best reach your property." },
  { icon: Clock, title: "12-Day Average Turnaround", desc: "Professional photography and a curated tenant database mean minimal void periods." },
  { icon: TrendingUp, title: "Market-Leading Rents", desc: "Our data-driven pricing recommendations consistently achieve above-market rents for our landlords." },
  { icon: Star, title: "Dedicated Account Manager", desc: "Every landlord gets a named account manager who knows your property and your requirements." },
  { icon: CheckCircle2, title: "Full Legal Compliance", desc: "We keep you up to date with the latest lettings legislation, including the Renters' Rights Act 2025." },
];

const steps = [
  { step: "01", title: "Free Valuation", desc: "We remotely assess your property using listing details, market data, and comparable lettings to provide a realistic rental valuation." },
  { step: "02", title: "Professional Marketing", desc: "We arrange professional photography (via trusted local partners), write compelling copy, and list on all major portals plus our premium platform." },
  { step: "03", title: "Tenant Matching", desc: "We match applicants from our active tenant database before going to market, often letting within days." },
  { step: "04", title: "Rigorous Screening", desc: "Every applicant completes our six-stage screening process. We only progress those who meet your criteria." },
  { step: "05", title: "You Approve the Tenant", desc: "We present you with our recommendation and the full screening report. The final decision is always yours." },
  { step: "06", title: "Tenancy Setup", desc: "We guide you through preparing the AST, conducting Right to Rent checks (using GOV.UK share codes), and arranging deposit protection. Once the tenant moves in, we invoice." },
];

export default function ForLandlords() {
  useSeo({
    title: "Let Your Property with Elite Tenancy | For Landlords",
    description: "Let your UK property with Elite Tenancy. Completion-only fees, 12-day average turnaround, six-stage tenant screening. Zero upfront cost.",
    canonical: "https://www.elitetenancy.co.uk/for-landlords",
  });
  return (
    <PublicLayout>
      {/* Hero — full-bleed navy with gold accents */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary/80 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full mb-6">
              <Home size={13} /> For Landlords
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-[1.05] tracking-tight">
              Let smarter. Pay only on <em className="text-accent not-italic">success</em>.
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-xl">
              We are the only UK lettings agent that charges nothing until your property lets. No upfront marketing fees. No admin fees. Just results.
            </p>
            <div className="flex flex-wrap gap-4 mt-9">
              <Link href="/valuation">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 gap-2 shadow-lg shadow-accent/30 font-semibold">
                  Get a Free Valuation <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-semibold">
                  View Our Pricing
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero stats */}
          <div className="flex flex-wrap gap-12 mt-14 pt-8 border-t border-white/15">
            {[
              { num: "12", unit: "days", label: "Average let time" },
              { num: "£0", unit: "", label: "Upfront cost" },
              { num: "98%", unit: "", label: "Landlord satisfaction" },
              { num: "6", unit: "-stage", label: "Tenant screening" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-semibold text-accent leading-none tracking-tight">
                  {s.num}<span className="text-lg text-white/60">{s.unit}</span>
                </div>
                <div className="text-xs text-white/55 mt-2 tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits — Housebox feature cards with navy icon boxes */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Why choose us
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              The Elite Tenancy <em className="text-accent not-italic">Advantage</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benefits.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative bg-card rounded-xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-border/40"
              >
                <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <span className="absolute top-6 right-7 font-display text-[42px] font-bold text-border/40 leading-none select-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — timeline steps */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              The process
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Six Steps to a Successful <em className="text-accent not-italic">Let</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {steps.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="relative bg-background rounded-xl p-7 shadow-sm border border-border/40 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <span className="font-display text-[42px] font-bold text-accent/15 absolute top-5 right-6 leading-none select-none">
                  {step}
                </span>
                <div className="w-9 h-9 rounded-lg bg-primary text-accent text-sm font-semibold flex items-center justify-center mb-4 font-display">
                  {step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 pr-12 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial — Housebox quote card */}
      <section className="bg-background py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-card rounded-2xl p-10 md:p-14 shadow-sm text-center border border-border/40">
            <span className="absolute top-6 left-8 font-display text-[120px] text-accent/10 leading-none select-none">&ldquo;</span>
            <div className="flex justify-center gap-1 mb-6 relative z-10">
              {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-accent text-accent" />)}
            </div>
            <blockquote className="relative z-10 font-display text-xl md:text-2xl text-foreground leading-relaxed font-medium tracking-tight">
              Elite Tenancy let my Ancoats apartment in nine days — three days faster than my previous agent managed in <em className="text-accent not-italic">nine weeks</em>. The quality of the tenant and the professionalism throughout was exceptional.
            </blockquote>
            <div className="flex items-center justify-center gap-3 mt-8 relative z-10">
              <div className="w-11 h-11 rounded-full bg-primary text-accent font-display text-sm font-semibold flex items-center justify-center">
                RA
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-foreground">Richard A.</div>
                <div className="text-xs text-muted-foreground tracking-wide">Portfolio Landlord — Manchester</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-primary rounded-xl p-5 flex items-center justify-between gap-5 flex-wrap text-white/80 text-[11px] font-semibold uppercase tracking-[0.12em]">
          {[
            { icon: Award, text: "Property Ombudsman Member" },
            { icon: Shield, text: "ICO Registered" },
            { icon: Scale, text: "RRA 2025 Compliant" },
            { icon: CheckCircle2, text: "Client Money Protected" },
          ].map(({ icon: Ic, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Ic size={14} className="text-accent" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — navy background */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-display text-4xl font-semibold text-white mb-4 tracking-tight">
            Ready to let with Elite Tenancy?
          </h2>
          <p className="text-white/70 mb-9 max-w-xl mx-auto">
            Book your free valuation today. No obligation, no upfront cost.
          </p>
          <Link href="/valuation">
            <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-10 shadow-lg shadow-accent/30 font-semibold">
              Book a Free Valuation
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
