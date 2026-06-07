import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
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

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Expert insights</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-3">The Elite Tenancy Blog</h1>
          <p className="text-muted-foreground max-w-xl">Property market analysis, landlord guidance, and tenant advice from our team of experts.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="bg-card rounded-xl h-64 animate-pulse border border-border/50" />)}
          </div>
        ) : (
          <>
            {articles && articles.length > 0 && (
              <Link href={`/blog/${articles[0].slug}`}>
                <article className="group bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 mb-8 cursor-pointer">
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {articles[0].imageUrl && (
                      <div className="overflow-hidden aspect-video md:aspect-auto">
                        <img src={articles[0].imageUrl} alt={articles[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="p-8 flex flex-col justify-center">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-4 w-fit">{articles[0].category}</Badge>
                      <h2 className="font-serif text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug mb-3">
                        {articles[0].title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{articles[0].excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{articles[0].author}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1"><Clock size={11} />{articles[0].readTimeMinutes} min read</span>
                        <span>·</span>
                        <span>{new Date(articles[0].publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles?.slice(1).map(article => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <article className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    {article.imageUrl && (
                      <div className="overflow-hidden aspect-video">
                        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      </div>
                    )}
                    <div className="p-5 flex flex-col flex-1">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-3 w-fit">{article.category}</Badge>
                      <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors leading-snug mb-2 flex-1">{article.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-3 border-t border-border/30">
                        <Clock size={10} />
                        {article.readTimeMinutes} min read
                        <span className="ml-auto">{new Date(article.publishedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
