import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Star, Users, Building2, TrendingUp, CheckCircle2, Search, MapPin, PoundSterling, Bed, Sparkles, Home as HomeIcon, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetFeaturedListings, useGetPlatformStats, useGetBlogArticles } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

const SEARCH_CITIES = ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Sheffield", "Liverpool", "Edinburgh", "Cardiff", "Glasgow", "Harrogate"];
const SEARCH_BUDGETS = [800, 1000, 1200, 1500, 2000, 2500, 3000];

export default function Home() {
  useSeo({
    title: "Elite Tenancy — Premium UK Lettings Platform",
    description: "Elite Tenancy connects exceptional landlords with premium UK rental properties. Zero upfront fees — pay only on successful completion.",
    canonical: "https://www.elitetenancy.co.uk/",
  });
  const { data: rawFeatured } = useGetFeaturedListings();
  const featured = Array.isArray(rawFeatured) ? rawFeatured : [];
  const { data: stats } = useGetPlatformStats();
  const { data: rawArticles } = useGetBlogArticles();
  const articles = Array.isArray(rawArticles) ? rawArticles : [];
  const [, navigate] = useLocation();
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  function runSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    const qs = params.toString();
    navigate(qs ? `/listings?${qs}` : "/listings");
  }

  return (
    <PublicLayout>
      {/* ======== HERO — full-bleed photo + dark overlay (Housebox) ======== */}
      <section className="relative overflow-hidden min-h-[600px]">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&auto=format&fit=crop&q=85"
          alt="Luxury London property at golden hour"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 via-primary/60 to-primary/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />

        <div className="relative z-10 max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/12 backdrop-blur-sm border border-white/18 text-accent text-xs font-semibold tracking-[0.06em] px-4 py-2 rounded-full mb-6">
              <Sparkles size={13} className="text-accent" />
              Discover your ideal property today
            </span>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-[64px] font-semibold text-white leading-[1.05] tracking-tight max-w-[760px]">
              Find your dream{" "}
              <em className="text-accent not-italic">home in London</em>.
            </h1>

            <p className="text-white/85 text-lg max-w-[580px] leading-relaxed mt-5 mb-9">
              Premium UK lettings, AI-matched tenants, RRA 2025 compliance handled — and Ellie, your AI lettings broker, on WhatsApp before the kettle boils.
            </p>

            {/* Search bar — Housebox signature white bar on dark hero */}
            <form
              onSubmit={runSearch}
              className="bg-white rounded-[14px] p-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] items-stretch gap-0 max-w-[920px] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.35)]"
            >
              <label className="flex flex-col justify-center px-4 py-3 sm:border-r border-border cursor-pointer">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Location</span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <MapPin size={15} className="text-primary shrink-0" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer w-full"
                  >
                    <option value="">Any city</option>
                    {SEARCH_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </span>
              </label>
              <label className="flex flex-col justify-center px-4 py-3 sm:border-r border-border cursor-pointer">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Max Budget</span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <PoundSterling size={15} className="text-primary shrink-0" />
                  <select
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer w-full"
                  >
                    <option value="">Any</option>
                    {SEARCH_BUDGETS.map((b) => <option key={b} value={b}>£{b.toLocaleString()}/mo</option>)}
                  </select>
                </span>
              </label>
              <label className="flex flex-col justify-center px-4 py-3 cursor-pointer">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Bedrooms</span>
                <span className="flex items-center gap-1.5 mt-0.5">
                  <Bed size={15} className="text-primary shrink-0" />
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer w-full"
                  >
                    <option value="">Any</option>
                    <option value="0">Studio</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </span>
              </label>
              <Button type="submit" className="bg-accent text-white hover:bg-accent/90 gap-2 px-7 m-1.5 rounded-[10px] text-sm font-semibold shadow-[0_6px_16px_-6px_rgba(212,162,74,0.4)]">
                <Search size={15} /> Search
              </Button>
            </form>

            {/* Hero stats strip */}
            <div className="flex flex-wrap gap-10 sm:gap-12 mt-9 pt-6 border-t border-white/18">
              {[
                { num: "98%", label: "SATISFACTION RATE" },
                { num: "2,847", label: "VERIFIED TENANCIES" },
                { num: "10K+", label: "HOMES LISTED" },
                { num: "14d", label: "AVG. LET TIME" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl sm:text-[32px] font-semibold text-accent leading-none tracking-tight">{s.num}</p>
                  <p className="text-xs text-white/70 mt-1.5 tracking-[0.04em]">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======== TRUST STRIP ======== */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs sm:text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" />Member of <strong className="text-foreground">The Property Ombudsman</strong></span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /><strong className="text-foreground">RRA 2025</strong> Compliant</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /><strong className="text-foreground">Tenant Fees Act 2019</strong></span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-accent" /><strong className="text-foreground">Deposit Protected</strong></span>
          </div>
        </div>
      </section>

      {/* ======== FEATURED PROPERTIES — Housebox section pattern ======== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              <Star size={12} /> Featured this week
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-4 tracking-tight">
              Curated properties, <em className="text-accent not-italic">verified by hand</em>.
            </h2>
          </div>
          <Link href="/listings">
            <Button variant="outline" className="border-border/60 gap-2 font-semibold">
              View all listings <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        {!featured?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl h-80 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>

      {/* ======== STATS STRIP — navy bar with gold numbers ======== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative bg-primary rounded-xl p-8 sm:p-10 overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(212,162,74,0.25),transparent_70%)] pointer-events-none" />
          {stats ? (
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              {[
                { num: stats.totalListings?.toLocaleString() || "500+", label: "ACTIVE LISTINGS" },
                { num: stats.totalLandlords?.toLocaleString() || "300+", label: "LANDLORDS SERVED" },
                { num: stats.totalTenants?.toLocaleString() || "2,847", label: "HAPPY TENANTS" },
                { num: `${stats.satisfactionRate || 98}%`, label: "SATISFACTION RATE" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl sm:text-[40px] font-semibold text-accent leading-none tracking-tight">{s.num}</p>
                  <p className="text-xs text-white/70 mt-2 tracking-[0.04em]">{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
              {[
                { num: "500+", label: "ACTIVE LISTINGS" },
                { num: "300+", label: "LANDLORDS SERVED" },
                { num: "2,847", label: "HAPPY TENANTS" },
                { num: "98%", label: "SATISFACTION RATE" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-3xl sm:text-[40px] font-semibold text-accent leading-none tracking-tight">{s.num}</p>
                  <p className="text-xs text-white/70 mt-2 tracking-[0.04em]">{s.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======== WHY ELITE TENANCY — Housebox icon box cards ======== */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
              Why us
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-4 tracking-tight">
              The <em className="text-accent not-italic">Elite</em> Difference
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Completion-Only Fees",
                desc: "We only charge when your property lets. Two weeks' rent for introduction — payable on success, not on hope.",
              },
              {
                icon: Star,
                title: "Six-Stage Screening",
                desc: "Credit checks, affordability assessments, landlord references, and character interviews — our default rate is below 0.3%.",
              },
              {
                icon: Clock,
                title: "14-Day Average Let",
                desc: "Professional photography, premium listings, and an active tenant database mean your property rarely sits empty.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-background border border-border/40 rounded-xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex gap-4"
              >
                <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIAL ======== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <Quote size={36} className="text-accent/30 mx-auto mb-4" />
          <blockquote className="font-display text-2xl sm:text-3xl font-semibold text-foreground leading-snug tracking-tight">
            "Elite Tenancy found us a tenant in 9 days. No faff, no hidden fees, just a single invoice for two weeks' rent."
          </blockquote>
          <p className="mt-5 text-sm text-muted-foreground">
            <strong className="text-foreground">Sarah M.</strong> — Landlord, East Ham
          </p>
        </div>
      </section>

      {/* ======== BLOG PREVIEW ======== */}
      {articles && articles.length > 0 && (
        <section className="bg-card border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
              <div>
                <span className="inline-flex items-center gap-2 bg-accent/10 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full">
                  Expert insights
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-foreground mt-4 tracking-tight">
                  From the <em className="text-accent not-italic">Blog</em>
                </h2>
              </div>
              <Link href="/blog">
                <Button variant="outline" className="border-border/60 gap-2 font-semibold">
                  All articles <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.slice(0, 2).map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="group bg-background border border-border/40 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                    {article.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-3">
                        {article.category}
                      </span>
                      <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                        <span>{article.author}</span>
                        <span>·</span>
                        <span>{article.readTimeMinutes} min read</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======== CTA — navy with gold radial ======== */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_0%_0%,rgba(212,162,74,0.28),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_100%_100%,rgba(0,0,0,0.22),transparent)] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full border border-white/8 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full">
            Get started today
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-white mt-6 tracking-tight">
            Ready to let with <em className="text-accent not-italic">confidence</em>?
          </h2>
          <p className="text-white/70 mb-10 max-w-xl mx-auto text-lg leading-relaxed mt-5">
            Join over 300 landlords who trust Elite Tenancy to find exceptional tenants — completion fee only, no upfront costs.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/valuation">
              <Button size="lg" className="bg-accent text-white hover:bg-accent/90 px-8 shadow-lg shadow-accent/25 font-semibold gap-2">
                Get a Free Valuation <ArrowRight size={15} />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="px-8 border-white/25 text-white hover:bg-white/10 hover:border-white/40 font-semibold">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
