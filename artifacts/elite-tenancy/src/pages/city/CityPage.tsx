import { Link } from "wouter";
import { MapPin, Star, Shield, Clock, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

export interface CityPageProps {
  city: string;
  region: string;
  heroTagline: string;
  avgRent: string;
  listingCount: number;
  popularAreas: string[];
  highlights: string[];
  faqs: Array<{ q: string; a: string }>;
  /** URL slug; defaults to the lowercased city name. Pass explicitly for multi-word cities (e.g. "milton-keynes"). */
  slug?: string;
}

export default function CityPage({
  city,
  region,
  heroTagline,
  avgRent,
  listingCount,
  popularAreas,
  highlights,
  faqs,
  slug,
}: CityPageProps) {
  const citySlug = slug ?? city.toLowerCase();
  const canonical = `https://www.elitetenancy.co.uk/${citySlug}`;

  useSeo({
    title: `Premium Rentals & Tenant Introduction in ${city}`,
    description: `Find premium rental properties in ${city}, ${region} with Elite Tenancy. Verified landlords, AI-powered matching, and a transparent completion-only fee. Average rent ${avgRent}/month.`,
    canonical,
  });

  return (
    <PublicLayout>
      {/* SEO structured data — RealEstateAgent */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            name: `Elite Tenancy ${city}`,
            description: `Premium rental properties in ${city}, ${region}. Find your perfect home with Elite Tenancy.`,
            url: canonical,
            areaServed: {
              "@type": "City",
              name: city,
              containedIn: region,
            },
          }),
        }}
      />

      {/* SEO structured data — FAQPage (AEO / Google AI Overviews / People Also Ask) */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map(({ q, a }) => ({
                "@type": "Question",
                name: q,
                acceptedAnswer: { "@type": "Answer", text: a },
              })),
            }),
          }}
        />
      )}

      {/* SEO structured data — BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elitetenancy.co.uk/" },
              { "@type": "ListItem", position: 2, name: `Rentals in ${city}`, item: canonical },
            ],
          }),
        }}
      />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
            <MapPin size={14} />
            {city}, {region}
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Premium Rentals in <span className="text-primary">{city}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {heroTagline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/listings?city=${city}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                Browse {city} Listings
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link href="/find-my-match">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                AI Tenant Matching
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-card/50 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-serif text-3xl font-bold text-primary">{listingCount}+</p>
            <p className="text-sm text-muted-foreground mt-1">Active Listings</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-primary">{avgRent}</p>
            <p className="text-sm text-muted-foreground mt-1">Avg Monthly Rent</p>
          </div>
          <div>
            <p className="font-serif text-3xl font-bold text-primary">48h</p>
            <p className="text-sm text-muted-foreground mt-1">Avg Response Time</p>
          </div>
        </div>
      </section>

      {/* Popular Areas */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
            Popular Areas in {city}
          </h2>
          <p className="text-muted-foreground mb-8">
            Explore our curated selection across {city}'s most sought-after neighbourhoods.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {popularAreas.map((area) => (
              <Link key={area} href={`/listings?city=${city}&area=${area}`}>
                <div className="group flex items-center gap-2 bg-card border border-border/50 hover:border-primary/40 hover:bg-primary/5 rounded-xl p-4 transition-all cursor-pointer">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">
                    {area}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Elite Tenancy in This City */}
      <section className="py-16 px-4 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
            Why Rent with Elite Tenancy in {city}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highlights.map((highlight) => (
              <div key={highlight} className="flex items-start gap-3 bg-card border border-border/50 rounded-xl p-5">
                <CheckCircle size={18} className="text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">{highlight}</p>
              </div>
            ))}
            <div className="flex items-start gap-3 bg-card border border-border/50 rounded-xl p-5">
              <Shield size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">All landlords verified and registered with the Property Redress Scheme</p>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border/50 rounded-xl p-5">
              <Star size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">AI-powered matching finds your ideal property in minutes, not weeks</p>
            </div>
            <div className="flex items-start gap-3 bg-card border border-border/50 rounded-xl p-5">
              <Clock size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">Dedicated tenant portal: pay rent, report maintenance, access documents — all in one place</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-8 text-center">
            Renting in {city} — FAQs
          </h2>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <div key={q} className="bg-card border border-border/50 rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary/5 border-t border-primary/10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Ready to find your home in {city}?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of tenants who found their perfect property through Elite Tenancy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/listings?city=${city}`}>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
                View {city} Properties
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="font-semibold px-8">
                Speak to Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
