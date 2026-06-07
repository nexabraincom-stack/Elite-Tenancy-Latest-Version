import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetListings } from "@workspace/api-client-react";
import { useSeo } from "@/hooks/use-seo";

export default function FindARoom() {
  useSeo({
    title: "Find a Room to Rent in the UK | Elite Tenancy",
    description: "Find your perfect room or flat to rent across the UK. Verified listings, AI-powered matching, and zero agency fees for tenants.",
    canonical: "https://www.elitetenancy.co.uk/find-a-room",
  });
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();

  const params = {
    ...(city && { city }),
    ...(maxPrice != null && { maxPrice }),
    ...(bedrooms != null && { bedrooms }),
  };

  const { data: listings, isLoading } = useGetListings(params);

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-xs text-primary uppercase tracking-widest font-medium mb-3">Tenant search</p>
          <h1 className="font-serif text-5xl font-bold text-foreground mb-4">Find a Room</h1>
          <p className="text-muted-foreground max-w-xl">
            Browse our curated selection of exceptional rental properties across the UK's best cities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border/50 rounded-xl p-5 mb-8">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="text-xs text-muted-foreground mb-1.5 block">City or area</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Manchester" className="bg-background" />
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1.5 block">Max monthly rent</label>
              <Input type="number" value={maxPrice ?? ""} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} placeholder="£ max" className="bg-background" />
            </div>
            <div className="w-40">
              <label className="text-xs text-muted-foreground mb-1.5 block">Bedrooms</label>
              <Select value={bedrooms?.toString() ?? "all"} onValueChange={(v) => setBedrooms(v === "all" ? undefined : Number(v))}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="0">Studio</SelectItem>
                  <SelectItem value="1">1 bed</SelectItem>
                  <SelectItem value="2">2 bed</SelectItem>
                  <SelectItem value="3">3+ bed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => { setCity(""); setMaxPrice(undefined); setBedrooms(undefined); }}
              variant="ghost"
              className="text-muted-foreground text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Searching..." : `${listings?.length ?? 0} properties available`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="bg-card rounded-xl h-80 animate-pulse border border-border/50" />)}
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties match your search</h3>
            <p className="text-muted-foreground">Try widening your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map(listing => <PropertyCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
