import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, BarChart3, ShieldCheck, Layers, Bot, BadgeCheck, Check, Award, Scale, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const FEATURES = [
  { icon: LayoutDashboard, title: "A Real Agent CRM", desc: "Track every enquiry, viewing, applicant and tenancy from one dashboard — not a list of ads you have to manage by hand." },
  { icon: BarChart3, title: "Performance Analytics", desc: "See listing view counts, enquiry sources, response rates and conversion — full transparency most platforms simply don't give agents." },
  { icon: Layers, title: "Bulk Multi-Listing", desc: "Manage unlimited properties under one branded profile, with re-top and boost tools to keep your stock at the top." },
  { icon: Bot, title: "AI Tenant Matching", desc: "Our AI surfaces the best-fit applicants for each property automatically — your team stops scrolling and starts placing." },
  { icon: ShieldCheck, title: "Compliance Built In", desc: "Renters' Rights Act 2025-ready agreements, 6-stage referencing and verified ID checks reduce your risk on every let." },
  { icon: BadgeCheck, title: "Verified-Agent Trust", desc: "Branded, Property-Ombudsman-aligned profiles so applicants know they're dealing with a professional — not a scam ad." },
];

const CHECKLIST = [
  "Full lead pipeline & CRM — not just a wall of adverts",
  "Transparent analytics on every listing and enquiry",
  "AI matching that surfaces the right applicants first",
  "RRA 2025-compliant agreements and verified referencing",
  "Branded, trusted agency profiles that reduce scam risk",
  "Dedicated account support, 7 days a week",
];

export default function ForAgents() {
  useSeo({
    title: "Elite Tenancy for Letting Agents — CRM, Analytics & AI Matching",
    description: "The lettings platform built for UK agencies: a real CRM, performance analytics, bulk multi-listing, AI tenant matching and RRA 2025 compliance — everything room-ad sites don't give agents. Partner with Elite Tenancy.",
    canonical: "https://www.elitetenancy.co.uk/for-agents",
  });

  return (
    <PublicLayout>
      {/* Hero — full-bleed navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
              <Building2 size={13} /> For Letting Agencies
            </span>
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white leading-[1.05] tracking-tight mt-7">
              The platform that treats agents like <em className="text-accent not-italic">professionals</em>
            </h1>
            <p className="mt-6 text-lg text-white/75 max-w-2xl mx-auto leading-relaxed">
              Most room sites give agencies a list of adverts and nothing else — no CRM, no analytics, no lead tracking. Elite Tenancy gives your agency a proper toolset: pipeline management, performance data, AI matching and built-in compliance.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-9">
              <Link href="/contact">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 gap-2 px-8 shadow-lg shadow-accent/30 font-semibold">
                  Partner with us <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 font-semibold">
                  See pricing
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature grid — Housebox cards with navy icon boxes */}
      <section className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Everything agents actually need
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Built for the way agencies <em className="text-accent not-italic">work</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
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

      {/* Why switch — checklist on navy background */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="font-display text-3xl font-semibold text-white text-center mb-10 tracking-tight">
            Why agencies are choosing <em className="text-accent not-italic">Elite Tenancy</em>
          </h2>
          <div className="space-y-3 max-w-2xl mx-auto">
            {CHECKLIST.map((t) => (
              <div key={t} className="flex items-start gap-3 bg-white/8 backdrop-blur-sm border border-white/10 rounded-xl px-5 py-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={14} className="text-accent" />
                </div>
                <span className="text-sm text-white/90 font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-card rounded-xl p-5 flex items-center justify-between gap-5 flex-wrap text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.12em] border border-border/40 shadow-sm">
            {[
              { icon: Award, text: "Property Ombudsman Member" },
              { icon: ShieldCheck, text: "ICO Registered" },
              { icon: Scale, text: "RRA 2025 Compliant" },
              { icon: BadgeCheck, text: "Verified Agent Network" },
            ].map(({ icon: Ic, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Ic size={14} className="text-accent" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-2xl border border-border/40 shadow-sm p-12 md:p-16">
            <h2 className="font-display text-4xl font-semibold text-foreground tracking-tight">
              Bring your agency <em className="text-accent not-italic">on board</em>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Tell us about your portfolio and we'll set you up with a branded agency profile, CRM access and AI matching. Get in touch and our partnerships team will be in contact.
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-9">
              <Link href="/contact">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8 font-semibold">
                  Become a partner agency <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/for-landlords">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8 font-semibold">
                  I'm a private landlord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
