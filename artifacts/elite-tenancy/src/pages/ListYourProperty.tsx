import { useState } from "react";
import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import PublicLayout from "@/components/PublicLayout";
import { useCreateListing } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useSeo } from "@/hooks/use-seo";

const STEPS = ["Property Details", "Pricing & Features", "Review & Submit"];

export default function ListYourProperty() {
  useSeo({
    title: "List Your Property | Elite Tenancy for Landlords",
    description: "List your UK rental property with Elite Tenancy for free. Reach thousands of pre-qualified tenants. Only pay on successful let.",
    canonical: "https://www.elitetenancy.co.uk/list-your-property",
  });
  const [step, setStep] = useState(0);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const createListing = useCreateListing();

  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    postcode: "",
    addressLine1: "",
    category: "flat",
    bedrooms: 1,
    bathrooms: 1,
    price: 1000,
    pricePeriod: "month",
    furnished: false,
    petsAllowed: false,
    billsIncluded: false,
    availableFrom: "",
  });

  function update(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    createListing.mutate(
      { data: form },
      {
        onSuccess: (data) => {
          toast({ title: "Listing submitted!", description: "Your property has been received. We will be in touch within 24 hours." });
          navigate(`/listings/${data.id}`);
        },
        onError: () => {
          toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  }

  return (
    <PublicLayout>
      <div className="bg-gradient-to-br from-card to-background border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-2">List Your Property</h1>
          <p className="text-muted-foreground">Join over 300 landlords on the Elite Tenancy platform.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 flex-1 last:flex-none">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary/20 text-primary border border-primary/40" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border/50" />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-8">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-foreground text-lg mb-6">Property Details</h2>
              <div>
                <Label className="text-xs mb-1.5 block">Property Title</Label>
                <Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Modern Two-Bedroom Apartment, Ancoats" className="bg-background" />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Description</Label>
                <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the property, its features, and the local area..." rows={4} className="bg-background resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Address Line 1</Label>
                  <Input value={form.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} placeholder="14 High Street" className="bg-background" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">City</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Manchester" className="bg-background" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Postcode</Label>
                  <Input value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="M1 3BN" className="bg-background" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Property Type</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="penthouse">Penthouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Bedrooms</Label>
                  <Select value={String(form.bedrooms)} onValueChange={(v) => update("bedrooms", Number(v))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Studio</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Bathrooms</Label>
                  <Select value={String(form.bathrooms)} onValueChange={(v) => update("bathrooms", Number(v))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-foreground text-lg mb-6">Pricing & Features</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1.5 block">Monthly Rent (£)</Label>
                  <Input type="number" value={form.price} onChange={(e) => update("price", Number(e.target.value))} className="bg-background" />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Available From</Label>
                  <Input type="date" value={form.availableFrom} onChange={(e) => update("availableFrom", e.target.value)} className="bg-background" />
                </div>
              </div>
              <div className="space-y-4 border border-border/50 rounded-lg p-4 bg-background/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Furnished</p>
                    <p className="text-xs text-muted-foreground">Property includes furniture</p>
                  </div>
                  <Switch checked={form.furnished} onCheckedChange={(v) => update("furnished", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Bills Included</p>
                    <p className="text-xs text-muted-foreground">Utilities included in rent</p>
                  </div>
                  <Switch checked={form.billsIncluded} onCheckedChange={(v) => update("billsIncluded", v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Pets Allowed</p>
                    <p className="text-xs text-muted-foreground">Tenants may keep pets</p>
                  </div>
                  <Switch checked={form.petsAllowed} onCheckedChange={(v) => update("petsAllowed", v)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-foreground text-lg mb-6">Review Your Listing</h2>
              <div className="space-y-3">
                {[
                  { label: "Title", value: form.title || "—" },
                  { label: "Address", value: [form.addressLine1, form.city, form.postcode].filter(Boolean).join(", ") || "—" },
                  { label: "Type", value: form.category },
                  { label: "Bedrooms", value: form.bedrooms === 0 ? "Studio" : `${form.bedrooms} bed` },
                  { label: "Bathrooms", value: `${form.bathrooms} bath` },
                  { label: "Monthly Rent", value: `£${form.price.toLocaleString("en-GB")}` },
                  { label: "Furnished", value: form.furnished ? "Yes" : "No" },
                  { label: "Bills Included", value: form.billsIncluded ? "Yes" : "No" },
                  { label: "Pets Allowed", value: form.petsAllowed ? "Yes" : "No" },
                  { label: "Available From", value: form.availableFrom || "Immediately" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="text-foreground font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-primary/5 border border-primary/15 rounded-lg p-4 mt-6">
                <p className="text-sm text-foreground font-medium mb-1">No let, no fee</p>
                <p className="text-xs text-muted-foreground">
                  Once submitted, our team will contact you within 24 hours to discuss your requirements remotely. You'll only pay our Introduction Only fee — equivalent to two weeks' rent — when a tenant successfully moves in.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-2"
            >
              <ArrowLeft size={14} /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && (!form.title || !form.city || !form.postcode)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                Continue <ArrowRight size={14} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createListing.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {createListing.isPending ? "Submitting..." : "Submit Listing"}
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
