import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminArticles } from "@workspace/api-client-react";

export default function AdminArticles() {
  const { data: articles, isLoading } = useGetAdminArticles();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Blog Articles</h1>
        <p className="text-muted-foreground mt-1">{articles?.length ?? 0} articles published.</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="bg-card rounded-xl h-20 animate-pulse border border-border/50" />)
        ) : articles?.map(article => (
          <div key={article.id} className="bg-card border border-border/50 rounded-xl p-5 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              {article.imageUrl && (
                <img src={article.imageUrl} alt={article.title} className="w-16 h-16 rounded-lg object-cover shrink-0" loading="lazy" />
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/blog/${article.slug}`}>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1">{article.title}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{article.excerpt}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{article.category}</Badge>
                  <span className="text-xs text-muted-foreground">{article.author}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock size={10} />{article.readTimeMinutes} min</span>
                  <span className="text-xs text-muted-foreground ml-auto">{new Date(article.publishedAt).toLocaleDateString("en-GB")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
