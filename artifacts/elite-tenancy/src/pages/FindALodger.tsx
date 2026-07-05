import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, Home, Scale, PoundSterling } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const FAQS = [
  {
    q: "What's the difference between a lodger and a tenant?",
    a: "A lodger shares your home and doesn't have exclusive possession of any room — legally they're an \"excluded occupier\" under the Protection from Eviction Act 1977, with no security of tenure. A tenant, by contrast, has an assured periodic tenancy with much stronger legal protection. This matters: a lodger arrangement doesn't need deposit protection, and you can ask a lodger to leave with reasonable notice, without a court order.",
  },
  {
    q: "Do I need my landlord's permission to take in a lodger?",
    a: "If you rent your home rather than own it, yes — you need written consent from your landlord. Under the Renters' Rights Act 2026, your landlord can't unreasonably refuse, but they can still decline for genuine reasons (for example, if it would breach their mortgage or insurance terms). Elite Tenancy captures this consent request and decision in-app, so there's a clear record either way.",
  },
  {
    q: "How much can I earn tax-free from a lodger?",
    a: "Under the Rent a Room Scheme, you can earn up to £7,500 a year completely tax-free from letting out furnished accommodation in your only or main home — including rent and any contribution toward bills, meals or cleaning. If your income is below that threshold, the exemption is automatic; you don't need to register for anything.",
  },
  {
    q: "What happens if I want the lodger to leave?",
    a: "Because a lodger is an excluded occupier, you don't need a court order to end the arrangement — reasonable notice matching the rent period (e.g. one month for a monthly rent) is generally enough, provided your licence agreement doesn't specify something different.",
  },
  {
    q: "Can I charge a deposit?",
    a: "Yes, and unlike a full tenancy deposit, a lodger's deposit doesn't need to be protected in a government-approved scheme — though it's good practice to document the amount and any deductions clearly in your licence agreement.",
  },
];

export default function FindALodger() {
  useSeo({
    title: "Find a Lodger UK 2026 — Consent, Agreement & Rent a Room Scheme | Elite Tenancy",
    description:
      "Taking in a lodger in the UK? Get your landlord's written consent recorded properly, generate a lodger licence agreement, and see how the £7,500 tax-free Rent a Room Scheme works.",
    canonical: "https://www.elitetenancy.co.uk/find-a-lodger",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
      { "@type": "ListItem", position: 2, name: "Find a Lodger", item: "https://www.elitetenancy.co.uk/find-a-lodger" },
    ],
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Lodger Licence",
    description:
      "A lodger licence is an agreement allowing someone to share a resident tenant's or homeowner's home. The lodger is an excluded occupier under the Protection from Eviction Act 1977 and has no security of tenure, unlike a tenancy.",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "UK Lettings Terminology",
      url: "https://www.elitetenancy.co.uk/find-a-lodger",
    },
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-primary border-b border-accent/20 py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-3">For Tenants &amp; Homeowners</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Find a lodger — the right way
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Earn up to £7,500 a year completely tax-free by taking in a lodger. If you rent your home, we'll help you get
            your landlord's consent on record — then generate a proper lodger licence agreement in minutes.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Definition callout */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 my-8">
          <div className="flex items-start gap-3">
            <Home className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-1">A lodger is not a tenant</h2>
              <p className="text-foreground text-sm leading-relaxed">
                A lodger shares your home rather than renting a separate property. Legally they're an <strong>excluded
                occupier</strong> — no security of tenure, no deposit-protection requirement, and you can end the
                arrangement with reasonable notice, not a court order.
              </p>
            </div>
          </div>
        </div>

        {/* Rent a Room Scheme */}
        <div className="my-10">
          <div className="flex items-start gap-3 mb-4">
            <PoundSterling className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">£7,500 a year, tax-free</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The government's <strong>Rent a Room Scheme</strong> lets you earn up to £7,500 a year completely tax-free from
            letting furnished accommodation in your only or main home — that includes rent plus any contribution toward
            bills, meals or cleaning. If you're below the threshold, the exemption is automatic; nothing to register.
          </p>
        </div>

        {/* If you rent — consent process */}
        <div className="my-10">
          <div className="flex items-start gap-3 mb-4">
            <Scale className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">If you rent: get consent on record</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Taking in a lodger without your landlord's permission can put you in breach of your own tenancy. Since the{" "}
            <Link href="/blog/renters-rights-act-2026-tenant-guide" className="text-accent hover:underline">Renters' Rights Act 2026</Link>,
            your landlord can't unreasonably refuse — but they can still say no for genuine reasons. Elite Tenancy's{" "}
            <Link href="/tenant/lodger" className="text-accent hover:underline">Take in a Lodger</Link> tool sends your
            landlord a consent request and records their decision, so there's no ambiguity for either side.
          </p>
          <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
            <li>Tell us about your lodger and the room — we send your landlord a written consent request</li>
            <li>Your landlord approves or declines, with an optional note, all recorded in your account</li>
            <li>Once approved, generate your lodger licence agreement — with Rent a Room Scheme guidance built in</li>
          </ol>
        </div>

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 my-10 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">Ready to take in a lodger?</h2>
          <p className="text-muted-foreground text-sm mb-4">Free to use — sign in to your tenant dashboard to get started.</p>
          <Link href="/tenant/lodger">
            <span className="inline-block bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              Take in a lodger
            </span>
          </Link>
        </div>

        {/* FAQ */}
        <div className="my-10">
          <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-4">Frequently asked questions</h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="flex-shrink-0 text-muted-foreground" /> : <ChevronDown size={16} className="flex-shrink-0 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
