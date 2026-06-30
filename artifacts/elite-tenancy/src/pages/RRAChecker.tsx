import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

/**
 * Interactive Renters' Rights Act 2025 compliance checker.
 * Fully client-side — landlords self-assess against the 10 key RRA 2025
 * obligations and get a live compliance score + actionable guidance.
 * Owns the "RRA compliance" search space SpareRoom only covers with static PDFs.
 */

type Answer = "yes" | "no" | "unsure" | null;

interface Item {
  id: string;
  question: string;
  // What a compliant landlord should answer:
  compliantAnswer: "yes" | "no";
  fix: string;
}

const ITEMS: Item[] = [
  { id: "epc", question: "Does the property have a valid EPC rated E or above?", compliantAnswer: "yes", fix: "Arrange an Energy Performance Certificate. You cannot legally let below an E rating (C proposed by 2028)." },
  { id: "gas", question: "Has a Gas Safe engineer carried out a gas safety check in the last 12 months?", compliantAnswer: "yes", fix: "Book an annual gas safety check and give the certificate to tenants before move-in." },
  { id: "eicr", question: "Has the fixed wiring been inspected (EICR) within the last 5 years?", compliantAnswer: "yes", fix: "Arrange an EICR by a qualified electrician and provide the report to tenants." },
  { id: "deposit", question: "Is the tenant's deposit protected in a government-approved scheme within 30 days?", compliantAnswer: "yes", fix: "Protect deposits in DPS, MyDeposits or TDS within 30 days and serve the prescribed information." },
  { id: "rtr", question: "Have you completed Right to Rent checks for every adult occupier?", compliantAnswer: "yes", fix: "Verify each adult's right to rent in England before the tenancy starts." },
  { id: "periodic", question: "Are your tenancies set up as Assured Periodic (rolling) tenancies?", compliantAnswer: "yes", fix: "Fixed-term ASTs are abolished under RRA 2025 — all tenancies are now periodic. Update your agreements." },
  { id: "s21", question: "Are you still relying on Section 21 'no-fault' notices to regain possession?", compliantAnswer: "no", fix: "Section 21 was abolished on 1 May 2026. You must now use a valid Section 8 ground with evidence." },
  { id: "infosheet", question: "Have you served the RRA Information Sheet / Written Statement of Terms?", compliantAnswer: "yes", fix: "Serving the written statement of terms is mandatory before the tenancy starts (existing tenants by 31 May 2026)." },
  { id: "pets", question: "Do you respond to tenant pet requests within 28 days and only refuse with good reason?", compliantAnswer: "yes", fix: "You must consider pet requests within 28 days and cannot unreasonably refuse. You may require pet insurance." },
  { id: "advance", question: "Do you take a maximum of one month's rent in advance?", compliantAnswer: "yes", fix: "RRA 2025 caps advance rent at one month. Do not request rent before the agreement is signed." },
];

export default function RRAChecker() {
  useSeo({
    title: "Renters' Rights Act 2025 Checker | Free Compliance Tool",
    description: "Free RRA 2025 compliance checker for UK landlords. Verify tenancy agreements, deposits, pets policy, and Right to Rent obligations in 2 minutes.",
    canonical: "https://www.elitetenancy.co.uk/rra-2025-checker",
  });

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [showResults, setShowResults] = useState(false);

  const answered = ITEMS.filter((i) => answers[i.id] && answers[i.id] !== null).length;
  const allAnswered = answered === ITEMS.length;

  const { compliant, issues } = useMemo(() => {
    const compliant: Item[] = [];
    const issues: Item[] = [];
    for (const i of ITEMS) {
      const a = answers[i.id];
      if (a === i.compliantAnswer) compliant.push(i);
      else if (a) issues.push(i); // answered "no"/"unsure" the wrong way
    }
    return { compliant, issues };
  }, [answers]);

  const score = Math.round((compliant.length / ITEMS.length) * 100);

  function set(id: string, val: Answer) {
    setAnswers((p) => ({ ...p, [id]: val }));
  }
  function reset() {
    setAnswers({});
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.10),transparent_60%)]" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <ShieldCheck size={14} /> Free Compliance Tool
          </span>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-tight mt-6">
            Are you <span className="text-accent italic">RRA 2025</span> compliant?
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            The Renters' Rights Act 2025 is the biggest change to UK renting in 40 years. Answer 10 quick questions to check your compliance and get instant, actionable guidance — free, no signup.
          </p>
        </div>
      </section>

      {/* Live score bar */}
      <div className="sticky top-16 z-30 bg-card/95 backdrop-blur border-y border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{answered}/{ITEMS.length} answered</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(answered / ITEMS.length) * 100}%` }} />
          </div>
          {answered > 0 && <span className="text-sm font-bold text-primary whitespace-nowrap">{score}% compliant</span>}
        </div>
      </div>

      {/* Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4">
        {ITEMS.map((item, idx) => {
          const a = answers[item.id];
          const isCompliant = a === item.compliantAnswer;
          const isWrong = a && a !== item.compliantAnswer;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3 }}
              className={`rounded-xl border p-5 transition-colors ${isCompliant ? "border-primary/40 bg-primary/[0.04]" : isWrong ? "border-destructive/30 bg-destructive/[0.03]" : "border-border bg-card"}`}
            >
              <div className="flex gap-3">
                <span className="text-xs font-bold text-muted-foreground mt-0.5 w-5 shrink-0">{idx + 1}.</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground leading-relaxed">{item.question}</p>
                  <div className="flex gap-2 mt-3">
                    {(["yes", "no", "unsure"] as const).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => set(item.id, opt)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-colors ${
                          a === opt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        {opt === "unsure" ? "Not sure" : opt}
                      </button>
                    ))}
                  </div>
                  {isWrong && (
                    <p className="mt-3 text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                      <AlertTriangle size={13} className="text-destructive/70 mt-0.5 shrink-0" />
                      {item.fix}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {!showResults ? (
          <Button
            size="lg"
            disabled={!allAnswered}
            onClick={() => { setShowResults(true); }}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 mt-2"
          >
            {allAnswered ? "See my compliance result" : `Answer all ${ITEMS.length} questions to see your result`}
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-card p-7 mt-4 text-center"
          >
            <div className={`text-5xl font-serif font-bold ${score >= 90 ? "text-primary" : score >= 60 ? "text-accent" : "text-destructive"}`}>{score}%</div>
            <p className="text-sm text-muted-foreground mt-1">RRA 2025 compliance</p>
            <div className="grid grid-cols-2 gap-4 mt-6 text-left">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs uppercase tracking-wider text-primary font-bold mb-1 flex items-center gap-1.5"><CheckCircle2 size={13} /> Compliant</p>
                <p className="text-2xl font-bold text-foreground">{compliant.length}</p>
              </div>
              <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
                <p className="text-xs uppercase tracking-wider text-destructive font-bold mb-1 flex items-center gap-1.5"><AlertTriangle size={13} /> Action needed</p>
                <p className="text-2xl font-bold text-foreground">{issues.length}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              {score >= 90
                ? "Excellent — you're well on top of the new rules. Elite Tenancy keeps every tenancy compliant automatically."
                : "You have a few gaps to close. Elite Tenancy handles RRA 2025 compliance for you — compliant agreements, deadlines and screening built in."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <Link href="/for-landlords">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 w-full sm:w-auto">
                  Let Elite Tenancy handle compliance <ArrowRight size={15} />
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={reset} className="border-border/60 gap-2 w-full sm:w-auto">
                <RotateCcw size={14} /> Start over
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-5 leading-relaxed">
              This tool gives general guidance only and is not legal advice. For your specific situation, consult a qualified solicitor.
            </p>
          </motion.div>
        )}
      </section>
    </PublicLayout>
  );
}
