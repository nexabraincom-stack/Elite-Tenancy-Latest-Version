import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

const INTRO_VS_FULL = [
  {
    aspect: "What you pay",
    intro: "Two weeks' rent — one-off, on completion only",
    full: "8–15% of monthly rent every month, ongoing",
  },
  {
    aspect: "When you pay",
    intro: "Only when a tenant successfully moves in",
    full: "Every month regardless of void periods or landlord satisfaction",
  },
  {
    aspect: "Tenant finding",
    intro: "Yes — advertise, shortlist, reference, and introduce",
    full: "Yes",
  },
  {
    aspect: "Ongoing management",
    intro: "No — landlord manages independently after move-in",
    full: "Yes — repairs, rent collection, renewals",
  },
  {
    aspect: "Right to Rent checks",
    intro: "Yes — built into the introduction process",
    full: "Yes",
  },
  {
    aspect: "Tenancy agreement",
    intro: "Landlord or solicitor arranges (template provided)",
    full: "Agent arranges",
  },
  {
    aspect: "Suitable for",
    intro: "Confident landlords who prefer to manage their own properties",
    full: "Landlords who want hands-off involvement after tenancy starts",
  },
];

const STEPS = [
  {
    n: "1",
    title: "List your property",
    body: "Complete your property profile. We advertise across our platform and matched tenant database.",
  },
  {
    n: "2",
    title: "AI matching",
    body: "Our algorithm matches your property to pre-registered tenants based on income, lifestyle, move-in date, and location.",
  },
  {
    n: "3",
    title: "Referencing",
    body: "We conduct full credit checks, employer references, and previous landlord references on all applicants.",
  },
  {
    n: "4",
    title: "Introduction",
    body: "We present you with a shortlist of referenced, ready-to-move tenants. You choose who to proceed with.",
  },
  {
    n: "5",
    title: "Tenancy starts",
    body: "Sign the tenancy agreement, take the deposit, collect Right to Rent documents. We provide checklists for every step.",
  },
  {
    n: "6",
    title: "Fee invoiced",
    body: "We invoice two weeks' rent on the tenancy start date. No payment until the tenant is in.",
  },
];

const SUITS = [
  "Experienced landlords who are comfortable managing day-to-day tenancy matters",
  "Landlords who want to minimise ongoing fees",
  "Portfolio landlords with a trusted in-house maintenance contractor",
  "First-time landlords who want professional referencing but plan to self-manage",
  "Landlords moving away from a full-management agent to reduce costs",
];

export default function TenantIntroductionService() {
  useSeo({
    title: "What is a Tenant Introduction Service? | Elite Tenancy UK",
    description:
      "A tenant introduction service finds, references, and introduces tenants to landlords for a one-off fee — instead of an ongoing monthly management percentage. Explained for UK landlords.",
    canonical: "https://www.elitetenancy.co.uk/tenant-introduction-service",
  });

  const definedTermSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: "Tenant Introduction Service",
    description:
      "A tenant introduction service is a letting agent service where the agent advertises a property, finds and references suitable tenants, and introduces them to the landlord for a one-off fee, without providing ongoing property management.",
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "UK Lettings Terminology",
      url: "https://www.elitetenancy.co.uk/tenant-introduction-service",
    },
    url: "https://www.elitetenancy.co.uk/tenant-introduction-service",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a tenant introduction service?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A tenant introduction service is a letting agent service where the agent advertises a property, finds and references tenants, and introduces them to the landlord for a one-off fee — without providing ongoing management. The landlord then manages the tenancy themselves.",
        },
      },
      {
        "@type": "Question",
        name: "How much does a tenant introduction service cost?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Elite Tenancy charges two weeks' rent as a one-off completion fee, payable only when a tenant moves in. Traditional letting agents charge 8–15% of monthly rent as an ongoing management fee, typically 10× more expensive over a standard 12-month tenancy.",
        },
      },
      {
        "@type": "Question",
        name: "Does a tenant introduction service include referencing?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Elite Tenancy conducts full credit checks, employer references, and previous landlord references on all tenants as part of the introduction. Right to Rent checks are also included.",
        },
      },
      {
        "@type": "Question",
        name: "Is a tenant introduction service right for me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A tenant introduction service suits landlords who are comfortable managing day-to-day tenancy matters (repairs, rent collection, renewals) themselves. If you prefer to be fully hands-off, a full-management service is more appropriate.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
      { "@type": "ListItem", position: 2, name: "Tenant Introduction Service", item: "https://www.elitetenancy.co.uk/tenant-introduction-service" },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-amber-700 text-sm font-semibold tracking-wide uppercase mb-3">For Landlords</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What is a tenant introduction service?
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            A tenant introduction service finds, references, and introduces tenants to landlords for a one-off fee —
            instead of an ongoing monthly management percentage. It is the cost-effective alternative to full letting
            agent management for landlords who prefer to run their own tenancies.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Definition callout */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 my-8">
          <h2 className="text-base font-bold text-gray-900 mb-2">Definition</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            A <strong>tenant introduction service</strong> is a letting agent service in which the agent advertises a property,
            finds and references suitable tenants, and introduces them to the landlord for a fixed, one-off fee.
            The agent's involvement ends at the point of introduction. Unlike a full management service,
            the landlord manages the tenancy (repairs, rent collection, renewals) themselves after the tenant moves in.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Elite Tenancy's introduction service works</h2>
          <div className="space-y-4">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
                  {n}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction service vs full management</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-4 font-semibold text-gray-600 w-1/3">Aspect</th>
                  <th className="text-left py-3 pr-4 font-semibold text-amber-700">Introduction (Elite Tenancy)</th>
                  <th className="text-left py-3 font-semibold text-gray-600">Full management</th>
                </tr>
              </thead>
              <tbody>
                {INTRO_VS_FULL.map(({ aspect, intro, full }) => (
                  <tr key={aspect} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-700">{aspect}</td>
                    <td className="py-3 pr-4 text-gray-800">
                      <span className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {intro}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{full}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            * On a £1,500/month property, a 10% management fee costs £1,800/year. Elite Tenancy's introduction fee is £750 (two weeks' rent) — once.
          </p>
        </section>

        {/* Who it suits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Is an introduction service right for you?</h2>
          <p className="text-gray-600 text-sm mb-4">A tenant introduction service works best for landlords who:</p>
          <ul className="space-y-2">
            {SUITS.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <XCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span>If you want to be fully hands-off after the tenant moves in, consider a full-management agent instead. We can recommend alternatives.</span>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Ready to find your next tenant?</h3>
            <p className="text-gray-600 text-sm">Pay only two weeks' rent when a tenant moves in. No upfront fees.</p>
          </div>
          <a
            href="/list-your-property"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
          >
            List your property
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
