import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin, PoundSterling, BedDouble, CalendarDays, Users, Sparkles, BadgeCheck } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";

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

function scoreTone(score: number | null) {
  const s = score ?? 0;
  if (s >= 85) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s >= 70) return "bg-accent/10 text-accent border-accent/20";
  return "bg-primary/10 text-primary border-primary/20";
}

export default function LandlordRoomWanted() {
  const [items, setItems] = useState<WantedItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/wanted`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setItems(d.wanted ?? []))
      .catch(() => setError(true));
  }, []);

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Room Wanted</h1>
        <p className="text-muted-foreground mt-1">Verified renters actively searching right now — spot demand before you even list. Use Tenant Passports to reveal contact details.</p>
      </div>

      {!items && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl h-44 animate-pulse border border-border/50" />
          ))}
        </div>
      )}

      {(error || (items && items.length === 0)) && (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <Users className="mx-auto text-primary mb-3" size={28} />
          <p className="text-muted-foreground">No active renter posts yet. As renters build their Renter Passport, they’ll appear here ranked by AI readiness score.</p>
        </div>
      )}

      {items && items.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-6"><span className="font-semibold text-foreground">{items.length}</span> renters actively searching</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((w) => (
              <div key={w.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">{w.displayName[0]}</div>
                    <div>
                      <p className="font-semibold text-foreground leading-tight">{w.displayName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> {w.city}</p>
                    </div>
                  </div>
                  {w.aiScore != null && (
                    <Badge className={`${scoreTone(w.aiScore)} text-xs font-medium shrink-0 gap-1`}><Sparkles size={11} /> {w.aiScore}/100</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1"><PoundSterling size={11} className="text-primary" />{w.minBudget ? `${w.minBudget.toLocaleString()}–` : "up to "}£{w.maxBudget.toLocaleString()}/mo</span>
                  {w.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={11} /> {w.bedrooms === 0 ? "Studio" : `${w.bedrooms}+ bed`}</span>}
                  {w.moveInDate && <span className="flex items-center gap-1"><CalendarDays size={11} /> {w.moveInDate}</span>}
                </div>

                {w.occupants && <Badge className="bg-secondary text-foreground border-border/50 text-xs mb-3 self-start">{w.occupants}</Badge>}

                {w.aiPersona && <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">“{w.aiPersona}”</p>}

                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs text-primary font-medium flex items-center gap-1"><BadgeCheck size={12} /> Verified renter</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </LandlordLayout>
  );
}
