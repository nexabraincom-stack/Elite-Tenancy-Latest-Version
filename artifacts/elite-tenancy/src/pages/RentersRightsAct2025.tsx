import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SECTIONS = [
  {
    id: "overview",
    title: "What is the Renters' Rights Act 2025?",
    content: `The Renters' Rights Act 2025 is a major piece of UK housing legislation that received Royal Assent in 2025 and comes into force for new tenancies in 2026. It is the most significant reform to the private rented sector in England since the Housing Act 1988.

The Act abolishes Section 21 'no-fault' evictions, converts all assured shorthold tenancies (ASTs) to assured periodic tenancies, and introduces a new Private Rented Sector Database that all landlords must register with. It also strengthens tenant protections around rent increases, repairs, and pets.`,
  },
  {
    id: "section21",
    title: "Abolition of Section 21 (no-fault evictions)",
    content: `Section 21 of the Housing Act 1988 previously allowed landlords to evict tenants at the end of a fixed term without giving any reason, provided they gave two months' written notice. The Renters' Rights Act abolishes this.

After the commencement date, landlords in England must use Section 8 and prove one of the statutory grounds for possession (e.g. rent arrears, breach of tenancy, landlord wishing to sell, landlord wishing to move in). This applies to ALL assured tenancies — not just new ones created after the Act.

Scotland abolished no-fault evictions in 2017 under the Private Housing (Tenancies) (Scotland) Act 2016. England is following that model.`,
  },
  {
    id: "periodic",
    title: "End of fixed-term tenancies",
    content: `The Act replaces assured shorthold tenancies with assured periodic tenancies. All new tenancies from the commencement date are periodic (rolling) by default — there are no more fixed 6-month or 12-month terms for new lets.

Existing fixed-term tenancies continue as-is until their contractual end date, then convert to assured periodic tenancies automatically.

Under the new system:
- Tenants can give two months' notice to leave at any time (no minimum tenure)
- Landlords must use a Section 8 ground to end the tenancy
- Common Section 8 grounds include: rent arrears (Ground 8, 10, 11), landlord selling (Ground 1A), landlord or family moving in (Ground 1), anti-social behaviour (Ground 14)`,
  },
  {
    id: "rentincreases",
    title: "Rent increases",
    content: `Under the Renters' Rights Act, landlords can only increase rent once per year and must use the Section 13 notice procedure. Tenants have the right to challenge any proposed increase at the First-tier Tribunal (Property Chamber).

Key points:
- Rent increase notices must give at least 2 months' written notice
- The tribunal can only confirm the market rent, not exceed it
- Rent review clauses in tenancy agreements that are more frequent than annual are void
- Bidding wars (where landlords invite offers above the listed rent) are prohibited under the Act`,
  },
  {
    id: "pets",
    title: "Pets",
    content: `The Act gives tenants the right to request a pet. Landlords must consider the request and can only refuse on reasonable grounds. A blanket 'no pets' clause is no longer enforceable.

Landlords may require tenants to hold pet insurance to cover potential damage. Any pet deposit or additional insurance requirement is in addition to (not in substitution of) the statutory security deposit cap.

Landlords must respond to a pet request within 28 days. If they refuse, they must give written reasons. Tenants who believe a refusal is unreasonable can challenge it.`,
  },
  {
    id: "database",
    title: "Private Rented Sector Database",
    content: `The Act creates a new digital database of all private landlords in England. Landlords are required to register before letting a property. Failure to register is an offence and can result in a civil penalty.

The database allows local councils and the new Private Rented Sector Ombudsman to enforce standards more effectively. It replaces the patchwork of local selective licensing schemes over time, though Newham's borough-wide selective licensing continues in parallel for now.`,
  },
  {
    id: "ombudsman",
    title: "Private Rented Sector Ombudsman",
    content: `The Act establishes a new compulsory ombudsman scheme that all private landlords in England must join. Currently, only letting agents (not self-managing landlords) must belong to a redress scheme.

The ombudsman can:
- Investigate complaints from tenants about landlords
- Award compensation of up to £25,000
- Require remedial action (repairs, rent reductions, apologies)
- Refer serious cases to local authorities

Landlords who refuse to join face civil penalties.`,
  },
  {
    id: "dss",
    title: "Discrimination against benefits tenants",
    content: `The Act reinforces the existing case law against blanket 'No DSS' policies. Refusing all housing benefit or Universal Credit claimants without individual assessment is already unlawful indirect discrimination under the Equality Act 2010 (Shelter v. Various Landlords 2020; Burnip v. Birmingham City Council 2012).

The Renters' Rights Act gives tenants an additional route to challenge discriminatory blanket bans through the PRS Ombudsman.`,
  },
  {
    id: "landlord-actions",
    title: "What landlords should do now",
    content: `1. **Register for the PRS Database** — registration will open before commencement date; landlords who are not registered when the Act comes into force face penalties.

2. **Review tenancy agreement templates** — remove clauses that are now void (blanket no-pets, rent review more than annually, references to Section 21).

3. **Understand Section 8 grounds** — map your circumstances to the available grounds. Grounds 1 and 1A (selling/moving in) require advanced notice (4+ months) and are not available in the first 12 months of a tenancy.

4. **Engage a compliance-aware letting agent or platform** — Elite Tenancy builds Right to Rent checks, referencing, and PRS compliance into the introduction process.`,
  },
];

const FAQS = [
  {
    q: "When does the Renters' Rights Act come into force?",
    a: "The Act received Royal Assent in 2025. Secondary legislation and commencement orders set the effective date for new tenancies; as of mid-2026, new tenancies in England are covered. Existing fixed-term tenancies convert to periodic on their contractual end date.",
  },
  {
    q: "Can I still evict a tenant if they don't pay rent?",
    a: "Yes. Non-payment of rent is a statutory Section 8 ground. Ground 8 (mandatory, 2+ months' arrears), Ground 10 (discretionary, any arrears), and Ground 11 (discretionary, persistent delay) all remain available. The court process for Section 8 is unchanged — landlords issue a notice then apply to court if the tenant does not leave.",
  },
  {
    q: "What if I want to sell my property?",
    a: "Ground 1A allows a landlord to repossess a property they intend to sell. This ground requires at least 4 months' notice and is not available in the first 12 months of a tenancy. The landlord must genuinely intend to sell — using the ground as a pretext for removing a tenant could result in the claim failing at court.",
  },
  {
    q: "Does the Act apply to HMOs?",
    a: "Yes. HMO rooms let under assured tenancy agreements are fully covered by the Renters' Rights Act. Excluded licences (e.g. lodger agreements where the landlord lives in the property) are outside the assured tenancy framework.",
  },
  {
    q: "Does the Act apply in Scotland or Wales?",
    a: "No. The Renters' Rights Act 2025 applies in England only. Scotland implemented similar reforms in 2017 (Private Housing (Tenancies) (Scotland) Act 2016). Wales has its own Renting Homes (Wales) Act 2016.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-amber-700 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-gray-900 text-sm">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0 text-amber-600" />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-400" />
        )}
      </button>
      {open && <p className="pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>}
    </div>
  );
}

export default function RentersRightsAct2025() {
  useSeo({
    title: "Renters' Rights Act 2025: Complete Guide for UK Landlords & Tenants",
    description:
      "Full guide to the Renters' Rights Act 2025 — abolition of Section 21, end of fixed-term ASTs, rent increase rules, pets, PRS Database, and what landlords must do now.",
    canonical: "https://www.elitetenancy.co.uk/renters-rights-act-2025",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Renters' Rights Act 2025: Complete Guide for UK Landlords and Tenants",
    description:
      "Comprehensive guide to the Renters' Rights Act 2025 including abolition of Section 21, periodic tenancies, rent increases, pets, PRS Database, and ombudsman.",
    url: "https://www.elitetenancy.co.uk/renters-rights-act-2025",
    datePublished: "2026-06-25",
    dateModified: "2026-06-25",
    publisher: {
      "@type": "Organization",
      name: "Elite Tenancy",
      url: "https://www.elitetenancy.co.uk",
    },
    about: {
      "@type": "Legislation",
      name: "Renters' Rights Act 2025",
      jurisdiction: "England",
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
      { "@type": "ListItem", position: 2, name: "Renters' Rights Act 2025", item: "https://www.elitetenancy.co.uk/renters-rights-act-2025" },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-700 text-sm font-semibold tracking-wide uppercase mb-3">UK Lettings Law</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Renters' Rights Act 2025: Complete Guide
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            The most significant reform to England's private rented sector since 1988 — what it means for landlords,
            tenants, and how to stay compliant.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Section 21 abolished", "No fixed-term ASTs", "Rent increase limits", "Pets rights", "PRS Database"].map((tag) => (
              <span key={tag} className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">
        {/* Table of contents */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-5 my-8">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contents</p>
          <ul className="space-y-1.5">
            {SECTIONS.map(({ id, title }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-sm text-amber-700 hover:underline">{title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Main content sections */}
        <div className="space-y-10">
          {SECTIONS.map(({ id, title, content }) => (
            <section key={id} id={id}>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{title}</h2>
              <div className="text-gray-700 text-sm md:text-base leading-relaxed space-y-3">
                {content.split("\n\n").map((para, i) => (
                  <p key={i} dangerouslySetInnerHTML={{
                    __html: para.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                  }} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ section */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frequently asked questions</h2>
          <p className="text-gray-500 text-sm mb-6">Common questions about the Renters' Rights Act 2025.</p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
            {FAQS.map(({ q, a }, i) => (
              <FaqItem key={i} q={q} a={a} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-amber-50 border border-amber-100 rounded-2xl p-6 md:p-8 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Letting a property in 2026?</h3>
          <p className="text-gray-600 text-sm mb-5">
            Elite Tenancy ensures every introduction is fully compliant — Right to Rent checks, PRS-ready referencing,
            and Renters' Rights Act–compliant tenancy terms.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/for-landlords" className="px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors">
              I'm a landlord
            </a>
            <a href="/rra-2025-checker" className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              Check compliance
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
