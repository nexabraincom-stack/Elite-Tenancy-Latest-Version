import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, ShieldCheck, Scale, Home } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetListings } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

const FAQS = [
  {
    q: "What does \"DSS accepted\" mean?",
    a: "\"DSS\" is the old name for the Department of Social Security, which stopped existing in 2001 — but it's still the term most tenants and landlords use to mean a property where the landlord will consider tenants who receive Universal Credit or Housing Benefit toward their rent.",
  },
  {
    q: "Is it legal for a landlord to refuse DSS tenants in 2026?",
    a: "No. Since 1 May 2026, the Renters' Rights Act 2025 makes it explicitly illegal for landlords or letting agents to operate a blanket \"No DSS\" policy, advertise as such, or automatically reject applicants because they receive benefits. Penalties run from £7,000 for a first breach to £40,000 for repeat offences. Landlords can still assess individual affordability and references — see our full guide on what's banned and what's still allowed.",
  },
  {
    q: "Can a landlord still ask for a guarantor if I'm on Universal Credit?",
    a: "Yes — asking for a guarantor or running standard credit and reference checks is fine, provided the same standard is applied to every applicant regardless of income source. What's illegal is an automatic rejection based purely on benefit status.",
  },
  {
    q: "Will claiming Universal Credit hurt my application?",
    a: "It shouldn't, if a landlord is following the law. Universal Credit direct payments (Alternative Payment Arrangements) can also be arranged so your housing element goes straight to the landlord, which often makes an application easier to approve.",
  },
  {
    q: "How do I find DSS-friendly landlords near me?",
    a: "Use the filter below to search live Elite Tenancy listings where the landlord has explicitly marked their property as accepting DSS/benefits — updated as landlords list new homes. You can also browse by city using our rooms to rent pages.",
  },
];

export default function DssAcceptedHousing() {
  useSeo({
    title: "DSS Accepted Properties UK 2026 — Rooms & Homes for Benefits Tenants | Elite Tenancy",
    description:
      "Find DSS accepted rooms, flats and houses to rent across the UK. Landlords who welcome Universal Credit and Housing Benefit tenants — plus your legal rights under the Renters' Rights Act 2026.",
    canonical: "https://www.elitetenancy.co.uk/dss-accepted-housing",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: listings, isLoading } = useGetListings({ dssAccepted: true });

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
      { "@type": "ListItem", position: 2, name: "DSS Accepted Housing", item: "https://www.elitetenancy.co.uk/dss-accepted-housing" },
    ],
  };

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "DSS Accepted",
    description:
      "\"DSS accepted\" describes a rental property where the landlord will consider tenants who receive Universal Credit or Housing Benefit. Refusing tenants purely on this basis has been explicitly illegal under the Renters' Rights Act 2025 since 1 May 2026.",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "UK Lettings Terminology",
      url: "https://www.elitetenancy.co.uk/dss-accepted-housing",
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
          <p className="text-accent text-sm font-semibold tracking-wide uppercase mb-3">Tenants on Universal Credit &amp; Housing Benefit</p>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            DSS accepted properties across the UK
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            Rooms, flats and houses from landlords who welcome tenants on Universal Credit or Housing Benefit —
            plus what the law actually says about your rights since "No DSS" became illegal.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Definition callout */}
        <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 my-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight mb-1">What "DSS accepted" means</h2>
              <p className="text-foreground text-sm leading-relaxed">
                "DSS" is short for the old Department of Social Security — the term has stuck even though it hasn't existed
                since 2001. A <strong>"DSS accepted"</strong> property simply means the landlord will consider your application
                if some or all of your rent is covered by Universal Credit or Housing Benefit.
              </p>
            </div>
          </div>
        </div>

        {/* Legal rights section */}
        <div className="my-10">
          <div className="flex items-start gap-3 mb-4">
            <Scale className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">Your legal rights since 1 May 2026</h2>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            The <Link href="/blog/renters-rights-act-2026-tenant-guide" className="text-accent hover:underline">Renters' Rights Act 2026</Link> made
            it explicitly illegal for a landlord or letting agent to run a blanket "No DSS" policy, advertise a property
            that way, or automatically reject an applicant because they receive benefits. Penalties run from
            £7,000 for a first breach up to £40,000 for repeat offences — read our full breakdown of{" "}
            <Link href="/blog/no-dss-illegal-2026-benefits-tenants-landlord-guide" className="text-accent hover:underline">
              what's banned and what landlords can still legally ask for
            </Link>.
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-accent">✓</span> A landlord cannot reject you purely because you receive Universal Credit or Housing Benefit</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Standard credit checks, references, and guarantor requests are still allowed — applied equally to every applicant</li>
            <li className="flex gap-2"><span className="text-accent">✓</span> Universal Credit can often be paid directly to your landlord via an Alternative Payment Arrangement</li>
          </ul>
        </div>

        {/* Live filtered listings */}
        <div className="my-10">
          <div className="flex items-start gap-3 mb-4">
            <Home className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">Current DSS-accepted homes</h2>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => <div key={i} className="bg-muted rounded-xl h-56 animate-pulse" />)}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-xl p-6 text-center">
              <p className="text-foreground font-medium mb-1">No DSS-marked listings live right now</p>
              <p className="text-muted-foreground text-sm mb-4">
                Landlords add new homes every week — register your details and we'll match you the moment a
                DSS-accepted room or flat becomes available in your area.
              </p>
              <Link href="/room-wanted">
                <span className="inline-block bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
                  Post what you're looking for
                </span>
              </Link>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Browse all available homes on our <Link href="/listings" className="text-accent hover:underline">full listings page</Link>, or search{" "}
            <Link href="/rooms-to-let/london" className="text-accent hover:underline">rooms to rent by city</Link>.
          </p>
        </div>

        {/* Landlord CTA */}
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 my-10">
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">Landlords: reach benefit-eligible tenants directly</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Mark your listing as DSS/benefits-accepted when you list your property, and tenants searching this page
            find you first — at no extra cost, on our usual no-let, no-fee model.
          </p>
          <Link href="/list-your-property">
            <span className="inline-block bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              List your property
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
