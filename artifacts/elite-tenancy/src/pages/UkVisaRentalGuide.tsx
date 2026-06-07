import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle2, X, Shield, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

type VisaStatus = "yes" | "no" | "conditional";

const VISA_TYPES: { visa: string; rightToRent: VisaStatus; notes: string }[] = [
  { visa: "Skilled Worker", rightToRent: "yes", notes: "Full right to rent for visa duration. BRP or eVisa share code." },
  { visa: "Graduate Visa", rightToRent: "yes", notes: "Full right to rent for 2 years post-graduation." },
  { visa: "Student Visa", rightToRent: "yes", notes: "Right to rent for duration of studies. Landlord must do follow-up check at visa expiry." },
  { visa: "EU Settled Status", rightToRent: "yes", notes: "Indefinite right to rent. Verified via Home Office online share code." },
  { visa: "EU Pre-Settled Status", rightToRent: "yes", notes: "Right to rent for duration of Pre-Settled Status. Follow-up check required." },
  { visa: "UK Family Visa", rightToRent: "yes", notes: "Right to rent for duration of visa. BRP or eVisa." },
  { visa: "Visitor Visa", rightToRent: "no", notes: "No right to rent in England. Cannot be a named tenant." },
  { visa: "Pending BRP / eVisa", rightToRent: "conditional", notes: "UKVI can provide a letter confirming right to rent while BRP is being issued." },
];

const DOCUMENTS = [
  { category: "Identity", items: ["Passport (biometric preferred)", "Biometric Residence Permit (BRP)", "eVisa share code (9-digit)"] },
  { category: "Immigration status", items: ["Home Office share code (via gov.uk/prove-right-to-rent)", "Visa vignette sticker if BRP not yet received", "UKVI confirmation letter if awaiting BRP"] },
  { category: "Income & affordability", items: ["3 months' payslips or employment contract", "Bank statements (last 3 months)", "P60 or tax return if self-employed"] },
  { category: "Guarantor options (if needed)", items: ["Professional guarantor service (Housing Hand, Homeppl)", "UK-based guarantor with income 30× monthly rent", "3–6 months' rent in advance as alternative"] },
];

const TIMELINE_DAYS = [
  {
    when: "Day 1",
    title: "Right to Rent check",
    desc: "Landlord verifies your status online using your share code or by checking your BRP/passport in person. This is a legal requirement. Keep a copy of all documents shown.",
  },
  {
    when: "Days 2–7",
    title: "Referencing",
    desc: "Credit check, affordability assessment, employment verification, and previous landlord reference. Elite Tenancy's Renter Passport accelerates this process significantly.",
  },
  {
    when: "Days 7–14",
    title: "Tenancy agreement & move-in",
    desc: "Sign the rolling assured periodic tenancy agreement. Pay the security deposit (max 5 weeks' rent) to a protected scheme. Receive keys and complete the check-in inventory.",
  },
];

const FAQS = [
  {
    q: "What is the Right to Rent check and does it apply to me?",
    a: "Right to Rent is a legal requirement for all landlords in England. They must check that all adult occupiers have the legal right to live in the UK before granting a tenancy. As a visa holder, you prove your right to rent by sharing an online verification code (via gov.uk/prove-right-to-rent) or by showing your Biometric Residence Permit (BRP) in person. This applies to all nationalities — including UK citizens.",
  },
  {
    q: "Can I rent in the UK on a Skilled Worker visa?",
    a: "Yes. Skilled Worker visa holders have full right to rent in England for the duration of their visa. Landlords verify this through your BRP or using the Home Office eVisa share code service. If your visa is due to expire within 6 months, the landlord will grant a time-limited right to rent and must conduct a follow-up check when your visa expires.",
  },
  {
    q: "Can I rent if I'm on a Student visa?",
    a: "Yes. UK Student visa holders have the right to rent in England for the duration of their studies. Many landlords will request a UK guarantor or rent in advance for students without UK income history. Elite Tenancy's Renter Passport helps students present a verified profile that builds landlord confidence.",
  },
  {
    q: "What if I need a guarantor and don't have one?",
    a: "Professional guarantor services such as Housing Hand and Homeppl provide UK guarantees for international tenants for an annual fee (typically 3–5% of annual rent). Alternatively, offering 3–6 months' rent in advance can satisfy most landlords. Elite Tenancy can advise on the best option for your situation.",
  },
  {
    q: "What happens if my visa expires in less than 6 months?",
    a: "Landlords are required to conduct a follow-up Right to Rent check when they know a tenant's permission to be in the UK is about to expire. If you are applying for a visa extension, inform your landlord proactively and provide evidence of your application. A pending visa extension does not automatically end your right to rent.",
  },
  {
    q: "I'm waiting for my Biometric Residence Permit — can I still rent?",
    a: "Yes. While awaiting your BRP, you can ask UK Visas and Immigration (UKVI) to provide a letter confirming your right to rent. Alternatively, your landlord can use the Employer Checking Service (ECS) or UKVI's Landlord Checking Service to verify your status. Contact Elite Tenancy and we will help you navigate this with the landlord.",
  },
];

export default function UkVisaRentalGuide() {
  useSeo({
    title: "UK Visa Rental Guide 2026 — Right to Rent for Skilled Workers | Elite Tenancy",
    description: "Renting in the UK on a visa. Complete guide for Skilled Worker, Graduate, Student, EU Settlement, and Family visa holders.",
    canonical: "https://www.elitetenancy.co.uk/uk-visa-rental-guide",
  });

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-jsonld-visa-guide";
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
    return () => { document.getElementById("faq-jsonld-visa-guide")?.remove(); };
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">For Visa Holders</Badge>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-6">
            Renting in the UK on a Visa — 2026 Guide
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Skilled Worker, Graduate, Student, EU Settlement, and Family visa holders all have the right to rent in England. Here's everything you need to know.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-primary-foreground">
              <Link href="/renter-passport">Get Your Renter Passport <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/listings">Browse UK Properties</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Visa types table */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">Does My Visa Allow Me to Rent?</h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card">
                <tr>
                  <th className="text-left py-4 px-5 font-semibold text-foreground">Visa / Status</th>
                  <th className="text-center py-4 px-5 font-semibold text-foreground">Right to Rent</th>
                  <th className="text-left py-4 px-5 font-semibold text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {VISA_TYPES.map(({ visa, rightToRent, notes }) => (
                  <tr key={visa} className="border-t border-border">
                    <td className="py-4 px-5 font-medium text-foreground">{visa}</td>
                    <td className="py-4 px-5 text-center">
                      {rightToRent === "yes" && <span className="inline-flex items-center gap-1 text-green-700 font-medium"><CheckCircle2 className="h-4 w-4" /> Yes</span>}
                      {rightToRent === "no" && <span className="inline-flex items-center gap-1 text-red-600 font-medium"><X className="h-4 w-4" /> No</span>}
                      {rightToRent === "conditional" && <Badge variant="secondary">Conditional</Badge>}
                    </td>
                    <td className="py-4 px-5 text-muted-foreground">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">* Right to Rent applies to residential tenancies in England only. Scotland, Wales, and Northern Ireland have different rules.</p>
        </div>
      </section>

      {/* Documents needed */}
      <section className="py-16 bg-card border-y border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">Documents You Will Need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {DOCUMENTS.map(({ category, items }) => (
              <div key={category} className="bg-background rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{category}</h3>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-10 text-center">What to Expect: Day-by-Day</h2>
          <div className="space-y-6">
            {TIMELINE_DAYS.map(({ when, title, desc }) => (
              <div key={when} className="flex gap-5">
                <div className="flex-shrink-0">
                  <Badge className="bg-primary text-primary-foreground whitespace-nowrap">{when}</Badge>
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

      {/* FAQ */}
      <section className="py-16 bg-card border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-8 text-center">UK Visa Rental Guide — FAQ</h2>
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
              <Link href="/listings">Find Your UK Home <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
