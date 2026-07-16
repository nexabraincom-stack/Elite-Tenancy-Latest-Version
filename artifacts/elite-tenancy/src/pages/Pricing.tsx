import { Link } from "wouter";
import { CheckCircle2, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";
import { useJsonLd } from "@/hooks/use-json-ld";

const plans = [
  {
    name: "Introduction Only",
    price: "2 weeks'",
    period: "rent — per successful let",
    description: "We find you an exceptional tenant. You manage the tenancy yourself.",
    popular: false,
    includes: [
      "Professional property photography",
      "Premium listing on all major portals",
      "Active tenant database matching",
      "Six-stage tenant screening",
      "Right to Rent verification",
      "Tenancy Agreement preparation",
      "Deposit protection setup",
      "Prescribed information pack",
      "Dedicated account manager",
      "No let — no fee guarantee",
    ],
    excludes: [
      "Ongoing property management",
      "Rent collection",
      "Maintenance coordination",
      "Periodic inspections",
    ],
    cta: "Get Started",
    href: "/valuation",
  },
  {
    name: "Smart Managed",
    price: "3–5%",
    period: "of monthly rent — tailored",
    description: "Our lightest-touch managed plan with rent collection, at our lowest commission. Your rate is set to your portfolio — the more you list, the less you pay.",
    popular: false,
    badge: "New",
    includes: [
      "Everything in Introduction Only",
      "Monthly rent collection & statements",
      "Automated rent reminders & chasing",
      "Adjustable 3–5% rate to suit your portfolio",
      "Deposit handling & protection",
      "Tenant support line",
      "Annual compliance updates",
      "Dedicated account manager",
    ],
    excludes: [
      "Maintenance coordination",
      "Quarterly property inspections",
    ],
    cta: "Get a Tailored Quote",
    href: "/contact",
  },
  {
    name: "Premium Managed",
    price: "8%",
    period: "of monthly rent collected",
    description: "We take care of everything — from finding the perfect tenant to managing the property day to day.",
    popular: true,
    includes: [
      "Everything in Introduction Only",
      "Ongoing property management",
      "Monthly rent collection & statements",
      "Maintenance coordination & oversight",
      "Quarterly property inspections",
      "Annual rent review & market appraisal",
      "24/7 tenant emergency line",
      "Tenancy renewal negotiations",
      "End of tenancy deposit handling",
      "Full legal compliance updates",
    ],
    excludes: [],
    cta: "Talk to Us",
    href: "/contact",
  },
];

const faqs = [
  {
    q: "How does the Smart Managed 3–5% rate work?",
    a: "Smart Managed is our lightest-touch managed plan with rent collection at our lowest commission. Your exact rate sits between 3% and 5% and is tailored to your portfolio — the more properties you list with us, the lower your rate. Request a tailored quote and we'll confirm your rate in writing before you commit."
  },
  {
    q: "When is payment due?",
    a: "For Introduction Only, our fee — equivalent to two weeks' rent — is due on the commencement date of the tenancy. For Smart Managed and Premium Managed, our commission is deducted from the rent before payment is made to you each month."
  },
  {
    q: "What if the property doesn't let?",
    a: "You pay nothing. We only charge on successful completion. We cover all marketing costs including photography and portal listings regardless of outcome."
  },
  {
    q: "Are there any additional fees?",
    a: "No. The price you see is the price you pay. No admin fees, no renewal fees, no exit fees."
  },
  {
    q: "Can I switch between plans?",
    a: "Yes. You can move from Introduction Only to Premium Managed (or vice versa) at any tenancy renewal. Speak to your account manager."
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": a,
    },
  })),
};

export default function Pricing() {
  useSeo({
    title: "Transparent Lettings Pricing | Elite Tenancy",
    description: "Honest, transparent lettings pricing. Elite Tenancy charges landlords only on successful completion. No hidden fees, no upfront costs.",
    canonical: "https://www.elitetenancy.co.uk/pricing",
  });
  useJsonLd("pricing-faq", faqSchema);
  return (
    <PublicLayout>
      {/* Hero — navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
            Simple, honest pricing
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white mt-6 tracking-tight leading-[1.05]">
            No let, no fee. <em className="text-accent not-italic">Always</em>.
          </h1>
          <p className="text-white/70 max-w-xl mx-auto mt-5 text-lg">
            Three plans. No hidden charges. We only earn when you do.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-xl flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
                  plan.popular
                    ? "border-2 border-accent ring-1 ring-accent/20"
                    : "border border-border/50"
                }`}
              >
                {plan.popular && (
                  <div className="bg-accent text-white text-center text-[11px] font-semibold uppercase tracking-[0.12em] py-2">
                    <Sparkles size={12} className="inline mr-1.5 -mt-0.5" />
                    Most Popular
                  </div>
                )}
                {!plan.popular && (plan as { badge?: string }).badge && (
                  <Badge className="absolute top-4 right-4 bg-accent/15 text-accent border-accent/30 text-[10px] font-semibold uppercase tracking-wider">
                    {(plan as { badge?: string }).badge}
                  </Badge>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">{plan.name}</h2>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="font-display text-4xl font-semibold text-primary tracking-tight">{plan.price}</span>
                    <span className="text-sm text-muted-foreground mb-1.5">{plan.period}</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>

                  <div className="mt-7 pt-7 border-t border-border/50 flex-1">
                    <ul className="space-y-3">
                      {plan.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                          <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                      {plan.excludes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through">
                          <X size={14} className="mt-0.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href={plan.href} className="mt-8 block">
                    <Button
                      size="lg"
                      className={`w-full gap-2 font-semibold ${
                        plan.popular
                          ? "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                      }`}
                    >
                      {plan.cta} <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Same rent, three ways — a common-unit comparison since the three plans are priced in different units */}
      <section className="bg-background border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Worked example
            </span>
            <h2 className="font-display text-3xl font-semibold text-foreground mt-4 tracking-tight">
              Same rent, three ways
            </h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
              The three plans are priced in different units, so here's one example property — £1,300/month rent —
              shown side by side.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Introduction Only</p>
              <p className="font-display text-3xl font-semibold text-primary">£600</p>
              <p className="text-xs text-muted-foreground mt-1">one-time, on successful let</p>
              <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/40">≈ £50/mo if spread across a 12-month tenancy</p>
            </div>
            <div className="bg-card border-2 border-border/50 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Smart Managed</p>
              <p className="font-display text-3xl font-semibold text-primary">£39–65</p>
              <p className="text-xs text-muted-foreground mt-1">per month, for as long as managed</p>
              <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/40">3–5% of £1,300/month rent</p>
            </div>
            <div className="bg-card border-2 border-accent/40 rounded-xl p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Premium Managed</p>
              <p className="font-display text-3xl font-semibold text-primary">£104</p>
              <p className="text-xs text-muted-foreground mt-1">per month, for as long as managed</p>
              <p className="text-xs text-muted-foreground/70 mt-3 pt-3 border-t border-border/40">8% of £1,300/month rent</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-6">
            Illustrative only — your actual rent, portfolio size, and rate will differ. Get a tailored quote for your property.
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-card border-t border-border/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              FAQs
            </span>
            <h2 className="font-display text-3xl font-semibold text-foreground mt-4 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-background border border-border/40 rounded-xl p-6 shadow-sm">
                <h3 className="font-display font-semibold text-foreground mb-2 tracking-tight">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold text-white tracking-tight mb-4">
            Still have questions?
          </h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">
            Our team is here to help. Get in touch and we'll find the right plan for your portfolio.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-8 font-semibold shadow-lg shadow-accent/30">
                Contact Us
              </Button>
            </Link>
            <Link href="/valuation">
              <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-8 font-semibold">
                Free Valuation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
