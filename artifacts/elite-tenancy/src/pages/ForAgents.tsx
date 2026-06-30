import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, BarChart3, ShieldCheck, Layers, Bot, BadgeCheck, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

/**
 * B2B acquisition landing page for letting agencies.
 * Exploits the documented competitor gap: rival room sites offer agents
 * "no dedicated CRM, no performance analytics, no lead tracking".
 * Public, SEO-friendly, lead-gen — no auth changes.
 */

const FEATURES = [
  { icon: LayoutDashboard, title: "A real agent CRM", desc: "Track every enquiry, viewing, applicant and tenancy from one dashboard — not a list of ads you have to manage by hand." },
  { icon: BarChart3, title: "Performance analytics", desc: "See listing view counts, enquiry sources, response rates and conversion — full transparency most platforms simply don't give agents." },
  { icon: Layers, title: "Bulk multi-listing", desc: "Manage unlimited properties under one branded profile, with re-top and boost tools to keep your stock at the top." },
  { icon: Bot, title: "AI tenant matching", desc: "Our AI surfaces the best-fit applicants for each property automatically — your team stops scrolling and starts placing." },
  { icon: ShieldCheck, title: "Compliance built in", desc: "Renters' Rights Act 2025-ready agreements, 6-stage referencing and verified ID checks reduce your risk on every let." },
  { icon: BadgeCheck, title: "Verified-agent trust", desc: "Branded, Property-Ombudsman-aligned profiles so applicants know they're dealing with a professional — not a scam ad." },
];

export default function ForAgents() {
  useSeo({
    title: "Elite Tenancy for Letting Agents — CRM, Analytics & AI Matching",
    description: "The lettings platform built for UK agencies: a real CRM, performance analytics, bulk multi-listing, AI tenant matching and RRA 2025 compliance — everything room-ad sites don't give agents. Partner with Elite Tenancy.",
    canonical: "https://www.elitetenancy.co.uk/for-agents",
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.10),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
              For Letting Agencies
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
              The platform that treats agents like <span className="text-accent italic">professionals</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Most room sites give agencies a list of adverts and nothing else — no CRM, no analytics, no lead tracking. Elite Tenancy gives your agency a proper toolset: pipeline management, performance data, AI matching and built-in compliance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-9">
              <Link href="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  Partner with us <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">
                  See pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Everything agents actually need</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Built for the way agencies work</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35 }}
              className="bg-card border border-border/50 rounded-xl p-7 hover:border-primary/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={21} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why switch band */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-8">Why agencies are choosing Elite Tenancy</h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {[
              "Full lead pipeline & CRM — not just a wall of adverts",
              "Transparent analytics on every listing and enquiry",
              "AI matching that surfaces the right applicants first",
              "RRA 2025-compliant agreements and verified referencing",
              "Branded, trusted agency profiles that reduce scam risk",
              "Dedicated account support, 7 days a week",
            ].map((t) => (
              <div key={t} className="flex items-start gap-3 bg-card border border-border/50 rounded-lg px-4 py-3">
                <Check size={16} className="text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="font-serif text-4xl font-bold text-foreground">Bring your agency on board</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Tell us about your portfolio and we'll set you up with a branded agency profile, CRM access and AI matching. Get in touch and our partnerships team will be in contact.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/contact">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
              Become a partner agency <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/for-landlords">
            <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">
              I'm a private landlord
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
