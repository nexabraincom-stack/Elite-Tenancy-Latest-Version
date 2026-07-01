import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { upload } from "@vercel/blob/client";
import { Sparkles, ShieldCheck, ArrowRight, BadgeCheck, Users, Home, Star, Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useSeo } from "@/hooks/use-seo";
import type { Listing } from "@workspace/api-client-react";

interface PassportResult {
  passport: { id: number; name: string; aiPersona: string | null; aiScore: number | null };
  matches: Listing[];
}

const STEPS = [
  { icon: BadgeCheck, title: "Build your passport", desc: "One profile — budget, timing, who you are. Takes 60 seconds." },
  { icon: Sparkles, title: "Our AI scores you", desc: "We turn your profile into a landlord-ready persona and a readiness score." },
  { icon: Users, title: "Landlords shortlist you", desc: "Verified landlords see an AI-ranked shortlist — you rise to the top, instantly." },
];

export default function RenterPassport() {
  useSeo({
    title: "Renter Passport — Verified Tenant Profile | Elite Tenancy",
    description: "Get your free Renter Passport. A verified tenant profile that proves your identity, income, and rental history to landlords in seconds.",
    canonical: "https://www.elitetenancy.co.uk/renter-passport",
  });

  const [form, setForm] = useState({
    name: "", email: "", phone: "", city: "",
    minBudget: "", maxBudget: "", bedrooms: "any",
    moveInDate: "", occupants: "", employment: "",
    petsOwner: false, about: "",
  });
  const [result, setResult] = useState<PassportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Photo must be under 5MB.");
      return;
    }
    setPhotoError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoUploading(true);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `${import.meta.env.BASE_URL}api/passport/photo-upload`,
      });
      setPhotoUrl(blob.url);
    } catch {
      setPhotoError("Photo upload failed. You can still submit without one.");
      setPhotoPreview(null);
    } finally {
      setPhotoUploading(false);
    }
  }

  function removePhoto() {
    setPhotoUrl(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function update(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.city || !form.maxBudget) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body = {
        name: form.name,
        email: form.email,
        ...(form.phone && { phone: form.phone }),
        city: form.city,
        ...(form.minBudget && { minBudget: Number(form.minBudget) }),
        maxBudget: Number(form.maxBudget),
        ...(form.bedrooms !== "any" && { bedrooms: Number(form.bedrooms) }),
        ...(form.moveInDate && { moveInDate: form.moveInDate }),
        ...(form.occupants && { occupants: form.occupants }),
        ...(form.employment && { employment: form.employment }),
        petsOwner: form.petsOwner || undefined,
        ...(form.about && { about: form.about }),
        ...(photoUrl && { photoUrl }),
      };
      const res = await fetch(`${import.meta.env.BASE_URL}api/passport`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 429) { setError("We're busy right now — please try again in a moment."); return; }
      if (!res.ok) { const e2 = await res.json().catch(() => ({})); throw new Error(e2.error || "Failed"); }
      const data = (await res.json()) as PassportResult;
      setResult(data);
      setTimeout(() => document.getElementById("passport-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const score = result?.passport.aiScore ?? 0;
  const scoreLabel = score >= 85 ? "Outstanding applicant" : score >= 70 ? "Strong applicant" : score >= 55 ? "Solid applicant" : "Applicant";

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.12),transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <Sparkles size={13} /> AI-Powered · Two-Way Matching
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Your <span className="text-accent italic">Renter Passport</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            One profile that works both ways. Our AI turns you into a landlord-ready applicant with a readiness score — so verified landlords shortlist you first, and your best-matching homes appear instantly.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon size={19} className="text-primary" /></div>
                <span className="text-xs font-bold text-accent">STEP {i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-card border border-border/50 rounded-2xl p-7 shadow-sm">
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Build your passport</h2>
          <p className="text-sm text-muted-foreground mb-6">Free, no account needed. The more you share, the stronger your passport.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-20 h-20 rounded-full bg-muted border border-border/50 overflow-hidden flex items-center justify-center">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={22} className="text-muted-foreground" />
                  )}
                  {photoUploading && (
                    <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                      <Loader2 size={20} className="text-primary animate-spin" />
                    </div>
                  )}
                </div>
                {photoPreview && !photoUploading && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Add a photo (optional)</Label>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoSelect} className="hidden" id="passport-photo" />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={photoUploading} className="text-xs">
                  {photoPreview ? "Change photo" : "Choose photo"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">Landlords respond faster to profiles with a photo.</p>
                {photoError && <p className="text-xs text-destructive mt-1">{photoError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs mb-1.5 block">Full name *</Label><Input required value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" className="bg-background text-sm" /></div>
              <div><Label className="text-xs mb-1.5 block">Email *</Label><Input required type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@email.com" className="bg-background text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs mb-1.5 block">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="07…" className="bg-background text-sm" /></div>
              <div><Label className="text-xs mb-1.5 block">Preferred city / area *</Label><Input required value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="e.g. London" className="bg-background text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div><Label className="text-xs mb-1.5 block">Min £/mo</Label><Input type="number" value={form.minBudget} onChange={(e) => update("minBudget", e.target.value)} placeholder="800" className="bg-background text-sm" /></div>
              <div><Label className="text-xs mb-1.5 block">Max £/mo *</Label><Input required type="number" value={form.maxBudget} onChange={(e) => update("maxBudget", e.target.value)} placeholder="1800" className="bg-background text-sm" /></div>
              <div>
                <Label className="text-xs mb-1.5 block">Bedrooms</Label>
                <Select value={form.bedrooms} onValueChange={(v) => update("bedrooms", v)}>
                  <SelectTrigger className="bg-background text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="0">Studio</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-xs mb-1.5 block">Ideal move-in date</Label><Input type="date" value={form.moveInDate} onChange={(e) => update("moveInDate", e.target.value)} className="bg-background text-sm" /></div>
              <div><Label className="text-xs mb-1.5 block">Who's moving in?</Label><Input value={form.occupants} onChange={(e) => update("occupants", e.target.value)} placeholder="e.g. Me + partner, no children" className="bg-background text-sm" /></div>
            </div>
            <div><Label className="text-xs mb-1.5 block">Employment / income</Label><Input value={form.employment} onChange={(e) => update("employment", e.target.value)} placeholder="e.g. Full-time software engineer, £55k" className="bg-background text-sm" /></div>
            <div><Label className="text-xs mb-1.5 block">About you</Label><Textarea value={form.about} onChange={(e) => update("about", e.target.value)} rows={3} placeholder="Tell landlords why you'd be a great tenant — references, how long you've rented, lifestyle…" className="bg-background text-sm resize-none" /></div>
            <div className="flex items-center justify-between border border-border/40 rounded-lg px-4 py-3 bg-background/50">
              <span className="text-sm text-foreground">I have a pet</span>
              <Switch checked={form.petsOwner} onCheckedChange={(v) => update("petsOwner", v)} />
            </div>
            <Button type="submit" size="lg" disabled={loading || photoUploading || !form.name || !form.email || !form.city || !form.maxBudget} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
              {loading ? (
                <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div> Building your passport…</>
              ) : (
                <><Sparkles size={16} /> Create my Renter Passport</>
              )}
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </form>
        </div>
      </section>

      {/* Result */}
      {result && (
        <section id="passport-result" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {/* Passport card */}
            <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-primary/8 to-accent/8 p-7 mb-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(212,162,74,0.18),transparent_70%)]" />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="text-center shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-card border border-accent/30 flex flex-col items-center justify-center shadow-sm">
                    <span className="font-display text-4xl font-bold text-accent leading-none">{score}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">/ 100</span>
                  </div>
                  <p className="text-xs font-semibold text-primary mt-2 flex items-center justify-center gap-1"><Star size={11} className="fill-accent text-accent" /> {scoreLabel}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <h3 className="font-display text-xl font-bold text-foreground">{result.passport.name}'s Renter Passport</h3>
                  </div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">How landlords will see you</p>
                  <p className="text-sm text-foreground leading-relaxed italic">"{result.passport.aiPersona}"</p>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs gap-1 mt-4"><BadgeCheck size={11} /> Passport saved — landlords can now shortlist you</Badge>
                </div>
              </div>
            </div>

            {/* Matching homes */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold text-foreground flex items-center gap-2"><Home size={20} className="text-primary" /> Your best-matching homes</h3>
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{result.matches.length} found</Badge>
            </div>
            {result.matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {result.matches.map((l) => <PropertyCard key={l.id} listing={l} />)}
              </div>
            ) : (
              <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
                <p className="text-muted-foreground">No live homes match yet — we'll alert you the moment one is listed.</p>
              </div>
            )}
            <div className="text-center mt-8">
              <Link href="/listings">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 gap-2">
                  Browse all homes <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      )}
    </PublicLayout>
  );
}
