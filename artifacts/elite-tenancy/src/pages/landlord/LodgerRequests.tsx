import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { Button } from "@/components/ui/button";

interface LandlordLodgerRequest {
  id: number;
  hostTenantName: string;
  lodgerName: string;
  lodgerEmail: string;
  roomDescription: string;
  rentPcm: number;
  billsIncluded: boolean;
  moveInDate: string | null;
  status: "pending_landlord_consent" | "consent_approved" | "consent_declined" | "active" | "ended";
  createdAt: string;
}

async function fetchLodgerRequests(): Promise<LandlordLodgerRequest[]> {
  const res = await fetch("/api/landlord/lodger-requests", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load lodger requests");
  return res.json();
}

export default function LandlordLodgerRequests() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ["landlord", "lodger-requests"], queryFn: fetchLodgerRequests });
  const [noteDrafts, setNoteDrafts] = useState<Record<number, string>>({});

  const decide = useMutation({
    mutationFn: async ({ id, approve, note }: { id: number; approve: boolean; note?: string }) => {
      const res = await fetch(`/api/lodger/${id}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ approve, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["landlord", "lodger-requests"] }),
  });

  const pending = requests?.filter((r) => r.status === "pending_landlord_consent") ?? [];
  const decided = requests?.filter((r) => r.status !== "pending_landlord_consent") ?? [];

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Lodger Requests</h1>
        <p className="text-muted-foreground mt-1">
          Your tenants' requests to take in a lodger. Under the Renters' Rights Act 2026, you can't unreasonably refuse — but genuine reasons (mortgage/insurance terms, overcrowding) are valid grounds to decline.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl h-40 animate-pulse border border-border/50" />
      ) : pending.length === 0 && decided.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
          <ClipboardCheck className="mx-auto text-primary mb-3" size={28} />
          <h3 className="font-display text-xl text-foreground mb-2">No lodger requests</h3>
          <p className="text-muted-foreground max-w-md mx-auto">Requests from your tenants to take in a lodger will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Awaiting your decision</h2>
              <div className="space-y-4">
                {pending.map((r) => (
                  <div key={r.id} className="bg-card border border-border/50 rounded-xl p-5">
                    <p className="font-semibold text-foreground">{r.hostTenantName} wants to take in {r.lodgerName}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.roomDescription}</p>
                    <p className="text-sm text-foreground mt-1">£{(r.rentPcm / 100).toFixed(0)}/month{r.billsIncluded ? ", bills included" : ""}</p>
                    <textarea
                      placeholder="Optional note (shared with your tenant either way)"
                      value={noteDrafts[r.id] ?? ""}
                      onChange={(e) => setNoteDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                      rows={2}
                      className="w-full mt-3 rounded-lg border border-border px-3 py-2 text-sm bg-background"
                    />
                    <div className="flex gap-3 mt-3">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: r.id, approve: true, note: noteDrafts[r.id] })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={decide.isPending}
                        onClick={() => decide.mutate({ id: r.id, approve: false, note: noteDrafts[r.id] })}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {decided.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3">Previously decided</h2>
              <div className="space-y-3">
                {decided.map((r) => (
                  <div key={r.id} className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.hostTenantName} → {r.lodgerName}</p>
                      <p className="text-xs text-muted-foreground">£{(r.rentPcm / 100).toFixed(0)}/month</p>
                    </div>
                    {r.status === "consent_declined" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-red-600 bg-red-500/10 border-red-500/20"><XCircle size={12} /> Declined</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-green-600 bg-green-500/10 border-green-500/20"><CheckCircle2 size={12} /> Approved</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </LandlordLayout>
  );
}
