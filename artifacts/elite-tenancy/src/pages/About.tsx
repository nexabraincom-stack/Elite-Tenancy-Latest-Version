import { Link } from "wouter";
import { ArrowRight, Building2, Users, ShieldCheck, Zap, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const VALUES = [
  { icon: ShieldCheck, title: "Transparency", body: "A single completion fee of two weeks' rent. No hidden monthly charges, no renewal fees, no ambiguity." },
  { icon: Zap, title: "Technology-led", body: "AI matching, digital Right to Rent checks, and an AI assistant — all built in-house to make lettings faster and fairer." },
  { icon: Users, title: "Tenant-first", body: "We never charge tenants a penny. Under the Tenant Fees Act 2019, it should always have been this way." },
  { icon: Star, title: "Quality over volume", body: "We pre-reference every tenant before introduction. Landlords receive a shortlist, not a flood of unvetted enquiries." },
];

const TIMELINE = [
  { year: "Apr 2026", label: "Incorporated", detail: "Elite Tenancy Ltd registered at Companies House (no. 17135665)" },
  { year: "May 2026", label: "Platform launch", detail: "AI matching engine, Renter Passport, and Right to Rent check tools go live" },
  { year: "Jun 2026", label: "UK expansion", detail: "14 additional city pages launched; coverage extended to all major UK cities" },
];

export default function About() {
  useSeo({
    title: "About Elite Tenancy | Premium UK Lettings Platform — East Ham, London",
    description: "Elite Tenancy Ltd (Companies House no. 17135665) is a premium UK lettings platform based in East Ham, London. We connect verified landlords with pre-referenced tenants via AI-powered matching.",
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
    description: "Elite Tenancy is a premium UK lettings platform and tenant introduction service. We use AI-powered matching to connect pre-referenced tenants with verified landlords, charging landlords a transparent completion-only fee of two weeks' rent.",
    foundingDate: "2026-04-02",
    numberOfEmployees: { "@type": "QuantitativeValue", minValue: 2, maxValue: 10 },
    email: "info@elitetenancy.co.uk",
    telephone: "+447446192577",
    identifier: { "@type": "PropertyValue", name: "Companies House Number", value: "17135665" },
    address: { "@type": "PostalAddress", streetAddress: "Office 18077, 182-184 High Street North", addressLocality: "East Ham", addressRegion: "London", postalCode: "E6 2JA", addressCountry: "GB" },
    areaServed: { "@type": "Country", name: "United Kingdom" },
    sameAs: [
      "https://find-and-update.company-information.service.gov.uk/company/17135665",
      "https://twitter.com/EliteTenancy",
      "https://www.linkedin.com/company/elite-tenancy",
    ],
    knowsAbout: ["UK lettings law", "Renters' Rights Act 2025", "Tenant Fees Act 2019", "Right to Rent checks", "HMO licensing", "AI tenant matching"],
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

      {/* Hero — navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
            About Elite Tenancy
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.1] mt-7">
            The UK lettings platform built for landlords who want to pay <em className="text-accent not-italic">less</em>
          </h1>
          <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto mt-5 leading-relaxed">
            Elite Tenancy Ltd is a registered UK lettings company (Companies House no.&nbsp;17135665) based in East Ham,
            London. We combine AI-powered tenant matching with transparent, completion-only pricing.
          </p>
        </div>
      </section>

      {/* Mission statement */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-8 md:p-10">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4 tracking-tight">Our mission</h2>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
            Traditional letting agents charge landlords 8–15% of monthly rent indefinitely.
            On a £1,500/month property, that is up to £2,700 per year — every year — for a service that largely
            ends after the tenant moves in. Elite Tenancy charges a single fee of two weeks' rent, payable only
            when a tenant successfully moves in.
          </p>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg mt-4">
            We also believe tenants deserve to be treated as customers, not fee-paying obstacles.
            Our platform is free for tenants. Our AI-powered Renter Passport gives tenants a voice and a profile;
            our matching algorithm ensures they see properties that actually fit them.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
            Our principles
          </span>
          <h2 className="font-display text-3xl font-semibold text-foreground mt-4 tracking-tight">What we stand for</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-card border border-border/40 rounded-xl p-6 shadow-sm flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center shrink-0">
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground mb-1 tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company facts — navy strip */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-display text-2xl font-semibold text-white mb-6 tracking-tight">Company information</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Legal name", value: "Elite Tenancy Ltd" },
              { label: "Companies House", value: "No. 17135665" },
              { label: "Incorporated", value: "2 April 2026" },
              { label: "Registered office", value: "Office 18077, 182-184 High Street North, East Ham, London, E6 2JA" },
              { label: "Telephone", value: "+44 7446 192577" },
              { label: "Email", value: "info@elitetenancy.co.uk" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold mb-1">{label}</p>
                <p className="text-sm font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-6 tracking-tight">Our story</h2>
        <div className="space-y-4">
          {TIMELINE.map(({ year, label, detail }) => (
            <div key={year} className="flex gap-4">
              <div className="flex-shrink-0 w-24 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">{year}</span>
              </div>
              <div className="flex-1 pb-6 border-l border-border/50 pl-6">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-muted-foreground text-sm mt-0.5">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-card border border-border/40 rounded-xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary text-accent flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">Where we are</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Our registered office is in East Ham, East London — one of the most active rental markets in the UK,
              with high demand from NHS workers, students, and international professionals arriving via Heathrow and
              City Airport. We serve the whole of the United Kingdom.
            </p>
            <address className="text-sm text-foreground not-italic">
              Office 18077, 182-184 High Street North<br />
              East Ham, London, E6 2JA<br />
              United Kingdom
            </address>
          </div>
          <div className="flex-shrink-0 flex flex-col gap-3">
            <Link href="/contact">
              <Button className="bg-accent text-white hover:bg-accent/90 font-semibold w-full gap-2 shadow-lg shadow-accent/25">
                Contact us <ArrowRight size={14} />
              </Button>
            </Link>
            <a
              href="https://find-and-update.company-information.service.gov.uk/company/17135665"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-border/60 w-full gap-1.5">
                <Building2 size={14} />
                Companies House
              </Button>
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
