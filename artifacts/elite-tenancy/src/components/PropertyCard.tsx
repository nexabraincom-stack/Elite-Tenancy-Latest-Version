import { useState } from "react";
import { Link } from "wouter";
import { Bed, Bath, CheckCircle2, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Listing } from "@workspace/api-client-react";

interface PropertyCardProps {
  listing: Listing;
}

export default function PropertyCard({ listing }: PropertyCardProps) {
  const photo = listing.photos?.[0] ?? "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600";
  const price = listing.price?.toLocaleString("en-GB") ?? "0";
  const aiScore = (listing as { aiMatchScore?: number | null }).aiMatchScore ?? null;
  const [liked, setLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={photo}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {listing.isPremium && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold">
            Premium
          </Badge>
        )}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart size={15} className={liked ? "fill-accent text-accent" : "text-muted-foreground"} />
        </button>
        {aiScore != null && (
          <Badge className="absolute top-12 right-3 bg-background/90 backdrop-blur text-accent text-xs font-bold border border-accent/40">
            {aiScore}% match
          </Badge>
        )}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-baseline gap-1 bg-accent text-white text-lg font-bold px-3 py-1 rounded-lg shadow-md">
            £{price}
            <span className="text-xs font-normal opacity-80">/{listing.pricePeriod ?? "mo"}</span>
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {listing.city}, {listing.postcode}
        </p>

        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Bed size={14} />
            {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={14} />
            {listing.bathrooms} bath
          </span>
          <span className="capitalize text-xs bg-muted px-2 py-0.5 rounded-full">
            {listing.category}
          </span>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {listing.furnished && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={11} className="text-primary" />
              Furnished
            </span>
          )}
          {listing.billsIncluded && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={11} className="text-primary" />
              Bills incl.
            </span>
          )}
          {listing.petsAllowed && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 size={11} className="text-primary" />
              Pets OK
            </span>
          )}
        </div>

        <Link href={`/listings/${listing.id}`}>
          <Button className="w-full mt-4 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all text-sm">
            View Property
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
