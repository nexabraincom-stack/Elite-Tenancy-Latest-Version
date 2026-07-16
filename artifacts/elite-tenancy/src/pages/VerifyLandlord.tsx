import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Search, Building2, MapPin, CalendarDays, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import TrustBadges from "@/components/TrustBadges";
import { useSeo } from "@/hooks/use-seo";

interface VerifyResult {
  found: boolean;
  message?: string;
  companyNumber?: string;
  name?: string;
  status?: string;
  active?: boolean;
  type?: string;
  incorporatedOn?: string | null;
  address?: string;
  officers?: Array<{ name: string; role: string; appointedOn?: string }>;
}

export default function VerifyLandlord() {
  useSeo({
    title: "Verify a Landlord or Letting Company | Elite Tenancy",
    description: "Avoid rental scams. Check any UK landlord's company against the official Companies House register — confirm it's real, active and who the directors are — before you pay a penny. Free instant check by Elite Tenancy.",
    canonical: "https://www.elitetenancy.co.uk/verify-landlord",
  });

  const [number, setNumber] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!number.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/verify/company/${encodeURIComponent(number.trim())}`);
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) { setError("Verification isn't switched on yet — check back shortly."); return; }
      if (res.status === 404) { setResult({ found: false, message: data.message || "No company found with that number." }); return; }
      if (!res.ok) { setError(data.error || "Couldn't complete the check. Try again."); return; }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.12),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <ShieldCheck size={13} /> Anti-Scam Check
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Verify a <span className="text-accent italic">landlord</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Rental scams cost UK renters millions a year. Before you pay a deposit, check the landlord's company against the official <strong className="text-foreground">Companies House</strong> register — confirm it's real, active, and who runs it.
          </p>

          <form onSubmit={check} className="mt-9 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Company number, e.g. 17135665"
              className="bg-card text-base h-12"
            />
            <Button type="submit" size="lg" disabled={loading || !number.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-7">
              {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div> Checking…</> : <><Search size={16} /> Verify</>}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">Find the company number on the advert, the tenancy agreement, or ask the landlord directly.</p>
          <TrustBadges className="justify-center mt-5" />
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center text-sm text-destructive">{error}</div>}

        {result && result.found === false && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-destructive/30 rounded-2xl p-8 text-center">
            <ShieldAlert size={36} className="text-destructive mx-auto mb-3" />
            <h3 className="font-display text-2xl text-foreground mb-2">No company found</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{result.message} A genuine letting company should be on the register. Treat with caution, never pay upfront, and consider listing with a verified service like Elite Tenancy instead.</p>
          </motion.div>
        )}

        {result && result.found && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`bg-card border rounded-2xl p-7 ${result.active ? "border-green-500/30" : "border-accent/40"}`}>
            <div className="flex items-center gap-3 mb-5">
              {result.active ? <ShieldCheck size={26} className="text-green-600" /> : <ShieldAlert size={26} className="text-accent" />}
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground leading-tight">{result.name}</h3>
                <p className="text-xs text-muted-foreground">Company no. {result.companyNumber}</p>
              </div>
              <Badge className={`ml-auto ${result.active ? "bg-green-500/15 text-green-700 border-green-500/30" : "bg-accent/15 text-accent border-accent/30"}`}>
                {result.active ? "Active ✓" : (result.status ?? "—")}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2"><Building2 size={15} className="text-primary mt-0.5 shrink-0" /><span className="capitalize">{result.type?.replace(/-/g, " ")}</span></div>
              <div className="flex items-start gap-2"><CalendarDays size={15} className="text-primary mt-0.5 shrink-0" /><span>Incorporated {result.incorporatedOn ?? "—"}</span></div>
              <div className="flex items-start gap-2 sm:col-span-2"><MapPin size={15} className="text-primary mt-0.5 shrink-0" /><span>{result.address}</span></div>
            </div>
            {result.officers && result.officers.length > 0 && (
              <div className="mt-5 pt-5 border-t border-border/50">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2"><Users size={13} /> Directors & officers</p>
                <ul className="space-y-2">
                  {result.officers.map((o, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{o.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{o.role.replace(/-/g, " ")}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">✓ Confirm the person you're dealing with is named above. If their name isn't here, they may not be authorised to let this property.</p>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground mt-5">Source: official Companies House register. This confirms a company exists — always combine with a Land Registry title check before paying.</p>
          </motion.div>
        )}

        <div className="mt-8 bg-muted/40 border border-border/50 rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Renting in Newham?{" "}
            <Link href="/newham-licensing-checker" className="text-primary font-medium underline">
              Check if the property needs a selective licence
            </Link>{" "}
            — unlicensed letting risks a £30,000 penalty.
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
