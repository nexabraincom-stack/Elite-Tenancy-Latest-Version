import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Bed, Bath } from "lucide-react";
import { Link } from "wouter";
import LandlordLayout from "@/components/LandlordLayout";
import { useGetLandlordListings } from "@workspace/api-client-react";

function statusColor(s: string) {
  if (s === "active") return "bg-green-500/10 text-green-400 border-green-500/20";
  if (s === "let") return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (s === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  return "bg-muted text-muted-foreground border-border";
}

export default function LandlordListings() {
  const { data: listings, isLoading } = useGetLandlordListings();

  return (
    <LandlordLayout>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Your Listings</h1>
          <p className="text-muted-foreground mt-1">{listings?.length ?? 0} properties in your portfolio.</p>
        </div>
        <Link href="/list-your-property">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus size={14} /> Add Listing
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-card rounded-xl h-20 animate-pulse border border-border/50" />)}
        </div>
      ) : (
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
            <span>Property</span>
            <span>City</span>
            <span>Rent</span>
            <span>Beds/Baths</span>
            <span>Status</span>
            <span>Views</span>
          </div>
          <div className="divide-y divide-border/30">
            {listings?.map((listing) => (
              <div key={listing.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <div>
                  <Link href={`/listings/${listing.id}`}>
                    <p className="text-foreground font-medium hover:text-primary transition-colors cursor-pointer line-clamp-1">{listing.title}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground">{listing.postcode}</p>
                </div>
                <span className="text-muted-foreground">{listing.city}</span>
                <span className="text-foreground font-medium">£{listing.price?.toLocaleString("en-GB")}</span>
                <span className="text-muted-foreground flex items-center gap-2">
                  <Bed size={12} /> {listing.bedrooms}
                  <Bath size={12} className="ml-1" /> {listing.bathrooms}
                </span>
                <Badge className={`${statusColor(listing.status)} text-xs capitalize w-fit`}>{listing.status}</Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye size={11} /> {listing.viewCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </LandlordLayout>
  );
}
