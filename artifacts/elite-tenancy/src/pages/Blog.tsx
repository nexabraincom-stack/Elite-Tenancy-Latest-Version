import { useState } from "react";
import { Link } from "wouter";
import { Clock } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useGetBlogArticles } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

export default function Blog() {
  useSeo({
    title: "UK Lettings Blog — Landlord & Tenant Guides 2026 | Elite Tenancy",
    description: "Expert UK lettings guides for landlords and tenants. Renters' Rights Act, Section 21, HMO licences, deposit rules, and rental market insights.",
    canonical: "https://www.elitetenancy.co.uk/blog",
  });

  const { data: rawArticles, isLoading } = useGetBlogArticles();
  const articles = Array.isArray(rawArticles) ? rawArticles : [];
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = articles.length
    ? ["All", ...Array.from(new Set(articles.map((a) => a.category)))]
    : ["All"];

  const displayed =
    activeCategory === "All"
      ? articles
      : articles.filter((a) => a.category === activeCategory);

  const featured = activeCategory === "All" ? displayed[0] : null;
  const rest = activeCategory === "All" ? displayed.slice(1) : displayed;

  return (
    <PublicLayout>
      {/* Hero — navy */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.2),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full mb-6">
            Expert insights
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white tracking-tight">The Elite Tenancy Blog</h1>
          <p className="text-white/70 max-w-xl text-base leading-relaxed mt-4">
            Property market analysis, landlord guidance, and tenant advice — keeping you ahead of the UK rental market.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-muted rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent/10 hover:text-accent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <article className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300 mb-8 cursor-pointer shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {featured.imageUrl && (
                      <div className="overflow-hidden aspect-video md:aspect-auto">
                        <img
                          src={featured.imageUrl}
                          alt={featured.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1">
                          Featured
                        </span>
                        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-3 py-1">
                          {featured.category}
                        </span>
                      </div>
                      <h2 className="font-display text-2xl font-semibold text-foreground group-hover:text-accent transition-colors leading-snug mb-3 tracking-tight">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{featured.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                        <span>{featured.author}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {featured.readTimeMinutes} min read
                        </span>
                        <span>·</span>
                        <span>
                          {new Date(featured.publishedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {rest?.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="group bg-card border border-border/40 rounded-xl overflow-hidden hover:border-accent/40 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col shadow-sm">
                    {article.imageUrl && (
                      <div className="overflow-hidden aspect-video">
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-0.5 w-fit mb-3">
                        {article.category}
                      </span>
                      <h3 className="font-display text-base font-semibold text-foreground group-hover:text-accent transition-colors leading-snug mb-2 flex-1 tracking-tight">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-auto pt-3 border-t border-border/40">
                        <Clock size={10} />
                        {article.readTimeMinutes} min read
                        <span className="ml-auto">
                          {new Date(article.publishedAt).toLocaleDateString("en-GB", {
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {displayed.length === 0 && (
              <p className="text-center text-muted-foreground py-16 text-sm">No articles in this category yet.</p>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
