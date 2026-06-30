import { Badge } from "@/components/ui/badge";
import TenantLayout from "@/components/TenantLayout";
import { useGetTenantRent } from "@workspace/api-client-react";

function statusVariant(status: string) {
  if (status === "paid") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (status === "due") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  if (status === "overdue") return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function Rent() {
  const { data: records, isLoading } = useGetTenantRent();

  return (
    <TenantLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Rent History</h1>
        <p className="text-muted-foreground mt-1">Your payment record at a glance.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
          <span>Reference</span>
          <span>Due Date</span>
          <span>Paid Date</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Status</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : records?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No rent records yet.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {records?.map((record) => (
              <div key={record.id} className="grid grid-cols-5 gap-4 px-6 py-4 text-sm items-center hover:bg-muted/20 transition-colors">
                <span className="text-muted-foreground font-mono text-xs">{record.reference}</span>
                <span className="text-foreground">{new Date(record.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span className="text-muted-foreground">{record.paidDate ? new Date(record.paidDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                <span className="text-right text-foreground font-medium">£{record.amount?.toLocaleString("en-GB")}</span>
                <div className="flex justify-end">
                  <Badge className={`${statusVariant(record.status)} text-xs capitalize`}>{record.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TenantLayout>
  );
}
