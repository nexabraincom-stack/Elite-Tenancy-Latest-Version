import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ExternalLink, CheckCircle2, Clock, XCircle, Sparkles, BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const GOV_CHECK = "https://www.gov.uk/view-right-to-rent";

export default function RightToRentCheck() {
  useSeo({
    title: "Right to Rent Checker & Expiry Reminders for Landlords | Elite Tenancy",
    description: "Run a compliant Right to Rent check with the official GOV.UK service, record the result, and we'll automatically remind you before a time-limited tenant's right expires — so you keep your statutory excuse and avoid penalties of up to £20,000.",
    canonical: "https://www.elitetenancy.co.uk/right-to-rent-check",
  });

  const [form, setForm] = useState({ landlordName: "", landlordEmail: "", tenantName: "", rightStatus: "", expiryDate: "" });
  const [done, setDone] = useState<null | { rightStatus: string; expiryDate: string | null; tenantName: string }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.landlordEmail || !form.tenantName || !form.rightStatus) return;
    if (form.rightStatus === "time_limited" && !form.expiryDate) { setError("Please enter the expiry date for a time-limited right."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/rtr/check`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error || "Could not save. Please try again."); return; }
      setDone({ rightStatus: data.rightStatus, expiryDate: data.expiryDate, tenantName: data.tenantName });
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  const STATUSES = [
    { v: "unlimited", label: "Unlimited right to rent", icon: CheckCircle2, tone: "text-green-600" },
    { v: "time_limited", label: "Time-limited right (has an expiry)", icon: Clock, tone: "text-accent" },
    { v: "none", label: "No right to rent", icon: XCircle, tone: "text-destructive" },
  ];

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.12),transparent_60%)]" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <ShieldCheck size={13} /> Compliance · Landlords
          </span>
          <h1 className="font-serif text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Right to Rent — <span className="text-accent italic">checked & tracked</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every landlord in England must check a tenant's Right to Rent. Get it wrong and the penalty is up to <strong className="text-foreground">£20,000</strong>. Run the official check, record the result here, and we'll <strong className="text-foreground">remind you before a time-limited right expires</strong> — so you never lose your statutory excuse.
          </p>
        </div>
      </section>

      {!done && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Step 1 */}
          <div className="bg-card border border-border/50 rounded-2xl p-7 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Run the official check</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Ask your tenant for their 9-character GOV.UK share code and date of birth, then run the free official check. It returns a live Home Office result.</p>
            <a href={GOV_CHECK} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">Open GOV.UK Right to Rent check <ExternalLink size={15} /></Button>
            </a>
          </div>

          {/* Step 2 */}
          <div className="bg-card border border-border/50 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
              <h2 className="font-serif text-2xl font-bold text-foreground">Record the result & set a reminder</h2>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label className="text-xs mb-1.5 block">Your name</Label><Input value={form.landlordName} onChange={(e) => update("landlordName", e.target.value)} placeholder="Optional" className="bg-background text-sm" /></div>
                <div><Label className="text-xs mb-1.5 block">Your email *</Label><Input type="email" required value={form.landlordEmail} onChange={(e) => update("landlordEmail", e.target.value)} placeholder="you@email.com" className="bg-background text-sm" /></div>
              </div>
              <div><Label className="text-xs mb-1.5 block">Tenant name *</Label><Input required value={form.tenantName} onChange={(e) => update("tenantName", e.target.value)} placeholder="As shown on the check" className="bg-background text-sm" /></div>
              <div>
                <Label className="text-xs mb-2 block">What did the GOV.UK check show? *</Label>
                <div className="space-y-2">
                  {STATUSES.map(({ v, label, icon: Icon, tone }) => (
                    <label key={v} className={`flex items-center gap-3 border rounded-lg px-4 py-3 cursor-pointer transition-colors ${form.rightStatus === v ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"}`}>
                      <input type="radio" name="rs" value={v} checked={form.rightStatus === v} onChange={() => update("rightStatus", v)} className="accent-primary" />
                      <Icon size={16} className={tone} />
                      <span className="text-sm text-foreground">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {form.rightStatus === "time_limited" && (
                <div><Label className="text-xs mb-1.5 block">Right expires on *</Label><Input type="date" value={form.expiryDate} onChange={(e) => update("expiryDate", e.target.value)} className="bg-background text-sm" /></div>
              )}
              <Button type="submit" size="lg" disabled={loading || !form.landlordEmail || !form.tenantName || !form.rightStatus} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                {loading ? <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}><Sparkles size={16} /></motion.div> Saving…</> : <><BellRing size={16} /> Save & set reminder</>}
              </Button>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <p className="text-[11px] text-muted-foreground text-center">We don't store share codes or dates of birth — only the result and expiry, so we can remind you.</p>
            </form>
          </div>
        </section>
      )}

      {done && (
        <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-green-500/30 rounded-2xl p-8 text-center">
            <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">Check recorded for {done.tenantName}</h3>
            {done.rightStatus === "time_limited" ? (
              <p className="text-muted-foreground">We've logged the time-limited right expiring <strong className="text-foreground">{done.expiryDate}</strong>. We'll email you a reminder before it lapses so you can request a fresh share code and keep your statutory excuse.</p>
            ) : done.rightStatus === "unlimited" ? (
              <p className="text-muted-foreground">Unlimited right to rent recorded — no re-check needed. A confirmation is on its way to your inbox.</p>
            ) : (
              <p className="text-muted-foreground">Recorded as <strong className="text-foreground">no right to rent</strong>. Letting to someone without the right to rent risks a civil penalty — do not proceed.</p>
            )}
          </motion.div>
        </section>
      )}
    </PublicLayout>
  );
}
