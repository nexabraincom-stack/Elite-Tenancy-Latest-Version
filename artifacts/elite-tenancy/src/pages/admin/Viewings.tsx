import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminViewings, useUpdateViewingStatus, getGetAdminViewingsQueryKey } from "@workspace/api-client-react";
import { formatLondonDateTime } from "@/lib/timezone";

function statusColor(s: string) {
  if (s === "confirmed") return "bg-primary/10 text-primary border-primary/20";
  if (s === "completed") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "no_show") return "bg-destructive/10 text-destructive border-destructive/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function AdminViewings() {
  const { data: viewings, isLoading } = useGetAdminViewings();
  const queryClient = useQueryClient();
  const updateStatus = useUpdateViewingStatus({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminViewingsQueryKey() }),
    },
  });

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Viewings</h1>
        <p className="text-muted-foreground mt-1">{viewings?.length ?? 0} booked viewings on the platform.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
          <span>Tenant</span>
          <span>Listing</span>
          <span>When</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : viewings?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No viewings booked yet.</div>
        ) : (
          <div className="divide-y divide-border/30">
            {viewings?.map((v) => (
              <div key={v.id} className="grid grid-cols-[2fr_2fr_2fr_1fr_auto] gap-3 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <div>
                  <span className="text-foreground font-medium block">{v.name}</span>
                  <a href={`mailto:${v.email}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors text-xs">
                    <Mail size={11} />{v.email}
                  </a>
                </div>
                <span className="text-muted-foreground text-xs line-clamp-1">{v.listingTitle ?? "—"}</span>
                <span className="text-muted-foreground text-xs">{formatLondonDateTime(v.scheduledAt)}</span>
                <Badge className={`${statusColor(v.status)} text-xs capitalize w-fit`}>{v.status.replace("_", " ")}</Badge>
                <div className="flex gap-1.5">
                  {v.status === "confirmed" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs gap-1"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: v.id, data: { status: "completed" } })}
                      >
                        <CheckCircle2 size={12} /> Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ id: v.id, data: { status: "no_show" } })}
                      >
                        <XCircle size={12} /> No-show
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
