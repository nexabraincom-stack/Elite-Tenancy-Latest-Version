import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  Home,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "House in Multiple Occupation (HMO)",
  description:
    "A House in Multiple Occupation (HMO) is a property rented out by at least 3 people who are not from the same household (e.g. a family) but share facilities such as a bathroom or kitchen. Defined under the Housing Act 2004, HMOs in England are subject to mandatory, additional, or selective licensing requirements depending on the size of the property and the local authority designation.",
  inDefinedTermSet: {
    "@type": "DefinedTermSet",
    name: "UK Lettings Terminology",
    url: "https://www.elitetenancy.co.uk/hmo-licence-guide",
  },
  url: "https://www.elitetenancy.co.uk/hmo-licence-guide",
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "HMO Licence UK 2026: Requirements, Costs & How to Apply",
  description:
    "Complete guide to HMO licensing in England for 2026. Mandatory, additional, and selective licensing tiers explained, including Newham Council requirements, minimum room sizes, application process, and penalties for unlicensed HMOs.",
  datePublished: "2026-06-26",
  dateModified: "2026-06-26",
  author: { "@type": "Organization", name: "Elite Tenancy", url: "https://www.elitetenancy.co.uk" },
  publisher: {
    "@type": "Organization",
    name: "Elite Tenancy",
    url: "https://www.elitetenancy.co.uk",
    logo: { "@type": "ImageObject", url: "https://www.elitetenancy.co.uk/logo.png" },
  },
  mainEntityOfPage: "https://www.elitetenancy.co.uk/hmo-licence-guide",
  about: {
    "@type": "Legislation",
    name: "Housing Act 2004 — HMO Licensing",
    jurisdiction: "England",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What makes a property an HMO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A property is a House in Multiple Occupation (HMO) if at least 3 tenants live there, they form more than one household (i.e. they are not all one family), and they share basic facilities such as a kitchen or bathroom. HMOs are defined under the Housing Act 2004 and include shared houses, bedsits, and some converted blocks of flats.",
      },
    },
    {
      "@type": "Question",
      name: "Does every HMO need a licence?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not automatically — it depends on size and location. All HMOs with 5 or more occupants from 2 or more households require a mandatory licence from the local council (nationwide rule). Some councils also run additional licensing (extending to 3–4 person HMOs) and selective licensing (covering all privately rented properties in designated areas). Landlords must check their local council's licensing register.",
      },
    },
    {
      "@type": "Question",
      name: "What is mandatory HMO licensing in England?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mandatory HMO licensing applies to all properties in England rented to 5 or more people forming 2 or more separate households, where they share a kitchen, bathroom, or toilet. Since October 2018, the rules apply to all storeys of a property (previously only to properties of 3 or more storeys). Landlords must apply to their local council and meet minimum room size and safety standards.",
      },
    },
    {
      "@type": "Question",
      name: "What is additional HMO licensing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Additional licensing is a scheme local councils can introduce under the Housing Act 2004 to extend HMO licensing beyond the mandatory threshold. For example, a council may require a licence for all shared houses with 3 or more occupants, not just those with 5+. Newham Council operates an additional licensing scheme covering 3+ person HMOs across the borough.",
      },
    },
    {
      "@type": "Question",
      name: "How much does an HMO licence cost in the UK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "HMO licence fees are set by each local council and vary significantly. Selective licensing fees in Newham are typically several hundred pounds for a 5-year licence. Mandatory and additional HMO licence fees range from approximately £500 to over £2,000 depending on the council and number of rooms. Always check the current fee schedule on your local council's website before applying.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if I let an unlicensed HMO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Operating an unlicensed HMO is a criminal offence under the Housing Act 2004. The council can impose a civil penalty of up to £40,000 per breach (raised from £30,000 by the Renters' Rights Act 2025, effective 1 May 2026). Tenants can also apply to the First-tier Tribunal (Property Chamber) for a Rent Repayment Order, requiring the landlord to repay up to 24 months of rent (doubled from 12 months by the Renters' Rights Act 2025). In addition, an unlicensed HMO landlord cannot serve a valid Section 8 notice for rent arrears.",
      },
    },
    {
      "@type": "Question",
      name: "Does the Renters' Rights Act 2025 change HMO licensing?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The Renters' Rights Act 2025 does not directly change HMO licensing requirements — the three tiers (mandatory, additional, selective) remain governed by the Housing Act 2004. However, the abolition of Section 21 and the transition to periodic tenancies means HMO landlords can no longer use Section 21 to recover possession. Section 8 grounds (including non-payment and anti-social behaviour) are the primary route — and these require the HMO to be licensed.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://www.elitetenancy.co.uk/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "HMO Licence Guide",
      item: "https://www.elitetenancy.co.uk/hmo-licence-guide",
    },
  ],
};

const LICENSING_TIERS = [
  {
    label: "Mandatory",
    badge: "bg-red-100 text-red-800",
    dot: "bg-red-500",
    trigger: "5+ occupants from 2+ households",
    applies: "England-wide — all landlords",
    fee: "Varies by council (~£800–£2,000+)",
    duration: "Up to 5 years",
    detail:
      "The baseline national requirement under the Housing Act 2004 (as amended 2018). Applies regardless of the number of storeys. If your shared house has 5 or more tenants from 2 or more households who share facilities, you must hold a mandatory licence.",
  },
  {
    label: "Additional",
    badge: "bg-amber-100 text-amber-800",
    dot: "bg-accent/100",
    trigger: "3–4 occupants (where the scheme is in force)",
    applies: "Councils that have adopted it — including Newham",
    fee: "Varies by council (~£500–£1,500)",
    duration: "Up to 5 years",
    detail:
      "Local councils can extend HMO licensing beyond the mandatory threshold. Newham Council operates an additional licensing scheme — any shared house in Newham with 3 or more tenants from 2 or more households requires a licence, not just those with 5+.",
  },
  {
    label: "Selective",
    badge: "bg-blue-100 text-blue-800",
    dot: "bg-blue-500",
    trigger: "Any privately rented property (in designated areas)",
    applies: "Designated wards — Newham has designated areas",
    fee: "Varies by council (~£500–£750 per 5 yrs)",
    duration: "Up to 5 years",
    detail:
      "Selective licensing covers all privately rented residential properties in a designated area — not just HMOs. Newham Council has used selective licensing across multiple wards. Single-let landlords in affected areas must hold a licence as well as HMO landlords.",
  },
];

const ROOM_SIZES = [
  { use: "Single adult bedroom (one person aged 10+)", min: "6.51 m²", note: "Any room below this size must not be used as a bedroom" },
  { use: "Double bedroom (two adults)", min: "10.22 m²", note: "Required for 2 adult occupants" },
  { use: "Child's room (ages 1–9)", min: "4.64 m²", note: "Children under 1 year are not counted" },
];

const APPLY_STEPS = [
  {
    n: "01",
    title: "Determine which licence type applies",
    body: "Check whether your property triggers mandatory (5+ occupants), additional (3–4 occupants in some boroughs), or selective licensing (all lets in designated wards). For East Ham and Newham, assume all three tiers are active and check with Newham Council's licensing portal.",
  },
  {
    n: "02",
    title: "Ensure the property meets HMO standards",
    body: "Before applying, confirm: minimum room sizes are met (see table below), working smoke detectors on every floor, carbon monoxide detector in every room with a gas appliance, fire doors to kitchens and in larger HMOs, and adequate kitchen and bathroom facilities for the number of occupants.",
  },
  {
    n: "03",
    title: "Complete the licence application",
    body: "Apply through your local council's online portal. You will need: property address, number of rooms and storeys, occupant details, gas safety certificate (issued within 12 months), electrical installation condition report (EICR, issued within 5 years), and energy performance certificate (EPC, rating E or above).",
  },
  {
    n: "04",
    title: "Pay the licence fee",
    body: "Fees are set by each council and must be paid at the time of application. They are non-refundable even if the licence is refused. Check the current fee schedule on your council's website — Newham, Tower Hamlets, and Hackney all publish fee schedules online.",
  },
  {
    n: "05",
    title: "Council inspection and licence issue",
    body: "The council may inspect the property before issuing the licence. They can attach conditions — for example, requiring specific fire safety improvements within a set timeframe. Licences are valid for up to 5 years. You must renew before expiry.",
  },
];

export default function HmoLicenceGuide() {
  useSeo({
    title: "HMO Licence UK 2026 — Requirements, Costs & How to Apply | Elite Tenancy",
    description:
      "Complete HMO licensing guide for UK landlords: mandatory (5+ tenants), additional (3–4 tenants), and selective licensing explained. Newham Council requirements, minimum room sizes, fees, and penalties for unlicensed HMOs.",
    canonical: "https://www.elitetenancy.co.uk/hmo-licence-guide",
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <div className="bg-primary border-b border-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="text-xs text-muted-foreground mb-4 flex gap-1.5">
            <Link href="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-muted-foreground">HMO Licence Guide</span>
          </nav>
          <p className="text-accent text-xs font-semibold tracking-widest uppercase mb-3">
            Housing Act 2004 — England
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4 max-w-3xl">
            HMO Licence UK 2026
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-8">
            If you let a property to three or more unrelated tenants in England,
            you may need an HMO licence — and in boroughs like Newham, the rules
            go further than the national minimum. Here is every tier explained,
            with room size requirements, fees, and the application process.
          </p>
          <Link
            href="/for-landlords"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            Landlord services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">

            {/* Definition */}
            <section>
              <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-4">
                What is an HMO?
              </h2>
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-5 mb-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    <strong>House in Multiple Occupation (HMO)</strong> — a
                    property rented by at least 3 tenants from more than one
                    household who share facilities (kitchen or bathroom). Defined
                    under the{" "}
                    <strong>Housing Act 2004</strong> and regulated across
                    England by three licensing tiers.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-3">
                A household is a single person, a couple, or a family (including
                extended family). Three friends sharing a house are three
                households. A couple and a lodger are two households — and if
                they share a kitchen, the property is an HMO.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                HMOs include shared houses, bedsits, some purpose-built student
                blocks, and converted buildings where self-contained flats are
                poorly converted. Licences are not transferable — they belong to
                a specific property and licence holder.
              </p>
            </section>

            {/* Three tiers */}
            <section>
              <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-2">
                The three licensing tiers
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                HMO licensing operates on three tiers. You may be subject to
                more than one — Newham landlords often need to consider all
                three.
              </p>
              <div className="space-y-5">
                {LICENSING_TIERS.map((tier) => (
                  <div
                    key={tier.label}
                    className="bg-white border border-border rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}
                      >
                        {tier.label} Licensing
                      </span>
                    </div>
                    <p className="text-sm text-foreground mb-4 leading-relaxed">
                      {tier.detail}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Trigger
                        </p>
                        <p className="text-foreground">{tier.trigger}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Applies to
                        </p>
                        <p className="text-foreground">{tier.applies}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Licence duration
                        </p>
                        <p className="text-foreground">{tier.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Newham callout */}
            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-3">
                  <Home className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <h2 className="font-display text-lg font-bold text-blue-900">
                    Newham (East Ham) — all three tiers apply
                  </h2>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed mb-3">
                  Newham Council operates <strong>mandatory licensing</strong>,{" "}
                  <strong>additional licensing</strong> (extended to 3+ person
                  HMOs), and <strong>selective licensing</strong> across
                  designated wards. Landlords in East Ham, Forest Gate, and
                  other Newham wards should verify their property's licensing
                  status directly with Newham Council before letting.
                </p>
                <p className="text-sm text-blue-700">
                  Elite Tenancy's office is in East Ham (Office 18077,
                  182–184 High Street North, E6 2JA). We work with landlords
                  navigating Newham's licensing tiers every day.
                </p>
              </div>
            </section>

            {/* Minimum room sizes */}
            <section>
              <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-2">
                Minimum bedroom sizes (from October 2018)
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                The Housing (Amendment) Act 2018 introduced minimum room size
                requirements for all licensed HMOs in England. Rooms below these
                thresholds cannot lawfully be used as sleeping accommodation.
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Occupant type
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground">
                        Minimum size
                      </th>
                      <th className="text-left px-4 py-3 font-semibold text-foreground hidden sm:table-cell">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ROOM_SIZES.map((r, i) => (
                      <tr key={i} className="bg-white hover:bg-muted/50">
                        <td className="px-4 py-3 text-foreground">{r.use}</td>
                        <td className="px-4 py-3 font-semibold text-accent">
                          {r.min}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                          {r.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Rooms between 4.64 m² and 6.51 m² may only be used for children
                aged 1–9. The landlord must notify the council within 7 days if
                a room is too small for its current use.
              </p>
            </section>

            {/* How to apply */}
            <section>
              <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-6">
                How to apply for an HMO licence
              </h2>
              <div className="space-y-4">
                {APPLY_STEPS.map((s) => (
                  <div
                    key={s.n}
                    className="flex gap-4 bg-white border border-border rounded-xl p-5 shadow-sm"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-accent font-bold text-sm flex items-center justify-center">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {s.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Penalties */}
            <section>
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <h2 className="font-display text-xl font-bold text-red-900">
                    Penalties for operating an unlicensed HMO
                  </h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg border border-red-100 p-4 text-center">
                    <p className="text-3xl font-bold text-red-700 mb-1">£40,000</p>
                    <p className="text-sm text-red-800 font-semibold">civil penalty</p>
                    <p className="text-xs text-red-600 mt-1">
                      Per breach — council-issued (raised May 2026)
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-red-100 p-4 text-center">
                    <p className="text-3xl font-bold text-red-700 mb-1">24 mo</p>
                    <p className="text-sm text-red-800 font-semibold">rent repayment</p>
                    <p className="text-xs text-red-600 mt-1">
                      Tenants can apply to tribunal (doubled May 2026)
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-red-100 p-4 text-center">
                    <p className="text-3xl font-bold text-red-700 mb-1">Void</p>
                    <p className="text-sm text-red-800 font-semibold">Section 8 notice</p>
                    <p className="text-xs text-red-600 mt-1">
                      Cannot be served without a valid licence
                    </p>
                  </div>
                </div>
                <p className="text-xs text-red-700">
                  Operating an unlicensed HMO is a criminal offence. The council
                  can also apply to the First-tier Tribunal for an Interim
                  Management Order, transferring control of the property to the
                  council for up to 12 months.
                </p>
              </div>
            </section>

            {/* FAQs */}
            <section>
              <h2 className="font-display text-2xl font-semibold text-white tracking-tight mb-6">
                Common questions
              </h2>
              <div className="space-y-2">
                {faqSchema.mainEntity.map((faq, i) => (
                  <div
                    key={i}
                    className="bg-white border border-border rounded-xl overflow-hidden"
                  >
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      aria-expanded={openFaq === i}
                    >
                      <span className="font-semibold text-foreground pr-4 text-sm">
                        {faq.name}
                      </span>
                      {openFaq === i ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40">
                        <p className="pt-4">{faq.acceptedAnswer.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick check CTA */}
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 sticky top-6">
              <p className="text-xs font-semibold text-accent uppercase tracking-widest mb-2">
                Landlord services
              </p>
              <h3 className="font-display text-lg font-semibold text-white tracking-tight mb-2">
                HMO landlord? Elite Tenancy can help
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We introduce thoroughly referenced tenants for HMOs and shared
                houses — one-off fee, no monthly commission. East Ham and Newham
                specialists.
              </p>
              <Link
                href="/list-your-property"
                className="w-full inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm shadow-sm"
              >
                List Your Property <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Key facts */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" /> Key facts at a
                glance
              </h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Mandatory: 5+ tenants, 2+ households
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Additional: 3+ tenants (Newham applies)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Selective: all lets in designated wards
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                  Licence valid up to 5 years — must renew
                </li>
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  Min. room: 6.51 m² (1 adult), 10.22 m² (2)
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  Unlicensed = up to £40,000 penalty
                </li>
              </ul>
            </div>

            {/* Documents needed */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-3">
                Documents for application
              </h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Gas Safety Certificate (within 12 months)",
                  "Electrical Installation Condition Report (within 5 years)",
                  "Energy Performance Certificate (EPC rating E+)",
                  "Proof of identity (passport or driving licence)",
                  "Floor plan with room dimensions",
                  "Details of managing agent (if applicable)",
                ].map((doc) => (
                  <li key={doc} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-accent flex-shrink-0 mt-0.5" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>

            {/* RRA 2025 note */}
            <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground mb-2">
                RRA 2025 &amp; HMOs
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Section 21 is abolished under the Renters' Rights Act 2025 —
                HMO landlords must use Section 8 grounds, which requires a valid
                licence.
              </p>
              <Link
                href="/renters-rights-act-2025"
                className="text-sm text-accent font-medium hover:text-amber-800 inline-flex items-center gap-1"
              >
                Full RRA 2025 guide <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Dark CTA */}
            <div className="bg-gray-900 rounded-xl p-6 text-white">
              <h3 className="font-display font-bold text-lg mb-2">
                Need HMO tenants?
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Elite Tenancy references and introduces tenants for HMOs and
                shared houses. One fee. No monthly cut.
              </p>
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center gap-2 bg-accent/100 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-amber-400 transition-colors text-sm"
              >
                See pricing <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
