import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminLeads } from "@workspace/api-client-react";

function statusColor(s: string) {
  if (s === "qualified") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "contacted") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (s === "new") return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function AdminLeads() {
  const { data: leads, isLoading } = useGetAdminLeads();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">All Leads</h1>
        <p className="text-muted-foreground mt-1">{leads?.length ?? 0} total leads on the platform.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
          <span>Name</span>
          <span>Email</span>
          <span>Listing</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : leads?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No leads yet.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {leads?.map(lead => (
              <div key={lead.id} className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <span className="text-foreground font-medium">{lead.name}</span>
                <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors text-xs">
                  <Mail size={11} />{lead.email}
                </a>
                <span className="text-muted-foreground text-xs line-clamp-1">{lead.listingTitle ?? "—"}</span>
                <span className="text-muted-foreground text-xs">{new Date(lead.createdAt).toLocaleDateString("en-GB")}</span>
                <Badge className={`${statusColor(lead.status)} text-xs capitalize`}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
