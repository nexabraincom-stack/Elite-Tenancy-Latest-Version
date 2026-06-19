import { useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Shield, Clock, Star, Users, Building2, TrendingUp, CheckCircle2, Search, MapPin, PoundSterling, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const { data: featured } = useGetFeaturedListings();
  const { data: stats } = useGetPlatformStats();
  const { data: articles } = useGetBlogArticles();
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
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,146,63,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(31,74,63,0.06),transparent_55%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <Badge className="bg-primary/15 text-primary border-primary/30 mb-6 text-xs tracking-wide uppercase">
              UK's Premier Lettings Platform
            </Badge>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              Find your{" "}
              <span className="text-accent italic">perfect</span>{" "}
              tenancy today
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              Elite Tenancy connects exceptional landlords with exceptional tenants across the UK. We charge only on successful completion — no upfront fees, ever.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/listings">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  Browse Properties
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/list-your-property">
                <Button size="lg" variant="outline" className="border-border/60 hover:border-primary/50 gap-2 px-8">
                  List Your Property
                </Button>
              </Link>
            </div>

            {/* Hero search bar */}
            <form
              onSubmit={runSearch}
              className="mt-8 bg-card border border-border rounded-2xl p-2.5 flex flex-col sm:flex-row gap-2 shadow-xl max-w-2xl"
            >
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                <MapPin size={16} className="text-primary shrink-0" />
                <span className="flex flex-col w-full">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Location</span>
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
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer sm:border-l sm:border-border">
                <PoundSterling size={16} className="text-primary shrink-0" />
                <span className="flex flex-col w-full">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Max Budget</span>
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
              <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer sm:border-l sm:border-border">
                <Bed size={16} className="text-primary shrink-0" />
                <span className="flex flex-col w-full">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Bedrooms</span>
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
              <Button type="submit" size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-6 sm:self-stretch">
                <Search size={16} /> Search
              </Button>
            </form>
            <div className="flex flex-wrap gap-6 mt-10 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" />No upfront fees</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" />Rigorous tenant screening</span>
              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" />Member of The Property Ombudsman</span>
            </div>
          </motion.div>

          {/* Right column — luxury property visual + floating trust cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-primary/15 bg-gradient-to-br from-primary/10 to-accent/10 aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=80"
                alt="A beautiful, light-filled premium UK home let through Elite Tenancy"
                loading="eager"
                fetchPriority="high"
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              {/* brand-tone overlays so any image harmonises with the ivory/green/gold palette */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-primary/10 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,146,63,0.22),transparent_60%)]" />

              {/* top-right floating badge */}
              <div className="absolute top-5 right-5 flex items-center gap-2 bg-background/85 backdrop-blur-md border border-accent/30 rounded-full px-4 py-2 shadow-lg">
                <Star size={14} className="text-accent fill-accent" />
                <span className="text-xs font-bold text-foreground">AI-matched homes</span>
              </div>

              {/* bottom floating trust card */}
              <div className="absolute bottom-5 left-5 right-5 bg-background/90 backdrop-blur-md border border-border/60 rounded-2xl p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center">
                      <Shield size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground leading-tight">Verified landlords only</p>
                      <p className="text-xs text-muted-foreground">Every home ID-checked & deposit protected</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-serif text-xl font-bold text-accent leading-none flex items-center gap-1">
                      4.9<Star size={13} className="text-accent fill-accent" />
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">tenant rating</p>
                  </div>
                </div>
              </div>
            </div>

            {/* offset accent stat chip */}
            <div className="absolute -bottom-5 -left-5 bg-primary text-primary-foreground rounded-2xl px-5 py-3 shadow-xl">
              <p className="font-serif text-2xl font-bold leading-none">14 days</p>
              <p className="text-[11px] opacity-80 mt-1">average time to let</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Accreditation trust bar */}
      <section className="bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs sm:text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" />Member of <strong className="text-foreground">The Property Ombudsman</strong></span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /><strong className="text-foreground">RRA 2025</strong> Compliant</span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /><strong className="text-foreground">Tenant Fees Act 2019</strong></span>
            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-primary" /><strong className="text-foreground">Deposit Protected</strong></span>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      {stats && (
        <section className="bg-card border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
              {[
                { label: "Active Listings", value: stats.totalListings?.toLocaleString() },
                { label: "Landlords Served", value: stats.totalLandlords?.toLocaleString() },
                { label: "Happy Tenants", value: stats.totalTenants?.toLocaleString() },
                { label: "Avg. Days to Let", value: stats.averageLetTime },
                { label: "Cities Covered", value: stats.citiesCovered },
                { label: "Satisfaction Rate", value: `${stats.satisfactionRate}%` },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <p className="font-serif text-2xl font-bold text-primary">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Hand-selected</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">Featured Properties</h2>
          </div>
          <Link href="/listings">
            <Button variant="ghost" className="text-primary hover:text-primary gap-2">
              View all <ArrowRight size={14} />
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

      {/* Why Elite Tenancy */}
      <section className="bg-card/50 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-14">
            <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Why us</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">The Elite Difference</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Completion-Only Fees",
                desc: "We only charge when your property lets. Two weeks' rent for introduction or 8% managed — payable on success, not on hope.",
              },
              {
                icon: Star,
                title: "Six-Stage Tenant Screening",
                desc: "Credit checks, affordability assessments, landlord references, and character interviews — our default rate is below 0.3%.",
              },
              {
                icon: Clock,
                title: "12-Day Average Let Time",
                desc: "Professional photography, premium listings, and an active tenant database mean your property rarely sits empty.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-card border border-border/50 rounded-xl p-6 hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      {articles && articles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-primary uppercase tracking-widest font-medium mb-2">Expert insights</p>
              <h2 className="font-serif text-4xl font-bold text-foreground">From the Blog</h2>
            </div>
            <Link href="/blog">
              <Button variant="ghost" className="text-primary hover:text-primary gap-2">
                All articles <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.slice(0, 2).map((article) => (
              <Link key={article.id} href={`/blog/${article.slug}`}>
                <article className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer">
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
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-3">
                      {article.category}
                    </Badge>
                    <h3 className="font-serif text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
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
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary/5 border-t border-primary/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-serif text-4xl font-bold text-foreground mb-4">
            Ready to let with confidence?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join over 300 landlords who trust Elite Tenancy to find and manage exceptional tenants.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/valuation">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                Get a Free Valuation
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline" className="px-8 border-border/60">
                See How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
