import { useParams, Link } from "wouter";
import { ChevronLeft, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useGetBlogArticleBySlug } from "@workspace/api-client-react";

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const { data: article, isLoading } = useGetBlogArticleBySlug(params.slug, {
    query: { enabled: !!params.slug },
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
          <h1 className="font-serif text-3xl text-foreground mb-4">Article not found</h1>
          <Link href="/blog" className="text-primary hover:underline text-sm">Back to Blog</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ChevronLeft size={14} /> Back to Blog
        </Link>

        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs mb-5">{article.category}</Badge>
        <h1 className="font-serif text-4xl font-bold text-foreground leading-tight mb-4">{article.title}</h1>

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
          className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-serif prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-li:text-muted-foreground prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4"
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
      </div>
    </PublicLayout>
  );
}
