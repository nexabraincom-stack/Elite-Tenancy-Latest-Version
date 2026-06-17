import { Badge } from "@/components/ui/badge";
import { UserCircle, MapPin, PoundSterling, Calendar, Users, Briefcase, Dog } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

function scoreColor(score: number) {
  if (score >= 80) return "bg-green-500/10 text-green-600 border-green-500/20";
  if (score >= 60) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (score >= 40) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  return "bg-red-500/10 text-red-600 border-red-500/20";
}

export default function LandlordPassports() {
  const { getToken } = useAuth();

  const { data: passports, isLoading } = useQuery({
    queryKey: ["landlord-passports"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch("/api/passports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch passports");
      return res.json().then(d => d.passports);
    }
  });

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Tenant AI Matching</h1>
        <p className="text-muted-foreground mt-1">Discover prospective tenants perfectly matched to your properties.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1,2,3,4].map(i => <div key={i} className="bg-card rounded-xl h-48 animate-pulse border border-border/50" />)}
        </div>
      ) : passports?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No tenant passports found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {passports.map((p: any) => (
            <div key={p.id} className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                      <UserCircle size={18} className="text-primary" />
                      {p.name}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={12} /> Looking in {p.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={`${scoreColor(p.aiScore)} mb-1 text-xs`}>Match Score: {p.aiScore}/100</Badge>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed mb-4 italic">
                  "{p.aiPersona}"
                </p>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-1.5">
                    <PoundSterling size={14} className="text-primary/70" />
                    Up to £{p.maxBudget}/mo
                  </div>
                  {p.moveInDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary/70" />
                      {p.moveInDate}
                    </div>
                  )}
                  {p.occupants && (
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-primary/70" />
                      {p.occupants}
                    </div>
                  )}
                  {p.employment && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-primary/70" />
                      Employed
                    </div>
                  )}
                  {p.petsOwner && (
                    <div className="flex items-center gap-1.5">
                      <Dog size={14} className="text-primary/70" />
                      Has pets
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </LandlordLayout>
  );
}
