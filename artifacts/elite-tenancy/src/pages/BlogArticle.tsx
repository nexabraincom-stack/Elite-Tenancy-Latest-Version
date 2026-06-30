import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { ChevronLeft, Clock, Tag, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import PublicLayout from "@/components/PublicLayout";
import { useGetBlogArticleBySlug } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

// Cornerstone guides used for internal linking (a real on-site SEO signal).
const RELATED_GUIDES: Array<{ slug: string; title: string }> = [
  { slug: "renters-rights-act-2026-landlord-guide", title: "Renters' Rights Act 2026: The Complete Landlord Guide" },
  { slug: "section-21-abolished-2026-landlord-guide", title: "Section 21 Abolished 2026: What Landlords Must Do" },
  { slug: "hmo-licence-uk-2026-complete-guide", title: "HMO Licence UK 2026: Requirements, Costs & Penalties" },
  { slug: "average-rent-uk-2026-city-price-guide", title: "Average Rent UK 2026: City-by-City Price Guide" },
  { slug: "letting-agent-fees-uk-2026-landlord-guide", title: "How Much Do Letting Agents Charge in 2026?" },
  { slug: "no-dss-illegal-2026-benefits-tenants-landlord-guide", title: "'No DSS' Is Now Illegal: What Landlords Must Know" },
];

/** Injects BlogPosting JSON-LD structured data so Google can show rich results. */
function ArticleSchema({
  article,
}: {
  article: { title: string; excerpt: string; slug: string; author: string; publishedAt: string; imageUrl?: string | null };
}) {
  useEffect(() => {
    const url = `https://www.elitetenancy.co.uk/blog/${article.slug}`;
    const data = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: article.title,
      description: article.excerpt,
      ...(article.imageUrl ? { image: article.imageUrl } : {}),
      author: { "@type": "Organization", name: "Elite Tenancy" },
      publisher: {
        "@type": "Organization",
        name: "Elite Tenancy Ltd",
        logo: { "@type": "ImageObject", url: "https://www.elitetenancy.co.uk/logo.svg" },
      },
      datePublished: article.publishedAt,
      dateModified: article.publishedAt,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      url,
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "article-jsonld";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      document.getElementById("article-jsonld")?.remove();
    };
  }, [article.slug, article.title, article.excerpt, article.author, article.publishedAt, article.imageUrl]);

  return null;
}

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading } = useGetBlogArticleBySlug(params.slug, {
    query: { enabled: !!params.slug, queryKey: [`/api/blog/${params.slug}`] },
  });

  // IMPORTANT: all hooks must run on every render, BEFORE any early return.
  // useSeo wraps useEffect — calling it after the isLoading/!article returns
  // changed the hook count between renders and crashed the page (blank screen).
  useSeo({
    title: article?.title ?? "Blog",
    description: article?.excerpt ?? undefined,
    canonical: article ? `https://www.elitetenancy.co.uk/blog/${article.slug}` : undefined,
    ogImage: article?.imageUrl ?? undefined,
  });

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-96 bg-card rounded-xl animate-pulse border border-border/50" />
        </div>
      </PublicLayout>
    );
  }

  if (!article) {
    return (
      <PublicLayout>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-4 tracking-tight">Article not found</h1>
          <Link href="/blog" className="text-primary hover:underline text-sm">Back to Blog</Link>
        </div>
      </PublicLayout>
    );
  }

  const related = RELATED_GUIDES.filter((g) => g.slug !== article.slug).slice(0, 3);

  return (
    <PublicLayout>
      <ArticleSchema article={article} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to Blog
        </Link>

        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-5">{article.category}</span>
        <h1 className="font-display text-4xl font-semibold text-foreground leading-tight mb-4 tracking-tight">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-8 border-b border-border/50">
          <span className="font-medium text-foreground">{article.author}</span>
          <span>·</span>
          <span className="flex items-center gap-1.5"><Clock size={13} />{article.readTimeMinutes} min read</span>
          <span>·</span>
          <span>{new Date(article.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
        </div>

        {article.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-10 aspect-video">
            <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="prose prose-sm sm:prose-base max-w-none prose-headings:font-display prose-headings:text-foreground prose-headings:tracking-tight prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-accent prose-strong:text-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-border/50">
            <Tag size={14} className="text-muted-foreground mt-0.5" />
            {article.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        {/* Related guides — internal linking for SEO + reader retention */}
        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/50">
            <h2 className="font-display text-xl font-semibold text-foreground mb-5 tracking-tight">Related guides</h2>
            <div className="space-y-3">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  href={`/blog/${g.slug}`}
                  className="group flex items-center justify-between gap-4 rounded-lg border border-border/50 bg-card px-4 py-3.5 hover:border-primary/40 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{g.title}</span>
                  <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Conversion CTA — also internal links to key pages */}
        <div className="mt-10 rounded-xl border border-primary/25 bg-primary/5 p-6 sm:p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2 tracking-tight">Looking for your next home?</h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
            Browse premium UK rentals or let our AI match you to the right property in seconds — free for tenants, always.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/listings" className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Browse listings <ArrowRight size={15} />
            </Link>
            <Link href="/find-my-match" className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
              Try AI matching
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
