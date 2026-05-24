import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordFinances } from "@workspace/api-client-react";

function statusColor(s: string) {
  if (s === "paid") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function LandlordFinances() {
  const { data: finances, isLoading } = useGetLandlordFinances();

  return (
    <LandlordLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Finances</h1>
        <p className="text-muted-foreground mt-1">Revenue summary and transaction history.</p>
      </div>

      {isLoading ? (
        <div className="bg-card rounded-xl h-64 animate-pulse border border-border/50" />
      ) : finances && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Revenue (YTD)", value: `£${finances.totalRevenue?.toLocaleString("en-GB")}` },
              { label: "Monthly Revenue", value: `£${finances.monthlyRevenue?.toLocaleString("en-GB")}` },
              { label: "Pending Payments", value: `£${finances.pendingPayments?.toLocaleString("en-GB")}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-card border border-border/50 rounded-xl p-5">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-serif text-2xl font-bold text-primary mt-1">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">Transaction History</h2>
            </div>
            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
              <span>Date</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
              <span className="text-center">Type</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-border/30">
              {finances.transactions?.map((txn) => (
                <div key={txn.id} className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                  <span className="text-muted-foreground">{new Date(txn.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                  <span className="text-foreground line-clamp-1">{txn.description}</span>
                  <span className={`text-right font-medium flex items-center justify-end gap-1 ${txn.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {txn.amount >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    £{Math.abs(txn.amount).toLocaleString("en-GB")}
                  </span>
                  <span className="text-center">
                    <Badge className={`text-xs capitalize ${txn.type === "income" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>{txn.type}</Badge>
                  </span>
                  <Badge className={`${statusColor(txn.status)} text-xs capitalize`}>{txn.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </LandlordLayout>
  );
}
