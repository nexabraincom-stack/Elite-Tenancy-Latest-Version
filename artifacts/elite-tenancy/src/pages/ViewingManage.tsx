import { useParams } from "wouter";
import { motion } from "framer-motion";
import { CalendarCheck, XCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { useSeo } from "@/hooks/use-seo";
import {
  useGetViewingByToken,
  useCancelViewingByToken,
  getGetViewingByTokenQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatLondonDateTime } from "@/lib/timezone";

function statusColor(s: string) {
  if (s === "confirmed") return "bg-primary/10 text-primary border-primary/20";
  if (s === "completed") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "cancelled") return "bg-muted text-muted-foreground border-border";
  return "bg-destructive/10 text-destructive border-destructive/20";
}

export default function ViewingManage() {
  useSeo({
    title: "Manage your viewing | Elite Tenancy",
    description: "View or cancel your booked property viewing.",
    noindex: true,
  });

  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const queryClient = useQueryClient();
  const { data: viewing, isLoading, error } = useGetViewingByToken(token, {
    query: { enabled: !!token, queryKey: getGetViewingByTokenQueryKey(token) },
  });
  const cancelViewing = useCancelViewingByToken({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetViewingByTokenQueryKey(token) }),
    },
  });

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,162,74,0.12),transparent_60%)]" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/25 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
            <CalendarCheck size={13} /> Your viewing
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-tight mt-6">
            Manage your <span className="text-accent italic">booking</span>
          </h1>
        </div>
      </section>

      <section className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading && <div className="text-center text-sm text-muted-foreground">Loading...</div>}

        {!isLoading && (error || !viewing) && (
          <div className="bg-card border border-destructive/30 rounded-2xl p-8 text-center">
            <XCircle size={32} className="text-destructive mx-auto mb-3" />
            <h3 className="font-display text-2xl text-foreground mb-2">Booking not found</h3>
            <p className="text-muted-foreground text-sm">This link may have expired or is no longer valid.</p>
          </div>
        )}

        {viewing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border/50 rounded-2xl p-7">
            <div className="flex items-center gap-3 mb-5">
              <ShieldCheck size={26} className="text-primary" />
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground leading-tight">{viewing.listingTitle ?? "Your viewing"}</h3>
                <p className="text-xs text-muted-foreground">{formatLondonDateTime(viewing.scheduledAt)}</p>
              </div>
              <Badge className={`ml-auto ${statusColor(viewing.status)} capitalize`}>{viewing.status.replace("_", " ")}</Badge>
            </div>

            <div className="text-sm text-muted-foreground space-y-1 mb-6">
              <p><strong className="text-foreground">Name:</strong> {viewing.name}</p>
              <p><strong className="text-foreground">Email:</strong> {viewing.email}</p>
              {viewing.phone && <p><strong className="text-foreground">Phone:</strong> {viewing.phone}</p>}
              {viewing.notes && <p><strong className="text-foreground">Notes:</strong> {viewing.notes}</p>}
            </div>

            {viewing.status === "confirmed" ? (
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive gap-2"
                disabled={cancelViewing.isPending}
                onClick={() => cancelViewing.mutate({ token })}
              >
                <XCircle size={14} />
                {cancelViewing.isPending ? "Cancelling..." : "Cancel my viewing"}
              </Button>
            ) : viewing.status === "cancelled" ? (
              <p className="text-sm text-muted-foreground text-center">This viewing has been cancelled.</p>
            ) : (
              <p className="text-sm text-muted-foreground text-center">This viewing is {viewing.status.replace("_", " ")}.</p>
            )}
          </motion.div>
        )}
      </section>
    </PublicLayout>
  );
}
