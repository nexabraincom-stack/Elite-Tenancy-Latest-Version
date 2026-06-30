import { useUser } from "@clerk/react";
import { CreditCard, Wrench, FileText, FolderOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import TenantLayout from "@/components/TenantLayout";
import { useGetTenantStats, useGetTenantTenancy } from "@workspace/api-client-react";

export default function TenantDashboard() {
  const { user } = useUser();
  const { data: stats } = useGetTenantStats();
  const { data: tenancy } = useGetTenantTenancy();

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  return (
    <TenantLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your tenancy.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Rent Due",
            value: stats ? `£${stats.rentDue?.toLocaleString("en-GB")}` : "—",
            sub: stats?.rentDueDate
              ? `Due ${new Date(stats.rentDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
              : "",
            icon: CreditCard,
            urgent: true,
          },
          {
            label: "Days Until Renewal",
            value: stats?.daysUntilRenewal ?? "—",
            sub: "Lease renewal",
            icon: Calendar,
            urgent: false,
          },
          {
            label: "Open Maintenance",
            value: stats?.openMaintenanceRequests ?? "—",
            sub: "Active requests",
            icon: Wrench,
            urgent: (stats?.openMaintenanceRequests ?? 0) > 0,
          },
        ].map(({ label, value, sub, icon: Icon, urgent }) => (
          <div
            key={label}
            className={`bg-card border rounded-xl p-5 ${urgent ? "border-primary/30" : "border-border/50"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${urgent ? "bg-primary/15" : "bg-muted/60"}`}
              >
                <Icon size={15} className={urgent ? "text-primary" : "text-muted-foreground"} />
              </div>
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "View tenancy details", href: "/tenant/my-tenancy", icon: FileText },
              { label: "View rent history", href: "/tenant/rent", icon: CreditCard },
              { label: "Submit maintenance request", href: "/tenant/maintenance", icon: Wrench },
              { label: "View documents", href: "/tenant/documents", icon: FolderOpen },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  <Icon size={14} />
                  {label}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Your Property</h2>
          {tenancy ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-foreground text-right max-w-[60%]">
                  {tenancy.propertyAddress}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Rent</span>
                <span className="text-foreground font-medium">
                  £{tenancy.monthlyRent.toLocaleString("en-GB")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lease Ends</span>
                <span className="text-foreground">
                  {new Date(tenancy.leaseEnd).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs capitalize">
                  {tenancy.status}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active tenancy found. Contact us to get started.
            </p>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
