import { useEffect } from "react";
import { Link } from "wouter";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const EUROPEAN_CITIES = [
  { city: "Berlin", flag: "🇩🇪", flightTime: "2h", avgLondonRent: "£1,400–£2,800/mo", popularAreas: "Shoreditch, Dalston, Hackney", notes: "Tech workers and creatives. East London feels like home." },
  { city: "Paris", flag: "🇫🇷", flightTime: "1h15m", avgLondonRent: "£1,200–£2,500/mo", popularAreas: "South Kensington, Chelsea, Battersea", notes: "Strong French community in SW3 and SW7." },
  { city: "Madrid", flag: "🇪🇸", flightTime: "2h30m", avgLondonRent: "£1,100–£2,200/mo", popularAreas: "Brixton, Elephant & Castle, Hackney", notes: "Spanish community growing in South London." },
  { city: "Milan", flag: "🇮🇹", flightTime: "2h", avgLondonRent: "£1,200–£2,500/mo", popularAreas: "Notting Hill, Kensington, Fulham", notes: "Italian professionals popular in W and SW London." },
  { city: "Amsterdam", flag: "🇳🇱", flightTime: "1h15m", avgLondonRent: "£1,300–£2,600/mo", popularAreas: "Canary Wharf, Stratford, Greenwich", notes: "Finance and tech workers drawn to East London." },
  { city: "Warsaw", flag: "🇵🇱", flightTime: "2h45m", avgLondonRent: "£900–£1,800/mo", popularAreas: "Ealing, Hammersmith, Acton", notes: "Large Polish community in West London boroughs." },
];

const NEIGHBOURHOODS = [
  {
    area: "South Kensington",
    vibe: "French Quarter",
    desc: "Home to the French Lycée, Institut Français, and a strong French expat community. Elegant Victorian streets, world-class museums nearby.",
    avgRent: "£2,200–£4,500/mo",
    bestFor: "French professionals and families",
  },
  {
    area: "Canary Wharf",
    vibe: "Finance Hub",
    desc: "Europe's second-largest financial district. German, Dutch, and Scandinavian banking professionals predominate. Modern towers, excellent transport.",
    avgRent: "£1,800–£3,500/mo",
    bestFor: "European finance workers",
  },
  {
    area: "Shoreditch & Hackney",
    vibe: "Tech & Creative",
    desc: "London's Silicon Roundabout. German, French, and Dutch tech workers. Vibrant café culture, cycling infrastructure, independent restaurants.",
    avgRent: "£1,400–£2,800/mo",
    bestFor: "Tech workers from Berlin, Amsterdam",
  },
  {
    area: "Clapham",
    vibe: "Young Professionals",
    desc: "One of London's most popular areas for young European professionals. Great nightlife, Clapham Common, strong social scene.",
    avgRent: "£1,500–£3,000/mo",
    bestFor: "Young Europeans aged 25–35",
  },
  {
    area: "Mayfair & Marylebone",
    vibe: "Premium Living",
    desc: "Central London's finest addresses. Italian and French professionals, diplomats, and executives. Walking distance to Hyde Park and the West End.",
    avgRent: "£3,000–£8,000+/mo",
    bestFor: "Senior executives from Italy, France",
  },
  {
    area: "Ealing",
    vibe: "Family Friendly",
    desc: "London's 'Queen of the Suburbs'. Large Polish and broader European community. Excellent state and independent schools, more affordable rents.",
    avgRent: "£1,200–£2,400/mo",
    bestFor: "Polish and Eastern European families",
  },
];

const EUROSTAR = [
  { from: "Paris Gare du Nord", to: "London St Pancras", time: "2h16m", frequency: "~18 trains/day" },
  { from: "Brussels-Midi", to: "London St Pancras", time: "1h51m", frequency: "~9 trains/day" },
  { from: "Amsterdam Centraal", to: "London St Pancras", time: "3h52m", frequency: "~5 trains/day" },
];

const FAQS = [
  {
    q: "Can Europeans rent in London after Brexit?",
    a: "Yes. Europeans with EU Settlement Scheme (EUSS) Settled or Pre-Settled Status can rent in London. You prove your right to rent using an online share code from the Home Office 'Prove your right to rent in England' service. Europeans who arrived after 31 December 2020 need a valid UK visa.",
  },
  {
    q: "What is the average rent in London in 2026?",
    a: "Average rents in London in 2026: Studio £1,200–£1,800/mo, 1-bed £1,500–£2,800/mo, 2-bed £2,000–£4,500/mo. Zone 1–2 is most expensive; Zones 3–4 offer better value. Popular European areas like South Kensington (French) and Ealing (Polish) sit at different price points within these ranges.",
  },
  {
    q: "Is London more expensive than Paris or Berlin?",
    a: "London is generally more expensive than both Paris and Berlin. A 1-bedroom flat in Central London averages £2,000–£2,800/month vs €1,500–€2,200 in central Paris and €1,200–€1,800 in central Berlin. However, London salaries in finance and tech are typically 30–40% higher, and there is no income tax equivalent to France's social charges.",
  },
  {
    q: "What documents do I need to rent in London as a European?",
    a: "You will need: your passport, your EUSS share code (9-digit code from the Home Office service), 3 months' payslips or proof of income, a reference from a previous landlord if available. Elite Tenancy's Renter Passport consolidates these into a verified digital profile that most landlords accept without additional paperwork.",
  },
  {
    q: "Which areas of London are most popular with Europeans?",
    a: "French: South Kensington, Chelsea, Battersea. German: Shoreditch, Canary Wharf, Hammersmith. Italian: Notting Hill, Kensington, Fulham. Spanish: Brixton, Elephant & Castle. Polish: Ealing, Hammersmith, Acton. Dutch: Canary Wharf, Greenwich, Stratford.",
  },
];

export default function LondonRentalsEurope() {
  useSeo({
    title: "London Rentals for Europeans 2026 | Elite Tenancy",
    description: "Find London rentals as a European national. Area guides for Germans, French, Spanish, Italian, Polish, and Dutch professionals moving to London.",
    canonical: "https://www.elitetenancy.co.uk/london-rentals-for-europeans",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld-london-europe";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
    document.head.appendChild(script);
    return () => { document.getElementById("faq-jsonld-london-europe")?.remove(); };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">London Rentals for Europeans</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
            London Rentals for Europeans in 2026
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Relocating from Berlin, Paris, Madrid, Milan, Amsterdam, or Warsaw? Find your London home with our area guides and EU Settlement Scheme support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/london">Browse London Listings <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/eu-citizens-uk-rental-guide">EU Citizens Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* European city cards */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-10 text-center">Moving from European Cities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EUROPEAN_CITIES.map(({ city, flag, flightTime, avgLondonRent, popularAreas, notes }) => (
              <div key={city} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{flag}</span>
                  <div>
                    <div className="font-semibold text-foreground">{city}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {flightTime} flight
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">London rent:</span> {avgLondonRent}
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  <span className="font-medium text-foreground">Popular areas:</span> {popularAreas}
                </div>
                <div className="text-xs text-muted-foreground italic mt-2">{notes}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best neighbourhoods */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-10 text-center">Best London Neighbourhoods for European Professionals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {NEIGHBOURHOODS.map(({ area, vibe, desc, avgRent, bestFor }) => (
              <div key={area} className="bg-background rounded-xl border border-border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{area}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">{vibe}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">{avgRent}</div>
                    <div className="text-xs text-muted-foreground">avg rent</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{desc}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Best for: {bestFor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eurostar connections */}
      <section className="py-12 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6 text-center">European Connections</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-4 text-foreground font-semibold">From</th>
                  <th className="text-left py-3 pr-4 text-foreground font-semibold">To</th>
                  <th className="text-left py-3 pr-4 text-foreground font-semibold">Journey time</th>
                  <th className="text-left py-3 text-foreground font-semibold">Frequency</th>
                </tr>
              </thead>
              <tbody>
                {EUROSTAR.map(({ from, to, time, frequency }) => (
                  <tr key={from} className="border-b border-border/50">
                    <td className="py-3 pr-4 text-muted-foreground">{from}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{to}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">{time}</td>
                    <td className="py-3 text-muted-foreground">{frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">London Rentals for Europeans — FAQ</h2>
          <div className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-background rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/london">Browse London Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
