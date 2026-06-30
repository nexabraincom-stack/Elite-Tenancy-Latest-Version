import { Building2, UserCheck, BookOpen, Users, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminStats, useGetAdminLeads, useGetAdminArticles } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: leads } = useGetAdminLeads();
  const { data: articles } = useGetAdminArticles();

  const cards = [
    { label: "Total Listings", value: stats?.totalListings ?? "—", icon: Building2 },
    { label: "Active Listings", value: stats?.activeListings ?? "—", icon: TrendingUp },
    { label: "Total Leads", value: stats?.totalLeads ?? "—", icon: UserCheck },
    { label: "New Leads Today", value: stats?.newLeadsToday ?? "—", icon: UserCheck },
    { label: "Total Articles", value: stats?.totalArticles ?? "—", icon: BookOpen },
    { label: "Total Users", value: stats?.totalUsers ?? "—", icon: Users },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon size={14} className="text-primary" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Leads</h2>
            <Link href="/admin/leads"><Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button></Link>
          </div>
          {!leads?.length ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs capitalize">{lead.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Blog Articles</h2>
            <Link href="/admin/articles"><Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button></Link>
          </div>
          {!articles?.length ? (
            <p className="text-sm text-muted-foreground">No articles yet.</p>
          ) : (
            <div className="space-y-3">
              {articles.slice(0, 4).map(article => (
                <div key={article.id} className="text-sm">
                  <p className="text-foreground font-medium line-clamp-1">{article.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">{article.category}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString("en-GB")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
