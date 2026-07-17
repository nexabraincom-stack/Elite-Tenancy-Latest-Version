import { useParams } from "wouter";
import { useState } from "react";
import { Bed, Bath, CheckCircle2, MapPin, Eye, ChevronLeft, ChevronRight, Send, CalendarCheck, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { useGetListingById, useSubmitLead, useGetViewingAvailability, useCreateViewing } from "@workspace/api-client-react";
import { formatLondonDateTime, formatLondonTime, dateToYMD } from "@/lib/timezone";
import { Link } from "wouter";

const MAX_BOOKING_DAYS_AHEAD = 21;

export default function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: listing, isLoading } = useGetListingById(id, { query: { enabled: !!id, queryKey: [`/api/listings/${id}`] } });
  const submitLead = useSubmitLead();
  const { toast } = useToast();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const [mode, setMode] = useState<"book" | "ask">("book");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [bookingConfirmation, setBookingConfirmation] = useState<{ scheduledAt: string; manageUrl: string } | null>(null);

  const dateStr = selectedDate ? dateToYMD(selectedDate) : "";
  const { data: availability, isLoading: availabilityLoading } = useGetViewingAvailability(
    { listingId: id, date: dateStr },
    { query: { enabled: !!id && !!dateStr, queryKey: [`/api/viewings/availability`, id, dateStr] } },
  );
  const createViewing = useCreateViewing();

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

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSlot) return;
    createViewing.mutate(
      { data: { listingId: id, slotStart: selectedSlot, ...bookingForm } },
      {
        onSuccess: (result) => {
          setBookingConfirmation({ scheduledAt: result.scheduledAt, manageUrl: result.manageUrl });
        },
        onError: (err: unknown) => {
          const message = (err as { data?: { error?: string } })?.data?.error ?? "Please try another time.";
          toast({ title: "Couldn't book that slot", description: message, variant: "destructive" });
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

          {/* Book a viewing / Ask a question */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border/50 rounded-xl p-6 sticky top-24">
              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setMode("book")}
                  className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${mode === "book" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  Book a viewing
                </button>
                <button
                  type="button"
                  onClick={() => setMode("ask")}
                  className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors ${mode === "ask" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  Ask a question
                </button>
              </div>

              {mode === "book" ? (
                bookingConfirmation ? (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto text-primary mb-3" size={32} />
                    <h3 className="font-semibold text-foreground mb-1">Viewing confirmed</h3>
                    <p className="text-sm text-muted-foreground mb-4">{formatLondonDateTime(bookingConfirmation.scheduledAt)}</p>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      We've sent a confirmation to your email{bookingForm.phone ? " and WhatsApp" : ""}. Need to change your plans?
                    </p>
                    <a href={bookingConfirmation.manageUrl} className="text-xs text-primary underline">
                      Manage or cancel my booking
                    </a>
                  </div>
                ) : (
                  <>
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <CalendarCheck size={16} className="text-primary" /> Book a viewing
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">Pick a date and time that suits you — no phone call needed.</p>

                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date: Date) => {
                        const startOfToday = new Date();
                        startOfToday.setHours(0, 0, 0, 0);
                        const horizon = new Date(startOfToday.getTime() + MAX_BOOKING_DAYS_AHEAD * 86400000);
                        return date < startOfToday || date > horizon || date.getDay() === 0;
                      }}
                      className="mx-auto mb-4 [--cell-size:2.1rem]"
                    />

                    {selectedDate && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Clock size={12} /> Available times
                        </p>
                        {availabilityLoading ? (
                          <p className="text-xs text-muted-foreground">Checking availability...</p>
                        ) : availability?.slots?.length ? (
                          <div className="grid grid-cols-3 gap-2">
                            {availability.slots.map((slot) => (
                              <button
                                key={slot.startsAt}
                                type="button"
                                onClick={() => setSelectedSlot(slot.startsAt)}
                                className={`text-xs py-1.5 rounded-md border transition-colors ${selectedSlot === slot.startsAt ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"}`}
                              >
                                {formatLondonTime(slot.startsAt)}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No slots left this day — try another date.</p>
                        )}
                      </div>
                    )}

                    {selectedSlot && (
                      <form onSubmit={handleBookingSubmit} className="space-y-3 border-t border-border/50 pt-4">
                        <div>
                          <Label className="text-xs mb-1.5 block">Full Name</Label>
                          <Input
                            required
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            placeholder="Your name"
                            className="bg-background text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">Email</Label>
                          <Input
                            type="email"
                            required
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                            placeholder="your@email.com"
                            className="bg-background text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs mb-1.5 block">Phone (optional)</Label>
                          <Input
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            placeholder="+44 7700..."
                            className="bg-background text-sm"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={createViewing.isPending}
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        >
                          <CalendarCheck size={14} />
                          {createViewing.isPending ? "Booking..." : "Confirm booking"}
                        </Button>
                      </form>
                    )}
                  </>
                )
              ) : (
                <>
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
                        placeholder="Tell us anything you'd like to know..."
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
                </>
              )}

              <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                By {mode === "book" ? "booking" : "enquiring"}, you agree to our Privacy Policy. We never share your details without consent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
