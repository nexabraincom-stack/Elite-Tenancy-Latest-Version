import { Badge } from "@/components/ui/badge";
import { MapPin, User, Mail, PoundSterling, Calendar, FileText } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import { useGetTenantTenancy } from "@workspace/api-client-react";

export default function MyTenancy() {
  const { data: tenancy, isLoading } = useGetTenantTenancy();

  return (
    <TenantLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">My Tenancy</h1>
        <p className="text-muted-foreground mt-1">Your current tenancy details.</p>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl h-64 animate-pulse border border-border/50" />
      ) : tenancy ? (
        <div className="space-y-5">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-foreground">Tenancy Overview</h2>
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 capitalize">{tenancy.status}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Property Address", value: tenancy.propertyAddress, icon: MapPin },
                { label: "Tenancy Type", value: tenancy.tenancyType, icon: FileText },
                { label: "Landlord Name", value: tenancy.landlordName, icon: User },
                { label: "Landlord Email", value: tenancy.landlordEmail, icon: Mail },
                { label: "Monthly Rent", value: `£${tenancy.monthlyRent?.toLocaleString("en-GB")}`, icon: PoundSterling },
                { label: "Deposit", value: `£${tenancy.depositAmount?.toLocaleString("en-GB")}`, icon: PoundSterling },
                { label: "Lease Start", value: new Date(tenancy.leaseStart).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), icon: Calendar },
                { label: "Lease End", value: new Date(tenancy.leaseEnd).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), icon: Calendar },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                  <Icon size={14} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm text-foreground font-medium mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-xl p-5">
            <p className="text-sm text-foreground font-medium mb-1">Deposit Protection</p>
            <p className="text-xs text-muted-foreground">
              Your deposit of £{tenancy.depositAmount?.toLocaleString("en-GB")} is protected with the Deposit Protection Service (DPS). You will receive a copy of the prescribed information in your Documents section.
            </p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No tenancy details available.</p>
      )}
    </TenantLayout>
  );
}
