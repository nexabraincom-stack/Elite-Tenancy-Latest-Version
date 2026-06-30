import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Copy, CheckCircle2, Gift, Zap, Users, Star, TrendingUp, PoundSterling } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface ReferralData {
  code: string;
  referralUrl: string;
  rewardAmountGBP: number;
  stats: { inProgress: number; completed: number; rewarded: number; totalEarned: number };
  trial: { plan: string; endsAt: string; daysLeft: number; source: string } | null;
}

export default function LandlordReferral() {
  const [copied, setCopied] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [applyMsg, setApplyMsg] = useState("");

  const { data, isLoading } = useQuery<ReferralData>({
    queryKey: ["referral-me"],
    queryFn: () => apiFetch("/api/referrals/me"),
  });

  const applyMutation = useMutation({
    mutationFn: (code: string) =>
      apiFetch("/api/referrals/apply", { method: "POST", body: JSON.stringify({ code }) }),
    onSuccess: (res) => setApplyMsg(res.message),
    onError: (err) => setApplyMsg((err as Error).message),
  });

  function copyLink() {
    if (!data?.referralUrl) return;
    navigator.clipboard.writeText(data.referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <LandlordLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Refer & Earn</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Refer fellow landlords to Elite Tenancy — earn £50 per successful referral
            </p>
          </div>
          <Badge className="bg-accent/10 text-amber-400 border-amber-500/20 text-xs px-3 py-1">
            <PoundSterling size={11} className="mr-1" /> £50 per referral
          </Badge>
        </div>
      </div>

      {/* Trial banner */}
      {data?.trial && data.trial.daysLeft > 0 && (
        <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 mb-5 flex items-center gap-3">
          <Zap size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your 14-day Growth plan trial is active — {data.trial.daysLeft} day{data.trial.daysLeft !== 1 ? "s" : ""} left
            </p>
            <p className="text-xs text-muted-foreground">
              Expires {new Date(data.trial.endsAt).toLocaleDateString("en-GB")} · Source: {data.trial.source}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Referred", value: isLoading ? "—" : (data?.stats.inProgress ?? 0), icon: Users },
          { label: "Completed", value: isLoading ? "—" : (data?.stats.completed ?? 0), icon: CheckCircle2 },
          { label: "Total Earned", value: isLoading ? "—" : `£${data?.stats.totalEarned ?? 0}`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-5 text-center">
            <Icon size={16} className="text-primary mx-auto mb-2" />
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Referral link card */}
        <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground">Your referral link</h2>
          </div>

          {isLoading ? (
            <div className="h-10 bg-muted/30 rounded-lg animate-pulse" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-xs text-foreground font-mono truncate">
                {data?.referralUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                onClick={copyLink}
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          )}

          <div className="bg-accent/5 border border-amber-500/15 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Your code: </span>
            <span className="font-mono text-amber-400 text-sm">{data?.code ?? "…"}</span>
            <br />
            When the referred landlord <strong className="text-foreground">lists their first property</strong> and{" "}
            <strong className="text-foreground">signs their first tenancy</strong> through Elite Tenancy, you receive{" "}
            <strong className="text-foreground">£{data?.rewardAmountGBP ?? 50}</strong>. No cap — refer unlimited landlords.
          </div>

          {/* Apply a code */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Were you referred by another landlord?</p>
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="ENTER CODE"
                maxLength={10}
                className="flex-1 bg-background border border-border/40 rounded-lg px-3 py-2 text-xs font-mono text-foreground outline-none focus:border-primary/50 uppercase placeholder:normal-case"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={!codeInput.trim() || applyMutation.isPending}
                onClick={() => applyMutation.mutate(codeInput.trim())}
                className="shrink-0"
              >
                {applyMutation.isPending ? "Applying…" : "Apply"}
              </Button>
            </div>
            {applyMsg && (
              <p className={`text-xs mt-1.5 ${applyMsg.includes("free trial") ? "text-green-400" : "text-destructive"}`}>
                {applyMsg}
              </p>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-primary" />
            <h2 className="font-semibold text-foreground">How it works</h2>
          </div>
          <div className="space-y-3">
            {[
              { step: "1", title: "Share your link", desc: "Send to fellow landlords, property investors, or letting agents" },
              { step: "2", title: "They sign up", desc: "They create a landlord account and unlock a 14-day Growth plan trial (worth £49)" },
              { step: "3", title: "They list & sign", desc: "Their first property is listed AND their first tenancy is signed" },
              { step: "4", title: "You earn £50", desc: "We transfer £50 to your bank — no limit on referrals" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14-day trial features */}
      <div className="mt-5 bg-card border border-border/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-primary" />
          <h2 className="font-semibold text-foreground">14-Day Growth Plan Trial — what your referrals unlock</h2>
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">Worth £49</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Up to 5 active property listings",
            "Priority AI tenant matching (50 matches/month)",
            "Full analytics dashboard",
            "Automated RRA 2025 compliance reminders",
            "Priority support (12h response)",
            "Viewing scheduler integration",
            "Landlord performance report",
            "No credit card required during trial",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 size={13} className="text-green-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Compare */}
      <div className="mt-5 bg-card border border-border/50 rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" /> Compare to competitors
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          {[
            { platform: "OpenRent", reward: "£29 credit only", trial: "None for referrer", badge: "bg-muted/30 text-muted-foreground" },
            { platform: "Propertymark Connect", reward: "Lead-sharing only", trial: "Member-only", badge: "bg-muted/30 text-muted-foreground" },
            { platform: "Elite Tenancy", reward: "£50 cash per referral", trial: "14 days for referee", badge: "bg-primary/10 text-primary border-primary/20" },
          ].map(({ platform, reward, trial, badge }) => (
            <div key={platform} className={`border rounded-xl p-4 ${badge}`}>
              <p className="font-semibold mb-1">{platform}</p>
              <p className="text-xs mb-0.5"><span className="text-muted-foreground">Reward:</span> {reward}</p>
              <p className="text-xs"><span className="text-muted-foreground">Trial:</span> {trial}</p>
            </div>
          ))}
        </div>
      </div>
    </LandlordLayout>
  );
}
