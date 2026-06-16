import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, BedDouble, CalendarDays, Users, Briefcase, PawPrint, Eye } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetPassports } from "@workspace/api-client-react";

function scoreColor(score: number | null) {
  const s = score ?? 0;
  if (s >= 80) return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s >= 60) return "bg-primary/10 text-primary border-primary/20";
  if (s >= 40) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return "bg-muted text-muted-foreground border-border";
}

function budgetLabel(min: number | null, max: number) {
  return min ? `£${min.toLocaleString()}–£${max.toLocaleString()}/mo` : `Up to £${max.toLocaleString()}/mo`;
}

export default function LandlordPassports() {
  const { data, isLoading } = useGetPassports();
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const passports = data?.passports ?? [];

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Tenant Passports</h1>
        <p className="text-muted-foreground mt-1">AI-ranked pool of prospective tenants actively looking for a home.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl h-44 animate-pulse border border-border/50" />
          ))}
        </div>
      ) : passports.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No tenant passports yet. As renters build their passport, they’ll appear here ranked by AI readiness score.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {passports.map((p) => {
            const isRevealed = revealed[p.id];
            return (
              <div key={p.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-colors flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={11} /> {p.city}</p>
                  </div>
                  <Badge className={`${scoreColor(p.aiScore)} text-xs font-medium shrink-0`}>
                    {p.aiScore ?? "—"}{p.aiScore != null ? "/100" : ""}
                  </Badge>
                </div>

                {p.aiPersona && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{p.aiPersona}</p>
                )}

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-4">
                  <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1">{budgetLabel(p.minBudget, p.maxBudget)}</span>
                  {p.bedrooms != null && (
                    <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1"><BedDouble size={11} /> {p.bedrooms === 0 ? "Studio" : `${p.bedrooms} bed`}</span>
                  )}
                  {p.moveInDate && (
                    <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1"><CalendarDays size={11} /> {p.moveInDate}</span>
                  )}
                  {p.occupants && (
                    <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1"><Users size={11} /> {p.occupants}</span>
                  )}
                  {p.employment && (
                    <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1"><Briefcase size={11} /> {p.employment}</span>
                  )}
                  {p.petsOwner && (
                    <span className="inline-flex items-center gap-1 bg-muted/40 rounded px-2 py-1"><PawPrint size={11} /> Has pets</span>
                  )}
                </div>

                <div className="mt-auto pt-3 border-t border-border/40">
                  {isRevealed ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <a href={`mailto:${p.email}`} className="text-xs text-primary hover:underline flex items-center gap-1"><Mail size={12} /> {p.email}</a>
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1"><Phone size={12} /> {p.phone}</a>
                      )}
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" className="border-border/60 text-xs gap-1.5" onClick={() => setRevealed((r) => ({ ...r, [p.id]: true }))}>
                      <Eye size={13} /> Reveal contact details
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </LandlordLayout>
  );
}
