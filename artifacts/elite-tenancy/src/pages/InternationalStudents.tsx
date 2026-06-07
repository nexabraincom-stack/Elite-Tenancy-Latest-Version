import { useEffect } from "react";
import { Link } from "wouter";
import { GraduationCap, Globe, Home, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const STUDENT_ORIGINS = [
  { country: "India", flag: "🇮🇳", students: "126,000+", topUnis: "UCL, Imperial, Manchester, Edinburgh" },
  { country: "Nigeria", flag: "🇳🇬", students: "27,000+", topUnis: "London Met, Coventry, Greenwich" },
  { country: "China", flag: "🇨🇳", students: "151,000+", topUnis: "LSE, King's College, Manchester, Edinburgh" },
  { country: "USA", flag: "🇺🇸", students: "18,000+", topUnis: "Oxford, Cambridge, LSE, Warwick" },
  { country: "UAE", flag: "🇦🇪", students: "7,000+", topUnis: "UCL, King's College, City" },
  { country: "Singapore", flag: "🇸🇬", students: "5,000+", topUnis: "LSE, Imperial, Cambridge" },
  { country: "Australia", flag: "🇦🇺", students: "8,000+", topUnis: "Oxford, Exeter, Bristol" },
];

const UNIVERSITY_CITIES = [
  { city: "London", avgRent: "£900–£1,800/mo", topUnis: "UCL, Imperial, LSE, King's, City", notes: "Zones 1–3 best for most universities" },
  { city: "Manchester", avgRent: "£600–£1,100/mo", topUnis: "University of Manchester, MMU", notes: "Fallowfield and Rusholme popular with students" },
  { city: "Edinburgh", avgRent: "£700–£1,200/mo", topUnis: "University of Edinburgh, Heriot-Watt", notes: "Book early — high demand in September" },
  { city: "Birmingham", avgRent: "£550–£950/mo", topUnis: "University of Birmingham, Aston, BCU", notes: "Selly Oak popular for UoB students" },
  { city: "Leeds", avgRent: "£550–£900/mo", topUnis: "University of Leeds, Leeds Beckett", notes: "Headingley is the student hub" },
  { city: "Bristol", avgRent: "£650–£1,100/mo", topUnis: "University of Bristol, UWE", notes: "Clifton and Stokes Croft popular" },
];

const STEPS = [
  {
    step: "01",
    title: "Get your Student visa sorted first",
    desc: "You must have a confirmed university offer and a valid UK Student visa (or BRP) to pass the Right to Rent check. Landlords in England are legally required to verify this before granting a tenancy.",
  },
  {
    step: "02",
    title: "Create your Renter Passport",
    desc: "Your free Elite Tenancy Renter Passport consolidates your verified identity, student status, and income proof (or guarantor details) into a single trusted profile — making landlords far more likely to accept you.",
  },
  {
    step: "03",
    title: "Search from your home country",
    desc: "Browse verified listings on Elite Tenancy before you arrive. We can arrange virtual viewings and hold a property with a reservation deposit so you arrive with a home confirmed.",
  },
  {
    step: "04",
    title: "Arrange a guarantor or rent in advance",
    desc: "Most landlords require either a UK-based guarantor or 3–6 months' rent in advance for international students. We can connect you with professional guarantor services if you don't have a UK contact.",
  },
  {
    step: "05",
    title: "Sign your tenancy agreement",
    desc: "All tenancies in England are now rolling assured periodic tenancies (under the Renters' Rights Act 2025). You can end the tenancy with 2 months' notice at any time — no fixed term to worry about.",
  },
];

const FAQS = [
  {
    q: "Can international students rent privately in the UK?",
    a: "Yes. International students with a valid UK Student visa (or those from countries with a separate arrangement such as Ireland) can rent private properties in England. Landlords are required to conduct a Right to Rent check, which your student visa satisfies.",
  },
  {
    q: "Do I need a guarantor as an international student?",
    a: "Most private landlords will require a UK-based guarantor — someone who agrees to pay the rent if you cannot. If you don't have a UK contact, professional guarantor services such as Housing Hand or Homeppl offer this for a fee. Alternatively, you can offer 3–6 months' rent in advance.",
  },
  {
    q: "How much does it cost to rent near UK universities?",
    a: "Average rents vary widely: London £900–£1,800/month, Manchester £600–£1,100/month, Edinburgh £700–£1,200/month, Birmingham £550–£950/month. Always budget for a 5-week deposit on top of your first month's rent.",
  },
  {
    q: "What documents do I need to rent in the UK as an international student?",
    a: "You will typically need your passport, UK Student visa or BRP, university offer letter or student ID, proof of income or guarantor details, and 3 months' bank statements (or a letter from your sponsor). Elite Tenancy's Renter Passport consolidates these into a verified digital profile.",
  },
  {
    q: "Does my Student visa give me the right to rent in England?",
    a: "Yes. A valid UK Student visa (Tier 4 or new Student visa) gives you the right to rent in England for the duration of your visa. Your landlord will verify this via your vignette sticker or BRP, or using the Home Office online share code service.",
  },
];

export default function InternationalStudents() {
  useSeo({
    title: "UK Student Accommodation for International Students 2026 | Elite Tenancy",
    description: "Find UK student accommodation as an international student. Right to Rent for students, guarantor options, university city guides, and average rents.",
    canonical: "https://www.elitetenancy.co.uk/international-students",
  });

  // Inject FAQPage JSON-LD
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld-intl-students";
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
    return () => { document.getElementById("faq-jsonld-intl-students")?.remove(); };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">International Students</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
            UK Student Accommodation for International Students
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Find verified private rentals near your UK university — from India, Nigeria, China, the USA, UAE, and beyond. Arrange your home before you arrive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/find-a-room">Find Student Accommodation <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/renter-passport">Get Your Renter Passport</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Student origins */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4 text-center">
            Helping Students from Around the World
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            Over 700,000 international students study in the UK each year. We help you find a home regardless of where you're coming from.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {STUDENT_ORIGINS.map(({ country, flag, students, topUnis }) => (
              <div key={country} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-2">{flag}</div>
                <div className="font-semibold text-foreground">{country}</div>
                <div className="text-sm text-primary font-medium">{students} students</div>
                <div className="text-xs text-muted-foreground mt-1">{topUnis}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to rent step by step */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-10 text-center">
            How to Rent in the UK as an International Student
          </h2>
          <div className="space-y-6">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* University cities */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4 text-center">
            University Cities — Average Rents 2026
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {UNIVERSITY_CITIES.map(({ city, avgRent, topUnis, notes }) => (
              <div key={city} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{city}</h3>
                  <Badge variant="secondary">{avgRent}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">Top unis:</span> {topUnis}
                </div>
                <div className="text-xs text-muted-foreground italic">{notes}</div>
                <Button asChild variant="ghost" size="sm" className="mt-4 p-0 h-auto text-primary">
                  <Link href={`/${city.toLowerCase()}`}>View {city} listings <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal protections */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6 text-center">
            Your Rights as a Tenant in the UK
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Section 21 abolished", desc: "Landlords can no longer evict you without a legal reason. You have far stronger security of tenure since 1 May 2026." },
              { icon: CheckCircle2, title: "Deposit protection", desc: "Your deposit (maximum 5 weeks' rent) must be held in a government-approved protection scheme within 30 days of payment." },
              { icon: Home, title: "Fit for habitation", desc: "Your landlord must keep the property safe, warm, and in good repair. You can report hazards to the council if they refuse." },
              { icon: Globe, title: "No discrimination", desc: "Landlords cannot discriminate against you because of your nationality or benefits status. You have the same rights as any other tenant." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 bg-background rounded-xl border border-border p-5">
                <Icon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-foreground text-sm">{title}</div>
                  <div className="text-muted-foreground text-sm mt-1">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {FAQS.map(({ q, a }) => (
              <div key={q} className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                <p className="text-muted-foreground text-sm">{a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/find-a-room">Find Your Student Room <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
