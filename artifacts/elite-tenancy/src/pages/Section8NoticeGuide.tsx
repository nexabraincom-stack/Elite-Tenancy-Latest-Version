import { useState } from "react";
import { Link } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scale,
  Clock,
  Home,
  XCircle,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const definedTermSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  name: "Section 8 Notice",
  description:
    "A Section 8 notice is a formal written notice served by a landlord to a tenant under Section 8 of the Housing Act 1988, relying on one or more statutory grounds for possession. Unlike a Section 21 notice (now abolished by the Renters' Rights Act 2025), a Section 8 notice is fault-based — the landlord must specify and prove the ground relied upon at a court hearing.",
  inDefinedTermSet: {
    "@type": "DefinedTermSet",
    name: "UK Lettings Terminology",
    url: "https://www.elitetenancy.co.uk/section-8-notice-guide",
  },
  url: "https://www.elitetenancy.co.uk/section-8-notice-guide",
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Section 8 Notice UK 2026: Grounds, Notice Periods & How to Serve",
  description:
    "Complete landlord guide to Section 8 notices in England for 2026. Covers all grounds for possession, mandatory vs discretionary grounds, notice periods updated by the Renters' Rights Act 2025, how to serve, court procedure, and East Ham / London rent arrears advice.",
  datePublished: "2026-06-26",
  dateModified: "2026-06-26",
  author: { "@type": "Organization", name: "Elite Tenancy", url: "https://www.elitetenancy.co.uk" },
  publisher: {
    "@type": "Organization",
    name: "Elite Tenancy",
    url: "https://www.elitetenancy.co.uk",
    logo: { "@type": "ImageObject", url: "https://www.elitetenancy.co.uk/logo.png" },
  },
  mainEntityOfPage: "https://www.elitetenancy.co.uk/section-8-notice-guide",
  about: {
    "@type": "Legislation",
    name: "Housing Act 1988 — Section 8 Possession",
    jurisdiction: "England",
  },
};

const legislationSchema = {
  "@context": "https://schema.org",
  "@type": "Legislation",
  name: "Housing Act 1988 — Section 8",
  legislationType: "Act",
  jurisdiction: "England",
  url: "https://www.legislation.gov.uk/ukpga/1988/50/section/8",
  about: "Section 8 grounds for possession of assured shorthold tenancies",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Section 8 notice in the UK?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Section 8 notice is a formal written notice served by a landlord under Section 8 of the Housing Act 1988 to begin the possession process for an assured or assured shorthold tenancy. The landlord must specify at least one statutory ground for possession (e.g. rent arrears, anti-social behaviour, breach of tenancy). Following the Renters' Rights Act 2025, which abolished Section 21, Section 8 is now the only route to recovering possession in England.",
      },
    },
    {
      "@type": "Question",
      name: "How much notice must a landlord give for a Section 8 notice in 2026?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The notice period depends on the ground used. For Ground 8 (serious rent arrears — at least 3 months), the minimum notice period is 4 weeks. For anti-social behaviour grounds (Grounds 7A and 14), the landlord may apply to court immediately (zero notice for Ground 14 ASB). For most other grounds the notice period is 2 weeks. The Renters' Rights Act 2025 introduced a new Ground 6A for serious repeated rent arrears and increased notice periods for some grounds.",
      },
    },
    {
      "@type": "Question",
      name: "What is the difference between mandatory and discretionary Section 8 grounds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For mandatory grounds (e.g. Ground 8 — 3+ months' rent arrears), the court must grant possession if the ground is proven — the judge has no discretion. For discretionary grounds (e.g. Ground 10 — some arrears, Ground 12 — breach of tenancy), the court may grant possession only if it considers it reasonable to do so — the judge has discretion to refuse or suspend the order. Most landlords rely on mandatory grounds where possible because they guarantee an order if proven.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use a Section 8 notice after the Renters' Rights Act 2025?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — Section 8 notices remain valid and are now the primary possession tool following the abolition of Section 21 by the Renters' Rights Act 2025. The Act strengthened several Section 8 grounds: Ground 7A (serious ASB) and Ground 14ZA (domestic abuse perpetrators) are now directly available. A new Ground 6A (repeated serious rent arrears) was also introduced. Landlords cannot use Section 21 for tenancies granted after the commencement date of the Renters' Rights Act 2025.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if a landlord does not use the prescribed Section 8 form?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Section 8 notice must be served on the prescribed form (Form 3, updated periodically by the government). Using an outdated or incorrect form may invalidate the notice, meaning the court will dismiss the claim and the landlord must start again. As of 2026, landlords should use the most current version of Form 3 available from GOV.UK and include the specific ground(s) and particulars of the ground clearly.",
      },
    },
    {
      "@type": "Question",
      name: "Can a landlord serve a Section 8 notice if the deposit is not protected?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes — unlike a Section 21 notice, a Section 8 notice can be served even if the tenancy deposit is not protected. However, failing to protect a deposit within 30 days and provide Prescribed Information exposes the landlord to a penalty of between 1x and 3x the deposit amount. Landlords should protect deposits regardless, as it is a legal requirement under the Housing Act 2004.",
      },
    },
    {
      "@type": "Question",
      name: "How do I serve a Section 8 notice correctly in England?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To serve a valid Section 8 notice: (1) Use the current prescribed Form 3. (2) State the ground(s) clearly and give full particulars — for rent arrears, specify the amount owed and the dates of arrears. (3) State the date on which the tenancy will end (must be at least the minimum notice period after service). (4) Serve by hand, first-class post, or an agreed method in the tenancy agreement. Keep proof of service — a completed Certificate of Service (N215) is advisable. For postal service, allow at least 2 working days for delivery.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Section 8 Notice Guide",
      item: "https://www.elitetenancy.co.uk/section-8-notice-guide",
    },
  ],
};

interface Ground {
  number: string;
  label: string;
  type: "mandatory" | "discretionary";
  notice: string;
  description: string;
  rra?: boolean;
}

const GROUNDS: Ground[] = [
  {
    number: "Ground 7A",
    label: "Serious Anti-Social Behaviour",
    type: "mandatory",
    notice: "Immediate (apply same day)",
    description:
      "Tenant or co-resident has been convicted of a serious offence, received a final injunction, or been found guilty of causing nuisance. Introduced by the Anti-social Behaviour, Crime and Policing Act 2014.",
    rra: false,
  },
  {
    number: "Ground 8",
    label: "Serious Rent Arrears",
    type: "mandatory",
    notice: "4 weeks",
    description:
      "At least 3 months' rent is unpaid both at the time of serving the notice AND at the date of the court hearing. The court must grant possession if both conditions are met at the hearing.",
    rra: false,
  },
  {
    number: "Ground 6A",
    label: "Repeated Serious Rent Arrears",
    type: "mandatory",
    notice: "4 weeks",
    description:
      "New ground introduced by the Renters' Rights Act 2025. Applies where the tenant has had arrears of at least 2 months on 3 or more separate occasions within the past 3 years. The arrears do not need to be outstanding at the hearing.",
    rra: true,
  },
  {
    number: "Ground 14",
    label: "Anti-Social Behaviour / Nuisance",
    type: "discretionary",
    notice: "Immediate (apply same day)",
    description:
      "Tenant has caused or is likely to cause nuisance, annoyance, or harassment to neighbours or persons in the locality. Covers noise, drug use, threatening behaviour. The court may grant possession if it considers it reasonable.",
    rra: false,
  },
  {
    number: "Ground 14ZA",
    label: "Domestic Abuse Perpetrator",
    type: "mandatory",
    notice: "Immediate",
    description:
      "Tenant has been convicted of a domestic abuse offence against another resident. Strengthened under the Renters' Rights Act 2025.",
    rra: true,
  },
  {
    number: "Ground 10",
    label: "Rent Arrears (some arrears)",
    type: "discretionary",
    notice: "2 weeks",
    description:
      "Tenant owes some rent (less than the Ground 8 threshold). Court has discretion to grant or refuse — landlords must also show it is reasonable to grant possession.",
    rra: false,
  },
  {
    number: "Ground 11",
    label: "Persistent Late Payment",
    type: "discretionary",
    notice: "2 weeks",
    description:
      "Tenant has consistently paid rent late, even if not in arrears at the time of the notice. The court considers the pattern of late payment and whether it is reasonable to grant possession.",
    rra: false,
  },
  {
    number: "Ground 12",
    label: "Breach of Tenancy",
    type: "discretionary",
    notice: "2 weeks",
    description:
      "Tenant has broken a term of the tenancy agreement (other than an obligation to pay rent), for example keeping a pet without consent or subletting without permission.",
    rra: false,
  },
  {
    number: "Ground 13",
    label: "Deterioration of Property",
    type: "discretionary",
    notice: "2 weeks",
    description:
      "Tenant has allowed the property (or common parts) to deteriorate through neglect or ill-treatment. Applies to waste or neglect by a person living at the property.",
    rra: false,
  },
  {
    number: "Ground 17",
    label: "False Statement",
    type: "discretionary",
    notice: "2 weeks",
    description:
      "The tenancy was granted because the tenant (or a person acting on their behalf) made a false statement to obtain the tenancy.",
    rra: false,
  },
];

const PROCESS_STEPS = [
  {
    step: "1",
    title: "Check the ground(s) carefully",
    detail:
      "Confirm the tenancy is assured or AST (created on or after 15 January 1989). Verify you can satisfy all elements of the ground — for Ground 8, confirm 3+ months' arrears exist and will likely still exist at the hearing date.",
  },
  {
    step: "2",
    title: "Obtain the current Form 3",
    detail:
      'Download the latest prescribed Form 3 (Notice Seeking Possession of a Property Let on an Assured Tenancy or an Assured Agricultural Occupancy) from GOV.UK. Do not use old versions — the form is periodically updated.',
  },
  {
    step: "3",
    title: "Complete the form",
    detail:
      "State the ground number(s) and full particulars — for rent arrears, include the total outstanding, dates from which arrears accrued, and the weekly or monthly rent. Calculate the notice expiry date (minimum notice period from date of service).",
  },
  {
    step: "4",
    title: "Serve the notice",
    detail:
      "Serve the completed form on the tenant by hand, first-class post, or the method specified in the tenancy agreement. If posting, allow at least 2 working days. Retain a copy and record the date and method of service.",
  },
  {
    step: "5",
    title: "Wait for the notice period to expire",
    detail:
      "You cannot apply to court until the notice period has expired (unless the ground allows immediate application, such as Grounds 7A and 14). Do not accept rent that would clear below the Ground 8 threshold if relying on that ground.",
  },
  {
    step: "6",
    title: "Issue possession proceedings",
    detail:
      "If the tenant has not vacated, apply to the County Court using Form N5 (Claim for Possession of Property) and Form N119 (Particulars of Claim for Possession — rented residential). Pay the court fee (check current fees at HMCTS). For accelerated claims on mandatory grounds, use the Accelerated Possession Procedure (Form N5B).",
  },
  {
    step: "7",
    title: "Attend the court hearing",
    detail:
      "For discretionary grounds, attend the hearing. For mandatory grounds, the court should grant possession automatically if the ground is proved — but you must appear or be represented. If granted, the court will set a possession date (usually 14 days, extendable to 42 days in exceptional hardship).",
  },
];

const FAQS = [
  {
    q: "What is a Section 8 notice in the UK?",
    a: "A Section 8 notice is a formal written notice served by a landlord under Section 8 of the Housing Act 1988 to begin the possession process for an assured or assured shorthold tenancy. The landlord must specify at least one statutory ground for possession (e.g. rent arrears, anti-social behaviour, breach of tenancy). Following the Renters' Rights Act 2025, which abolished Section 21, Section 8 is now the only route to recovering possession in England.",
  },
  {
    q: "How much notice must a landlord give for a Section 8 notice in 2026?",
    a: "The notice period depends on the ground used. For Ground 8 (serious rent arrears — at least 3 months), the minimum notice period is 4 weeks. For anti-social behaviour grounds (Grounds 7A and 14), the landlord may apply to court immediately. For most other grounds the notice period is 2 weeks. The Renters' Rights Act 2025 introduced a new Ground 6A for repeated serious rent arrears.",
  },
  {
    q: "What is the difference between mandatory and discretionary Section 8 grounds?",
    a: "For mandatory grounds (e.g. Ground 8 — 3+ months' rent arrears), the court must grant possession if the ground is proved — the judge has no discretion. For discretionary grounds (e.g. Ground 10 — some arrears, Ground 12 — breach of tenancy), the court may grant possession only if it considers it reasonable — the judge has discretion to refuse or suspend the order.",
  },
  {
    q: "Can I use a Section 8 notice after the Renters' Rights Act 2025?",
    a: "Yes — Section 8 notices remain valid and are now the primary possession tool following the abolition of Section 21 by the Renters' Rights Act 2025. The Act strengthened several grounds and introduced new Ground 6A (repeated serious rent arrears). Landlords cannot use Section 21 for tenancies granted after the commencement date of the Act.",
  },
  {
    q: "Can a landlord serve a Section 8 notice if the deposit is not protected?",
    a: "Yes — unlike a Section 21 notice, a Section 8 notice can be served even if the tenancy deposit is not protected. However, failing to protect a deposit within 30 days exposes the landlord to a penalty of 1x–3x the deposit amount. Deposit protection remains a legal requirement under the Housing Act 2004.",
  },
  {
    q: "How do I serve a Section 8 notice correctly in England?",
    a: "Use the current prescribed Form 3. State the ground(s) clearly with full particulars — for rent arrears, specify the amount owed and the dates of arrears. State the notice expiry date. Serve by hand, first-class post, or an agreed method in the tenancy agreement. Keep proof of service. For postal service, allow at least 2 working days for delivery.",
  },
  {
    q: "What happens if a landlord does not use the prescribed Section 8 form?",
    a: "A Section 8 notice must be served on the current prescribed Form 3. Using an outdated or incorrect form may invalidate the notice, and the court may dismiss the claim. Landlords must use the most current version of Form 3 available from GOV.UK and include the specific ground(s) and particulars clearly.",
  },
];

export default function Section8NoticeGuide() {
  useSeo({
    title: "Section 8 Notice UK 2026: Grounds, Notice Periods & How to Serve | Elite Tenancy",
    description:
      "Complete landlord guide to Section 8 notices in England 2026. All grounds for possession, mandatory vs discretionary, notice periods, RRA 2025 changes, court process, and London rent arrears advice.",
    canonical: "https://www.elitetenancy.co.uk/section-8-notice-guide",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legislationSchema) }}
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
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_0%_0%,rgba(181,134,42,0.22),transparent)] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,0.055) 1px,transparent 1px)", backgroundSize: "28px 28px" }} />
        <nav aria-label="Breadcrumb" className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <ol className="flex items-center gap-2 text-xs text-primary-foreground/50">
            <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li className="text-primary-foreground/80">Section 8 Notice Guide</li>
          </ol>
        </nav>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent/30 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-5 uppercase tracking-widest">
            <Scale className="w-3 h-3" />
            Housing Act 1988 · Updated for RRA 2025
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-5">
            Section 8 Notice UK 2026:<br className="hidden sm:block" />
            <span className="text-accent"> Grounds, Notice Periods &amp; How to Serve</span>
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed max-w-2xl mb-8">
            With Section 21 abolished by the Renters' Rights Act 2025, Section 8 is now the only
            route for landlords to recover possession in England. This guide explains every ground,
            mandatory vs discretionary, updated notice periods, and the step-by-step court process.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/valuation">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors shadow-lg shadow-black/20">
                Get a Free Valuation <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/tenant-introduction-service">
              <button className="inline-flex items-center gap-2 border border-white/25 text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors">
                Tenant Introduction Service
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key facts bar */}
      <section className="bg-accent/8 border-b border-accent/15">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Legislation", value: "Housing Act 1988" },
            { label: "Section 21", value: "Abolished — RRA 2025" },
            { label: "Ground 8 notice", value: "4 weeks" },
            { label: "ASB notice", value: "Immediate (Ground 14)" },
          ].map((fact) => (
            <div key={fact.label} className="text-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">{fact.label}</div>
              <div className="text-sm font-bold text-foreground">{fact.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* What is Section 8 */}
        <section id="what-is-section-8">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-4">What is a Section 8 notice?</h2>
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              A <strong>Section 8 notice</strong> (formally a Notice Seeking Possession) is a written
              notice served by a landlord on a tenant under <strong>Section 8 of the Housing Act 1988</strong>.
              It begins the legal process to recover possession of a property let on an assured or
              assured shorthold tenancy (AST).
            </p>
            <p>
              Unlike a Section 21 notice — which was a "no-fault" eviction tool now
              <strong> abolished by the Renters' Rights Act 2025</strong> — a Section 8 notice
              must be based on one or more specific statutory grounds. The landlord must specify
              the ground(s), give the required notice period, and then apply to the County Court
              for a possession order if the tenant does not leave voluntarily.
            </p>
            <p>
              As of 2026, Section 8 is the <strong>only route</strong> for landlords in England
              to recover possession on the basis of tenant fault or other specified circumstances.
            </p>
          </div>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Post-RRA 2025:</strong> Section 21 has been abolished for all tenancies
              falling within the Renters' Rights Act 2025 commencement. Any landlord relying on a
              Section 21 notice served after commencement risks court dismissal. Use Section 8 only.
            </div>
          </div>
        </section>

        {/* Grounds table */}
        <section id="grounds">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-2">Section 8 grounds for possession</h2>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
            The most commonly used grounds are listed below. <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">RRA 2025</span> badges indicate grounds introduced or strengthened by the Renters' Rights Act 2025.
          </p>
          <div className="space-y-4">
            {GROUNDS.map((g) => (
              <div
                key={g.number}
                className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-start gap-4"
              >
                <div className="flex-shrink-0 flex flex-col items-start sm:items-center gap-2 min-w-[130px]">
                  <span className="font-serif font-bold text-foreground text-sm">{g.number}</span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      g.type === "mandatory"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {g.type === "mandatory" ? "Mandatory" : "Discretionary"}
                  </span>
                  {g.rra && (
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                      RRA 2025
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1.5">
                    <h3 className="font-semibold text-foreground text-sm">{g.label}</h3>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" /> Notice: {g.notice}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            This is not an exhaustive list of all Schedule 2 grounds. Grounds 1–6 cover landlord's
            own occupation, mortgagee in possession, and similar. Always refer to the Housing Act
            1988 Schedule 2 for the full list.
          </p>
        </section>

        {/* Mandatory vs discretionary explainer */}
        <section id="mandatory-vs-discretionary">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Mandatory vs discretionary: what landlords need to know</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Mandatory grounds</h3>
              </div>
              <p className="text-sm text-red-800 leading-relaxed mb-3">
                If the landlord proves the ground, the court <strong>must</strong> grant possession —
                the judge has no discretion.
              </p>
              <ul className="space-y-1 text-sm text-red-800">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 8 — 3+ months' rent arrears (at notice AND at hearing)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 6A — repeated serious rent arrears (RRA 2025)</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 7A — serious ASB conviction or injunction</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 14ZA — domestic abuse perpetrator (RRA 2025)</li>
              </ul>
              <div className="mt-3 text-xs text-red-700 bg-red-100 rounded-lg p-3">
                <strong>Ground 8 trap:</strong> if the tenant clears enough arrears before the
                hearing to fall below 3 months, the ground fails. Serve alongside Ground 10
                (discretionary some arrears) as a safety net.
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Discretionary grounds</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed mb-3">
                The court <strong>may</strong> grant possession if it is reasonable to do so — the
                judge weighs the circumstances of both parties.
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 10 — some rent arrears</li>
                <li className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 11 — persistent late payment</li>
                <li className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 12 — breach of tenancy agreement</li>
                <li className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 13 — deterioration of property</li>
                <li className="flex items-start gap-2"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Ground 14 — anti-social behaviour (nuisance)</li>
              </ul>
              <div className="mt-3 text-xs text-blue-700 bg-blue-100 rounded-lg p-3">
                Courts weigh factors including the tenant's personal circumstances,
                history of compliance, and impact on the local area. Having a clear
                paper trail of warnings and breach notices strengthens discretionary claims.
              </div>
            </div>
          </div>
        </section>

        {/* Step-by-step process */}
        <section id="how-to-serve">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">How to serve a Section 8 notice: step-by-step</h2>
          <div className="space-y-4">
            {PROCESS_STEPS.map((s) => (
              <div key={s.step} className="flex gap-4 rounded-xl border border-border bg-card p-5">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* RRA 2025 changes callout */}
        <section id="rra-2025-changes" className="rounded-xl bg-primary/5 border border-primary/15 p-7">
          <h2 className="font-serif text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Renters' Rights Act 2025 — what changed for Section 8
          </h2>
          <div className="grid sm:grid-cols-2 gap-5 text-sm text-foreground leading-relaxed">
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Section 21 abolished</h3>
              <p className="text-muted-foreground">
                The RRA 2025 removed the Section 21 "no-fault" eviction route for assured shorthold
                tenancies. All new and existing ASTs have converted to periodic tenancies; landlords
                must now use Section 8 grounds to recover possession.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">New Ground 6A — repeated arrears</h3>
              <p className="text-muted-foreground">
                Landlords can now seek mandatory possession where the tenant has had arrears of at
                least 2 months on 3 or more separate occasions in the past 3 years — even if
                arrears are cleared before the hearing. This closes the "clear before court" tactic.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">Strengthened ASB grounds</h3>
              <p className="text-muted-foreground">
                Ground 7A (serious anti-social behaviour) and Ground 14ZA (domestic abuse
                perpetrators) were strengthened and clarified. Courts are directed to give greater
                weight to the impact on neighbours and local communities.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-foreground">No effect on notice periods for Ground 8</h3>
              <p className="text-muted-foreground">
                The 4-week minimum notice period for Ground 8 remains. The court will still require
                arrears to exist both at the time of service and at the hearing — unless using the
                new Ground 6A, where clearance before the hearing does not defeat the claim.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-primary/10">
            <Link
              href="/renters-rights-act-2025"
              className="inline-flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
            >
              Full Renters' Rights Act 2025 guide <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Common mistakes */}
        <section id="common-mistakes">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Common Section 8 mistakes landlords make</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                title: "Using an outdated Form 3",
                detail: "Always download the latest Form 3 from GOV.UK. Courts have dismissed claims for use of superseded forms.",
              },
              {
                title: "Insufficient particulars of arrears",
                detail: "State the exact amount owing, the dates from which arrears began, and weekly/monthly rent. Vague particulars can invalidate the notice.",
              },
              {
                title: "Relying on Ground 8 alone without Ground 10",
                detail: "If the tenant clears arrears below 3 months before the hearing, Ground 8 fails. Always plead Grounds 8, 10, and 11 together where arrears are the issue.",
              },
              {
                title: "Accepting rent that defeats the ground",
                detail: "If relying on Ground 8, accepting rent payments that clear arrears below the 3-month threshold defeats the mandatory ground at the hearing.",
              },
              {
                title: "Incorrect service method",
                detail: "The tenancy agreement may specify a required service method. Postal service requires at least 2 working days. Keep a certificate of service.",
              },
              {
                title: "Unprotected deposit + wrong notice",
                detail: "Failing to protect the deposit does not invalidate a Section 8 notice — but it will expose the landlord to a 1x–3x penalty separately. Protect all deposits within 30 days.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3 rounded-xl border border-border bg-card p-5">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* East Ham / London local angle */}
        <section id="east-ham-landlords" className="rounded-xl bg-accent/8 border border-accent/15 p-7">
          <h2 className="font-serif text-xl font-bold text-foreground mb-3 flex items-center gap-2">
            <Home className="w-5 h-5 text-accent" />
            Section 8 advice for East Ham &amp; London landlords
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
            <p>
              In East Ham (E6) and across the London Borough of Newham, rent arrears remain one of
              the primary reasons landlords seek possession. With average East Ham rents at
              £1,600–£2,000 per month for a 3-bedroom property, a Ground 8 threshold of 3 months
              can represent £4,800–£6,000 in outstanding rent before mandatory grounds are met.
            </p>
            <p>
              Newham Council's additional HMO licensing scheme means that any HMO landlord in East
              Ham must be licensed to serve a valid Section 8 notice for rent arrears grounds —
              an unlicensed HMO landlord cannot rely on rent arrears grounds for possession.
            </p>
            <p>
              Elite Tenancy's tenant introduction service screens all applicants for affordability
              (2.5× annual rent in income), employment status, and credit history before introduction —
              significantly reducing the risk of reaching the Section 8 stage.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/tenant-introduction-service">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors">
                Learn about our tenant screening <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
            <Link href="/hmo-licence-guide">
              <button className="inline-flex items-center gap-2 border border-accent/30 text-accent px-4 py-2 rounded-lg font-semibold text-sm hover:bg-accent/10 transition-colors">
                HMO licence requirements
              </button>
            </Link>
          </div>
        </section>

        {/* FAQ accordion */}
        <section id="faq">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-foreground text-sm">{item.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Related guides */}
        <section>
          <h2 className="font-serif text-xl font-bold text-foreground mb-5">Related landlord guides</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                href: "/renters-rights-act-2025",
                label: "Renters' Rights Act 2025",
                desc: "Section 21 abolished, new tenancy rules, rent increases & more",
              },
              {
                href: "/deposit-protection",
                label: "Tenancy Deposit Protection",
                desc: "Five-week cap, 30-day deadline, DPS / TDS / MyDeposits schemes",
              },
              {
                href: "/hmo-licence-guide",
                label: "HMO Licence UK 2026",
                desc: "Mandatory, additional & selective licensing — Newham local rules",
              },
            ].map((r) => (
              <Link key={r.href} href={r.href}>
                <div className="rounded-xl border border-border bg-card p-5 h-full hover:border-accent/40 hover:bg-accent/5 transition-colors group cursor-pointer">
                  <h3 className="font-semibold text-foreground text-sm mb-1 group-hover:text-accent transition-colors flex items-center gap-1.5">
                    {r.label} <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-xl bg-primary p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(181,134,42,0.22),transparent)] pointer-events-none" />
          <div className="relative">
            <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-3">Avoid Section 8 altogether</p>
            <h2 className="font-serif text-2xl font-bold text-primary-foreground mb-3">
              Start with exceptional tenants
            </h2>
            <p className="text-primary-foreground/70 text-sm max-w-lg mx-auto mb-6 leading-relaxed">
              Elite Tenancy screens every applicant for income, credit, and employment before introduction.
              Our landlords report zero Section 8 notices in the first 24 months. Completion fee only —
              two weeks' rent when the tenant moves in.
            </p>
            <Link href="/valuation">
              <button className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-lg shadow-black/20">
                Get a Free Valuation <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
