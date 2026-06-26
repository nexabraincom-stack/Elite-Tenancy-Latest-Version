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

  const { data: articles, isLoading } = useGetBlogArticles();
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = articles
    ? ["All", ...Array.from(new Set(articles.map((a) => a.category)))]
    : ["All"];

  const displayed =
    activeCategory === "All"
      ? articles
      : articles?.filter((a) => a.category === activeCategory);

  const featured = activeCategory === "All" ? displayed?.[0] : null;
  const rest = activeCategory === "All" ? displayed?.slice(1) : displayed;

  return (
    <PublicLayout>
      {/* Hero — amber brand gradient matching other content pages */}
      <div className="bg-gradient-to-b from-amber-50 to-white border-b border-amber-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-amber-700 text-xs font-semibold tracking-widest uppercase mb-3">Expert insights</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-4">The Elite Tenancy Blog</h1>
          <p className="text-gray-500 max-w-xl text-base leading-relaxed">
            Property market analysis, landlord guidance, and tenant advice — keeping you ahead of the UK rental market.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Category filter chips */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Featured article (All view only) */}
            {featured && (
              <Link href={`/blog/${featured.slug}`}>
                <article className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-amber-300 hover:shadow-lg transition-all duration-300 mb-8 cursor-pointer shadow-sm">
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
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-3 py-1">
                          Featured
                        </span>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
                          {featured.category}
                        </span>
                      </div>
                      <h2 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors leading-snug mb-3">
                        {featured.title}
                      </h2>
                      <p className="text-sm text-gray-500 leading-relaxed mb-5">{featured.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
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

            {/* Card grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rest?.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-amber-300 hover:shadow-md transition-all duration-300 cursor-pointer h-full flex flex-col shadow-sm">
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
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-full px-2.5 py-0.5 w-fit mb-3">
                        {article.category}
                      </span>
                      <h3 className="font-serif text-base font-semibold text-gray-900 group-hover:text-amber-700 transition-colors leading-snug mb-2 flex-1">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
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

            {displayed?.length === 0 && (
              <p className="text-center text-gray-400 py-16 text-sm">No articles in this category yet.</p>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
