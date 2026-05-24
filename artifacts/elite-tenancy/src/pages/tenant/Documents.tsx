import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TenantLayout from "@/components/TenantLayout";
import { useGetTenantDocuments } from "@workspace/api-client-react";

const typeLabel: Record<string, string> = {
  agreement: "Tenancy Agreement",
  inventory: "Inventory",
  deposit: "Deposit",
  epc: "EPC",
  guide: "Guide",
};

export default function TenantDocuments() {
  const { data: documents, isLoading } = useGetTenantDocuments();

  return (
    <TenantLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Documents</h1>
        <p className="text-muted-foreground mt-1">Your tenancy documents, available to download at any time.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-xl h-16 animate-pulse border border-border/50" />)}
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl divide-y divide-border/30 overflow-hidden">
          {documents?.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
              <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                <FileText size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Uploaded {new Date(doc.uploadedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {doc.size}
                </p>
              </div>
              <Badge className="bg-muted text-muted-foreground border-border text-xs shrink-0">
                {typeLabel[doc.type] ?? doc.type}
              </Badge>
              <Button size="sm" variant="ghost" className="gap-1.5 text-muted-foreground hover:text-primary shrink-0">
                <Download size={13} /> Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </TenantLayout>
  );
}
