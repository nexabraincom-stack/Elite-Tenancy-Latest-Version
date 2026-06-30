import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordLeads } from "@workspace/api-client-react";

function statusColor(s: string) {
  if (s === "qualified") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "contacted") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (s === "new") return "bg-primary/10 text-primary border-primary/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function LandlordLeads() {
  const { data: leads, isLoading } = useGetLandlordLeads();

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Leads</h1>
        <p className="text-muted-foreground mt-1">Incoming enquiries and applicant leads.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-xl h-20 animate-pulse border border-border/50" />)}
        </div>
      ) : leads?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No leads yet.</p>
        </div>
      ): (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
            <span>Contact</span>
            <span>Listing</span>
            <span>Date</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-border/30">
            {leads!.map((lead) => (
              <div key={lead.id} className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-foreground font-medium">{lead.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                      <Mail size={10} /> {lead.email}
                    </a>
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
                        <Phone size={10} /> {lead.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground text-xs line-clamp-1">{lead.listingTitle ?? "General enquiry"}</span>
                <span className="text-muted-foreground text-xs">{new Date(lead.createdAt).toLocaleDateString("en-GB")}</span>
                <Badge className={`${statusColor(lead.status)} text-xs capitalize`}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </LandlordLayout>
  );
}
