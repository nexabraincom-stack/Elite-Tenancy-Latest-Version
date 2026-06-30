import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Home, Bot, Star, ClipboardCheck, CreditCard, Wrench, IdCard, FileText, Gift,
  ArrowRight, CheckCircle2, MessageSquare, MapPin, Megaphone, Zap, KeyRound,
  Building2, Settings, PoundSterling,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";

const features = [
  { icon: Home, title: "Smart Listings", desc: "AI-matched property listings with photo galleries and instant enquiry capture via Ellie." },
  { icon: Bot, title: "Ellie AI Assistant", desc: "Always-on AI chatbot on website and WhatsApp. Qualifies leads and answers questions 24/7." },
  { icon: Star, title: "Reputation Manager", desc: "Monitor Google reviews, AI-draft replies, audit 18 UK directories, and publish GBP posts." },
  { icon: ClipboardCheck, title: "RRA 2025 Compliance", desc: "Automated reminders for the Renters' Rights Act 2025. Right to Rent checker built in." },
  { icon: CreditCard, title: "Rent Collection", desc: "BACS Direct Debit mandate setup for tenants. Payment history, overdue alerts, and dashboard." },
  { icon: Wrench, title: "Maintenance Portal", desc: "Tenant-submitted requests with photo uploads, priority flags, and resolution tracking." },
  { icon: IdCard, title: "Renter Passport", desc: "AI-scored tenant profiles combining ID, employment, credit, and references." },
  { icon: FileText, title: "Digital Documents", desc: "Tenancy agreements and compliance documents stored securely and accessible in-portal." },
  { icon: Gift, title: "Referral Programme", desc: "Earn £20–£100 per successful referral, plus a 14-day free trial for everyone you refer." },
];

const portals = [
  { icon: Home, name: "Tenant", reward: "£20", points: ["Rent & direct debit", "Maintenance requests", "Documents & messages", "Refer & earn £20"] },
  { icon: KeyRound, name: "Landlord", reward: "£50", points: ["Portfolio dashboard", "Listings & tenants", "Finances & Stripe", "Refer & earn £50"] },
  { icon: Building2, name: "Agency", reward: "£100", points: ["Multi-property tools", "Automated referencing", "Digital agreements", "Refer & earn £100"] },
  { icon: Settings, name: "Admin", reward: null, points: ["Platform analytics", "Reputation & SEO", "Listings & leads", "User management"] },
];

const referrals = [
  { tier: "Tenant", reward: "£20", desc: "Earn £20 cash when your friend completes all 6 referencing verification steps. They unlock a 14-day premium trial.", trial: "14-day premium trial" },
  { tier: "Landlord", reward: "£50", desc: "Earn £50 when the referred landlord lists their first property and signs their first tenancy through Elite Tenancy.", trial: "14-day Growth trial (£49 value)" },
  { tier: "Agency", reward: "£100", desc: "Earn £100 — our largest reward — when a referred agency has 3+ active listings within their first 30 days.", trial: "14-day Pro trial (£99 value)" },
];

const plans = [
  { name: "Starter", price: "£19", badge: null, featured: false, features: ["1 active listing", "AI tenant matching", "Basic analytics", "Email support"] },
  { name: "Growth", price: "£49", badge: "Popular", featured: true, features: ["5 active listings", "Priority AI matching", "Full analytics", "14-day free trial"] },
  { name: "Pro", price: "£99", badge: "Best Value", featured: false, features: ["Unlimited listings", "Ellie WhatsApp AI", "Automated referencing", "14-day free trial"] },
  { name: "Elite", price: "£199", badge: "White Glove", featured: false, features: ["Everything in Pro", "Account manager", "Weekly reviews", "14-day free trial"] },
];

const stats = [
  { num: "£111", label: "saved / month vs paid tools" },
  { num: "£20", label: "tenant referral reward" },
  { num: "14", label: "day free trial" },
  { num: "6", label: "free AI providers" },
];

export default function Features() {
  useSeo({
    title: "Platform Features | Elite Tenancy",
    description: "AI tenant matching, automated review management, RRA 2025 compliance, rent collection, and a £20–£100 referral programme with 14-day free trials. All in one platform.",
    canonical: "https://www.elitetenancy.co.uk/features",
  });

  return (
    <PublicLayout>
      {/* Hero — navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
            <Zap size={12} /> One platform · everything lettings
          </span>
          <h1 className="font-display text-5xl md:text-6xl font-semibold text-white leading-[1.05] tracking-tight mt-7 max-w-3xl mx-auto">
            Modern letting for <em className="text-accent not-italic">smart</em> landlords &amp; renters
          </h1>
          <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-2xl mx-auto">
            AI-powered tenant matching, automated review management, built-in compliance tools,
            and a full property management portal — all in one place.
          </p>
          <div className="flex flex-wrap gap-4 mt-9 justify-center">
            <Link href="/listings">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 gap-2 shadow-lg shadow-accent/30 font-semibold">
                Browse Properties <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/for-landlords">
              <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-semibold">
                For Landlords
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-3xl mx-auto pt-10 border-t border-white/15">
            {stats.map(({ num, label }) => (
              <div key={label}>
                <p className="font-display text-3xl font-semibold text-accent tracking-tight">{num}</p>
                <p className="text-xs text-white/55 mt-2 tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid — Housebox cards */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Platform overview
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Everything in <em className="text-accent not-italic">one place</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="relative bg-card rounded-xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 border border-border/40"
              >
                <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center mb-5">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ellie demo */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full mb-4">
              Ellie intelligence
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mb-4 tracking-tight">
              Your AI letting agent — works while you <em className="text-accent not-italic">sleep</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Ellie runs on a free AI provider chain (Groq, Gemini, Cerebras, OpenRouter) with a paid fallback.
              She lives on your website and WhatsApp — same brain, same context.
            </p>
            <ul className="space-y-3">
              {[
                "Qualifies tenant enquiries and captures leads automatically",
                "Answers questions about fees, RRA 2025, and listings in real time",
                "Asks for Google reviews naturally (CMA 2025 compliant)",
                "AI-drafts replies to your reviews using free providers",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 size={16} className="text-accent shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-background border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-primary px-4 py-3 flex items-center gap-2">
              <MessageSquare size={14} className="text-accent" />
              <span className="text-xs text-white/80 font-medium">Ellie Chat — Elite Tenancy</span>
            </div>
            <div className="p-5 flex flex-col gap-3 bg-background">
              <div className="self-end max-w-[85%] bg-primary text-white rounded-xl rounded-br-md px-3.5 py-2.5 text-sm">
                Hi, any 2-bed flats near East Ham station?
              </div>
              <div className="self-start max-w-[85%] bg-card border border-border/40 rounded-xl rounded-bl-md px-3.5 py-2.5 text-sm text-foreground">
                Yes — a refurbished 2-bed on Barking Road, E6, 4 mins from the station. £1,400/month, available 1 July. Want to arrange a viewing?
              </div>
              <div className="self-end max-w-[85%] bg-primary text-white rounded-xl rounded-br-md px-3.5 py-2.5 text-sm">
                That's great, you've been really helpful!
              </div>
              <div className="self-start max-w-[85%] bg-card border border-border/40 rounded-xl rounded-bl-md px-3.5 py-2.5 text-sm text-foreground">
                So kind — thank you! If you have a moment, a quick Google review would mean a lot to us. Here's the link
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reputation savings */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Reputation intelligence
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Replaces <em className="text-accent not-italic">£111/month</em> of paid tools
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { icon: MessageSquare, tool: "NiceJob — £60/mo", does: "Review emails + WhatsApp follow-ups" },
              { icon: Star, tool: "Cloutly — £22/mo", does: "GBP review monitoring + AI replies" },
              { icon: MapPin, tool: "BrightLocal — £29/mo", does: "18-directory NAP audit" },
            ].map(({ icon: Icon, tool, does }) => (
              <div key={tool} className="bg-card border border-border/40 rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-primary text-accent flex items-center justify-center mb-4">
                  <Icon size={18} />
                </div>
                <p className="text-sm line-through text-muted-foreground">{tool}</p>
                <p className="text-sm text-foreground font-medium mt-1 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-accent" /> {does}
                </p>
              </div>
            ))}
          </div>
          <div className="bg-primary rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Megaphone size={20} className="text-accent" />
              <p className="text-white font-medium">All built into your admin dashboard — using your existing stack</p>
            </div>
            <p className="font-display text-3xl font-semibold text-accent">£111 saved /mo</p>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              User portals
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Tailored for every <em className="text-accent not-italic">user type</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {portals.map(({ icon: Icon, name, reward, points }) => (
              <div key={name} className="bg-background border border-border/40 rounded-xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-[46px] h-[46px] rounded-[12px] bg-primary text-accent flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  {reward && (
                    <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px] font-semibold uppercase tracking-wider">
                      <Gift size={10} className="mr-1" /> {reward}
                    </Badge>
                  )}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-3 tracking-tight">{name}</h3>
                <ul className="space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-accent shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral programme */}
      <section className="bg-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              <Gift size={12} /> Referral programme
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Earn cash, unlock <em className="text-accent not-italic">trials</em>
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Every user type has its own referral reward and a 14-day free trial to give away.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {referrals.map(({ tier, reward, desc, trial }, i) => (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="bg-card border border-border/40 rounded-xl p-7 shadow-sm"
              >
                <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px] font-semibold uppercase tracking-wider mb-4">
                  {tier} — {reward}
                </Badge>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                <p className="flex items-center gap-2 text-xs text-accent font-semibold">
                  <CheckCircle2 size={13} /> {trial}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Pricing
            </span>
            <h2 className="font-display text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Simple, transparent <em className="text-accent not-italic">pricing</em>
            </h2>
            <p className="text-muted-foreground mt-3">Tenant features are free. All paid plans include a 14-day free trial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map(({ name, price, badge, featured, features: pf }) => (
              <div
                key={name}
                className={`bg-background border rounded-xl p-6 flex flex-col shadow-sm ${featured ? "border-2 border-accent ring-1 ring-accent/20" : "border-border/40"}`}
              >
                {badge && (
                  <Badge className={`mb-3 self-start text-[10px] font-semibold uppercase tracking-wider ${featured ? "bg-accent text-white" : "bg-accent/15 text-accent border-accent/30"}`}>
                    {badge}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground">{name}</p>
                <p className="font-display text-3xl font-semibold text-foreground mt-1 tracking-tight">
                  {price}<span className="text-sm text-muted-foreground font-sans font-normal">/mo</span>
                </p>
                <ul className="space-y-2 mt-5 flex-1">
                  {pf.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={13} className="text-accent shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button className={`w-full mt-6 font-semibold ${featured ? "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/25" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                    {name === "Starter" ? "Get Started" : "Start Free Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — navy */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <PoundSterling size={28} className="text-accent mx-auto mb-4" />
          <h2 className="font-display text-4xl font-semibold text-white mb-4 tracking-tight">
            One platform. Zero hidden fees.
          </h2>
          <p className="text-white/70 mb-9 max-w-xl mx-auto">
            Whether you're letting a property or looking for your next home — Elite Tenancy has the tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/valuation">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-10 font-semibold shadow-lg shadow-accent/30">
                Book a Free Valuation
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:border-white/40 px-10 font-semibold">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
