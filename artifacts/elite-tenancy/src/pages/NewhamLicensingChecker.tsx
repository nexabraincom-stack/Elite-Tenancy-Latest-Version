import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, MapPin, Banknote, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicLayout from "@/components/PublicLayout";
import TrustBadges from "@/components/TrustBadges";
import { useSeo } from "@/hooks/use-seo";
import { Link } from "wouter";

// Newham's selective licensing designation (3rd term): in force 1 June 2023 – 31 May 2028.
// Source: newham.gov.uk/landlords-newham/rented-property-licensing/11 (verified 2026-07-18).
// Re-verify against the council's published designation before relying on this for a live
// compliance decision — ward boundaries and scheme terms can be redrawn or renewed.
const LICENSED_WARDS = [
  "Beckton", "Boleyn", "Canning Town North", "Canning Town South", "Custom House",
  "East Ham", "East Ham South", "Forest Gate North", "Forest Gate South",
  "Green Street East", "Green Street West", "Little Ilford", "Manor Park", "Maryland",
  "Plaistow North", "Plaistow South", "Plaistow West & Canning Town East", "Plashet",
  "Royal Albert", "Stratford", "Wall End", "West Ham",
];

const UNLICENSED_WARDS = ["Royal Victoria", "Stratford Olympic Park"];

const ALL_WARDS = [...LICENSED_WARDS, ...UNLICENSED_WARDS].sort((a, b) => a.localeCompare(b));

export default function NewhamLicensingChecker() {
  useSeo({
    title: "Newham Selective Licensing Checker | Elite Tenancy",
    description: "Check whether your Newham rental property needs a selective licence — see the fee, the scheme dates, and the penalty for letting unlicensed.",
    canonical: "https://www.elitetenancy.co.uk/newham-licensing-checker",
  });

  const [ward, setWard] = useState<string>("");
  const isLicensed = ward !== "" && LICENSED_WARDS.includes(ward);
  const hasChecked = ward !== "";

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.12),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <ShieldCheck size={13} /> Local Compliance Check
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Newham selective <span className="text-accent italic">licensing</span> checker
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Newham requires a selective licence to let a property in 22 of its 24 wards. Letting unlicensed
            risks a civil penalty of up to <strong className="text-foreground">£30,000</strong>. Select your
            property's ward to check whether it's covered.
          </p>

          <div className="mt-9 max-w-md mx-auto">
            <Select value={ward} onValueChange={setWard}>
              <SelectTrigger className="bg-card text-base h-12">
                <SelectValue placeholder="Select your property's ward" />
              </SelectTrigger>
              <SelectContent>
                {ALL_WARDS.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Not sure which ward? Check your council tax bill or{" "}
            <a href="https://www.newham.gov.uk/landlords-newham/rented-property-licensing/11" target="_blank" rel="noreferrer" className="underline hover:text-foreground">
              Newham Council's ward map
            </a>.
          </p>
          <TrustBadges className="justify-center mt-5" />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {hasChecked && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card border rounded-2xl p-7 ${isLicensed ? "border-accent/40" : "border-green-500/30"}`}
          >
            <div className="flex items-center gap-3 mb-5">
              {isLicensed ? <ShieldAlert size={26} className="text-accent" /> : <ShieldCheck size={26} className="text-green-600" />}
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
                  {ward}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isLicensed ? "Selective licence required" : "Not in the designated area"}
                </p>
              </div>
            </div>

            {isLicensed ? (
              <>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  Properties in <strong className="text-foreground">{ward}</strong> fall inside Newham's selective
                  licensing designation. A landlord (or agent letting on their behalf) must hold a valid licence for
                  this property before it's let.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <Banknote size={15} className="text-primary mt-0.5 shrink-0" />
                    <span><strong className="text-foreground">£750</strong> licence fee, up to 5 years (£650 for accredited, energy-efficient properties)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CalendarClock size={15} className="text-primary mt-0.5 shrink-0" />
                    <span>Scheme runs <strong className="text-foreground">1 Jun 2023 – 31 May 2028</strong></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={15} className="text-destructive mt-0.5 shrink-0" />
                    <span>Up to <strong className="text-foreground">£30,000</strong> civil penalty, or unlimited fine via court, for letting unlicensed</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-5">
                  Unlicensed landlords can also face a Rent Repayment Order (up to 12 months' rent/housing benefit) and entry
                  on a rogue-landlord database. Source: Newham Council's published selective licensing designation — always
                  confirm directly with the council before applying, as scheme terms can change.
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{ward}</strong> currently sits outside Newham's selective licensing
                designation, so a selective licence isn't required for this ward specifically. Other licensing regimes
                (mandatory or additional HMO licensing) can still apply depending on the property type — worth confirming
                with{" "}
                <Link href="/verify-landlord" className="text-primary underline">Verify a Landlord</Link> or Newham Council directly.
              </p>
            )}
          </motion.div>
        )}

        {!hasChecked && (
          <div className="text-center text-sm text-muted-foreground">
            <MapPin size={28} className="mx-auto mb-3 text-muted-foreground/60" />
            Select a ward above to see whether your property needs a selective licence.
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
