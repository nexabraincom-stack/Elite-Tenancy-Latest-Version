import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import PropertyCard from "@/components/PropertyCard";
import { useGetListings } from "@workspace/api-client-react";

export default function Listings() {
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [bedrooms, setBedrooms] = useState<number | undefined>();
  const [category, setCategory] = useState("all");
  const [furnished, setFurnished] = useState("all");

  const params = {
    ...(city && { city }),
    ...(minPrice != null && { minPrice }),
    ...(maxPrice != null && { maxPrice }),
    ...(bedrooms != null && { bedrooms }),
    ...(category !== "all" && { category }),
    ...(furnished !== "all" && { furnished: furnished === "yes" }),
  };

  const { data: listings, isLoading } = useGetListings(params);

  function handleReset() {
    setCity("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setBedrooms(undefined);
    setCategory("all");
    setFurnished("all");
  }

  return (
    <PublicLayout>
      <div className="bg-card/50 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Property Listings</h1>
          <p className="text-muted-foreground">
            {isLoading ? "Loading..." : `${listings?.length ?? 0} properties available`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-card border border-border/50 rounded-xl p-5 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={16} className="text-primary" />
            <span className="text-sm font-medium">Filter Properties</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-background"
            />
            <Input
              type="number"
              placeholder="Min £"
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-background"
            />
            <Input
              type="number"
              placeholder="Max £"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="bg-background"
            />
            <Select value={bedrooms?.toString() ?? "all"} onValueChange={(v) => setBedrooms(v === "all" ? undefined : Number(v))}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any bedrooms</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 bed</SelectItem>
                <SelectItem value="2">2 bed</SelectItem>
                <SelectItem value="3">3 bed</SelectItem>
                <SelectItem value="4">4+ bed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="studio">Studio</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={furnished} onValueChange={setFurnished}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Furnished" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Furnished</SelectItem>
                <SelectItem value="no">Unfurnished</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end mt-3">
            <Button variant="ghost" size="sm" onClick={handleReset} className="text-muted-foreground hover:text-foreground text-xs">
              Reset filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl h-80 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : listings?.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button onClick={handleReset} variant="outline">Clear filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings?.map((listing) => (
              <PropertyCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
