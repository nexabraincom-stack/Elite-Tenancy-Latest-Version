import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Copy, CheckCircle2, Gift, Clock, Star, ChevronRight, Users, Zap } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
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
  verificationsRequired: number;
  stats: { inProgress: number; completed: number; rewarded: number; totalEarned: number };
  trial: { plan: string; endsAt: string; daysLeft: number; source: string } | null;
  myProgress: { steps: number; total: number; status: string } | null;
}

const STEP_LABELS = [
  "Email verified",
  "Profile completed",
  "ID document uploaded",
  "Employment proof submitted",
  "Previous landlord reference",
  "Credit check authorised",
];

export default function TenantReferral() {
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
    <TenantLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-foreground">Refer & Earn</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Refer friends to Elite Tenancy — earn £20 for each who completes their referencing
        </p>
      </div>

      {/* Trial banner */}
      {data?.trial && data.trial.daysLeft > 0 && (
        <div className="bg-primary/8 border border-primary/20 rounded-xl p-4 mb-5 flex items-center gap-3">
          <Zap size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Your 14-day free trial is active — {data.trial.daysLeft} day{data.trial.daysLeft !== 1 ? "s" : ""} remaining
            </p>
            <p className="text-xs text-muted-foreground">
              Trial source: {data.trial.source} · Expires {new Date(data.trial.endsAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Referred", value: isLoading ? "—" : (data?.stats.inProgress ?? 0), desc: "In progress" },
          { label: "Completed", value: isLoading ? "—" : (data?.stats.completed ?? 0), desc: "All 6 steps done" },
          { label: "Earned", value: isLoading ? "—" : `£${data?.stats.totalEarned ?? 0}`, desc: "Rewards paid out" },
        ].map(({ label, value, desc }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-display text-3xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{desc}</p>
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

          <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Your code: </span>
            <span className="font-mono text-primary text-sm">{data?.code ?? "…"}</span>
            <br />
            Share your link or code with friends looking to rent in London. When they sign up and
            complete all 6 referencing steps, you'll receive <strong className="text-foreground">£{data?.rewardAmountGBP ?? 20} cash</strong>.
          </div>

          {/* Apply a referral code */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-2">Have a referral code yourself?</p>
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
              { step: "1", title: "Share your link", desc: "Send your unique link or code to a friend looking to rent" },
              { step: "2", title: "Friend signs up", desc: "They create an account using your link and unlock a 14-day free trial" },
              { step: "3", title: "They complete referencing", desc: "All 6 verification steps must be completed (takes 3–5 days)" },
              { step: "4", title: "You earn £20", desc: "We transfer £20 to you — no maximum, refer as many as you like" },
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

      {/* 6 Verification steps progress */}
      {data?.myProgress && (
        <div className="mt-5 bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <h2 className="font-semibold text-foreground">Your referencing progress</h2>
            </div>
            <Badge className={
              data.myProgress.status === "completed"
                ? "bg-green-500/10 text-green-400 border-green-500/20"
                : "bg-accent/10 text-amber-400 border-amber-500/20"
            }>
              {data.myProgress.steps}/{data.myProgress.total} steps
            </Badge>
          </div>

          <div className="space-y-2">
            {STEP_LABELS.map((label, i) => {
              const done = i < (data.myProgress?.steps ?? 0);
              return (
                <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg ${done ? "bg-green-500/5" : "bg-muted/20"}`}>
                  {done
                    ? <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    : <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  }
                  <span className={`text-sm ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                  {done && <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20 text-[10px]">Done</Badge>}
                  {!done && i === (data.myProgress?.steps ?? 0) && (
                    <Badge className="ml-auto bg-accent/10 text-amber-400 border-amber-500/20 text-[10px]">
                      <ChevronRight size={9} className="mr-0.5" /> Next
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Contact us at <span className="text-primary">hello@elitetenancy.co.uk</span> to update your verification steps.
            Your referrer will be rewarded once all 6 are complete.
          </p>
        </div>
      )}

      {/* Trial info */}
      <div className="mt-5 bg-card border border-border/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-primary" />
          <h2 className="font-semibold text-foreground">14-Day Free Trial — what's included</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Priority listing views & AI-matched properties",
            "Renter Passport — premium profile badge",
            "Full tenancy document access",
            "Ellie AI assistant — unlimited chat",
            "Maintenance request portal",
            "Secure rent payment dashboard",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 size={13} className="text-green-400 shrink-0" />
              {f}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Trial activates automatically when someone signs up with your code, or when you use a referral code at signup.
          No credit card required during trial.
        </p>
      </div>
    </TenantLayout>
  );
}
