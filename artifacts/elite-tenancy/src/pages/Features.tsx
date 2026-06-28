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
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Badge className="bg-primary/10 text-primary border-primary/20 mb-5">
            <Zap size={11} className="mr-1" /> One platform · everything lettings
          </Badge>
          <h1 className="font-serif text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
            Modern letting for smart landlords &amp; renters
          </h1>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            AI-powered tenant matching, automated review management, built-in compliance tools,
            and a full property management portal — all in one place.
          </p>
          <div className="flex flex-wrap gap-4 mt-8 justify-center">
            <Link href="/listings">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Browse Properties <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/for-landlords">
              <Button size="lg" variant="outline" className="border-border/60">For Landlords</Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto pt-10 border-t border-border/50">
            {stats.map(({ num, label }) => (
              <div key={label}>
                <p className="font-serif text-3xl font-bold text-primary">{num}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Platform overview</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Everything in one place</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Ellie demo */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Ellie intelligence</p>
            <h2 className="font-serif text-4xl font-bold text-foreground mb-4">Your AI letting agent — works while you sleep</h2>
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
                  <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="bg-muted/40 border-b border-border/50 px-4 py-2.5 flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">Ellie Chat — Elite Tenancy</span>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="self-end max-w-[85%] bg-muted/50 border border-border/40 rounded-xl px-3.5 py-2.5 text-sm text-foreground">
                Hi, any 2-bed flats near East Ham station?
              </div>
              <div className="self-start max-w-[85%] bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground">
                Yes — a refurbished 2-bed on Barking Road, E6, 4 mins from the station. £1,400/month, available 1 July. Want to arrange a viewing?
              </div>
              <div className="self-end max-w-[85%] bg-muted/50 border border-border/40 rounded-xl px-3.5 py-2.5 text-sm text-foreground">
                That's great, you've been really helpful!
              </div>
              <div className="self-start max-w-[85%] bg-primary/10 border border-primary/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground">
                So kind — thank you! If you have a moment, a quick Google review would mean a lot to us. Here's the link 🙏
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reputation savings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Reputation intelligence</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Replaces £111/month of paid tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: MessageSquare, tool: "NiceJob — £60/mo", does: "Review emails + WhatsApp follow-ups" },
            { icon: Star, tool: "Cloutly — £22/mo", does: "GBP review monitoring + AI replies" },
            { icon: MapPin, tool: "BrightLocal — £29/mo", does: "18-directory NAP audit" },
          ].map(({ icon: Icon, tool, does }) => (
            <div key={tool} className="bg-card border border-border/50 rounded-xl p-6">
              <Icon size={18} className="text-primary mb-3" />
              <p className="text-sm line-through text-muted-foreground">{tool}</p>
              <p className="text-sm text-foreground font-medium mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-primary" /> {does}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-primary/5 border border-primary/15 rounded-2xl p-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Megaphone size={20} className="text-primary" />
            <p className="text-foreground font-medium">All built into your admin dashboard — using your existing stack</p>
          </div>
          <p className="font-serif text-3xl font-bold text-primary">£111 saved /mo</p>
        </div>
      </section>

      {/* Portals */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">User portals</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Tailored for every user type</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portals.map(({ icon: Icon, name, reward, points }) => (
              <div key={name} className="bg-card border border-border/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon size={18} className="text-primary" />
                  </div>
                  {reward && (
                    <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                      <Gift size={10} className="mr-1" /> {reward}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-3">{name}</h3>
                <ul className="space-y-2">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 size={12} className="text-primary shrink-0 mt-0.5" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Referral programme</p>
          <h2 className="font-serif text-4xl font-bold text-foreground">Earn cash, unlock trials</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Every user type has its own referral reward and a 14-day free trial to give away.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {referrals.map(({ tier, reward, desc, trial }) => (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border/50 rounded-xl p-6"
            >
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 mb-3">
                {tier} — {reward}
              </Badge>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
              <p className="flex items-center gap-2 text-xs text-primary font-medium">
                <CheckCircle2 size={13} /> {trial}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Pricing</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="text-muted-foreground mt-3">Tenant features are free. All paid plans include a 14-day free trial.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map(({ name, price, badge, featured, features: pf }) => (
              <div
                key={name}
                className={`bg-card border rounded-xl p-6 flex flex-col ${featured ? "border-primary shadow-lg shadow-primary/5" : "border-border/50"}`}
              >
                {badge && (
                  <Badge className={`mb-3 self-start text-xs ${featured ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground border-border/40"}`}>
                    {badge}
                  </Badge>
                )}
                <p className="text-sm text-muted-foreground">{name}</p>
                <p className="font-serif text-3xl font-bold text-foreground mt-1">
                  {price}<span className="text-sm text-muted-foreground font-sans font-normal">/mo</span>
                </p>
                <ul className="space-y-2 mt-5 flex-1">
                  {pf.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <Button className={`w-full mt-6 ${featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}`} variant={featured ? "default" : "outline"}>
                    {name === "Starter" ? "Get Started" : "Start Free Trial"}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <PoundSterling size={28} className="text-primary mx-auto mb-4" />
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            One platform. Zero hidden fees.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Whether you're letting a property or looking for your next home — Elite Tenancy has the tools.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/valuation">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-10">
                Book a Free Valuation
              </Button>
            </Link>
            <Link href="/listings">
              <Button size="lg" variant="outline" className="border-border/60 px-10">Browse Properties</Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
