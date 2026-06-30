import { Badge } from "@/components/ui/badge";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordMaintenance } from "@workspace/api-client-react";

function priorityColor(p: string) {
  if (p === "high") return "bg-red-500/10 text-red-400 border-red-500/20";
  if (p === "medium") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

function statusColor(s: string) {
  if (s === "resolved") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "in_progress") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function LandlordMaintenance() {
  const { data: requests, isLoading } = useGetLandlordMaintenance();

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Maintenance</h1>
        <p className="text-muted-foreground mt-1">Maintenance requests across all your properties.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="bg-card rounded-xl h-24 animate-pulse border border-border/50" />)}
        </div>
      ) : requests?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No maintenance requests at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests?.map((req) => (
            <div key={req.id} className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{req.title}</h3>
                  {req.propertyAddress && (
                    <p className="text-xs text-muted-foreground mt-0.5">{req.propertyAddress}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{req.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={`${priorityColor(req.priority)} text-xs capitalize`}>{req.priority} priority</Badge>
                    <Badge className={`${statusColor(req.status)} text-xs`}>{req.status === "in_progress" ? "In Progress" : req.status}</Badge>
                    <span className="text-xs text-muted-foreground capitalize">{req.category}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(req.createdAt).toLocaleDateString("en-GB")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </LandlordLayout>
  );
}
