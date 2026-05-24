import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, CheckCircle2, ArrowRight, Bed, Bath, MapPin, PoundSterling, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import PublicLayout from "@/components/PublicLayout";
import type { Listing } from "@workspace/api-client-react";

interface MatchResult {
  id: number;
  score: number;
  summary: string;
  highlights: string[];
  listing: Listing;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85 ? "bg-green-500/15 text-green-400 border-green-500/30" :
    score >= 65 ? "bg-primary/15 text-primary border-primary/30" :
    "bg-muted text-muted-foreground border-border/50";

  const label =
    score >= 85 ? "Excellent match" :
    score >= 65 ? "Good match" :
    "Partial match";

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${color}`}>
      <span className="text-base font-bold">{score}</span>
      <span>{label}</span>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 85 ? "bg-green-500" : score >= 65 ? "bg-primary" : "bg-muted-foreground";
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}

function MatchCard({ match, index }: { match: MatchResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const photo = match.listing.photos?.[0] ?? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-colors"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-52 shrink-0 relative overflow-hidden">
          <img
            src={photo}
            alt={match.listing.title}
            className="w-full h-48 sm:h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r" />
          {index === 0 && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-primary text-primary-foreground text-xs gap-1">
                <Sparkles size={10} /> Best Match
              </Badge>
            </div>
          )}
        </div>

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-1">
                {match.listing.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <MapPin size={11} />
                {match.listing.city}, {match.listing.postcode}
              </p>
            </div>
            <ScoreBadge score={match.score} />
          </div>

          <ScoreBar score={match.score} />

          <p className="text-sm text-muted-foreground mt-3 leading-relaxed italic">
            "{match.summary}"
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <PoundSterling size={11} className="text-primary" />
              £{match.listing.price?.toLocaleString("en-GB")}/mo
            </span>
            <span className="flex items-center gap-1.5">
              <Bed size={11} />
              {match.listing.bedrooms === 0 ? "Studio" : `${match.listing.bedrooms} bed`}
            </span>
            <span className="flex items-center gap-1.5">
              <Bath size={11} />
              {match.listing.bathrooms} bath
            </span>
            <span className="capitalize">{match.listing.category}</span>
          </div>

          {match.highlights.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 mt-3 transition-colors"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {expanded ? "Hide" : "See"} why it matches
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-2 space-y-1.5">
                      {match.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 size={12} className="text-primary mt-0.5 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="mt-4">
            <Link href={`/listings/${match.listing.id}`}>
              <Button size="sm" className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all gap-1.5 text-xs">
                View Property <ArrowRight size={12} />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TenantMatch() {
  const [form, setForm] = useState({
    city: "",
    minBudget: "",
    maxBudget: "",
    bedrooms: "any",
    furnished: false,
    petsAllowed: false,
    billsIncluded: false,
    moveInDate: "",
    lifestyle: "",
    priorities: "",
  });

  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(field: string, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.maxBudget) return;
    setLoading(true);
    setError(null);
    setMatches(null);

    try {
      const body = {
        ...(form.city && { city: form.city }),
        ...(form.minBudget && { minBudget: Number(form.minBudget) }),
        maxBudget: Number(form.maxBudget),
        ...(form.bedrooms !== "any" && { bedrooms: Number(form.bedrooms) }),
        furnished: form.furnished || undefined,
        petsAllowed: form.petsAllowed || undefined,
        billsIncluded: form.billsIncluded || undefined,
        ...(form.moveInDate && { moveInDate: form.moveInDate }),
        ...(form.lifestyle && { lifestyle: form.lifestyle }),
        ...(form.priorities && { priorities: form.priorities }),
      };

      const res = await fetch(`${import.meta.env.BASE_URL}api/matching/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        setError("The AI service is busy right now. Please wait a moment and try again.");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Matching failed");
      }
      const data = await res.json();
      setMatches(data.matches);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">AI-Powered</Badge>
          </div>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-tight mb-3">
            Find Your Perfect Match
          </h1>
          <p className="text-muted-foreground max-w-xl text-lg">
            Tell us what you're looking for and our AI will score every available property against your requirements — ranking the best matches first.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Search size={16} className="text-primary" />
                Your Requirements
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs mb-1.5 block">City or area</Label>
                  <Input
                    value={form.city}
                    onChange={e => update("city", e.target.value)}
                    placeholder="e.g. Manchester"
                    className="bg-background text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1.5 block">Min budget £/mo</Label>
                    <Input
                      type="number"
                      value={form.minBudget}
                      onChange={e => update("minBudget", e.target.value)}
                      placeholder="500"
                      className="bg-background text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1.5 block">Max budget £/mo *</Label>
                    <Input
                      type="number"
                      required
                      value={form.maxBudget}
                      onChange={e => update("maxBudget", e.target.value)}
                      placeholder="2000"
                      className="bg-background text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Bedrooms</Label>
                  <Select value={form.bedrooms} onValueChange={v => update("bedrooms", v)}>
                    <SelectTrigger className="bg-background text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1 bedroom</SelectItem>
                      <SelectItem value="2">2 bedrooms</SelectItem>
                      <SelectItem value="3">3 bedrooms</SelectItem>
                      <SelectItem value="4">4+ bedrooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Ideal move-in date</Label>
                  <Input
                    type="date"
                    value={form.moveInDate}
                    onChange={e => update("moveInDate", e.target.value)}
                    className="bg-background text-sm"
                  />
                </div>

                <div className="space-y-3 border border-border/40 rounded-lg p-3 bg-background/50">
                  {[
                    { field: "furnished", label: "Furnished" },
                    { field: "petsAllowed", label: "Pets allowed" },
                    { field: "billsIncluded", label: "Bills included" },
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{label}</span>
                      <Switch
                        checked={form[field as keyof typeof form] as boolean}
                        onCheckedChange={v => update(field, v)}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Your lifestyle</Label>
                  <Textarea
                    value={form.lifestyle}
                    onChange={e => update("lifestyle", e.target.value)}
                    placeholder="e.g. Young professional, work from home 3 days a week, enjoy cycling and cafés..."
                    rows={2}
                    className="bg-background text-sm resize-none"
                  />
                </div>

                <div>
                  <Label className="text-xs mb-1.5 block">Top priorities</Label>
                  <Textarea
                    value={form.priorities}
                    onChange={e => update("priorities", e.target.value)}
                    placeholder="e.g. Good transport links, quiet neighbourhood, modern kitchen..."
                    rows={2}
                    className="bg-background text-sm resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !form.maxBudget}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={16} />
                      </motion.div>
                      Analysing properties…
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Find My Matches
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {!matches && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Sparkles size={36} className="text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                  Your AI Property Matchmaker
                </h3>
                <p className="text-muted-foreground max-w-md leading-relaxed">
                  Fill in your requirements and we'll use Gemini AI to score every available listing against your needs — surfacing the properties most likely to feel like home.
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-6">
                  {["Scores 0–100", "Explains why", "Ranks best first"].map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                      <CheckCircle2 size={11} className="text-primary" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary flex items-center justify-center mb-6"
                >
                  <Sparkles size={22} className="text-primary" />
                </motion.div>
                <h3 className="font-semibold text-foreground mb-2">Analysing properties…</h3>
                <p className="text-sm text-muted-foreground">Gemini AI is scoring each listing against your requirements</p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {matches && matches.length === 0 && (
              <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
                <Search size={36} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No properties found</h3>
                <p className="text-muted-foreground text-sm">Try widening your budget or removing some filters.</p>
              </div>
            )}

            {matches && matches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{matches.length}</span> properties ranked by AI match score
                  </p>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1">
                    <Sparkles size={10} /> Powered by Gemini AI
                  </Badge>
                </div>
                <div className="space-y-4">
                  {matches.map((match, i) => (
                    <MatchCard key={match.id} match={match} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
