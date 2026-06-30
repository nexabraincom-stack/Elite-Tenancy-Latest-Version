import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, CheckCircle2, Clock, PoundSterling, Users, Zap, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include",
    ...init,
  }).then(async (r) => {
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? `API ${r.status}`);
    return json;
  });
}

interface Referral {
  id: number;
  code: string;
  referrer_role: string;
  referrer_name: string | null;
  referrer_email: string | null;
  referee_name: string | null;
  referee_email: string | null;
  status: string;
  verifications_completed: number;
  reward_amount_pence: number;
  created_at: string;
}

interface Trial {
  id: number;
  name: string;
  email: string;
  user_role: string;
  trial_plan: string;
  ends_at: string;
  source: string;
}

interface AdminData {
  referrals: Referral[];
  trials: Trial[];
  summary: { total: number; inProgress: number; completed: number; rewarded: number; pendingPayout: number };
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    in_progress: "bg-accent/10 text-amber-400 border-amber-500/20",
    completed:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
    rewarded:    "bg-green-500/10 text-green-400 border-green-500/20",
    pending:     "bg-muted/40 text-muted-foreground border-border/30",
  };
  return (
    <Badge className={`text-[10px] px-2 py-0.5 border capitalize ${map[status] ?? map.pending}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export default function AdminReferrals() {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery<AdminData>({
    queryKey: ["referrals-admin"],
    queryFn: () => apiFetch("/api/referrals/admin"),
    retry: false,
  });

  const rewardMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/referrals/admin/${id}/reward`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referrals-admin"] }),
  });

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Referrals &amp; Trials</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Tenant £20 · Landlord £50 · Agency £100 — paid after conditions met
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => qc.invalidateQueries({ queryKey: ["referrals-admin"] })}>
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total", value: data?.summary.total ?? 0, icon: Users },
          { label: "In Progress", value: data?.summary.inProgress ?? 0, icon: Clock },
          { label: "Completed", value: data?.summary.completed ?? 0, icon: CheckCircle2 },
          { label: "Rewarded", value: data?.summary.rewarded ?? 0, icon: Gift },
          { label: "Pending Payout", value: `£${data?.summary.pendingPayout ?? 0}`, icon: PoundSterling },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <Icon size={15} className="text-primary mx-auto mb-1.5" />
            <p className="font-display text-2xl font-bold text-foreground">{isLoading ? "—" : value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-5 mb-6">
          <p className="text-sm text-destructive font-medium">Could not load referrals</p>
          <p className="text-xs text-muted-foreground mt-1">{(error as Error).message}</p>
        </div>
      )}

      {/* Referrals table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
          <Gift size={14} className="text-primary" />
          <p className="font-semibold text-sm text-foreground">All referrals</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
            <RefreshCw size={14} className="animate-spin" /> Loading…
          </div>
        ) : (data?.referrals.length ?? 0) === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No referrals yet. They'll appear here as users share their codes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border/30">
                  <th className="px-5 py-2.5 font-medium">Code</th>
                  <th className="px-3 py-2.5 font-medium">Referrer</th>
                  <th className="px-3 py-2.5 font-medium">Referee</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Progress</th>
                  <th className="px-3 py-2.5 font-medium">Reward</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-5 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data!.referrals.map((r) => (
                  <tr key={r.id} className="border-b border-border/20 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs text-primary">{r.code}</td>
                    <td className="px-3 py-3">
                      <p className="text-foreground text-xs font-medium">{r.referrer_name ?? "—"}</p>
                      <p className="text-muted-foreground text-[10px]">{r.referrer_email ?? ""}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-foreground text-xs font-medium">{r.referee_name ?? "—"}</p>
                      <p className="text-muted-foreground text-[10px]">{r.referee_email ?? ""}</p>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className="bg-muted/40 text-muted-foreground border-border/30 text-[10px] capitalize">
                        {r.referrer_role}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">
                      {r.referrer_role === "tenant" ? `${r.verifications_completed}/6 steps` : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-foreground font-medium">
                      £{(r.reward_amount_pence / 100).toFixed(0)}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-right">
                      {r.status === "completed" ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={rewardMutation.isPending && rewardMutation.variables === r.id}
                          onClick={() => rewardMutation.mutate(r.id)}
                        >
                          <PoundSterling size={11} />
                          {rewardMutation.isPending && rewardMutation.variables === r.id ? "…" : "Mark paid"}
                        </Button>
                      ) : r.status === "rewarded" ? (
                        <span className="text-[10px] text-green-400 inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> Paid
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Active trials */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 flex items-center gap-2">
          <Zap size={14} className="text-primary" />
          <p className="font-semibold text-sm text-foreground">Active trials</p>
        </div>
        {isLoading ? (
          <div className="py-10" />
        ) : (data?.trials.length ?? 0) === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No active trials.</div>
        ) : (
          <div className="divide-y divide-border/20">
            {data!.trials.map((t) => {
              const daysLeft = Math.max(0, Math.ceil((new Date(t.ends_at).getTime() - Date.now()) / 86_400_000));
              return (
                <div key={t.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm text-foreground font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-muted/40 text-muted-foreground border-border/30 text-[10px] capitalize">
                      {t.trial_plan} · {t.source}
                    </Badge>
                    <Badge className={`text-[10px] ${daysLeft > 0 ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : "Expired"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        "Mark paid" is enabled once a referral reaches <span className="text-blue-400">completed</span> status
        (tenant: 6/6 steps; landlord/agency: conditions met). Transfer the reward via your bank, then click to record it.
      </p>
    </AdminLayout>
  );
}
