import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, ExternalLink, CheckCircle2, Clock, AlertCircle, Zap, MapPin, Share2, Activity, Send, Sparkles, RefreshCw } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

// ── API helpers ───────────────────────────────────────────────────────────────

function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  }).then(async (r) => {
    const json = await r.json();
    if (!r.ok) throw new Error(json.error ?? json.hint ?? `API ${r.status}`);
    return json;
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GbpReview {
  reviewId: string;
  reviewer: { displayName: string };
  stars: number;
  comment?: string;
  ageLabel: string;
  needsReply: boolean;
  reviewReply?: { comment: string };
}

interface ReviewsData {
  reviews: GbpReview[];
  averageRating: number | null;
  totalReviewCount: number;
  unanswered: number;
}

interface NapDirectory {
  name: string;
  status: string;
  priority: string;
  editUrl: string;
  note: string;
}

interface NapData {
  canonicalNap: Record<string, string>;
  summary: { total: number; verified: number; pendingAction: number; unchecked: number; napScore: number };
  directories: { critical: NapDirectory[]; high: NapDirectory[]; medium: NapDirectory[]; low: NapDirectory[] };
  nextActions: Array<{ name: string; editUrl: string; note: string }>;
}

interface HealthData {
  gbp: string;
  ai: string;
  freeAiProviders: Array<{ name: string; active: boolean; model: string; cost: string }>;
  features: Record<string, string>;
  savings: Record<string, string>;
  setupRequired: string[];
}

// ── Stars display ─────────────────────────────────────────────────────────────

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= count ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}
        />
      ))}
    </span>
  );
}

// ── Status badge helper ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    verified:        "bg-green-500/10 text-green-400 border-green-500/20",
    pending_action:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    pending_pin:     "bg-amber-500/10 text-amber-400 border-amber-500/20",
    unchecked:       "bg-muted/40 text-muted-foreground border-border/30",
    not_listed:      "bg-destructive/10 text-destructive border-destructive/20",
    connected:       "bg-green-500/10 text-green-400 border-green-500/20",
    not_configured:  "bg-muted/40 text-muted-foreground border-border/30",
    active:          "bg-green-500/10 text-green-400 border-green-500/20",
    needs_GBP_vars:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    needs_WA_vars:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };
  const cls = map[status] ?? "bg-muted/40 text-muted-foreground border-border/30";
  const label = status.replace(/_/g, " ");
  return <Badge className={`text-[10px] px-2 py-0.5 border capitalize ${cls}`}>{label}</Badge>;
}

// ── Reviews Tab ───────────────────────────────────────────────────────────────

function ReviewsTab() {
  const qc = useQueryClient();
  const [drafts, setDrafts]   = useState<Record<string, string>>({});
  const [open, setOpen]       = useState<string | null>(null);
  const [postedIds, setPosted] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery<ReviewsData>({
    queryKey: ["reputation-reviews"],
    queryFn: () => apiFetch("/api/reputation/reviews"),
    retry: false,
  });

  const draftMutation = useMutation({
    mutationFn: ({ reviewId, reviewText, reviewerName, starRating }: {
      reviewId: string; reviewText?: string; reviewerName: string; starRating: number;
    }) => apiFetch(`/api/reputation/reviews/${reviewId}/draft`, {
      method: "POST",
      body: JSON.stringify({ reviewText, reviewerName, starRating }),
    }),
    onSuccess: (res, vars) => {
      setDrafts((d) => ({ ...d, [vars.reviewId]: res.draft }));
      setOpen(vars.reviewId);
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, comment }: { reviewId: string; comment: string }) =>
      apiFetch(`/api/reputation/reviews/${reviewId}/reply`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      }),
    onSuccess: (_, { reviewId }) => {
      setPosted((s) => new Set([...s, reviewId]));
      setOpen(null);
      qc.invalidateQueries({ queryKey: ["reputation-reviews"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <RefreshCw size={14} className="animate-spin" /> Fetching reviews from Google…
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message;
    const isConfig = msg.includes("GBP") || msg.includes("not configured") || msg.includes("424");
    return (
      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-6">
        <p className="font-semibold text-amber-400 text-sm mb-2">
          {isConfig ? "Google Business Profile not connected yet" : "Could not load reviews"}
        </p>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {isConfig
            ? "Set GBP_LOCATION_NAME + GBP_ACCESS_TOKEN in Vercel backend env to activate live review monitoring."
            : msg}
        </p>
        {isConfig && (
          <div className="space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Setup steps:</p>
            <p>1. Get location name from business.google.com → ⋮ → Business Profile settings → Advanced settings</p>
            <p>2. Get access token from developers.google.com/oauthplayground (select "Google My Business API v4")</p>
            <p>3. Set both as env vars in Vercel backend project, then redeploy</p>
          </div>
        )}
      </div>
    );
  }

  const reviews = data?.reviews ?? [];

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Reviews", value: data?.totalReviewCount ?? 0 },
          { label: "Avg Rating", value: data?.averageRating ? `${data.averageRating.toFixed(1)} ★` : "—" },
          { label: "Need Reply", value: data?.unanswered ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No reviews yet. Once GBP is verified and customers start leaving reviews, they'll appear here.
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const replied = postedIds.has(r.reviewId) || !r.needsReply;
            const isOpen  = open === r.reviewId;
            const draft   = drafts[r.reviewId] ?? "";

            return (
              <div
                key={r.reviewId}
                className={`bg-card border rounded-xl p-5 transition-colors ${
                  replied ? "border-green-500/20" : "border-border/50"
                }`}
              >
                {/* Review header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                      {r.reviewer.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{r.reviewer.displayName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Stars count={r.stars} />
                        <span className="text-[10px] text-muted-foreground">{r.ageLabel}</span>
                      </div>
                    </div>
                  </div>
                  {replied ? (
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-[10px] shrink-0">
                      <CheckCircle2 size={9} className="mr-1" /> Replied
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] shrink-0">
                      <Clock size={9} className="mr-1" /> Needs reply
                    </Badge>
                  )}
                </div>

                {/* Review text */}
                {r.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3 pl-10">
                    "{r.comment}"
                  </p>
                )}

                {/* Existing reply */}
                {r.reviewReply && !postedIds.has(r.reviewId) && (
                  <div className="ml-10 bg-primary/5 border border-primary/15 rounded-lg px-3 py-2 text-xs text-muted-foreground mb-3">
                    <span className="text-primary font-medium mr-1">Your reply:</span>
                    {r.reviewReply.comment}
                  </div>
                )}

                {/* Draft reply area */}
                {!replied && (
                  <div className="pl-10 space-y-2">
                    {isOpen && (
                      <textarea
                        value={draft}
                        onChange={(e) => setDrafts((d) => ({ ...d, [r.reviewId]: e.target.value }))}
                        rows={4}
                        placeholder="Write or edit your reply…"
                        className="w-full text-xs bg-background border border-border/40 rounded-lg px-3 py-2.5 text-foreground outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                        disabled={draftMutation.isPending && draftMutation.variables?.reviewId === r.reviewId}
                        onClick={() =>
                          draftMutation.mutate({
                            reviewId: r.reviewId,
                            reviewText: r.comment,
                            reviewerName: r.reviewer.displayName,
                            starRating: r.stars,
                          })
                        }
                      >
                        <Sparkles size={11} />
                        {draftMutation.isPending && draftMutation.variables?.reviewId === r.reviewId
                          ? "Drafting…"
                          : isOpen ? "Re-draft" : "AI Draft"}
                      </Button>
                      {isOpen && draft.trim().length >= 5 && (
                        <Button
                          size="sm"
                          className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                          disabled={replyMutation.isPending && replyMutation.variables?.reviewId === r.reviewId}
                          onClick={() => replyMutation.mutate({ reviewId: r.reviewId, comment: draft })}
                        >
                          <Send size={11} />
                          {replyMutation.isPending && replyMutation.variables?.reviewId === r.reviewId
                            ? "Posting…"
                            : "Post Reply"}
                        </Button>
                      )}
                      {isOpen && (
                        <button
                          onClick={() => setOpen(null)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    {draftMutation.isError && draftMutation.variables?.reviewId === r.reviewId && (
                      <p className="text-xs text-destructive">{(draftMutation.error as Error).message}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── NAP Audit Tab ─────────────────────────────────────────────────────────────

function NapTab() {
  const { data, isLoading } = useQuery<NapData>({
    queryKey: ["reputation-nap"],
    queryFn: () => apiFetch("/api/reputation/nap"),
    staleTime: 5 * 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <RefreshCw size={14} className="animate-spin" /> Loading NAP audit…
      </div>
    );
  }

  const nap  = data?.canonicalNap ?? {};
  const sum  = data?.summary;
  const dirs = data?.directories ?? { critical: [], high: [], medium: [], low: [] };
  const next = data?.nextActions ?? [];

  const allDirs = [...dirs.critical, ...dirs.high, ...dirs.medium, ...dirs.low];

  return (
    <div className="space-y-6">
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Directories", value: sum?.total ?? 0 },
          { label: "Verified", value: sum?.verified ?? 0 },
          { label: "Action Needed", value: (sum?.pendingAction ?? 0) + (sum?.unchecked ?? 0) },
          { label: "NAP Score", value: `${sum?.napScore ?? 0}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Canonical NAP */}
      <div className="bg-card border border-primary/20 rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-primary" /> Canonical NAP — use this EXACTLY on every directory
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {Object.entries(nap).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-muted-foreground w-16 shrink-0 capitalize">{k}:</span>
              <span className="text-foreground font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next actions */}
      {next.length > 0 && (
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-5">
          <p className="font-semibold text-sm text-amber-400 mb-3">⚡ Priority actions</p>
          <div className="space-y-2">
            {next.map((a) => (
              <div key={a.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{a.name}</p>
                  {a.note && <p className="text-xs text-muted-foreground">{a.note}</p>}
                </div>
                <a
                  href={a.editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Update <ExternalLink size={10} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All directories table */}
      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50">
          <p className="font-semibold text-sm text-foreground">All {allDirs.length} directories</p>
        </div>
        <div className="divide-y divide-border/30">
          {allDirs.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground font-medium">{d.name}</p>
                  <Badge className={`text-[9px] px-1.5 py-0 capitalize border ${
                    d.priority === "critical" ? "bg-destructive/10 text-destructive border-destructive/20" :
                    d.priority === "high"     ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                "bg-muted/30 text-muted-foreground border-border/30"
                  }`}>{d.priority}</Badge>
                </div>
                {d.note && <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={d.status} />
                <a
                  href={d.editUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                  title={`Update ${d.name}`}
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        To mark a directory as verified: update its status in <code className="text-primary">reputation.ts</code> → redeploy. Admin UI status updates coming soon.
      </p>
    </div>
  );
}

// ── Social Tab ────────────────────────────────────────────────────────────────

function SocialTab() {
  const [postType, setPostType]   = useState("listing");
  const [topic, setTopic]         = useState("");
  const [draft, setDraft]         = useState("");
  const [published, setPublished] = useState(false);

  const draftMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch("/api/reputation/social/draft", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: (res) => { setDraft(res.draft); setPublished(false); },
  });

  const publishMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/reputation/social", {
        method: "POST",
        body: JSON.stringify({ summary: draft, callToActionUrl: "https://www.elitetenancy.co.uk/listings" }),
      }),
    onSuccess: () => setPublished(true),
  });

  const POST_TYPES = [
    { value: "listing",       label: "New Property" },
    { value: "legal_update",  label: "Legal Update" },
    { value: "company_news",  label: "Company News" },
    { value: "local_tip",     label: "Local Tip" },
  ];

  function handleGenerate() {
    draftMutation.mutate({ postType, topic });
  }

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border/50 rounded-xl p-5 space-y-4">
        <p className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Share2 size={14} className="text-primary" /> Compose GBP Post
        </p>

        {/* Post type */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Post type</p>
          <div className="flex flex-wrap gap-2">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setPostType(t.value); setDraft(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  postType === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/30 text-muted-foreground border-border/30 hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic input */}
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">
            {postType === "listing" ? "Property details (e.g. '2-bed flat East Ham £1,400/mo')" : "Topic or subject"}
          </p>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={2}
            placeholder={
              postType === "listing"
                ? "2-bed flat, East Ham, London E6 — £1,400/month, newly refurbished, close to station"
                : postType === "legal_update"
                ? "Section 21 abolished from May 2026 — what landlords need to know"
                : "Topic for your post…"
            }
            className="w-full text-xs bg-background border border-border/40 rounded-lg px-3 py-2.5 text-foreground outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground/50"
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
          disabled={!topic.trim() || draftMutation.isPending}
          onClick={handleGenerate}
        >
          <Sparkles size={12} />
          {draftMutation.isPending ? "Generating…" : "Generate AI Draft"}
        </Button>
      </div>

      {/* Draft output */}
      {draft && (
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-foreground">Draft</p>
            <span className={`text-xs ${draft.length > 1450 ? "text-destructive" : "text-muted-foreground"}`}>
              {draft.length} / 1500 chars
            </span>
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={8}
            className="w-full text-sm bg-background border border-border/40 rounded-lg px-3 py-2.5 text-foreground outline-none focus:border-primary/50 resize-none leading-relaxed"
          />
          {published ? (
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle2 size={14} /> Published to Google Business Profile!
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={publishMutation.isPending || draft.length > 1500}
                onClick={() => publishMutation.mutate()}
              >
                <Share2 size={12} />
                {publishMutation.isPending ? "Publishing…" : "Publish to GBP"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground"
                onClick={handleGenerate}
              >
                Regenerate
              </Button>
            </div>
          )}
          {publishMutation.isError && (
            <p className="text-xs text-destructive">{(publishMutation.error as Error).message}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Health Tab ────────────────────────────────────────────────────────────────

function HealthTab() {
  const { data, isLoading } = useQuery<HealthData>({
    queryKey: ["reputation-health"],
    queryFn: () => apiFetch("/api/reputation/health"),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
        <RefreshCw size={14} className="animate-spin" /> Loading system status…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Savings banner */}
      <div className="bg-primary/8 border border-primary/20 rounded-xl p-5">
        <p className="font-semibold text-primary text-sm mb-2">💰 Monthly savings vs paid tools</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(data?.savings ?? {}).map(([k, v]) => (
            k !== "totalSaved" && (
              <div key={k} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground capitalize">{k}:</span> {v}
              </div>
            )
          ))}
        </div>
        <p className="text-base font-bold text-primary mt-3">{data?.savings?.totalSaved}</p>
      </div>

      {/* Feature flags */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <Activity size={14} className="text-primary" /> Feature status
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(data?.features ?? {}).map(([feature, status]) => (
            <div key={feature} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <p className="text-xs text-foreground capitalize">{feature.replace(/([A-Z])/g, " $1")}</p>
              <StatusBadge status={status} />
            </div>
          ))}
        </div>
      </div>

      {/* Free AI providers */}
      <div className="bg-card border border-border/50 rounded-xl p-5">
        <p className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <Zap size={14} className="text-primary" /> Free AI providers (priority order)
        </p>
        <div className="space-y-2">
          {(data?.freeAiProviders ?? []).map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 py-1.5">
              <span className="text-[10px] text-muted-foreground w-4 text-right shrink-0">{i + 1}</span>
              <div className={`w-2 h-2 rounded-full shrink-0 ${p.active ? "bg-green-500" : "bg-muted-foreground/30"}`} />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-foreground font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{p.model}</span>
              </div>
              <Badge className={`text-[10px] border ${p.cost === "FREE" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-muted/30 text-muted-foreground border-border/30"}`}>
                {p.cost}
              </Badge>
              {!p.active && (
                <span className="text-[10px] text-muted-foreground">add API key to activate</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Setup required */}
      {(data?.setupRequired ?? []).length > 0 && (
        <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-5">
          <p className="font-semibold text-amber-400 text-sm mb-3 flex items-center gap-2">
            <AlertCircle size={14} /> Required to activate GBP features
          </p>
          <ul className="space-y-1.5">
            {data!.setupRequired.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                <span className="text-amber-400 shrink-0">•</span>
                <code className="text-foreground">{s}</code>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            Add these in Vercel dashboard → elite-tenancy-latest-version-api-server → Settings → Environment Variables → then redeploy.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminReputation() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Reputation</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Reviews · NAP audit · Social posts · Free AI — replaces NiceJob + Cloutly + BrightLocal
            </p>
          </div>
          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs px-3 py-1">
            Saves £111/mo
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="reviews">
        <TabsList className="mb-6 bg-muted/40 border border-border/40">
          <TabsTrigger value="reviews" className="gap-1.5 text-xs">
            <Star size={12} /> Reviews
          </TabsTrigger>
          <TabsTrigger value="nap" className="gap-1.5 text-xs">
            <MapPin size={12} /> NAP Audit
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-1.5 text-xs">
            <Share2 size={12} /> Social Posts
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-1.5 text-xs">
            <Activity size={12} /> System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
        <TabsContent value="nap"><NapTab /></TabsContent>
        <TabsContent value="social"><SocialTab /></TabsContent>
        <TabsContent value="health"><HealthTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
