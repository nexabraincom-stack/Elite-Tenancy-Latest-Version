import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, Shield, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const EU_COUNTRIES = [
  { flag: "🇩🇪", name: "Germany" },
  { flag: "🇫🇷", name: "France" },
  { flag: "🇪🇸", name: "Spain" },
  { flag: "🇮🇹", name: "Italy" },
  { flag: "🇵🇱", name: "Poland" },
  { flag: "🇳🇱", name: "Netherlands" },
  { flag: "🇷🇴", name: "Romania" },
  { flag: "🇵🇹", name: "Portugal" },
];

const KEY_FACTS = [
  {
    icon: CheckCircle2,
    title: "EUSS gives you the right to rent",
    desc: "If you have Settled or Pre-Settled Status under the EU Settlement Scheme (EUSS), you have the legal right to rent in England — confirmed via an online share code.",
  },
  {
    icon: Shield,
    title: "Online share code — no passport needed",
    desc: "Landlords verify your status online using the Home Office 'View a Tenant's Right to Rent' service. You share a code and the landlord checks it online. Quick and simple.",
  },
  {
    icon: Globe,
    title: "Pre-Settled Status is accepted",
    desc: "Pre-Settled Status (not just Settled Status) gives you the right to rent. Landlords cannot refuse your application solely because you have Pre-Settled rather than Settled Status.",
  },
  {
    icon: CheckCircle2,
    title: "No illegal fees",
    desc: "The Tenant Fees Act 2019 bans all letting agent fees charged to tenants in England. You pay only rent, a security deposit (max 5 weeks), and a holding deposit (max 1 week).",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Check your EUSS status",
    desc: "Log in to the UKVI online service to confirm you have Settled or Pre-Settled Status. If you haven't applied yet and you arrived before 31 December 2020, apply immediately — it's free.",
  },
  {
    step: "02",
    title: "Generate your share code",
    desc: "Use the 'Prove your right to rent' service on GOV.UK to generate a 9-digit share code. This gives your landlord online read-only access to verify your status. Share codes expire after 90 days.",
  },
  {
    step: "03",
    title: "Search for properties",
    desc: "Browse Elite Tenancy listings by city, price, and bedrooms. Filter by 'bills included' if you want an all-in arrangement. Our platform has no registration fee.",
  },
  {
    step: "04",
    title: "Get your Renter Passport",
    desc: "Create a free Elite Tenancy Renter Passport. It consolidates your ID, EUSS share code, income proof, and references into a single verified profile — making applications much faster.",
  },
  {
    step: "05",
    title: "Move in",
    desc: "Sign your tenancy agreement (now a rolling periodic tenancy under UK law — no fixed term). Pay your deposit into a protected scheme and collect your keys.",
  },
];

const FAQS = [
  {
    q: "Can EU citizens rent in the UK after Brexit?",
    a: "Yes. EU, EEA, and Swiss citizens who have Settled or Pre-Settled Status under the EU Settlement Scheme (EUSS) have the right to rent in England. They verify this status by sharing a code with their landlord via the Home Office online service. EU citizens who arrived in the UK after 31 December 2020 may need a visa to remain and to rent.",
  },
  {
    q: "What is the EU Settlement Scheme?",
    a: "The EU Settlement Scheme (EUSS) is a UK government programme that allows EU, EEA, and Swiss nationals who were living in the UK before 31 December 2020 to continue living and working in the UK. Applications are free and are made online. Those who qualify receive either Settled Status (5 years' continuous residence) or Pre-Settled Status (fewer than 5 years).",
  },
  {
    q: "Does Pre-Settled Status give me the right to rent?",
    a: "Yes. Pre-Settled Status gives you the right to rent in England for the duration of that status. Landlords must use the Home Office online service to verify your status and record the check. They cannot refuse to rent to you solely because you have Pre-Settled rather than Settled Status.",
  },
  {
    q: "What if I don't have EUSS status yet?",
    a: "If you arrived in the UK before 31 December 2020 and have not yet applied, apply for the EU Settlement Scheme immediately — it's free and available at gov.uk/settled-status-eu-citizens-families. While your application is pending, you may use your application as evidence of your right to rent. If you arrived after 31 December 2020, you need a UK visa to remain legally.",
  },
  {
    q: "Do I need a guarantor as an EU citizen?",
    a: "Not necessarily. Whether a guarantor is required depends on the landlord and your financial profile. If you have stable UK income, 3 months' payslips, and a good credit score, most landlords will not require a guarantor. If you are new to the UK and don't yet have UK income, a professional guarantor service may be required.",
  },
  {
    q: "What is the average rent in London for Europeans?",
    a: "Average rents in London in 2026 range from approximately £1,200/month for a studio in Zone 3 to £2,500+/month for a 1-bedroom in Zone 1. Two-bed properties in desirable areas like Canary Wharf or Battersea typically range from £2,800–£4,500/month. For European professionals, areas like South Kensington (popular with French), Canary Wharf (finance), and Shoreditch (tech) are common choices.",
  },
];

export default function EuCitizensGuide() {
  useSeo({
    title: "EU Citizens Renting in the UK 2026 — Complete Guide | Elite Tenancy",
    description: "EU citizens can rent in the UK using EU Settlement Scheme status. Guide covers EUSS, share codes, Pre-Settled Status, and finding a property.",
    canonical: "https://www.elitetenancy.co.uk/eu-citizens-uk-rental-guide",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld-eu-guide";
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
    return () => { document.getElementById("faq-jsonld-eu-guide")?.remove(); };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">For EU Citizens</Badge>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-6">
            EU Citizens: You Can Still Rent in the UK
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            If you have EU Settlement Scheme status, renting in the UK is straightforward. A simple online share code proves your right to rent to any landlord.
          </p>
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            {EU_COUNTRIES.map(({ flag, name }) => (
              <span key={name} title={name} className="text-2xl" aria-label={name}>{flag}</span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/listings">Find a UK Property <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/renter-passport">Get Your Renter Passport</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key facts */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-10 text-center">Key Facts for EU Nationals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {KEY_FACTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-card rounded-xl border border-border p-6">
                <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step by step */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-10 text-center">
            How to Rent as an EU Citizen in 5 Steps
          </h2>
          <div className="space-y-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">{step}</div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-foreground mb-8 text-center">EU Citizens Rental FAQ</h2>
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
              <Link href="/listings">Start Your UK Property Search <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
