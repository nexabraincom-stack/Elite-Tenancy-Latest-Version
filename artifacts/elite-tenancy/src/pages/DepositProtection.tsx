import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const SCHEMES = [
  {
    name: "Deposit Protection Service (DPS)",
    type: "Custodial (free) + Insured",
    deadline: "30 days from receipt",
    url: "https://www.depositprotection.com",
    note: "Government-backed; free custodial option holds deposit in a ring-fenced account.",
  },
  {
    name: "Tenancy Deposit Scheme (TDS)",
    type: "Custodial (free) + Insured",
    deadline: "30 days from receipt",
    url: "https://www.tenancydepositscheme.com",
    note: "Operates both custodial and insured; widely used by letting agents.",
  },
  {
    name: "MyDeposits",
    type: "Insured",
    deadline: "30 days from receipt",
    url: "https://www.mydeposits.co.uk",
    note: "Landlord retains deposit funds; pays insurance premium to protect.",
  },
];

const TIMELINE = [
  { day: "Day 0", event: "Tenant pays deposit" },
  { day: "Day 1–30", event: "Landlord must protect deposit in an approved scheme" },
  { day: "Day 1–30", event: "Landlord must serve Prescribed Information on tenant" },
  { day: "End of tenancy", event: "Landlord and tenant agree on any deductions" },
  { day: "10 days after agreement", event: "Deposit (or agreed balance) returned to tenant" },
  { day: "If disputed", event: "Free Alternative Dispute Resolution (ADR) via the scheme" },
];

const FAQS = [
  {
    q: "How much deposit can a landlord take in 2026?",
    a: "Under the Tenant Fees Act 2019 (which remains in force under the Renters' Rights Act 2025), the deposit cap is five weeks' rent for properties with annual rent under £50,000. For annual rent of £50,000 or more, the cap is six weeks' rent. A landlord cannot legally charge more.",
  },
  {
    q: "How long does a landlord have to protect a deposit?",
    a: "A landlord must protect the deposit in a government-approved scheme within 30 days of receiving it. The same 30-day deadline applies to serving the Prescribed Information on the tenant.",
  },
  {
    q: "What are the three government-approved deposit protection schemes?",
    a: "The three approved schemes are: Deposit Protection Service (DPS), Tenancy Deposit Scheme (TDS), and MyDeposits. All three offer a free Alternative Dispute Resolution (ADR) service if there is a dispute at the end of the tenancy.",
  },
  {
    q: "What happens if a landlord does not protect the deposit?",
    a: "If a landlord fails to protect the deposit within 30 days, or fails to serve the Prescribed Information, the tenant can apply to court. The court may order the landlord to repay between one and three times the deposit amount as a penalty. The landlord also loses the ability to serve a Section 8 notice for rent arrears until the deposit is properly protected.",
  },
  {
    q: "What is the difference between custodial and insured deposit protection?",
    a: "In a custodial scheme, the deposit is held by the scheme in a ring-fenced account — completely free for landlords. In an insured scheme, the landlord keeps the deposit money but pays a premium to insure it. Most landlords who manage their own properties use the custodial DPS due to its zero cost.",
  },
  {
    q: "Does the Renters' Rights Act 2025 change deposit protection rules?",
    a: "The Renters' Rights Act 2025 does not change the deposit protection rules directly — the five-week cap, 30-day deadline, and approved schemes remain the same. However, the Act abolishes fixed-term tenancies in favour of periodic tenancies, which means deposits are protected for longer continuous periods.",
  },
  {
    q: "What is Prescribed Information?",
    a: "Prescribed Information is a legally required document the landlord must serve on the tenant (and any relevant person who contributed to the deposit) within 30 days of receiving the deposit. It must include: the name and address of the scheme, details of the deposit amount and property, the process for raising a dispute, and the scheme's leaflet.",
  },
];

export default function DepositProtection() {
  useSeo({
    title: "Deposit Protection UK 2026 — Schemes, Caps & Rules | Elite Tenancy",
    description:
      "UK tenancy deposit protection explained: the 5-week cap, 30-day deadline, DPS vs TDS vs MyDeposits, Prescribed Information, and penalties for non-compliance. Updated for 2026.",
    canonical: "https://www.elitetenancy.co.uk/deposit-protection",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Tenancy Deposit Protection",
    description:
      "Tenancy deposit protection is a legal requirement in England and Wales under the Housing Act 2004 (as amended). Landlords must protect a tenant's deposit in a government-approved scheme within 30 days of receipt and serve Prescribed Information on the tenant. The deposit cap is five weeks' rent for annual rent under £50,000.",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "UK Lettings Terminology",
      url: "https://www.elitetenancy.co.uk/deposit-protection",
    },
    url: "https://www.elitetenancy.co.uk/deposit-protection",
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Tenancy Deposit Protection UK 2026: Rules, Schemes, and Caps",
    description:
      "Complete guide to UK tenancy deposit protection: five-week cap, 30-day protection deadline, the three approved schemes (DPS, TDS, MyDeposits), Prescribed Information requirements, and penalties for non-compliance.",
    datePublished: "2026-06-26",
    dateModified: "2026-06-26",
    author: { "@type": "Organization", name: "Elite Tenancy", url: "https://www.elitetenancy.co.uk" },
    publisher: {
      "@type": "Organization",
      name: "Elite Tenancy",
      url: "https://www.elitetenancy.co.uk",
      logo: { "@type": "ImageObject", url: "https://www.elitetenancy.co.uk/logo.png" },
    },
    mainEntityOfPage: "https://www.elitetenancy.co.uk/deposit-protection",
    about: {
      "@type": "Legislation",
      name: "Housing Act 2004 — Tenancy Deposit Protection",
      jurisdiction: "England and Wales",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
      { "@type": "ListItem", position: 2, name: "Deposit Protection", item: "https://www.elitetenancy.co.uk/deposit-protection" },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-primary border-b border-accent/20 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-3">Landlords & Tenants</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Tenancy deposit protection UK 2026
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Every landlord in England and Wales must protect a tenant's deposit in a government-approved scheme within
            30 days. Here is everything you need to know — the five-week cap, the three schemes, and what happens if
            the rules are broken.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Definition callout */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 my-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-1">Definition</h2>
              <p className="text-foreground text-sm leading-relaxed">
                <strong>Tenancy deposit protection</strong> is a legal requirement under the Housing Act 2004 (as amended by
                the Localism Act 2011). Within 30 days of receiving a deposit, a landlord must register it with one of
                three government-approved schemes <em>and</em> serve Prescribed Information on the tenant.
              </p>
            </div>
          </div>
        </div>

        {/* Deposit cap */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-4">How much deposit can a landlord take?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            The Tenant Fees Act 2019 introduced a deposit cap that remains in force in 2026:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Annual rent under £50,000</p>
              <p className="text-3xl font-bold text-accent mb-1">5 weeks</p>
              <p className="text-sm text-muted-foreground">Maximum deposit = 5 × (monthly rent × 12 ÷ 52)</p>
            </div>
            <div className="bg-white border border-border rounded-xl p-5 shadow-sm">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Annual rent £50,000 or more</p>
              <p className="text-3xl font-bold text-accent mb-1">6 weeks</p>
              <p className="text-sm text-muted-foreground">Maximum deposit = 6 × (monthly rent × 12 ÷ 52)</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Example: £1,200/month rent → annual rent £14,400 → maximum deposit = 5 × (£1,200 × 12 ÷ 52) = £1,384.62
          </p>
        </section>

        {/* The 3 schemes */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-4">The three approved deposit protection schemes</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            Landlords must use one of these three government-approved schemes. All three offer a free
            Alternative Dispute Resolution (ADR) service at the end of the tenancy.
          </p>
          <div className="space-y-4">
            {SCHEMES.map(({ name, type, deadline, note }) => (
              <div key={name} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                  <span className="flex-shrink-0 text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-0.5">
                    {type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Deadline: {deadline}</p>
                <p className="text-xs text-muted-foreground">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-5">Deposit protection timeline</h2>
          <div className="space-y-3">
            {TIMELINE.map(({ day, event }, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-xs font-semibold text-accent">{day}</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-accent mt-1.5" />
                  <p className="text-sm text-foreground">{event}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prescribed Information */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-4">What is Prescribed Information?</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Within 30 days of receiving the deposit, the landlord must serve Prescribed Information on the tenant
            (and any third party who paid part of the deposit, such as a guarantor). It must include:
          </p>
          <ul className="space-y-2">
            {[
              "The address of the rented property",
              "The amount of the deposit",
              "Name and contact details of the protection scheme",
              "The scheme's dispute resolution procedure",
              "The scheme's information leaflet",
              "Circumstances under which deductions can be made",
              "How to apply for the deposit at the end of the tenancy",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Penalties */}
        <section className="mb-12">
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-2">Penalties for not protecting a deposit</h2>
                <p className="text-sm text-foreground leading-relaxed mb-3">
                  If a landlord fails to protect the deposit within 30 days, or fails to serve Prescribed Information,
                  the tenant can apply to the county court. The court <strong>must</strong> order:
                </p>
                <ul className="space-y-1.5 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">→</span>
                    The landlord to return the deposit or pay it into a scheme
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">→</span>
                    A penalty of between 1× and 3× the deposit amount
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 font-bold flex-shrink-0">→</span>
                    The landlord cannot serve a valid Section 8 notice until the deposit is protected
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-5">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map(({ q, a }, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-muted transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-foreground">{q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                    <p className="pt-3">{a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white tracking-tight mb-1">Find a tenant with deposit protection included</h3>
            <p className="text-muted-foreground text-sm">
              Elite Tenancy handles Right to Rent checks, referencing, and deposit compliance guidance as part of the
              introduction — for a one-off fee of two weeks' rent.
            </p>
          </div>
          <a
            href="/list-your-property"
            className="flex-shrink-0 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
          >
            List your property
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
