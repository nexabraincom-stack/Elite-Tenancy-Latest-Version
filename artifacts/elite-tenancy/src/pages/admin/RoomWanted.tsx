import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, MapPin, PoundSterling, Calendar, ShieldCheck, EyeOff, Eye, BadgeCheck } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/react";

interface AdminPassport {
  id: number;
  name: string;
  city: string;
  maxBudget: number;
  moveInDate: string | null;
  occupants: string | null;
  aiPersona: string | null;
  aiScore: number | null;
  photoUrl: string | null;
  approved: boolean;
  verified: boolean;
  createdAt: string;
}

function scoreColor(score: number | null) {
  if (score == null) return "bg-muted text-muted-foreground border-border";
  if (score >= 80) return "bg-green-500/10 text-green-600 border-green-500/20";
  if (score >= 60) return "bg-blue-500/10 text-blue-600 border-blue-500/20";
  if (score >= 40) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  return "bg-red-500/10 text-red-600 border-red-500/20";
}

export default function AdminRoomWanted() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "hidden">("all");

  const { data: passports, isLoading } = useQuery({
    queryKey: ["admin-passports"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/passports`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch passports");
      return (await res.json()).passports as AdminPassport[];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<{ approved: boolean; verified: boolean }> }) => {
      const token = await getToken();
      const res = await fetch(`${import.meta.env.BASE_URL}api/admin/passports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-passports"] }),
  });

  const displayed = (passports ?? []).filter((p) => (filter === "all" ? true : !p.approved));

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Room Wanted — Moderation</h1>
          <p className="text-muted-foreground mt-1">
            {passports?.length ?? 0} renter passports · {passports?.filter((p) => p.approved).length ?? 0} visible on the public board
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button size="sm" variant={filter === "hidden" ? "default" : "outline"} onClick={() => setFilter("hidden")}>Hidden only</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-card rounded-xl h-56 animate-pulse border border-border/50" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">{filter === "hidden" ? "Nothing hidden right now." : "No renter passports yet."}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {displayed.map((p) => (
            <div key={p.id} className={`bg-card border rounded-xl overflow-hidden transition-shadow ${p.approved ? "border-border/50" : "border-destructive/30"}`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {p.photoUrl ? (
                      <img src={p.photoUrl} alt={p.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <UserCircle size={30} className="text-primary shrink-0" />
                    )}
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">{p.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} /> {p.city}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`${scoreColor(p.aiScore)} text-xs`}>{p.aiScore ?? "—"}/100</Badge>
                    {!p.approved && <Badge variant="destructive" className="text-xs">Hidden</Badge>}
                    {p.verified && <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1"><BadgeCheck size={10} /> Verified</Badge>}
                  </div>
                </div>

                {p.aiPersona && <p className="text-sm text-foreground/80 leading-relaxed mb-3 italic line-clamp-2">"{p.aiPersona}"</p>}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><PoundSterling size={11} className="text-primary/70" /> Up to £{p.maxBudget}/mo</span>
                  {p.moveInDate && <span className="flex items-center gap-1"><Calendar size={11} className="text-primary/70" /> {p.moveInDate}</span>}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs gap-1.5"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ id: p.id, patch: { approved: !p.approved } })}
                  >
                    {p.approved ? <><EyeOff size={12} /> Hide from board</> : <><Eye size={12} /> Show on board</>}
                  </Button>
                  <Button
                    size="sm"
                    variant={p.verified ? "outline" : "default"}
                    className="flex-1 text-xs gap-1.5"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ id: p.id, patch: { verified: !p.verified } })}
                  >
                    <ShieldCheck size={12} /> {p.verified ? "Remove verified" : "Mark verified"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
