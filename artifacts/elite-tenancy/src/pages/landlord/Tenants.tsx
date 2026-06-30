import { Badge } from "@/components/ui/badge";
import { Mail, Phone } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordTenants } from "@workspace/api-client-react";

export default function LandlordTenants() {
  const { data: tenants, isLoading } = useGetLandlordTenants();

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Tenants</h1>
        <p className="text-muted-foreground mt-1">All current tenants across your properties.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-xl h-24 animate-pulse border border-border/50" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {tenants?.map((tenant) => (
            <div key={tenant.id} className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground text-base">{tenant.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{tenant.propertyAddress}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <a href={`mailto:${tenant.email}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <Mail size={11} /> {tenant.email}
                    </a>
                    {tenant.phone && (
                      <a href={`tel:${tenant.phone}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <Phone size={11} /> {tenant.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold text-primary">£{tenant.rentAmount?.toLocaleString("en-GB")}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs mt-1.5 capitalize">{tenant.status}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/30">
                <div>
                  <p className="text-xs text-muted-foreground">Lease Start</p>
                  <p className="text-sm text-foreground">{new Date(tenant.leaseStart).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lease End</p>
                  <p className="text-sm text-foreground">{new Date(tenant.leaseEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </LandlordLayout>
  );
}
