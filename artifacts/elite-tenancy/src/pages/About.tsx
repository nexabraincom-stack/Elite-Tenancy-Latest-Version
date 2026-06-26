import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";
import { Building2, Users, ShieldCheck, Zap, Star, MapPin } from "lucide-react";

const VALUES = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-amber-600" />,
    title: "Transparency",
    body: "A single completion fee of two weeks' rent. No hidden monthly charges, no renewal fees, no ambiguity.",
  },
  {
    icon: <Zap className="w-6 h-6 text-amber-600" />,
    title: "Technology-led",
    body: "AI matching, digital Right to Rent checks, and an AI assistant — all built in-house to make lettings faster and fairer.",
  },
  {
    icon: <Users className="w-6 h-6 text-amber-600" />,
    title: "Tenant-first",
    body: "We never charge tenants a penny. Under the Tenant Fees Act 2019, it should always have been this way.",
  },
  {
    icon: <Star className="w-6 h-6 text-amber-600" />,
    title: "Quality over volume",
    body: "We pre-reference every tenant before introduction. Landlords receive a shortlist, not a flood of unvetted enquiries.",
  },
];

const TIMELINE = [
  { year: "Apr 2026", label: "Incorporated", detail: "Elite Tenancy Ltd registered at Companies House (no. 17135665)" },
  { year: "May 2026", label: "Platform launch", detail: "AI matching engine, Renter Passport, and Right to Rent check tools go live" },
  { year: "Jun 2026", label: "UK expansion", detail: "14 additional city pages launched; coverage extended to all major UK cities" },
];

export default function About() {
  useSeo({
    title: "About Elite Tenancy | Premium UK Lettings Platform — East Ham, London",
    description:
      "Elite Tenancy Ltd (Companies House no. 17135665) is a premium UK lettings platform based in East Ham, London. We connect verified landlords with pre-referenced tenants via AI-powered matching.",
    canonical: "https://www.elitetenancy.co.uk/about",
  });

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elite Tenancy",
    legalName: "Elite Tenancy Ltd",
    url: "https://www.elitetenancy.co.uk",
    logo: "https://www.elitetenancy.co.uk/logo.svg",
    image: "https://www.elitetenancy.co.uk/og-image.jpg",
    description:
      "Elite Tenancy is a premium UK lettings platform and tenant introduction service. We use AI-powered matching to connect pre-referenced tenants with verified landlords, charging landlords a transparent completion-only fee of two weeks' rent.",
    foundingDate: "2026-04-02",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 2, maxValue: 10 },
    email: "info@elitetenancy.co.uk",
    telephone: "+447446192577",
    identifier: {
      "@type": "PropertyValue",
      name: "Companies House Number",
      value: "17135665",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Office 18077, 182-184 High Street North",
      addressLocality: "East Ham",
      addressRegion: "London",
      postalCode: "E6 2JA",
      addressCountry: "GB",
    },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    sameAs: [
      "https://find-and-update.company-information.service.gov.uk/company/17135665",
      "https://twitter.com/EliteTenancy",
      "https://www.linkedin.com/company/elite-tenancy",
    ],
    knowsAbout: [
      "UK lettings law", "Renters' Rights Act 2025", "Tenant Fees Act 2019",
      "Right to Rent checks", "HMO licensing", "AI tenant matching",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
      { "@type": "ListItem", position: 2, name: "About", item: "https://www.elitetenancy.co.uk/about" },
    ],
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <div className="bg-gradient-to-b from-amber-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-700 text-sm font-semibold tracking-wide uppercase mb-3">About Elite Tenancy</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5">
            The UK lettings platform built for landlords who want to pay less — and tenants who expect more
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
            Elite Tenancy Ltd is a registered UK lettings company (Companies House no.&nbsp;17135665) based in East Ham,
            London. We combine AI-powered tenant matching with transparent, completion-only pricing to make the rental
            market work better for everyone.
          </p>
        </div>
      </div>

      {/* Mission statement */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8 md:p-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Our mission</h2>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            Traditional letting agents charge landlords 8–15% of monthly rent indefinitely.
            On a £1,500/month property, that is up to £2,700 per year — every year — for a service that largely
            ends after the tenant moves in. Elite Tenancy charges a single fee of two weeks' rent, payable only
            when a tenant successfully moves in. We believe this is fairer, more transparent, and better aligned
            with what landlords actually need.
          </p>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg mt-4">
            We also believe tenants deserve to be treated as customers, not fee-paying obstacles.
            Our platform is free for tenants. Our AI-powered Renter Passport gives tenants a voice and a profile;
            our matching algorithm ensures they see properties that actually fit them.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What we stand for</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {VALUES.map(({ icon, title, body }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company facts */}
      <div className="bg-gray-50 border-y border-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Company information</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Legal name", value: "Elite Tenancy Ltd" },
              { label: "Companies House", value: "No. 17135665" },
              { label: "Incorporated", value: "2 April 2026" },
              { label: "Registered office", value: "Office 18077, 182-184 High Street North, East Ham, London, E6 2JA" },
              { label: "Telephone", value: "+44 7446 192577" },
              { label: "Email", value: "info@elitetenancy.co.uk" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our story</h2>
        <div className="space-y-4">
          {TIMELINE.map(({ year, label, detail }) => (
            <div key={year} className="flex gap-4">
              <div className="flex-shrink-0 w-24 text-right">
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">{year}</span>
              </div>
              <div className="flex-1 pb-6 border-l border-gray-200 pl-6">
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-gray-600 text-sm mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-gray-900">Where we are</h2>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Our registered office is in East Ham, East London — one of the most active rental markets in the UK,
              with high demand from NHS workers, students, and international professionals arriving via Heathrow and
              City Airport. We serve the whole of the United Kingdom but know East London's rental market
              particularly well.
            </p>
            <address className="text-sm text-gray-700 not-italic">
              Office 18077, 182-184 High Street North<br />
              East Ham, London, E6 2JA<br />
              United Kingdom
            </address>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-3">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-5 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-colors"
            >
              Contact us
            </a>
            <a
              href="https://find-and-update.company-information.service.gov.uk/company/17135665"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Building2 className="w-4 h-4 mr-1.5" />
              Companies House
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
