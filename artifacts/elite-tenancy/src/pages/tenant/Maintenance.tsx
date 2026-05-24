import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import TenantLayout from "@/components/TenantLayout";
import { useGetTenantMaintenance, useSubmitMaintenanceRequest, getGetTenantMaintenanceQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

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

export default function TenantMaintenance() {
  const { data: requests, isLoading } = useGetTenantMaintenance();
  const submitRequest = useSubmitMaintenanceRequest();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "plumbing", priority: "medium" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitRequest.mutate(
      { data: form },
      {
        onSuccess: () => {
          toast({ title: "Request submitted", description: "We will be in touch within 24 hours." });
          queryClient.invalidateQueries({ queryKey: getGetTenantMaintenanceQueryKey() });
          setOpen(false);
          setForm({ title: "", description: "", category: "plumbing", priority: "medium" });
        },
      }
    );
  }

  return (
    <TenantLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Maintenance</h1>
          <p className="text-muted-foreground mt-1">Report issues and track their resolution.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus size={14} /> New Request
        </Button>
      </div>

      {open && (
        <div className="bg-card border border-primary/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-foreground">New Maintenance Request</h2>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Title</Label>
              <Input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Leaking tap in kitchen" className="bg-background" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Description</Label>
              <Textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Please describe the issue in detail..." rows={3} className="bg-background resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs mb-1.5 block">Category</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="heating">Heating</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="appliance">Appliance</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High / Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={submitRequest.isPending} className="w-full bg-primary text-primary-foreground">
              {submitRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="bg-card rounded-xl h-20 animate-pulse border border-border/50" />)}
        </div>
      ) : requests?.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No maintenance requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests?.map(req => (
            <div key={req.id} className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{req.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{req.description}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={`${priorityColor(req.priority)} text-xs capitalize`}>{req.priority}</Badge>
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
    </TenantLayout>
  );
}
