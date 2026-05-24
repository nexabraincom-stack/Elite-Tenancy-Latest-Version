import { Building2, Users, PoundSterling, Wrench, UserCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordStats, useGetLandlordLeads } from "@workspace/api-client-react";

export default function LandlordDashboard() {
  const { data: stats } = useGetLandlordStats();
  const { data: leads } = useGetLandlordLeads();

  const statCards = [
    { label: "Active Listings", value: stats?.activeListings ?? "—", icon: Building2 },
    { label: "Total Tenants", value: stats?.totalTenants ?? "—", icon: Users },
    { label: "Monthly Revenue", value: stats ? `£${stats.monthlyRevenue?.toLocaleString("en-GB")}` : "—", icon: PoundSterling },
    { label: "Pending Maintenance", value: stats?.pendingMaintenance ?? "—", icon: Wrench },
    { label: "New Leads", value: stats?.newLeads ?? "—", icon: UserCheck },
    { label: "Occupancy Rate", value: stats ? `${stats.occupancyRate}%` : "—", icon: TrendingUp },
  ];

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Landlord Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your portfolio performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={14} className="text-primary" />
              </div>
            </div>
            <p className="font-serif text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent Leads</h2>
            <Link href="/landlord/leads">
              <Button variant="ghost" size="sm" className="text-primary text-xs">View all</Button>
            </Link>
          </div>
          {!leads?.length ? (
            <p className="text-sm text-muted-foreground">No leads yet.</p>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-foreground font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{lead.listingTitle ?? "General enquiry"}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs capitalize">{lead.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { label: "Add a new listing", href: "/landlord/listings" },
              { label: "View tenant details", href: "/landlord/tenants" },
              { label: "Check finances", href: "/landlord/finances" },
              { label: "Maintenance requests", href: "/landlord/maintenance" },
            ].map(({ label, href }) => (
              <Link key={href} href={href}>
                <div className="p-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </LandlordLayout>
  );
}
