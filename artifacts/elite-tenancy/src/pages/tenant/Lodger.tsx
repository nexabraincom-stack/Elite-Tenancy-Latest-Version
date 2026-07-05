import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import TenantLayout from "@/components/TenantLayout";
import { Button } from "@/components/ui/button";

interface LodgerLicence {
  id: number;
  lodgerName: string;
  lodgerEmail: string;
  lodgerPhone: string | null;
  roomDescription: string;
  rentPcm: number;
  billsIncluded: boolean;
  moveInDate: string | null;
  status: "pending_landlord_consent" | "consent_approved" | "consent_declined" | "active" | "ended";
  landlordConsentNote: string | null;
  agreementContent: string | null;
  createdAt: string;
}

const STATUS_LABEL: Record<LodgerLicence["status"], { label: string; color: string; icon: typeof Clock }> = {
  pending_landlord_consent: { label: "Awaiting landlord consent", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", icon: Clock },
  consent_approved: { label: "Approved — generate your agreement", color: "text-green-600 bg-green-500/10 border-green-500/20", icon: CheckCircle2 },
  consent_declined: { label: "Declined by landlord", color: "text-red-600 bg-red-500/10 border-red-500/20", icon: XCircle },
  active: { label: "Active licence", color: "text-primary bg-primary/10 border-primary/20", icon: FileText },
  ended: { label: "Ended", color: "text-muted-foreground bg-muted border-border", icon: XCircle },
};

async function fetchMyLodgerRequests(): Promise<LodgerLicence[]> {
  const res = await fetch("/api/lodger/my", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load lodger requests");
  return res.json();
}

export default function TenantLodger() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = useQuery({ queryKey: ["lodger", "my"], queryFn: fetchMyLodgerRequests });

  const [form, setForm] = useState({
    lodgerName: "",
    lodgerEmail: "",
    lodgerPhone: "",
    roomDescription: "",
    rentPcm: "",
    billsIncluded: false,
    moveInDate: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const createRequest = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/lodger/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          rentPcm: Math.round(Number(form.rentPcm) * 100),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lodger", "my"] });
      setShowForm(false);
      setForm({ lodgerName: "", lodgerEmail: "", lodgerPhone: "", roomDescription: "", rentPcm: "", billsIncluded: false, moveInDate: "" });
    },
    onError: (e: Error) => setError(e.message),
  });

  const generateAgreement = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/lodger/${id}/generate-agreement`, { method: "POST", credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lodger", "my"] }),
  });

  return (
    <TenantLayout>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Take in a Lodger</h1>
          <p className="text-muted-foreground mt-1">
            Request your landlord's written consent, then generate a lodger licence agreement — separate from your own tenancy.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
            New request
          </Button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={(e) => { e.preventDefault(); setError(""); createRequest.mutate(); }}
          className="bg-card border border-border/50 rounded-xl p-6 mb-8 space-y-4"
        >
          <h2 className="font-semibold text-foreground mb-2">Request landlord consent</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lodger's name</label>
              <input required value={form.lodgerName} onChange={(e) => setForm((f) => ({ ...f, lodgerName: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lodger's email</label>
              <input required type="email" value={form.lodgerEmail} onChange={(e) => setForm((f) => ({ ...f, lodgerEmail: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lodger's phone (optional)</label>
              <input value={form.lodgerPhone} onChange={(e) => setForm((f) => ({ ...f, lodgerPhone: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Monthly rent (£)</label>
              <input required type="number" min="1" value={form.rentPcm} onChange={(e) => setForm((f) => ({ ...f, rentPcm: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Move-in date (optional)</label>
              <input type="date" value={form.moveInDate} onChange={(e) => setForm((f) => ({ ...f, moveInDate: e.target.value }))} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input type="checkbox" id="billsIncluded" checked={form.billsIncluded} onChange={(e) => setForm((f) => ({ ...f, billsIncluded: e.target.checked }))} />
              <label htmlFor="billsIncluded" className="text-sm text-foreground">Bills included</label>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Room description</label>
            <textarea required value={form.roomDescription} onChange={(e) => setForm((f) => ({ ...f, roomDescription: e.target.value }))} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background" placeholder="e.g. Double room, second floor, own bathroom" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={createRequest.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {createRequest.isPending ? "Sending…" : "Send consent request to landlord"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="bg-card rounded-xl h-40 animate-pulse border border-border/50" />
      ) : requests && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((r) => {
            const s = STATUS_LABEL[r.status];
            const Icon = s.icon;
            return (
              <div key={r.id} className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{r.lodgerName}</p>
                    <p className="text-sm text-muted-foreground">{r.lodgerEmail}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${s.color}`}>
                    <Icon size={12} /> {s.label}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{r.roomDescription}</p>
                <p className="text-sm text-foreground">£{(r.rentPcm / 100).toFixed(0)}/month{r.billsIncluded ? ", bills included" : ""}</p>
                {r.landlordConsentNote && (
                  <p className="text-sm text-muted-foreground mt-2 italic">Landlord's note: "{r.landlordConsentNote}"</p>
                )}
                {r.status === "consent_approved" && (
                  <Button
                    size="sm"
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => generateAgreement.mutate(r.id)}
                    disabled={generateAgreement.isPending}
                  >
                    {generateAgreement.isPending ? "Generating…" : "Generate licence agreement"}
                  </Button>
                )}
                {r.agreementContent && (
                  <div className="mt-4 border-t border-border/50 pt-4">
                    <details>
                      <summary className="text-sm font-medium text-accent cursor-pointer">View licence agreement</summary>
                      <div className="prose prose-sm max-w-none mt-3 text-sm" dangerouslySetInnerHTML={{ __html: r.agreementContent }} />
                    </details>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <div className="bg-card border border-border/50 rounded-xl p-10 text-center">
            <Users className="mx-auto text-primary mb-3" size={28} />
            <h3 className="font-display text-xl text-foreground mb-2">No lodger requests yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Taking in a lodger can earn up to £7,500/year completely tax-free under the Rent a Room Scheme — with your landlord's consent.
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">Get started</Button>
          </div>
        )
      )}
    </TenantLayout>
  );
}
