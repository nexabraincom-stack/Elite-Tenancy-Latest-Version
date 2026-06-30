import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const FAQS = [
  { category: "About Elite Tenancy", q: "What is Elite Tenancy?", a: "Elite Tenancy is a premium UK lettings platform and tenant introduction service. We connect high-quality, referenced tenants with verified landlords, using AI-powered matching. Landlords pay a transparent completion-only fee of two weeks' rent — no upfront costs, no monthly management commission." },
  { category: "About Elite Tenancy", q: "Is Elite Tenancy a registered company?", a: "Yes. Elite Tenancy Ltd is registered at Companies House under number 17135665, incorporated on 2 April 2026. Our registered office is: Office 18077, 182-184 High Street North, East Ham, London, E6 2JA." },
  { category: "About Elite Tenancy", q: "What areas does Elite Tenancy operate in?", a: "Elite Tenancy operates UK-wide, with a concentration in London (particularly East London — East Ham, Stratford, Newham, Ilford, Barking, Forest Gate, Beckton) and all major UK cities including Manchester, Birmingham, Leeds, Liverpool, Sheffield, Bristol, Edinburgh, Glasgow, Cardiff, Nottingham, Leicester, and Newcastle." },
  { category: "About Elite Tenancy", q: "What makes Elite Tenancy different from a traditional letting agent?", a: "Traditional letting agents charge landlords 8–15% of monthly rent as an ongoing management fee. Elite Tenancy charges a single completion fee of two weeks' rent, payable only when a tenant moves in — saving landlords thousands over the tenancy. We also offer AI-powered tenant matching, built-in Right to Rent checks, and digital-first processes." },
  { category: "Pricing & Fees", q: "How much does Elite Tenancy cost landlords?", a: "Landlords pay two weeks' rent as a one-off completion fee when a tenant successfully moves in. There are no upfront fees, no monthly management charges, and no renewal fees. If we don't find a tenant, you pay nothing." },
  { category: "Pricing & Fees", q: "Is there a fee for tenants to use Elite Tenancy?", a: "No. Tenants use Elite Tenancy free of charge. Under the Tenant Fees Act 2019, landlords and agents cannot charge tenants any fees except for holding deposits, damage deposits, and rent. We comply fully with this legislation." },
  { category: "Pricing & Fees", q: "What is a completion-only fee?", a: "A completion-only fee means you pay only when the tenancy actually starts — when a tenant moves into the property. If the process falls through at any stage, you owe nothing. This aligns our incentives with yours: we only get paid when you get a tenant." },
  { category: "For Tenants", q: "How does the Renter Passport work?", a: "The Renter Passport is a digital tenant profile powered by AI. Tenants complete their profile (employment, income, references, move-in date, preferred area), and our AI writes a landlord-facing summary and calculates a readiness score. Landlords can view Renter Passports directly, making the introduction faster and more transparent for both sides." },
  { category: "For Tenants", q: "How does AI tenant matching work?", a: "Our matching algorithm cross-references your Renter Passport (income, lifestyle, preferences, move-in timeline) against every active property. It scores each match and returns your top properties ranked by compatibility. Unlike basic filter-and-search, it considers factors like tenant–landlord fit, commute, and reference strength." },
  { category: "For Tenants", q: "What references does Elite Tenancy require?", a: "We conduct credit checks, employer references (or self-employment accountant letters), and previous landlord references. For international tenants or those with non-standard employment, we offer alternative referencing options, including larger deposits or guarantors, in line with the Renters' Rights Act 2025." },
  { category: "For Tenants", q: "Can I rent through Elite Tenancy if I have a poor credit history?", a: "We consider applications on a case-by-case basis. Tenants with adverse credit may qualify with a larger deposit (capped under the Tenant Fees Act), a UK-based guarantor, or six months' rent in advance. Contact us to discuss your specific situation." },
  { category: "For Tenants", q: "Can international students or workers rent through Elite Tenancy?", a: "Yes. We regularly place international students, NHS workers, and overseas employees. We have a dedicated International Students page with guidance on visa requirements, Right to Rent documentation, and referencing options for non-UK nationals." },
  { category: "For Landlords", q: "How do I list my property with Elite Tenancy?", a: "Click 'List Your Property' on our website and complete the property details form. A member of our team will contact you within one business day to confirm the listing and arrange photos if needed. Your property goes live on our platform and is matched to suitable tenants in our database." },
  { category: "For Landlords", q: "How quickly can Elite Tenancy find me a tenant?", a: "For well-priced properties in high-demand areas (London, Manchester, Birmingham), we typically produce shortlisted, referenced applicants within 5–14 days of listing. More specialist properties or rural locations may take longer. We maintain an active database of pre-referenced tenants looking now." },
  { category: "For Landlords", q: "Does Elite Tenancy manage my property after the tenant moves in?", a: "No — Elite Tenancy is an introduction service, not a full management service. Once we have introduced the tenant and the tenancy agreement is signed, you manage the property yourself (or appoint your own managing agent). This is how we keep costs low for landlords." },
  { category: "For Landlords", q: "What is the Verify a Landlord tool?", a: "Verify a Landlord lets prospective tenants check a landlord's identity against Companies House records — useful for limited company landlords. It also allows landlords to register their verified status publicly, which helps build trust with quality tenants." },
  { category: "UK Rental Law", q: "What does the Renters' Rights Act 2025 mean for landlords?", a: "The Renters' Rights Act 2025 (effective from 2026) abolishes Section 21 'no-fault' evictions, converts all assured shorthold tenancies to assured periodic tenancies, introduces a private rented sector database, and strengthens tenants' rights on rent increases and property standards. Landlords can still end tenancies on valid grounds under Section 8." },
  { category: "UK Rental Law", q: "Is a 6-month fixed-term tenancy still possible after the Renters' Rights Act?", a: "New tenancies created after the Renters' Rights Act commencement date are assured periodic tenancies by default. Fixed-term tenancies are no longer possible for new lets. Existing fixed-term tenancies continue until their end date and then convert to periodic. Tenants gain the right to leave with two months' notice at any time." },
  { category: "UK Rental Law", q: "What is Right to Rent and who needs to check it?", a: "Right to Rent is the legal requirement for landlords in England to verify that all adult occupants have the right to live in the UK before a tenancy begins. Failure to conduct a compliant check can result in a civil penalty of up to £20,000 per occupant. Elite Tenancy provides a built-in Right to Rent check tool using the UK Home Office share code system." },
  { category: "UK Rental Law", q: "What is the maximum deposit a landlord can charge in the UK?", a: "Under the Tenant Fees Act 2019, the security deposit is capped at five weeks' rent where the annual rent is under £50,000, or six weeks' rent where it is £50,000 or above. Holding deposits are capped at one week's rent." },
  { category: "UK Rental Law", q: "Can a landlord refuse pets in 2026?", a: "The Renters' Rights Act 2025 gives tenants the right to request a pet and requires landlords to consider the request and only decline on reasonable grounds. Landlords can require a tenant to take out pet damage insurance. A blanket 'no pets' clause in a tenancy agreement is no longer enforceable." },
  { category: "UK Rental Law", q: "Can a landlord refuse benefits tenants (DSS) in 2026?", a: "Blanket 'No DSS' policies are unlawful indirect discrimination. Multiple court rulings and the Equality Act 2010 confirm that refusing all housing benefit or Universal Credit claimants without individual assessment is discriminatory. Landlords must assess each applicant on their own merits." },
  { category: "East London & East Ham", q: "What is average rent in East Ham, London in 2026?", a: "Based on ONS and market data, average rent in East Ham (E6) in 2026 is approximately £1,910 per month for a whole property, up around 8.5% year-on-year. Room rents in HMOs average around £780–£850 per month including bills. East Ham remains significantly cheaper than Central London while benefiting from fast District and Hammersmith & City Line connections." },
  { category: "East London & East Ham", q: "Do I need a landlord licence in Newham (East Ham) in 2026?", a: "Newham Council operates a borough-wide selective licensing scheme requiring most private rented properties to hold a licence. Mandatory HMO licences apply for properties with 5+ occupants forming 2+ households. Additional HMO licences apply for smaller HMOs in designated areas. Fees start at approximately £750 for a 5-year selective licence. Elite Tenancy verifies licence compliance for all listed Newham properties." },
  { category: "East London & East Ham", q: "What transport links does East Ham have?", a: "East Ham station is served by the District Line and Hammersmith & City Line, giving direct access to the City (Aldgate: ~15 min), West End (Victoria: ~35 min), and Canary Wharf via change. Crossrail (Elizabeth Line) at Canning Town is 5 minutes away. The A13 and North Circular (A406) provide road access." },
  { category: "Technology", q: "Does Elite Tenancy use AI? How?", a: "Yes. Our 'Ellie' AI assistant answers tenancy questions 24/7. Our matching algorithm analyses Renter Passport data to score tenant–property compatibility. Our Renter Passport uses AI to write a landlord-ready tenant summary from structured profile data. We also use AI to automate tenant follow-ups and property recommendations." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-accent transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-foreground text-sm md:text-base leading-snug">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 flex-shrink-0 text-accent" />
        ) : (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <p className="pb-5 text-muted-foreground text-sm md:text-base leading-relaxed">{a}</p>
      )}
    </div>
  );
}

const CATEGORIES = [...new Set(FAQS.map((f) => f.category))];

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const displayed = activeCategory === "All"
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory);

  useSeo({
    title: "UK Lettings FAQ 2026 — Elite Tenancy | Landlords & Tenants",
    description: "Answers to 25+ common questions about UK lettings, the Renters' Rights Act 2025, Right to Rent, tenant fees, deposits, HMO licences, and how Elite Tenancy works.",
    canonical: "https://www.elitetenancy.co.uk/faq",
  });

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
              { "@type": "ListItem", position: 2, name: "FAQ", item: "https://www.elitetenancy.co.uk/faq" },
            ],
          }),
        }}
      />

      {/* Hero — navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
            Help Centre
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight mt-7">
            UK Lettings FAQ <em className="text-accent not-italic">2026</em>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mt-5">
            Everything you need to know about renting and letting in the UK — from the Renters' Rights Act
            to Right to Rent checks, deposit caps, HMO licences, and how Elite Tenancy works.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border/40 px-6">
          {displayed.map(({ q, a }, i) => (
            <FaqItem key={i} q={q} a={a} />
          ))}
        </div>

        <p className="text-center text-muted-foreground text-sm mt-10">
          Can't find what you're looking for?{" "}
          <a href="/contact" className="text-accent font-medium hover:underline">Contact our team</a>
          {" "}or ask{" "}
          <a href="/find-my-match" className="text-accent font-medium hover:underline">Ellie, our AI assistant</a>.
        </p>
      </div>
    </PublicLayout>
  );
}
