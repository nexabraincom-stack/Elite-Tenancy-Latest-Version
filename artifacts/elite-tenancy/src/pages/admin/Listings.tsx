import { Badge } from "@/components/ui/badge";
import { Eye, Bed } from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminListings } from "@workspace/api-client-react";

function statusColor(s: string) {
  if (s === "active") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "let") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function AdminListings() {
  const { data: listings, isLoading } = useGetAdminListings();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">All Listings</h1>
        <p className="text-muted-foreground mt-1">{listings?.length ?? 0} total listings on the platform.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
          <span>Title</span>
          <span>City</span>
          <span>Price</span>
          <span>Status</span>
          <span>Beds</span>
          <span>Views</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="divide-y divide-border/30">
            {listings?.map(listing => (
              <div key={listing.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto_auto] gap-3 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <Link href={`/listings/${listing.id}`}>
                  <span className="text-foreground hover:text-primary transition-colors cursor-pointer font-medium line-clamp-1">{listing.title}</span>
                </Link>
                <span className="text-muted-foreground">{listing.city}</span>
                <span className="text-foreground">£{listing.price?.toLocaleString("en-GB")}</span>
                <Badge className={`${statusColor(listing.status)} text-xs capitalize w-fit`}>{listing.status}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Bed size={11} />{listing.bedrooms}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground"><Eye size={11} />{listing.viewCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
