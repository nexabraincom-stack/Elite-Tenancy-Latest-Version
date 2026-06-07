import { Link } from "wouter";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

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
    cta: "Get a tailored quote",
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

export default function Pricing() {
  useSeo({
    title: "Transparent Lettings Pricing | Elite Tenancy",
    description: "Honest, transparent lettings pricing. Elite Tenancy charges landlords only on successful completion. No hidden fees, no upfront costs.",
    canonical: "https://www.elitetenancy.co.uk/pricing",
  });
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Simple, honest pricing</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">No let, no fee. Always.</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Three plans. No hidden charges. We only earn when you do.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card border rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? "border-primary/50 ring-1 ring-primary/20"
                  : "border-border/50"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4">
                  Most Popular
                </Badge>
              )}
              {!plan.popular && (plan as { badge?: string }).badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4">
                  {(plan as { badge?: string }).badge}
                </Badge>
              )}
              <div className="mb-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">{plan.name}</h2>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-serif text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-sm text-muted-foreground mb-1">{plan.period}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1">
                {plan.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
                {plan.excludes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground/60 line-through">
                    <X size={14} className="mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="mt-8 block">
                <Button
                  size="lg"
                  className={`w-full gap-2 ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  {plan.cta} <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="mt-20">
          <h2 className="font-serif text-3xl font-bold text-foreground text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
