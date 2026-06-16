import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, TrendingUp, Users, Clock, Star, ArrowRight } from "lucide-react";
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
  { step: "01", title: "Free Valuation", desc: "We assess your property remotely — using your photos, local comparables and live market data — and give you a realistic, data-backed assessment of achievable rent, plus advice on presentation and pricing." },
  { step: "02", title: "Professional Marketing", desc: "We arrange professional photography, write compelling copy, and list on all major portals plus our own premium platform." },
  { step: "03", title: "Tenant Matching", desc: "We match applicants from our active tenant database before going to market, often letting within days." },
  { step: "04", title: "Rigorous Screening", desc: "Every applicant completes our six-stage screening process. We only progress those who meet your criteria." },
  { step: "05", title: "Tenancy Setup", desc: "We prepare the AST, guide you through the Right to Rent check, arrange deposit protection, and issue all prescribed information." },
  { step: "06", title: "Completion & Payment", desc: "Once the tenancy commences, we issue our invoice. No let — no fee." },
];

export default function ForLandlords() {
  useSeo({
    title: "Let Your Property with Elite Tenancy | For Landlords",
    description: "Let your UK property with Elite Tenancy. Completion-only fees, 12-day average turnaround, six-stage tenant screening. Zero upfront cost.",
    canonical: "https://www.elitetenancy.co.uk/for-landlords",
  });
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-4">For Landlords</p>
            <h1 className="font-serif text-5xl font-bold text-foreground leading-tight">
              Let smarter. Pay only on success.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              We are the only UK lettings agent that charges nothing until your property lets. No upfront marketing fees. No admin fees. Just results.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/valuation">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Get a Free Valuation <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-border/60">
                  View Our Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Why choose us</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">The Elite Tenancy Advantage</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works for landlords */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">The process</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Six Steps to a Successful Let</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative bg-card border border-border/50 rounded-xl p-6">
                <span className="font-serif text-4xl font-bold text-primary/20 absolute top-4 right-5">{step}</span>
                <h3 className="font-semibold text-foreground mb-2 pr-12">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-10">
          <div className="flex justify-center gap-1 mb-6">
            {[1,2,3,4,5].map(i => <Star key={i} size={18} className="fill-primary text-primary" />)}
          </div>
          <blockquote className="font-serif text-xl text-foreground leading-relaxed italic">
            "Elite Tenancy let my Ancoats apartment in nine days — three days faster than my previous agent managed in nine weeks. The quality of the tenant and the professionalism throughout the process was exceptional. I wouldn't use anyone else."
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground font-medium">Richard A., Portfolio Landlord — Manchester</p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            Ready to let with Elite Tenancy?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Book your free valuation today. No obligation, no upfront cost.
          </p>
          <Link href="/valuation">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10">
              Book a Free Valuation
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
