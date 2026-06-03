import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Users, MapPin, PoundSterling, CalendarDays, Sparkles, ArrowRight, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

interface WantedItem {
  id: number;
  displayName: string;
  city: string;
  minBudget: number | null;
  maxBudget: number;
  bedrooms: number | null;
  moveInDate: string | null;
  occupants: string | null;
  aiPersona: string | null;
  aiScore: number | null;
  createdAt: string;
}

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return null;
  const tone = score >= 85 ? "bg-green-500/15 text-green-600 border-green-500/30" : score >= 70 ? "bg-accent/15 text-accent border-accent/30" : "bg-primary/10 text-primary border-primary/25";
  return <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${tone}`}><Sparkles size={11} /> {score}/100</span>;
}

export default function RoomWanted() {
  useSeo({
    title: "Renters Looking Now — Tenants Wanted Board | Elite Tenancy",
    description: "Browse live renter demand. Verified tenants — singles, couples, professionals, students and DSS — have posted exactly what, where and when they need to rent. Landlords, homeowners and agents: find your next tenant before you even list.",
    canonical: "https://www.elitetenancy.co.uk/room-wanted",
  });

  const [items, setItems] = useState<WantedItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/wanted`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.wanted ?? []))
      .catch(() => setError(true));
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,146,63,0.12),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <Users size={13} /> Live Renter Demand
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Renters looking <span className="text-accent italic">right now</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Verified tenants have told us exactly what, where and when they need to rent. Landlords, homeowners and agents — find your next tenant before you even advertise. Singles, couples, professionals, students and DSS welcome.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link href="/list-your-property"><Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">List your property <ArrowRight size={16} /></Button></Link>
            <Link href="/renter-passport"><Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 px-8">I'm a renter — post my needs</Button></Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {items && items.length > 0 && (
          <p className="text-sm text-muted-foreground mb-6"><span className="font-semibold text-foreground">{items.length}</span> renters actively searching</p>
        )}

        {!items && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-card rounded-xl h-56 animate-pulse border border-border/50" />)}
          </div>
        )}

        {(error || (items && items.length === 0)) && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <Users className="mx-auto text-primary mb-3" size={30} />
            <h3 className="font-serif text-2xl text-foreground mb-2">Be the first to get matched</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">No active renter posts yet. Build your Renter Passport and you'll appear here instantly for landlords to find.</p>
            <Link href="/renter-passport"><Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">Build my Renter Passport <ArrowRight size={15} /></Button></Link>
          </div>
        )}

        {items && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((w, i) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: (i % 3) * 0.05 }}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{w.displayName[0]}</div>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{w.displayName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {w.city}</p>
                    </div>
                  </div>
                  <ScorePill score={w.aiScore} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><PoundSterling size={11} className="text-primary" />{w.minBudget ? `${w.minBudget}–` : "up to "}£{w.maxBudget.toLocaleString()}/mo</span>
                  {w.bedrooms != null && <span>{w.bedrooms === 0 ? "Studio" : `${w.bedrooms}+ bed`}</span>}
                  {w.moveInDate && <span className="flex items-center gap-1"><CalendarDays size={11} /> {w.moveInDate}</span>}
                </div>

                {w.occupants && <Badge className="bg-secondary text-foreground border-border/50 text-xs mb-3 self-start">{w.occupants}</Badge>}

                {w.aiPersona && <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">"{w.aiPersona}"</p>}

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-primary font-medium flex items-center gap-1"><BadgeCheck size={12} /> Verified renter</span>
                  <Link href="/list-your-property"><Button size="sm" variant="outline" className="text-xs border-border/60 hover:border-primary/50 gap-1">Offer a home <ArrowRight size={12} /></Button></Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
