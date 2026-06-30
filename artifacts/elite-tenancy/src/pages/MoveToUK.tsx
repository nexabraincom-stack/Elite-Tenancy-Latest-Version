import { useEffect } from "react";
import { Link } from "wouter";
import { Globe, Clock, Shield, Home, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const PROFILES = [
  { icon: "💼", title: "Skilled Workers", desc: "Moving for a UK job offer on a Skilled Worker visa. We help you find a home in your employment city before your start date.", popular: true },
  { icon: "🌍", title: "Returning Expats", desc: "UK nationals returning after years abroad. Re-establishing credit history and finding quality rentals without the usual hurdles." },
  { icon: "👑", title: "Premium Relocations", desc: "High-earners and executives requiring premium or serviced accommodation. Discrete, fast-tracked lettings with full legal compliance." },
  { icon: "👨‍👩‍👧", title: "Family Relocations", desc: "Families moving for schools, work, or lifestyle. We match you to the right area based on schools, commute, and space requirements." },
];

const TIMELINE = [
  {
    when: "8–12 weeks before",
    title: "Research & budget",
    steps: [
      "Confirm your target city and commute requirements",
      "Establish your monthly budget (rent should not exceed 35–40% of net income)",
      "Open a UK bank account if possible (Monzo, Starling, Wise work without UK address)",
      "Start your Renter Passport to have your documents verified in advance",
    ],
  },
  {
    when: "4–6 weeks before",
    title: "Property search",
    steps: [
      "Search Elite Tenancy listings filtered by city, budget, and bedrooms",
      "Request virtual viewings — we arrange video walkthroughs for overseas applicants",
      "Make an offer on 1–2 suitable properties",
      "Confirm guarantor or arrange rent-in-advance if needed",
    ],
  },
  {
    when: "2–4 weeks before",
    title: "Secure the property",
    steps: [
      "Pass referencing (credit check, employment verification, landlord reference)",
      "Sign the tenancy agreement digitally — we support DocuSign and Adobe Sign",
      "Pay deposit (max 5 weeks' rent) to a government-approved scheme",
      "Arrange buildings and contents insurance if required",
    ],
  },
  {
    when: "Move-in day",
    title: "Keys & setup",
    steps: [
      "Collect keys and review the check-in inventory report",
      "Set up direct debits for rent, council tax, and utilities",
      "Register with a local GP within your first week",
      "Notify DVLA if bringing a vehicle from overseas",
    ],
  },
];

const DESTINATION_CITIES = [
  { city: "London", avgRent: "£1,500–£3,500/mo", employers: "Finance, Tech, Media, Pharma", notes: "World's most diverse city. Choose your zone by employer location." },
  { city: "Manchester", avgRent: "£900–£1,800/mo", employers: "Tech, Media, NHS, Finance", notes: "UK's fastest-growing city. 40% cheaper than London." },
  { city: "Birmingham", avgRent: "£800–£1,500/mo", employers: "HSBC UK, Jaguar Land Rover, NHS, Amazon", notes: "UK's second city, HQ for major relocations post-London." },
  { city: "Edinburgh", avgRent: "£1,000–£2,000/mo", employers: "Finance, Tech, Scottish Government, Tourism", notes: "High quality of life. Strong expat community." },
  { city: "Bristol", avgRent: "£950–£1,800/mo", employers: "Aerospace, Tech, Creative industries", notes: "Consistently voted one of the UK's best cities to live." },
  { city: "Leeds", avgRent: "£800–£1,500/mo", employers: "NHS, Finance, Legal, Tech", notes: "Thriving northern hub with strong graduate talent pool." },
];

const FAQS = [
  {
    q: "Can I rent in the UK before I arrive?",
    a: "Yes. Elite Tenancy specialises in helping overseas applicants secure UK properties before arrival. We offer virtual viewings, digital tenancy signing, and can complete the full process remotely. You will need to provide identity documents, proof of income or employment offer, and either a UK guarantor or rent in advance.",
  },
  {
    q: "Do I need a UK bank account to rent?",
    a: "You do not necessarily need a traditional UK bank account before renting. Many landlords accept international bank transfers for the initial deposit and first month's rent. However, you will need a UK account set up for monthly rent payments once you arrive. Digital banks like Monzo, Starling, or Wise can be opened before you arrive in the UK.",
  },
  {
    q: "How much deposit will I need to pay?",
    a: "Under UK law, deposits are capped at 5 weeks' rent. For a £1,500/month property, the maximum deposit is £1,730. The deposit must be protected in a government-approved scheme (DPS, MyDeposits, or TDS) within 30 days of receipt.",
  },
  {
    q: "How long does the rental process take?",
    a: "From application to signed tenancy, the process typically takes 2–4 weeks. This includes referencing (5–10 days), tenancy preparation (2–3 days), and signing. Elite Tenancy can fast-track this for overseas applicants with verified Renter Passport profiles.",
  },
  {
    q: "Do I need a UK guarantor to rent?",
    a: "Not always. Some landlords accept 3–6 months' rent in advance as an alternative to a guarantor. Professional guarantor services (Housing Hand, Homeppl) are also available for a fee. Elite Tenancy's Renter Passport helps landlords feel confident about overseas applicants, reducing the need for guarantors.",
  },
];

export default function MoveToUK() {
  useSeo({
    title: "Moving to the UK? Find Rental Property Before You Arrive | Elite Tenancy",
    description: "Relocating to the UK? Find your home before you arrive. Guides for skilled workers, expats, and families moving to the UK from overseas.",
    canonical: "https://www.elitetenancy.co.uk/move-to-uk",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld-move-to-uk";
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
    return () => { document.getElementById("faq-jsonld-move-to-uk")?.remove(); };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Moving to the UK</Badge>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
            Moving to the UK? Find Your Home Before You Arrive
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Secure your UK rental from overseas with virtual viewings, digital signing, and a dedicated team who understands international relocations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/renter-passport">Start Your Renter Passport <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/listings">Browse UK Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Profiles */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-10 text-center">We Help All Types of Relocations</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROFILES.map(({ icon, title, desc, popular }) => (
              <div key={title} className={`bg-card rounded-xl border p-6 relative ${popular ? "border-primary shadow-md" : "border-border"}`}>
                {popular && <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground text-xs">Most common</Badge>}
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-10 text-center">UK Relocation Timeline</h2>
          <div className="space-y-8">
            {TIMELINE.map(({ when, title, steps }, i) => (
              <div key={when} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs flex-shrink-0">{i + 1}</div>
                  {i < TIMELINE.length - 1 && <div className="w-0.5 bg-border flex-1 mt-2" />}
                </div>
                <div className="pb-6">
                  <Badge variant="secondary" className="mb-2">{when}</Badge>
                  <h3 className="font-semibold text-foreground mb-3">{title}</h3>
                  <ul className="space-y-1">
                    {steps.map((step) => (
                      <li key={step} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destination cities */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-10 text-center">Top Destination Cities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DESTINATION_CITIES.map(({ city, avgRent, employers, notes }) => (
              <div key={city} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{city}</h3>
                  <Badge variant="secondary" className="text-xs">{avgRent}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-1"><span className="font-medium text-foreground">Major employers:</span> {employers}</div>
                <div className="text-xs text-muted-foreground italic mt-2">{notes}</div>
                <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-primary">
                  <Link href={`/${city.toLowerCase()}`}>View {city} rentals <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal protections */}
      <section className="py-12 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display font-bold text-foreground mb-6 text-center">UK Tenant Protections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "Deposit protection", desc: "Your deposit is legally protected in a government-approved scheme. You get it back if you leave in good condition." },
              { icon: Home, title: "Right to a safe home", desc: "Landlords must maintain the property to a safe, habitable standard. You can report disrepair to the local council." },
              { icon: Globe, title: "No unfair eviction", desc: "Section 21 was abolished in May 2026. You cannot be evicted without a legal reason and proper notice." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-5">
                <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="font-semibold text-foreground text-sm mb-1">{title}</div>
                <div className="text-muted-foreground text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-8 text-center">Relocation FAQ</h2>
          <div className="space-y-5">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/listings">Browse UK Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
