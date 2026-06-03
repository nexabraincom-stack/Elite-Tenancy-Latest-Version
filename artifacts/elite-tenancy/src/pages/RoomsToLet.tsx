import { useParams, Link } from "wouter";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetListings } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

/**
 * Programmatic SEO city landing pages — one component, unlimited cities.
 * Route: /rooms-to-let/:city  → "Rooms & Homes to Let in [City]".
 * Targets "rooms to let [city]", "flats to rent [city]", "tenant
 * introduction [city]" searches (per the competitive intel strategy).
 */

interface CityInfo {
  name: string;
  region: string;
  blurb: string;
}

const CITIES: Record<string, CityInfo> = {
  london: { name: "London", region: "Greater London", blurb: "the UK's capital and largest rental market, from Zone 1 apartments to leafy suburban homes" },
  manchester: { name: "Manchester", region: "Greater Manchester", blurb: "the North's powerhouse — vibrant city-centre living, thriving job market and superb value versus London" },
  birmingham: { name: "Birmingham", region: "West Midlands", blurb: "the UK's second city, with the regenerated Jewellery Quarter and excellent transport links" },
  leeds: { name: "Leeds", region: "West Yorkshire", blurb: "a fast-growing financial and student hub with character period homes and modern apartments" },
  bristol: { name: "Bristol", region: "South West", blurb: "a creative, harbourside city blending Georgian elegance with a buzzing independent scene" },
  sheffield: { name: "Sheffield", region: "South Yorkshire", blurb: "a green, affordable city on the edge of the Peak District with a strong student and graduate market" },
  liverpool: { name: "Liverpool", region: "Merseyside", blurb: "a waterfront city with iconic architecture, regeneration docklands and genuine value" },
  edinburgh: { name: "Edinburgh", region: "Scotland", blurb: "Scotland's elegant capital, from Georgian New Town flats to characterful tenements" },
  cardiff: { name: "Cardiff", region: "Wales", blurb: "Wales's vibrant capital, with bayside apartments and leafy residential districts" },
  glasgow: { name: "Glasgow", region: "Scotland", blurb: "Scotland's largest city — sandstone townhouses, a thriving West End and great value" },
  harrogate: { name: "Harrogate", region: "North Yorkshire", blurb: "an elegant spa town with handsome period property and a high quality of life" },
  nottingham: { name: "Nottingham", region: "East Midlands", blurb: "a lively, well-connected city with two universities and strong rental demand" },
  newcastle: { name: "Newcastle", region: "Tyne & Wear", blurb: "a friendly riverside city with quayside apartments and excellent affordability" },
  leicester: { name: "Leicester", region: "East Midlands", blurb: "a diverse, central city with strong demand and a growing professional market" },
  coventry: { name: "Coventry", region: "West Midlands", blurb: "a regenerating university city with great connectivity to Birmingham and London" },
  brighton: { name: "Brighton", region: "East Sussex", blurb: "a stylish seaside city with creative energy and high rental demand year-round" },
  reading: { name: "Reading", region: "Berkshire", blurb: "a Thames Valley commuter hub with fast links to London and a strong tech sector" },
  cambridge: { name: "Cambridge", region: "Cambridgeshire", blurb: "a historic university and biotech city with premium, in-demand rental property" },
  oxford: { name: "Oxford", region: "Oxfordshire", blurb: "a world-famous university city with limited supply and consistently strong demand" },
  southampton: { name: "Southampton", region: "Hampshire", blurb: "a vibrant waterfront city with two universities and a busy professional market" },
  york: { name: "York", region: "North Yorkshire", blurb: "a beautiful historic city with characterful homes and a strong lettings market" },
  bath: { name: "Bath", region: "Somerset", blurb: "a UNESCO Georgian city with elegant period rentals and premium demand" },
  aberdeen: { name: "Aberdeen", region: "Scotland", blurb: "Scotland's granite city, an energy-sector hub with solid rental fundamentals" },
  belfast: { name: "Belfast", region: "Northern Ireland", blurb: "a fast-growing capital with regenerated quarters and excellent value" },
};

export default function RoomsToLet() {
  const { city: slug = "" } = useParams<{ city: string }>();
  const info = CITIES[slug.toLowerCase()];
  const cityName = info?.name ?? "";

  useSeo({
    title: info
      ? `Rooms & Homes to Let in ${cityName} 2026 | Elite Tenancy`
      : "Rooms & Homes to Let Across the UK | Elite Tenancy",
    description: info
      ? `Browse premium rooms, flats and houses to rent in ${cityName}, ${info.region}. AI-matched, verified landlords, zero tenant fees. Letting a property in ${cityName}? List free — no let, no fee.`
      : "Browse premium rentals across every major UK city. AI-matched, verified, zero tenant fees.",
    canonical: `https://www.elitetenancy.co.uk/rooms-to-let/${slug.toLowerCase()}`,
  });

  const { data: listings, isLoading } = useGetListings(info ? { city: cityName } : {});

  if (!info) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <h1 className="font-serif text-3xl text-foreground mb-3">Choose a city</h1>
          <p className="text-muted-foreground mb-8">Browse rooms and homes to let across the UK.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(CITIES).map(([s, c]) => (
              <Link key={s} href={`/rooms-to-let/${s}`} className="px-3 py-1.5 rounded-lg border border-border text-sm hover:border-primary/50 hover:text-primary transition-colors">{c.name}</Link>
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  const otherCities = Object.entries(CITIES).filter(([s]) => s !== slug.toLowerCase()).slice(0, 12);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,146,63,0.10),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3 flex items-center gap-2">
            <MapPin size={14} /> {info.region}
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground leading-tight">
            Rooms &amp; homes to let in <span className="text-accent italic">{cityName}</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Discover premium rentals in {cityName} — {info.blurb}. Every Elite Tenancy home is AI-matched to your needs and let by a verified landlord, with <strong className="text-foreground">zero tenant fees</strong>.
          </p>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/find-my-match"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">Find my match <ArrowRight size={15} /></Button></Link>
            <Link href="/list-your-property"><Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50">List a property — free</Button></Link>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif text-3xl font-bold text-foreground mb-8">
          {isLoading ? `Homes in ${cityName}` : `${listings?.length ?? 0} home${(listings?.length ?? 0) === 1 ? "" : "s"} to let in ${cityName}`}
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map((i) => <div key={i} className="bg-card rounded-xl h-80 animate-pulse border border-border/50" />)}</div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => <PropertyCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Sparkles className="mx-auto text-primary mb-3" size={28} />
            <h3 className="font-serif text-2xl text-foreground mb-2">New {cityName} homes added weekly</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create a free profile and our AI will alert you the moment a matching {cityName} property is listed.</p>
            <Link href="/find-my-match"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">Set up alerts <ArrowRight size={15} /></Button></Link>
          </div>
        )}
      </section>

      {/* Landlord CTA */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">Letting a property in {cityName}?</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">List free and pay only when we place a tenant — two weeks' rent introduction or 8% managed. No upfront fees, no empty-room risk.</p>
          <Link href="/list-your-property"><Button size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">List your {cityName} property <ArrowRight size={15} /></Button></Link>
        </div>
      </section>

      {/* Other cities — internal linking */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif text-2xl font-bold text-foreground mb-5">Explore other cities</h2>
        <div className="flex flex-wrap gap-2">
          {otherCities.map(([s, c]) => (
            <Link key={s} href={`/rooms-to-let/${s}`} className="px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors">
              Rooms in {c.name}
            </Link>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
