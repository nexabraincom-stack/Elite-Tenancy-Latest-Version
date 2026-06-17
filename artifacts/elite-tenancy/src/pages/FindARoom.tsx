import { useState } from "react";
import { Link } from "wouter";
import {
  Search,
  Sparkles,
  ShieldCheck,
  PoundSterling,
  MapPin,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetListings } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

/**
 * /find-a-room — tenant search landing page.
 * Combines a live search experience with substantial, genuinely useful
 * content (how-it-works, popular cities, reasons to choose us, and an FAQ)
 * so the page is valuable to renters and clears the Bing "insufficient
 * content" recommendation. All claims reflect Elite Tenancy's tenant
 * introduction model: zero tenant fees, AI matching, verified listings,
 * and Renters' Rights Act 2025-ready tenancies.
 */

const POPULAR_CITIES: Array<{ name: string; href: string }> = [
  { name: "London", href: "/london" },
  { name: "Manchester", href: "/manchester" },
  { name: "Birmingham", href: "/birmingham" },
  { name: "Leeds", href: "/leeds" },
  { name: "Liverpool", href: "/liverpool" },
  { name: "Bristol", href: "/bristol" },
  { name: "Sheffield", href: "/sheffield" },
  { name: "Edinburgh", href: "/edinburgh" },
  { name: "Glasgow", href: "/glasgow" },
  { name: "Cardiff", href: "/cardiff" },
];

const STEPS: Array<{ icon: typeof Search; title: string; desc: string }> = [
  {
    icon: Search,
    title: "1. Search verified listings",
    desc: "Browse rooms, studios and flats across the UK's major cities. Filter by location, monthly budget and number of bedrooms to see only the homes that fit your search.",
  },
  {
    icon: Sparkles,
    title: "2. Get AI-matched",
    desc: "Tell us what matters to you and our matching engine scores every available property against your requirements — so the right home finds you instead of you scrolling for hours.",
  },
  {
    icon: ShieldCheck,
    title: "3. Move in with confidence",
    desc: "Connect with verified landlords, complete referencing and Right to Rent checks, and sign a Renters' Rights Act 2025-ready tenancy — all in one place, with support whenever you need it.",
  },
];

const REASONS: Array<{ icon: typeof PoundSterling; title: string; desc: string }> = [
  {
    icon: PoundSterling,
    title: "Zero tenant finder fees",
    desc: "It is free for tenants to search and apply. We never charge renters admin or finder fees — banned under the Tenant Fees Act — so the price you see is the price you pay.",
  },
  {
    icon: BadgeCheck,
    title: "Verified listings only",
    desc: "Every landlord is identity-checked and each listing is reviewed before it goes live, cutting out the duplicate adverts and rental scams that plague open classifieds sites.",
  },
  {
    icon: ShieldCheck,
    title: "Compliant tenancies",
    desc: "Six-stage referencing, digital Right to Rent checks and Renters' Rights Act 2025-ready agreements are built in, protecting you from move-in to move-out.",
  },
];

const FAQS: Array<{ q: string; a: string }> = [
  {
    q: "Is it free for tenants to find a room with Elite Tenancy?",
    a: "Yes. Searching, enquiring and applying for a room or flat is completely free for tenants. In line with the Tenant Fees Act we do not charge any finder, admin or referencing fees to renters.",
  },
  {
    q: "Which UK cities can I find rooms in?",
    a: "We list rooms, studios and flats across all major UK cities including London, Manchester, Birmingham, Leeds, Liverpool, Bristol, Sheffield, Edinburgh, Glasgow and Cardiff, with new properties added regularly.",
  },
  {
    q: "How does the AI matching work?",
    a: "When you share your budget, preferred area, move-in date and lifestyle preferences, our matching engine scores every available property against those criteria and surfaces the strongest matches first, so you spend less time searching.",
  },
  {
    q: "Are the landlords and listings verified?",
    a: "Every landlord completes identity verification and each listing is reviewed before publication. Renters can also complete a Renter Passport to speed up referencing and stand out to landlords.",
  },
  {
    q: "Can international students and overseas renters use Elite Tenancy?",
    a: "Absolutely. We support EU citizens, international students and anyone moving to the UK, including guidance on Right to Rent checks and the documents you will need before signing a tenancy.",
  },
];

export default function FindARoom() {
  useSeo({
    title: "Find a Room or Flat to Rent in the UK | Elite Tenancy",
    description:
      "Find your perfect room, studio or flat to rent across the UK. Verified listings, AI-powered matching, Right to Rent support and zero finder fees for tenants.",
    canonical: "https://www.elitetenancy.co.uk/find-a-room",
  });

  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();

  const params = {
    ...(city && { city }),
    ...(maxPrice != null && { maxPrice }),
    ...(bedrooms != null && { bedrooms }),
  };

  const { data: listings, isLoading } = useGetListings(params);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Tenant search</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Find a Room or Flat to Rent in the UK</h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            Search verified rooms, studios and flats to rent across the UK's best cities. Elite Tenancy combines
            hand-checked listings with AI-powered matching so you can find a home that genuinely fits your budget and
            lifestyle — with no finder fees and full support from search to move-in.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border/50 rounded-xl p-5 mb-8">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1.5 block">City or area</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Manchester" className="bg-background" />
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1.5 block">Max monthly rent</label>
              <Input type="number" value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="£ max" className="bg-background" />
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1.5 block">Bedrooms</label>
              <Select value={bedrooms?.toString() ?? "all"} onValueChange={(v) => setBedrooms(v === "all" ? undefined : Number(v))}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="0">Studio</SelectItem>
                  <SelectItem value="1">1 bed</SelectItem>
                  <SelectItem value="2">2 bed</SelectItem>
                  <SelectItem value="3">3+ bed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => { setCity(""); setMaxPrice(undefined); setBedrooms(undefined); }}
              variant="ghost"
              className="text-muted-foreground text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Searching..." : `${listings?.length ?? 0} properties available`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-card rounded-xl h-80 animate-pulse border border-border/50" />)}
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties match your search</h3>
            <p className="text-muted-foreground">Try widening your criteria, or explore a nearby city below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map(listing => <PropertyCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>

      {/* How it works */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">How it works</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Finding a room to rent, made simple</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
              From your first search to the day you collect the keys, Elite Tenancy guides you through every step of
              renting in the UK.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border/50 rounded-xl p-7">
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon size={21} className="text-primary" />
                </div>
                <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/find-my-match">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                Get AI-matched to a home <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Elite Tenancy */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Why renters choose us</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">A safer, fairer way to rent</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border/50 rounded-xl p-7">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={21} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-center max-w-3xl mx-auto mt-10 leading-relaxed">
          New to the UK? Our guides for{" "}
          <Link href="/eu-citizens-uk-rental-guide"><span className="text-primary hover:underline">EU citizens</span></Link>{" "}
          and{" "}
          <Link href="/international-students"><span className="text-primary hover:underline">international students</span></Link>{" "}
          explain everything from deposits to{" "}
          <Link href="/right-to-rent-check"><span className="text-primary hover:underline">Right to Rent checks</span></Link>. You can
          also build a{" "}
          <Link href="/renter-passport"><span className="text-primary hover:underline">Renter Passport</span></Link>{" "}
          to speed up referencing, or read{" "}
          <Link href="/how-it-works"><span className="text-primary hover:underline">how Elite Tenancy works</span></Link>{" "}
          end to end.
        </p>
      </section>

      {/* Popular cities */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Popular locations</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Rooms to rent by city</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">
              Explore rooms and flats to rent in the UK's most popular rental markets.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {POPULAR_CITIES.map(({ name, href }) => (
              <Link key={href} href={href}>
                <span className="inline-flex items-center gap-1.5 bg-card border border-border/60 hover:border-primary/50 rounded-full px-4 py-2 text-sm text-foreground transition-colors">
                  <MapPin size={14} className="text-primary" /> Rooms to rent in {name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">FAQs</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Finding a room: your questions answered</h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="bg-card border border-border/50 rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <h2 className="font-serif text-4xl font-bold text-foreground">Ready to find your next home?</h2>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Start searching verified listings now, or let our AI match you to the perfect room or flat — free for tenants,
          with no finder fees.
        </p>
        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/find-my-match">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
              Find my match <ArrowRight size={16} />
            </Button>
          </Link>
          <Link href="/list-your-property">
            <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">
              I'm a landlord
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
