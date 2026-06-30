import { useParams } from "wouter";
import { useState } from "react";
import { Bed, Bath, CheckCircle2, MapPin, Eye, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { useGetListingById, useSubmitLead } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: listing, isLoading } = useGetListingById(id, { query: { enabled: !!id, queryKey: [`/api/listings/${id}`] } });
  const submitLead = useSubmitLead();
  const { toast } = useToast();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitLead.mutate(
      { data: { ...form, listingId: id, listingTitle: listing?.title } },
      {
        onSuccess: () => {
          toast({ title: "Enquiry sent", description: "We will be in touch within 24 hours." });
          setForm({ name: "", email: "", phone: "", message: "" });
        },
      }
    );
  }

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-96 bg-card rounded-xl animate-pulse border border-border/50" />
        </div>
      </PublicLayout>
    );
  }

  if (!listing) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Property not found</h1>
          <Link href="/listings"><Button>Back to listings</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  const photos = listing.photos?.length ? listing.photos : ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ChevronLeft size={14} /> Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Photo gallery */}
            <div className="relative rounded-xl overflow-hidden aspect-video bg-card">
              <img src={photos[photoIndex]} alt={listing.title} className="w-full h-full object-cover" />
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setPhotoIndex((i) => (i + 1) % photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPhotoIndex(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? "bg-white w-4" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-3 left-3 flex gap-2">
                {listing.isPremium && <Badge className="bg-primary text-primary-foreground">Premium</Badge>}
                {listing.isFeatured && <Badge className="bg-background/80 backdrop-blur text-foreground border border-border/50">Featured</Badge>}
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">{listing.title}</h1>
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                    <MapPin size={14} />
                    {listing.addressLine1 ? `${listing.addressLine1}, ` : ""}{listing.city}, {listing.postcode}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-3xl font-bold text-primary">
                    £{listing.price?.toLocaleString("en-GB")}
                  </p>
                  <p className="text-sm text-muted-foreground">per {listing.pricePeriod ?? "month"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 mt-5 text-sm text-muted-foreground border-t border-border/50 pt-5">
                <span className="flex items-center gap-2"><Bed size={15} />{listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? "s" : ""}`}</span>
                <span className="flex items-center gap-2"><Bath size={15} />{listing.bathrooms} bathroom{listing.bathrooms !== 1 ? "s" : ""}</span>
                {listing.floorAreaSqm && <span>{listing.floorAreaSqm} sqm</span>}
                <span className="flex items-center gap-2"><Eye size={15} />{listing.viewCount} views</span>
                <span className="capitalize">{listing.category}</span>
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                {listing.furnished && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 size={11} className="text-primary" /> Furnished
                  </Badge>
                )}
                {listing.billsIncluded && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 size={11} className="text-primary" /> Bills included
                  </Badge>
                )}
                {listing.petsAllowed && (
                  <Badge variant="secondary" className="gap-1.5">
                    <CheckCircle2 size={11} className="text-primary" /> Pets allowed
                  </Badge>
                )}
                {listing.availableFrom && (
                  <Badge variant="secondary">
                    Available {new Date(listing.availableFrom).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                  </Badge>
                )}
              </div>

              <div className="mt-6">
                <h2 className="font-semibold text-foreground mb-3">About this property</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{listing.description}</p>
              </div>
            </div>
          </div>

          {/* Enquiry form */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold text-foreground mb-1">Enquire about this property</h3>
              <p className="text-xs text-muted-foreground mb-5">We typically respond within 2 hours</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Full Name</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-background text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Email</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="bg-background text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Phone (optional)</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+44 7700..."
                    className="bg-background text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Message</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Tell us about yourself and when you'd like to view..."
                    rows={3}
                    className="bg-background text-sm resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitLead.isPending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  <Send size={14} />
                  {submitLead.isPending ? "Sending..." : "Send Enquiry"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                By enquiring, you agree to our Privacy Policy. We never share your details without consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
